# Clean Lite Refactor Notes (v0.18.0)

This document summarizes the major refactor delivered in `v0.18.0`.

## Goals

- Improve maintainability and onboarding.
- Establish clear module boundaries in the Electron main process.
- Remove dynamic runtime coupling that caused packaging/runtime issues.
- Standardize CI, release, and repository collaboration workflows.

## Architecture Changes

### Main Process Structure

Main code is now organized by responsibility:

- `src/main/core/*`
  - app bootstrap and composition
  - runtime configuration and environment paths
  - lifecycle and single-instance lock
  - window and tray setup
  - updater event wiring
  - shared main-process types
- `src/main/features/*`
  - feature-oriented IPC registration modules:
    - `core`
    - `driver`
    - `logs`
    - `updates`
- `src/main/services/*`
  - infrastructure services:
    - `streamlabs`
    - `tokenService`
    - `chromeDriver`
    - `driverService`
    - `oauth`
    - `seleniumToken`
    - `dbService`
    - `encryptionService`

### Service Wiring

- Replaced dynamic `require(...)` service resolution with static typed composition in `createServices`.
- This reduces runtime path resolution failures in packaged builds and improves type safety.

## TypeScript Migration

- Runtime source modules are migrated to TypeScript across:
  - `src/main`
  - `src/preload`
  - `src/renderer` and app UI modules
- Legacy runtime JS service modules were removed after migration.
- Supporting scripts used in development/release flows were moved to TypeScript where applicable.

## Testing and Validation

- Service tests now target `src/main/services/*.ts`.
- Test runner uses Node with `--experimental-strip-types`.
- Validation commands:
  - `pnpm run typecheck`
  - `pnpm test`
  - `pnpm run build`

## CI and Release Workflow

- `validate.yml` introduced as reusable workflow for install/typecheck/test/(optional build).
- `ci.yml` now calls `validate.yml` on push/pull request.
- `release.yml` calls `validate.yml`, validates tag/version, then publishes.
- Label automation and ownership standards added:
  - `labels.yml`
  - `CODEOWNERS`
  - PR and Issue templates

## Operational Notes

- Recommended environment:
  - Node.js 22+
  - pnpm 10+
- Release tag format remains:
  - `v<package.json version>`
  - Example: `v0.18.0`
