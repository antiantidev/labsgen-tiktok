# Data and Storage

## Runtime Paths

Main process initializes custom user data root:

- Base: `%APPDATA%/Labsgen Tiktok`

Key runtime locations:

- SQLite DB: `%APPDATA%/Labsgen Tiktok/app.db`
- Profiles dir (default): `%APPDATA%/Labsgen Tiktok/profiles`
- Driver dir: `%APPDATA%/Labsgen Tiktok/drivers`
- Driver binary: `%APPDATA%/Labsgen Tiktok/drivers/chromedriver-win64/chromedriver.exe`
- Driver metadata: `%APPDATA%/Labsgen Tiktok/drivers/chromedriver.json`

## SQLite Schema

Defined in `src/main/services/dbService.ts`.

### `accounts`

- `id TEXT PRIMARY KEY`
- `name TEXT`
- `type TEXT` (`local` or `web`)
- `token TEXT` (encrypted when safeStorage is available)
- `username TEXT`
- `lastUsed INTEGER`

### `settings`

- `key TEXT PRIMARY KEY`
- `value TEXT` (JSON-serialized)

### `system_logs`

- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `level TEXT`
- `message TEXT`
- `timestamp TEXT` (ISO string)

### `categories`

- `id TEXT PRIMARY KEY` (TikTok game mask id)
- `name TEXT`
- `short_name TEXT`

## Persisted App Setting Keys

Current key map in `src/shared/domain/settings.ts`:

- `app_state`

`app_state` contains UI/runtime persistence such as:

- stream title/category/audience
- token and stream id
- theme and language
- active account id
- settings (`customProfilePath`, `autoRefresh`, `minimizeOnClose`, `captureDelay`)
- last page

## Token Encryption

Token encryption is handled by `src/main/services/encryptionService.ts`:

- uses Electron `safeStorage` when available,
- stores encrypted token as base64 string,
- gracefully falls back to plain text when encryption is unavailable.

Important:

- fallback mode exists for compatibility, not ideal security.
- production environments should prefer running where `safeStorage` is available.

## Profile Storage

Selenium browser profiles are stored in:

- custom path from app settings, or
- default `%APPDATA%/Labsgen Tiktok/profiles`

Each web-captured account typically maps to a profile folder.

## Log Retention

System logs are auto-pruned in main process:

- retention limit is configured in `runtimeConfig` and applied via `pruneSystemLogs`.

## Backup and Recovery

To backup local app state:

1. close the app,
2. copy `%APPDATA%/Labsgen Tiktok` directory,
3. restore to same path on target machine.

If restoring to different machine/user, verify:

- driver binary compatibility,
- safeStorage behavior for encrypted tokens,
- Chrome installation and version.

