// Generates dist/sitemap.xml from the landing page and every ExDoc HTML page.
const fs = require("fs");
const path = require("path");
const base = "https://elixir-aws-lambda.dev";
const today = new Date().toISOString().slice(0, 10);
const guides = ["getting-started", "deployment", "layers", "streaming", "observability", "architecture", "migrating-from-0-x"];
const urls = [{ loc: "/", pri: "1.0", freq: "weekly" }, { loc: "/layers/", pri: "0.9", freq: "weekly" }, { loc: "/docs/", pri: "0.9", freq: "weekly" }];
for (const f of fs.readdirSync("docs")) {
  if (!f.endsWith(".html") || ["index.html", "404.html", "search.html"].includes(f)) continue;
  const stem0 = f.replace(/\.html$/, ""); if (!stem0) continue;
  const stem = f.replace(/\.html$/, "");
  const pri = guides.includes(stem) ? "0.8" : stem === "api-reference" ? "0.6" : "0.5";
  urls.push({ loc: `/docs/`, pri, freq: "monthly" });
}
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${base}${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.freq}</changefreq><priority>${u.pri}</priority></url>`).join("\n") +
  `\n</urlset>\n`;
fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync(path.join("dist", "sitemap.xml"), xml);
console.log(`sitemap: ${urls.length} urls`);
