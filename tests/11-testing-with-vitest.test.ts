import { describe, expect, it } from "@effect/vitest";
import {
  assertLeft,
  assertRight,
  assertTrue,
  deepStrictEqual,
  strictEqual,
} from "@effect/vitest/utils";
import { Context, Effect, Either, Layer, Match, Schema } from "effect";

describe("11-testing-with-vitest", () => {
  describe("Basic Testing", () => {
    it("sync test", () => {
      const result = 1 + 1;
      strictEqual(result, 2);
    });

    it.effect("effect test", () =>
      Effect.gen(function* () {
        const result = yield* Effect.succeed(1 + 1);
        strictEqual(result, 2);
      }),
    );
  });

  describe("Assertion Styles", () => {
    it.effect("assert style", () =>
      Effect.gen(function* () {
        const result = yield* Effect.succeed(2);
        strictEqual(1 + 1, result);
        deepStrictEqual({ a: 1 }, { a: 1 });
        assertTrue(true);
      }),
    );

    it.effect("expect style", () =>
      Effect.gen(function* () {
        const text = yield* Effect.succeed("hello world");
        expect(text).toContain("world");
        expect([1, 2, 3]).toHaveLength(3);
      }),
    );

    it.effect("Option assertions", () =>
      Effect.gen(function* () {
        const some = yield* Effect.succeed(Either.right(42));
        assertRight(some, 42);

        const none = yield* Effect.succeed(Either.left("error"));
        assertLeft(none, "error");
      }),
    );
  });

  describe("Testing Schema Classes", () => {
    class User extends Schema.Class<User>("User")({
      name: Schema.NonEmptyString,
      age: Schema.Int.pipe(Schema.greaterThan(0)),
    }) {}

    it("creates valid user", () => {
      const user = new User({ name: "Alice", age: 30 });
      strictEqual(user.name, "Alice");
      strictEqual(user.age, 30);
    });

    it("validates on construction", () => {
      expect(() => new User({ name: "", age: 30 })).toThrow();
    });

    it.effect("decodes from unknown", () =>
      Effect.gen(function* () {
        const data = { name: "Bob", age: 25 };
        const user = yield* Schema.decodeUnknown(User)(data);
        strictEqual(user.name, "Bob");
        strictEqual(user.age, 25);
      }),
    );
  });

  describe("Testing TaggedClass Unions", () => {
    class Success extends Schema.TaggedClass<Success>()("Success", {
      value: Schema.Number,
    }) {}

    class Failure extends Schema.TaggedClass<Failure>()("Failure", {
      error: Schema.String,
    }) {}

    const _Result = Schema.Union(Success, Failure);

    it("matches success", () => {
      const success = new Success({ value: 42 });
      const result = Match.value(success).pipe(
        Match.tag("Success", ({ value }) => value),
        Match.tag("Failure", () => 0),
        Match.exhaustive,
      );
      strictEqual(result, 42);
    });

    it("matches failure", () => {
      const failure = new Failure({ error: "oops" });
      const result = Match.value(failure).pipe(
        Match.tag("Success", ({ value }) => value),
        Match.tag("Failure", ({ error }) => error),
        Match.exhaustive,
      );
      strictEqual(result, "oops");
    });
  });

  describe("Providing Layers", () => {
    class Database extends Context.Tag("Database")<
      Database,
      { query: (sql: string) => Effect.Effect<string[]> }
    >() {}

    const testDatabase = Layer.succeed(Database, {
      query: (_sql) => Effect.succeed(["mock", "data"]),
    });

    it.effect("queries database", () =>
      Effect.gen(function* () {
        const db = yield* Database;
        const results = yield* db.query("SELECT * FROM users");
        strictEqual(results.length, 2);
        strictEqual(results[0], "mock");
      }).pipe(Effect.provide(testDatabase)),
    );
  });

  describe("Testing Error Cases", () => {
    const failingEffect = Effect.fail(new Error("expected error"));

    it.effect("handles errors with flip", () =>
      Effect.gen(function* () {
        const error = yield* Effect.flip(failingEffect);
        strictEqual(error.message, "expected error");
      }),
    );

    it.effect("returns Left on error", () =>
      Effect.gen(function* () {
        const result = yield* Effect.either(failingEffect);
        assertTrue(Either.isLeft(result));
      }),
    );
  });

  describe("Common Patterns", () => {
    it.effect("assertions inside Effect.gen", () =>
      Effect.gen(function* () {
        const result = yield* Effect.succeed("value");
        strictEqual(result, "value");
      }),
    );

    it.effect("multiple assertions", () =>
      Effect.gen(function* () {
        const users = yield* Effect.succeed([
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ]);
        strictEqual(users.length, 2);
        strictEqual(users[0].name, "Alice");
        strictEqual(users[1].name, "Bob");
      }),
    );
  });
});
