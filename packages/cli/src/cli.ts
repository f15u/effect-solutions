#!/usr/bin/env bun

import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Console, Effect, pipe } from "effect";
import { Args, Command } from "@effect/cli";
import { ENTRY, TOPIC_LOOKUP, TOPICS } from "./docs-manifest";

const CLI_NAME = "effect-solutions";
const CLI_VERSION = "0.2.0";

const isTopicId = (value: string): value is keyof typeof TOPIC_LOOKUP =>
  value in TOPIC_LOOKUP;

export const renderEntryDocument = () => `${ENTRY}\n`;

const formatRow = (idWidth: number, titleWidth: number) =>
  (id: string, title: string, summary: string) =>
    `${id.padEnd(idWidth)}  ${title.padEnd(titleWidth)}  ${summary}`;

export const renderTopicList = () => {
  const idWidth = Math.max("ID".length, ...TOPICS.map((topic) => topic.id.length));
  const titleWidth = Math.max(
    "Title".length,
    ...TOPICS.map((topic) => topic.title.length),
  );

  const format = formatRow(idWidth, titleWidth);
  const header = format("ID", "Title", "Summary");
  const separator = `${"-".repeat(idWidth)}  ${"-".repeat(titleWidth)}  ${"-".repeat(20)}`;

  const lines = [header, separator, ...TOPICS.map((topic) =>
    format(topic.id, topic.title, topic.summary))];

  return `${lines.join("\n")}\n`;
};

export const renderTopics = (requested: ReadonlyArray<string>) => {
  const ids = requested.map((id) => id.trim()).filter(Boolean);

  if (ids.length === 0) {
    throw new Error("Please provide at least one topic id.");
  }

  const unknown = ids.filter((id) => !isTopicId(id));
  if (unknown.length > 0) {
    throw new Error(`Unknown topic id(s): ${unknown.join(", ")}`);
  }

  const uniqueIds = Array.from(new Set(ids));
  const blocks = uniqueIds.map((id) => {
    const topic = TOPIC_LOOKUP[id];
    return [`## ${topic.title} (${topic.id})`, "", topic.body.trim()]
      .filter(Boolean)
      .join("\n");
  });

  return `${blocks.join("\n\n---\n\n")}\n`;
};

const printEntryDocument = Console.log(renderEntryDocument());

const listTopics = Console.log(renderTopicList());

const showTopics = (topics: ReadonlyArray<string>) =>
  Effect.try({
    try: () => renderTopics(topics),
  }).pipe(Effect.flatMap((output) => Console.log(output)));

const listCommand = Command.make("list").pipe(
  Command.withDescription("List Effect Solutions documentation topics"),
  Command.withHandler(() => listTopics),
);

const showCommand = Command.make("show", {
  topics: Args.text({ name: "topic-id" }).pipe(Args.atLeast(1)),
}).pipe(
  Command.withDescription("Show one or more Effect Solutions topics"),
  Command.withHandler(({ topics }) => showTopics(topics)),
);

export const cli = Command.make(CLI_NAME).pipe(
  Command.withDescription("Effect Solutions CLI"),
  Command.withHandler(() => printEntryDocument),
  Command.withSubcommands([listCommand, showCommand]),
);

export const runCli = (argv: ReadonlyArray<string>) =>
  Command.run(cli, {
    name: CLI_NAME,
    version: CLI_VERSION,
  })(argv);

if (import.meta.main) {
  pipe(
    runCli(process.argv),
    Effect.provide(BunContext.layer),
    BunRuntime.runMain,
  );
}
