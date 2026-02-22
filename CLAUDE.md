# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GreenQuest (綠野尋蹤) is a gamified plant identification educational web app. Users receive directed challenges to photograph specific categories of plants, AI validates their submissions, and they earn XP to level up a virtual pet. The UI is entirely in Traditional Chinese.

## Constraints

**This site is hosted on GitHub Pages.** All changes must work as a purely static site — no server-side rendering, no build step, no Node.js runtime. Everything must remain client-side HTML/CSS/JS.

## Development

This is a **zero-dependency, single-file application**. There is no package.json, no build step, no test framework, and no linter.

- **Run locally**: Open `index.html` directly in a browser, or serve with any static server (e.g., `npx serve .` or `python3 -m http.server`)
- **Deploy**: Pushes to `main` auto-deploy to GitHub Pages via `.github/workflows/static.yml`

## Architecture

Everything lives in `index.html` (~890 lines) — HTML structure, CSS styles, and JavaScript logic are all inline.

### Key Patterns

**Screen-based navigation**: All screens are `<div>` elements toggled via `hidden` class. `navigateTo(screenName)` is the central navigation function. Screens: `start`, `home`, `loading`, `result`, `tasks`, `achievements`, `pokedex`, `shop`, `challenge`, `camera`.

**State management**: A single global `gameState` object persisted to `localStorage` under key `greenQuestGameData`. `saveGameState()` and `loadGameState()` handle serialization. `loadGameState()` includes migration logic that removes old task keys and adds new ones for backwards compatibility.

**API integration**: All AI calls go through a Cloudflare Worker proxy (URL configured by user via settings, stored in `localStorage`) which forwards to Google Gemini API. Two API flows:
- `validatePlantForChallenge()` — sends a base64 image + prompt with target category, returns `{ isPlant, matchesCategory, plantName, scientificName, plantType, funFact }`
- `showPlantDetail()` — sends plant name/metadata, returns flower language, blooming season, and description

Both use the same payload format: `{ contents: [{ role, parts }], generationConfig: { responseMimeType: "application/json" } }`

**Modal/notification system**: `showModal()` for single popups. `queueNotification()` + `showNextNotification()` for sequential notifications (level ups, evolution, achievements can chain).

### Game Systems

- **Pet evolution**: 2 pet types (`seed1`, `seed2`), 3 stages each. Evolution triggers at level 2 and level 3 via `checkEvolution()`.
- **XP formula**: `calculateXpToNextLevel(level) = 2 * level`. Correct challenge = 5 XP, incorrect = 2 XP. Special feed doubles XP (`xpMultiplier`).
- **Challenge system**: 6 categories (非維管植物, 維管植物, 無種子植物, 種子植物, 無花植物, 有花植物) shuffled randomly per round. AI validates if photographed plant matches the target category. `getChallengeData()` holds all pre-written hints, extra knowledge, descriptions, and icons.
- **Plant classification** (for pokedex): 6 types matching the challenge categories — 非維管植物, 維管植物, 無種子植物, 種子植物, 無花植物, 有花植物.
- **Daily tasks**: Reset via `checkDailyTasks()` comparing `lastFeedDate` against today's date string.

### Styling

Tailwind CSS v4 loaded via CDN. Custom CSS in `<style>` block handles animations (modal transitions, progress bars), pet decoration positioning, and navigation active states. Primary color: emerald green.

## Assets

PNG images at repo root: `Background.png`, `Logo.png`, `Logo2.png`, `Hat.png`, `Pet1_1.png`–`Pet1_3.png` (seed1 stages), `Pet2_1.png`–`Pet2_3.png` (seed2 stages).
