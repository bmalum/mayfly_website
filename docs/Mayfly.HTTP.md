# `Mayfly.HTTP`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/http.ex#L1)

Minimal HTTP/1.1 client over `:gen_tcp` for the link-local Lambda Runtime API.

Why not `:httpc`? It needs `:inets` and `:ssl` (slower boot), returns
charlists, cannot send chunked request bodies with trailers (required for
response streaming) and applies proxy settings the Runtime API must never see.
The Runtime API is plain HTTP/1.1 on a trusted local socket, so a small,
explicit client is both safer and faster.

All functions return `{:ok, %{status: s, headers: [{name, value}], body: b}}`
(header names lowercased) or `{:error, reason}`. Status codes are not
interpreted here; `Mayfly.RuntimeAPI` does that.

# `header`

```elixir
@type header() :: {String.t(), String.t()}
```

# `response`

```elixir
@type response() :: %{status: 100..599, headers: [header()], body: binary()}
```

# `get`

```elixir
@spec get({String.t(), :inet.port_number()}, String.t(), [header()], keyword()) ::
  {:ok, response()} | {:error, term()}
```

`GET path`. `:timeout` defaults to `:infinity` because `/next` blocks until
an invocation arrives (Lambda freezes the sandbox in between).

# `post`

```elixir
@spec post(
  {String.t(), :inet.port_number()},
  String.t(),
  [header()],
  iodata(),
  keyword()
) ::
  {:ok, response()} | {:error, term()}
```

`POST path` with a complete body (`Content-Length`).

# `post_chunked`

```elixir
@spec post_chunked(
  {String.t(), :inet.port_number()},
  String.t(),
  [header()],
  Enumerable.t(),
  keyword()
) :: {:ok, response()} | {:error, term()}
```

`POST path` with `Transfer-Encoding: chunked`. `chunks` is an enumerable of
iodata; it is consumed lazily and each element is written as one chunk.

`trailer_fun` is called after the enumerable finishes (or when it raises)
with `:ok | {:error, exception, stacktrace}` and must return a list of
trailer headers; the names must be announced up front via `:trailer_names`.

Backpressure: each chunk is written synchronously, so a producer that
outpaces the consumer (Lambda caps streaming at 2 MB/s after the first 6 MB)
simply blocks in `Enum.reduce_while/3`. `:send_timeout` (ms, default 30 000)
bounds how long a single chunk write may stall before the stream is aborted
with `{:error, :timeout}`; the error is reported through the trailers.

# `put`

```elixir
@spec put(
  {String.t(), :inet.port_number()},
  String.t(),
  [header()],
  iodata(),
  keyword()
) ::
  {:ok, response()} | {:error, term()}
```

`PUT path` with a complete body (`Content-Length`).

---

*Consult [api-reference.md](api-reference.md) for complete listing*
