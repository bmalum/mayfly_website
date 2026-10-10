# `Mayfly.Release`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/release.ex#L1)

Turns `mix release` into a Lambda package builder.

    # mix.exs
    def project do
      [
        releases: [
          lambda: [
            steps: [&Mayfly.Release.prepare/1, :assemble, &Mayfly.Release.bootstrap/1, &Mayfly.Release.zip/1],
            mayfly: [handler: MyApp.Handler]
          ]
        ]
      ]
    end

    MIX_ENV=prod mix release lambda      # -> _build/prod/rel/lambda/lambda.zip

Use function captures, not a call such as `Mayfly.Release.steps()`: `mix.exs`
is evaluated before dependencies are compiled, and a capture of a remote
function does not require the module to be loaded, so `mix deps.get` on a
fresh clone works. Drop `&Mayfly.Release.zip/1` if you only want the
directory.

## `:mayfly` options

  * `:handler` (required) – module implementing `Mayfly.Handler` or a
    `"Module.function"` string. Written into `bootstrap` as the default
    `_HANDLER`; the Lambda **Handler** setting overrides it.
  * `:layer` – build for the Mayfly ERTS layer: sets `include_erts: false`
    and makes `bootstrap` use `/opt/erlang/bin/erl` (default `false`).
    The zip then contains only BEAM files and can be built on any OS.

`prepare/1` applies these defaults unless you set them yourself:
`include_executables_for: [:unix]`, `strip_beams: true`,
`rel_templates_path` pointing at Mayfly's `vm.args` template (no
distribution, `+sbwt none`, `RELEASE_TMP=/tmp`).

Everything else is a normal release: umbrellas, several releases,
`config/runtime.exs`, `--overwrite`, `MIX_ENV=prod`.

# `bootstrap`

```elixir
@spec bootstrap(Mix.Release.t()) :: Mix.Release.t()
```

Release step: writes an executable `bootstrap` into the release root.

Lambda runs `bootstrap` from `/var/task`. The script sets `RELEASE_TMP=/tmp`
(`/var/task` is read-only), disables distribution and runs
`bin/<release> eval "Mayfly.Boot.main()"`. When ERTS is not bundled it
prepends the layer's `/opt/erlang/bin` (or `$MAYFLY_ERTS/bin`) to `PATH`.

# `prepare`

```elixir
@spec prepare(Mix.Release.t()) :: Mix.Release.t()
```

Release step (before `:assemble`): applies Lambda-friendly defaults.

# `zip`

```elixir
@spec zip(Mix.Release.t()) :: Mix.Release.t()
```

Release step: zips the release directory into `<release path>/lambda.zip`.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
