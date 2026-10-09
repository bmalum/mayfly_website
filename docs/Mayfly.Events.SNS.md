# `Mayfly.Events.SNS`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/events/sns.ex#L1)

Amazon SNS notifications delivered directly to Lambda.

    %Mayfly.Events.SNS{records: [%Mayfly.Events.SNS.Record{message: %{"order" => 1}}]} =
      Mayfly.Events.SNS.decode(event)

`message` is JSON-decoded when it parses. `message_attributes` is flattened
to `%{"name" => value}`.

SNS → SQS → Lambda: the SQS record `body` is an SNS envelope
(`"Type" => "Notification"`). `from_envelope/1` turns such a body into a
`Record`:

    sqs = Mayfly.Events.SQS.decode(event)
    for r <- sqs.records, do: Mayfly.Events.SNS.from_envelope(r.body)

# `t`

```elixir
@type t() :: %Mayfly.Events.SNS{raw: map(), records: [Mayfly.Events.SNS.Record.t()]}
```

# `decode`

```elixir
@spec decode(map()) :: t()
```

Decodes an SNS event (`Records` with `EventSource: aws:sns`).

# `envelope?`

```elixir
@spec envelope?(term()) :: boolean()
```

True when an SQS body is an SNS notification envelope.

# `from_envelope`

```elixir
@spec from_envelope(map()) :: Mayfly.Events.SNS.Record.t()
```

Decodes an SNS envelope (the `Sns` object, or an SQS body carrying one).

---

*Consult [api-reference.md](api-reference.md) for complete listing*
