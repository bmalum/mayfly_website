# `Mayfly.Events.Kinesis`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/events/kinesis.ex#L1)

Amazon Kinesis Data Streams events.

    kinesis = Mayfly.Events.Kinesis.decode(event)

    {:ok,
     Mayfly.Events.Kinesis.process_batch(kinesis, fn record ->
       MyApp.Ingest.handle(record.data)
     end)}

`data` is base64-decoded and JSON-decoded when it parses, otherwise the raw
bytes. Partial batch responses use the record's `sequence_number`; the event
source mapping needs `FunctionResponseTypes=ReportBatchItemFailures`.

# `t`

```elixir
@type t() :: %Mayfly.Events.Kinesis{
  raw: map(),
  records: [Mayfly.Events.Kinesis.Record.t()]
}
```

# `batch_failures`

```elixir
@spec batch_failures([String.t()]) :: %{
  batchItemFailures: [%{itemIdentifier: String.t()}]
}
```

Partial batch response for the given sequence numbers.

# `decode`

```elixir
@spec decode(map()) :: t()
```

Decodes a Kinesis event.

# `process_batch`

```elixir
@spec process_batch(t(), (Mayfly.Events.Kinesis.Record.t() -&gt; term())) :: %{
  batchItemFailures: [%{itemIdentifier: String.t()}]
}
```

Runs `fun` per record, collecting failures by sequence number.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
