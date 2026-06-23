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

## Layout

```
conformance/
├── levels.md                  Conformance levels + CN neutrality rules (normative)
├── certification.md           How an implementer becomes SIGNET Certified
├── report-schema.json         Schema for the machine-readable result (CN-4)
├── suite/
│   ├── document-conformance.json        C-DOC cases (positive + negative)
│   └── implementation-conformance.json  C-EVT / C-PROV / F-MAP / F-SEM scenarios
├── fixtures/
│   └── invalid/               Documents that MUST be rejected (one per rule)
├── adapter/
│   ├── adapter-contract.md    The interface a candidate implementation exposes
│   ├── reference-adapter.js   A complete, conformant implementation (reaches Full)
│   └── broken-adapter.js      Deliberately non-conformant (proves discrimination)
├── runner/
│   ├── run-conformance.js     The harness
│   └── lib.js                 Schema loading, canonical hashing, chain verification
└── reports/                   Generated conformance reports
```

## How "machine-runnable" is made true (CN-1)

The reference adapter reaches **Full**; the broken adapter — with two planted
defects (events not hash-chained, and a dropped tax total in the UBL projection)
— is correctly failed at **C-EVT** and **F-MAP**, earning level `none`. A suite
that passes everything proves nothing; this one demonstrably discriminates.

Both runs execute in CI on every commit, so the conformance claim is continuously
proven, not asserted.
