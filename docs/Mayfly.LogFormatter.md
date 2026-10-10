# `Mayfly.LogFormatter`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/log_formatter.ex#L1)

Logger formatter that emits one JSON object per line in the shape Lambda's
[advanced logging controls](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-cloudwatchlogs-advanced.html)
expect, so CloudWatch parses level, request id and tenant id:

    {"timestamp":"2026-09-27T07:00:00.123Z","level":"INFO","requestId":"…","tenantId":"…","message":"…"}

`Mayfly.Boot` installs it when `AWS_LAMBDA_LOG_FORMAT=JSON`. To use it
yourself:

    config :logger, :default_handler, formatter: {Mayfly.LogFormatter, %{}}

All Logger metadata except internal keys is included; values that are not
JSON-encodable are `inspect`ed.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
