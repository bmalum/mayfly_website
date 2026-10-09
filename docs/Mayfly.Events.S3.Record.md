# `Mayfly.Events.S3.Record`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/events/s3.ex#L15)

One S3 notification record.

# `t`

```elixir
@type t() :: %Mayfly.Events.S3.Record{
  bucket: String.t(),
  bucket_arn: String.t() | nil,
  etag: String.t() | nil,
  event_name: String.t(),
  key: String.t(),
  raw: map(),
  region: String.t() | nil,
  size: non_neg_integer() | nil,
  time: DateTime.t() | String.t() | nil,
  version_id: String.t() | nil
}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
