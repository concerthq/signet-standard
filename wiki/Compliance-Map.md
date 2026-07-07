# Regulatory & Compliance Map

This page maps the **regulatory obligations adopters already carry** to the SIGNET structures
that support meeting them. It is organised around the adopter's question — *"I must keep
assessment records / emit EN 16931 invoices / document AI-assisted decisions; what does SIGNET
give me?"* — rather than around SIGNET's architecture.

> **SIGNET provides structures that *support* compliance; it does not itself *confer*
> compliance.** Mapping a regulatory obligation to a SIGNET structure means the structure
> carries the data the obligation needs — not that using it discharges your legal duty.
> Whether your *content* satisfies a regulation, and how that regulation applies to your
> circumstances, remains your responsibility. SIGNET is not legal advice; this page is not a
> compliance certification. Consult your own advisers.

Why this mapping is credible rather than asserted: the EN 16931 projection is **proven
mechanically in CI on every commit** (conformance requirement F-MAP), and the decision and
policy structures are conformance-checked (F-SEM). This is compliance support you can *run*,
not just claim — see the [Conformance Harness](Conformance-Harness).

---

## UK Procurement Act 2023

The Act governs public procurement in England, Wales, and Northern Ireland. Among its duties
are keeping records of contracting decisions, publishing assessment summaries, observing a
standstill period before contracts are entered, and supporting the new competitive flexible
procedure.

**The obligation.** A contracting authority must be able to show *how* an award decision was
reached — the assessment of each bid against published criteria — and must observe a mandatory
standstill before entering the contract. The Act also introduces the **competitive flexible
procedure**, a bespoke multi-stage route that authorities design within the Act's rules.

**What SIGNET provides.** The [Decision](Agent-Layer#decision) record captures, as a single
auditable artefact, *what* was decided, *by whom* (human or synthetic), *under which mandate*,
*from which inputs* (the submissions considered), *under which policy* (the published
evaluation model), with *what rationale*, and *with what human approval*. The
[Evaluation](Process-Layer#evaluation) object records per-criterion
[Scores](Foundation-Layer#score) with rationale against the same published
[Policy](Agent-Layer#policy) the bidders saw. The `competitiveFlexible`
[procedure code](Codelists#procedure) models the Act's flexible procedure, and
[Award.standstillPeriod](Process-Layer#award) carries the standstill window. Because the award
is recorded as an immutable [Event](Trust-Layer#event), the decision history is tamper-evident.

**The limit of that support.** SIGNET structures the *record*; it does not determine whether
the *substance* of your assessment satisfies the Act, nor whether your published criteria, your
standstill duration, or your procedure design are lawful. Those remain your legal
determinations. The structure makes a compliant record *possible and auditable* — it does not
make an arbitrary record *compliant*.

---

## EU VAT in the Digital Age (ViDA)

ViDA is the EU package modernising VAT for digital trade. Its e-invoicing pillar mandates
structured, EN 16931-based electronic invoicing for cross-border B2B transactions, preceded by
national B2B e-invoicing mandates that several member states are already introducing.

**The obligation.** From **July 2030**, cross-border B2B invoices within the EU must be issued
as structured electronic invoices conforming to the **EN 16931** semantic model, with national
B2B mandates arriving sooner. A procurement network that cannot emit an EN 16931-conformant
invoice cannot participate.

**What SIGNET provides.** The [Invoice](Process-Layer#invoice) is mapped field-by-field to
**33 EN 16931 Business Terms and Groups** (BT-1…BT-158, BG-4/7/23/25), with each schema field
recording its BT/BG reference structurally. The repository ships a runnable transform that
projects a canonical SIGNET Invoice to **UBL 2.1 / Peppol BIS Billing 3.0** and a verifier that
reconciles the key Business Terms and the monetary totals — **both run in CI on every push**, so
convertibility is continuously proven, not asserted (conformance requirement F-MAP). See
[EN 16931 & ViDA E-Invoicing](EN-16931-and-ViDA-E-Invoicing).

**The limit of that support.** The shipped transform is a **faithful reference projection, not
a substitute for official Peppol validation.** Production use must additionally run the output
through the official Peppol / EN 16931 **XSD + Schematron** validation artefacts. SIGNET gives
you a structurally correct EN 16931 invoice and proves it survives projection to Peppol BIS; it
does not stand in for the official validation gate, your registration with an access point, or
your tax determinations.

---

## EU AI Act

The AI Act regulates AI systems placed on the EU market, with obligations scaled to risk. AI
used in evaluation and award decisions in procurement is a setting where its documentation,
record-keeping, and human-oversight expectations are most likely to bear.

> **The least-settled of the three regimes.** The AI Act's obligations are still being
> elaborated through implementing acts, standards, and guidance, and the classification of any
> given procurement-AI use is fact-specific. Treat this row as *directional* — SIGNET's
> structures are designed to support the documentation and oversight expectations as they
> stand, but the substantive duties that apply to **your** system are your determination.

**The obligation.** Where an AI system contributes to a consequential decision, the Act looks
for **record-keeping** sufficient to trace how the system operated, **human oversight**
appropriate to the risk, and **documentation** of the system's logic and the decisions it
informed.

**What SIGNET provides.** The [Decision](Agent-Layer#decision) record makes AI-assisted
decisions traceable by construction: it names the [SyntheticAgent](Agent-Layer#syntheticagent)
that decided, the [Mandate](Agent-Layer#mandate) it acted under, the inputs it considered, the
policies it applied, its rationale, and the human approval where one was required. The
Mandate's `approvalThresholds` make **human-in-the-loop oversight structural** — above a
defined ceiling the agent *cannot* act autonomously, as the [agent demonstration](Agent-Layer)
shows (a €12M award exceeding a €10M ceiling forces human approval). The dual-form
[Policy](Agent-Layer#policy) means the rule the agent executed is the same rule a human can
review, and [Provenance](Trust-Layer#provenance) records what produced each assertion.

**The limit of that support.** SIGNET supports the *documentation and oversight* expectations;
it does not classify your system's risk tier, perform a conformity assessment, or discharge the
substantive obligations that follow from classification. It gives you the evidentiary
substrate — a complete, tamper-evident record of how an AI-assisted decision was reached — on
which compliance can be built.

---

## Summary

> Every row below is **support, not certification.** SIGNET structures carry the data each
> obligation needs; meeting the obligation remains the implementer's responsibility. See the
> per-regime limits above.

| Regime | Obligation (in brief) | SIGNET structure | Read more |
|--------|----------------------|------------------|-----------|
| **UK Procurement Act 2023** | Assessment summary & decision record for awards | [Decision](Agent-Layer#decision), [Evaluation](Process-Layer#evaluation) + [Score](Foundation-Layer#score) | [Agent Layer](Agent-Layer) |
| **UK Procurement Act 2023** | Standstill before contract | [Award.standstillPeriod](Process-Layer#award) | [Process Layer](Process-Layer#award) |
| **UK Procurement Act 2023** | Competitive flexible procedure | `competitiveFlexible` [procedure code](Codelists#procedure) | [Codelists](Codelists#procedure) |
| **EU ViDA** | EN 16931 cross-border e-invoicing (from Jul 2030) | EN 16931-mapped [Invoice](Process-Layer#invoice) (33 BTs/BGs) | [EN 16931 & ViDA](EN-16931-and-ViDA-E-Invoicing) |
| **EU ViDA** | Convertible to Peppol BIS Billing | CI-proven UBL 2.1 / Peppol BIS projection (F-MAP) | [EN 16931 & ViDA](EN-16931-and-ViDA-E-Invoicing) |
| **EU AI Act** | Record-keeping for AI-assisted decisions | [Decision](Agent-Layer#decision) + [Provenance](Trust-Layer#provenance) | [Agent Layer](Agent-Layer#decision) |
| **EU AI Act** | Human oversight of AI decisions | [Mandate.approvalThresholds](Agent-Layer#mandate) | [Agent Layer](Agent-Layer#mandate) |
| **EU AI Act** | Reviewable decision logic | dual-form [Policy](Agent-Layer#policy) (`expression` + `humanReadable`) | [Agent Layer](Agent-Layer#policy) |

## Why the conformance harness matters here

These mappings are credible because the structures behind them are **mechanically verified**,
not merely described. The [conformance harness](Conformance-Harness) checks, on every commit,
that an EN 16931 Invoice projects to Peppol BIS with the key Business Terms and totals preserved
(**F-MAP**), and that [Policies](Agent-Layer#policy) carry both executable and human-readable
rules while [Decisions](Agent-Layer#decision) cite their inputs and policies (**F-SEM**). An
implementation that claims to support these obligations can be *tested* against the identical
public suite — the same neutrality that governs certification
([CN-1…CN-4](Conformance-Harness#certification-neutrality-rules-cn)) governs the evidence
behind this page.

## Where to go next

- [Standards Mapping](Standards-Mapping) — the field-by-field technical crosswalk to OCDS,
  EN 16931, UBL/Peppol, VC/DID, and ePO.
- [EN 16931 & ViDA E-Invoicing](EN-16931-and-ViDA-E-Invoicing) — the runnable, CI-verified
  invoicing pipeline.
- [Agent Layer → Decision](Agent-Layer#decision) — the accountability record at the centre of
  the Procurement Act and AI Act rows.
- [Conformance Harness](Conformance-Harness) — how the evidence behind this page is proven.
