# Smart Bookmark Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Build a minimal MV3 Chrome extension that recommends bookmark folders by host and lets the user confirm to save quickly.

**Architecture:** Vue popup UI talks to a background service worker for bookmarks/tabs operations. Core recommendation logic is a pure TS function with unit tests. A Playwright E2E harness loads the unpacked extension and seeds bookmarks to validate the full flow end-to-end.

**Tech Stack:** Vue 3, Vite, TypeScript, Vitest, Playwright.

### Task 1: Convert PRD draft to traceable PRD + v1 plans

**Files:**
- Create: `docs/prd/smart-bookmark.md`
- Create: `docs/plan/v1-index.md`
- Create: `docs/plan/v1-*.md`
- Move: `init_prd.md` → `docs/prd/drafts/init_prd.md`

**Step 1:** Ensure each requirement has a `REQ-###` and binary acceptance.
**Step 2:** Ensure each plan maps to `REQ-###` and contains verification commands.

### Task 2: Project scaffold (Vue + MV3) + first failing E2E smoke

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `public/manifest.json`
- Create: `src/background.ts`
- Create: `src/popup/*`
- Test: `e2e/extension-smoke.spec.ts`

**Steps:** Write failing E2E test → verify red → implement minimal extension shell → verify green.

### Task 3: Host recommendation + bookmark creation + full E2E flow

**Files:**
- Create: `src/lib/recommendHostFolders.ts`
- Test: `src/lib/recommendHostFolders.test.ts`
- Modify: `src/popup/PopupApp.vue`
- Modify: `src/background.ts`
- Test: `e2e/extension-flow.spec.ts`

**Steps:** Unit test red/green → E2E test red/green → refactor while staying green.

