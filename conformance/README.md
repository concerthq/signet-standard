# SIGNET Conformance Harness

The machine-runnable test suite that decides whether an implementation is
**SIGNET Certified** — and at which level. It is the mechanism behind the
"SIGNET Certified" mark, and the operational expression of Concert's neutrality
firewall: every implementer runs this identical, public suite (CN-1…CN-4).

> No subjective assessment. No private suite. No preferential path — for anyone,
> including Score Networks. Conformance is what the suite says it is.

## Run it

```bash
# Assess the bundled reference implementation (reaches Full):
node conformance/runner/run-conformance.js

# Assess any implementation via its adapter:
node conformance/runner/run-conformance.js --adapter path/to/your-adapter.js

# Prove the harness discriminates (the broken adapter must FAIL):
node conformance/runner/run-conformance.js --adapter conformance/adapter/broken-adapter.js
```

Each run prints a summary, writes a report under `conformance/reports/`, and exits
0 if at least **Core** is met, 1 otherwise.

## What it checks

| Req | Level | Checks | Normative |
|-----|-------|--------|-----------|
| **C-DOC** | Core | Valid documents validate; invalid documents are rejected | CDM §13.1 |
| **C-EVT** | Core | Material changes emit append-only, hash-chained events; tampering is detected | CDM §1.7, §7.1 |
| **C-PROV** | Core | Events and decisions carry provenance (`generatedBy`, `generatedAt`) | CDM §6.4, §7.2 |
| **F-MAP** | Full | Invoice → Peppol BIS Billing 3.0 preserves EN 16931 BTs; totals reconcile | CDM §8, §13.2(b) |
| **F-SEM** | Full | Policies carry executable + human-readable rules; decisions cite inputs and policies | CDM §6.3–6.5 |

**Core** = C-DOC + C-EVT + C-PROV. **Full** = Core + F-MAP + F-SEM.

## Endorsements — a second axis (draft, not in force)

Some properties are worth certifying but do not belong on the Core/Full axis,
because they are not universally applicable. **Endorsements** are additive: they
change neither level, block nobody from certifying, and are inert where unearned.

| Endorsement | Checks | Adapter surface | Status |
|-------------|--------|-----------------|--------|
| **E-MDT** Mandate Enforcement | E-MDT-1…7 — the limits a `Mandate` expresses are *respected*, not merely cited | `createAgentAdapter()` | Draft |
| **E-CNS** Consent Enforcement | E-CNS-1…5 — the terms a `Consent` expresses are honoured in the implementation's own authorisation decisions | `createConsentAdapter()` | Draft |

```bash
node conformance/rules/check-endorsements.js
node conformance/rules/check-endorsements.js --adapter conformance/adapter/broken-adapter.js
```

**`E-CNS` certifies the interoperability of the grant, not runtime access enforcement.**
Whether a production system physically refuses a read is a security-posture
property assessed under ISO 27001 and SOC 2 regimes, and Concert does not claim
to certify it. What the endorsement does establish: grant terms are represented
interoperably, the implementation's own authorisation decisions honour those
terms, and — because the determination is reproducible from the published event
stream — a third party can verify after the fact whether access decisions were
consistent with the grants then in force. This limit is why the endorsement is
named *Consent Enforcement* rather than *Data Sovereignty*.

Both proposals ([CP-Mandate-enforcement](../governance/proposals/CP-Mandate-enforcement.md),
[CP-Consent-revocation](../governance/proposals/CP-Consent-revocation.md)) are
drafts. The checks run today so the gap they close is demonstrable rather than
argumentative, but they **decide nothing**: they are not run by
`run-conformance.js`, do not appear in a conformance report, and no endorsement
may appear in a mark until its [register entry](../governance/endorsement-register.md)
moves to `active`.

## Layout

```
conformance/
├── levels.md                  Conformance levels + CN neutrality rules (normative)
├── certification.md           How an implementer becomes SIGNET Certified
├── report-schema.json         Schema for the machine-readable result (CN-4)
├── suite/
│   ├── document-conformance.json        C-DOC cases (positive + negative)
│   ├── implementation-conformance.json  C-EVT / C-PROV / F-MAP / F-SEM scenarios
│   └── endorsement-conformance.json     E-MDT / E-CNS checks (draft)
├── fixtures/
│   ├── invalid/               Documents that MUST be rejected (one per rule)
│   └── endorsement/           Mandate, policies, grants, documents, event streams
├── adapter/
│   ├── adapter-contract.md    The interface a candidate implementation exposes
│   ├── endorsement-adapters.md  The two optional surfaces (agent, consent)
│   ├── reference-adapter.js   A complete, conformant implementation (reaches Full)
│   └── broken-adapter.js      Deliberately non-conformant (proves discrimination)
├── rules/                     Cross-object rule checks, run alongside the harness
│   ├── check-codelists.js     Codelist governance: the open/core split is enforced here
│   └── check-endorsements.js  The endorsement checks (draft)
├── runner/
│   ├── run-conformance.js     The harness
│   └── lib.js                 Schema loading, canonical hashing, chain verification
└── reports/                   Generated conformance reports
```

## How "machine-runnable" is made true (CN-1)

The reference adapter reaches **Full**; the broken adapter — with three planted
defects — is correctly failed. A suite that passes everything proves nothing;
this one demonstrably discriminates.

| Defect | Result |
|--------|--------|
| Events are not hash-chained | Fails **C-EVT** |
| The UBL projection drops the tax total | Fails **F-MAP** |
| The agent cites its mandate and policies and does not enforce them | **Passes F-SEM**, fails **E-MDT-1** |

The third is the instructive one. It produces a record that is well-formed,
hash-chained by any implementation that bothers, provenance-bearing, and false:
it awards EUR 25,000,000 under a mandate whose hard ceiling is EUR 20,000,000,
with no human approval, while correctly recording `underMandate` and
`policiesApplied`. Everything the current suite examines is present and correct.
That distance — between a citation and an application — is exactly what the
endorsement adds, and it is visible in one diff.

All runs execute in CI on every commit, so the conformance claim is continuously
proven, not asserted.

## What certification does not establish

CN-1 says conformance is decided solely by this suite. It does **not** say every
MUST in the specification is decided that way. Two governance properties are
currently modelled but untested at any level — consent enforcement and mandate
enforcement — and a **Full** certification is therefore not evidence that human
oversight was enforced. This is stated at length in
[`levels.md` §5](levels.md), and it is the reason the two endorsements exist.
