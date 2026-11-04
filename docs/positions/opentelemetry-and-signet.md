---
title: OpenTelemetry and SIGNET
kind: position
status: proposal
relatesTo: v0.17.3
claims:
  modelled: none
  tested: none
  certified: none
date: 2026-11-04
supersedes: none
---

# OpenTelemetry and SIGNET

**A positioning paper from Concert Foundation** · status: proposal · relates to SIGNET v0.17.3

## Summary

OpenTelemetry is the open standard for observing distributed software: a wire protocol, a set of propagation formats, a governed vocabulary of attribute names, and a reference architecture in which a neutral project defines the format and competing vendors run the backends. It has become the default way a request is followed across the services that handle it.

A procurement is a distributed transaction. A need raised in one system becomes a sourcing event in a second, submissions arrive from a third, an award is approved in a fourth, and the contract, order and invoice may each live somewhere else again. Increasingly some of those hops are taken by software agents acting under mandate. SIGNET records what happened at each hop as hash-chained Events. It says nothing about how a participant *observes* the transaction while it is running, or how a transaction that crosses several operators is reassembled afterwards into one picture.

This paper takes five ideas from OpenTelemetry and asks where each lands in SIGNET: trace context, baggage, semantic conventions, resource identity, and the collector architecture with its governance. The answer in each case is that the idea transfers, and that it transfers on one condition. SIGNET Events are the evidentiary record, normative and tamper-evident. Telemetry is operational, sampled and best-effort. The two must never be confused, and nothing in the record may come to depend on the telemetry. Observed that way, OpenTelemetry gives SIGNET a correlation key across the Buy chain, a transport for mandate and policy references between systems, a machine-checked vocabulary generated from the schemas, and a way for a certified implementation to identify itself in every signal it emits.

The paper proposes one non-core extension and four small companions, all held until the Standards Committee is constituted. Nothing described here is modelled, tested or certified in SIGNET v0.17.3.

## 1. Two kinds of record

SIGNET's unit of record is the Event: an append-only statement that a material change happened to a subject, made by an actor, at a time, with provenance, and chained to the subject's previous Event by hash (`schema/event.schema.json`). The chain is what makes a SIGNET history tamper-evident, and the Agent and Trust layer, Mandate, Decision, Policy and Consent, records the authority under which each change was made. An Event is written once and kept. It is the thing an auditor reads.

OpenTelemetry's unit of record is the span: a statement that an operation ran, from a start time to an end time, as part of a trace, under a parent span, with attributes. Spans are emitted continuously, sampled under load, exported to whatever backend the operator runs, and retained for as long as that backend keeps them. A span is the thing an engineer reads at three in the morning.

These are different records of the same transaction, made for different readers, with different guarantees. The evidentiary record must be complete, ordered and verifiable; the operational record must be cheap, timely and queryable. A standard that tried to make one do the other's job would get both wrong. The whole of this paper rests on keeping them apart, and §4 states the boundary as a rule.

What the two share is a transaction. If the record and the observation of a procurement carry one common identifier, each can be used to find the other, and that is the first and most valuable thing OpenTelemetry has to offer.

## 2. OpenTelemetry in brief

OpenTelemetry is a project of the Cloud Native Computing Foundation, formed in 2019 by merging two earlier tracing efforts. Its parts, as they bear on this paper:

- **Signals.** Traces, metrics and logs, with profiles in development. This paper is about traces, and about the context that travels with them.
- **Context propagation.** How a trace crosses a process boundary. The formats are W3C work rather than OpenTelemetry's own: *Trace Context* (Level 1 a W3C Recommendation; Level 2, which adds guidance on identifier generation and a random-trace-id flag, a Candidate Recommendation) defines the `traceparent` header carrying a 16-byte trace identifier, an 8-byte parent span identifier and flags; *Baggage*, also a Candidate Recommendation, defines a companion header carrying arbitrary key-value pairs that every hop forwards unchanged.
- **Semantic conventions.** A governed vocabulary of attribute names, `http.request.method`, `service.name`, `gen_ai.agent.name`, each with a type, a description and a stability level from Development through to Stable. The conventions are written as YAML in a *semantic convention registry*, and the project's own tool, Weaver, checks a registry, resolves it, generates documentation and code from it, enforces custom policies written in Rego, and can check a live telemetry stream against it. The conventions for generative AI, which define operations such as `create_agent`, `invoke_agent` and `execute_tool` and attributes such as `gen_ai.agent.id` and `gen_ai.tool.name`, moved to a repository of their own in June 2026 and remain at Development stability.
- **Resource.** The entity producing telemetry describes itself once, by attributes such as `service.name` and `service.version`, and that description attaches to every signal it emits.
- **OTLP and the Collector.** A single wire protocol, and a vendor-neutral process that receives, transforms and forwards telemetry to any backend. The project defines the protocol and the conventions; vendors compete on what they do with the data.
- **Governance.** A Governance Committee, a Technical Committee, special interest groups per area, and OpenTelemetry Enhancement Proposals, which now live in the specification repository, as the change-proposal mechanism. Stability is declared per convention and per specification section rather than for the project as a whole.

Two of these are directly familiar. A registry whose rules are machine-checked and from which documentation is generated is SIGNET's principle that inventories are generated, not asserted, applied to a vocabulary. And a neutral body that defines the format while operators compete on the backend is the structure the Foundation already keeps between itself, the standard and any commercial operator.

## 3. Five ideas and where each lands

Each subsection states the OpenTelemetry idea, what SIGNET carries today, and the proposed landing. Every tree pointer was checked against the `v0.17.3` tree.

### 3.1 Trace context: one key across the Buy chain

**The idea.** A trace identifier is minted when a transaction begins and carried on every hop, so that everything that happened as part of that transaction can be found by one key, whichever service, process or organisation did it. Within the trace, each span names its parent, so the tree of causes is recoverable.

**What SIGNET carries.** SIGNET reconstructs a procurement by following references backwards: `Submission.sourcingEvent`, `Award.sourcingEvent`, `Contract.award`, `Order.contract`, `Invoice.contract` and `Invoice.order`. The chain has exactly one break, between `Need` and `SourcingEvent`, which `CP-Process-Spine` proposes to close with an optional `realisesNeed` reference. The Event chain is per subject: the adapter contract requires each Event to link to the subject's immediately preceding Event (`conformance/adapter/adapter-contract.md`), and `getEvents(subjectId)` returns one subject's stream. There is no identifier that names *the procurement* as a whole, and no field on Event that places it in a sequence other than its own subject's chain. Two open defects sit here. D-64 records that Event carries no ordinal and that `timestamp` is wall-clock only, so "earliest" is undecidable from the record. D-71 records that chain scope is defined two ways: per subject in the adapter contract, and as one interleaved stream across an Auction and its Bids in the auction runtime, so that the relative order of Events on different subjects is not recoverable from `previousEventHash` under the contract's reading.

**The landing.** A SIGNET trace identifier, minted when a Need is raised or a sourcing event is opened, and carried on every Event and every object that belongs to that procurement, gives the whole transaction one key without touching the reference chain. The reference chain says what each record derives from; the trace identifier says which transaction it belongs to. Both are wanted. A trace identifier also makes the cross-operator case tractable: when a buyer's system, a supplier's system and a marketplace each hold part of the record, each part carries the same key, and reassembly is a join rather than a reconciliation.

The paper is deliberately careful about D-64 and D-71. A span's parent identifier and timestamps do express the relation between an Auction and its Bids and the order in which they arrived, and the Committee designing a remedy for those defects should look at that shape. But a trace is sampled and best-effort, so it cannot *define* chain scope or ordering for the evidentiary record; those definitions belong in the core trust layer, as D-70 and D-71 already record. Trace context informs the design; it is not the design.

### 3.2 Baggage: authority context that rides along

**The idea.** Baggage is context that every hop forwards whether or not it understands it. It is how a value set at the edge of a system is available in its interior without each intermediate service having to be taught to pass it on.

**What SIGNET carries.** Authority is already first-class in the record. A Decision records `underMandate` and `policiesApplied`; a Mandate states `permittedCapabilities`, `constraints`, `approvalThresholds`, `scope` and `validity`; Consent records `grantor`, `grantee`, `resource`, `purpose`, `validity` and `revocable`; every Event's `provenance` carries `generatedBy` and may carry `usedPolicies`. What the standard does not say is how those references reach the system that writes the Decision. Today that is each implementation's problem, and in a chain of services the mandate under which a request was made is exactly the kind of value that gets lost two hops in.

**The landing.** A baggage profile naming the SIGNET identifiers that may be propagated as context, the trace identifier of §3.1, and the identifiers of the Mandate, the Policies and the Consent in force, so that an agent's authority arrives with the request rather than being looked up afterwards. This is the Agent and Trust layer expressed as propagation. Two constraints follow from the record's own rules. Baggage is a plaintext header that every intermediary can read, so it carries *identifiers only*, never the contents of a Mandate or Policy and never anything a person could be identified by, which is consistent with the identity extension's rule that hash-anchored records contain no personal data. And baggage is advisory: the Decision's `underMandate` as written in the record is the fact; the baggage that carried it there is not.

### 3.3 Semantic conventions: a vocabulary that is generated, not asserted

**The idea.** OpenTelemetry's lasting contribution is less the protocol than the discipline of a governed attribute vocabulary: every name has one meaning, one type, a stability level and a home, and tooling checks that what is emitted matches what is defined.

**What SIGNET carries.** The same discipline, differently expressed. Enumerated values are bound to closed codelists and the binding is checked in CI (`codelists/bindings.json`, `conformance/rules/check-codelist-binding.js`); the state model is a machine-checked rule; the public interface is a manifest. The repository's own JSON namespace rule is relevant here. Object schemas admit any property matching `prefix:fieldName` alongside `additionalProperties: false`; `signet:` and `concert:` are reserved and bare `x-` is forbidden, enforced by the harness rather than the schema pattern; a published extension ships a context fragment so that its prefixed fields expand to IRIs, while a private prefixed field is dropped at JSON-LD expansion (`wiki/Extensions.md`). There is also a pleasing symmetry in the choice of policy language: a SIGNET Policy carries an executable `expression` in a declared `expressionLanguage`, and the schema names rego as its first example; Weaver's registry policies are written in Rego.

**The landing.** A `signet.*` attribute namespace, defined as a Weaver semantic convention registry and *generated from the schemas and codelists* rather than written by hand: `signet.trace.id`, `signet.event.type` (bound to `eventType.csv`), `signet.subject.id`, `signet.mandate.id`, `signet.decision.type` (bound to `decisionType.csv`), `signet.policy.id`, `signet.consent.id`, `signet.sourcing_event.procedure` (bound to `procedure.csv`), and so on. The registry would be checked in CI with `weaver registry check`, and its documentation generated, so that the OpenTelemetry vocabulary and the SIGNET vocabulary cannot drift apart without a build failing. Where the generative-AI conventions define an `invoke_agent` or `execute_tool` span, a SIGNET-aware agent would attach `signet.mandate.id` and `signet.decision.id` to it, which is how an observability backend comes to show not just that an agent acted but under what authority. Because those conventions are at Development stability, the registry would reference them without depending on them.

The two namespaces, `signet:` in JSON and `signet.` in telemetry, are different syntaxes for one governed vocabulary. The reservation of `signet:` in the schema rule is what makes it possible for the Foundation to be the single source of both.

### 3.4 Resource: the implementation identifies itself

**The idea.** The thing emitting telemetry says what it is, once, and that description travels with every signal.

**What SIGNET carries.** An adopters register (`registry/adopters.json`, with `registry/adopter-entry.schema.json` and `tools/check-adopters.js`), a certification register (`conformance/certification-register.md`), and a mark grammar (`governance/mark-grammar.md`) that permits `SIGNET Certified` only as a hyperlinked badge resolving directly to a registry entry, never as text, because a claim that travels without its qualification becomes a claim about something else.

**The landing.** Resource attributes by which a SIGNET implementation identifies itself in its telemetry: `signet.model.version`, the model version it emits against, and `signet.registry.entry`, the URL of its entry in the Foundation's register. The second is the mark grammar's rule carried into the signal: the attribute is a pointer to the entry, not an assertion of status, so anyone reading the telemetry can resolve what was assessed, against which profile, at which version, from the register itself. No attribute carries the words "certified", "conformant" or any assessment-shaped claim.

### 3.5 The collector, and the firewall

**The idea.** The project defines the protocol and the vocabulary. Anyone may run a collector; anyone may build a backend; no backend is the project's. Governance is by enhancement proposals, per-area working groups and declared stability.

**What SIGNET carries.** The same separation, by design: the Foundation stewards the standard and holds no preferential relationship with any operator; conformance is assessed by a public harness against a public suite; the standard specifies data and deliberately not transport, so that any operator can serve conformant records over any interface. Changes proceed by registered change proposals, each with a problem statement, declined alternatives and gates; every normative rule is machine-enforced; and the Foundation keeps three statements apart, modelled, tested and certified, as OpenTelemetry keeps Development, Release Candidate and Stable apart.

**The landing.** Nothing to land, and that is the point of this subsection. SIGNET's telemetry story needs no Foundation-operated collector, backend or dashboard, and must not acquire one. The Foundation defines `signet.*`; operators and implementers emit it and keep it. The one governance borrowing worth making explicit is stability per convention: the registry of §3.3 would carry a stability level on every attribute, so that an implementer can tell which names are settled before building on them, as they already can for a schema from its version and for a claim from its triad.

## 4. The boundary rule

The proposals in §5 are safe only if one rule holds throughout. It is stated here so that it can be cited.

1. **The Event chain is the record. Telemetry is an observation of it.** No conformance level, endorsement or certification may depend on telemetry being emitted, received or retained. An implementation that emits no telemetry at all is exactly as conformant as one that emits it fully.
2. **Nothing in the record may depend on telemetry.** The event hash, the chain, the state model and the trust layer are defined without reference to any trace, span or attribute. A trace identifier carried on an Event is a field like any other field: it is hashed with the Event, and the chain does not care what it contains.
3. **Telemetry carries identifiers, never contents, and never personal data.** Baggage and span attributes reference Mandates, Policies, Consents and Events by identifier. The record is where the contents live and where access to them is governed.
4. **Sampling is legitimate for telemetry and illegitimate for the record.** A trace may be dropped under load. An Event may not.
5. **Correlation runs both ways and asserts nothing.** Finding the Events for a trace, or the trace for an Event, is a lookup. Neither establishes that the other is complete or true.

## 5. Proposed work

None of the following is registered, modelled, tested or certified. Under the standing rule in `governance/WITHDRAWAL-2026-08.md`, no further change proposals are registered until the Standards Committee is constituted, and the pre-constitution window opened by IAR-0006 expired on 30 September 2026. Each item is held as a position until registration reopens, and would then proceed spec-first.

**P-1. Observability extension.** An extension package, in the sense of `docs/extensions/README.md`, with id `observability`, defining: the SIGNET trace identifier and its generation (the W3C 16-byte random form, so that it is also a valid `traceparent` trace-id); the property on Event and on each root object that carries it; the parent relation, if any, that an Event may carry within a trace; and the context fragment that maps the extension's prefix so its fields survive JSON-LD expansion. It adds fields under its own namespace and alters no core object's `required` set or `additionalProperties` semantics. It is an extension and not a profile because a counterparty must interpret the trace identifier to make use of it. Whether the trace identifier should instead be promoted into core as a field on Event, beside `subject` and `actor`, is for the Committee; the paper's position is that it should start as an extension so that the boundary rule in §4 is visible in the tree.

**P-2. Semantic convention registry.** A Weaver registry under the conformance tree defining the `signet.*` namespace of §3.3, with the codelist-bound attributes generated from `codelists/` by a tool in `tools/` on the same principle as the existing inventory, a `weaver registry check` step in `validate.yml`, and generated documentation published through `public-interface.json`. The registry carries a stability level per attribute, all at Development until the Committee says otherwise.

**P-3. Baggage profile.** A short normative section, inside P-1, naming which identifiers may be propagated as W3C Baggage, under which keys, and stating the identifiers-only and no-personal-data rules of §3.2.

**P-4. Resource conventions.** Within P-2, the two resource attributes of §3.4, with the registry-pointer rule stated so that the mark grammar's prohibition on assessment-shaped claims carries into telemetry.

**P-5. Reference emission in the demonstrations.** Once P-1 and P-2 exist, the agent, onboarding and auction demonstrations (`agent/run-agent.js`, `onboarding/run-onboarding.js`, `auction/run-auction.js`) would emit `signet.*` spans alongside their Events, checked against the registry with `weaver registry live-check` in CI. This is the smallest proof that the vocabulary and the record agree, and it is also the first place an implementer would look.

P-1 and P-2 are the substantive items and can be designed together. P-3 and P-4 are sections inside them. P-5 follows. The Committee's remedies for D-64 and D-71 should be designed with P-1 in view, as §3.1 explains, but P-1 does not wait on them.

## 6. What this paper does not claim

- It does not claim that SIGNET is, or will be, an observability standard, or that OpenTelemetry is a procurement standard. Each does one thing; this paper is about the seam between them.
- It does not claim that any OpenTelemetry body has reviewed or endorsed this paper, or that a `signet.*` namespace has been proposed to or accepted by the OpenTelemetry semantic conventions. The namespace would be the Foundation's own registry, which OpenTelemetry's tooling is designed to accommodate. A proposal upstream, if ever made, would be a separate step with its own record.
- It does not claim any of the proposed work exists. In v0.17.3 there is no trace identifier, no observability extension, no semantic convention registry, no baggage profile, no resource convention and no telemetry emitted by any demonstration. No tracked file names OpenTelemetry, Trace Context or Baggage.
- It does not propose a change to the event hash, the chain, the state model or any core object. It records that D-64, D-70 and D-71 are open and that their remedies are the Committee's.
- It does not claim that correlation between a trace and the record establishes anything about either. See §4.

## 7. Declined alternatives

- **Make trace context a core field on Event now.** Declined for this edition. It may be the right end state, and the paper says so in P-1. Starting as an extension keeps the boundary rule visible and avoids a normative change while registration is closed.
- **Let the trace define chain scope, resolving D-71 by borrowing the span tree.** Declined. A sampled, best-effort structure cannot define a property of the evidentiary record. The span tree is a design input for the Committee's remedy, not the remedy.
- **Carry Mandate or Policy contents in baggage, so that a downstream service need not look them up.** Declined. Baggage is plaintext and forwarded by every intermediary; contents belong in the governed record. Identifiers only.
- **Put the trace identifier in `Event.payload`.** Declined. `payload` is the content of the change; a correlation key is not part of what changed, and burying it there would make it invisible to a schema-driven reader.
- **Express the trace identifier as a SIGNET `Identifier` with a new scheme.** Declined for now. `Identifier` is scheme-qualified and the scheme list is deferred under D-20, so adding a scheme would entangle the proposal with an open core question. A plain hex string under the extension's own property is simpler and matches the W3C form.
- **Reserve an `otel:` JSON prefix.** Declined. The reserved prefixes are the Foundation's own; the extension should use a prefix the Foundation governs, and the OpenTelemetry side of the vocabulary uses OpenTelemetry's own dotted form.
- **Hand-write the semantic conventions as Markdown.** Declined. Inventories are generated, not asserted. A registry that is not checked in CI would drift from the codelists within a release.
- **Specify a Foundation collector, exporter or dashboard.** Declined. It would breach the firewall between the steward and the operators, and it is outside what a data standard should specify.
- **Treat metrics and logs in this paper.** Deferred. Metrics over SIGNET Events (time from `sourcingEvent.published` to `award.decided`, for instance) are a natural second paper once the trace identifier exists to group by.

## Appendix A. Illustration (not validated, not in any schema)

An Event carrying a trace identifier under an extension prefix, and the span an implementation might emit for the same action. The prefix, the attribute names and the span shape are illustrative; P-1 and P-2 would fix them.

```json
{
  "@context": "https://concert.foundation/signet/v0.1/context.jsonld",
  "type": "Event",
  "id": { "scheme": "did", "id": "did:example:evt-0042" },
  "eventType": "award.decided",
  "subject": { "scheme": "did", "id": "did:example:award-0009" },
  "actor": { "scheme": "did", "id": "did:example:agent-sourcing-01" },
  "timestamp": "2026-11-04T10:15:00Z",
  "previousEventHash": "sha256:…",
  "provenance": {
    "generatedBy": { "scheme": "did", "id": "did:example:agent-sourcing-01" },
    "generatedAt": "2026-11-04T10:15:00Z",
    "usedPolicies": [ { "scheme": "did", "id": "did:example:policy-threshold-02" } ]
  },
  "observability:traceId": "4bf92f3577b34da6a3ce929d0e0e4736"
}
```

```text
span      invoke_agent sourcing-agent
trace_id  4bf92f3577b34da6a3ce929d0e0e4736
resource  service.name=sourcing-agent
          signet.model.version=0.17.3
          signet.registry.entry=https://concert.foundation/…/entry
attrs     gen_ai.agent.id=did:example:agent-sourcing-01
          signet.mandate.id=did:example:mandate-0003
          signet.decision.id=did:example:decision-0017
          signet.event.id=did:example:evt-0042
```

The Event is the record. The span is how someone found it.

## References

- OpenTelemetry. *OpenTelemetry Specification*, including the `oteps/` directory of enhancement proposals. https://github.com/open-telemetry/opentelemetry-specification
- OpenTelemetry. *Semantic Conventions*. https://github.com/open-telemetry/semantic-conventions
- OpenTelemetry. *Semantic Conventions for Generative AI* (separate repository from June 2026; Development stability). https://github.com/open-telemetry/semantic-conventions-genai
- OpenTelemetry. *Weaver*. https://github.com/open-telemetry/weaver
- W3C. *Trace Context*, Level 1 (W3C Recommendation) and Level 2 (Candidate Recommendation Draft, March 2024). https://www.w3.org/TR/trace-context/ and https://www.w3.org/TR/trace-context-2/
- W3C. *Propagation format for distributed context: Baggage* (Candidate Recommendation Draft, May 2024). https://www.w3.org/TR/baggage/
- W3C. *Distributed Tracing Working Group Charter*, August 2025. https://www.w3.org/2025/08/distributed-tracing-wg.html
- Concert Foundation. *SIGNET specification*, v0.17.3. https://concert.foundation/standard
- Concert Foundation. `schema/event.schema.json`, `schema/definitions.schema.json`, `codelists/bindings.json`, `conformance/adapter/adapter-contract.md`, `docs/extensions/README.md`, `docs/extensions/identity.md`, `governance/defects.md` (D-20, D-64, D-70, D-71), `governance/proposals/CP-Process-Spine.md`, `governance/proposals/CP-Auction-Determinism.md`, `governance/mark-grammar.md`, `wiki/Extensions.md`, in `concerthq/signet-standard` at `v0.17.3`.
- Concert Foundation. *AI-ready data and SIGNET*. Positioning paper, October 2026. https://concert.foundation/standard/positions/ai-ready-data-and-signet
