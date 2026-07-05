# SIGNET Canonical Data Model — Identity Profile v0.1

**Profile id:** `identity` · **Status:** Working Draft · **Licence:** CC0 1.0
**Steward:** Concert Foundation
**Applies to:** the core CDM (Foundation, Agent, Trust layers). Adds one object
(`Approval`), one codelist entry, and three normative rules. No core object changes.

This profile specifies how SIGNET represents **natural persons** — the third identity
plane, alongside organisations (`Party`) and synthetic agents (`SyntheticAgent`) —
and makes human authority symmetric with agent authority.

---

## 1. Motivation

SIGNET currently treats machine identity more rigorously than human identity. An
agent that awards a contract is fully identified: a DID, a `Mandate` bounding its
capabilities, provenance on every act. The human who approves that award is an opaque
`Identifier` with no role, no authority basis, nothing verifiable. Every
`humanApproval` in the standard is an identity claim with no substance behind it.
This profile closes that asymmetry with the primitives the standard already has.

## 2. Design principles (normative intent)

- **P1 — Humans act under Mandates too.** A corporate delegation-of-authority (DoA)
  matrix — "the category director may approve to €10M; above that, the CFO" — is a
  human `Mandate`: an identity, granted authority, bounded capabilities, a validity
  period. The core `Mandate` object is reused **unchanged**: its `agent` field is an
  `Identifier` and accepts any actor — synthetic agent or person. A mandate threshold
  being exceeded is a *handoff from one mandate to another*, both verifiable.
- **P2 — Authority is a Credential.** A person's authority to approve is attested by
  a `delegationOfAuthority` credential issued by their organisation — the
  supplier-qualification pattern reapplied to people. Credentials will change
  (organisation-attested today; qualified eIDAS-wallet attestations as the EU Digital
  Identity Wallet rolls out) **but the flow does not**: the object upgrades its
  `proof`, nothing structural moves.
- **P3 — SIGNET records who acted; it never authenticates anyone.** Authentication
  (SSO, passkeys, MFA, identity-proofing) is an operator and organisational concern,
  permanently out of scope. The standard's concern is the verifiable **record**:
  actor reference, authority claim, provenance.

## 3. Normative rules

1. **No personal data in hash-anchored records.** Objects and `Event`s that
   participate in hash chains MUST NOT contain personal data. Person references MUST
   be pseudonymous identifiers (e.g. `did:web:buyer.example#officer-7c2f`) that
   encode no name, email, employee number, or other directly identifying attribute.
   *Rationale:* an append-only, tamper-evident record is irreconcilable with
   erasure obligations (e.g. GDPR right to erasure) if it carries personal data;
   pseudonymisation preserves both chain integrity and erasability.
2. **Resolution is an organisational obligation.** The mapping from pseudonym to
   natural person is maintained in the identifying organisation's own
   access-controlled, erasable system of record, resolvable under audit or legal
   process. Accountability is preserved; the portable record carries no PII.
3. **Approvals are verifiable objects.** Where a `Decision` carries `humanApproval`,
   the referenced identifier SHOULD resolve to an `Approval` object (§4). A bare,
   unresolvable approval reference is permitted only at conformance Core; SIGNET Full
   requires resolvable Approvals.

Cross-organisational note: a counterparty needs to verify *that an authorised person
approved*, not *who they are*. The pseudonymous Approval plus the authority
credential's `selectiveDisclosure` support provides exactly that.

## 4. The `Approval` object

What `humanApproval` resolves to: who (pseudonymous), in what role, under what
authority, approved which decision, when.

Required: `id`, `decision`, `approver` (pseudonymous `Identifier`), `role`,
`authorityCredential` (a `Credential` of type `delegationOfAuthority`), `approvedAt`,
`provenance`. Optional: `underMandate` (the human Mandate acted under).

The `authorityCredential`'s `credentialSubject` carries the authority basis — e.g.
`{ "authorityBand": "band-4", "approvalCeiling": { "amount": 25000000, "currency": "EUR" } }`
— so a verifier can check not just that a human approved, but that the human held
authority sufficient for the decision's value. Its `proof` is an organisation
attestation today; a qualified eIDAS attestation later (P2).

## 5. Codelist addition

`codelists/credentialType.csv` (open) gains:
`delegationOfAuthority` — attestation of a person's approval authority band, issued
by their organisation.

## 6. Concert's own identity posture (informative)

The steward's needs are deliberately minimal: GitHub identities bound by the CLA
assistant for contribution (the Corporate CLA schedule maps accounts to
organisations); legal signatures for membership; organisational identifiers
(registry number / LEI + `did:web`) for the member and certification registries.
**Concert does not operate an identity provider.** The steward defines how identity
is represented and verified in the standard; operators authenticate; organisations
resolve.

## 7. Honest limits (normative disclosure)

This profile makes identity claims **verifiable, attributable, and tamper-evident**;
it does not make identity-proofing **true**. An organisation can issue a false
delegation-of-authority credential exactly as a corrupt certifier can sign a false
ISO certificate. The guarantee is: *this approval was made under this claimed
authority, and the record has not changed* — not ground truth about the humans.
Implementations MUST NOT represent conformance with this profile as identity
assurance in the eIDAS/NIST sense.

## 8. Schemas & examples

- `schema/approval.schema.json`
- `examples/approval.json` — the approval behind the agent demo's award decision:
  pseudonymous officer, `category-director` role, a band-4 DoA credential with a €25M
  ceiling (sufficient for the €12M award), organisation-attested proof.

## 9. Demo linkage (informative)

The agent demo's `Decision.humanApproval` (`#approval-771`) resolves to
`examples/approval.json`. The demos MAY be extended to emit the Approval object at
runtime and validate it in their verification blocks; this profile does not require
it.
