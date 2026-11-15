# Reddit Game of the Day Hackathon 2026 — Devpost Submission Guide

> **Project Name:** SubARC — Daily Visual Reasoning & Community Consensus  
> **Tagline:** A daily 60-second abstract visual puzzle where Redditors deduce geometric transformation rules and discover community consensus.

---

## 📋 Devpost Submission Fields (Copy-Paste Ready)

### 1. Elevator Pitch / Short Description
> *SubARC brings the thrill of abstract visual reasoning (ARC Prize) to Reddit feeds as a daily 60-second puzzle. Every day, players observe two visual transformation examples on colorful 3x3 pixel matrices, deduce the underlying spatial rule, and choose the correct output grid. Live Devvit Redis counters show real-time subreddit accuracy and grid choices, while players earn speed and Maverick Solver bonuses for solving faster than the community median!*

---

### 2. About the Project / Inspiration
Most daily games depend on English vocabulary (*Wordle*, *Connections*). But Reddit is a global community of millions who communicate through images, memes, and visual patterns. 

Inspired by François Chollet's Abstraction and Reasoning Corpus (ARC Prize)—a benchmark for human-level artificial intelligence—we created **SubARC**:
* Zero language barrier: 100% visual and geometric.
* Intuitive spatial reasoning: symmetry reflections, gravity physics, cavity fills, and color polarity.
* Community Consensus: Every Redditor's solution feeds an atomic Devvit Redis counter, showing whether the community gravitated toward the intended rule or fell for subtle distractor traps.

---

### 3. What It Does
* **The 60-Second Loop:** Every midnight UTC, a new abstract puzzle appears. Players inspect 2 input-output examples, then deduce the target grid for the test input.
* **4 Candidate Grids:** 1 exact mathematical solution + 3 tricky distractors (inverted colors, wrong axis, or shifted offsets).
* **Live Subreddit Consensus:** Real-time percentage distribution on each option card showing how the subreddit voted.
* **Dual Bonuses:**
  * **Speed Bonus (+150 pts):** Awarded for solving the pattern in under 20 seconds.
  * **Maverick Solver (+200 pts):** Awarded when you deduce the correct grid on a tricky puzzle where over 60% of the subreddit picked a distractor!
* **1-Click Viral Comment Loop:** Posts a spoiler-free solution badge into the Reddit post's comment thread (`🧩 SubARC Daily #1: SOLVED | Time: 14s | Score: 1350 pts`).

---

### 4. How We Built It
* **Frontend:** Devvit Web, React 19, TypeScript, and Tailwind CSS. Clean, responsive matrix renderer with 9 high-contrast ARC palette colors.
* **Audio Synthesis:** Web Audio API synthesizer for tactile grid selection, buzzer feedback, and victory chords.
* **Backend:** Node.js server with Hono, adapted via `@hono/node-server` to Devvit's native `createServer`.
* **Devvit Redis State:**
  * `redis.hIncrBy`: Real-time tracking of community selections across candidate grids.
  * `redis.incrBy`: Player solve streak persistence and daily participant counts.
* **10-Year (3,650-Day) Engine:** Deterministic date hashing algorithm mapping every calendar day from `2026-11-13` to `2036-11-13` with randomized option order.
* **Telemetry:** Devvit Journeys (`@devvit/analytics`) tracking `startJourney` and `endJourney` with win and time data.

---

### 5. Built With Tags (Up to 25)
`reddit`, `devvit`, `react`, `typescript`, `tailwind-css`, `redis`, `hono`, `nodejs`, `web-audio-api`, `vite`, `canvas-confetti`, `hackathon`, `arc-prize`, `visual-reasoning`, `game-of-the-day`

---

### 6. Official Submission Links
* **GitHub Repository:** `https://github.com/psywarrior1998/sub-arc`
* **App Listing Link:** `https://developers.reddit.com/apps/sub-arc`
* **Test Subreddit:** `https://www.reddit.com/r/subarc_game_2026`
* **Demo Post Link:** `https://www.reddit.com/r/subarc_game_2026/comments/1xwxuvn/subarc_daily_1_20261115_symmetry_mirror_visual/`

---

## 👤 Created by / Describe your contribution

```text
Solo architect, developer, and designer for SubARC. Conceived and designed the core game mechanic: translating the ARC Prize benchmark into an accessible daily 60-second visual reasoning puzzle for Reddit with live community consensus. 

Built the full-stack Devvit Web application using React 19, TypeScript, Tailwind CSS, Hono Node.js backend, and Devvit Redis KV state. Engineered the 10-year deterministic spatial pattern bank, designed the zero-language-barrier matrix UI, integrated Devvit Journeys analytics telemetry, and built the procedural Web Audio synthesizer and in-thread spoiler-free comment sharing integration.
```
