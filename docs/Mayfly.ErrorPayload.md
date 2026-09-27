# `Mayfly.ErrorPayload`
[🔗](https://github.com/bmalum/mayfly/blob/v1.0.0-rc.1/lib/mayfly/error_payload.ex#L1)

Builds the error document Lambda expects on `/runtime/invocation/<id>/error`
and `/runtime/init/error`:

    %{errorType: "KeyError", errorMessage: "key :a not found", stackTrace: [...]}

## Error types

  * Exceptions raised by a handler use their module name
    (`"KeyError"`, `"MyApp.ValidationError"`).
  * `{:error, reason}` returned by a handler is `"HandlerError"`, unless
    `reason` is already a map with `errorType`/`errorMessage` (atom or string
    keys), which is passed through so handlers can emit structured errors.
  * `exit/1` and `throw/1` become `"Exit"` and `"Throw"`.
  * Runtime-detected problems use `Runtime.*` types
    (`Runtime.InvalidResponse`, `Runtime.NoSuchHandler`, ...).

## Header type

Lambda classifies errors by the `Lambda-Runtime-Function-Error-Type` header
and normalises anything not shaped like `<Category.Reason>` (Category being
`Runtime` or `Function`) to `Runtime.Unknown`/`Function.Unknown`.
`header_type/1` derives a conforming value: `Runtime.*` is kept as is, every
other type is prefixed with `Function.` and stripped of dots.

Whatever a handler returns in `{:error, reason}` ends up in the payload,
which API Gateway may forward to clients. Terms are rendered with a bounded
`inspect/2`.

# `t`

```elixir
@type t() :: %{
  errorType: String.t(),
  errorMessage: String.t(),
  stackTrace: [String.t()]
}
```

# `format_stacktrace`

```elixir
@spec format_stacktrace(Exception.stacktrace() | nil) :: [String.t()]
```

Formats a stacktrace as a list of lines, dropping frames that belong to
Mayfly itself so the handler's frames come first.

# `from_caught`

```elixir
@spec from_caught(:exit | :throw | :error, term(), Exception.stacktrace() | nil) ::
  t()
```

Builds a payload from a value caught with `catch kind, reason`.

# `from_term`

```elixir
@spec from_term(term(), Exception.stacktrace() | nil) :: t()
```

Builds a payload from an exception, a handler `{:error, reason}` value or any term.

# `header_type`

```elixir
@spec header_type(String.t()) :: String.t()
```

Value for the `Lambda-Runtime-Function-Error-Type` header.

    iex> Mayfly.ErrorPayload.header_type("Runtime.InvalidResponse")
    "Runtime.InvalidResponse"
    iex> Mayfly.ErrorPayload.header_type("MyApp.Validation.Error")
    "Function.MyAppValidationError"
    iex> Mayfly.ErrorPayload.header_type("HandlerError")
    "Function.HandlerError"

# `runtime`

```elixir
@spec runtime(String.t(), String.t()) :: t()
```

Builds a runtime error payload with an explicit `Runtime.*` type.

# `xray_cause`

```elixir
@spec xray_cause(t()) :: map()
```

X-Ray cause document (`Lambda-Runtime-Function-Xray-Error-Cause`).

---

*Consult [api-reference.md](api-reference.md) for complete listing*
