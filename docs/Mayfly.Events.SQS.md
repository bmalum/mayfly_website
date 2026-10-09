# `Mayfly.Events.SQS`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/events/sqs.ex#L1)

Amazon SQS events.

    def handle(event, _ctx, _state) do
      sqs = Mayfly.Events.SQS.decode(event)

      {:ok,
       Mayfly.Events.SQS.process_batch(sqs, fn record ->
         MyApp.Orders.process(record.body)   # {:ok, _} | {:error, _} | raise
       end)}
    end

`process_batch/2` returns the partial-batch response
(`%{batchItemFailures: [...]}`) so that only failed messages are retried.
The event source mapping must be created with
`FunctionResponseTypes=ReportBatchItemFailures` for Lambda to honour it.

`body` is JSON-decoded when it parses, otherwise the raw string.
`message_attributes` is flattened to `%{"name" => value}` (string or binary
values; number values are returned as strings as SQS sends them).

# `t`

```elixir
@type t() :: %Mayfly.Events.SQS{raw: map(), records: [Mayfly.Events.SQS.Record.t()]}
```

# `batch_failures`

```elixir
@spec batch_failures([String.t()]) :: %{
  batchItemFailures: [%{itemIdentifier: String.t()}]
}
```

Partial batch response for the given message ids.

# `decode`

```elixir
@spec decode(map()) :: t()
```

Decodes an SQS event.

# `process_batch`

```elixir
@spec process_batch(t(), (Mayfly.Events.SQS.Record.t() -&gt; term())) :: %{
  batchItemFailures: [%{itemIdentifier: String.t()}]
}
```

Runs `fun` for each record and returns the partial batch response listing
the records for which `fun` returned `{:error, _}`, raised, exited or threw.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
