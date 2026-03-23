# Architecture

## Purpose

Labsgen Tiktok is a Windows Electron desktop app that helps creators:

- capture TikTok/Streamlabs authentication tokens,
- prepare metadata (title, category, audience),
- request RTMP URL + Stream Key for OBS or other encoders,
- monitor runtime logs and application health.

## High-Level Runtime Design

The app uses a 3-process Electron model with shared typed contracts:

- `main` process: platform integration, services, DB, driver bootstrap, updates.
- `preload` process: secure bridge (`window.api`) exposed to renderer.
- `renderer` process: React UI and user workflows.
- `shared` module: IPC channels, protocol maps, domain types.

## Clean Lite Structure (Main Process)

Main process code is organized by responsibility:

- `src/main/core/*`
- `src/main/features/*`
- `src/main/services/*`

### `core`

Contains framework-level app plumbing:

- bootstrap composition (`bootstrapApp`, `createServices`)
- runtime paths and constants
- single-instance lock
- window and tray creation
- updater event registration
- typed IPC helper wrappers
- shared main-process service interfaces

### `features`

Contains IPC registration by business area:

- `features/core`: settings, accounts, stream control, categories, paths, performance, window actions.
- `features/driver`: chromedriver setup/check, local/web token loading, profile deletion.
- `features/logs`: system log CRUD and pagination.
- `features/updates`: check/download/install update lifecycle.

### `services`

Contains infrastructure and external integrations:

- `streamlabs.ts`: Streamlabs/TikTok API calls.
- `tokenService.ts`: local token extraction from LevelDB files.
- `chromeDriver.ts`: Chrome detection and matching ChromeDriver resolution.
- `driverService.ts`: driver lifecycle (install/check/metadata).
- `oauth.ts`: PKCE and code exchange flow.
- `seleniumToken.ts`: browser automation token capture with Selenium.
- `dbService.ts`: SQLite persistence and schema.
- `encryptionService.ts`: Electron `safeStorage` encryption/decryption.

## Renderer Composition

Renderer is React + hooks-centric orchestration:

- `App.tsx` composes shell, toasts, modal, and loading gate.
- `useAppOrchestrator` is the top-level UI orchestration entrypoint.
- `pages/*` provides route-level screens.
- `hooks/*` encapsulates business logic and side effects.
- `app/types/*` defines typed page props and view models.

## Cross-Process Contract

Single source of truth for IPC:

- `src/shared/ipc/channels.ts`
- `src/shared/ipc/protocol.ts`
- `src/shared/ipc/contracts.ts`

The preload layer maps those typed channels into `window.api` in `src/preload/index.ts`.

## Core Runtime Flows

## 1) App Bootstrap

1. Main initializes runtime userData path and service bundle.
2. SQLite `dbService.init()` runs and tables are created if needed.
3. BrowserWindow + tray are created on `app.whenReady()`.
4. IPC handlers are registered.
5. Renderer bootstraps state from `app_state` persisted settings.

## 2) Driver Readiness

1. Renderer calls `check-driver-exists`.
2. Main compares installed Chrome major version with stored driver metadata.
3. If mismatch/missing, driver bootstrap downloads matching binary from Chrome for Testing manifest.
4. Metadata is saved to `chromedriver.json`.

## 3) Token Flow

- Local token mode:
  - scans Streamlabs/browser LevelDB log/ldb files for `apiToken`.
- Web token mode:
  - Selenium opens auth flow, captures code, exchanges code for token.
- Captured tokens are stored as encrypted account records in SQLite.

## 4) Stream Start Flow

1. Renderer sets active token.
2. `refresh-account` gets permissions/status.
3. `start-stream` posts title/category/audience.
4. RTMP URL + key + stream id are returned.
5. End stream calls `stream/{id}/end`.

## 5) Logging and Observability

- All major operations log into `system_logs`.
- Logs are pushed in near-real-time to renderer via `system-log` event.
- Pulse page supports paging and filtering through IPC.

## 6) Update Flow

- Uses `electron-updater` with manual download (`autoDownload = false`).
- Emits:
  - `update-available`
  - `update-progress`
  - `update-downloaded`
  - `update-error`

## Dependency Rules

- Renderer must not access Node/Electron directly; use `window.api`.
- Preload must stay thin and contract-focused.
- Features should depend on service interfaces, not renderer code.
- Shared types/contracts should remain side-effect free.

