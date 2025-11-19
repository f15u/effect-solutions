---
title: Repo Setup
description: "Install the Effect Language Service and strict project defaults"
order: 1
---

# Repo Setup

This guide covers:
1. Effect Language Service - Editor diagnostics & build-time type checking
2. TypeScript Configuration - Strict settings for Effect projects

For a well-configured Effect repository, install the Effect Language Service and configure TypeScript for optimal development experience.

## Effect Language Service

The Effect Language Service provides editor diagnostics and compile-time type checking. This guide covers installation and setup.

### Installation

```bash
bun add -d @effect/language-service
```

Add the plugin to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "@effect/language-service"
      }
    ]
  }
}
```

### VS Code Setup

For VS Code or any VS Code fork (Cursor, etc.):

1. Add to `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "./node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

2. Press F1 → "TypeScript: Select TypeScript version"
3. Choose "Use workspace version"

### Enable Build-Time Diagnostics

Patch TypeScript to get Effect diagnostics during compilation:

```bash
bunx effect-language-service patch
```

Add to `package.json` to persist across installs:

```json
{
  "scripts": {
    "prepare": "effect-language-service patch"
  }
}
```

**Full guide:** [Effect Language Service](https://github.com/Effect-TS/language-service)

## Claude Code MCP Setup

Enable Effect documentation access in Claude Code via MCP servers:

### 1. Effect Documentation Server

Install tim-smart's effect-mcp server for Effect docs access:

```bash
claude mcp add-json effect-docs '{
  "command": "npx",
  "args": ["-y", "effect-mcp@latest"],
  "env": {}
}' -s user
```

This adds Effect's reference docs and website content searchable by your agent.

**Repository:** [tim-smart/effect-mcp](https://github.com/tim-smart/effect-mcp)

### 2. Clone Effect Repository

Give your agent direct codebase access by cloning Effect locally:

```bash
git clone https://github.com/Effect-TS/effect.git
```

This allows deep exploration of Effect internals, implementation patterns, and source examples.

## TypeScript Configuration

Effect projects benefit from strict TypeScript configuration for safety and performance.

**See:** [TypeScript Configuration Guide](./02-tsconfig.md)

Reference configuration from Effect v4:
[effect-smol tsconfig.base.jsonc](https://github.com/Effect-TS/effect-smol/blob/main/tsconfig.base.jsonc)
