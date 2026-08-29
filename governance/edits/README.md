# Insertion notes (apply by hand; source files not reproduced here)

**Timing is load-bearing.** Section A lands with IAR-0006. Section B lands only at execution of the
constitution instrument — landing it earlier puts two live contradictory statements in GOVERNANCE.md
("is not yet constituted" at ~line 85 versus "proceeded earlier, by appointment"). Section B items
travel in the execution PR with the role-register append, not before.

## A — with IAR-0006 (Step 1)

1. `governance/proposals/README.md` — standing-rule blockquote gains a final line:
   > Registration is temporarily reopened under [IAR-0006](../IAR-0006-registration-window.md): defect-remedying or timing-dependent proposals only, adoption still parked, expires on constitution or 30 September 2026.
2. `governance/README.md` — interim-resolutions table gains: `| IAR-0006-registration-window.md | Pre-constitution registration window; expires on constitution |`
3. `governance/REVERSAL-RISK.md` — row for IAR-0003-as-amended: `low` (the anyOf branch is permissive; removal narrows).

## B — at execution only (with the instrument, same PR)

4. `GOVERNANCE.md`, "The Standards Committee" — after the trigger sentence, append:
   > Constitution in fact proceeded earlier, by appointment, under the recital of [the constitution instrument](governance/CONSTITUTION-2026-09.md): the certification trigger was a floor against deferral, not a bar against readiness.
   In the same edit, the surrounding text stating that no Committee is constituted is updated to past
   tense with the execution date — the two statements change together or not at all.
5. `GOVERNANCE.md`, "Repository identities" — review passes to member accounts; `concertcustodian` ceases to be a sufficient approver for Tier 2 (instrument §6).
6. `governance/README.md` — index the executed instrument, agenda, brief and interests register.

## Series-gap note (land with A)

7. `governance/README.md`, one line where the IAR index lives: the IAR series begins at 0002 — no
   IAR-0001 exists on any branch — and the defect register on `main` runs to D-31 with D-32 and
   D-33 reserved by rows on unmerged branches. Both gaps are recorded so a later reader does not
   infer a missing record.
