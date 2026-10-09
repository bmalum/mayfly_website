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

# `extensions`

```elixir
@spec extensions(GenServer.server()) :: map()
```

Registered extensions: `%{identifier => %{name: ..., events: [...]}}`.

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

# `push_telemetry`

```elixir
@spec push_telemetry(GenServer.server(), [map()]) :: [integer() | {:error, term()}]
```

Delivers telemetry records to every subscribed extension the way Lambda
does: an HTTP POST of a JSON array to the subscription's destination URI.
Returns the list of HTTP status codes received.

# `shutdown`

```elixir
@spec shutdown(GenServer.server(), String.t()) :: :ok
```

Sends a SHUTDOWN event to every registered extension (regardless of the
events it subscribed to; real Lambda only delivers SHUTDOWN to external
extensions, this is a test aid).

# `start_link`

Starts the emulator on an ephemeral port (or `:port`).

# `telemetry_subscriptions`

```elixir
@spec telemetry_subscriptions(GenServer.server()) :: map()
```

Telemetry subscriptions by extension identifier (the decoded PUT body).

---

*Consult [api-reference.md](api-reference.md) for complete listing*
