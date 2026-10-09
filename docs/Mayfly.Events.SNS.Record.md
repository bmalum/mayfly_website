# `Mayfly.Events.SNS.Record`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/events/sns.ex#L21)

One SNS notification.

# `t`

```elixir
@type t() :: %Mayfly.Events.SNS.Record{
  message: term(),
  message_attributes: %{optional(String.t()) =&gt; term()},
  message_id: String.t() | nil,
  raw: map(),
  subject: String.t() | nil,
  subscription_arn: String.t() | nil,
  timestamp: DateTime.t() | String.t() | nil,
  topic_arn: String.t() | nil
}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
