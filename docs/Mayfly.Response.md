# `Mayfly.Response`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/response.ex#L1)

What a handler may return inside `{:ok, _}`.

## Plain values

Any JSON-encodable term (`map`, `list`, `binary`, number, `nil`, boolean) is
encoded with `JSON` and sent with `Content-Type: application/json`. This is
what most handlers return.

## `%Mayfly.Response{}`

Use the struct when you need control over the content type or want to
stream:

    # raw bytes, custom content type
    %Mayfly.Response{body: png, content_type: "image/png"}

    # streamed: any Enumerable of iodata (Stream, list, ...)
    %Mayfly.Response{body: Stream.map(tokens, &chunk/1), content_type: "text/event-stream"}
    |> Mayfly.Response.stream()

    # streamed through a Function URL with status/headers:
    %Mayfly.Response{body: stream}
    |> Mayfly.Response.stream()
    |> Mayfly.Response.http(status: 200, headers: %{"content-type" => "text/plain"}, cookies: [])

Streaming requires the function to be invoked with `RESPONSE_STREAM` invoke
mode (Function URLs) or `InvokeWithResponseStream`. Chunks are written
synchronously; if Lambda stops reading (bandwidth cap, disconnected client)
the producer blocks. `send_timeout` (ms, default 30 000) bounds a single
stalled write, after which the stream is aborted. Errors raised while the
stream is being consumed are reported to Lambda via HTTP trailers and
forwarded to the client as error metadata; the response is otherwise treated
as successful, so validate early and fail before the first chunk if you can.

# `t`

```elixir
@type t() :: %Mayfly.Response{
  body: term() | Enumerable.t(),
  content_type: String.t(),
  http: nil | %{status: pos_integer(), headers: map(), cookies: [String.t()]},
  mode: :buffered | :streaming,
  send_timeout: pos_integer()
}
```

# `http`

```elixir
@spec http(t(), keyword()) :: t()
```

Adds the Function URL HTTP integration prelude (status, headers, cookies) to a
streamed response. Lambda strips it before forwarding the body to the client.

# `stream`

```elixir
@spec stream(t(), keyword()) :: t()
```

Marks the response as streamed; `body` must be an `Enumerable` of iodata.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
