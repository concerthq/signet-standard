# CP-Codelist-Enforcement

**Status:** Draft — not yet balloted. **Gates open** (§7); `C-3` dissolved (§8).
**Amended by:** CP-Amendments-Round-2 §A2
**Affects:** `codelists/`, `conformance/runner/`, `conformance/fixtures/invalid/`,
`conformance/suite/document-conformance.json`, `conformance/levels.md`,
`wiki/Codelists.md`, `wiki/Validation-and-Conformance.md`
**Target:** must land in or before the v1.0 train
**Breaking:** No for documents already conforming; yes for documents carrying a value outside a
closed list (§5)
**Depends on:** none
**Blocks:** CP-Tenancy (hard dependency), CP-EventType-Closure (supplies the mechanism)

---

## 1. Problem statement

**Closed codelists are currently prose.** Nothing enforces them.

Two enforcement styles exist in the model today, and the split is implicit rather than
decided:

| Style | Fields | Enforced? |
|---|---|---|
| Inline `enum` | `Party.partyType`, `Submission.status`, `SourcingEvent.status`, `SupplierQualification.status`, `OnboardingCase.status`, `Obligation.status` | Yes — by the schema |
| `"type": "string"` + CSV pointer in `description` | `procedure`, `eventType`, `documentType`, `partyRole`, `policyType`, `decisionType`, `identifierScheme` | **No** |

CI's codelist check lints `codelists/*.csv` for the header `Code,Title,Description`. It never
validates an instance value against a codelist. C-DOC validates against the JSON Schema, which
for the second group asserts only `type: string`.

Consequence: **`"procedure": "banana"` passes document conformance today.** So does
`"eventType": "nonsense"` and any `partyRole` an implementer invents.

The de facto split — lifecycle statuses closed in schema, semantic vocabularies open in
practice — is defensible as a design. It has never been decided as one, and the wiki does not
describe it. Implementers reading "See codelists/procedure.csv" reasonably infer the list
binds. It does not.

### 1.1 Why this becomes urgent now

CP-Tenancy introduces `regulatoryRegime` and declares it **closed, Concert-governed**, per
gate D3. Under the current design that word is unenforceable.

If CP-Tenancy lands at v1.0 without this CP, v1.0 ships a codelist that is **modelled as
closed and not tested as closed** — in the release that carries the first certifications
under the "SIGNET Certified" mark. Modelled, tested and certified are three different
statements. A certification citing a passing suite report for a codelist the suite does not
check is precisely the conflation the conformance harness exists to prevent.

---

## 2. Proposal

### 2.1 Mark each codelist open or closed

Add a sidecar `codelists/codelists.json` declaring the disposition of every codelist and the
JSON Pointers into instances where its values appear.

```json
{
  "regulatoryRegime": {
    "disposition": "closed",
    "file": "codelists/regulatoryRegime.csv",
    "valueLocations": [
      { "object": "*", "pointer": "/tenancy/markets/*/regulatoryRegime" },
      { "object": "SourcingEvent", "pointer": "/lots/*/market/regulatoryRegime" }
    ]
  },
  "procedure": {
    "disposition": "open",
    "file": "codelists/procedure.csv",
    "valueLocations": [
      { "object": "SourcingEvent", "pointer": "/procedure" }
    ]
  }
}
```

JSON Pointer per RFC 6901, consistent with the field-level attribution mechanism already
adopted in CP-decision-subject-binding.

The key is `valueLocations`, not `appliesTo`. CP-Policy-Applicability introduces `appliesTo`
as a **normative** field on `Policy` meaning "where this policy is required," and this sidecar
key means "where in an instance this codelist's values appear." The normative field is
permanent and the sidecar key is not, so the sidecar yields the name
(CP-Amendments-Round-2 §A2.5).

#### Discouraging a value without retiring it

*Added by CP-Amendments-Round-2 §A2.* **Codes are never retired.** Guidance that a value is
no longer preferred lives in this non-normative sidecar, never in the normative CSV:

```json
"eventType": {
  "disposition": "closed",
  "file": "codelists/eventType.csv",
  "discouraged": {
    "award.decided": {
      "since": "1.0.0",
      "prefer": "award.created",
      "note": "Superseded by award.created; existing events remain valid."
    }
  }
}
```

- The CSV keeps its three columns and the CI header lint is untouched. **No existing codelist
  file changes.**
- A `discouraged` value **validates**. The harness reports it as an informational note and
  never as a pass/fail input, preserving CN-1.
- **Removal is a CDM major, and it is the only breaking path.** A code leaves a CSV only at a
  major version; instances at earlier versions remain conformant against their declared
  version, which the version-stable URIs already guarantee, and migration is a
  re-certification concern `certification.md` already covers.

### 2.2 Enforce in the harness, not the schema

Closed-codelist membership becomes a C-DOC check in
`conformance/runner/`: for each closed codelist, every value at every declared pointer must
appear in the CSV.

**Rationale for harness over schema `enum`.** If closed lists are inline `enum`s, every
codelist addition is a schema change and therefore a CDM version bump. A new procurement
regime — an entirely routine event — would force a version increment on 18 schemas and, under
`certification.md`, potentially trigger re-certification. Harness enforcement lets the
codelist version independently of the CDM while remaining genuinely binding.

This mirrors the enforcement philosophy adopted in CP-Extension-Composition §2.3: **closed
things are enforced by the suite; permissive shapes by the schema.**

### 2.3 Open codelists remain advisory

An `open` codelist publishes recommended values and does not reject others. `Codelists.md`
must say this explicitly for each list, because the current prose implies otherwise.

### 2.4 Scope boundary — deliberate and tight

This CP establishes the **mechanism** and applies it to **`regulatoryRegime` only**.

Every existing codelist is marked `open`, preserving current behaviour exactly. Whether
`procedure`, `eventType`, `documentType`, `partyRole`, `policyType`, `decisionType` or
`identifierScheme` should become closed is a **separate decision per codelist**, left as an
open gate in §7 — not taken as a side effect of a tenancy change.

Closing `procedure` would invalidate every implementation using a national procedure name.
That may be right. It is not something to decide inside a CP about tenant modelling.

---

## 3. Conformance suite changes

| Fixture | Type | Targets | Must |
|---|---|---|---|
| `tenancy-bad-regime.json` | negative | `regulatoryRegime` value absent from the CSV | be rejected |
| `tenancy-good-regime.json` | positive | every value in the CSV validates | validate |
| `sourcing-open-procedure.json` | positive | a `procedure` value **not** in `procedure.csv` | **validate** — proving open lists stay open |
| `event-discouraged-code.json` | positive | a value marked `discouraged` in the sidecar | **validate**, and be reported as an informational note |

The third fixture is the one that keeps the scope boundary honest. Without it, a later edit
could quietly close `procedure` and nothing would fail.

The C-DOC requirement description in `conformance/levels.md` is amended to state that document
conformance includes closed-codelist membership. `levels.md` is normative, so this is a
normative change and the suite version bumps with it.

---

## 4. Reporting

The harness report gains a per-codelist result, so a report can distinguish a schema failure
from a codelist failure. `conformance/report-schema.json` is extended accordingly (CN-4: the
result must remain reproducible and publishable).

It also gains an **informational** `discouraged` result type (CP-Amendments-Round-2 §A2). It
records that an instance carried a discouraged value and what is preferred instead. It decides
nothing: it is never an input to pass or fail, because a discouraged value is valid. A result
type that could fail a candidate on guidance would make guidance normative by the back door.

---

## 5. Backward compatibility

**Non-breaking as delivered.** Every existing codelist is marked `open`, so no instance that
validates today ceases to validate. The only closed list is `regulatoryRegime`, which does not
exist before CP-Tenancy.

Later reclassification of any list from open to closed **is** breaking and requires its own CP
with its own migration analysis.

---

## 6. Rejected alternatives

**A — Inline `enum` for closed codelists.** Binding and simple. **Declined:** couples codelist
churn to CDM versioning. Adding one procurement regime would bump 18 schemas and touch
certification scope. The whole reason codelists are external files is to version independently.

**B — Do nothing; rely on prose.** **Declined:** this is the status quo, and it produces a
`regulatoryRegime` that is described as closed and tested as open. Certification would cite a
suite report that does not check the thing the specification claims.

**C — Close all existing codelists in this CP.** **Declined:** retroactively closing
`procedure`, `eventType` and `partyRole` would invalidate implementations without notice, and
each list warrants its own analysis. Bundling them here would also make a tenancy release
responsible for a breaking change to unrelated vocabularies.

**E — A fourth `Status` column on every codelist CSV** (`active` / `deprecated` /
`withdrawn`), as originally proposed under gate C-3. **Declined** (CP-Amendments-Round-2 §A2.2)
— recorded with its reasoning because it is the obvious answer and will be re-proposed
otherwise. It breaks every codelist file and the CI header lint, for **all** lists, to solve a
problem that exists only for closed ones, and it embeds a lifecycle in a format with no version
axis. More fundamentally, retirement has no coherent meaning here: a closed vocabulary over an
append-only stream cannot retire a value, because retirement means "no longer valid" and every
historical event asserts otherwise. Any `deprecated` marker immediately needs a rule saying it
does not apply retroactively — at which point the marker is not doing lifecycle work, it is
doing guidance work, and guidance belongs in the non-normative sidecar.

**D — Enforce via JSON Schema `$data` references to the CSV.** **Declined:** `$data` is an Ajv
extension, not part of any JSON Schema draft. Depending on it would make the normative model
validator-specific, which contradicts CN-2 — every implementer must be assessable against the
identical suite regardless of their stack.

---

## 7. Open gates for Standards Committee resolution

⛔ **C-1 — Disposition of each existing codelist.** Seven lists currently unenforced. Each
needs an explicit open/closed decision, taken individually with its own migration analysis.
Recommended order of consideration: `partyRole`, `policyType`, `decisionType` (small,
structural, low implementer exposure) before `procedure`, `eventType`, `documentType`
(large, high exposure).

⛔ **C-2 — Codelist versioning.** If codelists version independently of the CDM, a
certification must cite three versions (CDM, suite, codelist) rather than two. Confirm, and
update `certification.md` accordingly.

⛔ **C-4 — Extension-defined codelists.** `Extensions.md` permits extensions to add codelist
values. Under harness enforcement, does an extension's codelist file participate in the C-DOC
check, or only in the extension's separate assessment? Interacts directly with
CP-Extension-Composition.

---

## 8. Resolved gates

**C-3 — Deprecation semantics. Dissolved, not resolved** (CP-Amendments-Round-2 §A2). The gate
asked how a closed codelist retires a value without invalidating historical instances, and
proposed a fourth CSV `Status` column. Retirement has no coherent meaning over an append-only
stream, so there is no lifecycle to model: **codes are never retired.** The marker becomes
guidance and moves to the non-normative disposition file (§2.1); the fourth column is declined
with its reasoning in §6, alternative E. Removal remains possible only at a CDM major, which is
the single breaking path. Do not reopen without new argument.
