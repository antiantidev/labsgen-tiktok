# CI and Release

## Workflow Overview

The repository uses these GitHub Actions workflows:

- `.github/workflows/ci.yml`
- `.github/workflows/validate.yml`
- `.github/workflows/release.yml`
- `.github/workflows/labels.yml`

## `validate.yml` (Reusable)

Purpose:

- shared validation pipeline called by CI and Release.

Current steps:

1. checkout
2. setup pnpm
3. setup Node (with pnpm cache)
4. install (`pnpm install --frozen-lockfile`)
5. typecheck
6. test
7. optional build

## `ci.yml`

Trigger:

- push to branches (`tags-ignore: v*`)
- pull requests

Behavior:

- calls reusable `validate.yml` with:
  - Node `22`
  - pnpm `10.32.1`
  - `run_build: true`

## `release.yml`

Trigger:

- push tags matching `v*`

Flow:

1. run `validate.yml` (`run_build: false`)
2. install dependencies
3. verify tag matches `package.json` version
4. run `pnpm run release` (build + publish)

Publish provider:

- GitHub Releases via `electron-builder`

## Tag and Version Rule

Tag must exactly match package version:

- package version `0.19.0` -> tag `v0.19.0`

Mismatch fails release workflow.

## Release Procedure

```bash
# 1) bump version
# 2) update changelog/docs if needed
git add .
git commit -m "release: vX.Y.Z"

# 3) tag and push
git tag vX.Y.Z
git push origin main --tags
```

## Required Secrets and Tokens

- `GITHUB_TOKEN` is used by release workflow for publish.
- local/manual release commands may require `GH_TOKEN` in environment.

## Labels Automation

`labels.yml`:

- syncs label catalog,
- auto-labels issues and pull requests by title/content/file scope.

This improves triage and tracking for:

- `type:*`
- `scope:*`
- `priority:*`
- `status:*`
