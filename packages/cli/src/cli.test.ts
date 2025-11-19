import { describe, expect, test } from "bun:test";
import { BunContext } from "@effect/platform-bun";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import { Effect } from "effect";
import { runCli } from "./cli";
import {
  REFERENCE_CONTENT,
  REFERENCE_FILES,
  SKILL_DOCUMENT,
} from "./reference-manifest";

const SKILL_TABLE_START = "<!-- SKILL_TABLE_START -->";
const SKILL_TABLE_END = "<!-- SKILL_TABLE_END -->";
const FRONT_MATTER_REGEX = /^---\n([\s\S]*?)\n---/;

const extractSkillTableEntries = () => {
  const start = SKILL_DOCUMENT.indexOf(SKILL_TABLE_START);
  const end = SKILL_DOCUMENT.indexOf(SKILL_TABLE_END);

  if (start === -1 || end === -1) {
    throw new Error("Skill table markers missing from SKILL.md");
  }

  const section = SKILL_DOCUMENT.slice(start + SKILL_TABLE_START.length, end)
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return section
    .filter((line) => line.startsWith("|") && !line.startsWith("| Reference"))
    .filter((line) => !line.startsWith("| ---"))
    .map((line) => {
      const match = line.match(/`references\/([^`]+)`/);
      if (!match) {
        throw new Error(`Unable to parse skill table line: ${line}`);
      }
      return match[1];
  });
};

const parseFrontMatter = (source) => {
  const match = source.match(FRONT_MATTER_REGEX);
  if (!match) {
    throw new Error("Reference file missing front matter");
  }

  const lines = match[1].split(/\r?\n/);
  return lines.reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return acc;
    }
    const [key, ...rest] = trimmed.split(":");
    if (!key || rest.length === 0) {
      return acc;
    }
    acc[key.trim()] = rest.join(":").trim().replace(/^"|"$/g, "");
    return acc;
  }, {} as Record<string, string>);
};

describe("effect-solutions CLI", () => {
  test("skill table stays in sync with reference manifest", () => {
    const tableEntries = extractSkillTableEntries();
    expect(tableEntries).toEqual([...REFERENCE_FILES]);
  });

  test("reference docs declare title and description front matter", () => {
    for (const file of REFERENCE_FILES) {
      const content = REFERENCE_CONTENT[file];
      const meta = parseFrontMatter(content);
      expect(meta.title?.length).toBeGreaterThan(0);
      expect(meta.description?.length).toBeGreaterThan(0);
    }
  });

  test("installs the skill locally using Effect temp directory", async () => {
    const effect = Effect.scoped(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const originalCwd = process.cwd();

        const tempRoot = yield* fs.makeTempDirectory({ prefix: "cli-test" });
        yield* Effect.addFinalizer(() =>
          fs.remove(tempRoot, { recursive: true }).pipe(Effect.ignore),
        );

        const projectDir = path.join(tempRoot, "project");
        yield* fs.makeDirectory(projectDir, { recursive: true });

        yield* Effect.acquireRelease(
          Effect.sync(() => {
            process.chdir(projectDir);
            return originalCwd;
          }),
          (previousCwd) => Effect.sync(() => process.chdir(previousCwd)),
        );

        yield* runCli(["bun", "effect-solutions", "install"]);

        const skillDir = path.join(
          projectDir,
          ".claude",
          "skills",
          "effect-solutions",
        );

        const skillFile = yield* fs.readFileString(
          path.join(skillDir, "SKILL.md"),
        );
        expect(skillFile).toBe(SKILL_DOCUMENT);

        for (const file of REFERENCE_FILES) {
          const content = yield* fs.readFileString(
            path.join(skillDir, "references", file),
          );
          expect(content).toBe(REFERENCE_CONTENT[file]);
        }
      }),
    ).pipe(Effect.provide(BunContext.layer));

    await Effect.runPromise(effect);
  });
});
