// Generates the layer catalog from data/layers.json:
//   dist/layers/index.html                      – catalog page (picker + full tables)
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
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// ---- JSON outputs ----------------------------------------------------------
write("index.json", { generated, count: entries.length, layers: entries });
for (const e of entries) {
  write(`${e.otp}/${e.arch}/${e.region}.json`, { otp: e.otp, arch: e.arch, region: e.region, arn: e.arn, sha256: e.sha256 });
}
const byMajor = {};
for (const e of entries) {
  const key = `${e.otp.split(".")[0]}/${e.arch}/${e.region}`;
  if (!byMajor[key] || cmp(e.otp, byMajor[key].otp) > 0) byMajor[key] = e;
}
for (const [key, e] of Object.entries(byMajor)) {
  write(`${key}.json`, { otp: e.otp, arch: e.arch, region: e.region, arn: e.arn, alias_arn: e.alias_arn, sha256: e.sha256 });
}

// ---- Page ------------------------------------------------------------------
const regionNames = {
  "eu-central-1": "Frankfurt", "eu-west-1": "Ireland", "eu-west-2": "London", "eu-west-3": "Paris", "eu-north-1": "Stockholm",
  "us-east-1": "N. Virginia", "us-east-2": "Ohio", "us-west-1": "N. California", "us-west-2": "Oregon", "ca-central-1": "Canada",
  "sa-east-1": "São Paulo", "ap-southeast-1": "Singapore", "ap-southeast-2": "Sydney", "ap-northeast-1": "Tokyo",
  "ap-northeast-2": "Seoul", "ap-south-1": "Mumbai",
};
const regions = [...new Set(entries.map((e) => e.region))].sort();
const otps = [...new Set(entries.map((e) => e.otp))].sort(cmp).reverse();
const archs = ["arm64", "x86_64"];
const regionLabel = (r) => (regionNames[r] ? `${r} · ${regionNames[r]}` : r);

// Copy button markup: icon + text, JS swaps to "Copied".
const copyBtn = (arn, cls = "") =>
  `<button type="button" class="copy inline-flex items-center gap-1 rounded-md border border-violet-200 bg-white px-2 py-1 text-xs font-medium text-violet-800 hover:bg-violet-50 active:bg-violet-100 transition ${cls}" data-arn="${esc(arn)}" aria-label="Copy ARN">
     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy</span>
   </button>`;

const tableFor = (otp) => `
<table class="w-full text-sm">
  <thead class="bg-violet-50/70 text-left text-xs uppercase tracking-wide text-zinc-500">
    <tr><th class="px-4 py-2 font-semibold">Region</th><th class="px-4 py-2 font-semibold">arm64</th><th class="px-4 py-2 font-semibold">x86_64</th></tr>
  </thead>
  <tbody class="divide-y divide-violet-100">
  ${regions
    .map((region) => {
      const cells = archs
        .map((arch) => {
          const e = entries.find((x) => x.otp === otp && x.region === region && x.arch === arch);
          if (!e) return `<td class="px-4 py-2 text-zinc-400">–</td>`;
          const version = e.arn.split(":").pop();
          return `<td class="px-4 py-2">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs text-zinc-700 truncate" title="${esc(e.arn)}">…:layer:${esc(e.arn.split(":layer:")[1])}</span>
              ${copyBtn(e.arn, "shrink-0")}
            </div></td>`;
        })
        .join("");
      return `<tr class="hover:bg-violet-50/40"><td class="px-4 py-2 whitespace-nowrap"><span class="font-mono text-xs">${region}</span><span class="ml-2 text-xs text-zinc-400">${esc(regionNames[region] || "")}</span></td>${cells}</tr>`;
    })
    .join("\n")}
  </tbody>
</table>`;

const sections = otps
  .map((otp, i) => {
    const major = otp.split(".")[0];
    const count = entries.filter((e) => e.otp === otp).length;
    return `
<details class="group rounded-xl border border-violet-100 bg-white shadow-sm" ${i === 0 ? "open" : ""} id="otp-${otp.replace(/\./g, "-")}">
  <summary class="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 list-none">
    <div>
      <h2 class="text-lg font-bold text-zinc-800">Erlang/OTP ${esc(otp)}</h2>
      <p class="text-xs text-zinc-500 mt-0.5">
        pinned <code class="rounded bg-violet-50 px-1 text-violet-800">mayfly-erlang-${esc(otp.replace(/\./g, "-"))}-&lt;arch&gt;</code>
        · alias <code class="rounded bg-violet-50 px-1 text-violet-800">mayfly-erlang-${major}-&lt;arch&gt;</code>
        · ${count} ARNs · <code class="rounded bg-violet-50 px-1 text-violet-800">mise use erlang@${esc(otp)}</code>
      </p>
    </div>
    <svg class="h-5 w-5 shrink-0 text-zinc-400 transition group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd"/></svg>
  </summary>
  <div class="overflow-x-auto border-t border-violet-100">${tableFor(otp)}</div>
</details>`;
  })
  .join("\n");

const options = (items, labelFn = (x) => x) => items.map((v) => `<option value="${esc(v)}">${esc(labelFn(v))}</option>`).join("");

const picker = `
<section class="rounded-2xl border border-violet-100 bg-white shadow-sm p-6 mb-10" aria-labelledby="picker-heading">
  <h2 id="picker-heading" class="text-lg font-bold text-zinc-800 mb-4">Find your layer</h2>
  <div class="grid gap-4 sm:grid-cols-3">
    <label class="block text-sm"><span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Erlang/OTP</span>
      <select id="pick-otp" class="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200">${options(otps)}</select></label>
    <label class="block text-sm"><span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Architecture</span>
      <select id="pick-arch" class="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200">${options(archs)}</select></label>
    <label class="block text-sm"><span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Region</span>
      <select id="pick-region" class="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200">${options(regions, regionLabel)}</select></label>
  </div>

  <div class="mt-5 rounded-xl bg-zinc-900 p-4 text-zinc-100">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="text-[11px] uppercase tracking-wide text-zinc-400">Layer ARN (pinned)</div>
        <code id="pick-arn" class="block break-all font-mono text-sm text-violet-200 mt-1"></code>
        <div class="text-[11px] uppercase tracking-wide text-zinc-400 mt-3">Alias (newest patch of this major)</div>
        <code id="pick-alias" class="block break-all font-mono text-xs text-zinc-300 mt-1"></code>
      </div>
      <button type="button" id="pick-copy" class="shrink-0 inline-flex items-center gap-1 rounded-md bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy ARN</span>
      </button>
    </div>
    <div class="mt-4 border-t border-zinc-800 pt-3 text-xs text-zinc-400">
      <div class="flex flex-wrap gap-x-6 gap-y-1">
        <span>sha256 <code id="pick-sha" class="font-mono text-zinc-300"></code></span>
        <span>toolchain <code id="pick-mise" class="font-mono text-zinc-300"></code></span>
        <a id="pick-json" class="underline hover:text-white" href="#">resolver JSON</a>
      </div>
    </div>
  </div>

  <pre class="mt-4 overflow-x-auto rounded-xl bg-violet-50 p-4 text-xs leading-relaxed text-zinc-800"><code id="pick-cli"></code></pre>
</section>`;

const resolverDocs = `
<section class="rounded-2xl border border-violet-100 bg-white shadow-sm p-6 mb-10">
  <h2 class="text-lg font-bold text-zinc-800 mb-1">Resolver API</h2>
  <p class="text-sm text-zinc-600 mb-3">Static JSON, cacheable, no auth. <code class="rounded bg-violet-50 px-1 text-violet-800">mix lambda.doctor</code> uses it to pick the layer matching your local OTP.</p>
  <div class="grid gap-2 text-sm font-mono">
    <div class="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4"><code class="text-violet-800">/layers/27/arm64/eu-central-1.json</code><span class="text-xs text-zinc-500 font-sans">newest 27.x patch → otp, arn, alias_arn, sha256</span></div>
    <div class="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4"><code class="text-violet-800">/layers/27.3.4.18/arm64/eu-central-1.json</code><span class="text-xs text-zinc-500 font-sans">one pinned version</span></div>
    <div class="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4"><code class="text-violet-800">/layers/index.json</code><span class="text-xs text-zinc-500 font-sans">everything</span></div>
  </div>
</section>`;

const empty = `<div class="rounded-2xl border border-violet-100 bg-white p-10 text-center shadow-sm">
  <p class="text-lg font-semibold mb-2">No public layers published yet.</p>
  <p class="text-sm text-zinc-600">The <a class="underline text-violet-800" href="https://github.com/bmalum/mayfly/actions/workflows/layers.yml">Layers workflow</a> publishes them; until then build your own with <code>layer/build.sh</code> and <code>layer/publish.sh</code> (see the <a class="underline text-violet-800" href="/docs/layers">layer guide</a>).</p>
</div>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#5b21b6">
<title>Erlang layers for AWS Lambda – Mayfly layer catalog (ARNs by OTP, region, architecture)</title>
<meta name="description" content="Public AWS Lambda layers with Erlang/OTP for Mayfly (Elixir on Lambda). Pick OTP version, architecture and region to get the layer ARN, or use the static JSON resolver.">
<link rel="canonical" href="https://elixir-aws-lambda.dev/layers/">
<meta property="og:title" content="Erlang layers for AWS Lambda – Mayfly">
<meta property="og:description" content="Layer ARNs for every supported OTP version, region and architecture, plus a JSON resolver.">
<meta property="og:url" content="https://elixir-aws-lambda.dev/layers/">
<meta property="og:image" content="https://elixir-aws-lambda.dev/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/elixir-drop-only.png">
<link href="/output.css" rel="stylesheet">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Dataset","name":"Mayfly Erlang Lambda layer ARNs","description":"Public AWS Lambda layer ARNs providing Erlang/OTP for Mayfly, by OTP version, region and architecture.","url":"https://elixir-aws-lambda.dev/layers/","license":"https://www.apache.org/licenses/LICENSE-2.0","creator":{"@type":"Organization","name":"Karrer","url":"https://karrer.solutions"},"distribution":[{"@type":"DataDownload","encodingFormat":"application/json","contentUrl":"https://elixir-aws-lambda.dev/layers/index.json"}]}
</script>
</head>
<body class="bg-gradient-to-b from-white to-violet-50 text-zinc-700">
<nav class="sticky top-0 z-50 border-b border-violet-100 bg-white/90 backdrop-blur-sm">
  <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
    <a href="/" class="flex items-center gap-3"><img src="/elixir-drop-only.png" class="h-10" width="40" height="40" alt="Elixir logo"><span class="text-2xl font-bold text-violet-800">Mayfly</span></a>
    <ul class="flex gap-6 text-sm font-medium"><li><a href="/docs/" class="hover:text-violet-800">Docs</a></li><li><a href="/docs/layers" class="hover:text-violet-800">Layer guide</a></li><li><a href="https://github.com/bmalum/mayfly" class="hover:text-violet-800">GitHub</a></li></ul>
  </div>
</nav>
<main class="mx-auto max-w-6xl px-4 py-12">
  <div class="mb-8 max-w-3xl">
    <h1 class="text-4xl font-bold text-zinc-800 mb-3">Erlang layers for AWS Lambda</h1>
    <p class="text-zinc-600">Public Lambda layers that provide Erlang/OTP at <code class="rounded bg-violet-50 px-1 text-violet-800">/opt/erlang</code> for functions built with <code class="rounded bg-violet-50 px-1 text-violet-800">mayfly: [layer: true]</code>. Your build toolchain must use the same OTP version; <code class="rounded bg-violet-50 px-1 text-violet-800">mix lambda.doctor</code> checks it.</p>
    <p class="mt-3 text-sm text-zinc-500">${entries.length} layer versions · ${regions.length} regions${generated ? ` · updated ${esc(generated)}` : ""} · rebuilt weekly by the <a class="underline" href="https://github.com/bmalum/mayfly/actions/workflows/layers.yml">Layers workflow</a> · checksums on the <a class="underline" href="https://github.com/bmalum/mayfly/releases/tag/layers">layers release</a></p>
  </div>

  ${entries.length ? picker : ""}
  ${resolverDocs}

  ${entries.length ? `<h2 class="mb-4 text-2xl font-bold text-zinc-800">All layers</h2><div class="space-y-4">${sections}</div>` : empty}
</main>
<footer class="bg-zinc-900 py-8 text-center text-sm text-zinc-400"><p>© 2025–2026 <a href="https://karrer.solutions" class="underline hover:text-white">Karrer</a>. Erlang/OTP is Apache-2.0, Mayfly is MIT.</p></footer>

<script>
(() => {
  const DATA = ${JSON.stringify(entries.map(({ region, otp, arch, arn, alias_arn, sha256 }) => ({ region, otp, arch, arn, alias_arn, sha256 })))};
  const $ = (id) => document.getElementById(id);
  const copyText = (btn, text) => navigator.clipboard.writeText(text).then(() => {
    const span = btn.querySelector("span"); const old = span.textContent;
    span.textContent = "Copied"; btn.classList.add("ring-2", "ring-violet-300");
    setTimeout(() => { span.textContent = old; btn.classList.remove("ring-2", "ring-violet-300"); }, 1200);
  });

  document.addEventListener("click", (e) => {
    const b = e.target.closest("button.copy"); if (b) copyText(b, b.dataset.arn);
  });

  if (!$("pick-otp")) return;
  const params = new URLSearchParams(location.search);
  const guessRegion = () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (/^Europe\\/(Berlin|Vienna|Zurich|Prague|Warsaw|Amsterdam|Brussels|Copenhagen|Oslo)/.test(tz)) return "eu-central-1";
    if (/^Europe\\/(London|Dublin|Lisbon)/.test(tz)) return "eu-west-1";
    if (/^Europe\\/(Paris|Madrid|Rome)/.test(tz)) return "eu-west-3";
    if (/^Europe\\/(Stockholm|Helsinki)/.test(tz)) return "eu-north-1";
    if (/^America\\/(Los_Angeles|Vancouver)/.test(tz)) return "us-west-2";
    if (/^America\\//.test(tz)) return "us-east-1";
    if (/^Asia\\/(Tokyo)/.test(tz)) return "ap-northeast-1";
    if (/^Asia\\/(Singapore|Kuala_Lumpur|Jakarta)/.test(tz)) return "ap-southeast-1";
    if (/^Australia\\//.test(tz)) return "ap-southeast-2";
    return "eu-central-1";
  };
  const setIf = (id, v) => { const el = $(id); if (v && [...el.options].some((o) => o.value === v)) el.value = v; };
  setIf("pick-otp", params.get("otp")); setIf("pick-arch", params.get("arch") || "arm64"); setIf("pick-region", params.get("region") || guessRegion());

  const render = () => {
    const otp = $("pick-otp").value, arch = $("pick-arch").value, region = $("pick-region").value;
    const e = DATA.find((x) => x.otp === otp && x.arch === arch && x.region === region);
    if (!e) { $("pick-arn").textContent = "not published for this combination"; $("pick-alias").textContent = ""; return; }
    $("pick-arn").textContent = e.arn; $("pick-alias").textContent = e.alias_arn;
    $("pick-sha").textContent = e.sha256.slice(0, 16) + "…"; $("pick-mise").textContent = "mise use erlang@" + otp;
    $("pick-json").href = "/layers/" + otp + "/" + arch + "/" + region + ".json";
    $("pick-cli").textContent =
      "aws lambda create-function --function-name my-fn \\\\\\n" +
      "  --runtime provided.al2023 --architectures " + arch + " \\\\\\n" +
      "  --handler MyApp.Handler --layers " + e.arn + " \\\\\\n" +
      "  --zip-file fileb://_build/prod/rel/lambda/lambda.zip --role arn:aws:iam::ACCOUNT:role/lambda-role";
    history.replaceState(null, "", "?otp=" + otp + "&arch=" + arch + "&region=" + region);
  };
  ["pick-otp", "pick-arch", "pick-region"].forEach((id) => $(id).addEventListener("change", render));
  $("pick-copy").addEventListener("click", () => copyText($("pick-copy"), $("pick-arn").textContent));
  render();
})();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(out, "index.html"), html);
console.log(`layers: ${entries.length} entries, ${otps.length} OTP versions, ${regions.length} regions`);
