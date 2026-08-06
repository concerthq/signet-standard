# Concepts of Open Commerce

**Open commerce** is the set of primitives required for buyers, suppliers, and their agents
to transact across organisational boundaries under **shared governance, decentralised
identity, and cryptographic trust** — independent of any single standard or platform.

This page defines those primitives. They stand on their own: you can read, cite, and reason
about them without adopting SIGNET. **SIGNET is the reference realisation** of open commerce —
the [Canonical Data Model](Architecture-Overview) is what these concepts look like when made
concrete, validated, and machine-checkable — but the concepts are the more durable thing.
Where a primitive is realised in the CDM, this page points to it; the pointer is an
illustration, not a dependency.

> This page is *non-normative*. It frames the model; it does not define it. The normative
> artifacts are the [JSON Schema](Validation-and-Conformance) (the source of truth), then the
> prose specification, then the rest of this wiki.

## Why a concept vocabulary exists

A standard defines a format. A *concept vocabulary* defines what the format is for — the
shared terms in which a whole category reasons about itself. Open commerce needs the second
because its hard problems are not format problems: they are questions of **authority**
(what may an agent do?), **accountability** (who decided, and can they show their working?),
and **auditability** (can the history be trusted without trusting the holder of the history?).
No existing procurement standard answers these, because they were designed for documents
exchanged between people, not decisions taken by agents.

Defining this vocabulary raises a fair question: *who appointed the definer?* The answer is
the same governance firewall that governs certification. The concepts are stewarded by
[Concert Foundation](https://concert.foundation) as a **neutral body that holds no
proprietary claim** over them. Defining the vocabulary is not the same as controlling its
implementations:

- The concepts and the CDM that realises them are dedicated to the **public domain**
  ([CC0 1.0](https://github.com/concerthq/signet-standard/blob/main/LICENSE)) — anyone may
  implement them, anywhere, with no attribution burden and no permission sought.
- Conformance is certified on **identical terms for every implementer**, by a public,
  machine-runnable suite (neutrality rules
  [CN-1…CN-4](Conformance-Harness#certification-neutrality-rules-cn)). No subjective gate, no
  private suite, no preferential path.
- **No commercial operator — including Score Networks — holds a privileged definition** of
  any concept on this page, an early-access route to the spec, or a relaxed conformance bar.

A vocabulary that anyone may implement and that certifies everyone identically is *open* in
the way that matters: stewardship without ownership. That distinction is the whole of the
position — see [Governance & Versioning](Governance-and-Versioning).

## The nine primitives

Open commerce is built from nine concepts that fall into three groups. One describes the
**network as a whole** (governed network). Four describe what makes an agent's participation
**governed** (accountable agent, bounded authority, decision-as-record, policy-as-data). Two
are **network-formation** primitives — how parties come to transact at all (discovery, and
consent over their data). And two are **lifecycle** primitives — how a transaction is closed
and how its history stays trustworthy (settlement, event-sourced trust). Each is defined
standard-agnostically, then mapped to its SIGNET realisation.

### 1. Governed network

> A commerce network is **governed** — rather than merely automated — when authority,
> accountability, and auditability are **structural** properties of the network, not
> procedures bolted onto it.

Automation makes a network *fast*. Governance makes it *answerable*. The distinction is
whether, for any action the network took, you can mechanically establish what authority
permitted it, who is accountable for it, and whether the record of it has been tampered with.
If those answers live in process documentation and human attestation, the network is
automated. If they live in the data the network already produces, it is governed.

→ *Realised in SIGNET as* the four-layer [Canonical Data Model](Architecture-Overview):
Foundation, Process, [Agent](Agent-Layer), and [Trust](Trust-Layer). The Agent and Trust
layers are what make a SIGNET network governed rather than only interoperable.

### 2. Accountable agent

> A synthetic agent is a **first-class party** whose every material action records *who*
> acted, *under what authority*, *from what inputs*, and *why*.

The defining concept of open commerce, and the one no existing procurement standard carries.
Conventional automation treats an agent as invisible machinery behind a human's identity.
Open commerce treats the agent as a named participant that can be held to account on the same
footing as a person or an organisation — with the same standing to act and the same duty to
explain. Accountability is not a property the agent *has*; it is a property of the **record
its actions produce**.

→ *Realised in SIGNET as* the [SyntheticAgent](Agent-Layer#syntheticagent) (a
[Party](Foundation-Layer#party) with `partyType: agent`, whose `operatedBy` field names the
party accountable for it) and the [Decision](Agent-Layer#decision) record its actions emit.

### 3. Bounded authority

> Authority is **data**: an explicit, machine-checkable statement of what an agent may do,
> within what limits, and above which a human must approve.

An agent without bounded authority is either a liability or a toy. The concept that resolves
this is the **mandate** — a declaration, readable by both the agent and an auditor, that
enumerates the agent's permitted capabilities, the hard constraints it must respect, and the
thresholds above which autonomy yields to human approval. An agent acting outside its mandate
is, *by construction*, non-conforming — not because a rule was broken after the fact, but
because the authority to act was never present. Bounded authority is what lets agent autonomy
and human oversight coexist instead of trading off.

The concept is one thing; certifying it is another. Today the model **represents** the bound and
the record **shows** whether it held — but no conformance level tests that a certified
implementation refused to exceed it. Closing that distance is what the proposed `E-MDT`
endorsement is for, and the honest form of this claim until it carries is *bounded authority is
expressed and auditable*, not *bounded authority is enforced everywhere*.

→ *Realised in SIGNET as* the [Mandate](Agent-Layer#mandate): `permittedCapabilities`, hard
`constraints`, and `approvalThresholds` that force human-in-the-loop above a ceiling. The
[agent demonstration](Agent-Layer) shows it running — a €12M award bounded by a €10M
autonomous ceiling requires human approval before it can proceed.

### 4. Decision as record

> A decision is an **artefact**, not a log line — a single object recording *what* was
> decided, *by whom*, *under which mandate*, *from which inputs*, *under which policy*, with
> *what rationale*, and *with what human approval*.

The difference between a system that *did* something and a system that can *account* for what
it did is the decision record. An event log says a thing happened; a decision record says why
it was permitted, what evidence it rested on, which rule governed it, and who — human or
synthetic — stands behind it. This is the backbone of accountability, and it is precisely the
artefact that regulation increasingly demands of automated and AI-assisted decisions. The
record is the same whether a human or an agent decided; that symmetry is the point.

→ *Realised in SIGNET as* the [Decision](Agent-Layer#decision) object — see the
[worked award decision](Worked-Examples#decision-award).

### 5. Policy as data

> The rule a human reads is the **same** rule the agent executes. A policy carries both an
> executable form and a human-readable form of the *identical* rule, and both are mandatory.

When the rule an agent enforces is code, and the rule an auditor reviews is prose, the two
drift — and the drift is invisible until it causes harm. Open commerce closes the gap by
making policy a dual-form artefact: the executable expression and the plain-language statement
are two faces of one object, versioned and governed together. "Rules as code" becomes
auditable rather than opaque. The eligibility threshold, the evaluation weighting, the
approval routing, and the agent's own constraints are all this kind of object.

→ *Realised in SIGNET as* the [Policy](Agent-Layer#policy) object, whose `expression`
(e.g. Rego) and `humanReadable` statement are both **required** — see the
[worked evaluation policy](Worked-Examples#policy).

### 6. Consent as data

> The **right to access** data is separable from the **assertion that the data exists**.
> Access is a granted, bounded, revocable artefact — not an assumption.

Open commerce does not assume a central warehouse that holds everyone's data and adjudicates
who may see it. Instead, the *existence* of a document and the *right to read* it are
different facts: a record can assert "this evidence exists" while the data itself stays with
its owner, released only under an explicit grant to a named party, for a stated purpose, for a
bounded time. Data sovereignty becomes a property of the model rather than a policy promise.

→ *Realised in SIGNET as* the [Consent](Trust-Layer#consent) grant and the
[Document.accessGrant](Foundation-Layer#document) field that points to it (the Solid consent
pattern, design principle 1.5).

### 7. Discovery

> An agent can **find a counterparty and verify what it claims to be able to do** across an
> organisational boundary, without a central registry — capability is *advertised*, and the
> advertisement is *checkable*.

The previous primitives describe how a governed transaction works once the parties are already
in a room together. Discovery is how they get into the room. In a network with no central
broker, an agent must be able to locate who to transact with, learn what another agent or
organisation can do, and verify those claims against evidence rather than taking them on
faith — all without asking a registry's permission. Two things make this open rather than
closed: capability is **advertised at a resolvable, self-hosted location** the party controls
(no gatekeeper owns the directory), and an advertised capability or attribute is
**verifiable** — a claim of "ISO 27001 certified" or "can evaluate submissions" can be checked
against a credential or a declared interface, not merely asserted. Discovery without
verification is a phone book; discovery *with* it is the basis of trust between strangers.

→ *Realised in SIGNET as* the [AgentCapability](Agent-Layer#agentcapability) model (declared,
discoverable capabilities aligned to the [A2A Agent Card](Glossary#a2a)), advertised at the
agent's self-hosted `agentCard` location (`/.well-known/agent.json`), with claims about a
party verified through [Credentials](Foundation-Layer#credential) — optionally via selective
disclosure, so a capability can be proven without exposing the whole certificate. The
[Catalogue](Process-Layer#catalogue) is the analogous advertisement for goods and services
rather than agent capability.

### 8. Event-sourced trust

> The current state of any object is the **projection of an append-only, hash-chained event
> stream**. The audit trail *is* the system of record; tampering is evident rather than
> prevented by trust.

A mutable database asks you to trust whoever holds it. Open commerce replaces that ask with a
structural guarantee: every material change is an immutable event, each event hash-chained to
its predecessor, so that altering any point in the history breaks the chain and is detectable
by anyone. State is *derived* by replaying the stream, which means the history cannot quietly
disagree with the present. Audit stops being something you *conduct* and becomes something the
network simply *is*.

→ *Realised in SIGNET as* the [Event](Trust-Layer#event) (append-only, `previousEventHash`
chained) and the [Provenance](Trust-Layer#provenance) embedded in every Event and Decision
(design principle 1.7).

### 9. Settlement

> Commerce is the **making and discharging of commitments**. A commitment, once made, has a
> lifecycle the network tracks to fulfilment — with evidence — and the loop is closed
> explicitly, not assumed.

A transaction is not finished when it is agreed; it is finished when what was promised has been
delivered, evidenced, and accounted for. Open commerce treats this as a first-class concern:
every obligation arising from an agreement has a state the network can observe — outstanding,
met, breached, or waived — and reaching the "met" state is backed by *evidence*, not by a
party's say-so. This is the primitive that distinguishes a network that records *intentions*
from one that records *outcomes*. It also closes the accounting loop: the invoice that demands
payment, and the structured record that the demand was satisfied, are the final discharge of
the commitments the rest of the model set up. Settlement is where governance is *vindicated* —
the point at which the network can show not only that a decision was authorised and accountable,
but that the thing decided actually happened.

→ *Realised in SIGNET as* the [Obligation](Process-Layer#obligation) object (a deliverable or
milestone with a `status` of `pending`/`met`/`breached`/`waived` and `evidence` of fulfilment),
embedded in the [Contract](Process-Layer#contract), and the EN 16931-aligned
[Invoice](Process-Layer#invoice) that closes the financial loop — itself convertible to
Peppol BIS Billing and natively ViDA-aligned (see
[EN 16931 & ViDA E-Invoicing](EN-16931-and-ViDA-E-Invoicing)). The loop is **closed
explicitly**, not assumed: `Obligation.dischargedBy` references the settling artefact, and
`Invoice.settles` references the obligation it discharges, so *"this obligation was discharged
by that invoice"* is a link you can mechanically traverse — not an inference. The transition
is recorded as an immutable `obligation.discharged` [Event](Trust-Layer#event), so discharge is
auditable, not merely declared. (`Invoice.settles` is SIGNET-original and is omitted on the
Peppol BIS projection, so closing the loop costs nothing in ViDA convertibility.)

## The two cross-cutting commitments

Two commitments run through all nine primitives and are what make this *open* commerce rather
than a well-designed platform.

**Profile-and-bridge, not fork.** Open commerce *adds* what existing standards lack —
governance, agency, trust — and maps **without loss** to and from what they already define.
It does not replace OCDS, EN 16931, UBL, or Peppol; it profiles them and fills their gaps, and
its original contributions stay cleanly separable so they never entangle the standards they
bridge. This is the anti-lock-in commitment: adopting open commerce never strands your data
inside it. → [Standards Mapping](Standards-Mapping).

**Vocabulary is public.** The concepts and the model that realises them are public-domain;
only the *marks* ("SIGNET", "Concert", "SIGNET Certified") are administered, and only so that
a conformance claim means something. You never need permission to *use* the vocabulary — only
to *claim certification* against it. → [Governance & Versioning](Governance-and-Versioning).

## Relationship to the standards landscape

Open commerce concepts sit deliberately **above** the established procurement standards, not
beside them. OCDS defines the lifecycle; EN 16931 defines invoicing semantics; UBL and Peppol
BIS define document syntax; the EU eProcurement Ontology defines cross-cutting semantics. Each
is authoritative in its layer — and each leaves governance, agency, and trust *open*. Open
commerce occupies that open space and bridges down into the others, which is why a SIGNET
document can always be projected to a conforming OCDS release or a Peppol BIS invoice, and why
the [Agent Layer](Agent-Layer) simply drops away when it does.

For the field-by-field crosswalk, see [Standards Mapping](Standards-Mapping). For how the
concepts support real regulatory obligations — UK Procurement Act 2023, EU ViDA, EU AI Act —
see the [Regulatory & Compliance Map](Compliance-Map).

## Where to go next

- [Introduction & Concepts](Introduction-and-Concepts) — what SIGNET is and the eight design
  principles that realise these primitives.
- [Architecture Overview](Architecture-Overview) — the four-layer model in detail.
- [Agent Layer](Agent-Layer) — primitives 2–5 made concrete.
- [Regulatory & Compliance Map](Compliance-Map) — the concepts mapped to the obligations
  adopters already carry.
