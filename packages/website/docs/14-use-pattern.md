---
title: Service `use` pattern
description: "Wrapping third-party libraries in Effect services"
order: 14
draft: true
---

# Service `use` pattern (Draft)

The `use` pattern is useful to wrap third-party libraries `Promise`-based APIs in Effect services preserving interruption support and type safety.

## The pattern

```typescript
import type { SupabaseClient } from "@supabase/supabase-js"

import { Config, Data, Effect } from "effect"
import { createClient } from "@supabase/supabase-js"

class SupabaseError extends Data.TaggedError("SupabaseError")<{
  cause?: unknown
}> {}

class Supabase extends Effect.Service<Supabase>()("Supabase/Client", {
  effect: Effect.gen(function* () {
    const config = yield* Config.all({
      url: Config.nonEmptyString("SUPABASE_URL"),
      key: Config.nonEmptyString("SUPABASE_PUBLISHABLE_KEY"),
    })

    const client = createClient(config.url, config.key)

    const use = <A>(
      fn: (client: SupabaseClient, signal: AbortSignal) => Promise<A>
    ): Effect.Effect<A, SupabaseError> =>
      Effect.tryPromise({
        try: (signal) => fn(client, signal),
        catch: (cause) => new SupabaseError({ cause }),
      })

    return { use } as const
  }),
}) {}
```

## Usage

```typescript
import { Effect } from "effect"
// hide-start
class Supabase extends Effect.Service<Supabase>()("Supabase/Client", {
  effect: Effect.succeed({
    use: <A>(fn: (client: any, signal: AbortSignal) => Promise<A>) =>
      Effect.tryPromise(() => fn({} as any, new AbortController().signal)),
  }),
}) {}
// hide-end

const program = Effect.gen(function* () {
  const supabase = yield* Supabase

  //     ┌── UserResponse
  //     │                           ┌── SupabaseClient
  //     ▼                           ▼
  const user = yield* supabase.use((client) => client.auth.getUser())

  //     ┌── PostgrestSingleResponse<any[]>
  //     ▼
  const result = yield* supabase.use(async (client, signal) =>
    client
      .from("database_table")
      .select("*", { count: "exact", head: true })
      .abortSignal(signal),
  );
})
```

The callback receives two parameters:
- **client**: The underlying library instance
- **signal**: AbortSignal for interruption support

When the Effect is interrupted, the signal is aborted, allowing libraries that support cancellation to clean up.

## Why use a callback?

You can expose both the `client` and `use` if you like, but exposing only `use` provides:

1. **Automatic error wrapping**: all errors become `SupabaseError` (or your tagged error)
2. **Interruption support**: the abort signal is threaded through automatically
3. **Consistent API**: every library method goes through the same error handling
4. **Encapsulation**: consumers can't accidentally use the client outside Effect context
