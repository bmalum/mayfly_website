# `Mayfly.Events.HTTP.Request`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/events/http.ex#L29)

A decoded HTTP request. See `Mayfly.Events.HTTP`.

# `t`

```elixir
@type t() :: %Mayfly.Events.HTTP.Request{
  body: term(),
  cookies: [String.t()],
  headers: %{optional(String.t()) =&gt; String.t()},
  is_base64: boolean(),
  method: String.t(),
  path: String.t(),
  path_parameters: %{optional(String.t()) =&gt; String.t()},
  query: %{optional(String.t()) =&gt; String.t() | [String.t()]},
  raw: map(),
  raw_path: String.t(),
  request_id: String.t() | nil,
  source_ip: String.t() | nil,
  stage: String.t() | nil,
  user_agent: String.t() | nil,
  version: version()
}
```

# `version`

```elixir
@type version() :: :v1 | :v2 | :alb
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
