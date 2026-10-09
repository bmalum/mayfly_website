# `Mayfly.Events.DynamoDB`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/events/dynamo_db.ex#L1)

Amazon DynamoDB Streams events.

    stream = Mayfly.Events.DynamoDB.decode(event)

    for %{event_name: :insert, new_image: item} <- stream.records do
      # item is a plain map: %{"id" => "a1", "price" => 12.5, "tags" => ["x"], ...}
    end

DynamoDB's typed attribute values are converted to Elixir terms:

| Type | Elixir |
|---|---|
| `S` | binary |
| `N` | integer or float |
| `BOOL` | boolean |
| `NULL` | `nil` |
| `B` | binary (base64-decoded) |
| `L` | list |
| `M` | map |
| `SS` / `NS` / `BS` | list of binaries / numbers / binaries |

`from_attribute_values/1` is public so it can be reused for other
DynamoDB JSON (e.g. `GetItem` responses).

# `t`

```elixir
@type t() :: %Mayfly.Events.DynamoDB{
  raw: map(),
  records: [Mayfly.Events.DynamoDB.Record.t()]
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

Decodes a DynamoDB Streams event.

# `from_attribute_values`

```elixir
@spec from_attribute_values(map() | nil) :: map() | nil
```

Converts a map of DynamoDB attribute values (`%{"id" => %{"S" => "a"}}`) into plain terms.

# `from_av`

```elixir
@spec from_av(map()) :: term()
```

Converts one attribute value.

# `process_batch`

```elixir
@spec process_batch(t(), (Mayfly.Events.DynamoDB.Record.t() -&gt; term())) :: %{
  batchItemFailures: [%{itemIdentifier: String.t()}]
}
```

Runs `fun` per record, collecting failures by sequence number.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
