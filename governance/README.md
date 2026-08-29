# SIGNET Governance

The artifacts that govern **who decides what** about the standard, **what Concert may certify**,
and **what anyone may claim**. The normative model itself lives in [`docs/specification.md`](../docs/specification.md);
what it means to conform lives in [`conformance/levels.md`](../conformance/levels.md). This
directory holds the layer above both.

Everything here is CC0-1.0.

## Contents

| Artifact | Class | Status |
|----------|-------|--------|
| [mark-grammar.md](mark-grammar.md) | Normative for licensees (IP & Licensing Policy). Not a CDM artifact. | Interim resolution, in force pending ratification |
| [endorsement-register.md](endorsement-register.md) | Normative. Closed, append-only. | v0.1 — two entries, both `proposed` |
| [role-register.md](role-register.md) | Normative. Closed, append-only. | v0.1 — four entries, all `proposed` |
| [role-competency-framework.md](role-competency-framework.md) | Non-normative | Working Draft |
| [person-assessment.md](person-assessment.md) | Non-normative | Working Draft |
| [proposals/](proposals/) | Change proposals against the CDM, the suite, and the codelists | See the [proposals index](proposals/README.md) |
| [reviews/](reviews/) | Point-in-time reviews of merged work | — |
| [IAR-0002-state-model.md](IAR-0002-state-model.md) | Interim approval record — state model and the `Bid` correction | In force; comment period waived, departure recorded |
| [IAR-0006-registration-window.md](IAR-0006-registration-window.md) | Pre-constitution registration window; expires on constitution |
| [IR-2026-08-prior-normative-changes.md](IR-2026-08-prior-normative-changes.md) | Interim resolution — the eleven normative changes predating the written rule | In force |
| [WITHDRAWAL-2026-08.md](WITHDRAWAL-2026-08.md) | The v1.0 proposal train withdrawn to a parked state; eight defects kept | In force |
| [site-alignment/](site-alignment/) | Drafted corrections for published copy outside this repository | Superseded, **not applied** — see [OUTCOME.md](site-alignment/OUTCOME.md) |

**Series gaps, recorded so a later reader does not infer a missing record.** The IAR series begins
at 0002 — no IAR-0001 exists on any branch. The defect register on `main` runs to D-31: D-32 and
D-33 are reserved by rows on branches that have not merged
(`v0.16-iar-0003-codelist-enforcement` and `v0.16-iar-0004-registry-normative` carry D-32;
`wiki/correct-drift` carries D-33), so D-34 onward are assigned across the gap and stay stable when
those branches merge. Neither gap is an omission.

## Status vocabulary

Every artifact here is at one of three states, and the difference is load-bearing:

- **Draft** — written, not decided. Carries no obligation.
- **Interim resolution** — decided under the bootstrap clause, in force, and recorded with its
  reasoning. An interim resolution is a decision, minuted as such — not a deferral. The Standards
  Committee may ratify, amend, or reverse it once constituted.
- **Ratified** — carried by the Standards Committee. Nothing here has reached this state, because no
  committee is yet constituted.

## The bootstrap clause

No Standards Committee is constituted. Referring every structural decision to a body that does not
exist would defer all of them indefinitely, and several are materially cheaper to settle before the
standard is published under a stable URI and DOI — and before the first mark issues. Decisions taken
in that window are recorded as **interim resolutions**: in force, reasoned in writing, and
reversible by the committee on the record rather than by silent drift.

Twenty interim resolutions are currently in force, across four documents:

| Document | Resolutions |
|----------|-------------|
| [mark-grammar.md](mark-grammar.md) §10 | R1–R6 — head terms, endorsement register, wind-down, selective disclosure, enforcement, commencement |
| [proposals/CP-Mandate-enforcement.md](proposals/CP-Mandate-enforcement.md) §9 | R-G1–R-G5 — endorsement axis, agent adapter, registry, sequencing, dependency hoist |
| [proposals/CP-Consent-revocation.md](proposals/CP-Consent-revocation.md) §9 | R-G1–R-G2 — `purpose`, scope limit |
| [proposals/CP-Grant-lifecycle.md](proposals/CP-Grant-lifecycle.md) §9 | R-G1–R-G3 — closure mechanism, `*.expired` dropped, defined term normative |
| [role-competency-framework.md](role-competency-framework.md) §8 | R-G1–R-G4 — issuance split, close F1/F2, role rename, normative status split |
| [IR-2026-08-prior-normative-changes.md](IR-2026-08-prior-normative-changes.md) | R1–R5 — the eleven prior normative changes stand, recorded as predating the rule rather than as having satisfied it |
| [IAR-0002-state-model.md](IAR-0002-state-model.md) | The `Bid.status` correction, and the recorded waiver of its comment period |

## The claim triad

Three statements are routinely confused, always in the direction that overstates:

- **Modelled** — the CDM represents it. Says nothing about whether anyone does it.
- **Tested** — the public suite exercises it against an implementation's own behaviour.
- **Certified** — a passing, reproducible report is on the registry against a named version.

Positioning copy must be checked against which of the three actually applies. Two properties are
currently *modelled* but not *tested*, and therefore not *certified*: consent enforcement and
mandate enforcement. Both are addressed by the endorsement proposals; neither is closed until those
carry. See [proposals/README.md](proposals/README.md).

## Tabled for the first constituted committee

Not yet resolved, and recorded here rather than acted on unilaterally.

**An "Honest limits" section as a required convention.** Proposed wording:

> Every profile MUST carry a final **Honest limits** section stating, normatively, what
> conformance with the profile does *not* establish, and prohibiting implementations from
> representing profile conformance as the stronger claim.

The identity profile already carries one ([`docs/extensions/identity.md`](../docs/extensions/identity.md)
§7), written before the convention was proposed, and it is the model: it says the profile makes
identity claims verifiable, attributable, and tamper-evident, and does not make identity-proofing
true.

The argument for making it mandatory is that it converts the claim triad from a review checklist
into a structural habit. Both findings in this workstream were overclaims that survived review
because nothing in the authoring process required their author to write down what the artifact did
*not* do. A required section does require exactly that, at the moment the author knows most and is
least motivated to say it.

It binds no one until the committee adopts it. Applied voluntarily so far to the identity profile
and to the [Agent Layer](../wiki/Agent-Layer.md) wiki page.

## Open actions

Items that do not wait on any gate, and are not code:

- **Trademark registration — EU, UK, US.** Required to preserve the enforcement option under
  mark-grammar R5. Registration is inexpensive, and becomes unobtainable if another party files
  first. This is the only open action in this directory that Concert cannot discharge in the
  repository. **Owner: Concert Foundation. Not yet filed.**
- **Constitute the Standards Committee**, which converts every interim resolution above into a
  ratification decision, and clears the bootstrap clause.
