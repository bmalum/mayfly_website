# `mix lambda.doctor`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mix/tasks/lambda.doctor.ex#L1)

Runs a set of checks that catch the common setup mistakes before you deploy:

  * a release with the `Mayfly.Release` steps and a `mayfly: [handler: ...]`
    option exists;
  * the configured handler resolves (module implements `Mayfly.Handler`, or a
    legacy `Module.function` exists) and its `init/1` succeeds;
  * for `layer: true` releases, the local OTP version matches the layer you
    intend to use: `--layer ARN` queries Lambda for that layer's OTP version;
    without it the public layer catalog at elixir-aws-lambda.dev is consulted
    for your OTP, `--arch` (default arm64) and `--region` (default
    `AWS_REGION`/`AWS_DEFAULT_REGION` or eu-central-1) and the matching ARN
    is printed;
  * the Elixir/OTP versions are supported;
  * infrastructure files from `mix lambda.new` (`template.yaml`, `infra/*.tf`,
    `infra/bin/app.ts`) agree with the toolchain: OTP major, pinned layer
    ARNs, architecture, runtime.

    mix lambda.doctor
    mix lambda.doctor --arch x86_64 --region us-east-1
    mix lambda.doctor --release lambda --layer arn:aws:lambda:eu-central-1:123:layer:mayfly-erlang-27-arm64:1

Exit status is 1 when any check fails.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
