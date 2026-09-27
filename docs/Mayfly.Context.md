# `Mayfly.Context`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/context.ex#L1)

Per-invocation metadata, built from the `GET /runtime/invocation/next`
response headers and passed as the second argument to `c:Mayfly.Handler.handle/3`.

| Field | Header | Notes |
|---|---|---|
| `request_id` | `Lambda-Runtime-Aws-Request-Id` | identifies the *event*; may be retried |
| `invocation_id` | `Lambda-Runtime-Invocation-Id` | identifies this *attempt*; echoed back by the runtime |
| `deadline_ms` | `Lambda-Runtime-Deadline-Ms` | Unix time in ms |
| `function_arn` | `Lambda-Runtime-Invoked-Function-Arn` | |
| `trace_id` | `Lambda-Runtime-Trace-Id` | also exported as `_X_AMZN_TRACE_ID` |
| `tenant_id` | `Lambda-Runtime-Aws-Tenant-Id` | tenant isolation mode |
| `client_context` | `Lambda-Runtime-Client-Context` | Mobile SDK, raw JSON |
| `cognito_identity` | `Lambda-Runtime-Cognito-Identity` | Mobile SDK, raw JSON |

`env` carries the static function configuration read from the environment
(`AWS_LAMBDA_FUNCTION_NAME`, `..._VERSION`, `..._MEMORY_SIZE`, `AWS_REGION`,
`AWS_LAMBDA_LOG_GROUP_NAME`, `AWS_LAMBDA_LOG_STREAM_NAME`).

# `t`

```elixir
@type t() :: %Mayfly.Context{
  client_context: String.t() | nil,
  cognito_identity: String.t() | nil,
  deadline_ms: non_neg_integer() | nil,
  env: %{optional(atom()) =&gt; String.t() | nil},
  function_arn: String.t() | nil,
  invocation_id: String.t() | nil,
  request_id: String.t() | nil,
  tenant_id: String.t() | nil,
  trace_id: String.t() | nil
}
```

# `env_from_system`

```elixir
@spec env_from_system() :: map()
```

Reads the static function configuration from the environment.

# `from_headers`

```elixir
@spec from_headers([{String.t(), String.t()}], map()) :: t()
```

Builds a context from lowercased response headers.

# `logger_metadata`

```elixir
@spec logger_metadata(t()) :: keyword()
```

Logger metadata for this invocation.

# `remaining_time_ms`

```elixir
@spec remaining_time_ms(t()) :: non_neg_integer() | nil
```

Milliseconds until Lambda considers this invocation timed out (`nil` when
unknown). On Lambda Managed Instances the runtime is *not* killed at the
deadline, so check this in long loops and stop early.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
