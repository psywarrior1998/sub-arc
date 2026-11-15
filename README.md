<div align="center">

# 🧩 SubARC
### Daily Abstract Visual Reasoning & Community Consensus for Reddit

[![Reddit Devvit](https://img.shields.io/badge/Devvit%20Web-v0.15.3-FF4500?style=for-the-badge&logo=reddit&logoColor=white)](https://developers.reddit.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Devvit Redis](https://img.shields.io/badge/Devvit_Redis-KV_Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://developers.reddit.com/docs/redis)
[![Devvit Journeys](https://img.shields.io/badge/Devvit_Journeys-Telemetry-8A2BE2?style=for-the-badge)](https://developers.reddit.com/docs/telemetry)

<br/>

**A daily 60-second visual pattern deduction game where Redditors deduce geometric transformation rules and discover real-time community consensus.**

[🎮 Play Live on Reddit](https://www.reddit.com/r/subarc_game_2026/comments/1xwyao5/subarc_daily_3_20261115_chromatic_polarizer/) • [🏆 Devpost Submission](https://devpost.com) • [🛠️ Devvit App Dashboard](https://developers.reddit.com/apps/subarc-game)

</div>

---

## 💡 Concept & The ARC Prize Connection

Most daily web games require English vocabulary knowledge (*Wordle*, *Connections*). But Reddit is a global community of millions who communicate through images, memes, and visual patterns. 

Inspired by François Chollet's **Abstraction and Reasoning Corpus (ARC Prize)**—the premier benchmark for human-level artificial intelligence—**SubARC** brings pure visual and geometric deduction directly to Reddit feeds:
* **Zero Language Barrier:** 100% visual, played effortlessly across all cultures and languages.
* **Intuitive Spatial Puzzles:** Symmetry reflections, gravity physics, cavity fills, and color polarity.
* **Community Consensus:** Every Redditor's choice feeds an atomic Devvit Redis counter, revealing in real-time whether the community identified the intended rule or fell for subtle distractor traps.

---

## ✨ Core Features

### 1. 📅 10-Year (3,650-Day) Curated Pattern Bank
Built with multi-rule geometric transformations (rotations, reflections, gravity wells, hollow fills, and chromatic polarizers). A 32-bit deterministic date hashing algorithm (`src/server/arc_puzzles.ts`) maps every calendar day from `2026-11-13` to `2036-11-13` to a unique daily puzzle with seed-based option shuffling.

### 2. 🌡️ Real-Time Consensus Heat-Map (Devvit Redis)
Upon solving, each of the 4 candidate grids displays the percentage of the subreddit that picked that grid, illuminating crowd consensus.

### 3. 🦅 Dual Bonus Scoring
* **Base Score:** 1,000 pts.
* **Speed Bonus (+150 pts):** Awarded for solving the pattern in under 20 seconds.
* **Maverick Solver (+200 pts):** Awarded when you deduce the correct grid on a tricky puzzle where over 60% of the subreddit picked a distractor!

### 4. 💬 1-Click Viral Comment Loop
Single-click comment sharing via `reddit.submitComment` posts a spoiler-free solution badge directly into the thread:
```text
🧩 SubARC Daily #1 — 2026-11-15
Pattern: Symmetry Mirror
Verdict: 🧩 TRANSFORMATION SOLVED | Time: 14s
Score: 1350 pts | Streak: 🔥 3 days 🦅 Maverick Solver (Beat the Crowd!)
Dossier Selection: Grid [Option 3]
*(Zero spoilers — launch the interactive visual reasoning challenge in the post above to solve!)*
```

### 5. 🎧 Zero-Dependency Web Audio Synthesizer
Includes custom procedural sound synthesis using the native browser Web Audio API:
* **Grid Selection:** Subtle sine-wave click.
* **Victory Chime:** A major triad celebration chord (A4-C#5-E5-A5) with confetti particles.
* **Buzzer:** Low-frequency sawtooth sound on distractor selection.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph Reddit Feed
        A["📱 Reddit Post Embed (WebView)"]
        B["💬 Comment Thread"]
    end

    subgraph Client (React 19)
        C["3x3 Matrix Grid Renderer"]
        D["Web Audio Synthesizer (SFX)"]
        E["Devvit Journeys Telemetry"]
    end

    subgraph Devvit Backend (Hono / Node.js 22)
        F["GET /api/daily (Sanitized Puzzle)"]
        G["POST /api/solve (Validation & Maverick)"]
        H["POST /api/share-comment (Reddit API Bridge)"]
        I["POST /internal/menu/post-create (Mod Tool)"]
    end

    subgraph Devvit Platform
        J[("Devvit Redis (Votes & Streaks)")]
        K["Devvit Scheduler (Midnight Cron)"]
        L["Reddit API Client"]
    end

    A --> C
    C --> D
    C --> E
    C <-->|HTTP| F
    C <-->|HTTP| G
    C <-->|HTTP| H
    G <-->|hIncrBy / incrBy| J
    H -->|submitComment| L
    I -->|submitPost| L
    K -->|submitPost| L
    L --> B
```

---

## 🛠️ Devvit Platform Capabilities

| Capability | Implementation |
| :--- | :--- |
| **Devvit Web** | Full-stack Node.js server with React 19 WebView bundle |
| **Devvit Redis** | Atomic hash increment (`hIncrBy`) for live vote distribution & streaks |
| **Devvit Journeys** | Telemetry tracking with `startJourney()` and `endJourney()` |
| **Devvit Scheduler** | Daily midnight UTC cron (`0 0 * * *`) |
| **Subreddit Menus** | Moderator tool returning strict `UiResponse` schema |
| **Reddit API** | Automated spoiler-free comment submissions via `reddit.submitComment` |

---

## 👤 Author & Credits

* **Developer:** [@psywarrior1998](https://github.com/psywarrior1998) (`u/motivationalspaceman`)
* **Built for:** Reddit's Game of the Day Hackathon 2026
* **License:** [MIT License](LICENSE)
