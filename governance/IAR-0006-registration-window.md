# IAR-0006 — Pre-constitution registration window

**Status:** Interim resolution — in force on merge. **Tier:** 1 (it changes the standing rule in a governance record; it touches no normative artifact). **Comment period:** stated at fourteen calendar days from PR ready-for-review, recorded in the pull request.
**Amends:** the standing rule in `governance/WITHDRAWAL-2026-08.md` and its restatement in `governance/proposals/README.md`.
**Expires:** on constitution of the Standards Committee or at 23:59 UTC 30 September 2026, whichever is earlier. Expiry is automatic; no act is required, and on expiry the standing rule resumes exactly as written on 20 August 2026.

## Resolution

1. **Registration of change proposals is reopened for the window**, limited to proposals that (a) remedy a defect recorded in `governance/defects.md`, or (b) resolve a timing dependency in a change already in flight under the bootstrap clause.
2. **Adoption remains parked.** No proposal registered under this window is adopted before constitution. The sole exception remains the existing carve-out: a defect actively causing harm, corrected with an interim approval record, a stated comment period, and the smallest Tier 2 surface that fixes it.
3. Every proposal registered under this window carries, immediately below its status line:
   > *Registered pre-constitution under IAR-0006. Registration is not adoption and does not pre-empt the Committee's agenda.*
4. A proposal originating from the steward's implementer role, or from any party holding both a stewardship and an implementer role, states that origin in its header and attaches the recusal. The recusal is satisfiable only on constitution; until then it is recorded, not effected.
5. Comment periods on proposals registered under this window run during the window. A period that completes before constitution does not advance the proposal; it means the Committee may adopt without further delay if it chooses.
6. On expiry, this record is marked expired and the standing rule's text is not edited a second time; the amendment history is this file.

## Why the 20 August rule is revisited nine days after adoption

Reversal without new argument is drift; these are the new facts:

- **The horizon is bounded.** The rule's accumulation argument — clearing requires a body that does not exist, so the queue only grows — assumed an open-ended interim. Two candidate members are identified and constitution is scheduled for September. A queue with a clearing date is a different arithmetic from a queue without one.
- **The proximity failure now has a mechanical control.** The rule's second argument was that a reader mistook a proposal for a shipped artifact. The repository inventory's `referencedFields` now classifies every backticked `Object.field` in tracked prose as shipped, proposed, or unresolved. A reader can still err; the tree can now be interrogated.
- **The rule is producing the harm it prevents, off the record.** Remedies parked by the rule are being drafted anyway and held in handoff packs, where they carry no status line, no disclaimer, no declined-alternatives record and no citable identity. D-34..D-36 in the defect register already read "remedy drafted, unregistered" — a proposal register by another name, without the register's protections.

## Declined alternatives

**A — Hold the rule unchanged until constitution.** Declined: the queue accumulates off-record (above), the fourteen-day periods that could elapse before the first session do not start, and timely decisions (D-39) get taken as side effects of defect corrections rather than minuted.
**B — Reopen adoption for additive, reversible changes.** Declined: with both repository identities operated by one person and constitution weeks away, adopting anything not covered by the harm carve-out spends credibility to save at most two weeks. Registration plus elapsed comment periods delivers nearly the same speed with none of the exposure.
**C — Register into a separate pre-constitution directory.** Declined: two registers of one kind of record is a §11 D-1 defect by construction.

## Records to update on merge

`governance/proposals/README.md` standing-rule box gains one line pointing here; `governance/README.md` index gains the row; both shown in `edits/`.
