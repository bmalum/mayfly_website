# `mix lambda.build`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mix/tasks/lambda.build.ex#L1)

Builds the Lambda package for a release configured with `Mayfly.Release`
and copies the resulting `lambda.zip` to `--outdir`.

    mix lambda.build                       # native: MIX_ENV=prod mix release lambda
    mix lambda.build --docker              # inside Amazon Linux 2023, x86_64
    mix lambda.build --docker --arch arm64
    mix lambda.build --release other --env staging --outdir ./deploy

Without `--docker`, the release is built on this machine. That is correct
when the release uses the Mayfly ERTS layer (`mayfly: [layer: true]`) or when
you are on Amazon Linux 2023 with the target architecture; otherwise use
`--docker` so the bundled ERTS matches Lambda.

## Options

    --release, -r    Release name (default: first release in mix.exs)
    --env, -e        MIX_ENV for the release (default: prod)
    --outdir, -o     Where to copy lambda.zip (default: current directory)
    --docker, -d     Build inside a container from lambda.Dockerfile (docker or finch)
    --arch, -a       x86_64 (default) or arm64, Docker only
    --image          Docker image tag (default: mayfly-build-<app>)

---

*Consult [api-reference.md](api-reference.md) for complete listing*
