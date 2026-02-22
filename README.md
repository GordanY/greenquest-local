# GreenQuest 綠野尋蹤

A gamified plant identification web app. Photograph plants, let AI identify them, answer quiz questions to earn XP, and level up your virtual pet.

The entire UI is in Traditional Chinese.

## Getting Started

This is a **zero-dependency, single-file application**. No package.json, no build step.

```bash
# Option 1: Open directly
open index.html

# Option 2: Serve locally
npx serve .
# or
python3 -m http.server
```

## Architecture

Everything lives in [`index.html`](index.html) (~890 lines) — HTML, CSS, and JavaScript are all inline.

- **Styling**: Tailwind CSS v4 via CDN + custom `<style>` block for animations
- **Font**: Noto Sans TC (Google Fonts, weights 400/500/700)
- **State**: Single `gameState` object persisted to `localStorage` under key `greenQuestGameData`

## Screens & Navigation

All screens are `<div>` elements toggled via the `hidden` class. The central navigation function is `navigateTo(screenName)`.

| Screen ID | Purpose |
|---|---|
| `start-screen` | Pet selection and naming (onboarding) |
| `home-screen` | Pet display, XP progress bar, main hub |
| `loading-screen` | AI processing indicator |
| `result-screen` | Plant identification result + quiz |
| `tasks-screen` | Daily and category tasks |
| `achievements-screen` | Achievement progress and unlockables |
| `pokedex-screen` | Collected plant gallery |
| `shop-screen` | Buy decorations and special feed |
| `camera-screen` | Live camera capture |

**Bottom navigation bar** (`#main-nav`): 5-column grid with Home, Feed, Pokedex, Shop, and Tasks. Active state is emerald green (`#16a34a`).

## API Integration

All AI calls go through a **Cloudflare Worker** proxy that forwards to the Google Gemini API.

The worker URL is not hardcoded — users configure it via the in-app settings panel (stored in `localStorage`).

### Plant Identification — `identifyPlantAndCreateQuiz()`

Sends a base64 image to identify the plant and generate a quiz.

**Request:**
```json
{
  "contents": [{
    "role": "user",
    "parts": [
      { "text": "<prompt>" },
      { "inlineData": { "mimeType": "image/png", "data": "<base64>" } }
    ]
  }],
  "generationConfig": { "responseMimeType": "application/json" }
}
```

**Response (parsed from `candidates[0].content.parts[0].text`):**
```json
{
  "plantName": "玫瑰",
  "scientificName": "Rosa spp.",
  "plantType": "雙子葉植物",
  "funFact": "...",
  "quiz": {
    "question": "...",
    "options": ["A", "B", "C"],
    "correctAnswerIndex": 2
  }
}
```

### Plant Detail — `showPlantDetail()`

Sends a plant name to get additional metadata.

**Response (parsed from `candidates[0].content.parts[0].text`):**
```json
{
  "flowerLanguage": "愛情與美麗",
  "bloomingSeason": "春夏秋",
  "description": "..."
}
```

### Plant Types

5 valid classification types returned by the API:

| Type | English | Badge Color |
|---|---|---|
| 非維管植物 | Non-vascular (mosses, algae) | teal |
| 蕨類植物 | Ferns | green |
| 雙子葉植物 | Dicots (roses, maples) | pink |
| 單子葉植物 | Monocots (rice, bamboo) | yellow |
| 裸子植物 | Gymnosperms (pines, ginkgo) | blue |

## Game Systems

### XP & Leveling

- XP needed per level: `2 * level` (level 1 = 2 XP, level 2 = 4 XP, ...)
- Correct quiz answer: **5 XP** (× multiplier)
- Incorrect quiz answer: **2 XP** (× multiplier)
- Special feed doubles the multiplier for one identification

### Pet Evolution

2 pet types (`seed1` 種籽, `seed2` 豆芽), each with 3 visual stages:

| Stage | Trigger | seed1 | seed2 |
|---|---|---|---|
| 1 | Start | `Pet1_1.png` | `Pet2_1.png` |
| 2 | Level 2 | `Pet1_2.png` | `Pet2_2.png` |
| 3 | Level 3 | `Pet1_3.png` | `Pet2_3.png` |

### Daily Tasks

Reset daily via `checkDailyTasks()` comparing `lastFeedDate` against today.

| Task Key | Description | Reward |
|---|---|---|
| `dailyFeed` | Feed pet once | 20 seeds |
| `feedNonVascular` | Identify a 非維管植物 | 15 seeds |
| `feedFern` | Identify a 蕨類植物 | 15 seeds |
| `feedDicot` | Identify a 雙子葉植物 | 15 seeds |
| `feedMonocot` | Identify a 單子葉植物 | 15 seeds |
| `feedGymnosperm` | Identify a 裸子植物 | 15 seeds |

### Achievements

Each unlocks **+50 seeds**.

| ID | Name | Target |
|---|---|---|
| `firstAnswer` | Answer 1 question correctly | 1 correct answer |
| `feedThreeTimes` | Feed pet 3 times | 3 feeds |
| `reachLevelTwo` | Reach level 2 | Level 2 |

### Shop

| Item | Price | Effect |
|---|---|---|
| 神奇營養液 (Special Feed) | 50 seeds | 2× XP on next identification |
| 時尚草帽 (Hat) | 150 seeds | Cosmetic pet decoration |

## State Management

The `gameState` object is saved to `localStorage` via `saveGameState()` and loaded via `loadGameState()`.

```
gameState
├── gameStarted: boolean
├── level: number
├── xp: number
├── seeds: number
├── pet
│   ├── type: "seed1" | "seed2"
│   ├── stage: 1 | 2 | 3
│   ├── name: string
│   ├── visual: string (filename)
│   └── decoration: null | string
├── inventory
│   ├── specialFeed: number
│   └── ownedDecorations: string[]
├── pokedex: { [plantName]: { name, scientificName, type, image, fact } }
├── stats
│   ├── feeds: number
│   └── correctAnswers: number
├── tasks: { [taskKey]: { description, reward, completedToday, claimedToday, lastFeedDate } }
├── achievements: { [id]: { name, description, target, progress, unlocked, metric } }
├── currentQuiz: null | { question, options, correctAnswerIndex }
├── isProcessing: boolean
└── xpMultiplier: 1 | 2
```

`loadGameState()` includes migration logic that removes deprecated task keys and adds new ones for backwards compatibility.

## Assets

All images are PNGs at the repo root.

| File | Description |
|---|---|
| `Background.png` | Home screen background |
| `Logo.png` | Logo variant 1 |
| `Logo2.png` | Logo variant 2 |
| `Hat.png` | Pet hat decoration |
| `Pet1_1.png` | seed1 stage 1 |
| `Pet1_2.png` | seed1 stage 2 |
| `Pet1_3.png` | seed1 stage 3 |
| `Pet2_1.png` | seed2 stage 1 |
| `Pet2_2.png` | seed2 stage 2 |
| `Pet2_3.png` | seed2 stage 3 |

## Deployment

Pushes to `main` auto-deploy to GitHub Pages via [`.github/workflows/static.yml`](.github/workflows/static.yml).
