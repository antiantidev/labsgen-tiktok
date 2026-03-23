# Changelog

All notable changes to this project are documented in this file.

## [0.19.0] - 2026-03-24

### Added

- Zustand as renderer state management dependency.
- Domain stores under `src/stores/*`:
  - `coreStore`
  - `uiStore`
  - `logsStore`
  - `accountsStore`
  - `streamStore`
  - `settingsUiStore`
  - `liveSetupUiStore`
  - `dashboardStore`
  - `pulseUiStore`

### Changed

- Migrated renderer global state and orchestration from hook-local state to Zustand store facades.
- Refactored lifecycle wiring (`bootstrap`, `event listeners`, `persistence`, `driver readiness`, `shell controls`) to use store-backed state flow.
- Migrated remaining page-level UI states in Settings/LiveSetup/Dashboard/Pulse to Zustand.

### Notes

- IPC contract and main/preload runtime behavior remain unchanged.
- Existing page props and route content contracts were kept compatible.

## [0.18.1] - 2026-03-24

### Fixed

- Tray icon loading in packaged installs by:
  - adding extra runtime icon search fallbacks in `createTray`,
  - adding executable icon fallback when icon files cannot be resolved.
- Packaging resource delivery by bundling `resources/icon.ico` and `resources/icon.png` via `extraResources`.

### Changed

- Recreated `resources/icon.ico` from updated `resources/icon.png` for consistent dev/install icon rendering.

## [0.18.0] - 2026-03-24

### Added

- `docs/refactor-clean-lite-v0.18.0.md` with architecture and migration notes.
- Reusable GitHub workflow architecture:
  - `validate.yml` (shared validation pipeline)
  - `ci.yml` (push/PR validation)
  - `labels.yml` (label sync + auto-label)
- Repository collaboration standards:
  - `CONTRIBUTING.md`
  - `CODEOWNERS`
  - PR template
  - Issue templates

### Changed

- Major Clean Lite refactor across the application:
  - Main process reorganized into `src/main/core/*`, `src/main/features/*`, and `src/main/services/*`.
  - Service composition moved from dynamic runtime resolution to static typed wiring.
- Runtime and service modules migrated to TypeScript.
- Service tests migrated to `src/main/services/*.test.ts` and executed with Node strip-types.
- Build/release pipeline standardized around `pnpm` + Node 22.

### Fixed

- Packaged runtime issues caused by module resolution drift during refactor/migration.
- Packaging compatibility for `pnpm` layout and native module unpack paths.

### Breaking/Internal Refactor Notes

- Legacy `services/*.js` implementation files were removed.
- Legacy service tests under `services/*.test.js` were removed and replaced with TS tests.
- Config files were standardized to typed/explicit module formats:
  - `electron.vite.config.ts`
  - `tailwind.config.ts`
  - `postcss.config.cjs`

### Migration Notes

- Required local environment:
  - Node.js 22+
  - pnpm 10+
- Release tags must continue matching package version (`v<version>`), e.g. `v0.18.0`.
- For deeper technical migration details, see:
  - `docs/refactor-clean-lite-v0.18.0.md`
