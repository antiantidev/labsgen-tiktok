---
name: code-change-governance
description: Guidelines for semantic versioning (SemVer) and git commit best practices. Applied when code is modified, features are added, or bugs are fixed. Helps maintain clear version history and traceable changes.
---

# Code Change Governance Guidelines

This document provides **best practice guidelines** for AI when **fixing bugs, refactoring, adding features, changing logic, UI, config, or any part of the codebase**.

## Objectives

- Maintain **clear code history through proper documentation**
- Recommend appropriate version bumps
- Provide well-structured commit messages for developers to use
- Enable traceable change management

---

## 1. AI Workflow Principles

When making code changes, AI **SHOULD**:

1. **Make the requested code changes**
2. **Determine appropriate version bump** (based on SemVer rules below)
3. **Generate a clear commit message** (following format below)
4. **Provide git commands** for the developer to execute

**Note:** AI provides recommendations and prepares commands - the developer executes them.

👉 Apply these guidelines for:

- Bug fixes
- New features
- Refactoring
- UI/UX changes
- Configuration updates
- Dependency changes

---

## 2. Semantic Versioning (SemVer) Guidelines

Format: `MAJOR.MINOR.PATCH`

AI should recommend version bumps based on change type:

### 2.1 PATCH (x.x.PATCH)

Recommend for:

- Bug fixes
- Minor UI adjustments
- Performance optimizations
- Code refactoring (no behavior change)
- Documentation updates
- Internal code cleanup

**Example:** `1.2.3` → `1.2.4`

### 2.2 MINOR (x.MINOR.x)

Recommend for:

- New features (backward compatible)
- New API endpoints
- New configuration options
- Feature enhancements
- New UI components

**Example:** `1.2.3` → `1.3.0`

### 2.3 MAJOR (MAJOR.x.x)

Recommend for:

- Breaking changes
- API changes (not backward compatible)
- Major architecture changes
- Removal of deprecated features
- Database schema breaking changes

**Example:** `1.2.3` → `2.0.0`

---

## 3. Commit Message Format

AI should generate commit messages following this structure:

```
<type>(<scope>): <clear, concise description>

- What: exact description of changes made
- Why: reason for the change
- Impact: affected modules/features/UI
```

---

### 3.1 Commit Types

Choose the appropriate type:

- `fix`: Bug fix
- `feat`: New feature
- `refactor`: Code restructuring (no behavior change)
- `perf`: Performance improvement
- `style`: UI/CSS/formatting changes
- `chore`: Build, config, dependencies
- `docs`: Documentation only
- `test`: Adding/updating tests

### 3.2 Scope (Optional but Recommended)

Specify the affected area:

Examples: `auth`, `database`, `ui`, `api`, `config`, `license`, `updater`

### 3.3 Description Guidelines

- **≤ 72 characters**
- **Present tense** ("add" not "added")
- Describe the change clearly

❌ Avoid:

```
fix bug
update stuff
changes
```

✅ Good:

```
fix(auth): prevent crash when token is missing
feat(updater): add automatic version checking
refactor(database): extract connection manager to singleton
```

---

### 3.4 Commit Body Format

Include details to help developers understand:

```
<type>(<scope>): <description>

- What: List specific files/functions changed
- Why: Explain the problem or need
- Impact: Describe user/system effects
```

**Example:**

```
fix(auth): prevent crash when token is missing

- What: Add null-check in AuthMiddleware.validate() and add fallback to guest mode
- Why: App crashes on first launch when no token exists in localStorage
- Impact: Prevents crash, allows first-time users to access app
```

---

## 4. Practical Implementation

After making code changes, AI should provide:

### 4.1 Version Recommendation

```
Recommended version bump: 1.2.3 → 1.2.4 (PATCH)
Reason: Bug fix without new features or breaking changes
```

### 4.2 Generated Commit Message

```
fix(auth): prevent crash when token is missing

- What: Add null-check in AuthMiddleware.validate() and add fallback to guest mode
- Why: App crashes on first launch when no token exists in localStorage
- Impact: Prevents crash, allows first-time users to access app
```

### 4.3 Git Command Suggestions

```bash
# Update version in package.json (or relevant config file)
# Then commit and push:

git add .
git commit -m "fix(auth): prevent crash when token is missing

- What: Add null-check in AuthMiddleware.validate() and add fallback to guest mode
- Why: App crashes on first launch when no token exists in localStorage
- Impact: Prevents crash, allows first-time users to access app"

git push origin main
```

---

## 5. Best Practices

### 5.1 One Commit = One Purpose

- Each commit should address **one specific change**
- For large tasks, recommend multiple commits
- Keep changes focused and atomic

✅ Good separation:

```
Commit 1: fix(auth): add null-check for missing token
Commit 2: feat(auth): implement remember-me functionality
Commit 3: test(auth): add unit tests for auth flow
```

❌ Bad (too broad):

```
Commit 1: update authentication system
```

### 5.2 Commit Type → Version Mapping

| Change Type              | Commit Type        | Version Bump |
| ------------------------ | ------------------ | ------------ |
| Bug fix                  | fix                | PATCH        |
| Performance improvement  | perf               | PATCH        |
| UI/style update          | style              | PATCH        |
| Refactor (no breaking)   | refactor           | PATCH        |
| New feature (compatible) | feat               | MINOR        |
| Breaking change          | feat/refactor/fix! | MAJOR        |
| Docs/tests/chores        | docs/test/chore    | (optional)   |

**Note:** Use `!` suffix for breaking changes (e.g., `feat!`, `refactor!`)

---

## 6. AI Response Template

When completing code changes, AI should structure responses as:

```
## Changes Made

[Description of changes]

## Files Modified

- `src/auth/middleware.js` - Added null-check
- `src/auth/index.js` - Updated error handling
- `package.json` - Version bump

## Version Recommendation

Current: 1.2.3
Recommended: 1.2.4
Reason: Bug fix (PATCH increment)

## Suggested Commit Message

fix(auth): prevent crash when token is missing

- What: Add null-check in AuthMiddleware.validate() and fallback to guest mode
- Why: App crashes on first launch when no token exists in localStorage
- Impact: Prevents crash, allows first-time users to access app

## Git Commands

# Update version in package.json first, then:
git add .
git commit -m "fix(auth): prevent crash when token is missing

- What: Add null-check in AuthMiddleware.validate() and fallback to guest mode
- Why: App crashes on first launch when no token exists in localStorage
- Impact: Prevents crash, allows first-time users to access app"

git push origin main
```

---

## 7. Common Scenarios

### Scenario 1: Bug Fix

```
Type: fix
Scope: Affected module
Version: PATCH bump
Example: fix(payment): handle null response from payment gateway
```

### Scenario 2: New Feature

```
Type: feat
Scope: Feature area
Version: MINOR bump
Example: feat(export): add PDF export functionality
```

### Scenario 3: Breaking Change

```
Type: feat! or refactor!
Scope: Affected area
Version: MAJOR bump
Example: feat!(api)!: change authentication from JWT to OAuth2
```

### Scenario 4: Refactoring

```
Type: refactor
Scope: Refactored module
Version: PATCH bump
Example: refactor(database): extract connection logic to singleton
```

---

## 8. Quality Checklist

Before finalizing recommendations, AI should verify:

- ✅ Commit message is clear and descriptive
- ✅ Version bump follows SemVer rules
- ✅ "What/Why/Impact" are all addressed
- ✅ Scope matches the changed files
- ✅ Type matches the nature of change
- ✅ No vague terms like "update", "fix stuff"
- ✅ Changes are focused on single purpose

---

## 9. Notes for Developers

- **AI provides recommendations** - you make the final decision
- **Review version bumps** - adjust if needed for your release strategy
- **Customize commit messages** - add project-specific context
- **Adapt git commands** - match your branch naming and workflow

---

## 10. Applicability

This skill applies when:

- Making code changes of any kind
- Fixing bugs or issues
- Adding new features
- Refactoring existing code
- Updating dependencies or configurations
- Any modification that will be committed to version control

**Goal:** Help maintain clean, traceable project history through consistent versioning and clear commit messages.
