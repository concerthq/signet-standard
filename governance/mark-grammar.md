# SIGNET Mark Grammar

**Status:** Interim resolution — adopted under the interim-committee bootstrap clause. Tabled for
ratification at the first constituted Standards Committee.
**Class:** Normative for licensees under the IP & Licensing Policy. Not a CDM artifact.
**Version:** v0.1
**Steward:** Concert Foundation
**Licence:** CC0-1.0
**Registers:** [endorsement register](endorsement-register.md) · [role register](role-register.md)
**Linter:** `tools/lint-mark-strings.js` (`npm run lint:marks`) checks §4 mechanically.

> This document defines the complete set of marks Concert issues, the form each takes, the
> abbreviations permitted, the constructions that are prohibited, and the claims anyone may make
> without a licence. It is designed once, in full, rather than extended per requirement.

**Note on status.** The six decisions recorded in §10 were resolved as interim resolutions because
no Standards Committee is yet constituted. Referring them would have deferred them indefinitely,
and the cheapest moment to fix mark structure is before the first mark is issued. Each resolution
is recorded with its reasoning and is ratifiable, amendable, or reversible by the committee once
seated. An interim resolution is a decision, minuted as such — not a deferral.

---

## 1. Why this was settled now

Three separate open decisions each require a mark form, and each would otherwise extend the mark
independently:

- **Endorsements** (CP-Mandate-enforcement, G1) — a governance property orthogonal to the
  Core/Full axis, which must appear in the mark rather than only in the registry.
- **Person credentials** (Role & Competency Framework, G2) — otherwise at risk of colliding with
  the implementation mark, so that an individual's credential reads as an organisational
  certification.
- **Provider accreditation** (training structure) — a third subject class with no defined form.

The previous form was already near its limit at *SIGNET Certified — Full (CDM v0.1, suite v0.1)*.
Extending it three more times without a grammar produces a mark nobody writes in full and everyone
truncates arbitrarily, which is the condition under which marks stop meaning anything.

---

## 2. Design rules

**R1 — The registry record is the source of truth; the string is a projection.** A mark is issued
as a structured record. The canonical string is derived from that record deterministically, by one
generator. No mark string is authored by hand. This mirrors the model's own principle that current
state is a projection over a durable record, and it makes drift between the string and the fact
structurally impossible rather than merely discouraged.

**R2 — Every abbreviated form must resolve.** Short forms are licensed only in media where they
resolve to the registry entry. A claim that travels without its qualification becomes a claim about
something else.

**R3 — One head term per subject class, never crossed.** See §3. This is the whole of the
person/implementation confusion fix.

**R4 — The mark governs claims of *assessment*, not claims of *implementation*.** The artifacts are
CC0. Anyone may implement SIGNET and say so. What requires a licence is the assertion that Concert
assessed them. This bright line is what keeps the marks defensible: they restrict only the thing
Concert is actually the authority on.

**R5 — Absence is never a required statement.** No licensee is obliged to state what it lacks. The
registry is the record of what was assessed, and a reader may draw inferences from it.

---

## 3. Subject classes and head terms

| Subject | Head term | Issued to |
|---------|-----------|-----------|
| An implementation | **`SIGNET Certified`** | A system that passed the conformance suite |
| A person | **`SIGNET Registered`** | An individual who passed a role assessment |
| An organisation delivering training or assessment | **`SIGNET Accredited`** | A training provider |

These three head terms are reserved and non-transferable across classes. A person is never
*Certified*. An implementation is never *Registered*. A provider is never either.

**Why `SIGNET Registered` and not `SIGNET Credential`.** `Credential` is already a Foundation-layer
primitive, and supplier submissions routinely carry `Credential` objects — ISO certificates,
insurance, accreditations. A mark reading *SIGNET Credential* would be read as *a Credential object
in SIGNET format* rather than *a mark issued by Concert*, allowing a self-asserted credential to
borrow the appearance of Concert-issued status. That is ambiguity in the one direction this grammar
exists to close.

*Registered* has professional-body precedent — registered architect, registered engineer — reads
naturally in the sentences people actually write, and describes what literally happens: the
holder's entry is in a public register.

*Practitioner* was rejected. It is a SAFe credential noun, and borrowing vocabulary from the
framework Concert is structurally distinguishing itself from is an avoidable confusion.

---

## 4. Canonical grammar

ABNF, per RFC 5234. Punctuation is fixed so the form can be linted in CI.

**All canonical mark strings are ASCII.** No em-dashes, en-dashes, or typographic quotation marks.
Mark strings travel through CSV exports, contract templates, and procurement systems with varying
encoding support; a mark that mangles in a client's document is a mark that gets retyped wrong.

```abnf
mark              = impl-mark / person-mark / provider-mark

impl-mark         = "SIGNET Certified" ":" SP level
                    [ ";" SP endorsement-list ]
                    SP "(" version-qual ")"

level             = "Core" / "Full"

endorsement-list  = endorsement *( "," SP endorsement )
endorsement       = 1*( ALPHA / SP )    ; drawn from the closed endorsement register

version-qual      = "CDM v" version "," SP "suite v" version

person-mark       = "SIGNET Registered" ":" SP role
                    SP "(" "CDM v" version ")"

role              = 1*( ALPHA / SP )    ; drawn from the closed role register

provider-mark     = "SIGNET Accredited Training Provider"
                    SP "(" "syllabus v" version ")"

version           = 1*DIGIT "." 1*DIGIT [ "." 1*DIGIT ]
```

**Endorsement ordering** MUST follow the order of the endorsement register, which is append-only.
Register order rather than alphabetical order keeps the string stable for a given set as the
register grows.

### Worked forms

```
SIGNET Certified: Full (CDM v0.1, suite v0.1)
SIGNET Certified: Full; Mandate Enforcement (CDM v0.1, suite v0.1)
SIGNET Certified: Core; Mandate Enforcement, Consent Enforcement (CDM v0.1, suite v0.1)
SIGNET Registered: Mandate Steward (CDM v0.1)
SIGNET Accredited Training Provider (syllabus v0.1)
```

---

## 5. Short forms and the resolution rule

| Form | Example | Licensed where |
|------|---------|----------------|
| **Canonical** | `SIGNET Certified: Full; Mandate Enforcement (CDM v0.1, suite v0.1)` | Everywhere. Required in non-resolvable media. |
| **Short** | `SIGNET Certified: Full` | Only where accompanied by a resolvable link, QR code, or footnote citing the registry URI. |
| **Minimal** | `SIGNET Certified` | Only as a hyperlinked badge resolving directly to the registry entry. Never as text. |

**Non-resolvable media** — print, slides, spoken claims, radio and video advertising — require the
canonical form. This is the rule that stops the mark decaying into an unqualified adjective, and it
is the rule most likely to be resisted, because the canonical form is long. It is long on purpose:
the qualification *is* the claim.

Endorsements MUST NOT appear in a short form without the level. `SIGNET Certified: Mandate
Enforcement` is prohibited — it implies a level that was not stated.

---

## 6. Prohibited constructions

| Construction | Why |
|--------------|-----|
| `SIGNET Compliant` | Conformance is not compliance. Collides with regulatory language and implies a legal status Concert does not confer. |
| `SIGNET Ready`, `SIGNET Enabled`, `SIGNET Powered`, `SIGNET Native` | Assessment-shaped claims with no assessment behind them. |
| `SIGNET Approved`, `SIGNET Endorsed` | Implies discretionary approval. Certification is mechanical; nothing is approved. |
| `SIGNET Partner` | Reserved to accredited providers, in the accredited form only. |
| `Concert Certified` | Concert is the certifier, not the certified. |
| `Certified by SIGNET` | SIGNET is a standard. It certifies nothing. |
| `SIGNET Credential` as a mark | Collides with the Foundation-layer `Credential` primitive. See §3. |
| Any mark implying preferential standing with Concert | Contradicts CN-3. Applies to every implementer without exception. |
| Person mark used to imply organisational certification | The distinct failure mode this grammar exists to prevent. Employing a registered individual is not certification of the employer. |
| Provider accreditation implying its materials are the reference | The syllabus is published; no provider's courseware becomes authoritative. |

---

## 7. Permitted without a licence

Because the artifacts are CC0, the following require no permission and Concert should say so
plainly. Restricting them would be both unenforceable and inconsistent with the dedication.

- *"Implements SIGNET CDM v0.1."*
- *"Maps to the SIGNET Common Data Model."*
- *"Self-assessed against the SIGNET conformance suite v0.1 — Core."*

The third matters most. It gives an implementer an honest route to describing its position **before**
certification, which removes most of the pressure that otherwise drives misuse of the licensed
mark. The qualifier `self-assessed` is mandatory in that construction; omitting it converts a
permitted factual statement into a prohibited assessment claim.

---

## 8. The machine-readable record

Every mark exists first as a registry record. The canonical string is generated from it.

```json
{
  "markClass": "implementation",
  "subject": "did:example:implementation",
  "level": "Full",
  "endorsements": ["mandate-enforcement"],
  "cdmVersion": "0.1",
  "suiteVersion": "0.1",
  "reportHash": "…",
  "issued": "2026-01-01T00:00:00Z",
  "status": "active",
  "registry": "https://concert.foundation/registry/…"
}
```

`reportHash` binds the mark to the reproducible conformance report required by CN-4, so any third
party can re-derive the result the mark asserts.

### Why implementation marks are plain registry records

Marks are **not** issued as CDM `Credential` objects or as W3C Verifiable Credentials. The
proposal was considered and declined. The reasoning is recorded here because it will be raised
again, and because the surface attraction of the idea is strong.

**It would move Concert from steward to operator.** Concert publishes artifacts and runs a test
harness. Operating a credential-issuing service as a conformant SIGNET implementation is a
different position: *Concert runs a SIGNET node* is a materially different claim from *Concert
stewards SIGNET*, and it is movement in the direction the governance firewall exists to prevent.
That the service would be non-commercial does not fully answer the objection, which is about
position rather than revenue.

**It would create a self-certification loop that no rule currently governs.** CN-1 to CN-4 bind
Concert as certifier. Nothing binds Concert as implementer, because the case was not contemplated.
Concert would assess itself, and the registry would hold a certification of the registry. The
public suite and reproducible reports blunt this — anyone may re-run the assessment — but it
introduces the one structural conflict the governance design exists to exclude, for a benefit that
is largely symbolic.

**It buys attestation on top of something stronger than attestation.** A signature proves Concert
said it. A reproducible conformance report proves it is *true*: any third party can re-derive the
result from the public suite and the implementation's adapter. CN-4 already delivers this, and it
is a strictly stronger property. The whole design premise is that Concert does not need to be
believed. A `reportHash` published in a registry served over HTTPS gives practical tamper-evidence
without new machinery.

**It couples mark format to CDM version.** Mark infrastructure should be *more* stable than the
standard, not versioned alongside it. Binding marks to a CDM object admits a case where a major
version change forces reissue of marks for reasons unrelated to what those marks assert.

**It adds an operational burden and a worse threat surface.** Issuer key management, rotation, and
revocation infrastructure are non-trivial for a small foundation. A compromised issuer key permits
forged certifications, which is considerably worse than a compromised website. And a buyer checking
a certification wants a URL that renders a page; serving a VC requires a verifier most do not have,
so both paths would be operated regardless.

**A prerequisite is missing in any case.** The model is currently underdetermined as to whether
`Credential` is a *reference to* a Verifiable Credential or an *embedding* of one — the prose
describes a pointer, the schema carries `credentialSubject` and `proof`. Mark issuance cannot be
built on a primitive whose semantics are unsettled. This ambiguity affects anyone modelling
supplier credentials and warrants its own change proposal irrespective of this decision.

### What is retained

Selective disclosure for person marks remains open, subject to the trigger recorded in §10 (R4).
It does not carry the objections above: the subject is an individual rather than Concert's own
infrastructure, so no circularity arises; it is a separate issuance path from the implementation
registry; and it is not needed until person marks exist.

The sequencing runs opposite to CP-Mandate-enforcement. That proposal had to be settled early
because its cost only rises. This one is additive: the registry record above already carries
everything a verifiable credential would assert, so issuance can be layered over the same records
later without invalidating anything. Issuing credentials now and withdrawing them later would
invalidate marks already in the field.

---

## 9. Lifecycle

Marks are qualified by version and therefore go stale. Status values:

| Status | Meaning | Display |
|--------|---------|---------|
| `active` | Current | Permitted in all licensed forms. |
| `superseded` | The qualifying CDM major version has been superseded; the assessment stands for the version stated | Permitted only in canonical form, which states the version. Short and minimal forms are withdrawn. |
| `withdrawn` | Revoked, lapsed, or misrepresented | All display ceases within the wind-down window. |

A new CDM **major** version requires recertification; a mark for a superseded version is not false,
but it is misleading whenever displayed in a form that hides the version. Hence the restriction to
canonical form rather than outright withdrawal — the honest claim survives, the abbreviated one
does not.

### Wind-down windows

Registry status changes **immediately** in all cases. Because every licensed form resolves to the
registry (R2), a badge displayed after withdrawal already fails at the point of resolution. The
windows below govern only the licensee's own materials, and are therefore narrower in effect than
they appear.

| Cause | Digital | Print and materials in circulation |
|-------|---------|------------------------------------|
| Lapse or non-renewal | 30 days | 90 days; no new print runs after notice |
| Misrepresentation | 5 business days | 90 days; no new print runs after notice |

No retroactive obligation attaches to executed contracts. The mark may not appear in new ones after
notice.

Provider accreditation and person marks follow the same pattern, qualified by syllabus and CDM
version respectively.

---

## 10. Resolutions

Six decisions, resolved as interim resolutions under the bootstrap clause. Each is ratifiable,
amendable, or reversible by the Standards Committee once constituted.

### R1 — Lexical choices *(resolved)*

Structure adopted as specified in §4. Three amendments to the drafted vocabulary:

1. Person head term is **`SIGNET Registered`**, not `SIGNET Credential`. Reasoning in §3.
2. **`Foundations` is not a registered role** and confers no mark. It is a prerequisite
   assessment, not a role. Granting it a mark would begin the badge inflation the structure exists
   to resist. Four registered roles: Conformance Engineer, Policy Author, Mandate Steward,
   Decision Reviewer.
3. **Canonical mark strings are ASCII only.** No em-dashes or typographic punctuation.

Role names are settled by Role & Competency Framework R-G3, which renamed `Assurance Reviewer` to
`Decision Reviewer` to avoid collision with audit-profession vocabulary. They are unrenameable once
the first mark issues.

### R2 — Endorsement register and constraint rule *(resolved)*

The three-part test is adopted as **normative**. An endorsement may enter the register only where
the property is:

- (a) genuinely orthogonal to the Core/Full level axis;
- (b) not universally applicable; and
- (c) machine-testable under CN-1.

The test is recorded against each register entry, making admission auditable rather than
discretionary.

**Two endorsements, not one.** Mandate enforcement and consent behaviour are separate entries. The
decisive argument is not accuracy but that a merged badge has no coherent earning rule: the two
properties are independently applicable — an implementation may run agents but hold no
access-controlled documents, or the reverse. A conjunction rule would make the badge unearnable for
most implementations; a disjunction rule would award it on the strength of the half not done.

**The second endorsement is named `Consent Enforcement`, not `Data Sovereignty`.** What the suite
tests is that grants are represented and honoured in the model's own terms. It does not test
runtime access control, which CP-Consent-revocation explicitly declines to certify. A badge reading
*Data Sovereignty* would assert precisely the thing the change proposal declines to assert.

Register mechanics: closed, append-only, each entry citing the conformance requirement IDs it
corresponds to. Entries are admitted only at a suite minor-version boundary.

### R3 — Wind-down windows *(resolved)*

Two-tier, split by cause, as specified in §9. Registry status changes immediately; the windows
govern licensee materials only.

### R4 — Selective disclosure for person marks *(deferred with trigger)*

Implementation marks as verifiable credentials is **declined** (§8) and is a resolved position, not
an open question; it should not be reopened without new argument.

Selective disclosure for *person* marks is deferred until **both** conditions hold:

1. the `Credential` pointer-versus-embedding ambiguity is resolved; and
2. the first role register entries are balloted.

Until then person marks are registry entries with resolution, mechanically identical to
implementation marks. A deferral with a stated trigger is a decision; an open gate is a queue.

### R5 — Enforcement posture *(resolved)*

**Complaint-driven. Concert does not build a monitoring function.**

Reporting is trivial and standing is universal: a public form, any party may file, and Concert
checks the claim against the registry mechanically. Competitors have the incentive to watch;
Concert has the authority to rule. That division costs almost nothing and scales without headcount.

Escalation, in order:

1. **Registry resolution.** The registry is the sole authority on what is held. Most disputes end
   here without contact.
2. **Correction request.** Concert cites the specific construction and the rule breached, with a
   window. Not published.
3. **Registry annotation, then licence termination.** For refusal or repetition. The registry entry
   records that the mark is not held.

**The primary remedy is informational, not legal.** Litigation is beyond a small foundation, and
the registry remedy is stronger and faster. Nevertheless **register the trademarks** in EU, UK, and
US: registration is inexpensive, preserves the option, and becomes unobtainable if another party
files first.

**Binding commitment:** enforcement is identical for all parties, including any operator affiliated
with Concert's founders, and actions are published in aggregate. Selective enforcement would damage
the neutrality claim more than any misuse it corrected.

### R6 — Commencement *(resolved)*

**Binds before v1.0, in stages.**

- **Implementation marks** — binds on adoption of this document, which MUST precede the first
  certification. There are currently no certifications, so nothing requires reissuing and the cost
  is zero.
- **Person marks** — bind when the role register is balloted.
- **Provider accreditation** — binds when the syllabus is published and the first provider is
  accredited.

The structure is fixed now; the vocabulary lands as each register does.

---

## 11. Dependencies raised elsewhere

- **`Credential` semantics — pointer or embedding?** The prose describes a reference to a W3C
  Verifiable Credential; the schema carries `credentialSubject` and `proof`, which is the
  credential's substance. This affects supplier credential modelling generally, not only marks.
  Warrants a change proposal in its own right, and blocks R4.
- **Endorsement register** — required before any endorsement may appear in a mark. First two
  entries determined by CP-Mandate-enforcement and CP-Consent-revocation.
- **Role register** — normative, closed, append-only; required before any person mark may issue.
  Four entries per Role & Competency Framework R-G3.
- **Profile marks — no production exists.** `docs/profiles/auction-platform.md` is the first
  product-certification path, and it was drafted against a mark string
  (*"SIGNET Certified — Auction Platform"*) that §4 does not admit. The copy has been corrected to
  the position this grammar implies: a platform certified against a profile holds the ordinary
  implementation mark, and the **registry entry** records which profile was assessed. That is
  coherent and requires no change here. Whether profiles should nonetheless become visible in the
  string — a fourth production, or a qualifier on `impl-mark` — is a real question, and the answer
  should be settled before a second profile exists rather than after. Note the pull in both
  directions: a profile that never appears in the mark is invisible where buyers actually read,
  while a mark that carries level, endorsements, profile, and two versions is one nobody writes in
  full. The endorsement register precedent argues for a closed profile register if it is admitted
  at all.

---

## 12. Traceability

The grammar carries every qualification the underlying artifacts require: level from
`conformance/levels.md`, version qualification from the governance rule that certifications name
both CDM and suite versions, `reportHash` from CN-4, and the no-preferential-standing prohibition
from CN-3. Where the grammar admits a claim, an artifact supports it. Where no artifact supports a
claim, the grammar prohibits it.
