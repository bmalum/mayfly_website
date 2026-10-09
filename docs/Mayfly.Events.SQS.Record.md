# `Mayfly.Events.SQS.Record`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/events/sqs.ex#L26)

One SQS message.

# `t`

```elixir
@type t() :: %Mayfly.Events.SQS.Record{
  attributes: map(),
  body: term(),
  event_source_arn: String.t() | nil,
  md5: String.t() | nil,
  message_attributes: %{optional(String.t()) =&gt; term()},
  message_id: String.t(),
  raw: map(),
  receipt_handle: String.t() | nil,
  region: String.t() | nil
}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
