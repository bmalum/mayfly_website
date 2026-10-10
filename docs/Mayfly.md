# `Mayfly`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly.ex#L1)

Mayfly – an AWS Lambda custom runtime for Elixir.

Nothing starts automatically. Inside Lambda the generated `bootstrap` runs
`Mayfly.Boot.main/0`, which reads the environment and calls `start_link/1`.
You can also start the runtime yourself (for example from your own
supervision tree when using `Mayfly.LocalRuntime` in tests):

    Mayfly.start_link(handler: "MyApp.Handler", runtime_api: "127.0.0.1:9001")

## Options

  * `:handler` – `_HANDLER` string (module or `Module.function`); default
    `System.get_env("_HANDLER")`
  * `:runtime_api` – `host:port`; default `System.get_env("AWS_LAMBDA_RUNTIME_API")`
  * `:concurrency` – number of pollers; default `AWS_LAMBDA_MAX_CONCURRENCY` or 1
  * `:handler_opts` – passed to the handler's `init/1`; default `[]`
  * `:extension` – register the internal Lambda extension (`Mayfly.Extension`:
    platform telemetry as `:telemetry` events); default `MAYFLY_EXTENSION=1`
    or `config :mayfly, extension: true`, else off
  * `:extension_opts` – passed to `Mayfly.Extension` (tests use it)
  * `:name` – supervisor name; `nil` for an unnamed supervisor (default `Mayfly.Supervisor`)
  * `:api` – module implementing `Mayfly.RuntimeAPI` (tests)

# `start_link`

```elixir
@spec start_link(keyword()) ::
  Supervisor.on_start() | {:error, {:init_error, Mayfly.ErrorPayload.t()}}
```

Resolves and initialises the handler, then starts the poller supervisor.

Returns `{:error, {:init_error, payload}}` when the handler cannot be
resolved or its `init/1` fails; the payload has already been posted to
`/runtime/init/error` at that point.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
