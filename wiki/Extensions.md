# Extensions

The CDM is **extensible without forking**, following the OCDS extension pattern. Extensions
let domains elaborate the model (e.g. defence procurement, construction) while keeping the
core lean.

## What an extension is

> An extension is a **published, versioned package** that adds object types, fields, or
> codelist values **under its own namespace** (specification §11.1).

## The rules

1. **Add, don't change.** Extensions **MUST NOT** redefine or remove core fields. They only
   add new structure under their own namespace.
2. **Promotion path.** Community extensions **MAY** be submitted to Concert for review and,
   if broadly useful, promoted into the core model through the
   [change-control process](Governance-and-Versioning). This keeps the core lean while
   allowing domain-specific elaboration.
3. **Separate conformance.** Core [conformance](Validation-and-Conformance) is assessed
   against the **core model only**; extensions are conformance-assessed separately.

## Proposing an extension

Per [CONTRIBUTING.md](Contributing), extensions that *add* (rather than change) structure
should be proposed as packages under an `/extensions` path. The general flow:

1. Open an issue describing the gap the extension fills.
2. Define the new object types / fields / codelist values under a dedicated namespace.
3. Provide at least one example instance and the schema additions.
4. Submit a pull request; CI must pass.

See [Contributing](Contributing) and [Governance & Versioning](Governance-and-Versioning).

## Relationship to the agent layer

Note that the [Agent Layer](Agent-Layer) is **not** an extension — it is core, SIGNET's
original contribution. Extensions are for *additional* domain structure on top of the core
four-layer model.
