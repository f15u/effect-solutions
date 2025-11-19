---
title: Project Structure
description: "Recommended folder structure and organization patterns"
order: 8
draft: true
---

# Project Structure

## LLM Context Directory

For repos where you work with AI agents (Claude, Cursor, etc.), keep a dedicated `.context/` folder:

- **Track the folder** in git, but **ignore its contents**
- Clone reference repos here (Effect core, related libraries, etc.) for LLM traversal
- The LLM can read upstream code/docs without polluting your git history

### Setup Pattern

In `.gitignore`:
```gitignore
# Local LLM context (tracked folder, ignored contents)
.context/*
!.context/.gitkeep
```

In `CLAUDE.md` or `AGENTS.md`:
```markdown
## LLM Context Workspace

- This repo uses `.context/` for local reference clones
- Typical entries:
  - `effect` – main Effect repo
  - `effect-solutions` – best practices repo
  - Any app/stack-specific references
- Tell agents: "Additional code/docs live under `.context/`"
```

This keeps your workspace clean while giving agents access to upstream sources.

## TODO

- Document recommended folder structure for Effect projects
- Show where to place services, schemas, config, errors
- Monorepo vs single package organization
- Module boundaries and dependency direction
- Example structures for:
  - CLI apps
  - HTTP APIs
  - Libraries
  - Full-stack apps
