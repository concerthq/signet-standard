# FAQ

### What is SIGNET, in one sentence?
An open, public-domain standard for **governed procurement networks** in which human and
synthetic agents operate under shared governance, decentralised identity, and cryptographic
trust — defined by a four-layer [Canonical Data Model](Architecture-Overview).

### Is SIGNET a replacement for OCDS / EN 16931 / Peppol?
No. SIGNET is a **profile-and-bridge, not a fork**. It maps *without loss* to and from those
standards and adds what they lack (chiefly the [Agent Layer](Agent-Layer)). A SIGNET
document can be projected down to a conforming OCDS release or Peppol BIS invoice, and data
in those formats can be lifted into the CDM. See [Standards Mapping](Standards-Mapping).

### What makes SIGNET different from a normal procurement platform?
The [Agent Layer](Agent-Layer): synthetic agents are first-class, governed, accountable
participants. Every material decision records *who* decided, *under what mandate*, *from what
inputs*, *under what policy*, *with what rationale*, *with what human approval*, and *with
cryptographic provenance*. No existing procurement standard models this.

### Do I have to use JSON-LD, DIDs, and verifiable credentials?
No. JSON-LD is the *canonical* serialisation, but the `@context` is ignorable — you can treat
CDM documents as ordinary JSON (see [Serialisation](Serialisation)). DIDs are *recommended*
but URN/URI identifiers are acceptable for process objects. Credentials are optional.

### What licence is it under? Can I use it commercially?
The artifacts are dedicated to the public domain under
[CC0 1.0](https://github.com/concerthq/signet-standard/blob/main/LICENSE) — use them anywhere,
by anyone, with no attribution burden. The **marks** ("SIGNET", "Concert", "SIGNET
Certified") are administered separately by Concert Foundation; CC0 grants no rights in them.

### Is the schema or the prose authoritative?
**The JSON Schema is the source of truth.** Then the prose specification, then this wiki. See
[Validation & Conformance → Precedence](Validation-and-Conformance#precedence).

### Which JSON Schema version is used?
**Draft-07**, for maximum implementer-tooling compatibility. A migration to 2020-12 will be
considered before v1.0. See [Validation & Conformance](Validation-and-Conformance).

### How do I validate my data?
`npm install && npm run validate`. CI runs the same checks on every push and PR, so examples
cannot drift from the schema. See [Validation & Conformance](Validation-and-Conformance).

### Is the EN 16931 / Peppol conversion real or just claimed?
Real and **continuously proven in CI**. `tools/signet-to-ubl.js` projects the canonical
Invoice to UBL 2.1 / Peppol BIS Billing 3.0, and `tools/verify-ubl.py` reconciles every
Business Term and the totals — both run on every push. It is a faithful *reference*
projection, not a substitute for official Peppol XSD + Schematron validation. See
[EN 16931 & ViDA E-Invoicing](EN-16931-and-ViDA-E-Invoicing).

### How does an implementation become "SIGNET Certified"?
Run the public, machine-runnable [conformance harness](Conformance-Harness) (`conformance/`)
against your system through a small adapter, get a passing report, and submit it to Concert,
which re-runs the *identical* suite to confirm it. There are two levels — **Core** (C-DOC,
C-EVT, C-PROV) and **Full** (Core + F-MAP, F-SEM). The process is mechanical and identical
for everyone (neutrality rules CN-1…CN-4) — no committee judgement, no preferential path.

### What may I actually claim, and when?
Anyone may implement SIGNET and say so — the artifacts are CC0. *"Implements SIGNET CDM v0.1"*
and *"Self-assessed against the SIGNET conformance suite v0.1 — Core"* need no permission from
anyone, and the `self-assessed` qualifier is mandatory in the second. What requires a licence is
the assertion that **Concert assessed you**.

The licensed form is fixed by the mark grammar (`governance/mark-grammar.md`) and linted in CI:
`SIGNET Certified: Full (CDM v0.1, suite v0.1)`. Short forms are licensed only where they
resolve to the registry entry, because a claim that travels without its qualification becomes a
claim about something else.

<!-- mark-lint-ignore-next-line: these constructions are named here in order to prohibit them -->
*SIGNET Compliant*, *SIGNET Ready*, *SIGNET Approved*, *SIGNET Partner*, and *Certified by
SIGNET* are prohibited outright — conformance is not compliance, and nothing is approved.

A person is **Registered**, never Certified; a training provider is **Accredited**, never
either. Employing a registered individual is not certification of the employer.

### Does certification mean my agents are governed?
No — and this is the sharpest limit worth knowing. The suite decides the requirements in
`conformance/levels.md` §2 and no others. F-SEM requires a Decision to **cite** the policies it
applied; nothing at Core or Full requires that the limits in those policies were **respected**.
An implementation can award beyond its mandate's approval threshold with no human approval,
record `underMandate` and `policiesApplied` correctly, and reach Full. The repository ships an
adapter that does exactly this, in CI, to keep the point concrete.

*Modelled*, *tested*, and *certified* are three different claims. Mandate enforcement and
consent enforcement are currently modelled but not tested, which is what the two proposed
[endorsements](Conformance-Harness#endorsements--a-second-axis-draft-not-in-force) would close.

### Is the conformance suite real, or just a claim?
Real and in the repo since **v0.4.0**. It ships a **reference adapter** that reaches Full and a
deliberately **broken adapter** with three planted defects: events not hash-chained (fails
C-EVT), a dropped tax total in the UBL projection (fails F-MAP), and an agent that cites its
mandate and policies impeccably while enforcing neither — which **passes F-SEM** and fails
E-MDT-1. The suite demonstrably *discriminates*, and every run is in CI on every commit. Run it
with `npm run conformance` / `npm run conformance:broken`, and the endorsement checks with
`npm run conformance:endorsements`.

### Does SIGNET help with regulatory compliance?
Yes, by design. The [Decision](Agent-Layer#decision) record supports the assessment-summary
and decision-record obligations of the **UK Procurement Act 2023** and the documentation
expectations for AI-assisted evaluation under the **EU AI Act**; the
[Invoice](Process-Layer#invoice) supports **EU ViDA** e-invoicing.

### How is the model versioned?
[Semantic Versioning](Governance-and-Versioning). Major = breaking core change; minor =
backward-compatible additions; patch = clarifications. Every version is permanently
retrievable at a version-stable URI. The repository is at **v0.10.0**; the specification is a
**v0.1 working draft**.

### How do I extend SIGNET for my domain?
Publish a versioned **extension** package under its own namespace that *adds* (never changes)
structure. It may be promoted into core if broadly useful. See [Extensions](Extensions).

### How do I contribute, and what is the CLA?
Open an issue, then a PR (CI must pass). Contributions are accepted under the **Concert CLA**:
you keep ownership and grant Concert royalty-free copyright and patent licences so the
standard stays open. No contributor or operator (including Score Networks) gets a
preferential position. See [Contributing](Contributing).

### Where do I send comments on the draft?
**hello@concert.foundation**, or via the
[issue templates](https://github.com/concerthq/signet-standard/tree/main/.github/ISSUE_TEMPLATE).

### What is "Score Networks"?
A commercial operator referenced in the governance materials. SIGNET's governance explicitly
guarantees that **no** operator, including Score Networks, gains a preferential position over
other implementers. See [Governance & Versioning](Governance-and-Versioning).
