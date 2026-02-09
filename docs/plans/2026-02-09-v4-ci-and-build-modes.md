# CI + Build Modes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Add CI and a production/test build split so the extension ships without the E2E harness while keeping Playwright E2E reliable.

**Architecture:** Use Vite `mode` to conditionally include the test harness entrypoint only in `--mode test`. Update `npm run e2e` to build in test mode. Add GitHub Actions workflow running `npm test` and `npm run e2e` under Xvfb (headed Chromium required for extensions).

**Tech Stack:** Vite modes, Vitest, Playwright, GitHub Actions.

### Task 1: Plan + PRD trace for v4

**Files:**
- Create: `docs/plan/v4-index.md`
- Create: `docs/plan/v4-ci.md`
- Create: `docs/plan/v4-build-modes.md`
- Modify: `docs/prd/smart-bookmark.md`

**Step 1:** Add `REQ-013` (prod build excludes harness) and `REQ-014` (CI runs tests).
**Step 2:** Ensure each plan has binary acceptance + verification commands.

### Task 2: Implement build modes (prod vs test)

**Files:**
- Modify: `vite.config.ts`
- Modify: `package.json`

**Step 1:** Keep default `npm run build` as production output (no harness).
**Step 2:** Add `npm run build:test` using `vite build --mode test` and include harness only in test mode.
**Step 3:** Update `npm run e2e` to use `build:test`.
**Step 4:** Verify: `npm run build` outputs no `dist/src/testHarness/harness.html`; `npm run build:test` does.

### Task 3: Add CI (GitHub Actions)

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1:** `npm ci`
**Step 2:** Install Playwright Chromium deps: `npx playwright install --with-deps chromium`
**Step 3:** Run unit tests: `npm test`
**Step 4:** Run E2E with Xvfb: `xvfb-run -a npm run e2e`

### Task 4: Update onboarding docs

**Files:**
- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: `README.zh-CN.md`

**Step 1:** Document build modes and CI assumptions.
**Step 2:** Add troubleshooting notes for E2E headed requirements.

