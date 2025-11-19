import ENTRY_DOC from "../resources/entry.md" with { type: "text" };
import TOPIC__01_ONBOARDING from "../resources/topics/01-onboarding.md" with { type: "text" };
import TOPIC__02_VERIFICATION from "../resources/topics/02-verification.md" with { type: "text" };
import TOPIC__03_TROUBLESHOOTING from "../resources/topics/03-troubleshooting.md" with { type: "text" };
import TOPIC__04_QUESTIONS from "../resources/topics/04-questions.md" with { type: "text" };

const FRONT_MATTER_REGEX = /^---\n([\s\S]*?)\n---\n?/;

type TopicId =
  | "01-onboarding"
  | "02-verification"
  | "03-troubleshooting"
  | "04-questions";

type TopicMeta = {
  readonly id: TopicId;
  readonly title: string;
  readonly summary: string;
  readonly body: string;
};

type RawTopic = {
  readonly id: TopicId;
  readonly source: string;
};

const RAW_TOPICS: ReadonlyArray<RawTopic> = [
  { id: "01-onboarding", source: TOPIC__01_ONBOARDING },
  { id: "02-verification", source: TOPIC__02_VERIFICATION },
  { id: "03-troubleshooting", source: TOPIC__03_TROUBLESHOOTING },
  { id: "04-questions", source: TOPIC__04_QUESTIONS },
];

const parseFrontMatter = (source: string) => {
  const match = source.match(FRONT_MATTER_REGEX);
  if (!match) {
    throw new Error("Topic is missing front matter");
  }

  const lines = match[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const data: Record<string, string> = {};
  for (const line of lines) {
    const [key, ...rest] = line.split(":");
    if (!key || rest.length === 0) {
      continue;
    }
    data[key.trim()] = rest.join(":").trim().replace(/^"|"$/g, "");
  }

  return data;
};

const stripFrontMatter = (source: string) =>
  source.replace(FRONT_MATTER_REGEX, "").trimStart();

const parseTopics = (): ReadonlyArray<TopicMeta> =>
  RAW_TOPICS.map(({ id, source }) => {
    const meta = parseFrontMatter(source);
    const title = meta.title;
    const summary = meta.summary;

    if (!title || !summary) {
      throw new Error(`Topic ${id} missing title or summary`);
    }

    return {
      id,
      title,
      summary,
      body: stripFrontMatter(source).trimEnd(),
    } as const;
  });

export const ENTRY = ENTRY_DOC.trim();

export const TOPICS = parseTopics();

export const TOPIC_LOOKUP: Record<TopicId, TopicMeta> = TOPICS.reduce(
  (acc, topic) => {
    acc[topic.id] = topic;
    return acc;
  },
  {} as Record<TopicId, TopicMeta>,
);
