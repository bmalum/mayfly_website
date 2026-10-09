# `Mayfly.Metrics`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/metrics.ex#L1)

CloudWatch metrics without API calls, using the
[Embedded Metric Format](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format_Specification.html):
one JSON line on stdout that CloudWatch Logs turns into metrics.

    Mayfly.Metrics.emit("MyApp", %{"OrdersPlaced" => 1, "CartValue" => {129.5, "None"}},
      dimensions: %{"Tenant" => tenant},
      properties: %{"orderId" => id})

    Mayfly.Metrics.count("MyApp", "Retries", 2, dimensions: %{"Queue" => "orders"})
    Mayfly.Metrics.timing("MyApp", "DbLatency", 42)      # Milliseconds

## Invocation metrics

Attach once (in `init/1`) and every invocation emits `Duration`
(Milliseconds), `Errors` (0/1) and `ColdStart` (1 on the first invocation of
an execution environment, 0 afterwards) with the dimension `FunctionName`:

    def init(_opts) do
      Mayfly.Metrics.attach_invocation_metrics("MyApp")
      {:ok, nil}
    end

Requires the optional `:telemetry` dependency.

## Why not Logger?

CloudWatch parses EMF from the raw log line, which must be a single,
standalone JSON object. `Mayfly.LogFormatter` wraps messages in its own
object, so metrics are written straight to stdout with `IO.puts/2`.
Lambda captures stdout into the function's log stream.

# `value`

```elixir
@type value() :: number() | {number(), String.t()}
```

Metric value: a number, or `{number, unit}`.

# `attach_invocation_metrics`

```elixir
@spec attach_invocation_metrics(String.t(), keyword()) :: :ok | {:error, term()}
```

Attaches a `:telemetry` handler to `[:mayfly, :invocation, :stop]` that emits
`Duration`, `Errors` and `ColdStart` under `namespace` with dimension
`FunctionName`. Safe to call once per environment; returns `{:error, :already_exists}`
if attached twice. Returns `{:error, :telemetry_not_available}` without the dep.

# `build`

```elixir
@spec build(String.t(), %{optional(String.t()) =&gt; value()}, keyword()) :: map()
```

Builds the EMF record without writing it. Raises `ArgumentError` on invalid
units or too many dimensions/metrics.

# `count`

```elixir
@spec count(String.t(), String.t(), number(), keyword()) :: :ok
```

Emits a `Count` metric.

# `emit`

```elixir
@spec emit(String.t(), %{optional(String.t()) =&gt; value()}, keyword()) :: :ok
```

Emits one EMF record. `metrics` maps names to values or `{value, unit}`.

Options:
  * `:dimensions` – map of up to 30 string pairs; one dimension set
  * `:properties` – extra non-metric fields (searchable in Logs Insights)
  * `:unit` – default unit for plain numbers (default `"Count"`)
  * `:high_resolution` – `true` for 1-second storage resolution
  * `:timestamp` – Unix ms (default now)
  * `:device` – IO device (default `:stdio`; tests pass a StringIO)

# `timing`

```elixir
@spec timing(String.t(), String.t(), number(), keyword()) :: :ok
```

Emits a `Milliseconds` metric.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
