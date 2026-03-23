# User Guide

This guide covers the normal operator workflow inside the desktop app.

## System Requirements

- Windows 10/11
- Google Chrome installed (for browser capture mode)
- Stable internet connection

## Main Navigation

Sidebar sections:

- `Overview`: high-level status and quick actions
- `Broadcast Hub`: RTMP details and live controls
- `Metadata`: title/category/audience setup
- `Accounts`: token and account management
- `System Logs`: runtime logs
- `Settings`: environment, path, update, and diagnostics

## Recommended End-to-End Workflow

1. Open `Accounts` and load token (local extraction or browser capture).
2. Verify account status shows expected permissions.
3. Open `Metadata` and set stream title + category.
4. Open `Broadcast Hub` and initialize ingest.
5. Copy RTMP URL + Stream Key into OBS/encoder.
6. Start stream from encoder.
7. Monitor logs in `System Logs` and health in `Overview`.

## Accounts Page

Two capture modes:

- Local extraction:
  - scans local Streamlabs/browser storage for token.
- Browser capture:
  - starts Selenium flow and captures token from web login.

After token load:

- account is saved in local encrypted vault,
- app refreshes account info (`username`, permission status),
- active account can be switched or deleted.

## Metadata Page

Fields:

- `Live title`
- `Live category`
- `Audience` (mature content flag)

Behavior:

- category suggestions are searchable,
- category can be synchronized from remote to local cache,
- save validates that category exists in TikTok category list.

## Broadcast Hub Page

Actions:

- `Initialize ingest`: requests RTMP URL + key
- `End session`: ends current ingest stream
- copy buttons for URL/key

Precondition:

- valid token/account status
- title and category set in Metadata page

## System Logs Page

Features:

- view logs by level (`info/success/warn/error`)
- search messages
- paginate through logs
- clear logs
- export logs to `.log` file

## Settings Page

Capabilities:

- switch language (`vi`/`en`)
- switch theme (`dark`/`light`)
- choose custom profiles folder
- check or reinstall matching ChromeDriver
- check app updates
- inspect key system paths

## Chrome and Driver Behavior

If ChromeDriver is missing or outdated:

- app prompts to install a matching driver version.
- matching is based on local Chrome major version.

If Chrome is not installed:

- browser capture cannot run.
- install Chrome first, then retry driver bootstrap.

