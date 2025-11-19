name: Effect Solutions
description: Guide for building robust Effect TypeScript applications. Use when setting up Effect projects, configuring TypeScript, choosing data types, handling errors, or applying Effect service patterns. Critical for ensuring type-safe Effect code and avoiding common pitfalls.
---

# Effect Solutions

This skill provides comprehensive guidance for building production-ready applications using Effect TypeScript.

## When to Use This Skill

Use this skill when:
- Setting up a new Effect TypeScript project
- Implementing error handling with Effect
- Configuring TypeScript for optimal Effect development
- Choosing appropriate Effect data types and structures
- Following Effect best practices and patterns
- Troubleshooting Effect-related type errors

## How to Use This Skill

### Reference Documentation

The CLI packages the entire `packages/website/references/` tree, so every markdown file ships with the skill. This table is generated automatically—run `node scripts/update-reference-manifest.mjs` after adding or renaming references.

<!-- SKILL_TABLE_START -->

| Reference | Summary |
| --- | --- |
| **Overview** (`references/00-index.md`) | Map of all Effect Solutions references with quick links |
| **Repo Setup** (`references/01-repo-setup.md`) | Install the Effect Language Service and strict project defaults |
| **TypeScript Config** (`references/02-tsconfig.md`) | Recommended TypeScript compiler settings tuned for Effect |
| **Services & Layers** (`references/03-services-and-layers.md`) | Context.Tag and Layer patterns for dependency injection |
| **Effect Style** (`references/04-effect-style.md`) | Coding conventions for Effect.fn, Effect.gen, and imports |
| **Data Types** (`references/05-data-types.md`) | Schema classes, unions, brands, and JSON serialization |
| **Error Handling** (`references/06-error-handling.md`) | Schema.TaggedError modeling, pattern matching, and defects |
| **Configuration** (`references/07-config.md`) | Effect Config usage, providers, and Live/Test layers |

<!-- SKILL_TABLE_END -->

### Workflow

1. Identify the specific area (setup, error handling, data, config, etc.)
2. Read the relevant reference document from `references/`
3. Apply the patterns and guidance to the codebase
4. Verify type safety and best practice compliance, then rerun `effect-solutions` if distributing to Claude Code

## Key Principles

- Type safety first - leverage Effect's type system fully
- Explicit error handling - use Effect's error channels
- Composition over inheritance - build with Effect's combinators
- Resource safety - use Effect's resource management primitives
