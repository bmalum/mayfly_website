# `Mayfly.Events.EventBridge`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/events/event_bridge.ex#L1)

Amazon EventBridge events (custom events, scheduled rules, AWS service events).

    case Mayfly.Events.EventBridge.decode(event) do
      %{source: "my.app", detail_type: "OrderPlaced", detail: detail} -> ...
      %{source: "aws.events"} -> # scheduled rule tick
    end

`detail` is the event payload map. Scheduled rules send an empty detail.

# `t`

```elixir
@type t() :: %Mayfly.Events.EventBridge{
  account: String.t() | nil,
  detail: term(),
  detail_type: String.t() | nil,
  id: String.t() | nil,
  raw: map(),
  region: String.t() | nil,
  resources: [String.t()],
  source: String.t() | nil,
  time: DateTime.t() | String.t() | nil,
  version: String.t() | nil
}
```

# `decode`

```elixir
@spec decode(map()) :: t()
```

Decodes an EventBridge event.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
