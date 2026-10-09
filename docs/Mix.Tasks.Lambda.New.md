# `mix lambda.new`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mix/tasks/lambda.new.ex#L1)

Generates a new Elixir project that builds and deploys as an AWS Lambda
function with Mayfly.

    mix lambda.new hello
    mix lambda.new hello --iac sam --arch arm64 --otp 27
    mix lambda.new hello --iac terraform --region eu-west-1
    mix lambda.new hello --iac cdk

The project contains a `Mayfly.Handler` with an HTTP branch
(`Mayfly.Events.decode/1`), the release configuration for the Mayfly ERTS
layer, a `.tool-versions` pinning Erlang to the newest OTP patch the public
layer provides for `--otp` (looked up in the layer catalog; a built-in
table is used when offline) and a matching Elixir, an ExUnit test running
the handler through `Mayfly.LocalRuntime`, a README with the three commands
that matter, and – with `--iac` – an `infra/` folder holding a working SAM,
Terraform or CDK definition whose layer ARN map covers all public regions.

The task ships with the `mayfly` package, so it is available in any project
that depends on it. For a green-field project without a mix.exs yet:

    mix new tmp && cd tmp && mix deps.get   # with {:mayfly, "~> 1.0.0-rc"} in deps
    mix lambda.new ../hello --iac sam

or run it from a checkout of Mayfly.

## Options

    --iac       sam | terraform | cdk | none (default none)
    --http-api  add an API Gateway HTTP API (`$default` route, access logs) in
                front of the function; without it the IaC creates a Function URL only
    --arch      arm64 (default) | x86_64
    --otp       27 (default) | 28 | 29 – OTP major of the layer and the toolchain
    --region    AWS region for the IaC defaults (default $AWS_REGION or eu-central-1)
    --module    Root module name (default derived from the project name)
    --mayfly    Dependency spec for mayfly; default `"~> 1.0.0-rc"`, or
                `path:/abs/path` to use a local checkout

---

*Consult [api-reference.md](api-reference.md) for complete listing*
