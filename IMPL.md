# Implementation Plan: Add Tests Before Dependency Update

## Goal
Add tests to protect against regressions before updating dependencies (Next.js 15, React 19, xterm.js, Tailwind v4).

---

## Progress Checklist

### Phase 1: Testing Framework Setup
- [x] Install Vitest and dependencies
- [x] Create `vitest.config.ts`
- [x] Create `test/setup.ts`
- [x] Add `test` and `test:run` scripts to package.json
- [x] Verify `pnpm test` runs successfully (no tests yet)

### Phase 2: Unit Tests - Command Logic
- [ ] Create `app/components/terminal/__tests__/` directory
- [ ] Create `xterm-commands.test.ts`
  - [ ] Test `help` command
  - [ ] Test `whoami` command
  - [ ] Test `pwd` command
  - [ ] Test `date` command
  - [ ] Test `echo` command
  - [ ] Test `cat` with valid file
  - [ ] Test `cat` with invalid file
  - [ ] Test `ls` command
  - [ ] Test `cd` navigation (projects, .., ~)
  - [ ] Test `neofetch` command
  - [ ] Test `contact` command
  - [ ] Test unknown command error
- [ ] Create `xterm-extensions.test.ts`
  - [ ] Test `colorize()` function
  - [ ] Test `handleBackspace`
  - [ ] Test `handleArrowUp` history navigation
  - [ ] Test `handleArrowDown` history navigation
  - [ ] Test `handleTab` completion (single match)
  - [ ] Test `handleTab` completion (multiple matches)
  - [ ] Test `handleCtrlC`
  - [ ] Test `disconnect` state

### Phase 3: Component Integration Tests
- [ ] Create `XTerminal.test.tsx`
  - [ ] Test component renders without error
  - [ ] Test terminal container element exists
  - [ ] Test ClientTerminalWrapper renders XTerminal

### Phase 4: E2E Tests (Optional)
- [ ] Install Playwright
- [ ] Create `playwright.config.ts`
- [ ] Create `e2e/terminal.spec.ts`
  - [ ] Test page loads with terminal
  - [ ] Test typing `help` shows commands
  - [ ] Test typing `about` shows info
  - [ ] Test `matrix` command triggers effect
  - [ ] Test 'q' exits matrix mode
  - [ ] Test tab completion
  - [ ] Test command history navigation

### Phase 5: CI Integration
- [ ] Update `check` script to include tests
- [ ] Update `pre-deploy` script
- [ ] Verify full pipeline: `pnpm pre-deploy`

### Phase 6: Dependency Update
- [ ] Create branch `deps/update-all`
- [ ] Run `pnpm update --latest`
- [ ] Run `pnpm check` - all tests pass
- [ ] Run `pnpm build` - build succeeds
- [ ] Manual smoke test in browser
- [ ] Commit changes
- [ ] Merge to main

---

## Phase 1: Set Up Testing Framework

### 1.1 Install Vitest + Testing Library
```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom
```

Vitest is chosen over Jest for:
- Native ESM support (matches project's module setup)
- Better TypeScript integration
- Faster execution
- Built-in React support via plugin

### 1.2 Create vitest.config.ts
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
  },
})
```

### 1.3 Create test/setup.ts
```ts
import '@testing-library/jest-dom'
```

### 1.4 Add test script to package.json
```json
"test": "vitest",
"test:run": "vitest run"
```

---

## Phase 2: Unit Tests for Command Logic

### 2.1 Test xterm-commands.ts
File: `app/components/terminal/__tests__/xterm-commands.test.ts`

Test cases:
- `help` - returns list of commands
- `whoami` - returns "guest@frhd.me"
- `pwd` - returns current working directory
- `date` - returns valid date string
- `echo <text>` - echoes input text
- `cat <file>` - returns file contents for known files
- `cat <unknown>` - returns error for unknown files
- `cd projects` - changes cwd to ~/projects
- `cd ..` - navigates up
- `cd ~` - returns to home
- Unknown command - returns "Command not found"

Approach: Create a mock terminal object that captures `write`/`writeln` calls.

### 2.2 Test xterm-extensions.ts
File: `app/components/terminal/__tests__/xterm-extensions.test.ts`

Test cases:
- `colorize()` - applies correct ANSI codes
- `handleBackspace` - removes last character from currentLine
- `handleArrowUp/Down` - navigates command history correctly
- `handleTab` - completes partial commands
- `handleCtrlC` - clears current line

---

## Phase 3: Integration Tests for Terminal Component

### 3.1 Test XTerminal.tsx rendering
File: `app/components/terminal/__tests__/XTerminal.test.tsx`

Test cases:
- Component renders without crashing
- Terminal container div is present
- Welcome message appears after initialization

Note: xterm.js requires DOM and may need mocking for certain features.

---

## Phase 4: E2E Tests (Optional but Recommended)

### 4.1 Install Playwright
```bash
pnpm add -D @playwright/test
npx playwright install
```

### 4.2 Create playwright.config.ts
Configure for local dev server testing.

### 4.3 E2E test scenarios
File: `e2e/terminal.spec.ts`

- Page loads with terminal visible
- Type "help" → shows command list
- Type "about" → shows about info
- Type "matrix" → shows matrix effect
- Press 'q' → exits matrix mode
- Type "ls" → shows file listing
- Tab completion works
- Arrow up/down navigates history

---

## Phase 5: Update check script

Update `package.json`:
```json
"check": "pnpm run lint && pnpm run type-check && pnpm run test:run",
"pre-deploy": "pnpm run check && pnpm run build"
```

---

## Phase 6: Dependency Update Process

After tests pass:

1. Create a branch: `git checkout -b deps/update-all`
2. Run `pnpm update --latest`
3. Run `pnpm check` to verify no regressions
4. Run `pnpm build` to verify build succeeds
5. Manual smoke test in browser
6. Commit and merge

---

## Priority Order

1. **Phase 1** - Testing setup (required first)
2. **Phase 2** - Unit tests for commands (highest value, tests core logic)
3. **Phase 5** - Update check script (makes tests part of workflow)
4. **Phase 3** - Component tests (validates React integration)
5. **Phase 4** - E2E tests (catches browser-specific issues)
6. **Phase 6** - Perform the dependency update

---

## Files to Create

```
test/
  setup.ts
app/components/terminal/__tests__/
  xterm-commands.test.ts
  xterm-extensions.test.ts
  XTerminal.test.tsx
e2e/
  terminal.spec.ts
vitest.config.ts
playwright.config.ts (optional)
```
