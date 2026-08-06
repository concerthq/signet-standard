# Conformance Harness

As of **v0.4.0**, the repository ships a **machine-runnable conformance harness** under
`conformance/`. It is the mechanism behind the **"SIGNET Certified"** mark and the
operational expression of Concert's neutrality firewall: every implementer runs the
*identical, public* suite (rules CN-1…CN-4). It runs in CI on every commit.

> No subjective assessment. No private suite. No preferential path — for anyone, including
> Score Networks. **Conformance is what the suite says it is.**

This page summarises `conformance/levels.md`, `conformance/certification.md`, and
`conformance/README.md`; those files are authoritative (`levels.md` is **normative**).

## What can conform

- A **document** — a single CDM instance (an Invoice, a Decision, …). Document conformance
  is purely structural (CDM §13.1).
- An **implementation** — a system that reads, writes, and changes CDM documents.
  Implementation conformance additionally covers behaviour: round-trip fidelity, mapping
  fidelity, and event/provenance integrity (CDM §13.2).

**Only implementations are certified.** Document conformance is a building block of it.

## Conformance levels

| Level | Requirements | Corresponds to |
|-------|--------------|----------------|
| **SIGNET Core v0.1** | C-DOC + C-EVT + C-PROV | Wire contract + event/audit integrity |
| **SIGNET Full v1.0** | Core + F-MAP + F-SEM | Core + behavioural semantics + interoperability |

The suite reports `pass | fail | not-applicable` per requirement and computes the **highest
level fully satisfied** (`Full`, `Core`, or `none`). Partial results are reported honestly —
**there is no rounding up.** `not-applicable` is narrow: it is available only where the
implementation does not exchange the object class a requirement constrains at all, and it never
contributes to a level.

### Endorsements — a second axis (draft, not in force)

Some properties are worth certifying but do not belong on the level axis, because they are not
universally applicable — an implementation may run agents but hold no access-controlled
documents, or the reverse. **Endorsements** are additive: they change neither level, block
nobody from certifying, and are inert where unearned.

| Endorsement | What it would establish |
|-------------|-------------------------|
| **`E-MDT` Mandate Enforcement** | The limits a [Mandate](Agent-Layer#mandate) expresses were *respected*, not merely cited |
| **`E-CNS` Consent Enforcement** | The terms a [Consent](Trust-Layer#consent) expresses are honoured in the implementation's own authorisation decisions |

Both are drafts. Their checks run today (`node conformance/rules/check-endorsements.js`) so the
gap they close is demonstrable, but they decide no level and no endorsement may appear in a mark
until the corresponding proposal carries.

### What certification does not establish

Conformance is decided solely by this suite — but that is narrower than "every MUST in the
specification". The suite decides the five requirements below and no others. Two governance
properties are currently **modelled but not tested**, and therefore not certified: that consent
terms have consequence, and that mandate limits are respected. **A Full certification is not
evidence that human oversight was enforced.** *Modelled*, *tested*, and *certified* are three
different statements, and the endorsements above exist to close the distance between the first
two.

## The requirements

| Req | Level | What it checks | Normative |
|-----|-------|----------------|-----------|
| **C-DOC** | Core | Valid documents validate against the JSON Schema; invalid documents are rejected | CDM §13.1 |
| **C-EVT** | Core | Material changes emit append-only, hash-chained [Events](Trust-Layer#event); tampering is detected | CDM §1.7, §7.1 |
| **C-PROV** | Core | Every [Event](Trust-Layer#event) and [Decision](Agent-Layer#decision) carries [Provenance](Trust-Layer#provenance) (`generatedBy`, `generatedAt`) | CDM §6.4, §7.2 |
| **F-MAP** | Full | [Invoice](Process-Layer#invoice) → Peppol BIS Billing 3.0 preserves EN 16931 BTs; totals reconcile | CDM §8, §13.2(b) |
| **F-SEM** | Full | [Policies](Agent-Layer#policy) carry executable **and** human-readable rules; [Decisions](Agent-Layer#decision) cite their inputs and policies | CDM §6.3–6.5 |

## Run it

```bash
# Assess the bundled reference implementation (reaches Full):
node conformance/runner/run-conformance.js          # or: npm run conformance

# Assess any implementation via its adapter:
node conformance/runner/run-conformance.js --adapter path/to/your-adapter.js

# Prove the harness discriminates (the broken adapter must FAIL):
npm run conformance:broken
```

Each run prints a summary, writes a report under `conformance/reports/`, and **exits 0 if at
least Core is met, 1 otherwise**.

Expected output for the reference adapter:

```
  [PASS]  C-DOC   Core  CDM 13.1
  [PASS]  C-EVT   Core  CDM 1.7,7.1
  [PASS]  C-PROV  Core  CDM 6.4,7.2
  [PASS]  F-MAP   Full  CDM 8,13.2(b)
  [PASS]  F-SEM   Full  CDM 6.3-6.5
  LEVEL ACHIEVED: FULL
```

## The adapter contract

To be assessed, a candidate exposes a small Node adapter exporting `createAdapter()`, which
returns an object with four methods. The harness drives the adapter through conformance
scenarios; the adapter translates them into the implementation's own operations. This keeps
the suite identical for everyone (CN-2) while letting any system be tested.

| Method | Must do |
|--------|---------|
| `createObject(type, data) → { document, event }` | Validate the object, attach provenance, emit an append-only Event that hash-chains to any prior event for the subject. |
| `applyChange(subjectId, change) → { document, event }` | Emit a new Event whose `previousEventHash` links to the subject's most recent event. |
| `getEvents(subjectId) → [event, …]` | Return the ordered event stream (oldest first). |
| `projectInvoiceToUBL(invoice) → string` | Project a CDM Invoice to Peppol BIS Billing 3.0 (EN 16931) UBL, preserving all mapped Business Terms. |

Non-Node implementations expose the same four operations over a thin local HTTP shim. See
`conformance/adapter/adapter-contract.md` and the worked `reference-adapter.js`.

## How "machine-runnable" is made true

The suite ships **two** adapters:

- `adapter/reference-adapter.js` — a complete, conformant in-memory implementation that
  reaches **Full**.
- `adapter/broken-adapter.js` — deliberately non-conformant, with **three** planted defects.
  Events are not hash-chained, so it fails **C-EVT**; the UBL projection drops the tax total,
  so it fails **F-MAP**; earning level `none`.

A suite that passes everything proves nothing; this one demonstrably **discriminates**. Both
runs execute in CI on every commit, so the conformance claim is continuously proven, not
asserted. See [Validation & Conformance](Validation-and-Conformance) for the CI wiring.

**The third defect is the instructive one**, because it is not a breakage. The broken adapter's
agent cites its mandate and its policies impeccably — `underMandate` names the mandate,
`policiesApplied` names every policy, the rationale reads well, provenance is present, the
`Decision` validates — and never checks whether the limits those policies express were
respected. It awards €25,000,000 under a mandate whose hard ceiling is €20,000,000, with no
human approval. **It passes F-SEM and fails E-MDT-1.** Everything the current levels examine is
present and correct; the record is well-formed, provenance-bearing, and false. That distance is
the whole argument for the endorsement, and it is visible in one diff.

## The negative document fixtures (C-DOC)

C-DOC tests positives (the [worked examples](Worked-Examples) must validate) and negatives —
documents that **MUST be rejected**, one per rule:

| Fixture | Targets |
|---------|---------|
| `invoice-missing-payable.json` | BT-115 `payableAmount` is required |
| `policy-missing-humanreadable.json` | `Policy.humanReadable` is mandatory |
| `decision-missing-provenance.json` | `Decision.provenance` is mandatory |
| `party-bad.json` | `partyType` enum + `additionalProperties` |
| `sourcing-bad-status.json` | `status` enum |

## Extension conformance rules

The core suite above assesses the **core model only** (CN — a certification is a claim about
core conformance). The four in-tree [extensions](Extensions) are conformance-assessed
**separately**, by executable **cross-object** checkers under `conformance/rules/` that go
beyond schema validation. All four run in CI on every commit.

| Checker | Extension | What it checks (beyond schema) |
|---------|-----------|--------------------------------|
| `check-onboarding.js` | [Onboarding](Extensions#the-onboarding-extension) | Conditional qualifications carry their conditions (a `valueCap` has a cap, a `pendingCheck` a due date); a qualified case references its `Decision` and `producesQualification`; case↔qualification closure holds both ways. |
| `check-auction.js` | [Auction](Extensions#example-the-auction-extension) | Exactly one winning `Bid` per closed `Auction`; the **recorded winner equals the deterministic close** (reverse/dutch: lowest; forward: highest) — the data-level statement of operator-independence; every bid respects the reserve. |
| `check-identity.js` | [Identity](Extensions#working-draft-the-identity-profile) | (**Full** level) Approver identifiers are pseudonymous; the authority credential is a `delegationOfAuthority` carrying a basis; a `Decision`'s `humanApproval` resolves to an `Approval` that points back; the authority ceiling covers the decided value. |
| `check-commodity-risk.js` | [Commodity-risk](Extensions#working-draft-the-commodity-risk-extension) | The six rules — three cross-object: reconciliation arithmetic (`hedged + floating = markToMarket`), scenario fixed-cost invariance under a price shock, and escalation-first `breachHandling` ordering. |

```bash
npm run conformance:commodity-risk   # the commodity-risk checker (runs over examples/commodity-risk/)
npm run conformance:extensions       # onboarding + auction + identity checkers
```

Each exits 0 when every rule passes; each accepts `--dir` to run over any conformant dataset.

## Certification neutrality rules (CN)

These bind **Concert as the certifier** — the operational form of the governance firewall:

- **CN-1 — Machine-runnable.** Conformance is determined solely by the suite. No subjective
  judgement contributes to a pass/fail.
- **CN-2 — Identical suite.** Every implementer is assessed against the byte-for-byte
  identical suite at a given version. No bespoke or relaxed suite for anyone.
- **CN-3 — No preferential path.** No implementer — including Score Networks — gets early
  access, pre-graded fixtures, or a privileged route. The suite is public.
- **CN-4 — Reproducible & publishable.** A result is reproducible by any third party from
  the public suite and the implementation's adapter, and the report is publishable.
  Reports conform to `conformance/report-schema.json`.

A certification that cannot cite a passing, reproducible suite report under these rules is
invalid.

## Becoming SIGNET Certified

The process is identical for every implementer (`certification.md`):

1. **Self-test** — write an adapter, run the public suite, get a report.
2. **Submit** — send Concert the report, adapter source, and suite + CDM versions.
3. **Reproduce** — Concert re-runs the identical suite; the check is mechanical (CN-1).
4. **Issue** — on a confirmed pass, Concert records the certification in the public registry
   and licenses the "SIGNET Certified" mark for that level and version.
5. **Publish** — the report and registry entry are public.

There is no committee judgement, interview, or discretionary gate. A certification is always
qualified by both versions, in the canonical form fixed by the mark grammar:
`SIGNET Certified: Full (CDM v0.1, suite v0.1)`. A new CDM **major** version requires
re-certification. Fees, where charged, are published and identical for all (CN-3) — you pay
to be assessed, not to pass.

## Layout

```
conformance/
├── levels.md                  Conformance levels + CN neutrality rules (normative)
├── certification.md           How an implementer becomes SIGNET Certified
├── report-schema.json         Schema for the machine-readable result (CN-4)
├── suite/
│   ├── document-conformance.json        C-DOC cases (positive + negative)
│   └── implementation-conformance.json  C-EVT / C-PROV / F-MAP / F-SEM scenarios
├── fixtures/invalid/          Documents that MUST be rejected (one per rule)
├── adapter/
│   ├── adapter-contract.md    The interface a candidate implementation exposes
│   ├── reference-adapter.js   A complete, conformant implementation (reaches Full)
│   └── broken-adapter.js      Deliberately non-conformant (proves discrimination)
├── runner/
│   ├── run-conformance.js     The harness
│   └── lib.js                 Schema loading, canonical hashing, chain verification
├── rules/                     Executable extension cross-object checkers (run in CI)
│   ├── check-onboarding.js    Onboarding: conditional integrity, case↔qualification closure
│   ├── check-auction.js       Auction: recorded winner == deterministic close; reserve integrity
│   ├── check-identity.js      Identity (Full): humanApproval↔Approval resolvability; ceiling ≥ value
│   └── check-commodity-risk.js  Commodity-risk: reconciliation, scenario integrity, rule ordering
└── reports/                   Generated reports (two samples committed: pass + fail)
```

## Where to go next

- [Validation & Conformance](Validation-and-Conformance) — local + CI validation, the full
  check list.
- [Governance & Versioning](Governance-and-Versioning) — how the suite is versioned with the
  CDM.
- [Standards Mapping](Standards-Mapping) and [EN 16931 & ViDA E-Invoicing](EN-16931-and-ViDA-E-Invoicing) — what F-MAP exercises.
