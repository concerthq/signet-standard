# SIGNET Certification

**Steward:** Concert Foundation · **Tier:** Process · **Licence:** CC0-1.0

Certification turns a passing conformance result into the right to use the
**"SIGNET Certified"** mark. This document describes the process. It is governed
by the neutrality rules (CN-1…CN-4) in `levels.md` and the Concert IP & Licensing
Policy. The process is identical for every implementer, including Score Networks.

---

## 1. What certification asserts

"SIGNET Certified — Core" or "— Full" asserts that, against a stated CDM version
and suite version, the implementation produced a passing conformance report at
that level from the public, machine-runnable suite. It asserts nothing more: it
is not an endorsement, a security audit, or a guarantee of fitness.

## 2. The process

1. **Self-test.** The implementer writes a conformance adapter for their system
   (see `adapter/adapter-contract.md`) and runs the public suite:
   ```
   node conformance/runner/run-conformance.js --adapter <their-adapter>
   ```
   This produces a report conforming to `report-schema.json`.
2. **Submit.** The implementer sends Concert the report, the adapter source, and
   the suite + CDM versions used. Because the suite is public and the result is
   reproducible (CN-4), no private assessment is needed.
3. **Reproduce.** Concert re-runs the identical suite against the submitted
   adapter and confirms the report. The check is mechanical (CN-1).
4. **Issue.** On a confirmed pass, Concert records the certification (implementer,
   level, CDM version, suite version, date, report hash) in the public registry
   and licenses the "SIGNET Certified" mark for that level and version.
5. **Publish.** The report is publishable; the registry entry is public.

There is no committee judgement, interview, or discretionary gate at any step.

## 3. Marks and their use

- The mark is `SIGNET Certified — <Level>` and MUST always be qualified by the
  CDM and suite versions in any formal claim (e.g. *"SIGNET Certified — Full
  (CDM v0.1, suite v0.1)"*).
- The mark licence is granted under the IP & Licensing Policy, on identical terms
  to all implementers, and is conditional on a current passing report.
- Misuse — claiming a level not achieved, or omitting the version qualification in
  a way that misleads — is grounds for withdrawal of the mark licence.

## 4. Renewal and versioning

- A certification is valid for its stated CDM + suite versions.
- A new **CDM major** version requires re-certification.
- A **suite minor/patch** update (added or clarified tests) does not invalidate an
  existing certification immediately, but the current suite applies at renewal.
- Concert publishes the current versions and a deprecation window for superseded
  ones.

## 5. Fees and neutrality

Certification may carry a fee that funds Concert's neutral stewardship. The fee
is published, identical for all implementers at a given level, and unrelated to
the outcome (you pay to be assessed, not to pass). No implementer — including
Score Networks — receives a discount, a fast track, or any other preference
(CN-3). Fees are the Foundation's primary sustaining revenue, by design, so that
the standard itself can remain free.

## 6. Disputes

Because conformance is mechanical and reproducible, a dispute is resolved by
re-running the public suite. If an implementer believes a test is wrong (rather
than their implementation), they raise it through the normal standard
change-control process; the suite is corrected for everyone or not at all (CN-2).
