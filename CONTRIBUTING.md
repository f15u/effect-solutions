# Contributing

## Quick Fixes (typos, code samples, clarity)

Open a PR directly—we'll review fast.

## Content Requests & Issues

Before spending significant time on new topics or major rewrites, **open an issue first** to discuss:

- Missing/wrong information
- New topics to cover
- Architectural changes

This saves everyone time and ensures alignment with the project's goals.

## Exploiting Cunningham's Law

This is a living document that intentionally posts "wrong answers" to get better ones. Disagree? Great—open an issue or PR with your reasoning.

## Development Workflow

1. Fork and clone the repo
2. Create a feature branch
3. Make your changes
4. Run `bun run check` and `bun test`
5. Create a changeset: `bun scripts/changeset-named.ts "description"`
6. Submit a PR

For documentation changes:
- Edit files in `packages/website/docs/`
- Follow existing patterns and tone
- Keep examples concise and practical
- Test locally with `bun run dev`
