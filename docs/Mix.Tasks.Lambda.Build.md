# `mix lambda.build`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mix/tasks/lambda.build.ex#L1)

Builds the Lambda package for a release configured with `Mayfly.Release`:
a `lambda.zip` (copied to `--outdir`) or, with `--image`, a container image
for Lambda's image package type.

    mix lambda.build                       # native: MIX_ENV=prod mix release lambda
    mix lambda.build --docker              # inside Amazon Linux 2023, x86_64
    mix lambda.build --docker --arch arm64
    mix lambda.build --release other --env staging --outdir ./deploy
    mix lambda.build --image --arch arm64  # container image my_app-lambda:latest
    mix lambda.build --image --arch arm64 --push 123456789012.dkr.ecr.eu-central-1.amazonaws.com/my-app

Without `--docker`, the release is built on this machine. That is correct
when the release uses the Mayfly ERTS layer (`mayfly: [layer: true]`) or when
you are on Amazon Linux 2023 with the target architecture; otherwise use
`--docker` so the bundled ERTS matches Lambda.

## Container images (`--image`)

The release is built inside the Amazon Linux 2023 build container (as with
`--docker`) and copied into an image based on
`public.ecr.aws/lambda/provided:al2023`, at `/var/task`, with the
function handler as the image `CMD`. The base image's entrypoint runs the
Runtime Interface Emulator when `AWS_LAMBDA_RUNTIME_API` is unset, so the
image can be invoked locally:

    finch run --rm --platform linux/arm64 -p 9000:8080 my_app-lambda:latest
    curl -d '{"name":"x"}' localhost:9000/2015-03-31/functions/function/invocations

Releases with bundled ERTS and releases built for the Mayfly layer both
work; in the latter case `/opt/erlang` from the build image is copied into
the function image. Native dependencies (NIFs) are compiled in the build
stage, so no layer and no local toolchain are needed. Put a
`lambda.image.Dockerfile` in your project to customise the image (system
packages, extra files); it receives the build args `RELEASE_DIR` (release
directory relative to the project), `BUILD_IMAGE` and `HANDLER`.

`--push REPO_URI` logs in to ECR with the AWS CLI, tags and pushes, and
prints the `aws lambda create-function --package-type Image` command with
the image digest.

## Options

    --release, -r    Release name (default: first release in mix.exs)
    --env, -e        MIX_ENV for the release (default: prod)
    --outdir, -o     Where to copy lambda.zip (default: current directory)
    --docker, -d     Build inside a container from lambda.Dockerfile (docker or finch)
    --arch, -a       x86_64 (default) or arm64, Docker and image builds
    --image          Build a container image instead of a zip (implies --docker)
    --tag, -t        Image name:tag (default: <app>-lambda:latest)
    --push           ECR repository URI to push the image to
    --build-image    Tag of the Amazon Linux build image (default: mayfly-build-<app>)

---

*Consult [api-reference.md](api-reference.md) for complete listing*
