import { Hono } from 'hono';
import { redis, reddit, context, createServer, getServerPort } from '@devvit/web/server';
import { telemetry } from '@devvit/analytics/server/reddit';
import { getRequestListener } from '@hono/node-server';
import { getDailyArcPuzzle, ArcPuzzle } from './arc_puzzles.js';

const app = new Hono();

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// -------------------------------------------------------------
// 1. Fetch Today's ARC Puzzle & Community Consensus Stats
// -------------------------------------------------------------
app.get('/api/daily', async (c) => {
  const today = getTodayKey();
  const puzzle: ArcPuzzle = getDailyArcPuzzle(today);
  const userId = context.userId ?? 'guest';

  try {
    const [voteCounts, streak, completed, totalSolves] = await Promise.all([
      redis ? redis.hGetAll(`arc_votes:${today}`) : Promise.resolve({}),
      userId !== 'guest' && redis ? redis.get(`arc_streak:${userId}`) : Promise.resolve('0'),
      userId !== 'guest' && redis ? redis.get(`arc_done:${today}:${userId}`) : Promise.resolve(null),
      redis ? redis.get(`arc_solves:${today}`) : Promise.resolve('0'),
    ]);

    let parsedCompleted = null;
    if (completed) {
      try {
        parsedCompleted = JSON.parse(completed);
      } catch {
        parsedCompleted = { score: 1000, selectedIndex: 0, correct: true };
      }
    }

    return c.json({
      date: today,
      dayNumber: puzzle.dayNumber,
      title: puzzle.title,
      ruleHint: puzzle.ruleHint,
      examples: puzzle.examples,
      testInput: puzzle.testInput,
      options: puzzle.options,
      correctOptionIndex: parsedCompleted ? puzzle.correctOptionIndex : undefined, // hidden until solve
      explanation: parsedCompleted ? puzzle.explanation : undefined,
      voteCounts: voteCounts ?? {},
      streak: Number(streak ?? 0),
      completed: Boolean(completed),
      completedData: parsedCompleted,
      totalSolves: Number(totalSolves ?? 0),
    });
  } catch (err) {
    console.error('Error fetching ARC puzzle:', err);
    return c.json({
      date: today,
      dayNumber: puzzle.dayNumber,
      title: puzzle.title,
      ruleHint: puzzle.ruleHint,
      examples: puzzle.examples,
      testInput: puzzle.testInput,
      options: puzzle.options,
      voteCounts: {},
      streak: 0,
      completed: false,
      totalSolves: 0,
    });
  }
});

// -------------------------------------------------------------
// 2. Submit Solution & Record Community Consensus
// -------------------------------------------------------------
app.post('/api/solve', async (c) => {
  const journeyId = c.req.header('x-devvit-journey-id') ?? '';
  const { selectedOptionIndex, elapsedSeconds = 15 } = await c.req.json<{
    selectedOptionIndex: number;
    elapsedSeconds: number;
  }>();

  const today = getTodayKey();
  const puzzle: ArcPuzzle = getDailyArcPuzzle(today);
  const userId = context.userId ?? 'guest';

  const isCorrect = selectedOptionIndex === puzzle.correctOptionIndex;

  let totalVotes = 1;
  let correctVotes = 1;
  const currentVoteCounts: Record<string, number> = {};

  try {
    if (redis) {
      await redis.hIncrBy(`arc_votes:${today}`, String(selectedOptionIndex), 1);
      await redis.incrBy(`arc_solves:${today}`, 1);

      const allVotes = await redis.hGetAll(`arc_votes:${today}`);
      for (const [k, v] of Object.entries(allVotes || {})) {
        currentVoteCounts[k] = Number(v);
        totalVotes += Number(v);
      }
      correctVotes = currentVoteCounts[String(puzzle.correctOptionIndex)] ?? 1;
    }
  } catch (err) {
    console.error('Redis voting error:', err);
  }

  // Maverick Solver bonus: If <40% of the subreddit picked the correct grid, you beat the crowd!
  const accuracyPct = totalVotes > 0 ? (correctVotes / totalVotes) * 100 : 0;
  const isMaverick = isCorrect && accuracyPct <= 40;
  const speedBonus = isCorrect && elapsedSeconds <= 20 ? 150 : 0;
  const maverickBonus = isMaverick ? 200 : 0;
  const score = isCorrect ? 1000 + speedBonus + maverickBonus : 200;

  let newStreak = 1;
  try {
    if (redis && userId !== 'guest') {
      const streakKey = `arc_streak:${userId}`;
      if (isCorrect) {
        newStreak = await redis.incrBy(streakKey, 1);
      } else {
        await redis.set(streakKey, '0');
        newStreak = 0;
      }

      await redis.set(
        `arc_done:${today}:${userId}`,
        JSON.stringify({
          score,
          selectedIndex: selectedOptionIndex,
          correct: isCorrect,
          isMaverick,
          speedBonus,
          maverickBonus,
          elapsedSeconds,
        })
      );
    }
  } catch (err) {
    console.error('Streak update error:', err);
  }

  // Instrument Devvit Journeys
  if (journeyId && telemetry) {
    try {
      await telemetry.endJourney({
        journeyId,
        complete: true,
        game: { win: isCorrect, score },
      });
    } catch (err) {
      console.warn('Telemetry error:', err);
    }
  }

  return c.json({
    correct: isCorrect,
    score,
    isMaverick,
    speedBonus,
    maverickBonus,
    streak: newStreak,
    correctOptionIndex: puzzle.correctOptionIndex,
    explanation: puzzle.explanation,
    voteCounts: currentVoteCounts,
  });
});

// -------------------------------------------------------------
// 3. Post Spoiler-Free Matrix Badge to Thread Comments
// -------------------------------------------------------------
app.post('/api/share-comment', async (c) => {
  const { score, streak, isMaverick, correct, selectedIndex, elapsedSeconds } = await c.req.json<{
    score: number;
    streak: number;
    isMaverick?: boolean;
    correct: boolean;
    selectedIndex: number;
    elapsedSeconds: number;
  }>();

  if (!context.postId) {
    return c.json({ ok: false, error: 'No postId available' }, 400);
  }

  const today = getTodayKey();
  const puzzle = getDailyArcPuzzle(today);
  const maverickBadge = isMaverick ? ' 🦅 **Maverick Solver (Beat the Crowd!)**' : '';
  const statusEmoji = correct ? '🧩 **TRANSFORMATION SOLVED**' : '❌ **PATTERN MISSED**';

  const commentText = [
    `🧩 **SubARC Daily #${puzzle.dayNumber} — ${today}**`,
    `Pattern: **${puzzle.title}**`,
    `Verdict: ${statusEmoji} | Time: **${elapsedSeconds}s**`,
    `Score: **${score} pts** | Streak: 🔥 **${streak} days**${maverickBadge}`,
    `Dossier Selection: Grid **[Option ${selectedIndex + 1}]**`,
    `*(Zero spoilers — launch the interactive visual reasoning challenge in the post above to solve!)*`,
  ].join('\n\n');

  try {
    if (reddit) {
      await reddit.submitComment({
        id: context.postId,
        text: commentText,
      });
      return c.json({ ok: true });
    }
  } catch (err) {
    console.error('Error submitting comment to Reddit:', err);
    return c.json({ ok: false, error: String(err) }, 500);
  }
});

// -------------------------------------------------------------
// 4. Moderator Menu Action: Generate Daily Post (Strict UiResponse)
// -------------------------------------------------------------
app.post('/internal/menu/post-create', async (c) => {
  try {
    const subreddit = context.subredditName ?? 'subtext_game_2026';
    const today = getTodayKey();
    const puzzle = getDailyArcPuzzle(today);

    const post = await reddit.submitPost({
      title: `🧩 SubARC Daily #${puzzle.dayNumber} [${today}] — ${puzzle.title}`,
      subredditName: subreddit,
      preview: {
        entry: 'dist/client/index.html',
      },
    });

    return c.json({
      showToast: `Created SubARC Daily #${puzzle.dayNumber} post!`,
      navigateTo: post.url,
    });
  } catch (err) {
    console.error('Error creating SubARC post:', err);
    return c.json({
      showToast: `Failed to create post: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
});

// -------------------------------------------------------------
// 5. Automated Midnight UTC Scheduler
// -------------------------------------------------------------
app.post('/internal/scheduler/daily-post', async (c) => {
  try {
    const subreddit = context.subredditName ?? 'subtext_game_2026';
    const today = getTodayKey();
    const puzzle = getDailyArcPuzzle(today);

    await reddit.submitPost({
      title: `🧩 SubARC Daily #${puzzle.dayNumber} [${today}] — ${puzzle.title}`,
      subredditName: subreddit,
      preview: {
        entry: 'dist/client/index.html',
      },
    });

    return c.json({ ok: true });
  } catch (err) {
    console.error('Scheduler error:', err);
    return c.json({ ok: false }, 500);
  }
});

// -------------------------------------------------------------
// Devvit Web Node.js Server Adapter
// -------------------------------------------------------------
const port = getServerPort();
const listener = getRequestListener(app.fetch);
const server = createServer(listener);
server.listen(port);
