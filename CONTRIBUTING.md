# Contributing Guide

Thanks for contributing to Labsgen Tiktok.

## Development Setup

Requirements:
- Node.js 22+
- pnpm 10+
- Windows 10/11 (for full Electron runtime behavior)

Setup:
```bash
corepack enable
pnpm install
pnpm dev
```

## Branching Strategy

- `main`: stable branch for release.
- Feature branches: `feat/<short-name>`
- Fix branches: `fix/<short-name>`
- Chore/refactor branches: `chore/<short-name>` or `refactor/<short-name>`

Examples:
- `feat/token-vault-search`
- `fix/chromedriver-version-match`

## Commit Convention

Use clear, scoped commit messages:
- `feat: add account search in token vault`
- `fix: match chromedriver major with installed chrome`
- `refactor: split app orchestration hooks`
- `docs: update ci and release flow`

## Pull Request Checklist

Before opening a PR, run:
```bash
pnpm run typecheck
pnpm test
pnpm run build
```

PR expectations:
- Keep changes focused and small when possible.
- Include a short summary of behavior changes.
- Add/update tests for affected logic.
- Include screenshots/GIFs for UI changes.

## Reporting Issues

- Use GitHub Issue templates for bug reports and feature requests.
- Include reproducible steps, app version, OS version, and logs for bug reports.
- Labels are auto-managed by `.github/workflows/labels.yml`.

## Label Strategy

- `type:*`: nature of work (`type:bug`, `type:feature`, `type:refactor`, `type:docs`, `type:chore`)
- `scope:*`: affected area (`scope:main`, `scope:preload`, `scope:renderer`, `scope:build-ci`, `scope:docs`)
- `priority:*`: urgency (`priority:high`, `priority:medium`, `priority:low`)
- `status:*`: execution state (`status:in-progress`, `status:blocked`, `status:ready`)
- `triage` / `needs-info`: intake and clarification labels

## Code Owners

- Code owner rules are defined in `.github/CODEOWNERS`.
- GitHub will auto-request review based on changed paths.
- If team ownership changes, update handles in `CODEOWNERS` first.

## CI and Release

Workflows:
- `.github/workflows/ci.yml`: runs on push and pull request.
- `.github/workflows/validate.yml`: shared reusable validation workflow.
- `.github/workflows/release.yml`: runs on release tags and publishes installer.

Release tag rule:
- Tag must match `package.json` version exactly in format `v<version>`.
- Example: package version `0.18.0` => tag `v0.18.0`.

Release steps:
```bash
# 1) bump version in package.json
# 2) update CHANGELOG.md
# 3) commit
git add .
git commit -m "release: v0.18.0"

# 4) tag and push
git tag v0.18.0
git push origin main --tags
```
