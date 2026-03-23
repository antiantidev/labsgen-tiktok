# Testing Guide

## Test Stack

- Node built-in test runner (`node:test`)
- Assertions via `node:assert/strict`
- TypeScript execution with `--experimental-strip-types`

Run tests:

```bash
pnpm test
```

## Current Coverage Scope

Service-level unit tests under `src/main/services/*`:

- `chromeDriver.test.ts`
- `driverService.test.ts`
- `oauth.test.ts`
- `streamlabs.test.ts`
- `tokenService.test.ts`

These tests focus on:

- Chrome version and matching logic
- driver readiness edge cases
- oauth exchange and retry behavior
- stream service request behavior
- local token extraction behavior

## Type Safety Validation

```bash
pnpm typecheck
```

This runs:

- `typecheck:main`
- `typecheck:preload`
- `typecheck:renderer`

## Pre-PR Validation

Before opening a PR:

```bash
pnpm typecheck
pnpm test
pnpm build
```

## Writing New Tests

Guidelines:

- Prefer unit tests for pure service logic.
- Inject dependencies (fetch/fs/env/exec functions) when possible for deterministic behavior.
- Cover error branches in addition to success paths.

Template:

```ts
import test from "node:test"
import assert from "node:assert/strict"

test("behavior name", async () => {
  // arrange
  // act
  // assert
  assert.equal(true, true)
})
```

## Integration and Manual Validation

Automated tests do not fully replace runtime validation for:

- Electron window and tray behavior
- `better-sqlite3` native module compatibility
- Selenium browser automation flow
- installer/update behavior in packaged mode

Recommended manual checks after major changes:

1. `pnpm dev` boot and core flows.
2. driver bootstrap and token capture.
3. stream start/end flow.
4. logs and settings persistence.
5. packaged installer launch smoke test.

