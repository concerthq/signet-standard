# Response to implementer enquiry of 20 August 2026

**From:** Concert Foundation, under the bootstrap clause — no Standards Committee is constituted; constitution is proceeding under the draft instrument at `governance/CONSTITUTION-2026-09.md`
**Re:** twenty-one questions against v0.15.0
**Drafted:** 20 August 2026 against v0.15.0 · **Published:** 31 August 2026 against v0.16.1 (`584a01c`)
**Status:** Tier 1 published record · comment period fourteen days from publication, **not waived**, running on the record
**Closes:** D-40 — the v0.16.0 changelog cited this path eleven days before the file existed

---

## Terms of this response

Interests are recorded at `governance/interests-register.md` entry 1 and are not restated here.
Four terms follow from the record and govern every answer below:

- **No core change here rests on the enquiry's evidence.** Every correction is verifiable
  against `schema/`, `codelists/`, `conformance/` and `state-model/` by someone who has never read
  the enquiry. The basis rule at `docs/state-model.md` §6 requires this.
- Contributed patterns are adopted as **evidence, published de-named**, never as `basis`.
- This response carries a **fourteen-day comment period, not waived**, running on the record.
- **The enquiry will be published in de-named form**, not verbatim, once the enquirer has confirmed the name substitutions; until then each question is restated in one line below. The draft of this response promised
  verbatim publication; the standing rule that no named individual or commercial implementer
  appears in this repository (D-19, enforced by `check-naming.js` in CI) forbids it. The declined alternative — a
  second publication surface the naming check does not scan — is the D-1 pattern applied to
  governance.

One conclusion from the enquiry was recorded rather than deferred: the bootstrap arrangement was
scoped to let design proceed without a Committee, not to absorb a public enquiry alongside twenty
unratified resolutions. **The governance load, not the design load, is the binding constraint.**
That produced IAR-0006 and the draft constitution; see G1.

## Why this is eleven days late

The response was drafted on 20 August and the corrections it describes landed in v0.16.0 the same
day. The response itself did not land; the v0.16.0 changelog said it had. That is D-40, the same
shape as D-31 and D-44 — a released record citing an artifact that was not there. It was held for
two things: a site correction that turned out to be already true of the live page (D-22,
`governance/site-alignment/OUTCOME.md`), and a rewrite of one paragraph that this version carries
at G3. Neither justified eleven days. Recorded here so the delay is on the record it caused.

---

## What changed, and what is still in flight

Nine of the twenty-one questions found something. The corrections landed before the draft was
written; this table states where each stands on `main` at v0.16.1, which is not everywhere the
draft said.

| Change | Prompted by | Tier | State at v0.16.1 |
|---|---|---|---|
| `docs/state-model.md` §2a — CDM `status` is market-facing (S-4, normative) | A1 | 1 | **Landed** v0.16.0 |
| Registry completed to all 29 objects; `Evaluation` declared stateless with rationale | A2, and D-15 in our own artifact | 1 | **Landed** v0.16.0; C12 guards it |
| §5 R-3 — derived predicates | B2 | 1 | **Landed** v0.16.0 |
| §5a — controlled reopen; `requiresAuthority` must name `decisionType` | B4 | 1 | **Landed** v0.16.0 (§5a); C13 landed 31 August 2026 — D-53 |
| §4a — entry-kind test | B5 | 1 | **Landed** v0.16.0 |
| §6 B-3 — basis scope: externality is not generality | B3 | 1 | **Landed** v0.16.0 (B-3, corroboration); C14 landed 31 August 2026 — D-53; D-16 closed on both |
| §11 — derived artefacts | B6 | 1 | **Landed** v0.16.0 |
| C11 terminal reachability · C12 registry completeness · C13 authority · C14 basis scope | B1, D-15, D-16 | 1 | Registry side landed v0.16.0; checks C11–C14 landed 31 August 2026 after the v0.16.0 changelog cited them prematurely (D-53) |
| `codelists/bindings.json` + `check-codelist-binding.js` | C2 | 1 | **Landed** v0.16.0; wired into CI at `84d9931` |
| Generated closed-list enums in schema | C2 | 2 — IAR-0003 | **Not landed.** On pull request #43, open since 21 August; comment period restarted 29 August, completes 12 September. D-14 reopened; D-30 records the changelog's premature claim |
| `docs/absence-discipline.md` | F2 | 1 | **Landed** v0.16.0 |
| `governance/defects.md`, `governance/REVERSAL-RISK.md` | G2 | 1 | **Landed** v0.16.0; the register now runs to D-52 |
| `.github/ISSUE_TEMPLATE/scope-enquiry.md` | this enquiry | 1 | **Landed** v0.16.1 — the intake route this enquiry had to do without |

---

## A. The reframing question

**A1 — asked whether core `status` is market-facing only, extensible for internal workflow, or free.**

Market-facing only, and the standard already said so without saying it. §2a now states it
normatively as S-4, and the derivation matters more than the statement: every core edge must be
justified from OCDS, the Procurement Act procedures, UBL / EN 16931 or ePO. **None of those
instruments models a buyer's internal review.** An internal-governance edge cannot satisfy B-1.
Core status was market-facing by construction from the moment the basis rule landed; nobody had
said so.

So the modelling was at the wrong layer, and the correction is the one the enquiry anticipated:
internal workflow as a namespaced profile field, each profile state declaring a `coreEquivalent`
(§7). Five states project to `planned`, `issued` projects to `active`.

Extending a core vocabulary to carry internal workflow is explicitly forbidden — core vocabularies
are closed. The third reading is not the position: the choice is not free, though the profile is
unconstrained.

**A2 — asked whether `Evaluation` has a lifecycle, and how a score override is modelled.**

`Evaluation` is a terminal record, now declared as such in the registry with rationale. A scoring
workflow is internal governance and follows A1 into a profile.

The override is not a state. **An overridden score with a justification and an actor is a
`Decision`** — `decisionType`, `rationale`, `madeBy`, `underMandate`, `provenance`. That is the
object already; modelling it as a state discards the authority record that makes the override
defensible.

**A3 — asked how to prove which policies were locked at issue.**

No schema change; the event carries it. Record the content hash of each referenced `Policy` in the
payload of the issue event. The chain then proves what was locked at issue — demonstrable rather
than asserted. A `lockedAt` on `Policy` is the weaker version of the same thing: it asserts a lock
instead of evidencing one. Guidance to follow in `docs/`; no core object changes.

---

## B. The state model

**B1 — offered a terminal-reachability check distinct from C9.**

Accepted, implemented, and it found two things. C9 asks whether a state can be *entered*; the
contributed check asks whether an object can *end*. Landed as C11 with a first-class case C9
could never catch — an object with no terminal state at all.

**B2 — asked whether `Policy → superseded` and `Evaluation → consumed` are states.**

Both are suspect, and one is worse than suspected. `Policy(evaluationModel) → superseded` is
`Bid.superseded` again: a relation to a later Policy, an annotation event carrying the superseding
identifier. `Evaluation → consumed` is not an annotation either. Consumed *by an `Award`* is
computable from the graph at read time — a **derived predicate**, R-3, new in §5. It should not be
recorded at all. R-3 exists because of this question.

The three-way test now in §5: derivable from **this object's own stream** → state; from **another
object** → relation or predicate, depending on whether the fact must be recorded at a moment or
merely computed.

**B3 — asked whether a single-jurisdiction instrument is an acceptable basis for a core edge.**

The rule was underspecified and is now split. A named instrument is an acceptable basis; a
single-jurisdiction one is not sufficient for **core**. §6 B-3 distinguishes `general`,
`jurisdictional` and `implementer` scope. An edge resting only on one country's
telecommunications security regulation is properly a jurisdiction profile — core would otherwise
oblige every implementer in every market to carry it.

When C14 was first run it flagged **two core edges in our own registry** on a jurisdictional
basis (D-16). Both were corroborated against a general source rather than the check being relaxed.

The honest answer *"one implementer's operating instruction"* is the rule working. Those go to a
profile, and the profile is a supported destination rather than a consolation.

**B4 — asked how controlled reopen is modelled.**

Reopen is a transition, with two constraints from the model. A `terminal: true` state cannot be
reopened; if an object can be reopened, that state is not terminal and the registry must say so.
And a reopen edge declares `decisionType` — C13 fails an edge marked `requiresAuthority` that
names none, so the requirement cannot be documented and left unenforced. One reopen pattern with
capability-specific clauses is consistent with this.

**B5 — asked for a test distinguishing creation, transition and annotation.**

§4a. Does something exist that did not? Creation. Does **this object's own state** differ?
Transition. Is a fact recorded *about* it, its own state unchanged? Annotation. A relation is
never a transition, because the object it relates to is not this object.

**B6 — offered the rule that where two records of one relationship exist, one is generated.**

Adopted as §11, and it immediately fixed C2 in principle and found a live instance in the standard:
`submissionStatus.csv` duplicated the inline enum on `Submission.status` and was referenced by no
schema. Recorded as D-13; decided — the inline enum is the single record; closed.

The consequence is worth recording because it is the same rule biting the other way. Deleting the
CSV made a published `$id`-space URL return 404: two consumers existed in the website repository
and neither was recorded here, so the claim that the file had no consumer was unfalsifiable from
inside this repository (D-24, D-27). It was restored retired-but-resolvable under IAR-0005, merged
before its period elapsed to end the 404 — a recorded departure (D-29) — and the repository now
declares its public interface (`public-interface.json`, `check-public-interface.js`). The 58-of-68
measurement is cited de-named in §11 as the evidence that motivated adoption.

---

## C. Submission and codelists

**C1 — noted that the implementer's code was more conformant than its documentation.**

No action, and worth quoting. It is a better diagnostic than most audits.

**C2 — reported that `{"procedure": "banana"}` validates.**

The draft of this response said "landed, not scheduled". Half of that is true. `bindings.json`
binds each closed codelist to the schema location whose enum it governs, and
`check-codelist-binding.js` asserts agreement — both landed at v0.16.0 and run in CI. **The
generated enums have not landed.** They are Tier 2 and ride IAR-0003 on pull request #43, open
with a comment period that completes 12 September. Until it merges, `banana` still validates on
`main`, D-14 is reopened, and D-30 records that the v0.16.0 changelog said otherwise. The CI
binding step is temporarily non-gating for the same reason (#51), with the revert condition stated
in the workflow.

Sequencing answer is unchanged: **build to the enums as though enforced.** The vocabulary is fixed
by the CSVs today; #43 makes the schema say so. No local enforcement layer, nothing to retire.

One thing the enquiry's follow-up on `decisionType` changed. As drafted, IAR-0003 generated a bare
`enum`, which would have foreclosed extension values on four closed lists by generator shape
(D-39). The amendment on #43 generates `anyOf: [{enum}, {pattern}]` with a reservation rule for
prefixes already used by core codes (D-37). A profile-scoped authority decision therefore carries a
prefixed `decisionType` and validates; the question is decided on the record rather than as a side
effect.

**C3 — asked about credential presentation versus buyer-side lookup, and `submittedBy`.**

Presentation is the intended path. `disclosedCredentials` is first-class; buyer-side lookup is a
permitted fallback whose result must be recorded as a `Credential` or `Document` with provenance,
so the record shape is identical either way. The dependency on external lookup availability
dissolves — a supplier presenting a credential does not require the buyer to reach a provider.

`submittedBy` — yes, distinct from `submittingParty`, and it is the agent-attribution field an
audit claim rests on. Note D-20: `Decision.inputs` is documented to hold credentials and typed
`Identifier[]` with a scheme list that names no credential; recorded, open, and the reason
`identifierScheme` binding is deferred on #43.

---

## D. Extensions

**D1 — asked for dates on spec-only extensions gaining schemas.**

No dates, and a principle instead — now written down. Under the standing rule extensions land
spec-first (`docs/extensions/`); a spec-only extension is non-normative until its schema ships;
building against it is at implementer's risk and should be isolated behind a translator. Schema
sequencing follows implementer need — name which block first and it goes first. The `requirements`
extension landed spec-first at v0.16.1 on exactly this rule.

**D2 — asked whether to build against per-term mandates in the amendments extension.**

Build against it, expect revision. Per-term mandates are the intended structure. The recorded
finding that no gate tests a mandate's contents is more useful to the extension than a new local
model would be; contributed rules are published de-named.

**D3 — asked whether event-scoped exclusion and supplier-scoped suspension are two objects.**

Yes. Event-scoped exclusion is `Submission.inadmissible`; supplier-scoped suspension is
`SupplierQualification.status`. Different subjects, different authorities, different durations.

**D4 — asked whether the identity extension's erasure rule is general.**

General, and being generalised: **no erasable content in hash-anchored records**; resolution held
outside the chain in the identifying organisation's own erasable store. D-9, in progress. It makes
the tension not arise rather than resolving it — a chain that never contained erasable data has
nothing to erase.

---

## E. Tenancy and the spine

**E1 — offered an account from a live multi-market estate for the tenancy proposal.**

Wanted, on the standing terms: published de-named as evidence, not `basis`. Tenant / market /
marketplace as three independent concepts matches the proposal's own framing.

The proposal is **parked**, not live — the v1.0 train was withdrawn at v0.15.0. What changed since
the draft: IAR-0006 reopened *registration* until constitution or 30 September, for
defect-remedying proposals only, adoption still parked. `CP-Tenancy` is not defect-remedying and
stays parked; evidence contributed now attaches to the defects it rests on and informs the remedy
when the Committee takes it up.

**E2 — asked whether a private `needRef` should be dropped if the spine link lands.**

Confirmed. One optional field; the private field is dropped in its favour. `CP-Process-Spine`
remains parked with the others.

---

## F. Conformance

**F1 — asked whether "obligation cited, discharged by no rule" is checkable.**

Tractable as a coverage check, not a correctness check, and the distinction is the whole answer.
Decidable: for each declared obligation, does **any** rule in the artefact set reference the
operands the obligation names? That catches the reported case exactly — one obligation credited
to four requirements and discharged by none. Not decidable: whether a rule that *does* reference
the right operands enforces the obligation **correctly**. That is program verification and the
standard should not claim it.

The requirement would read: *a cited obligation MUST be discharged by at least one rule in the
same artefact set that references its operands.* Recorded as a conformance direction; the
contributed measurement is the argument for it. The reading that the two findings are a general
hazard of policy-as-data rather than gaps in the standard is accepted.

**F2 — reported that 58 of 68 gates failed open on absent inputs.**

Adopted: `docs/absence-discipline.md`. Empty, null and absent are three states and only the third
fails open, because an undefined operand yields an undefined rule body. Every negative fixture
requires an absence twin. The 259-reference measurement is published de-named as the evidence.

---

## G. Governance

**G1 — asked when the Committee is constituted and whether an implementer may sit on it.**

The draft said "at first external certification; no honest indicative date". That changed, because
this enquiry changed it. The certification trigger was a floor against deferral, not a bar against
readiness, and constitution now proceeds by appointment under the draft instrument at
`governance/CONSTITUTION-2026-09.md`: two members on completed assessments, quorum of both,
unanimity, the steward non-voting, deadlock leaving a proposal in Draft. IAR-0006 opens a
registration window that expires on constitution or 30 September, whichever is earlier; five
proposals are registered under it with comment periods that complete on 12 and 14 September. A
first-session agenda and a member brief are drafted. The instrument decides nothing until executed,
and it is not executed.

Implementer participation: **yes as a technical contributor, no as a voting member.** A deploying
implementer sitting on the body that certifies it is a conflict of the same shape as the one
already disclosed, and importing it into the remedy is a poor trade. Technical contribution, public
comment, published evidence and the scope-enquiry route (SE-0001 is the first through it) are open
and scale to more than one implementer.

**G2 — asked which of twenty interim resolutions carry reversal risk.**

Answered as an artifact rather than in correspondence: `governance/REVERSAL-RISK.md` annotates each
interim resolution with a band and reasoning. IAR-0002 and IAR-0003 are `low`; IAR-0004 is
`medium`. **Seventeen remain unassigned, and unassigned reads as unassessed rather than as low.**
That gap is visible by design; closing it is first-session business.

**G3 — observed that the site's governance page contradicted the repository.**

The draft said the correction would be applied before publishing. On inspection the live page
already stated what the drafted correction proposed, and the draft had never been closed out —
two records kept describing it as unapplied (D-22, closed; `governance/site-alignment/OUTCOME.md`).
Inspection found three further claims on the site the draft had not examined; those were taken
up in the website repository. What remains open on the site is recorded, not hidden: the Pages build
regenerates on the wrong trigger (D-23, open), and the site pins this repository at a release tag,
so the records this response cites reach it at the next tag, not before.

The observation that this was the one item an outsider could read uncharitably was correct, and the
eleven-day delay to this response is a second such item, recorded above.

---

## H. What is accepted, and on what terms

Accepted: the terminal-reachability check (C11), the absence-twin pattern
(`docs/absence-discipline.md`), the derived-artefact discipline (§11), and the tenancy account
(wanted, attaching to the recorded defects).

On terms that are not a formality. Contributed evidence is published **de-named**, so any
implementer can read and contest it. It is never `basis`: a core entry needs an external
instrument, and an implementation's measurements — however good, and these are good — are evidence
about the world rather than justification for a rule. That distinction is the whole firewall, and
this enquiry was the first thing to test it.

The nine objects, 55 transitions, 112 rules and 248 fixtures are wanted on the same terms, through
the scope-enquiry route.

---

## Closing

Three of these twenty-one questions found defects in artifacts published four days before the
enquiry, including two in the registry that defines the rule it broke. That is what implementation
review is for, and it arrived faster and sharper than any committee would have.

The dating caveat was well taken, and this document honours it the hard way: drafted against
v0.15.0, published against v0.16.1, stating where each correction stands so it can be checked
against the tree rather than believed — including the one that has not landed.

*Recorded for the Standards Committee.*
