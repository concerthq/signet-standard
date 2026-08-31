# Changelog

All notable changes to the SIGNET Canonical Data Model are recorded here.
This standard uses [Semantic Versioning](https://semver.org/): the MAJOR
version changes only on a breaking change to the core model.

## [Unreleased]

### Governance
- Defect register: D-45..D-52 recorded against the `commodity-risk` extension (spec/tree divergences: core linkage, event types, `policyEvaluationStatus` binding, `Policy` subtype, `HedgeProposal` lifecycle) and the core primitives it leans on (unit of measure, delivery period, market identifiers). Facts only; no artifact changed.
- Interests register: entry 4 (steward's origination of the `commodity-risk` extension and of its remedies).
- Registered under IAR-0006: `CP-Commodity-Risk-Linkage`, `CP-Quantity-Unit`, `CP-Market-Identifiers` — defect-remedying (D-45..D-52). Adoption parked; comment periods run from ready-for-review.
- Published `governance/RESPONSE-2026-08-implementer-enquiry.md`, the response the v0.16.0 entry cited eleven days before it existed (D-40, closed). Drafted against v0.15.0 on 20 August; published against v0.16.1 stating per correction what has landed and what rides IAR-0003 (#43). The enquiry is published de-named; verbatim publication is forbidden by the naming rule. Comment period fourteen days from publication, not waived.

### Fixed
- `check-state-model.js` gains C11 (terminal reachability), C12 (registry completeness), C13 (authority evidence) and C14 (basis scope). The v0.16.0 entry describing C11 and the D-15/D-16 closures citing C12 and C14 were premature: the registry changes had landed, the checks had not. Recorded as D-53.

## [0.16.1] — 2026-08-30

### Added — a registration window, two registered proposals, and the constitution drafts

`governance/IAR-0006-registration-window.md` reopens **registration only**, for change proposals
that remedy a recorded defect or resolve a timing dependency in a change already in flight.
Adoption stays parked and the harm carve-out is untouched. The window expires automatically on
constitution of the Standards Committee or at 23:59 UTC 30 September 2026, whichever is earlier,
and the record states the new facts that justify revisiting the 20 August standing rule nine days
after its adoption, rather than editing the rule away.

Registered under the window, each carrying the required banner, a role-based origin statement and
the steward's recusal: `governance/proposals/CP-Requirement-Sockets.md` — the remedy for D-34,
D-35 and D-36 as three additive, target-neutral core sockets — and
`governance/proposals/CP-Extension-Composition-Amendment-A.md` — published-extension fields ride
the landed Part 1 pattern with resolution by path, so Part 2 keeps the 2020-12 migration for its
remaining merit (`$ref` siblings) and drops `unevaluatedProperties`. Registration is not
adoption; both wait for the Committee, with their comment periods running meanwhile.

Drafted and deciding nothing until executed at the first session:
`governance/CONSTITUTION-2026-09.md` — appointments void without a completed assessment; quorum
is both members; adoption is by unanimity; the steward does not vote; deadlock leaves a proposal
Draft with the disagreement recorded; a recused matter falls to the remaining member; the change
of constitution trigger is minuted as a decision, not drifted past — with
`governance/interests-register.md` (initiates at execution; the steward's dual role and the
SE-0001 recusal are entries 1 and 2), `governance/first-session-agenda.md` (the twenty interim
resolutions triaged into ratification buckets) and `governance/member-brief.md` (the reading
path in, and the habits of the record).

### Added — the requirements extension, spec-first, and the defect rows that ground it

`docs/extensions/requirements.md` (Working Draft — spec; schemas to follow): `Requirement` and
`RequirementSet` as first-class, versioned, addressable objects; three closed relation types
(`derivesFrom`, `varies` with a mandatory Decision as authority, `testedBy`); statement patterns
adapted from EARS with deterministic checks only; parameters declared on the requirement and
bound on the set; tenancy, quality assessment and requirement content explicitly out of scope.
The three core sockets it relies on are proposed, not shipped, and the spec says so.

Grounded by defect rows rather than argument: **D-34** (no object addresses an evaluation
criterion), **D-35** (`Obligation` records what discharges it and nothing about where it came
from), **D-36** (a submission cannot state a structured position on what was asked), **D-37**
(two core `identifierScheme` codes collide with the extension prefix grammar), **D-38** (nine
in-tree extension roots lack the Part 1 pattern), **D-39** (a generated bare `enum` would decide
gate C-4 by generator shape; resolved on the record as an amendment folded into IAR-0003's open
pull request — `anyOf` of the enum and the prefix pattern, plus a reservation rule for prefixes
already used by core codes). **D-40..D-42** are recorded from verification candidates checked
against `main`, and **D-43** records that forge state — pull requests, review decisions — is
invisible to tree evidence, with three instances of records asserting forge state that did not
hold; it closes when the inventory extractor gains a forge section or such assertions are
forbidden.

`.github/ISSUE_TEMPLATE/scope-enquiry.md` adds the intake route the originating enquiry had to
do without; SE-0001 is the first record through it, filed with the recusal attached.

### Added — dialect tooling, report-only

`tools/migrate-2020-12.js` (mechanical Draft-07 → 2020-12 rewrite) and
`conformance/rules/check-dialect-equivalence.js` (identical verdicts across the corpus under both
dialects). Report-only until the v1.0 train decides the migration; a reported verdict difference
is evidence for that decision, not a failure of this one.

### Changed — CI: the binding step is temporarily non-gating, with its revert condition stated

The closed-codelist binding step carries `continue-on-error` pending IAR-0003 as amended, whose
branch generates the enums and fixes the four failures the step reports (D-14, D-30 — both
unchanged by this). The failure stays visible as a warning annotation on every run, and the
revert travels with that merge: the check goes hard again at the moment it starts passing. One
dated workflow statement instead of repeated required-check overrides.

### Added — the wiki becomes a projection

`tools/wiki-sync.js`: the live GitHub wiki has no pull requests and no CI of its own, so it is
treated as a projection of the reviewed `wiki/` directory, never an editing surface. The check
mode reports drift in both directions — a live-only page is D-33's pattern and requires a human
decision — and every push records the source commit, so each live-wiki state traces to a
reviewed tree state.

### Fixed — the specification's self-description, and the registry it named but did not have

**`docs/specification.md` was the second record to keep the corrected wording out.** The v0.16.0
reconciliation replaced the claim that Concert "stewards its evolution through the Standards
Committee" with the bootstrap-honest formulation, and landed it in §12.2 — which states plainly
that **no Standards Committee is constituted** — while the same claim survived twenty-two lines
from the top of the same file, in "About this document". One document, two statements of the same
fact, corrected in one place and not the other. `governance/defects.md` D-33 records the wiki as
the third record to drift on this claim; the pattern is not a missed line, it is that the
repository holds the same governance fact in several hand-maintained places and nothing compares
them.

The status header was stale in a second way. It read **"Specification v0.1 (Working Draft)"** and
**"Status: Request for Comments"**, and "About this document" said field-level definitions were
"illustrative" and "not yet frozen" — against a repository with a machine-runnable conformance
suite, four certifiable extensions, a normative state model and an interims register. The header
now separates the two identities that were being conflated: **CDM v0.1** is the version-stable
namespace at `https://concert.foundation/signet/v0.1/` and does not move with the repository
release. The release number is deliberately **not** restated in the document. It has a single
source in `package.json`, is rendered into the published page by `tools/build-pages.js`, and is
pinned for the website by `standard-ref.mjs`; a fourth hand-maintained copy would be stale at the
next release, which is the defect being fixed rather than a fix for it.

Also corrected in the same class:

- `docs/specification.md` "About this document" cited **§11** for change control. Change control
  is **§12**; §11 is Extensions. The cross-reference had been wrong since the section was written.
- `docs/extensions/README.md` stated that "Standards Committee decision records are published
  under `governance/reviews/`". None of them is a Committee decision, because there is no
  Committee; each is an interim resolution taken under the bootstrap clause.
- `docs/extensions/README.md` named the Committee as the operative route for promoting an
  extension toward the core, and `docs/profiles/auction-platform.md` referred a grammar question
  to it. Both now say what is true today and what changes on constitution.

### Fixed — the same class in the other hand-maintained records, and what the pattern shows

`governance/README.md` stated "Twenty interim resolutions are currently in force, across four
documents" **directly above a table of seven** — D-33's fourteen-lines-apart shape compressed to
one line. The count is removed rather than corrected: the table is the record, and a number
restated in prose drifts out of step with it the moment a resolution is adopted. This is the shape
the site checker now forbids on `/governance`, so the two records fail the same way or not at all.

`wiki/Home.md`, `wiki/FAQ.md` and `wiki/Governance-and-Versioning.md` carried the same "v0.1
(Working Draft / Request for Comments)" / "not yet frozen" self-description that
`docs/specification.md` carried, and two of them stated the repository at **v0.10.0**. All are
corrected the same way as the specification header: the CDM-versus-release identities are
separated, and the release number is **removed, not re-pinned**. A hand-typed release number in
wiki prose is the drift mechanism itself, and six releases is the proof.

**The asymmetry is the finding, and it is recorded as a dated note on D-33 rather than a new row.**
The v0.16.0 reconciliation corrected the Standards Committee clause in *both* records —
`docs/specification.md` §12.2 and `wiki/Governance-and-Versioning.md:17` each say plainly that no
Committee is constituted. The **version** claim was corrected in *neither*, surviving
simultaneously in the spec header and on three wiki surfaces. The sweep discipline therefore works
**per topic, not per record**: a reconciliation fixes the clause it was called for wherever that
clause appears and leaves every other stale clause in the same paragraph standing. D-33's closure
condition is widened accordingly — the cross-reference check it waits on must compare **version and
status claims**, not only enums and process, or the next reconciliation passes over them again.

One further clause: `wiki/Home.md`, `wiki/FAQ.md` and the release-history table in
`wiki/Governance-and-Versioning.md` were frozen at exactly **0.10.0**, and `_site/index.html`
states the same 0.10.0 under D-23. Four surfaces at one value is not four independent lapses — it
dates the last sweep and says the remedy is regeneration rather than editing. The release-history
table was subsequently cut rather than backfilled; see below.

### Changed — `wiki/` is scanned by the naming check, and the release table is cut

**`conformance/rules/naming-denylist.json` adds `wiki` to its `scan` list.** The rule that Concert
names no individual and no commercial implementer covered `docs`, `governance`, `codelists`,
`schema`, `conformance` and `state-model`. It did not cover `wiki/` — which `tools/wiki-sync.js`
projects to the public GitHub wiki, a Concert-voiced surface with no pull requests and no CI of its
own. The rule applied to it on paper and no check ever read it. That is the D-19 shape exactly: the
defect is the absent control, and no breach is asserted. `check-naming.js`'s fallback list is kept
in step so the two copies cannot disagree; no rule logic changed.

Structurally the newly-scanned files are clean. Salted digest detection needs
`SIGNET_NAMING_SALT`, which is held in CI and not in the repository, so the first pass with name
detection actually on runs in CI for this change — not locally, and not before now.

**The release-history table in `wiki/Governance-and-Versioning.md` is cut**, replaced by a pointer
to `CHANGELOG.md` as the single release record. A table of releases in a wiki page is a second
hand-maintained copy of the changelog — the file class this workstream exists to remove — and it
drifted as a second copy does, stopping at `0.10.0` for six releases. It is cut rather than
backfilled: six release summaries is authoring, not a correction. The finding is not lost, because
it never lived in the table — D-33's dated note records the stale value as evidence dating the last
sweep of these pages, and the register keeps the history of the drift while the drifting artifact
goes.

### Added — the certification register

`conformance/certification-register.md`: normative, closed, append-only, **zero entries**.

`conformance/certification.md` has specified a public registry since it was written — §2 step 4
issues into it, §3 makes the registry record the source of truth and licenses a short-form mark
only against "a resolvable link to the registry entry", and §3.1 lists an entry's fields. The
artifact did not exist, so §3's resolvability condition was unsatisfiable by construction and a
published news post promised implementers a listing in a register that could not be read. That is
the D-31 / D-40 family — a released or published record citing an artifact absent from the tree —
and it is now recorded three times over, which is the argument for a check rather than for closer
reading. Recorded as **D-44**.

The register opens empty and says so in its own header: emptiness is the accurate state, not a
gap in the file. No certification has been issued to anyone, including Score Networks. It is
indexed from `governance/README.md`, linked from `certification.md` §2, §3 and §3.1, and declared
`published` in `public-interface.json`, so `check-public-interface.js` fails if it is ever removed
— the register cannot now go missing the way the artifact it replaces never arrived.

`governance/README.md`'s series-gaps note is corrected with it: it stated the defect register ran
to D-31 when it runs to D-44, and listed D-33 as reserved on an unmerged branch after that branch
merged.

### Added — repository inventory extractor (non-normative tooling)

Added `tools/inventory/inventory.js`: a dependency-free repository inventory extractor producing
`signet-inventory.json` (schema v2), a `CLAIMS.json` verifier for evidence-bound repository claims
in handoff packs, and a CI self-test with the inventory uploaded as a workflow artifact. The
inventory is generated, not committed.

Scope is `git ls-files`. The extractor states what the tracked tree contains — manifest with
per-file hashes, schemas with their full field universe, codelists with the register line that
decided closure, the state model, conformance requirements and checkers, and the whole text of
every tracked Markdown file — and classifies nothing as correct, stale or missing. Where a fact
is derived, the line that decided it is recorded alongside.

`referencedFields` splits every backticked `Object.field` in tracked prose into shipped, proposed
and unresolved against the schemas. It is data, not a gate: making it a gate would fail builds on
prose that is already merged, and belongs in its own change proposal.

A claim in a `CLAIMS.json` with no evidence fails verification rather than warning. A marker that
can be read past is not a control.

## [0.16.0] — 2026-08-20 — Working Draft

### Changed — implementer review of v0.15.0, and three defects it found in four-day-old artifacts

A twenty-one question enquiry from a deploying implementer, answered at
`governance/RESPONSE-2026-08-implementer-enquiry.md`. Corrections landed before the response was written,
so the response describes the repository rather than promising it.

**`docs/state-model.md` §2a — CDM `status` is market-facing (normative).** A core state vocabulary
describes what a counterparty can observe, not a party's internal governance. This is not a new
decision: every core edge must be justified from OCDS, the Procurement Act procedures, UBL /
EN 16931 or ePO, and none of those models a buyer's internal review, so an internal-governance
edge could never satisfy B-1. Core status has been market-facing by construction since the basis
rule landed. Internal workflow goes to a namespaced profile with a declared `coreEquivalent`;
extending a core vocabulary to carry it is forbidden.

**§6 B-3 — externality is not generality.** B-1 asked only whether a basis was external to the
implementer. A national procurement act or a sector security regulation passes that and still
should not oblige every implementer in every market. Each basis now carries a scope — `general`,
`jurisdictional`, `implementer` — and only `general` justifies a core entry alone. When the check
was first run it flagged **two core edges in this repository's own registry**; both were
corroborated against a general source rather than the check being relaxed. (D-16)

**§5 R-3 — derived predicates.** A condition computable from *another* object is neither a state
nor an annotation. An `Evaluation` is "consumed" when an `Award` references it; that is a fact
about the graph, and storing it creates a value that can drift.

**§5a — controlled reopen.** A transition, not an annotation. A `terminal: true` state cannot be
reopened; an edge marked `requiresAuthority` must name a `decisionType`, so the requirement cannot
be documented and left unenforced.

**§4a — entry-kind test.** Does something exist that did not? Creation. Does *this object's own
state* differ? Transition. Is a fact recorded *about* it? Annotation.

**§11 — derived artefacts.** Where two records of one relationship exist, keep one and generate
the other. `sourcingEvent.published` drifted for this reason and so did the closed codelists.
Contributed by an implementer who measured it: 58 of 68 policy gates carried a transition label
disagreeing with the state the rule tested.

### Changed — the process claim reconciled with the record

`docs/specification.md` §12.2 and `wiki/Governance-and-Versioning.md` had said since v0.1.0 that
the core model changes "through the formal revision process governed by the Standards Committee,
with a published comment period." Two things were wrong with that. No Standards Committee is
constituted. And of the twelve normative changes made between v0.1.0 and 20 August 2026, **none
carried a comment period**.

Both now state the rule that actually applies — a recorded resolution, a stated comment period of
at least fourteen calendar days, and an approving review, every change by pull request — say that
it took effect on 20 August 2026, say that no Committee is constituted, and point at the audit for
what preceded it.

- **`governance/IR-2026-08-prior-normative-changes.md`** — an interim resolution covering the
  eleven normative changes that carry no approval record. They **stand**; they are recorded as
  predating the written rule rather than as having satisfied it; and it is **one** resolution
  rather than eleven back-dated approvals, which would be a fabrication of evidence. It is not an
  assessment of merit: every one passed CI, and the commodity-risk extension was reviewed twice on
  the record.
- **Both commodity-risk review memos** gain a note recording the arrangement under which they were
  taken. They are titled as Standards Committee reviews and no Committee existed; their closing
  line, "Recorded *for* the Standards Committee," is accurate, but the titles read otherwise. The
  titles are left as written rather than changed after the fact.
- **`governance/README.md`** now indexes the interim approval record, the interim resolution, the
  withdrawal, and the drafted site corrections, so the bootstrap-clause table is the single index
  it claims to be.

Closed out, and outside this repository: `concert.foundation/governance` no longer presents the
Standards Committee as a currently operating body. The drafted correction at
`governance/site-alignment/` was superseded before it was applied — the live page already said what
it proposed. The outcome is recorded at `governance/site-alignment/OUTCOME.md`. Three claims the
draft did not examine are addressed in `concerthq/concert-website`.

### Fixed

- **Registry completed to all 29 objects, up from 9.** §L-2 has said since v0.15.0 that
  statelessness by omission is a defect. The registry reproduced that defect in the artifact that
  defines it. `Evaluation` is now declared a terminal record. New check **C12** fails any schema
  file without a declaration. (D-15)
- **Closed codelists bound. Not enforced — see the correction below.** Five were
  `"type": "string"` with the CSV named only in a description; `{"procedure": "banana"}` validated.
  `codelists/bindings.json` binds each closed codelist to the schema location whose enum it governs,
  and `check-codelist-binding.js` asserts that the CSV and the enum agree and, with `--write`,
  generates the enum from the CSV. **Those two artifacts are what landed here.** (D-14)

  *Corrected 2026-08-21. This bullet was headed "**Closed codelists enforced**" and ended "Tier 2,
  landed under `governance/IAR-0003`." Both statements were wrong. The binding manifest and the
  checker landed at v0.16.0; the generated enums did not. Generating them alters `schema/`, which
  is normative, so it is a Tier 2 act under `governance/IAR-0003` — and that record's pull request
  has never been opened, so its comment period has never started. On `main` at v0.16.0, five closed
  codelists carry no `enum` at the bound property and any string validates against it:
  `{"procedure": "banana"}` is accepted today, in the present tense, exactly as this bullet says it
  once was. `check-codelist-binding.js` fails on four of the five and records the fifth,
  `identifierScheme`, as a binding deferred pending D-20. It was not wired into
  `validate.yml`, so nothing surfaced the gap. The tag is not amended — the correction is recorded
  here, in the entry that made the claim, and as D-30. D-14 is reopened.*
- **`codelists/submissionStatus.csv` deleted.** It duplicated the vocabulary carried inline on
  `Submission.status` and was referenced by no schema. The inline enum is the single record, as
  for every other lifecycle-bearing object. The binding check fails if the file reappears. (D-13)
- **Terminal reachability.** Check **C11**, contributed: every lifecycle-bearing object must have
  a terminal state and every state must be able to reach one. Distinct from C9, which asks only
  whether a state can be entered — C11 catches an object that can never end.

- **State vocabularies are now generated from the registry**, not merely checked against it. §11
  said a second hand-maintained copy is a defect; state vocabularies were exactly that, so the
  rule was violated by the artifact that states it. `check-state-model.js --write` generates the
  schema enum from the declared states. This **promotes `state-model/state-model.json` from
  informative to normative** for every lifecycle vocabulary it declares — a normative enum cannot
  be derived from an informative source — so the file gains `CODEOWNERS` protection and a change
  to a declared state is Tier 2 wherever it is made. Landed under `governance/IAR-0004`. Objects
  declared lifecycle-bearing but not yet modelled keep their vocabularies. (D-18)

- **`codelists/submissionStatus.csv` restored, retired but resolvable.** Deleting it under IAR-0003
  made `concert.foundation/signet/v0.1/codelists/submissionStatus.csv` return **404** — a published
  URL in the `$id` namespace, proxied from `main` with no cache and no fallback — and failed the
  site build cold on a second consumer. IAR-0003 stated the file had no consumer; two existed in
  `concert-website`, and **neither was recorded in this repository**, so the claim was
  unfalsifiable from inside it. That is the defect, not the deletion. The file is restored
  byte-identical to what was deleted, bound to no schema and absent from `closed`;
  `codelists/bindings.json` carries the disposition and `check-codelist-binding.js` now
  distinguishes **deleted** from **retired-but-resolvable**, failing in both directions.
  Retirement says nothing is maintained here; it does not say the URL may stop answering.
  Landed under `governance/IAR-0005`. (D-24)

### Added

- **`docs/absence-discipline.md`.** Empty, null and absent are three states and only absence fails
  open: an undefined operand yields an undefined rule body and the rule does not fire. Every
  negative fixture requires an absence twin. Contributed from a measurement of 259 references
  across 68 gates, published de-named.
- **`conformance/rules/check-naming.js`.** Concert names no individual and no commercial
  implementer. That rule has existed since v0.13.0 and was enforced by nothing — the defect is the
  absent control, and no instance of a breach is identified in the repository. The
  deny-list is stored as **salted digests, never as terms** — a published list of names that must
  not appear is the disclosure it exists to prevent — with the salt held in CI. Verbatim
  third-party documents are excluded, with the reason recorded in the manifest so the exclusion
  is auditable. (D-19)
- **`governance/defects.md`.** Promoted out of `WITHDRAWAL-2026-08.md` so that record stops
  accreting. Twenty-five entries at this release — twelve closed, twelve open, one in progress.
- **`governance/REVERSAL-RISK.md`.** Each interim resolution gains a band and reasoning, answering
  an implementer question about which of twenty unratified decisions carry reversal risk.
  **Eighteen are unassigned, and unassigned reads as unassessed rather than low.**

### Governance

- **`governance/IAR-0005-published-url-restoration.md`** — Tier 2, under the bootstrap clause,
  restoring the published URL above. **Its stated fourteen-day comment period did not run.** The
  record was merged on the day it was opened, because the period would have extended a live 404 by
  fourteen days.

  That is recorded as a **departure, not an exemption**. `GOVERNANCE.md` requires the period before
  merge for every Tier 2 change and names no exception for urgency, and the carve-out in
  `governance/WITHDRAWAL-2026-08.md` is an exception to the proposal moratorium that itself
  requires a stated period. The rule applied and was not observed, and `GOVERNANCE.md` names such a
  merge a defect in this process. The stated period is left in the record verbatim and the
  departure is recorded beside it, on the shape of `IAR-0002`. Comment remains open for fourteen
  days from merge; the change will be reversed or amended on sustained objection. **What does not
  stand is any claim that this record followed the process in full.** (D-29)

- **Four defects recorded since the register was drafted.** **D-24** closed — the 404 above.
  **D-27** open — the repository declares no public interface, so a claim that a file has no
  consumer is not testable from inside it. **D-28** open — `codelists/*.csv` admits no comment
  line, so the format cannot record that a file is retired. **D-29** open — it closes when
  `GOVERNANCE.md` gains a carve-out for a defect actively causing harm, adopted under its own Tier
  2 route. D-25 and D-26 are reserved for the site-pinning work and are not recorded here.

### Note on interests

The enquiry is signed by the same natural person who operates both stewardship identities — the
most acute instance of the disclosed overlap to date. Accordingly the enquiry is published
verbatim, the response carries the full comment period with no waiver, and no correction here
rests on the enquiry's evidence: each is verifiable against `schema/`, `codelists/` and
`conformance/` by a reader who has never seen it. Contributed patterns are adopted as evidence,
published de-named, and are never `basis`.

The bootstrap arrangement was scoped to let design proceed without a Committee. It was not scoped
to absorb a public enquiry from the steward's own implementer alongside twenty unratified
resolutions. The governance load, not the design load, is now the binding constraint.


## [0.15.0] — 2026-08-20 — Working Draft

### Added — the state model: surface authority, a transition registry, and the basis rule

Design principle §1.7 and `conformance/levels.md` GRT-1 both say the event stream is
authoritative. Neither was executable: projecting a stream into a state needs a mapping from
events to state changes, and no artifact published one. `Mandate` asserted a lifecycle it could
record on no surface; `sourcingEvent.published` named a state the enum does not contain; nine
objects carried a state field and one rule governed none of them.

- **Surface authority stated generally** (`docs/state-model.md` §2). Current state is the
  projection of the event stream. A stored state value is the serialising party's assertion as
  at `provenance.generatedAt` and MUST equal the projection at that instant; between parties
  holding the stream, the projection governs. This generalises GRT-1 from grant-type objects to
  all objects, and supplies the rule whose absence was the stated reason status fields on
  `Consent` were rejected. **No field is added to any object** — that rejection is closed out,
  not reopened.
- **Transition registry** (`state-model/state-model.json`). Three entry kinds — creation,
  transition, annotation. Every state declares `terminal`, `appendable`, and a terminal `class`
  of completion / abandonment / revocation. Event codes may serve several entries provided
  their source sets are disjoint, which is what makes projection a function.
- **Relations are not states; outcomes may be** (§5). `Bid.superseded` is a relation and cannot
  be projected — removed from the enum and expressed as a `bid.superseded` annotation event
  carrying `supersededBy`. `admissible`, `winning`, `approved` and `qualified` are outcomes of
  Decisions, are projectable, and stand unchanged.
- **The basis rule as a CI check** (`conformance/rules/check-state-model.js`). Every core entry
  must name an external justification — OCDS status codelists, the Procurement Act 2023
  procedures, UBL/EN 16931 lifecycles, ePO, or a named instrument. An edge justifiable only from
  one implementer's workflow goes to a profile. This is the neutrality control, deliberately
  automated rather than left to review: it runs on every push and is auditable after the fact.
- **21 open codelist values** added to `codelists/eventType.csv`. `eventTypeCore.csv` is
  untouched.
- **A reachability defect fixed without a schema change.** A `Submission` ruled `admissible`
  could not reach `withdrawn` under any reading of the enum. The registry permits the edge.

Coverage is reported, not assumed: **five of eight** lifecycle-bearing objects are modelled.
`OnboardingCase`, `SupplierQualification` and `HedgeProposal` are declared lifecycle-bearing and
not yet modelled — their edges need a basis from the extension maintainers.
`ExposurePosition.positionStatus` is declared **non-lifecycle**: it classifies what a position
is, and reconciliation depends on it as a category.

No conformance requirement is added. This is **modelled and specified, not certified**. An
`F-STATE` requirement belongs at Full and is deferred.

Four of the five artifacts are Tier 1. The one Tier 2 item — removing `superseded` from
`Bid.status` — lands under the bootstrap clause per `governance/IAR-0002-state-model.md`.
Landing does not ratify.

**The fourteen-day comment period was waived.** It opened on 20 August 2026 and would have
closed on 3 September; the change was merged on 20 August by explicit decision of the repository
owner. This is a recorded **departure** from GOVERNANCE.md Tier 2, not an interpretation of it,
and it is written into `governance/IAR-0002-state-model.md` rather than left to be inferred from
the merge dates. No comments were received, because there was no interval in which to receive
any. The change stands on its merits; what does not stand is any claim that it followed the
process in full.

### Changed — the v1.0 proposal train withdrawn; its findings kept

The seven registered proposals are parked, not rejected, per
`governance/WITHDRAWAL-2026-08.md`. Registration is Tier 1 and adoption is Tier 2, so a queue
that costs one review to grow and a Committee to clear will grow without bound. Eight defects
are extracted and recorded as facts about current artifacts; five are addressed by the change
above, three stand open. No further proposals are registered until the Committee is constituted,
except to correct a defect actively causing harm.

### Found — one of twelve normative changes carries an approving review

An audit of every commit since v0.1.0 touching a Tier 2 path, at
`governance/reviews/2026-08-normative-approval-audit.md`. Twelve commits qualify. One carries
an approving review; two carry a written approval record of any kind; four reached `main` as
direct commits with no pull request; **none** had a stated comment period, which the
specification and `CONTRIBUTING.md` have claimed for normative changes since v0.1.0.

Nothing merged is thereby wrong — every commit passed CI, and the commodity-risk extension was
reviewed twice on its substance. The gap is in *evidence of process*, not in care. But it means
v1.0 cannot currently claim its normative content went through the process the specification
describes, which is the same shape as the two conformance findings behind the endorsement
proposals. Recorded before the fact rather than after someone else establishes it, and
deliberately **not** relabelled: the audit recommends one resolution acknowledging the eleven as
predating the written rule, not eleven back-dated approvals.


### Added — `GOVERNANCE.md`: the review rule, written down

The rule was being followed by habit. Writing it down now makes it a choice; writing it after
someone observes that normative changes were merged by a second account under the same control
would be damage control, and would read as such.

- **Two-tier review, by pull request only.** Tier 1 (non-normative) takes one approving review
  and no comment period. Tier 2 (`schema/`, closed codelists, `conformance/levels.md`, the
  suite, the report schema — and the mark grammar and the two closed registers, which are
  normative for licensees rather than CDM artifacts) additionally requires a recorded
  resolution and a **stated comment period of at least 14 calendar days**. Direct commits to
  `main` are not a permitted route for any change of any class.
- **The Standards Committee is not constituted, and the document says so.** It will be
  constituted at the **first external certification** — externally observable, and not
  quietly deferrable. Until then decisions are interim resolutions under the bootstrap clause,
  which stays authoritative in `governance/README.md` and is referenced rather than
  paraphrased.
- **The two repository identities are disclosed.** `concertfoundation` authors;
  `concertcustodian` reviews, approves and merges; **both are operated by the same natural
  person.** The separation is procedural, not independent, and the document says that in those
  words. A governance document that implied independence it lacks would be worse than none,
  because it would convert an undisclosed limitation into a false statement.
- **Registration is not adoption.** `governance/proposals/` is non-normative: a proposal's
  presence in this repository is not a statement that it has been accepted, and it is not part
  of the standard.
- **An effective date, and no retroactive relabelling.** The process applies from 20 August
  2026. Earlier changes followed prior practice — including direct commits to `main` and pull
  requests merged with administrative override — and are recorded as superseded, not as having
  followed a rule that did not exist.

### Found — the published governance page contradicts the repository

`concert.foundation/governance` presents the Standards Committee as a currently operating body,
with a membership composition. The repository states that none is constituted, and twenty
interim resolutions are in force precisely because none is. A draft correction for the page is
recorded at `governance/site-alignment/`, **not applied** — the page is outside this
repository. This is the same class of defect the claim triad exists to catch: a body that is
designed being described as one that is operating.

*Superseded. The drafted correction was overtaken before it was applied; the live page already
stated what it proposed. Recorded at [`governance/site-alignment/OUTCOME.md`](governance/site-alignment/OUTCOME.md).*


## [0.14.0] — 2026-08-20 — Working Draft

### Added — the v1.0 train, specified and registered (not started)

Four further proposals from a second round of multi-market, multi-tenant implementation
questions, plus an amendment record that revises two of the existing ones. **Nothing here
touches a normative artifact.** The seven proposals that make up the v1.0 train are registered
so the train can be planned, sequenced and estimated; twenty-two gates are open and every one
of them is for the Standards Committee.

- **[CP-EventType-Closure](governance/proposals/CP-EventType-Closure.md)** — `eventType` has
  eight values for eighteen objects and stops at `contract.signed`; the entire implementation
  stage has no codes. The gap is already being filled silently: an implementation that places an
  Order must emit an Event, there is no code for it, so it mints one and passes conformance. The
  proposal **derives** the vocabulary from the existing lifecycle enums and checks it in CI for
  drift, rather than curating it by hand.
- **[CP-Policy-Applicability](governance/proposals/CP-Policy-Applicability.md)** — every gate in
  the model is opt-in at instance level: a `Policy` that is never cited is never applied. Adds
  `Policy.appliesTo` and a derived required-set, with a new `F-GATE` requirement at Full.
- **[CP-Mandate-Scope](governance/proposals/CP-Mandate-Scope.md)** — `Mandate.scope` is required
  and completely unconstrained. `{}` satisfies it. Adds structure, and an `F-SCOPE` requirement
  whose limit is stated rather than left to be discovered: SIGNET can test what an agent
  *declares* it read, not what it actually read.
- **[CP-Process-Spine](governance/proposals/CP-Process-Spine.md)** — `SourcingEvent` has no link
  back to `Need`, the one break in an otherwise fully linked spine. One optional field. The only
  item in the set that delivers value alone, and a candidate for an earlier v0.x minor.
- **[CP-Amendments-Round-2](governance/proposals/CP-Amendments-Round-2.md)** — recorded as a
  reviewable amendment rather than folded silently into what it touches, and **applied** to both.
  §A1 adds same-tenant event chaining to CP-Tenancy; §A2 dissolves gate `C-3` in
  CP-Codelist-Enforcement.

Two gates **dissolved** rather than resolved, which is why the train's gate count fell from
twenty-four to twenty-two:

- **Event chain partitioning.** The question — is the chain partitioned by tenant, or one chain
  with tenant recorded per event — is well-formed, and the model answers it in neither of the
  terms offered. The chain is **per subject**: there are as many chains as there are subjects.
  There is nothing to partition, so isolation becomes a conformance rule over the existing
  structure. What that does *not* give you is stated too: **there is no total order within a
  tenant**, and any tenant-level ordering is a projection an implementation constructs.
- **`C-3` retirement semantics.** A closed vocabulary over an append-only stream cannot retire a
  value, because retirement means "no longer valid" and every historical event asserts otherwise.
  **Codes are never retired.** The `discouraged` marker becomes guidance in the non-normative
  disposition file; the fourth CSV `Status` column is declined with its reasoning, because it is
  the obvious answer and will be re-proposed otherwise.


## [0.13.0] — 2026-08-19 — Working Draft

### Added — extension composition, part 1: namespaced private fields

Proposed under [CP-Extension-Composition](governance/proposals/CP-Extension-Composition.md) and
**landed ahead of ballot** under the bootstrap clause: `schema/` and `conformance/suite/` are
normative, so it went through the change-proposal path rather than a direct merge, non-breaking
though it is. Landing it does not ratify it — the proposal remains a draft until balloted, and
the Standards Committee may amend or reverse it.

The Extensions page has always told implementers to add structure "under their own namespace."
Against the published schemas that instruction was unexecutable: every object schema sets
`additionalProperties: false`, so an ERP company code, a cost centre or an internal approval
reference could not be carried at all without failing document conformance.

- **Object schemas now permit namespaced properties.** A `patternProperties` entry admitting
  `^[a-z][a-z0-9-]*:[A-Za-z][A-Za-z0-9]*$` sits alongside the unchanged
  `additionalProperties: false`, at 22 sites: the 18 root objects, `Obligation`, `Item`,
  `InvoiceLine`, and the inline `Lot`. So `example-org:costCentre` validates, while
  `procurringParty` — a misspelling of a core field — is still refused, because it carries no
  prefix. That refusal is the property the wire contract rests on and it is untouched.
- **Say exactly what a prefixed field is.** Permitted by the core schema and constrained by
  nothing. It is not modelled, not assessed by core conformance, earns no mark, and is never
  promoted into the core model without first becoming a published extension. Nothing here adds
  tenancy, market or marketplace support, and nothing here is a partial delivery of
  [CP-Tenancy](governance/proposals/CP-Tenancy.md).
- **`signet:` and `concert:` are reserved; bare `x-` is forbidden.** Both are enforced by the
  conformance suite rather than the schema pattern: a negative-lookahead regex works under Ajv
  but sits outside the portable ECMA-262 subset that non-JavaScript validators reliably
  implement, and a governance rule encoded there would be silently unenforced on exactly the
  implementations least likely to be checked. Prefixes are otherwise self-asserted and
  first-come — Concert operates no prefix registry.
- **Four fixtures, so the escape hatch is proven rather than asserted.**
  `fixtures/valid/order-private-extension.json` (new, and the load-bearing one) must validate;
  `party-unknown-property.json` (new) must be rejected; `party-reserved-prefix.json` (new)
  must validate against the schema and still be refused by C-DOC; and `party-bad.json` is
  narrowed to the `partyType` enum rule alone, its `additionalProperties` role having moved to
  `party-unknown-property.json`. Without the positive fixture a later schema edit could close
  the hatch unnoticed.
- **A JSON-LD corollary, documented so implementers do not meet it by surprise.** A private
  prefixed field has no context mapping and is therefore dropped during JSON-LD expansion. That
  is semantically correct — a private field has no global meaning — and it is a useful forcing
  function: to survive expansion you must publish a context, which is the first step toward
  being an extension rather than a private field.

Non-breaking. Every instance valid before this change is still valid, and existing
certifications are unaffected.

### Added — the tenancy change-proposal set

Three linked proposals registered in `governance/proposals/`, arising from a multi-market,
multi-tenant implementation question. None is balloted and none is implemented beyond Part 1
above.

- **[CP-Extension-Composition](governance/proposals/CP-Extension-Composition.md)** — two
  mechanisms where the model conflates one: a private prefixed field (Part 1, above) and a
  composed published extension (Part 2, requiring the 2020-12 migration and therefore the v1.0
  train). Three gates open.
- **[CP-Tenancy](governance/proposals/CP-Tenancy.md)** — tenant, market and marketplace are
  three independent concepts and none exists in the CDM; today all three are carried implicitly
  in the DID authority of an identifier, which is unpatchable once instances exist. Breaking, so
  v1.0 or never. Four gates open; `T-4` resolved as deferred — a network of SIGNETs is a
  roadmap item, `Event.tenancy.marketplaces` would record the emitting node as attribution
  only, and no federation capability is claimed.
- **[CP-Codelist-Enforcement](governance/proposals/CP-Codelist-Enforcement.md)** — seven closed
  codelists are enforced by nothing: they are `"type": "string"` with a CSV pointer in a
  description, so `"procedure": "banana"` passes C-DOC today. Four gates open. It must land in
  or before the v1.0 train **if CP-Tenancy does**, or v1.0 ships `regulatoryRegime` modelled as
  closed and tested as open — the claim-triad failure the suite exists to prevent.

### Added — governance: marks, registers, and two conformance findings

A single workstream. It began as a question about where implementation-roadmap collateral
should sit, and drafting a competency framework against the **actual JSON schemas** rather
than the wiki prose surfaced two gaps between what is claimed and what is tested. Those are
the substantive discovery; everything else is consequence.

- **The two findings.** `Consent` has no conformance requirement — C-DOC validates it
  structurally and nothing tests that access is gated, that revocation takes effect, or that
  `Document.accessGrant` is honoured. And mandate enforcement is demonstrated, not certified —
  F-SEM requires a `Decision` to *cite* `policiesApplied`; nothing requires the limits in those
  policies to have been *respected*. An implementation that awards beyond an `approvalThresholds`
  policy with no `humanApproval`, while recording `underMandate` and `policiesApplied` correctly,
  passes F-SEM and reaches Full. The record is well-formed, hash-chained, provenance-bearing,
  and false. Both are now stated plainly in `conformance/levels.md` §5 and
  `conformance/README.md`, whatever happens to the proposals below.
- **`governance/mark-grammar.md`** — the complete set of marks Concert issues, in one document
  rather than extended per requirement: three head terms never crossed (`SIGNET Certified` for
  implementations, `SIGNET Registered` for people, `SIGNET Accredited` for training providers),
  an ASCII ABNF, short forms licensed only where they resolve to the registry, prohibited
  constructions, the wind-down windows, and what anyone may say without a licence. Six interim
  resolutions recorded with their reasoning. Marks as W3C Verifiable Credentials was considered
  and **declined**, with the reasoning kept because the idea will return.
- **`tools/lint-mark-strings.js`** (`npm run lint:marks`) — the ABNF, checked mechanically in
  CI, against the registers rather than a hard-coded list. It also fails the build on a
  superseded mark form or a prohibited construction anywhere in published copy.
- **Two registers, closed and append-only** — `governance/endorsement-register.md` (two
  entries, each recording the three-part admission test; `Consent Enforcement` carries its scope
  limit in the register itself) and `governance/role-register.md` (four roles; `Foundations`
  confers no mark).
- **`governance/role-competency-framework.md`** and **`governance/person-assessment.md`** — what
  a person must be able to do, stated by reference to normative artifacts, with the assessment
  mode declared per domain, plus the rubric and the binding appeals route that must exist before
  any person mark issues.
- **Four change proposals** in `governance/proposals/`, none balloted: grant lifecycle,
  mandate enforcement (`E-MDT`), consent revocation (`E-CNS`), and credential semantics.
- **Endorsements — a second, additive axis** (`conformance/levels.md` §2.4). Draft and not in
  force: `conformance/rules/check-endorsements.js` runs twelve checks against two optional
  adapter surfaces (`conformance/adapter/endorsement-adapters.md`), decides no level, and
  licenses no mark.
- **A third planted defect in the broken adapter** — an agent that cites its mandate and its
  policies correctly and does not enforce them. It **passes F-SEM** and **fails E-MDT-1**, in
  CI, on every commit. The distance between those two results is the whole argument for the
  endorsement, and it is worth keeping even if that proposal is declined.
- **`codelists/eventTypeCore.csv`** — a closed, normative core subset within the open
  `eventType` list, with `consent.granted`, `consent.revoked`, `mandate.granted`,
  `mandate.revoked`. The two `mandate.*` codes are *promoted*, not added: their meanings are
  fixed rather than changed. Protected by CODEOWNERS, and `conformance/rules/check-codelists.js`
  asserts in CI that the open and closed files never intersect — a closed codelist whose closure
  depends on someone noticing is not closed.

### Changed

- **Specification §7.4 — grant-type objects and withdrawal.** A normative defined term
  (`Consent` and `Mandate`, enumerated), the rule that withdrawal is an appended event and never
  a mutated field, and the effective/not-effective projection rule, reproducible by a third party
  from the event stream alone. **No schema change** — `Event.subject` already carries the grant
  identifier. No `*.expired` code exists: expiry has no actor, and `Event` requires one.
- **Positioning corrected against the claim triad.** *Modelled*, *tested*, and *certified* are
  three different statements, and the copy blurred them — always in the direction that
  overstates. The Architecture Overview no longer says conformance with the specification's MUSTs
  "is decided mechanically by the Conformance Harness" without qualification; `Mandate` is no
  longer "the structural guarantee that agents cannot exceed their remit"; and the auction
  profile's AP-4 now says it tests record completeness, not that the ceiling held.
- **The canonical mark form is now `SIGNET Certified: Full (CDM v0.1, suite v0.1)`** — ASCII,
  colon-delimited, lintable. The em-dash form is superseded and CI rejects it.
- **`Consent.purpose` and `Consent.revocable` descriptions** — `purpose` is a human-readable
  statement, not a machine-evaluable term, with the profile extension path stated; `revocable` is
  a capability flag, not a status.

### Note on status

Nothing here has been balloted. Twenty interim resolutions are in force under the bootstrap
clause, each ratifiable, amendable, or reversible by the Standards Committee once constituted.
**CP-Grant-lifecycle is the only item that must clear before v1.0**; its mechanism is landed
ahead of ballot because closing a codelist subset is materially cheaper before publication under
a stable URI and DOI than after. Neither endorsement proposal gates v1.0 — both must land before
the *first certification*, which is a separate and later constraint.

## [0.12.0] — 2026-07-20 — Working Draft

### Added
- **Auction conformance profile** — the first product-certification path
  (`docs/profiles/auction-platform.md`), composing entirely from shipped artifacts: it
  names five demonstrable requirements (valid objects, deterministic close, tamper-evident
  record, governed awards, no PII in the chain) checkable with the public suite.
- **Extension conformance rules** — executable cross-object checkers for the
  onboarding (case↔qualification closure, conditional integrity), auction (the
  recorded winner equals the deterministic close; reserve integrity), and identity
  (Full-level: humanApproval resolves both ways; approver ceiling covers the decided
  value) extensions, wired into CI. All four extensions now have machine-backed
  conformance. Governance: commodity-risk resubmission record — merged as Working
  Draft.
- **Five P2P/SRM extension specs (Working Drafts, spec-first)** — receipt & governed
  three-way match; supplier performance (SLAs as Policy, assessments feeding the
  qualification lifecycle); contract amendments (event-anchored deltas, derived
  state); framework agreements & call-offs; negotiation under per-term mandates.
  Schemas and conformance rules follow per-extension after review, per the process
  established by commodity-risk.

## [0.10.0] — 2026-07-05 — Working Draft

### Added
- **Onboarding extension spec** at `docs/extensions/onboarding.md` (previously
  undelivered; schemas and demo shipped in 0.6.x).
- **Commodity-risk extension — technical artifacts.** Six schemas (ExposurePosition,
  CoveragePolicy as a Policy subtype, PriceMark, CoverageAssessment, Scenario,
  HedgeProposal), ten codelists (positionStatus and policyEvaluationStatus closed),
  an eleven-file full-loop worked example (belowMinimum → proposal → executed →
  withinCorridor, arithmetically reconciled), and the six conformance rules as an
  executable checker (`conformance/rules/check-commodity-risk.js`) — three are
  cross-object checks beyond schema validation: reconciliation arithmetic, scenario
  fixed-cost invariance, escalation-first rule ordering. Completes the extension
  accepted in principle in `governance/reviews/2026-07-commodity-risk.md`.

## [0.9.0] — 2026-07-05 — Working Draft

### Added
- **Identity profile (Working Draft)** — `docs/extensions/identity.md`: how SIGNET
  represents natural persons. Humans act under Mandates (core `Mandate` reused —
  `agent` accepts any actor); authority is a `delegationOfAuthority` Credential;
  new `Approval` object makes `humanApproval` resolvable and verifiable
  (approver pseudonym, role, authority credential, provenance). Normative no-PII
  rule for hash-anchored records (pseudonymous person references only; resolution
  is an organisational obligation). Authentication is out of scope by design.
  The agent demo now emits the verifiable `Approval` at runtime and checks the
  approver's authority ceiling covers the award value.
- **Commodity-risk extension (Working Draft spec)** — `docs/extensions/commodity-risk.md`:
  portfolio-level commodity risk governance (positions, coverage corridors as Agent-layer
  Policy subtypes, price marks, assessments, scenarios, hedge proposals bridging to core
  `Need`). Accepted in principle by the Standards Committee
  (`governance/reviews/2026-07-commodity-risk.md`) — the first member-proposed extension,
  reviewed under the identical process as any proposer. Schemas, worked example, and
  conformance rules to follow as a separate change.

### Changed
- **Documentation & demo alignment.** Brought the repository's prose level with its code:
  the top-level `README.md` now documents the conformance harness, the **three
  demonstrations** (agent award, onboarding, auction) with their current outcomes, and an
  **Extensions & profiles** table with per-item status. `agent/README.md` was corrected to
  the current MAT weighting (price 0.20 / quality 0.55 / social 0.25 — the dearer,
  higher-quality bid wins 0.859474 vs 0.8415) and the verifiable-`Approval` check. Extension
  specs are consolidated under `docs/extensions/<id>.md` (the auction spec renamed to
  `auction.md`) with a new `docs/extensions/README.md` index; the wiki sidebar points at the
  specs and demos. No schema or normative change.

## [0.8.0] — 2026-07 — Working Draft

### Added
- **Auction extension** — process-layer objects `Auction` (a profile of the sourcing
  flow; reverse / english / dutch / sealed-bid / multi-criteria via `auctionType` +
  deterministic `rules`) and `Bid`. The auction rules and canonical bid record are
  normative and operator-independent — any conformant operator closing the same bids
  under the same rules MUST reach the same `Award`. The close reuses `Decision`/`Award`;
  eligibility ties to `SupplierQualification`; the bid history is a hash-chained `Event`
  trail. Open `auctionType` codelist; reverse-auction worked example. Modelled on
  Prozorro's neutral-core architecture: price formation in the standard, UX in the
  operators.

## [0.7.0] — 2026-06 — Working Draft

### Added (all optional, non-breaking)
- **Settlement linkage** — makes the commitment→discharge loop traversable as data
  (Concepts of Open Commerce §9, the Settlement primitive):
  - `Obligation.dischargedBy` — references the Order/Invoice/Document(s) that
    discharged the obligation. SHOULD be present once `status` is `met`.
  - `Invoice.settles` — references the Obligation(s) the invoice settles.
    SIGNET-original: it is **not** an EN 16931 Business Term and is **omitted on the
    Peppol BIS projection**, so ViDA convertibility is unchanged. A new projection-skip
    guard (`npm run test:projection-skip`) proves `settles` never leaks into UBL.
  - `eventType` codelist: `obligation.discharged`.
  - Three worked fixtures, all conformance-checked: a discharged obligation, a
    *pending* obligation carrying neither new field (the machine proof the additions
    are optional), and an invoice with `settles`.
- Referent granularity uses a composite `contractId/obligationId` URI (option (a));
  `Obligation.id` is unchanged. No existing field changed; documents valid before this
  release remain valid.

### Changed (non-breaking; examples only)
- **MAT evaluation policy reweighted to price 20% / quality 55% / social value 25%**
  (was 40 / 35 / 25). The change is carried in the policy's own `expression`
  (`score := price*0.2 + quality*0.55 + social*0.25`) and its `humanReadable`
  statement; `examples/policy-evaluation.json` bumped to `version: 1.1.0`. The agent
  demo reads the weights from the Policy expression, so its trace and scores
  regenerate from this single source.
- **Award scenario now demonstrates a justified price premium.** Under the new
  weighting the dearer bid wins: `submission-5521` (€11.4M, quality 0.9, social 0.7)
  scores **0.859474**, ahead of `submission-5522` (€10.8M, quality 0.78, social 0.85)
  at **0.841500** (margin 0.017974) — a 5.56% price premium accepted on materially
  higher quality. The demo is now a proof of governed multi-criteria judgement rather
  than a low-bid pick. `examples/award-decision.json` (Appendix A) and the agent run
  resolve to the same winner, weights, and scores.
- The **award value (€11.4M, the winning bid)** remains intentionally distinct from the
  **contract value (€12M, the category tier)** in `examples/contract.json`: awards are
  struck at the bid, contracts at the tier/ceiling. No schema or normative-grammar
  changes; sub-criterion scores are unchanged, only the weighting and resulting totals.

## [0.6.0] — 2026-06 — Working Draft

### Added
- **Supplier onboarding extension** — process-layer objects `OnboardingCase`
  (buyer-internal workflow; invited + submitted entry; revalidation/remediation
  case types) and `SupplierQualification` (durable status with first-class
  `conditional` qualification, value caps and category restrictions). Reuses
  Credential/Policy/Decision/Event/Consent. Screening results carried as
  attestations, never performed by SIGNET. Open `credentialType` codelist; two
  worked examples. Workflow states are normative; credential types are extensible.

## [0.5.0] — 2026-06 — Working Draft

### Added
- **Agent demonstration** (`agent/`) — a runnable proof that a synthetic agent can
  take a governed, accountable, conformant action. An agent reads a SourcingEvent,
  is bounded by a **Mandate** (its €12M value exceeds the €10M autonomous ceiling, so
  **human approval is required**), applies the **published** MAT evaluation Policy
  (weights parsed from the Policy's own expression), and emits an Award **Decision**
  with rationale, inputs, policies applied, human approval, and provenance — plus a
  five-event, hash-chained audit trail.
  - `agent-card.json` (A2A), `mandate.json`, two `Submission` bids, assessment inputs.
  - `reasoner.js` — the pluggable "Model" (deterministic default; marked seam for a
    live frontier model via MCP/A2A).
  - `agent-runtime.js` — the "Harness": mandate gate, policy application, provenance,
    event-chaining.
  - `run-agent.js` — runs the scenario, narrates it, and **verifies the output is
    conformance-clean** (every object validates; chain holds; tampering detected).
  - `LIVE_MODEL_NOTE.md` — how to swap in a real model for a live demo with no change
    to the harness.
- CI now runs the agent demo on every commit; its output must validate and the event
  chain must hold.

## [0.4.0] — 2026-06 — Working Draft

### Added
- **Conformance harness** (`conformance/`) — the machine-runnable suite behind the
  "SIGNET Certified" mark. Implements CDM §13 and the certification neutrality
  rules CN-1…CN-4.
  - `levels.md` — Core vs Full levels; requirements C-DOC, C-EVT, C-PROV (Core)
    and F-MAP, F-SEM (Full); CN neutrality rules.
  - `certification.md` — the identical-for-all certification process.
  - `runner/run-conformance.js` — runs the suite against any implementation via a
    small adapter, emits a machine-readable report, computes the level achieved.
  - `adapter/reference-adapter.js` — a complete conformant implementation (reaches
    **Full**); `adapter/broken-adapter.js` — deliberately non-conformant, **failed**
    by the harness at C-EVT and F-MAP, proving the suite discriminates.
  - Positive + negative document fixtures (invalid documents that MUST be rejected).
  - `report-schema.json` — schema every conformance report conforms to (CN-4).
- CI now runs the harness on every commit: the reference implementation must reach
  Core+, and the broken implementation must be rejected.

### Changed
- `tools/signet-to-ubl.js` refactored to export a pure `toUBL(invoice)` function
  (shared by the CLI, the harness, and the website); CLI output unchanged.

## [0.3.0] — 2026-06 — Working Draft

### Added
- **`tools/signet-to-ubl.js`** — a dependency-free reference transform that
  projects a SIGNET canonical Invoice into a UBL 2.1 Invoice conforming to
  **Peppol BIS Billing 3.0** (EN 16931 compliant). Each mapping is annotated
  with its BT/BG reference.
- **`examples/invoice.ubl.xml`** — the generated Peppol BIS Billing output for
  the worked invoice, committed so the projection is visible without running it.
- **`tools/verify-ubl.py`** — parses the generated UBL and reconciles every key
  EN 16931 Business Term and the monetary totals against the source invoice;
  exits non-zero on mismatch.
- CI now runs the transform and verification on every push, so "convertible to
  Peppol BIS" is a continuously-proven claim, not an assertion.
- `npm run transform` and `npm run verify-ubl` scripts.

### Notes
- This is a faithful reference projection, not a substitute for official Peppol
  validation. Production use should additionally run the output through the
  Peppol/EN 16931 XSD + Schematron validation artefacts.

## [0.2.0] — 2026-06 — Working Draft

### Added
- **Complete process layer.** JSON Schema for the remaining OCDS-aligned
  lifecycle objects: Need, Evaluation, Award, Contract, Order, Catalogue,
  Obligation, and Invoice.
- **EN 16931 building blocks** in the foundation definitions: Unit, InvoiceLine,
  and VatBreakdown, with field-level mappings to EN 16931 Business Terms.
- **EN 16931-mapped Invoice** schema and worked example. The Invoice carries
  33 EN 16931 Business Terms / Groups (BT-1…BT-158, BG-4/7/23/25), so a SIGNET
  invoice is convertible to Peppol BIS Billing / UBL Invoice / Factur-X. This is
  the structural basis for the EU ViDA cross-border e-invoicing claim.
- New worked examples: `need.json`, `contract.json` (with embedded obligations),
  and `invoice.json` (EN 16931-mapped, arithmetically consistent: €6,200 net +
  €1,302 VAT @ 21% = €7,502 payable), all CI-validated.

### Fixed
- BT-mapping annotations on `$ref` fields are now preserved under Draft-07 by
  wrapping the reference in `allOf` (Draft-07 ignores keywords that sit beside a
  bare `$ref`). EN 16931 traceability is now structurally retained in the schema.

## [0.1.0] — 2026-06 — Working Draft (Request for Comments)

### Added
- Foundation layer: Identifier, Party, Value, Period, Classification, Item,
  Credential, Document, Provenance, Score.
- Process layer (initial): SourcingEvent, Submission, Policy.
- Agent layer: SyntheticAgent, Mandate, Decision.
- Trust layer: Event, Consent.
- JSON-LD `@context` aligning to ePO, PROV, and W3C VC.
- Closed and open codelists (CSV).
- Worked examples with CI validation.

### Notes
- This is a working draft for community review. Field-level definitions are
  illustrative of the model's shape and not yet frozen.
- Targets JSON Schema Draft-07 for maximum implementer-tooling compatibility.
  A migration to 2020-12 will be considered before v1.0.
