# `Mayfly.RuntimeAPI`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/runtime_api.ex#L1)

Client for the [Lambda Runtime API](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-api.html)
(version 2018-06-01), built on `Mayfly.HTTP`.

A behaviour as well as the default implementation, so `Mayfly.Poller` can be
tested against a fake. All functions return `:ok`/`{:ok, _}` for 2xx and
`{:error, {:http, status, body}}` or `{:error, transport_reason}` otherwise.

## Headers handled

  * `Lambda-Runtime-Invocation-Id` is echoed on `/response` and `/error`.
  * `Lambda-Runtime-Function-Error-Type` is set from
    `Mayfly.ErrorPayload.header_type/1`.
  * `Lambda-Runtime-Function-Xray-Error-Cause` carries an X-Ray cause document
    (skipped when larger than 1 MiB).
  * Streaming responses use `Lambda-Runtime-Function-Response-Mode: streaming`,
    chunked transfer encoding and error trailers.

# `endpoint`

```elixir
@type endpoint() :: {String.t(), :inet.port_number()}
```

# `error`

```elixir
@type error() :: {:http, 100..599, binary()} | term()
```

# `invocation`

```elixir
@type invocation() :: %{headers: [{String.t(), String.t()}], body: binary()}
```

# `init_error`

```elixir
@callback init_error(endpoint(), Mayfly.ErrorPayload.t()) :: :ok | {:error, error()}
```

# `invocation_error`

```elixir
@callback invocation_error(endpoint(), Mayfly.Context.t(), Mayfly.ErrorPayload.t()) ::
  :ok | {:error, error()}
```

# `invocation_response`

```elixir
@callback invocation_response(endpoint(), Mayfly.Context.t(), Mayfly.Response.t()) ::
  :ok | {:error, error()}
```

# `next_invocation`

```elixir
@callback next_invocation(endpoint()) :: {:ok, invocation()} | {:error, error()}
```

# `endpoint`

```elixir
@spec endpoint(String.t() | nil) :: endpoint() | nil
```

Parses `AWS_LAMBDA_RUNTIME_API` (`host:port`) into an endpoint tuple.
Returns `nil` when unset.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
