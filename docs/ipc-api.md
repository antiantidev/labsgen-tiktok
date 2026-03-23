# IPC API Reference

Source of truth:

- `src/shared/ipc/channels.ts`
- `src/shared/ipc/protocol.ts`
- `src/shared/ipc/contracts.ts`

This document mirrors the typed IPC map used across main/preload/renderer.

## Invocation Channels (`ipcRenderer.invoke`)

## Token and Stream

- `set-token(token: string): unknown`
- `refresh-account(): RefreshAccountResult`
- `search-games(text: string): SearchGamesResult`
- `start-stream(data: { title; category; audienceType }): StartStreamResult`
- `end-stream(): { ok: boolean; error?: string }`
- `set-stream-id(id: string | null): unknown`
- `load-local-token(): TokenLoadResult`
- `load-web-token(options?: { accountId?: string | null }): TokenLoadResult`

## Driver

- `bootstrap-driver(): DriverBootstrapResult`
- `check-driver-exists(): boolean`
- `delete-profile(accountId: string): boolean`

## System and Paths

- `select-folder(): string | null`
- `open-path(targetPath: string): unknown`
- `get-default-path(): string`
- `get-all-paths(): Record<string, string>`
- `get-performance(): PerfResult`

## Database: Accounts and Settings

- `db-get-accounts(): AccountRecord[]`
- `db-save-account(account: AccountRecord): unknown`
- `db-update-username({ id, username }): unknown`
- `db-delete-account(id: string): unknown`
- `db-get-setting(key: string, defaultValue?: unknown): unknown`
- `db-save-setting(key: string, value: unknown): unknown`

## Categories

- `sync-categories(): { ok: boolean; count?: number; added?: number; error?: string }`
- `get-category-count(): number`
- `get-category-by-name(name: string): StreamCategory | null`

## Update

- `get-app-version(): string`
- `check-for-updates(): { ok: boolean; upToDate?: boolean; devMode?: boolean; error?: string }`

## Logs

- `system-log-add(entry: SystemLogEntry): unknown`
- `system-log-get(params?: { limit?: number; offset?: number }): SystemLogEntry[]`
- `system-log-count(): number`
- `system-log-clear(): unknown`

## Fire-and-Forget Send Channels (`ipcRenderer.send`)

- `window-minimize()`
- `window-maximize()`
- `window-close()`
- `open-external(url: string)`
- `renderer-ready()`
- `start-download()`
- `quit-and-install()`

## Main to Renderer Event Channels (`webContents.send`)

- `token-status: string`
- `update-available: UpdateAvailableInfo`
- `update-downloaded: void`
- `update-error: string`
- `update-progress: UpdateProgressInfo`
- `system-log: SystemLogEntry`

## Preload Surface (`window.api`)

The preload bridge exposes these grouped capabilities:

- stream/token actions
- account/settings/category DB operations
- driver bootstrap/check
- system path/performance helpers
- updater controls
- system log subscriptions and CRUD

Implementation file:

- `src/preload/index.ts`

## Contract Change Checklist

When adding/modifying IPC:

1. Update `channels.ts`.
2. Update `protocol.ts` (invoke/send/event maps).
3. Add/adjust payload types in `contracts.ts` or domain types.
4. Implement main feature handler.
5. Expose preload method.
6. Consume from renderer hook/page.
7. Run typecheck and tests.

