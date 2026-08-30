# SIGNET Certification Register

**Register version:** v0.1
**Class:** Normative. Closed and append-only.
**Status:** Established under the interim-committee bootstrap clause. **Zero entries. No
certification has been issued to anyone, including Score Networks.**
**Steward:** Concert Foundation
**Licence:** CC0-1.0
**Governs:** the registry entries required by [`certification.md`](certification.md) §2 step 4
and §3.1, and the resolvability condition on every short-form mark
([mark grammar](../governance/mark-grammar.md) §4).

An empty register is the accurate state, not a gap in this file. `certification.md` has
specified a public registry since it was written; the artifact did not exist, so a mark string
had nothing to resolve to and a published process named a record that could not be read. This
file is that record. It opens empty because nothing has been certified, and it says so here
rather than leaving a reader to infer it from an absent table.

Recorded as `governance/defects.md` D-44.

---

## 1. Register mechanics

**Closed.** A certification exists only if it appears in §3. There is no other record of one.
An implementer may not assert a Concert assessment that is absent from this register, and no
Concert-issued mark licence exists outside it.

**Append-only.** Entries are added, never removed or rewritten. A certification that lapses,
is superseded, or is withdrawn keeps its entry and gains a state and a date; the register keeps
explaining what it meant. Deleting an entry would strand every mark already in the field that
resolves to it, which is the failure the append-only rule exists to prevent.

**The register is the source of truth; the mark string is a projection.** No mark string is
authored by hand (`certification.md` §3). A short form — `SIGNET Certified: Full` — is licensed
only alongside a resolvable link to the entry below that produced it, so an empty register means
no short form is licensable today.

**Issuance is mechanical, not discretionary.** An entry is written on a reproduced passing
report and nothing else (`certification.md` §2, CN-1). There is no committee judgement,
interview, or gate at any step, and no Standards Committee is constituted to exercise one:
until one is, issuance is governed by the published process under the bootstrap clause in
[`governance/README.md`](../governance/README.md).

**Failed attempts are not recorded here.** An implementation that tries, fails, fixes and
retries is behaviour worth encouraging (`certification.md` §3.1). Absence from this register is
therefore not evidence that a named party failed; it is evidence only that no certification is
in force for them.

## 2. What an entry records

Every entry carries these fields, per [`certification.md`](certification.md) §3.1:

| Field | Meaning |
|-------|---------|
| **Entry** | `C<n>`, assigned in issuance order and never reused |
| **Implementer** | The legal entity certified. Not a person, and not an employer of a registered individual |
| **Level** | `Core` or `Full`, as decided by the public suite ([`levels.md`](levels.md) §2) |
| **Endorsements** | Any endorsements held, in [endorsement register](../governance/endorsement-register.md) order — never alphabetical |
| **CDM version** | The CDM version the report was produced against |
| **Suite version** | The conformance suite version the report was produced against |
| **Endorsement register version** | The version of the endorsement register **in force at issuance** |
| **Profile** | Any profile assessed alongside the level (e.g. `auction-platform`), or `—` |
| **Date** | Date of issue, ISO 8601 |
| **Report hash** | SHA-256 of the reproduced report conforming to [`report-schema.json`](report-schema.json) |
| **State** | `active`, `superseded`, `lapsed`, or `withdrawn`, with the date of any change |

**The endorsement register version is not optional.** That register is append-only, so without
this field every certification issued before a later admission would appear deficient against a
register that grew after the fact — an unfairness created automatically by append-only design
unless entries are dated against it (`certification.md` §3.1,
[endorsement register](../governance/endorsement-register.md) §1).

## 3. Entries

**None.** No certification has been issued.

| # | Implementer | Level | Endorsements | CDM | Suite | Endorsement reg. | Profile | Date | Report hash | State |
|---|---|---|---|---|---|---|---|---|---|---|
| — | *(no entries)* | — | — | — | — | — | — | — | — | — |

The table is retained empty rather than omitted, so that the shape of an entry is readable
before there is one to read, and so the first issuance is a row added to an existing structure
rather than a structure invented at the moment it is first needed.

## 4. What this register does not establish

A certification recorded here asserts that, against a stated CDM and suite version, the
implementation produced a passing report from the public, machine-runnable suite, and that
Concert reproduced it. It asserts nothing more. It is not a security audit and not a guarantee
of fitness, and it does not assert that every MUST in the specification was met — only the
requirements in [`levels.md`](levels.md) §2, which the suite decides. Two governance properties
are modelled but untested at any level; [`levels.md`](levels.md) §5 says which and why. **A
`Full` entry is not evidence that human oversight was enforced.**

**Anyone may say they implement SIGNET.** The artifacts are CC0, so *"Implements SIGNET CDM
v0.1"* and *"Self-assessed against the SIGNET conformance suite v0.1 — Core"* need no
permission and no entry here. What requires a licence, and therefore an entry, is the assertion
that Concert assessed you.

## 5. Change log

| Register version | Change |
|------------------|--------|
| v0.1 | Register established, empty. Created because `certification.md` §2 step 4 and §3.1 had specified a public registry since they were written and no artifact existed for a mark to resolve to (D-44). No entry was added, and none was backdated. |
