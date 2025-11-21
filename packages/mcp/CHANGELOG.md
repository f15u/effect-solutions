# effect-solutions-mcp

## 0.3.0

### Minor Changes

- [`0235cf2`](https://github.com/kitlangton/effect-solutions/commit/0235cf2e51024ac205a5a6d70b405dcefdd524aa) Thanks [@kitlangton](https://github.com/kitlangton)! - Comprehensive feature updates across all packages

  **Website**

  - Add OG image generation via Playwright for social sharing
  - Refactor LLM instructions to shared lib
  - Add route groups for better Next.js organization
  - Update docs content

  **CLI**

  - Add update notifier with daily version checks
  - Add open-issue command for GitHub issue creation
  - Support multiple browser opening strategies

  **MCP Server**

  - Add comprehensive test suite for all tools
  - Refactor for improved testability
  - Add vitest dependency

## 0.2.1

### Patch Changes

- 243af14: Remove server-minimal.ts and streamline MCP server implementation

## 0.2.0

### Minor Changes

- Add get_help tool with comprehensive MCP usage guide

  New get_help tool provides:

  - Complete MCP server usage documentation
  - Tool descriptions and examples (search_effect_solutions, open_issue, get_help)
  - Available resources guide (effect-docs:// scheme)
  - Recommended workflow for Effect tasks
  - Best practices and common pitfalls
  - Effect repository setup instructions
  - Quick reference table for common operations

  Helps AI models understand how to use the MCP server effectively before performing Effect-related tasks.

## 0.1.3

### Patch Changes

- aa6efbd: Add new documentation topics (HTTP clients, testing with Vitest, observability), publish MCP server, and improve UI animations. All bunx commands now use @latest suffix for consistency.

## 0.1.2

### Patch Changes

- - Read version from package.json instead of hardcoding
  - Fix MCP resource URI pattern to match docs/\* scheme

## 0.1.1

### Patch Changes

- Initial release with documentation CLI and MCP server
