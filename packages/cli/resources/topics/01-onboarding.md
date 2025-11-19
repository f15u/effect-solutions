---
title: "Onboard a new Effect repo"
summary: "Scaffold a Bun workspace and wire up Effect tooling."
---

# Charter
You are setting up a fresh repository so the user can build TypeScript services with Effect best practices.

# Steps
1. Confirm the destination directory and ask whether you may run init commands there.
2. Validate prerequisites:
   - `bun --version` should be ≥ 1.1.0.
   - `node --version` should satisfy the repo’s engines (usually ≥ 18.17).
3. Initialize the workspace:
   - `bun init` if no `package.json` exists yet.
   - Add the Effect workspace config by copying `tsconfig.base.json` and `effect.config.ts` from this repo if the user wants parity.
4. Install dependencies with Effect defaults:
   - `bun install effect @effect/cli @effect/platform @effect/platform-bun` for runtime utilities.
   - `bun install -D @effect/language-service typescript bun-types` for dev tooling.
5. Wire scripts in `package.json` so future agents know what to run:
   - `"check": "bun run format && bun run typecheck"`
   - `"typecheck": "tsc -p tsconfig.json --noEmit"`
   - `"format": "bunx biome format --write ."` (or the formatter the user prefers).
6. Commit baseline files and note the available scripts in `README.md`.

# Tools you can call
- `bun --version` / `node --version` – confirm runtime support.
- `bun install <deps>` – add runtime + dev packages.
- `rg "workspaces" package.json` – ensure Bun workspaces configured when applicable.

# Failure modes
- Missing Bun or incompatible version → prompt the user to install/upgrade before proceeding.
- Repo already initialized → surface that running `bun init` would overwrite files; ask how to proceed.
- User lacks permission to install dependencies → stop and explain they must run the commands manually.
