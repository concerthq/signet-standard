# IAR-0007 — Adopter register and founding-adopter window

**Status:** Interim resolution — in force on merge. **Tier:** 1 (a governance record and a non-normative register; it touches no normative artifact and admits nothing to a closed register). **Comment period:** none required at Tier 1, and none stated. A comment received before the window closes is recorded in the pull request; it does not suspend the window.
**Establishes:** `registry/adopters.json`, its entry schema `registry/adopter-entry.schema.json`, the founding window `registry/founding-window.json`, and the checker `tools/check-adopters.js`.
**Window closes:** on constitution of the Standards Committee or at 23:59 UTC 30 September 2026, whichever is earlier. This is the same instant [IAR-0006](IAR-0006-registration-window.md) expires. The register itself does not expire.

## Resolution

1. **An adopter register exists.** Any organisation may add one entry to `registry/adopters.json` by pull request. An entry is a **self-declared statement of practice**, drawn from a closed set: `accepts` (the organisation will accept SIGNET-conformant documents from counterparties), `emits` (it produces SIGNET documents), `internal-model` (it uses the CDM as its internal canonical model).
2. **Adoption is a fourth status, distinct from the claim triad.** An entry is not *modelled*, *tested* or *certified*, and says nothing about any of them. The entry schema carries no claim field and no free text (`additionalProperties: false`). The checker's rule 6 re-asserts the ban on claim words independently of the schema, so a later loosening of the schema does not quietly admit a claim.
3. **Organisations, not people.** An entry names an organisation and its domain only. No individual appears in the register; the pull request is the audit trail.
4. **Verification before merge.** The pull request is opened from, or cites an email from, an address at the organisation's declared domain. The steward records that check in the merge record. An entry without a recorded check is not merged.
5. **A founding-adopter status exists for the window.** An entry may carry `founding: true` only if its `declaredOn` falls before the window closes. The close is machine-readable in `registry/founding-window.json`: `closesAt` holds the fixed instant, and `constitutedOn` is set to the constitution date by the pull request that marks IAR-0006 expired. An entry declared on or after that date cannot carry `founding: true`. `tools/check-adopters.js` rule 5 enforces both.
6. **Founding status is a fact about timing and nothing else.** It confers no right, priority, fee position, vote, seat, mark, badge or conformance standing. It is not a statement about the quality of anyone's implementation, and every implementer meets identical terms whether or not they carry it.
7. **The register carries no mark.** No badge, logo or use of the SIGNET mark attaches to an entry. If one is ever proposed, admission would then decide what may be claimed, and the register moves to Tier 2 alongside the endorsement and role registers. That move happens by a later resolution, not by drift.
8. **The steward's own interests.** An entry for an organisation in which the steward holds an interest lands with its `interests-register.md` entry in the same pull request.

## Why now

The register lands empty, and the site's `/adopt` page will say so. The empty state names the founding window, so the window has to be decided and recorded before it is shown. A threshold that appears on a public page without a record behind it would be a claim without a basis.

## Declined alternatives

**A — No founding status.** Declined: an empty register with no threshold gives an early adopter nothing to cross and the page nothing to say. The status is kept deliberately inert (point 6), so it costs neutrality nothing.
**B — A window on its own clock (for example, year end).** Declined: that would put two clocks on one pre-constitution period. Aligning with IAR-0006 means the Committee inherits one boundary, not two.
**C — Founding status carrying a benefit (a seat, a fee position, precedence).** Declined: identical terms for every implementer is the neutrality commitment. A benefit bought by being early is a preferential position.
**D — Close the window at the first N entries.** Declined: a count-based close rewards the speed of a pull request, not practice, and makes the close date unknowable in advance.
**E — "Adopter" as a light certification.** Declined: it conflates the triad in exactly the direction that overstates (point 2).
**F — A form-backed database instead of a file.** Declined: it has no audit trail, needs a backend, and bypasses the two-account route. A Foundation record belongs in the governed repository.
**G — A contact email in each entry.** Declined: that puts a named individual in a Foundation record (point 3).
**H — Domain email plus a DNS TXT record for verification.** Declined for now: it adds friction for the first adopters without closing a gap the steward's merge-record check leaves open. Revisit if an entry is ever disputed.

## Records to update on merge

`governance/README.md` Contents table gains the row. `CONTRIBUTING.md` gains "Declaring adoption". `CHANGELOG.md` records the addition under Unreleased. `public-interface.json` declares the two register files as consumed by the site build.
