# `Mayfly.Events.S3`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/events/s3.ex#L1)

Amazon S3 event notifications.

    %Mayfly.Events.S3{records: [%{bucket: "my-bucket", key: "uploads/report 2026.pdf"}]} =
      Mayfly.Events.S3.decode(event)

`key` is URL-decoded (`+` becomes a space, `%xx` sequences are decoded), which
is the form you need for `GetObject`. `event_name` is kept as S3 sends it,
e.g. `"ObjectCreated:Put"`.

# `t`

```elixir
@type t() :: %Mayfly.Events.S3{raw: map(), records: [Mayfly.Events.S3.Record.t()]}
```

# `decode`

```elixir
@spec decode(map()) :: t()
```

Decodes an S3 event.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
