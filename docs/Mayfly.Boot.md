# `Mayfly.Boot`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/boot.ex#L1)

Entry point used by the generated `bootstrap` script:

    bin/my_app eval "Mayfly.Boot.main()"

`main/0` configures logging from Lambda's environment
(`AWS_LAMBDA_LOG_FORMAT`, `AWS_LAMBDA_LOG_LEVEL`, `LOGLEVEL`), starts the
user's OTP application(s) and then the runtime, and blocks forever. If the
runtime cannot initialise (bad handler, failing `init/1`) the error has been
reported to Lambda and the VM exits with status 1.

Nothing in Mayfly starts implicitly: adding the dependency has no effect on
`mix test` or `iex -S mix` in your project.

# `main`

```elixir
@spec main([String.t()]) :: no_return()
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
