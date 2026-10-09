# `Mayfly.Events.Kinesis.Record`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/events/kinesis.ex#L19)

One Kinesis record.

# `t`

```elixir
@type t() :: %Mayfly.Events.Kinesis.Record{
  approximate_arrival: DateTime.t() | nil,
  data: term(),
  event_id: String.t() | nil,
  event_source_arn: String.t() | nil,
  partition_key: String.t() | nil,
  raw: map(),
  region: String.t() | nil,
  sequence_number: String.t()
}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
