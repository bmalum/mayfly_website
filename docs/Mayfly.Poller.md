# `Mayfly.Poller`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/poller.ex#L1)

One poller owns one concurrency slot: it long-polls `/runtime/invocation/next`,
runs the handler and posts the result, then polls again.

Standard Lambda runs exactly one poller. On Lambda Managed Instances
`Mayfly.Supervisor` starts `AWS_LAMBDA_MAX_CONCURRENCY` of them; each poller
is an independent process, so invocations never share state except the
handler state returned from `init/1`.

Poll failures are retried with exponential backoff (100 ms to 5 s) and
emit `[:mayfly, :poll, :error]`. Non-recoverable Runtime API answers
(HTTP 500 "container error") stop the poller, which makes the supervisor
shut the VM down as the Runtime API contract requires.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
