# `Mayfly.Events`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/events.ex#L1)

Typed decoders for the event shapes AWS services send to Lambda.

Handlers receive the raw decoded JSON. These modules turn the common
envelopes into structs with the fields you actually use, decode base64 and
nested JSON, and convert DynamoDB attribute values into Elixir terms.

| Source | Module | Detected by |
|---|---|---|
| API Gateway HTTP API (v2), Function URL | `Mayfly.Events.HTTP` | `"version" => "2.0"` |
| API Gateway REST API (v1), ALB | `Mayfly.Events.HTTP` | `"httpMethod"` / `"requestContext.elb"` |
| SQS | `Mayfly.Events.SQS` | `eventSource: "aws:sqs"` |
| SNS | `Mayfly.Events.SNS` | `EventSource: "aws:sns"` |
| S3 | `Mayfly.Events.S3` | `eventSource: "aws:s3"` |
| EventBridge | `Mayfly.Events.EventBridge` | `"detail-type"` |
| Kinesis Data Streams | `Mayfly.Events.Kinesis` | `eventSource: "aws:kinesis"` |
| DynamoDB Streams | `Mayfly.Events.DynamoDB` | `eventSource: "aws:dynamodb"` |

Use the specific module when you know the source, or `decode/1` to
dispatch:

    def handle(event, _ctx, _state) do
      case Mayfly.Events.decode(event) do
        {:ok, %Mayfly.Events.HTTP.Request{} = req} -> serve(req)
        {:ok, %Mayfly.Events.SQS{records: records}} -> process(records)
        {:ok, other} -> {:ok, %{ignored: other.__struct__}}
        :unknown -> {:ok, %{raw: event}}
      end
    end

Every decoder keeps the original map in `:raw` so nothing is lost.

# `event`

```elixir
@type event() ::
  Mayfly.Events.HTTP.Request.t()
  | Mayfly.Events.SQS.t()
  | Mayfly.Events.SNS.t()
  | Mayfly.Events.S3.t()
  | Mayfly.Events.EventBridge.t()
  | Mayfly.Events.Kinesis.t()
  | Mayfly.Events.DynamoDB.t()
```

# `decode`

```elixir
@spec decode(map()) :: {:ok, event()} | :unknown
```

Detects the event source and decodes it. Returns `:unknown` for anything else.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
