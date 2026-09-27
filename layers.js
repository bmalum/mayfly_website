// Generates the layer catalog from data/layers.json:
//   dist/layers/index.html                      – human-readable catalog
//   dist/layers/index.json                      – the full index
//   dist/layers/<major>/<arch>/<region>.json    – resolver: newest patch for an OTP major
//   dist/layers/<otp>/<arch>/<region>.json      – resolver: a pinned OTP version
//
// data/layers.json is the arns.json produced by mayfly's layer/publish.sh and
// committed here by the Layers workflow. Shape:
//   [{region, otp, arch, arn, alias_arn, sha256}, ...]
const fs = require("fs");
const path = require("path");

const src = "data/layers.json";
const out = "dist/layers";
const entries = fs.existsSync(src) ? JSON.parse(fs.readFileSync(src, "utf8")) : [];
const generated = fs.existsSync("data/layers.updated") ? fs.readFileSync("data/layers.updated", "utf8").trim() : null;

fs.mkdirSync(out, { recursive: true });

const cmp = (a, b) => {
  const pa = a.split(".").map(Number), pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d;
  }
  return 0;
};

const write = (rel, obj) => {
  const p = path.join(out, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
};

// Full index
write("index.json", { generated, count: entries.length, layers: entries });

// Pinned resolver
for (const e of entries) {
  write(`${e.otp}/${e.arch}/${e.region}.json`, { otp: e.otp, arch: e.arch, region: e.region, arn: e.arn, sha256: e.sha256 });
}

// Major resolver (newest patch per major/arch/region)
const byMajor = {};
for (const e of entries) {
  const major = e.otp.split(".")[0];
  const key = `${major}/${e.arch}/${e.region}`;
  if (!byMajor[key] || cmp(e.otp, byMajor[key].otp) > 0) byMajor[key] = e;
}
for (const [key, e] of Object.entries(byMajor)) {
  write(`${key}.json`, { otp: e.otp, arch: e.arch, region: e.region, arn: e.arn, alias_arn: e.alias_arn, sha256: e.sha256 });
}

// Catalog page
const regions = [...new Set(entries.map((e) => e.region))].sort();
const otps = [...new Set(entries.map((e) => e.otp))].sort(cmp).reverse();
const archs = ["arm64", "x86_64"];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const rowsFor = (otp) =>
  regions
    .map((region) => {
      const cells = archs
        .map((arch) => {
          const e = entries.find((x) => x.otp === otp && x.region === region && x.arch === arch);
          return e
            ? `<td class="p-2 align-top"><code class="text-xs text-violet-800 break-all select-all">${esc(e.arn)}</code><button class="copy ml-1 text-xs text-zinc-400 hover:text-violet-800" data-arn="${esc(e.arn)}" aria-label="Copy ARN">copy</button></td>`
            : `<td class="p-2 text-zinc-400 text-xs">–</td>`;
        })
        .join("");
      return `<tr class="border-t border-violet-100"><td class="p-2 font-mono text-xs whitespace-nowrap">${region}</td>${cells}</tr>`;
    })
    .join("\n");

const sections = otps
  .map((otp) => {
    const major = otp.split(".")[0];
    const sample = entries.find((x) => x.otp === otp);
    return `
<section class="mb-12" id="otp-${otp.replace(/\./g, "-")}">
  <h2 class="text-2xl font-bold mb-1">Erlang/OTP ${esc(otp)}</h2>
  <p class="text-sm text-zinc-600 mb-3">
    Pinned name <code class="bg-violet-100 text-violet-800 px-1 rounded">mayfly-erlang-${esc(otp.replace(/\./g, "-"))}-&lt;arch&gt;</code>,
    alias <code class="bg-violet-100 text-violet-800 px-1 rounded">mayfly-erlang-${major}-&lt;arch&gt;</code>
    ${sample ? `· sha256 arm64/x86_64 in <a class="underline" href="/layers/${esc(otp)}/arm64/${esc(sample.region)}.json">resolver JSON</a>` : ""}
    · build with <code class="bg-violet-100 text-violet-800 px-1 rounded">mise use erlang@${esc(otp)}</code>
  </p>
  <div class="overflow-x-auto bg-white rounded-lg shadow-sm border border-violet-100">
    <table class="w-full text-sm">
      <thead class="bg-violet-50 text-left"><tr><th class="p-2">Region</th><th class="p-2">arm64</th><th class="p-2">x86_64</th></tr></thead>
      <tbody>${rowsFor(otp)}</tbody>
    </table>
  </div>
</section>`;
  })
  .join("\n");

const empty = `<div class="bg-white p-8 rounded-lg shadow-sm border border-violet-100 text-center">
  <p class="text-lg font-semibold mb-2">No public layers published yet.</p>
  <p class="text-sm text-zinc-600">The <a class="underline text-violet-800" href="https://github.com/bmalum/mayfly/actions/workflows/layers.yml">Layers workflow</a> publishes them; until then build your own with <code>layer/build.sh</code> and <code>layer/publish.sh</code> (see the <a class="underline text-violet-800" href="/docs/layers">layer guide</a>).</p>
</div>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mayfly Erlang layers for AWS Lambda – ARNs by OTP version, region and architecture</title>
<meta name="description" content="Public AWS Lambda layers with Erlang/OTP for Mayfly (Elixir on Lambda). Layer ARNs for every supported OTP version, region and architecture, plus a JSON resolver.">
<link rel="canonical" href="https://elixir-aws-lambda.dev/layers/">
<meta property="og:title" content="Mayfly Erlang layers for AWS Lambda">
<meta property="og:description" content="Layer ARNs for every supported OTP version, region and architecture.">
<meta property="og:url" content="https://elixir-aws-lambda.dev/layers/">
<meta property="og:image" content="https://elixir-aws-lambda.dev/og-image.png">
<link rel="icon" type="image/png" href="/elixir-drop-only.png">
<link href="/output.css" rel="stylesheet">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Dataset","name":"Mayfly Erlang Lambda layer ARNs","description":"Public AWS Lambda layer ARNs providing Erlang/OTP for Mayfly, by OTP version, region and architecture.","url":"https://elixir-aws-lambda.dev/layers/","license":"https://www.apache.org/licenses/LICENSE-2.0","creator":{"@type":"Organization","name":"Karrer","url":"https://karrer.solutions"},"distribution":[{"@type":"DataDownload","encodingFormat":"application/json","contentUrl":"https://elixir-aws-lambda.dev/layers/index.json"}]}
</script>
</head>
<body class="bg-gradient-to-b from-white to-violet-50 text-zinc-700">
<nav class="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-violet-100 z-50">
  <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
    <a href="/" class="flex items-center gap-3"><img src="/elixir-drop-only.png" class="h-10" width="40" height="40" alt="Elixir logo"><span class="text-2xl font-bold text-violet-800">Mayfly</span></a>
    <ul class="flex gap-6 text-sm font-medium"><li><a href="/docs/" class="hover:text-violet-800">Docs</a></li><li><a href="/docs/layers" class="hover:text-violet-800">Layer guide</a></li><li><a href="https://github.com/bmalum/mayfly" class="hover:text-violet-800">GitHub</a></li></ul>
  </div>
</nav>
<main class="max-w-6xl mx-auto px-4 py-12">
  <h1 class="text-4xl font-bold text-zinc-800 mb-3">Erlang layers for AWS Lambda</h1>
  <p class="text-zinc-600 mb-2 max-w-3xl">Public Lambda layers that provide Erlang/OTP at <code>/opt/erlang</code> for functions built with <code>mayfly: [layer: true]</code>. Attach the ARN for your region and architecture; your build toolchain must use the same OTP version (<code>mix lambda.doctor</code> checks it).</p>
  <p class="text-sm text-zinc-500 mb-8">${entries.length} layer versions${generated ? ` · updated ${esc(generated)}` : ""} · rebuilt weekly by the <a class="underline" href="https://github.com/bmalum/mayfly/actions/workflows/layers.yml">Layers workflow</a> · checksums on the <a class="underline" href="https://github.com/bmalum/mayfly/releases/tag/layers">layers release</a></p>

  <div class="bg-white p-5 rounded-lg shadow-sm border border-violet-100 mb-12 text-sm">
    <h2 class="font-bold mb-2">Resolver API</h2>
    <p class="text-zinc-600 mb-2">Static JSON, CORS-free, cacheable:</p>
    <pre class="text-xs bg-zinc-900 text-zinc-100 p-3 rounded overflow-x-auto"><code>GET /layers/27/arm64/eu-central-1.json          # newest 27.x patch → {"otp","arn","alias_arn","sha256"}
GET /layers/27.3.4.18/arm64/eu-central-1.json   # a pinned version
GET /layers/index.json                          # everything</code></pre>
    <p class="text-zinc-600 mt-2"><code>mix lambda.doctor</code> uses this to pick the layer that matches your local OTP.</p>
  </div>

  ${entries.length ? sections : empty}
</main>
<footer class="bg-zinc-900 text-zinc-400 py-8 text-center text-sm"><p>© 2025–2026 <a href="https://karrer.solutions" class="underline hover:text-white">Karrer</a>. Layers are Apache-2.0 (Erlang/OTP), Mayfly is MIT.</p></footer>
<script>
document.addEventListener("click", (e) => {
  const b = e.target.closest("button.copy"); if (!b) return;
  navigator.clipboard.writeText(b.dataset.arn).then(() => { b.textContent = "copied"; setTimeout(() => (b.textContent = "copy"), 1200); });
});
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(out, "index.html"), html);
console.log(`layers: ${entries.length} entries, ${otps.length} OTP versions, ${regions.length} regions`);
