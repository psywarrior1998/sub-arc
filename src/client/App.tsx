import React, { useEffect, useState, useMemo } from 'react';
import { telemetry } from '@devvit/analytics/client/reddit';
import confetti from 'canvas-confetti';
import { sfx } from './sound';

type Grid = number[][];

interface ArcExample {
  input: Grid;
  output: Grid;
}

interface SolvedData {
  score: number;
  selectedIndex: number;
  correct: boolean;
  isMaverick?: boolean;
  speedBonus?: number;
  maverickBonus?: number;
  correctOptionIndex?: number;
  explanation?: string;
  elapsedSeconds?: number;
}

const COLOR_MAP: Record<number, string> = {
  0: 'bg-[#12141C] border border-[#232736]', // Black
  1: 'bg-[#3B82F6]', // Blue
  2: 'bg-[#EF4444]', // Red
  3: 'bg-[#10B981]', // Green
  4: 'bg-[#F59E0B]', // Yellow
  5: 'bg-[#6B7280]', // Grey
  6: 'bg-[#EC4899]', // Magenta
  7: 'bg-[#F97316]', // Orange
  8: 'bg-[#06B6D4]', // Cyan
};

function MiniGrid({ grid, size = 'md' }: { grid: Grid; size?: 'sm' | 'md' | 'lg' }) {
  const cellSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <div className="inline-grid grid-cols-3 gap-0.5 p-1 bg-[#1A1D27] rounded-lg border border-[#2E3447]">
      {grid.map((row, rIdx) =>
        row.map((cell, cIdx) => (
          <div
            key={`${rIdx}-${cIdx}`}
            className={`${cellSize} rounded-xs transition-colors duration-150 ${COLOR_MAP[cell] || COLOR_MAP[0]}`}
          />
        ))
      )}
    </div>
  );
}

export function App() {
  const [started, setStarted] = useState(false);
  const [dateStr, setDateStr] = useState('');
  const [dayNumber, setDayNumber] = useState(1);
  const [title, setTitle] = useState('');
  const [ruleHint, setRuleHint] = useState('');
  const [examples, setExamples] = useState<ArcExample[]>([]);
  const [testInput, setTestInput] = useState<Grid>([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);
  const [options, setOptions] = useState<Grid[]>([]);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);
  const [totalSolves, setTotalSolves] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [result, setResult] = useState<SolvedData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [shared, setShared] = useState(false);
  const [copied, setCopied] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetch('/api/daily')
      .then((res) => res.json())
      .then((data) => {
        setDateStr(data.date || new Date().toISOString().slice(0, 10));
        setDayNumber(data.dayNumber || 1);
        setTitle(data.title || 'Visual Pattern');
        setRuleHint(data.ruleHint || 'Deduce the transformation rule');
        setExamples(data.examples || []);
        if (data.testInput) setTestInput(data.testInput);
        setOptions(data.options || []);
        setVoteCounts(data.voteCounts || {});
        setStreak(data.streak || 0);
        setTotalSolves(data.totalSolves || 0);

        if (data.completed && data.completedData) {
          setStarted(true);
          setResult({
            ...data.completedData,
            correctOptionIndex: data.correctOptionIndex,
            explanation: data.explanation,
          });
          setSelectedIdx(data.completedData.selectedIndex);
        }
      })
      .catch((err) => console.error('Failed to load SubARC puzzle:', err));
  }, []);

  const totalVotes = useMemo(() => {
    return Object.values(voteCounts).reduce((acc, curr) => acc + Number(curr || 0), 0);
  }, [voteCounts]);

  const handleStart = async () => {
    sfx.playGridClick();
    setStarted(true);
    setStartTime(Date.now());
    try {
      if (typeof telemetry !== 'undefined' && telemetry.startJourney) {
        await telemetry.startJourney();
      }
    } catch (err) {
      console.warn('Telemetry start error:', err);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (result || submitting) return;
    sfx.playGridClick();
    setSelectedIdx(idx);
  };

  const handleSubmitSolution = async () => {
    if (selectedIdx === null || result || submitting) return;

    setSubmitting(true);
    sfx.playGridClick();
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    try {
      const res = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedOptionIndex: selectedIdx,
          elapsedSeconds,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (data.voteCounts) setVoteCounts(data.voteCounts);
      if (data.streak !== undefined) setStreak(data.streak);

      setResult({
        score: data.score,
        selectedIndex: selectedIdx,
        correct: data.correct,
        isMaverick: data.isMaverick,
        speedBonus: data.speedBonus,
        maverickBonus: data.maverickBonus,
        correctOptionIndex: data.correctOptionIndex,
        explanation: data.explanation,
        elapsedSeconds,
      });

      if (data.correct) {
        sfx.playVictory();
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'],
        });
      } else {
        sfx.playBuzzer();
      }
    } catch (err) {
      console.error('Solve error:', err);
      setSubmitting(false);
    }
  };

  const handleShareComment = async () => {
    if (!result || shared) return;
    sfx.playGridClick();

    try {
      const res = await fetch('/api/share-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: result.score,
          streak,
          isMaverick: result.isMaverick,
          correct: result.correct,
          selectedIndex: result.selectedIndex,
          elapsedSeconds: result.elapsedSeconds || 15,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setShared(true);
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const handleCopyClipboard = () => {
    if (!result) return;
    sfx.playGridClick();

    const verdict = result.correct ? '🧩 SOLVED' : '❌ MISSED';
    const text = [
      `🧩 SubARC Daily #${dayNumber} (${dateStr})`,
      `Pattern: ${title} | ${verdict}`,
      `Score: ${result.score} pts | Streak: 🔥 ${streak}d`,
      `reddit.com/r/devvit`,
    ].join('\n');

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSound = () => {
    const next = sfx.toggleSound();
    setSoundOn(next);
  };

  // 1. Mission Brief / Start Screen
  if (!started) {
    return (
      <div className="w-full min-h-[580px] bg-[#0F1117] text-[#F8FAFC] flex flex-col justify-between p-6 sm:p-8 font-sans selection:bg-blue-500">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <span className="text-[11px] font-mono tracking-widest text-blue-400 uppercase font-bold">
            Reddit Daily Visual Reasoning • Day #{dayNumber} • {dateStr}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {totalSolves > 0 ? `${totalSolves} Solvers Today` : 'Midnight UTC Rollover'}
          </span>
        </div>

        <div className="my-auto text-center flex flex-col items-center max-w-lg mx-auto py-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950/60 border border-blue-500/40 rounded-full text-xs font-mono font-bold text-blue-400 mb-4 animate-pulse-glow">
            <span>● VISUAL REASONING ENGINE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">
            SUBARC
          </h1>
          <p className="text-xs uppercase font-mono tracking-wider text-blue-400 mb-4 font-bold">
            Daily Abstract Transformation Puzzles for Reddit
          </p>

          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Inspired by the ARC Prize. Observe the geometric pattern transformations on the left, deduce the underlying rule, and choose the correct completion grid on the right. 
            <br className="hidden sm:inline" />
            <strong className="text-emerald-400">Zero language barrier</strong>. 
            <strong className="text-blue-400 ml-1">Pure spatial deduction</strong>.
          </p>

          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl active:scale-95 transition-all shadow-lg shadow-blue-950/50 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Launch Today&apos;s Pattern</span>
            <span>→</span>
          </button>
        </div>

        <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-[11px] text-slate-500 font-mono">
          <span>Heat-map displays subreddit grid choices</span>
          <span>1 Solve per day</span>
        </div>
      </div>
    );
  }

  // 2. Active Game & Solved State
  return (
    <div className="w-full min-h-[580px] bg-[#0F1117] text-[#F8FAFC] flex flex-col justify-between p-4 sm:p-6 font-sans selection:bg-blue-500">
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-400 bg-blue-950/60 px-2.5 py-0.5 rounded border border-blue-500/40 font-mono">
            {title}
          </span>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Day #{dayNumber} • {dateStr}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-xs font-bold text-slate-400 hover:text-white w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer"
            title="Help"
          >
            ?
          </button>
          <button
            onClick={toggleSound}
            className="text-xs font-mono text-slate-400 hover:text-white w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer"
            title={soundOn ? 'Mute' : 'Unmute'}
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      {/* Rules Modal */}
      {showHelp && (
        <div className="my-2 p-4 bg-slate-900 border border-blue-500/40 rounded-xl text-xs leading-relaxed text-slate-300 animate-reveal-pop shadow-xl">
          <div className="flex justify-between items-center font-bold text-white border-b border-slate-800 pb-2 mb-2">
            <span>FIELD MANUAL: SUBARC REASONING</span>
            <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-white font-mono">✕</button>
          </div>
          <p className="mb-1.5">• <strong>Examples:</strong> Inspect how input grids transform into output grids.</p>
          <p className="mb-1.5">• <strong>Test Input:</strong> Apply that same transformation rule to the Test Input grid.</p>
          <p>• <strong>Speed & Maverick Bonus:</strong> Solve under 20s (+150 pts), or beat the subreddit consensus on tricky puzzles (+200 pts)!</p>
        </div>
      )}

      {/* Main Puzzle Area: Examples vs Test Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
        {/* Left: Transformation Examples */}
        <div className="bg-[#161922] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>OBSERVATION EXAMPLES (RULE CLUES)</span>
          </div>

          <div className="flex flex-col gap-3">
            {examples.map((ex, i) => (
              <div key={i} className="flex items-center justify-center gap-3 bg-[#1A1D27] p-2.5 rounded-lg border border-[#2A2E3D]">
                <div className="text-center">
                  <div className="text-[9px] text-slate-500 font-mono mb-1">IN {i + 1}</div>
                  <MiniGrid grid={ex.input} size="sm" />
                </div>
                <div className="text-blue-400 font-bold text-lg">➔</div>
                <div className="text-center">
                  <div className="text-[9px] text-slate-500 font-mono mb-1">OUT {i + 1}</div>
                  <MiniGrid grid={ex.output} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Test Grid to Complete */}
        <div className="bg-[#161922] p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>TEST CHALLENGE (APPLY RULE)</span>
            </div>

            <div className="flex items-center justify-center gap-4 bg-[#1A1D27] p-4 rounded-lg border border-[#2A2E3D]">
              <div className="text-center">
                <div className="text-[10px] text-slate-400 font-mono mb-1">INPUT</div>
                <MiniGrid grid={testInput} size="md" />
              </div>
              <div className="text-emerald-400 font-bold text-2xl">➔</div>
              <div className="text-center">
                <div className="text-[10px] text-emerald-400 font-mono mb-1">TARGET ?</div>
                {selectedIdx !== null ? (
                  <MiniGrid grid={options[selectedIdx]} size="md" />
                ) : (
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 font-bold text-xl">
                    ?
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center font-mono mt-2">
            Select the matching output grid below:
          </div>
        </div>
      </div>

      {/* 4 Candidate Option Grids */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-2">
        {options.map((option, idx) => {
          const isSelected = selectedIdx === idx;
          const isCorrectGrid = result && result.correctOptionIndex === idx;
          const votes = Number(voteCounts[String(idx)] || 0);
          const votePct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

          let cardStyle = 'bg-[#161922] border-slate-800 hover:border-slate-700';
          if (!result && isSelected) {
            cardStyle = 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30';
          } else if (result) {
            if (isCorrectGrid) {
              cardStyle = 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40';
            } else if (isSelected && !result.correct) {
              cardStyle = 'bg-red-950/40 border-red-500 ring-2 ring-red-500/40';
            }
          }

          return (
            <div
              key={idx}
              onClick={() => handleSelectOption(idx)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-between transition-all duration-200 cursor-pointer ${cardStyle}`}
            >
              <div className="text-[10px] font-mono text-slate-400 mb-1.5 font-bold">
                OPTION {idx + 1}
              </div>

              <MiniGrid grid={option} size="sm" />

              {result ? (
                <div className="w-full mt-2 pt-1.5 border-t border-slate-800/80 text-center">
                  <div className="text-[10px] font-mono text-slate-400">
                    {votePct}% Subreddit
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full ${
                        isCorrectGrid ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${votePct}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-[10px] font-mono text-slate-500">
                  {isSelected ? '✓ Selected' : 'Tap to select'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Area: Submit Button OR Result Bar */}
      {!result ? (
        <div className="pt-2">
          <button
            onClick={handleSubmitSolution}
            disabled={selectedIdx === null || submitting}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
              selectedIdx !== null
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 active:scale-95 shadow-blue-950/50'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>
              {selectedIdx !== null
                ? `CONFIRM OPTION ${selectedIdx + 1} AS THE TRANSFORMATION`
                : 'SELECT AN OPTION GRID ABOVE TO SOLVE'}
            </span>
            {selectedIdx !== null && <span>→</span>}
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-reveal-pop mt-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                  result.correct
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    : 'bg-red-950 text-red-400 border border-red-500/40'
                }`}
              >
                {result.correct ? '🧩 Transformation Solved' : '❌ Pattern Missed'}
              </span>
              {result.isMaverick && (
                <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-500/40">
                  🦅 Maverick Solver (+{result.maverickBonus} pts)
                </span>
              )}
            </div>
            <div className="text-xs text-slate-300 font-mono">
              <strong className="text-white text-sm">{result.score} pts</strong> • 🔥 {streak} Day Streak • {result.explanation}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleShareComment}
              disabled={shared}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                shared
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
              }`}
            >
              {shared ? '✓ Posted to Thread!' : 'Post Grid to Comments'}
            </button>
            <button
              onClick={handleCopyClipboard}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              title="Copy to clipboard"
            >
              {copied ? 'Copied!' : '📋'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
