# `mix lambda.invoke`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mix/tasks/lambda.invoke.ex#L1)

Runs your handler exactly as Mayfly would inside Lambda – handler
resolution, `init/1`, JSON decoding, context, error formatting – against
`Mayfly.LocalRuntime`, and prints the response or error.

    mix lambda.invoke MyApp.Handler '{"name":"world"}'
    mix lambda.invoke MyApp.Handler event.json
    echo '{"a":1}' | mix lambda.invoke MyApp.Handler -

The handler may also be a legacy `Module.function`. Exit status is 0 for a
successful invocation and 1 for an error (including init errors).

## Options

    --timeout MS     Deadline reported in the context (default 30000)
    --raw            Print the raw response body instead of pretty JSON
    --event SOURCE   Wrap the given JSON in a realistic envelope of that
                     source, so handlers using `Mayfly.Events` can be tested
                     locally. SOURCE is one of
                     apigw-v2 (also Function URL), apigw-v1, alb, sqs, sns,
                     s3, eventbridge, kinesis, dynamodb.
                     The JSON becomes the HTTP body / SQS body / SNS message /
                     EventBridge detail / Kinesis data / DynamoDB NewImage.
                     For s3 pass {"key":"path/to object.txt"}.
    --http           Alias for --event apigw-v2
    --method M       HTTP method for HTTP envelopes (default POST)
    --path P         Request path for HTTP envelopes (default /)
    --detail-type T  EventBridge detail-type (default LocalEvent)
    --source S       EventBridge source (default mix.lambda.invoke)

---

*Consult [api-reference.md](api-reference.md) for complete listing*
