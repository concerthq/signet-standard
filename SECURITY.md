# Security Policy

This repository holds a **data standard** — JSON Schema, codelists, a JSON-LD
context, worked examples, and prose. It ships no runtime service. The most
relevant "security" concerns are therefore:

- defects in the schema that would allow unsafe or ambiguous data to validate;
- issues in the trust-layer model (`Event`, `Provenance`, `Consent`) or the
  agent-layer model (`Mandate`, `Decision`, `Policy`) that could undermine the
  accountability guarantees the standard is meant to provide;
- vulnerabilities in the validation tooling (`validate.js`) or CI.

## Reporting

Please report suspected security-relevant issues **privately** rather than
opening a public issue:

- Email: **concerthq@hyper.support**
- Or use GitHub's [private vulnerability reporting](https://github.com/concerthq/signet-standard/security/advisories/new).

We aim to acknowledge reports within 5 business days.

For ordinary specification defects with no security impact, please open a
[Specification defect](https://github.com/concerthq/signet-standard/issues/new?template=spec-defect.md)
issue instead.
