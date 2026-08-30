# SIGNET Certification

**Steward:** Concert Foundation · **Tier:** Process · **Licence:** CC0-1.0

Certification turns a passing conformance result into the right to use the
**"SIGNET Certified"** mark. This document describes the process. It is governed
by the neutrality rules (CN-1…CN-4) in `levels.md` and the Concert IP & Licensing
Policy. The process is identical for every implementer, including Score Networks.

---

## 1. What certification asserts

`SIGNET Certified: Core` or `SIGNET Certified: Full` asserts that, against a
stated CDM version and suite version, the implementation produced a passing
conformance report at that level from the public, machine-runnable suite. It
asserts nothing more: it is not a security audit, or a guarantee of fitness.

Nor does it assert that every MUST in the specification was met — only the
requirements in `levels.md` §2, which the suite decides. Two governance
properties are modelled but untested at any level, and `levels.md` §5 says which
and why. A **Full** certification is not evidence that human oversight was
enforced.

## 2. The process

1. **Self-test.** The implementer writes a conformance adapter for their system
   (see `adapter/adapter-contract.md`) and runs the public suite:
   ```
   node conformance/runner/run-conformance.js --adapter <their-adapter>
   ```
   This produces a report conforming to `report-schema.json`.
2. **Submit.** The implementer sends Concert the report, the adapter source, and
   the suite + CDM versions used. Because the suite is public and the result is
   reproducible (CN-4), no private assessment is needed.
3. **Reproduce.** Concert re-runs the identical suite against the submitted
   adapter and confirms the report. The check is mechanical (CN-1).
4. **Issue.** On a confirmed pass, Concert records the certification (implementer,
   level, CDM version, suite version, date, report hash) in the public registry —
   [`certification-register.md`](certification-register.md) — and licenses the
   "SIGNET Certified" mark for that level and version.
5. **Publish.** The report is publishable; the registry entry is public.

There is no committee judgement, interview, or discretionary gate at any step.

**The register is empty.** No certification has been issued to anyone, including Score
Networks, so no mark is licensed and no short form resolves today. It is empty as a
statement of fact, not as a placeholder: this document specified a public registry from the
moment it was written, and for as long as no artifact existed a mark string had nothing to
resolve to (`governance/defects.md` D-44).

## 3. Marks and their use

The form of every mark Concert issues is fixed by the
[mark grammar](../governance/mark-grammar.md), which is normative for licensees.
In outline:

- The canonical implementation mark is
  `SIGNET Certified: <Core|Full>[; <endorsements>] (CDM vX.Y, suite vX.Y)` —
  for example `SIGNET Certified: Full (CDM v0.1, suite v0.1)`. Mark strings are
  ASCII, and the punctuation is fixed so the form can be linted in CI
  (`npm run lint:marks`).
- **The registry record is the source of truth; the string is a projection.** No
  mark string is authored by hand. The registry is
  [`certification-register.md`](certification-register.md).
- **Short forms resolve or they are not licensed.** `SIGNET Certified: Full` is
  permitted only alongside a resolvable link to the registry entry; the bare
  badge only as a hyperlink. Print, slides, and spoken claims require the
  canonical form — the qualification *is* the claim.
- An endorsement MUST NOT appear without a level.
- The mark licence is granted under the IP & Licensing Policy, on identical terms
  to all implementers, and is conditional on a current passing report.
- Misuse — claiming a level not achieved, or omitting the version qualification in
  a way that misleads — is grounds for withdrawal of the mark licence, under the
  complaint-driven escalation in mark grammar R5.

**Anyone may say they implement SIGNET.** The artifacts are CC0, so *"Implements
SIGNET CDM v0.1"* and *"Self-assessed against the SIGNET conformance suite v0.1 —
Core"* need no permission. What requires a licence is the assertion that Concert
assessed you. The qualifier `self-assessed` is mandatory in that construction.

## 3.1 Registry entries

The registry is [`certification-register.md`](certification-register.md): closed,
append-only, and currently empty.

A registry entry records the implementer, the level, the CDM and suite versions,
the date, the report hash, any endorsements held — and the **endorsement register
version in force at issuance**. The endorsement register is append-only, so
without that last field every certification issued before a later admission would
appear deficient against a register that grew after the fact.

Failed attempts are not published. An implementation that tries, fails, fixes,
and retries is behaviour worth encouraging.

## 4. Renewal and versioning

- A certification is valid for its stated CDM + suite versions.
- A new **CDM major** version requires re-certification.
- A **suite minor/patch** update (added or clarified tests) does not invalidate an
  existing certification immediately, but the current suite applies at renewal.
- Concert publishes the current versions and a deprecation window for superseded
  ones.
- A mark for a superseded CDM major version is not false, but it is misleading in
  any form that hides the version — so it survives in canonical form only, and the
  short and minimal forms are withdrawn (mark grammar §9).

## 5. Fees and neutrality

Certification may carry a fee that funds Concert's neutral stewardship. The fee
is published, identical for all implementers at a given level, and unrelated to
the outcome (you pay to be assessed, not to pass). No implementer — including
Score Networks — receives a discount, a fast track, or any other preference
(CN-3). Fees are the Foundation's primary sustaining revenue, by design, so that
the standard itself can remain free.

## 6. Disputes

Because conformance is mechanical and reproducible, a dispute is resolved by
re-running the public suite. If an implementer believes a test is wrong (rather
than their implementation), they raise it through the normal standard
change-control process; the suite is corrected for everyone or not at all (CN-2).
