# Security Notes

## Scope

This document summarizes current security-related behavior and limitations.

## Token Handling

- Tokens are persisted in SQLite `accounts.token`.
- Before write, token is processed by `encryptionService`:
  - preferred mode: Electron `safeStorage` encryption.
  - fallback mode: plain text if encryption API is unavailable.

Implication:

- security level depends on OS/runtime support for `safeStorage`.

## Renderer Isolation

- Renderer uses preload bridge (`contextBridge.exposeInMainWorld`).
- Renderer accesses privileged operations only through `window.api`.
- Main IPC handlers are centralized and typed.

## External Links

- External URLs are opened via `shell.openExternal`.
- New window requests are denied and redirected to external browser.

## Local Data

Sensitive local artifacts:

- `%APPDATA%/Labsgen Tiktok/app.db`
- browser profile data under `%APPDATA%/Labsgen Tiktok/profiles`

Operational recommendation:

- protect OS user account,
- avoid sharing full app data folder,
- rotate tokens if machine is compromised.

## Network Integrations

The app communicates with:

- Streamlabs API endpoints for info/stream/auth exchange.
- Chrome for Testing manifest and driver downloads.
- GitHub release/update endpoints through `electron-updater`.

## Known Security Tradeoffs

- Fallback to non-encrypted token storage when `safeStorage` is unavailable.
- Selenium profile folders may retain browser session state.
- No code-signing trust guarantees are documented for distributed installer.

## Recommended Hardening

1. Enforce encrypted storage requirement in production builds.
2. Add optional profile cleanup policy for stale Selenium profiles.
3. Add signed release pipeline and artifact verification policy.
4. Consider secrets scanning and dependency audit in CI.

