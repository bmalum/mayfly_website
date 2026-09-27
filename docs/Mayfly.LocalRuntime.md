# `Mayfly.LocalRuntime`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/local_runtime.ex#L1)

A small Lambda Runtime API emulator for local development and tests.

It speaks enough of the Runtime API for Mayfly (and any other custom
runtime) to run against it: `GET /next` blocks until an event is queued,
`/response` and `/error` deliver the outcome to whoever invoked, including
streamed responses and error trailers.

    {:ok, rt} = Mayfly.LocalRuntime.start_link()
    {:ok, _} = Mayfly.start_link(handler: "MyApp.Handler", runtime_api: Mayfly.LocalRuntime.address(rt))

    Mayfly.LocalRuntime.invoke(rt, %{"name" => "world"})
    #=> {:ok, %{status: 200, body: ~s({"hello":"world"}), headers: [...]}}

    Mayfly.LocalRuntime.invoke(rt, %{"bad" => true})
    #=> {:error, %{"errorType" => "KeyError", "errorMessage" => ..., "stackTrace" => [...]}}

Init errors are exposed through `init_error/1`. The emulator is
single-tenant and does not enforce timeouts; it is a development aid, not a
faithful Lambda simulation. For that, use
[aws-lambda-rie](https://github.com/aws/aws-lambda-runtime-interface-emulator).

# `invoke_result`

```elixir
@type invoke_result() ::
  {:ok,
   %{
     status: 200,
     headers: [{String.t(), String.t()}],
     body: binary(),
     trailers: map()
   }}
  | {:error, map()}
```

# `address`

```elixir
@spec address(GenServer.server()) :: String.t()
```

`host:port` string suitable for `AWS_LAMBDA_RUNTIME_API`.

# `child_spec`

Returns a specification to start this module under a supervisor.

See `Supervisor`.

# `init_error`

```elixir
@spec init_error(GenServer.server()) :: map() | nil
```

The payload posted to `/runtime/init/error`, if any.

# `invoke`

```elixir
@spec invoke(GenServer.server(), term(), keyword()) :: invoke_result()
```

Queues `event` (any JSON-encodable term or a raw binary), waits for the
runtime to process it and returns the outcome.

# `start_link`

Starts the emulator on an ephemeral port (or `:port`).

---

*Consult [api-reference.md](api-reference.md) for complete listing*
