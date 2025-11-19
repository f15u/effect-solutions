---
title: "Verify an existing Effect repo"
summary: "Confirm the workspace already matches Effect best practices."
---

# Charter
You are validating that the current repository is wired for Effect: configs exist, scripts run, and required packages are present.

# Steps
1. Ask the user what “ready” means for them (tests passing, linters clean, deployable, etc.).
2. Inspect key files:
   - `ls effect.config.ts tsconfig.base.json` – both should exist.
   - `cat package.json` – confirm `name`, `workspaces`, and scripts such as `check`, `typecheck`, `format`.
3. Run health commands:
   - `bun run check` – ensures formatting + typechecking succeed.
   - `bun run typecheck` if they want types only.
   - `bun run format --check` (or formatter equivalent) to ensure deterministic style.
4. Verify dependencies:
   - `rg "@effect/" package.json` – required runtime + platform packages installed.
   - `rg "@effect/language-service" package.json` – dev tooling present.
5. Summarize findings with explicit pass/fail notes and next steps for any missing items.

# Tools you can call
- `bun run check`
- `bun run typecheck`
- `rg <pattern> package.json`
- `ls` / `stat` to confirm files exist

# Failure modes
- Scripts missing: offer the snippet to add them instead of failing silently.
- Commands fail: capture stderr, include exit code, and link the relevant troubleshooting topic before retrying anything destructive.
- Repo uses a custom layout: ask the user where Effect code lives and adjust file checks accordingly.
