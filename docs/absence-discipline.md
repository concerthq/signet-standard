# Absence discipline for negative conformance fixtures

**Status:** Working Draft · **Applies to:** `conformance/suite/` and any implementer fixture set
**Contributed by:** a deploying implementer, from a measured legacy estate. Published de-named
as evidence; it is not a `basis` for any core entry.

---

## The failure

A negative fixture proves a rule fires when its inputs are **wrong**. It does not prove the rule
fires when its inputs are **missing**, and those are different failures with different outcomes.

Three states are commonly collapsed into one:

| State | Example | What a rule engine typically does |
|---|---|---|
| **empty** | `{"credentials": []}` | evaluates; rule fires |
| **null** | `{"credentials": null}` | evaluates; behaviour depends on the language |
| **absent** | `{}` | operand undefined → rule body undefined → **rule does not fire** |

Only the third fails open. An undefined operand yields an undefined rule body, the rule silently
does not fire, and the artefact recording the control looks identical either way — the policy is
cited, the provenance is present, the chain verifies, and nothing was enforced.

This is the same shape as the cite-versus-enforce hazard in `conformance/levels.md`, reached by a
different route.

## The measurement

In a live procurement estate of 68 policy gates: **58 admitted what they existed to catch when an
input was absent rather than empty**, across 259 specific references. **35 were inconsistent
within a single file** — the same operand guarded in one rule and unguarded in the next.

That is not a tail case. It was the majority behaviour of a policy estate that had passed every
other check applied to it.

## The requirement

**A-1.** Every negative fixture MUST have an **absence twin**: if a rule can be defeated by
omitting a field, a fixture must omit that field.

**A-2.** A fixture set that tests emptiness without testing absence does not demonstrate the
control it claims to demonstrate, and MUST NOT be cited as evidence that the control holds.

**A-3.** Where a rule's operand may legitimately be absent, the rule declares its absence
behaviour explicitly. A rule that does not declare it is read as failing open, and is a defect.

## Why this belongs in the suite rather than in guidance

The distinction between *modelled*, *tested* and *certified* is load-bearing throughout SIGNET.
A conformance suite that tests only the empty case certifies against a strictly weaker claim than
the one the requirement states — and does so invisibly, because the passing report is identical.

Absence testing is the cheapest available way to keep the *tested* claim honest.
