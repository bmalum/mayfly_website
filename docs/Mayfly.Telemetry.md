# `Mayfly.Telemetry`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/telemetry.ex#L1)

Telemetry events emitted by the runtime. `:telemetry` is an optional
dependency; when it is not present the calls are no-ops.

| Event | Measurements | Metadata |
|---|---|---|
| `[:mayfly, :init, :stop]` | `duration` (native) | `handler`, `result` (`:ok` / `:error`) |
| `[:mayfly, :invocation, :start]` | `system_time` | `context` |
| `[:mayfly, :invocation, :stop]` | `duration` | `context`, `result` (`:ok` / `:error`), `error_type` |
| `[:mayfly, :poll, :error]` | `backoff_ms` | `reason` |

Attach with `:telemetry.attach/4` from your handler's `init/1`, or use a
reporter such as `telemetry_metrics_cloudwatch`.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
