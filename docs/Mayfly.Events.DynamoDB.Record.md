# `Mayfly.Events.DynamoDB.Record`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/events/dynamo_db.ex#L30)

One stream record.

# `t`

```elixir
@type t() :: %Mayfly.Events.DynamoDB.Record{
  approximate_creation: DateTime.t() | nil,
  event_id: String.t() | nil,
  event_name: :insert | :modify | :remove,
  event_source_arn: String.t() | nil,
  keys: map(),
  new_image: map() | nil,
  old_image: map() | nil,
  raw: map(),
  region: String.t() | nil,
  sequence_number: String.t() | nil,
  size_bytes: non_neg_integer() | nil,
  stream_view_type: String.t() | nil,
  table: String.t() | nil
}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
