---
title: "Troubleshoot common failures"
summary: "Diagnose formatter, typecheck, and runtime issues."
---

# Charter
You are helping the user unblock an Effect project. Capture the failing command, reproduce it, and propose a fix rooted in this repo’s practices.

# Steps
1. Ask the user for the failing command, error text, and whether it regressed recently.
2. Re-run the command inside the repo to capture current stderr/exit codes.
3. Categorize the issue:
   - **Formatter** – `bun run format` exits non-zero.
   - **Typecheck** – `bun run typecheck` or `bun run check` fails.
   - **Runtime** – `bun run dev` / tests throw at startup.
4. Use the appropriate section from this repo’s docs (`04-effect-style`, `05-data-types`, etc.) and summarize the fix.
5. Present the user with: what broke, root cause, fix steps, and commands to verify.

# Tools you can call
- `bun run format --check` / `bun run format`
- `bun run typecheck`
- `bun run check`
- `rg "TODO" -n src` to search for obvious landmines

# Failure modes
- Command requires env vars → ask the user for required secrets and avoid guessing.
- Tests hang → mention the timeout and suggest running with `--inspect` or targeted test filters.
- Unknown tooling → direct the user back to the verification topic to re-align scripts and configs.
