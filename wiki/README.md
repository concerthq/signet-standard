# SIGNET Standard — Wiki source

These Markdown files are the **draft GitHub Wiki** for the
[`concerthq/signet-standard`](https://github.com/concerthq/signet-standard) repository. They
are kept here in the main repo so they can be reviewed by pull request before being published
to the wiki.

> This directory is *non-normative* documentation. The **JSON Schema in `schema/` is the
> source of truth**, then `docs/specification.md`, then this wiki.

## Pages

| File | Wiki page |
|------|-----------|
| `Home.md` | Landing page |
| `_Sidebar.md` / `_Footer.md` | Navigation chrome (GitHub renders these automatically) |
| `Concepts-of-Open-Commerce.md` | The conceptual frame — open commerce and its primitives |
| `Introduction-and-Concepts.md` | What SIGNET is, the problem, design principles |
| `Architecture-Overview.md` | The four-layer model and lifecycle |
| `Foundation-Layer.md` · `Process-Layer.md` · `Agent-Layer.md` · `Trust-Layer.md` | The data model, layer by layer |
| `Codelists.md` | Controlled vocabularies |
| `Standards-Mapping.md` | OCDS / EN 16931 / UBL / Peppol / VC-DID / ePO bridges |
| `Compliance-Map.md` | Regulatory & compliance map (UK Procurement Act, EU AI Act, ViDA) |
| `Extensions.md` | Extending without forking — the auction, onboarding, identity & commodity-risk extensions |
| `EN-16931-and-ViDA-E-Invoicing.md` | The runnable, CI-verified invoicing pipeline |
| `Serialisation.md` | JSON-LD context and cryptographic envelopes |
| `Worked-Examples.md` | Complete instances from `examples/` |
| `Validation-and-Conformance.md` | Local + CI validation, conformance tiers |
| `Conformance-Harness.md` | The v0.4.0 machine-runnable suite, levels, and certification |
| `Repository-Structure.md` | What lives where |
| `Extensions.md` | Extending without forking |
| `Governance-and-Versioning.md` | Stewardship, SemVer, change control |
| `Contributing.md` | CLA and the change process |
| `Glossary.md` · `FAQ.md` | Reference |

## Publishing to the GitHub Wiki

The wiki is a separate git repository
(`https://github.com/concerthq/signet-standard.wiki.git`). To publish, the wiki must be
**enabled** in the repo's Settings → Features, and initialised once via the web UI (create
any page). Then, from outside this repo:

```bash
git clone https://github.com/concerthq/signet-standard.wiki.git
cd signet-standard.wiki
cp /path/to/signet-standard/wiki/*.md .
git add .
git commit -m "Add SIGNET project wiki"
git push
```

GitHub uses the file name (minus `.md`) as the page slug, so the internal
`[Text](Page-Name)` links in these files resolve correctly. `Home.md` is the landing page;
`_Sidebar.md` and `_Footer.md` render as the sidebar and footer on every page.
