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
| `Extensions.md` | Extending without forking — the in-tree auction, onboarding, identity & commodity-risk extensions, plus five spec-only Working Drafts (receipt, performance, amendments, frameworks, negotiation) |
| `EN-16931-and-ViDA-E-Invoicing.md` | The runnable, CI-verified invoicing pipeline |
| `Serialisation.md` | JSON-LD context and cryptographic envelopes |
| `Worked-Examples.md` | Complete instances from `examples/` |
| `Validation-and-Conformance.md` | Local + CI validation, conformance tiers |
| `Conformance-Harness.md` | The v0.4.0 machine-runnable suite, levels, and certification |
| `Repository-Structure.md` | What lives where |
| `Governance-and-Versioning.md` | Stewardship, SemVer, change control, change proposals and interim resolutions, the mark grammar |
| `Contributing.md` | CLA and the change process |
| `Glossary.md` · `FAQ.md` | Reference |

## Publishing to the GitHub Wiki

The wiki is a separate git repository (`….wiki.git`) with no pull requests and no CI, so it
is treated as a **projection** of this directory, never an editing surface. Publish with:

```bash
node tools/wiki-sync.js          # drift check, both directions; exit 1 on any
node tools/wiki-sync.js --push   # project this directory → live wiki
```

The check reports pages needing publish, content drift, and **live-only pages** — a page
edited on the wiki directly is drift by definition and needs a human decision (port it here
by pull request, or `--push --prune` to delete it). Every push commit records the source
commit, so each live-wiki state traces to a reviewed tree state. This file itself is never
published. The wiki must be enabled once in Settings → Features with any first page created,
so the `.wiki.git` repository exists.

GitHub uses the file name (minus `.md`) as the page slug, so the internal
`[Text](Page-Name)` links in these files resolve correctly. `Home.md` is the landing page;
`_Sidebar.md` and `_Footer.md` render as the sidebar and footer on every page.
