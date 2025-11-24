import { describe, it } from "@effect/vitest";
import { deepStrictEqual, strictEqual } from "@effect/vitest/utils";
import { Context, Effect, Layer } from "effect";

describe("04-services-and-layers", () => {
  describe("Service Definition", () => {
    it.effect("defines service with Context.Tag", () =>
      Effect.gen(function* () {
        class Database extends Context.Tag("@app/Database")<
          Database,
          {
            readonly query: (sql: string) => Effect.Effect<unknown[]>;
            readonly execute: (sql: string) => Effect.Effect<void>;
          }
        >() {}

        class Logger extends Context.Tag("@app/Logger")<
          Logger,
          {
            readonly log: (message: string) => Effect.Effect<void>;
          }
        >() {}

        // Test implementations
        const testDb = Layer.succeed(Database, {
          query: (_sql) => Effect.succeed([{ id: 1 }]),
          execute: (_sql) => Effect.void,
        });

        const testLogger = Layer.succeed(Logger, {
          log: (_msg) => Effect.void,
        });

        const program = Effect.gen(function* () {
          const db = yield* Database;
          const logger = yield* Logger;

          yield* logger.log("Querying database");
          const results = yield* db.query("SELECT * FROM users");
          return results;
        });

        const result = yield* program.pipe(
          Effect.provide(Layer.merge(testDb, testLogger)),
        );

        deepStrictEqual(result, [{ id: 1 }]);
      }),
    );
  });

  describe("Layer Implementation", () => {
    it.effect("creates layer with Layer.effect", () =>
      Effect.gen(function* () {
        class Config extends Context.Tag("@app/Config")<
          Config,
          { readonly apiUrl: string }
        >() {}

        class Api extends Context.Tag("@app/Api")<
          Api,
          { readonly fetch: (path: string) => Effect.Effect<string> }
        >() {
          static readonly layer = Layer.effect(
            Api,
            Effect.gen(function* () {
              const config = yield* Config;

              const fetch = (path: string) =>
                Effect.succeed(`${config.apiUrl}${path}`);

              return Api.of({ fetch });
            }),
          );
        }

        const testConfig = Layer.succeed(Config, {
          apiUrl: "https://api.test.com",
        });

        const program = Effect.gen(function* () {
          const api = yield* Api;
          return yield* api.fetch("/users");
        });

        const result = yield* program.pipe(
          Effect.provide(Api.layer),
          Effect.provide(testConfig),
        );

        strictEqual(result, "https://api.test.com/users");
      }),
    );

    it.effect("composes layers with dependencies", () =>
      Effect.gen(function* () {
        class Logger extends Context.Tag("@app/Logger")<
          Logger,
          { readonly log: (msg: string) => Effect.Effect<void> }
        >() {}

        class Analytics extends Context.Tag("@app/Analytics")<
          Analytics,
          { readonly track: (event: string) => Effect.Effect<void> }
        >() {
          static readonly layer = Layer.effect(
            Analytics,
            Effect.gen(function* () {
              const logger = yield* Logger;

              const track = (event: string) =>
                Effect.gen(function* () {
                  yield* logger.log(`Tracking: ${event}`);
                });

              return Analytics.of({ track });
            }),
          );
        }

        const events: string[] = [];
        const testLogger = Layer.succeed(Logger, {
          log: (msg) =>
            Effect.sync(() => {
              events.push(msg);
            }),
        });

        const program = Effect.gen(function* () {
          const analytics = yield* Analytics;
          yield* analytics.track("user.login");
          yield* analytics.track("page.view");
        });

        yield* program.pipe(
          Effect.provide(Analytics.layer),
          Effect.provide(testLogger),
        );

        strictEqual(events.length, 2);
        strictEqual(events[0], "Tracking: user.login");
        strictEqual(events[1], "Tracking: page.view");
      }),
    );
  });

  describe("Test Implementations", () => {
    it.effect("creates test layer with Layer.sync", () =>
      Effect.gen(function* () {
        class Database extends Context.Tag("@app/Database")<
          Database,
          {
            readonly query: (sql: string) => Effect.Effect<unknown[]>;
            readonly execute: (sql: string) => Effect.Effect<void>;
          }
        >() {
          static readonly testLayer = Layer.sync(Database, () => {
            const records: Record<string, unknown> = {
              "user-1": { id: "user-1", name: "Alice" },
              "user-2": { id: "user-2", name: "Bob" },
            };

            return Database.of({
              query: (sql) => {
                if (sql.includes("user-1")) {
                  return Effect.succeed([records["user-1"]]);
                }
                return Effect.succeed(Object.values(records));
              },
              execute: (_sql) => Effect.void,
            });
          });
        }

        const program = Effect.gen(function* () {
          const db = yield* Database;
          const results = yield* db.query(
            "SELECT * FROM users WHERE id = 'user-1'",
          );
          return results;
        });

        const result = yield* program.pipe(Effect.provide(Database.testLayer));

        strictEqual(result.length, 1);
        deepStrictEqual(result[0], { id: "user-1", name: "Alice" });
      }),
    );

    it.effect("uses Layer.succeed for simple mocks", () =>
      Effect.gen(function* () {
        class EmailService extends Context.Tag("@app/EmailService")<
          EmailService,
          { readonly send: (to: string, body: string) => Effect.Effect<void> }
        >() {}

        const sentEmails: Array<{ to: string; body: string }> = [];

        const testEmailService = Layer.succeed(EmailService, {
          send: (to, body) =>
            Effect.sync(() => {
              sentEmails.push({ to, body });
            }),
        });

        const program = Effect.gen(function* () {
          const email = yield* EmailService;
          yield* email.send("alice@test.com", "Hello Alice");
          yield* email.send("bob@test.com", "Hello Bob");
        });

        yield* program.pipe(Effect.provide(testEmailService));

        strictEqual(sentEmails.length, 2);
        strictEqual(sentEmails[0].to, "alice@test.com");
        strictEqual(sentEmails[1].to, "bob@test.com");
      }),
    );
  });

  describe("Service Composition", () => {
    it.effect("merges independent layers", () =>
      Effect.gen(function* () {
        class ServiceA extends Context.Tag("@app/ServiceA")<
          ServiceA,
          { readonly getValue: () => Effect.Effect<string> }
        >() {}

        class ServiceB extends Context.Tag("@app/ServiceB")<
          ServiceB,
          { readonly getValue: () => Effect.Effect<number> }
        >() {}

        const layerA = Layer.succeed(ServiceA, {
          getValue: () => Effect.succeed("A"),
        });

        const layerB = Layer.succeed(ServiceB, {
          getValue: () => Effect.succeed(42),
        });

        const program = Effect.gen(function* () {
          const a = yield* ServiceA;
          const b = yield* ServiceB;
          const valueA = yield* a.getValue();
          const valueB = yield* b.getValue();
          return `${valueA}-${valueB}`;
        });

        const result = yield* program.pipe(
          Effect.provide(Layer.merge(layerA, layerB)),
        );

        strictEqual(result, "A-42");
      }),
    );

    it.effect("chains dependent layers", () =>
      Effect.gen(function* () {
        class Config extends Context.Tag("@app/Config")<
          Config,
          { readonly prefix: string }
        >() {}

        class Formatter extends Context.Tag("@app/Formatter")<
          Formatter,
          { readonly format: (msg: string) => Effect.Effect<string> }
        >() {
          static readonly layer = Layer.effect(
            Formatter,
            Effect.gen(function* () {
              const config = yield* Config;
              return Formatter.of({
                format: (msg) => Effect.succeed(`[${config.prefix}] ${msg}`),
              });
            }),
          );
        }

        const configLayer = Layer.succeed(Config, { prefix: "TEST" });

        const program = Effect.gen(function* () {
          const formatter = yield* Formatter;
          return yield* formatter.format("Hello");
        });

        const result = yield* program.pipe(
          Effect.provide(Formatter.layer),
          Effect.provide(configLayer),
        );

        strictEqual(result, "[TEST] Hello");
      }),
    );
  });
});
