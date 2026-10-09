# `Mayfly.Shutdown`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/shutdown.ex#L1)

Graceful shutdown on `SIGTERM`.

Lambda only tells a runtime that its execution environment is going away
when an **external extension** is registered: it then sends `SIGTERM` to
the runtime process and allows up to 2 s before `SIGKILL`. Without one, the
environment is simply frozen and later discarded, and anything buffered in
memory (log lines not yet written, metrics not yet flushed, a connection
pool mid-request) is lost.

Mayfly ships that extension as the layer `mayfly-shutdown-<arch>` (a few KB,
see `layer/shutdown-extension/`). Attach it, and the runtime receives
`SIGTERM`; this module turns the signal into:

1. `:telemetry` event `[:mayfly, :shutdown]` with `%{reason: :sigterm}`;
2. the hooks registered with `register/1` (your `init/1` can register one to
   drain a queue or close connections), each bounded by `:hook_timeout_ms`;
3. `Logger.flush/0`;
4. `System.halt(0)`.

`Mayfly.Boot.main/0` installs the handler automatically. Without the layer
nothing changes: Lambda never sends the signal.

    def init(_opts) do
      Mayfly.Shutdown.register(fn -> MyApp.Metrics.flush() end)
      {:ok, nil}
    end

# `register`

```elixir
@spec register((-&gt; any()), GenServer.server()) :: :ok
```

Registers a zero-arity function to run on shutdown. Returns `:ok`.

# `run`

```elixir
@spec run(GenServer.server()) :: :ok
```

Runs the shutdown sequence now (hooks, log flush, halt) as if `SIGTERM` had
arrived. Used by the signal handler and by tests (pass `halt: fn _ -> :ok end`
at start to keep the VM alive).

---

*Consult [api-reference.md](api-reference.md) for complete listing*
