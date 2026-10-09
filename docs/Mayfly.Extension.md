# `Mayfly.Extension`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/extension.ex#L1)

Internal Lambda extension: registers with the Extensions API, subscribes to
the Telemetry API, and turns platform telemetry into `:telemetry` events.

Off by default. Enable with `MAYFLY_EXTENSION=1` (or `config :mayfly,
extension: true` / the `:extension` option of `Mayfly.start_link/1`). When
enabled, `Mayfly.Supervisor` registers the extension *before* the first
`/next` poll, which is what Lambda requires of internal extensions, so the
cost is one extra HTTP round trip plus the subscription at cold start.

## What you get

  * `:telemetry` events `[:mayfly, :platform, type]` for every platform
    record, with the record's `metrics` (numbers) as measurements and the
    full record plus `time` as metadata. `type` is the part after
    `platform.` as an atom: `:init_start`, `:init_runtime_done`,
    `:init_report`, `:start`, `:runtime_done`, `:report`, `:extension`,
    `:telemetry_subscription`, `:log_dropped`, ... `platform.report` carries
    `durationMs`, `billedDurationMs`, `memorySizeMB`, `maxMemoryUsedMB` and,
    on cold starts, `initDurationMs` – numbers the function cannot otherwise
    see about itself. `Mayfly.Metrics.attach_platform_metrics/2` publishes
    them as CloudWatch EMF metrics.
  * Every telemetry record is logged at `debug` level.

What you do **not** get: a `SHUTDOWN` hook. Lambda only delivers `SHUTDOWN`
to *external* extensions (separate processes under `/opt/extensions`);
internal extensions registering for it are rejected with
`ShutdownEventNotSupportedForInternalExtension`. Mayfly therefore registers
for `INVOKE` only. Logger flushing at shutdown would need an external
extension and is out of scope; Lambda's log capture of the invocation's
stdout is complete once the response is posted, so lines logged before the
handler returns are not at risk.

## How it works

1. `POST /2020-01-01/extension/register` with `Lambda-Extension-Name: mayfly`
   and events `["INVOKE"]`; the response header
   `Lambda-Extension-Identifier` authenticates later calls.
2. A `:gen_tcp` listener is opened on `sandbox.localdomain` (the only host
   the Telemetry API may deliver to) and `PUT /2022-07-01/telemetry`
   subscribes to `platform` events with a small buffer
   (`timeoutMs: 25, maxBytes: 262144, maxItems: 1000`).
3. A process loops on `GET /2020-01-01/extension/event/next`. `INVOKE`
   events are acknowledged and otherwise ignored (the pollers handle
   invocations). Should Lambda ever deliver `SHUTDOWN` to an internal
   extension, Mayfly flushes `Logger` and halts.

Telemetry is delivered *after* the invocation that produced it has
completed (Lambda sends `platform.report` once the response is posted), so
metrics derived from it are attributed by `requestId`, not by the current
invocation. Nothing here runs in the request path.

# `enabled?`

```elixir
@spec enabled?(keyword()) :: boolean()
```

True when the extension should be started (env `MAYFLY_EXTENSION`, app env, or option).

# `identifier`

```elixir
@spec identifier(GenServer.server()) :: String.t()
```

The identifier Lambda assigned at registration (for tests and diagnostics).

# `listener_port`

```elixir
@spec listener_port(GenServer.server()) :: :inet.port_number()
```

Port of the telemetry listener (for tests).

---

*Consult [api-reference.md](api-reference.md) for complete listing*
