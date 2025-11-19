import { describe, expect, test } from "bun:test";
import { renderEntryDocument, renderTopicList, renderTopics } from "./cli";
import { TOPICS } from "./docs-manifest";

describe("effect-solutions CLI docs", () => {
  test("entry document greets humans and agents", () => {
    const entry = renderEntryDocument();
    expect(entry).toContain("Hello human");
    expect(entry).toContain("Hello agent");
    expect(entry).toContain("bunx effect-solutions list");
  });

  test("list output includes all topics", () => {
    const listOutput = renderTopicList();
    for (const topic of TOPICS) {
      expect(listOutput).toContain(topic.id);
      expect(listOutput).toContain(topic.title);
      expect(listOutput).toContain(topic.summary);
    }
  });

  test("show renders multiple topics in order", () => {
    const slice = TOPICS.slice(0, 2).map((topic) => topic.id);
    const output = renderTopics(slice);
    expect(output.indexOf(slice[0])).toBeLessThan(output.indexOf(slice[1]));
    expect(output).toContain(`(${slice[0]})`);
    expect(output).toContain(`(${slice[1]})`);
    expect(output).toContain("---");
  });

  test("show rejects unknown topics", () => {
    expect(() => renderTopics(["unknown-topic"])).toThrowError(
      /Unknown topic id/,
    );
  });
});
