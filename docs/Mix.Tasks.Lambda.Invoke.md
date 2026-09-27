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
    --http           Wrap the event the way a Function URL / API Gateway v2
                     does (`{"version":"2.0","rawPath":...,"body":...}`), so
                     handlers written for HTTP events can be tested locally
    --method M       HTTP method for --http (default POST)
    --path P         Request path for --http (default /)

---

*Consult [api-reference.md](api-reference.md) for complete listing*
