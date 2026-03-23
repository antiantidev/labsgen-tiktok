# Troubleshooting

## 1) `better-sqlite3` ABI mismatch

Symptom:

- `compiled against a different Node.js version`
- `NODE_MODULE_VERSION XXX` mismatch at app startup

Cause:

- native module built for different Node/Electron ABI.

Fix:

```bash
pnpm install
pnpm exec electron-rebuild -f -w better-sqlite3
```

If still failing:

```bash
Remove-Item -Recurse -Force node_modules
pnpm install
pnpm exec electron-rebuild -f -w better-sqlite3
```

## 2) ChromeDriver version mismatch with local Chrome

Symptom:

- `session not created: This version of ChromeDriver only supports Chrome version ...`

Fix in app:

1. Open `Settings`.
2. Run `Download Matching Driver` or `Refresh Driver`.

Manual fix:

```bash
pnpm setup:chromedriver
```

Notes:

- matching logic uses Chrome major version and Chrome for Testing manifest.

## 3) Chrome not found

Symptom:

- driver bootstrap returns `CHROME_NOT_FOUND`
- browser capture unavailable

Fix:

- install Google Chrome,
- then rerun driver bootstrap.

Optional override:

- set `CHROME_PATH` to full `chrome.exe` location.

## 4) App load error: `Cannot find module 'ms'`

Symptom:

- packaged app throws missing module error in main process stack.

Cause:

- dependency not included in packaged output or install state inconsistent.

Fix:

1. Ensure `ms` exists in `dependencies` (not only `devDependencies`).
2. Reinstall and rebuild:

```bash
pnpm install
pnpm build
pnpm exec electron-builder --win nsis --x64
```

3. Reinstall generated installer and retry.

## 5) `Cannot find module '../../../services/streamlabs'` in dist

Symptom:

- startup fails after refactor/build when dist references removed JS paths.

Cause:

- stale/dist cache or outdated dynamic imports to old path layout.

Fix:

1. confirm imports use current TS modules (`src/main/services/*.ts`).
2. clean and rebuild:

```bash
Remove-Item -Recurse -Force dist
pnpm build
```

3. run app again.

## 6) Update check errors in dev

Symptom:

- update checks fail during local development.

Explanation:

- `check-for-updates` returns `devMode: true` when app is not packaged.

Action:

- expected behavior; verify updater flow on packaged builds/tags.

## 7) Local token extraction returns no token

Checks:

- user is logged into Streamlabs or compatible browser profile,
- app has permission to read local storage directories,
- token exists in `.log`/`.ldb` files under expected LevelDB locations.

Fallback:

- use browser capture mode instead of local extraction.

## 8) Corrupted or unreadable Vietnamese text in locale files

Symptom:

- mojibake-like text in `vi.json` or UI labels.

Fix:

- ensure locale files are saved as UTF-8 without broken conversion,
- avoid mixed encodings in editor/terminal pipeline.

## 9) CI fails with `Unable to locate executable file: pnpm`

Fix:

- in workflow, install pnpm before `setup-node` cache step:
  - use `pnpm/action-setup@v4`
  - specify `version` (aligned with `packageManager` in `package.json`)

This repo already applies this pattern in `validate.yml` and `release.yml`.

