# Glossary

Short definitions of the terms and acronyms used across SIGNET and this wiki.

### A2A
**Agent-to-Agent / Agent Card.** A model for advertising an agent's capabilities at a
well-known location (`/.well-known/agent.json`) so they are discoverable across
organisational boundaries. SIGNET's [AgentCapability](Agent-Layer#agentcapability) and
[SyntheticAgent.agentCard](Agent-Layer#syntheticagent) align to it.

### CDM
**Canonical Data Model.** SIGNET's central normative artifact — the shared four-layer
vocabulary (Foundation, Process, Agent, Trust). See [Architecture Overview](Architecture-Overview).

### CC0 1.0
A **public-domain dedication.** The SIGNET artifacts are released under
[CC0 1.0](https://github.com/concerthq/signet-standard/blob/main/LICENSE); it covers
copyright in the artifacts only, not the marks.

### CLA
**Contributor Licence Agreement.** The Concert CLA under which contributions are accepted —
see [Contributing](Contributing).

### CPV
**Common Procurement Vocabulary.** An EU classification scheme for procurement subject
matter, used in [Classification](Foundation-Layer#classification) (`scheme: cpv`).

### DID
**Decentralised Identifier (W3C DID 1.0).** A stable, resolvable identifier that needs no
central registry (e.g. `did:web:supplier.example.com`). RECOMMENDED for parties and agents —
see [Identifier](Foundation-Layer#identifier).

### EN 16931
The **European standard for the semantic model of an electronic invoice.** SIGNET's
[Invoice](Process-Layer#invoice) is mapped to its Business Terms (BT) and Business Groups
(BG). Basis of the EU ViDA alignment — see
[EN 16931 & ViDA E-Invoicing](EN-16931-and-ViDA-E-Invoicing).

### ePO
**EU eProcurement Ontology.** An OWL/RDF ontology of procurement semantics. SIGNET's
JSON-LD context aligns terms to ePO (e.g. `procuringParty` → `ePO:hasBuyer`).

### Factur-X
A **hybrid PDF/XML invoice format** (EN 16931 compliant). A SIGNET invoice is convertible to
it.

### GLEIF / LEI
**Global Legal Entity Identifier Foundation / Legal Entity Identifier (ISO 17442).** A global
organisation identifier scheme (`scheme: gleif:lei`).

### GLN
**Global Location Number (GS1).** A location/party identifier (`scheme: gs1:gln`).

### JSON-LD
**JSON for Linked Data.** SIGNET's canonical serialisation; it gives every object and
property a global URI while remaining ordinary JSON to consumers that ignore the semantics.
See [Serialisation](Serialisation).

### Mandate
The **bounded authority** granted to an agent — the structural guarantee it cannot exceed its
remit. See [Mandate](Agent-Layer#mandate).

### MAT
**Most Advantageous Tender.** A common evaluation model (e.g. price/quality/social-value
weighting), expressed as a [Policy](Agent-Layer#policy). See the
[worked policy example](Worked-Examples#policy).

### OCDS
**Open Contracting Data Standard.** The lifecycle vocabulary SIGNET's
[process layer](Process-Layer) aligns to (planning → tender → award → contract →
implementation).

### Peppol BIS
**Peppol Business Interoperability Specifications.** Profiles of UBL for cross-border
ordering, cataloguing, and billing. SIGNET projects to **Peppol BIS Billing 3.0**.

### PROV / PROV-O
**W3C Provenance Ontology.** SIGNET's [Provenance](Trust-Layer#provenance) aligns to it
(`wasGeneratedBy`, `wasDerivedFrom`, `wasAttributedTo`).

### Selective disclosure
A cryptographic technique (e.g. **BBS** proofs) letting a party prove a claim from a
credential without revealing the whole credential. See
[Credential](Foundation-Layer#credential).

### SIGNET
**Secure Intelligent Governed Network for Exchange and Trade** — the standard this
repository defines.

### Solid
A **data-sovereignty pattern** (decoupling data from applications, with consent-based
access). Inspires SIGNET's [Consent](Trust-Layer#consent) model.

### Synthetic agent
An **AI agent** operating as a first-class [Party](Foundation-Layer#party). See
[SyntheticAgent](Agent-Layer#syntheticagent).

### UBL
**Universal Business Language.** An XML document syntax for business documents (Order,
Catalogue, Invoice). SIGNET projects its Invoice to **UBL 2.1**.

### Verifiable Credential (VC)
A **W3C standard** for tamper-evident, cryptographically verifiable claims about a subject.
SIGNET's [Credential](Foundation-Layer#credential) is a VC reference.

### ViDA
**VAT in the Digital Age.** An EU package mandating EN 16931-based cross-border e-invoicing
(from July 2030). See [EN 16931 & ViDA E-Invoicing](EN-16931-and-ViDA-E-Invoicing).
