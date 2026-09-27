# `Mayfly.Handler`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/handler.ex#L1)

Behaviour for Lambda function handlers.

    defmodule MyApp.Handler do
      use Mayfly.Handler

      @impl true
      def init(_opts) do
        # cold-start work: read config, open a pool, warm a cache
        {:ok, %{table: System.fetch_env!("TABLE_NAME")}}
      end

      @impl true
      def handle(event, %Mayfly.Context{} = ctx, state) do
        {:ok, %{table: state.table, request_id: ctx.request_id, event: event}}
      end
    end

Set the Lambda **Handler** (`_HANDLER`) to the module name: `MyApp.Handler`.

## Callbacks

  * `c:init/1` – optional, runs once per execution environment before the
    first `/next` poll. Return `{:ok, state}` or `{:error, reason}`; an error
    is reported as `Runtime.InitError` and the function fails to start. The
    default returns `{:ok, nil}`.
  * `c:handle/3` – called for every invocation with the decoded event, the
    `Mayfly.Context` and the state from `init/1`. Return `{:ok, response}`
    or `{:error, reason}`. See `Mayfly.Response` for what `response` may be.

On Lambda Managed Instances `handle/3` runs concurrently in separate
processes (up to `AWS_LAMBDA_MAX_CONCURRENCY`); state is shared read-only.

## Legacy `Module.function` handlers

`_HANDLER=MyApp.Legacy.handle` still works: a public function of arity 1
(`handle(event)`) or 2 (`handle(event, context)`) is wrapped automatically.
The `Elixir.` prefix is accepted in both forms.

# `resolved`

```elixir
@type resolved() :: %{
  module: module(),
  fun: (term(), Mayfly.Context.t(), state() -&gt; result()),
  state: state()
}
```

A resolved, ready-to-call handler.

# `result`

```elixir
@type result() :: {:ok, Mayfly.Response.t() | term()} | {:error, term()}
```

# `state`

```elixir
@type state() :: term()
```

# `handle`

```elixir
@callback handle(event :: term(), context :: Mayfly.Context.t(), state :: state()) ::
  result()
```

# `init`
*optional* 

```elixir
@callback init(opts :: keyword()) :: {:ok, state()} | {:error, term()}
```

# `invoke`

```elixir
@spec invoke(resolved(), term(), Mayfly.Context.t()) ::
  {:ok, Mayfly.Response.t()} | {:error, Mayfly.ErrorPayload.t()}
```

Invokes a resolved handler, converting exceptions, exits and throws into error payloads.

# `resolve`

```elixir
@spec resolve(String.t() | nil, keyword()) ::
  {:ok, resolved()} | {:error, Mayfly.ErrorPayload.t()}
```

Resolves the `_HANDLER` string and runs `init/1`.

Returns `{:error, %{errorType: "Runtime.NoSuchHandler" | "Runtime.InitError", ...}}`
on failure so callers can post it to `/runtime/init/error` directly.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
