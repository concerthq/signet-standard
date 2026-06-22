// Renders docs/specification.md to a single static HTML page for GitHub Pages.
// Reads the spec verbatim (never mutates the source) and wraps it in a clean,
// self-contained template. Run in CI: `npm install marked && node tools/build-pages.js`.
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const root = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(root, "docs", "specification.md"), "utf8");
const bodyHtml = marked.parse(src);

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SIGNET Canonical Data Model — Specification</title>
<meta name="description" content="The open standard for governed procurement networks. Stewarded by Concert Foundation.">
<style>
  :root { --fg:#1a1a1a; --muted:#5b6470; --accent:#0b5cad; --rule:#e6e8eb; --bg:#fff; --code:#f5f6f8; }
  @media (prefers-color-scheme: dark) {
    :root { --fg:#e6e8eb; --muted:#9aa4b2; --accent:#5aa6ff; --rule:#2a2f37; --bg:#15181c; --code:#1d2127; }
  }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--fg);
    font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; }
  .wrap { max-width: 820px; margin: 0 auto; padding: 2.5rem 1.25rem 6rem; }
  .banner { font-size:.85rem; color:var(--muted); border-bottom:1px solid var(--rule); padding-bottom:1rem; margin-bottom:2rem; }
  .banner a { color:var(--accent); text-decoration:none; }
  h1,h2,h3,h4 { line-height:1.25; margin-top:2.2em; }
  h1 { margin-top:0; font-size:2rem; }
  h2 { border-bottom:1px solid var(--rule); padding-bottom:.3em; }
  a { color:var(--accent); }
  code { background:var(--code); padding:.15em .4em; border-radius:4px; font-size:.9em;
    font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; }
  pre { background:var(--code); padding:1rem; border-radius:8px; overflow:auto; }
  pre code { background:none; padding:0; }
  table { border-collapse:collapse; width:100%; margin:1.25rem 0; font-size:.93rem; }
  th,td { border:1px solid var(--rule); padding:.5rem .65rem; text-align:left; vertical-align:top; }
  th { background:var(--code); }
  blockquote { margin:1.25rem 0; padding:.4rem 1rem; border-left:3px solid var(--accent); color:var(--muted); }
  hr { border:none; border-top:1px solid var(--rule); margin:2.5rem 0; }
</style>
</head>
<body>
<div class="wrap">
  <div class="banner">
    SIGNET Standard · version <strong>${pkg.version}</strong> ·
    <a href="https://github.com/concerthq/signet-standard">Repository</a> ·
    <a href="https://concert.foundation/standard">concert.foundation</a><br>
    This page is a convenience rendering of <code>docs/specification.md</code>.
    The <strong>JSON Schema in the repository is the normative source of truth.</strong>
  </div>
  <main>
${bodyHtml}
  </main>
</div>
</body>
</html>
`;

const outDir = path.join(root, "_site");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "index.html"), page);
// .nojekyll so GitHub Pages serves the artifact as-is.
fs.writeFileSync(path.join(outDir, ".nojekyll"), "");
console.log("Built _site/index.html from docs/specification.md");
