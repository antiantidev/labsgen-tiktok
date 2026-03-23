# Development Guide

## Prerequisites

- Windows 10/11 (recommended for full runtime parity)
- Node.js `>=22`
- pnpm `>=10`
- Corepack enabled

## Initial Setup

```bash
corepack enable
pnpm install
```

Notes:

- `postinstall` rebuilds native `better-sqlite3` for Electron:
  - `pnpm exec electron-rebuild -f -w better-sqlite3`
- Keep Node and Electron toolchain aligned with `package.json`.

## Local Development Commands

```bash
# Run app in dev mode
pnpm dev

# Type checks
pnpm typecheck

# Unit tests
pnpm test

# Build dist artifacts
pnpm build
```

## Packaging Commands

```bash
# Build + publish (tag/release workflow)
pnpm release

# Build installer locally
pnpm exec electron-builder --win nsis --x64
```

## Project Structure

```text
src/
  main/       # Electron main process
  preload/    # contextBridge API
  renderer/   # entry + app shell
  pages/      # route-level screens
  hooks/      # orchestration and logic hooks
  components/ # UI components
  shared/     # cross-process contracts and domain types
docs/         # project documentation
scripts/      # utility scripts (chromedriver bootstrap, etc.)
```

## Environment Variables

`.env.example`:

- `GH_TOKEN`: GitHub token for publishing/release or updater contexts.

Optional runtime overrides for Chrome detection and driver matching:

- `CHROME_PATH`, `CHROME_BINARY`, `CHROME_EXE`
- `CHROME_VERSION` (or `CHROMEDRIVER_VERSION`)

## Coding Guidelines

- Keep main-process logic in `src/main/services` and wire via `src/main/core/bootstrap`.
- Register IPC handlers only inside `src/main/features/*`.
- Add/update shared contracts when adding IPC channels.
- Keep preload as mapping-only layer.
- Prefer small composable hooks in renderer.

## TypeScript Setup

The project uses split TS configs:

- `tsconfig.main.json`
- `tsconfig.preload.json`
- `tsconfig.renderer.json`

Run all checks:

```bash
pnpm typecheck
```

## Native Module Notes (`better-sqlite3`)

If you see ABI mismatch errors (`NODE_MODULE_VERSION` mismatch):

```bash
pnpm install
pnpm exec electron-rebuild -f -w better-sqlite3
```

If needed, clear and reinstall:

```bash
Remove-Item -Recurse -Force node_modules
pnpm install
```

## Common Workflow for New Feature

1. Update/extend shared contract in `src/shared/ipc/*` if needed.
2. Implement or extend service in `src/main/services/*`.
3. Register/modify IPC handler in `src/main/features/*`.
4. Expose preload bridge method in `src/preload/index.ts`.
5. Consume from renderer via hooks/pages.
6. Add tests for service logic.
7. Run `pnpm typecheck && pnpm test && pnpm build`.

