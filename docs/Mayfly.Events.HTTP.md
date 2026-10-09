# `Mayfly.Events.HTTP`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/events/http.ex#L1)

HTTP events from API Gateway (REST v1 and HTTP v2), Lambda Function URLs
(v2 shape) and Application Load Balancer, plus helpers that build the
proxy response each of them expects.

    def handle(event, _ctx, _state) do
      req = Mayfly.Events.HTTP.decode(event)

      case {req.method, req.path} do
        {"GET", "/items/" <> id} -> Mayfly.Events.HTTP.json(200, %{id: id}, req)
        {"POST", "/items"} -> Mayfly.Events.HTTP.json(201, %{created: req.body}, req)
        _ -> Mayfly.Events.HTTP.text(404, "not found", req)
      end
    end

`body` is JSON-decoded when the request `content-type` is JSON (or the body
parses as JSON), base64-decoded first when `isBase64Encoded` is set;
otherwise it is the raw binary. `headers` are lowercased; multi-value
headers (v1/ALB) are joined with `", "`.

The response helpers take the request (or its `version`) so they can emit
the right shape: v2/Function URL responses carry `cookies` as a list, v1 and
ALB carry `multiValueHeaders` when a header has several values.

# `target`

```elixir
@type target() ::
  Mayfly.Events.HTTP.Request.t() | Mayfly.Events.HTTP.Request.version()
```

A `Request` or just its `version`, used to pick the response shape.

# `binary`

```elixir
@spec binary(100..599, binary(), String.t(), target(), keyword()) :: {:ok, map()}
```

Binary response (image, PDF, …), base64-encoded as Lambda requires.

# `decode`

```elixir
@spec decode(map()) :: Mayfly.Events.HTTP.Request.t()
```

Decodes a v1, v2 (incl. Function URL) or ALB event into a `Request`.

# `json`

```elixir
@spec json(100..599, term(), target(), keyword()) :: {:ok, map()}
```

JSON response.

# `redirect`

```elixir
@spec redirect(String.t(), target(), keyword()) :: {:ok, map()}
```

Redirect (302 by default).

# `respond`

```elixir
@spec respond(100..599, term(), target(), keyword()) :: {:ok, map()}
```

Builds a proxy response. `body` may be a binary (sent as is) or any other
term (JSON-encoded, content-type `application/json` unless set).

Options: `headers:` (map; list values become `multiValueHeaders` on v1/ALB),
`cookies:` (v2 only), `base64: true` to send a binary body base64-encoded
with `isBase64Encoded`.

# `text`

```elixir
@spec text(100..599, String.t(), target(), keyword()) :: {:ok, map()}
```

Plain text response.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
