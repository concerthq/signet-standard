# CP-Consent-revocation

**Status:** Draft — not yet balloted. Gates resolved as interim resolutions (§9).
**Implemented ahead of ballot, non-gating:** the five checks run in
`conformance/rules/check-endorsements.js` and the consent adapter surface is documented in
`conformance/adapter/endorsement-adapters.md`. They decide no level and issue no mark: `E-CNS`
becomes earnable only when this proposal carries and the
[endorsement register](../endorsement-register.md) entry moves to `active`.
**Affects:** `schema/consent.schema.json` (description only), `conformance/`
**Target:** CDM v0.2 / suite v0.2
**Breaking:** No for schemas and documents; yes for the consent adapter (new; base contract unchanged)
**Depends on:** CP-Grant-lifecycle
**Scope note:** Narrowed. The `eventType` core closure and the effective/revoked projection rule
were hoisted to CP-Grant-lifecycle so that CP-Mandate-enforcement can cite them without depending
on this proposal. What remains here is consent-specific.

---

## 1. Problem statement

Design principle 1.5 states that data sovereignty is explicit and that the model separates an
assertion from the right to access the data behind it. `Consent` expresses the grant. Nothing
currently tests, or gives consequence to, its terms.

**P1 — `revocable` has no enforced consequence.** The field records whether a grant may be
withdrawn. Nothing prevents an implementation from withdrawing an irrevocable grant by any private
means and remaining fully conformant. The field is currently inert.

**P2 — Temporal and party terms are untested.** Whether a grant outside its `validity` still
authorises, and whether a party absent from `grantee` is refused, are unexamined by any conformance
requirement. `Document.accessGrant` — the mechanism separating the existence of a document from the
right to read it — has no tested effect.

**P3 — `purpose` is unconstrained free text.** Purpose limitation cannot be evaluated at access
time, cannot be compared across grants, and cannot be tested. The field states an intention no
implementation can act on mechanically.

**Consequence.** `Consent` validates structurally under C-DOC and does nothing else. Data
sovereignty is modelled and asserted; it is not certified.

**Scope limit.** This proposal addresses the **interoperability of the grant**, not the security of
the system holding the data. Whether a production system physically refuses a read is a security
posture property assessed under ISO 27001 and SOC 2 regimes. Concert should not claim to certify
it — see §6, G2. This limit is why the corresponding endorsement is named *Consent Enforcement*
rather than *Data Sovereignty*.

---

## 2. Codelist entries

Three entries are proposed for admission to the closed core subset of `eventType` established by
CP-Grant-lifecycle §3:

| Code | Title | Description |
|------|-------|-------------|
| `consent.granted` | Consent granted | A data-sovereignty access grant was issued. |
| `consent.revoked` | Consent revoked | An access grant was withdrawn before expiry. |

Their meaning under the projection rule is settled by CP-Grant-lifecycle §4. No `consent.expired`
code is proposed: expiry has no actor, and the projection rule tests `validity` directly
(CP-Grant-lifecycle R-G2).

---

## 3. Schema additions

**None required** under the recommended option. Effectiveness is determined by the projection rule
in CP-Grant-lifecycle §4, which requires no field on `Consent`.

One description amendment to `purpose` is made under §4; no field is added, removed, or retyped.

---

## 4. `purpose`

`purpose` remains **free text**. No `purposeCode` is added to core.

The field's schema description is amended to state that it is a **human-readable statement of the
purpose for which access is granted, not a machine-evaluable term**. The string interoperates; its
evaluation is not defined by this standard.

**A profile MAY define a `purposeCode` extension** with a codelist appropriate to its jurisdiction
or sector, via the extension mechanism. Purpose and lawful-basis vocabularies differ across
jurisdictions and sectors; a single core codelist would be wrong for most adopters and would
duplicate vocabularies others already govern. This is what profiles exist for.

**Regulatory consequence.** Purpose limitation sits at the **compliance enablement** tier, not
normative mapping. The field allows an implementer to record a purpose. It does not enforce one,
and no positioning copy may imply that it does.

---

## 5. Adapter surface

Checks E-CNS-1, E-CNS-2, and E-CNS-4 require the harness to attempt an access authorisation. The
base adapter contract has no such surface — its four methods are productive, not authorising.

A **consent adapter** is added, implemented only by implementations seeking the endorsement, on the
same pattern as the agent adapter in CP-Mandate-enforcement §4. The base contract is unchanged.

```
authoriseAccess(documentId, requestingParty, atTime) -> Authorisation | Refusal
```

`Refusal` reuses the shape defined in CP-Mandate-enforcement §4, with `rule` carrying the `E-CNS-*`
identifier and `policy` omitted — consent refusals derive from the `Consent` object, not from a
Policy. A `consent` field carries the identifier of the grant that was evaluated, or is absent
where no grant was found.

`atTime` is supplied by the harness rather than read from the system clock, so that effectiveness
and validity checks are deterministic and reproducible under CN-4.

Refusals are not required to be evented. The probing concern that motivates `mandate.refused` in
CP-Mandate-enforcement §3 does not apply symmetrically: a refused read discloses nothing and
changes no state, whereas a refused agent action reveals the position of a ceiling the agent is
testing. Whether read attempts should nonetheless be evented for audit purposes is left to
implementations and profiles.

---

## 6. Conformance rules

Proposed as the checks constituting the **`E-CNS`** endorsement, per the endorsement axis ratified
in the Mark Grammar. The endorsement is earned only if all checks pass; per-check results are
reported for diagnostics.

| Check | Requirement |
|-------|-------------|
| **E-CNS-1** | A `Consent` that is not effective at time *T*, per CP-Grant-lifecycle §4, MUST NOT authorise access at *T*. |
| **E-CNS-2** | An access request by a party not named in `grantee` MUST NOT be authorised. |
| **E-CNS-3** | A `consent.revoked` event whose subject has `revocable: false` MUST be rejected. |
| **E-CNS-4** | A `Document` carrying `accessGrant` MUST resolve authorisation through the referenced `Consent`; one without `accessGrant` MUST NOT be gated by it. |
| **E-CNS-5** | The effective/not-effective determination MUST be reproducible by a third party from the published event stream alone. |

E-CNS-3 gives `revocable` its first enforced consequence. E-CNS-4 is the non-triviality guard: it
prevents an implementation passing by gating everything or nothing, which would satisfy the other
checks while demonstrating no actual use of the mechanism.

E-CNS-5 keeps the endorsement inside CN-4.

Endorsement admission is subject to the three-part test in Mark Grammar R2. Consent enforcement
satisfies it: orthogonal to the level axis, not universally applicable, machine-testable.

---

## 7. Backward compatibility

| Change | Breaking? | Notes |
|--------|-----------|-------|
| Codelist entries | No | Additive; admitted under CP-Grant-lifecycle's mechanism. |
| `E-CNS` checks | No | New endorsement; changes neither Core nor Full. |
| `purpose` description amendment | No | Clarifies existing semantics; no field change. |
| Consent adapter | Yes, but only for implementations seeking the endorsement |

This proposal is non-breaking for schemas and documents, and because it creates an endorsement
rather than altering a level, **v1.0 publication need not wait on it**. Its dependency,
CP-Grant-lifecycle, is the piece that must land first.

---

## 8. Rejected alternatives

**A — Certify runtime access enforcement.** Rejected. Concert has neither the audit machinery nor
the standing to assess security posture, and the implied claim would exceed what any suite could
establish from an adapter. The endorsement name follows this limit rather than obscuring it.

**B — Fold consent checks into the mandate endorsement as a single governance badge.** Rejected
under Mark Grammar R2: the two properties are independently applicable, so a merged badge has no
coherent earning rule.

**C — Do nothing; document as a scope limitation.** Viable and honest, and the fallback if the
committee declines. It costs the ability to make any interoperability claim about consent and
requires the corresponding correction to published positioning.

---

## 9. Resolutions

Two gates, resolved as interim resolutions under the bootstrap clause. Ratifiable, amendable, or
reversible once the Standards Committee is constituted.

**R-G1 — `purpose` codeability.** *Free text; no core codelist; profile extension path stated.*

The gate as originally framed asked which field shape to adopt. The operative question is whether
purpose limitation becomes a tested mechanism or is declared out of scope, and that decides it: no
E-CNS check evaluates purpose, so adding an optional `purposeCode` would introduce a modelled,
codelisted, machine-comparable field that nothing verifies — the exact inert-field pattern this
proposal exists to correct, and which `revocable` already exemplifies. Making it tested would
require the access request to carry a requesting purpose, widening the adapter surface and adding a
sixth check, for a property no adopter has yet asked for.

Purpose vocabularies are also the paradigm case for a profile rather than core: they differ by
jurisdiction and sector, and a Concert-authored core list would be wrong for most adopters while
duplicating vocabularies others already govern.

*Rejected:* **P-2** (optional `purposeCode` in core) for the inert-field reason above; **P-3**
(closed enum) as breaking and substantively wrong, since permitted purposes are effectively
unbounded and a closed list would push implementers into misfitting codes.

**R-G2 — Scope limit.** *Ratified.* E-CNS certifies the interoperability of the grant —
representation, projection, temporal and party evaluation — and not runtime access enforcement.

Two conditions attach to the ratification:

1. **The limit must be stated in three places**, not resolved here alone: this proposal, the
   endorsement register entry for `Consent Enforcement`, and the published positioning that
   currently implies the broader claim. A ratification that does not reach the copy leaves the
   overclaim standing, which is the reason the gate was raised.

2. **A positive statement accompanies it**, so the limit does not read as a bare deficiency. What
   E-CNS establishes: grant terms are represented interoperably; the implementation's own
   authorisation decisions honour those terms as the model defines them; and because the
   determination is reproducible from the published event stream, a third party can verify after
   the fact whether access decisions were consistent with the grants then in force. What it does
   not establish is the security posture of the system holding the data, which is assessed under
   ISO 27001 and SOC 2 regimes. Positioning should point at those rather than duplicate them.
