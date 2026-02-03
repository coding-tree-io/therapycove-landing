# Git Hooks

This project uses version-controlled hooks stored in `.githooks`.

## Setup

Run the setup script once to point Git at this directory:

```pwsh
pwsh ./scripts/setup-git-hooks.ps1
```

## Pre-commit

The pre-commit hook ensures the CSS bundle is regenerated and committed.
