# Draft correction — concert.foundation/governance

**Not applied.** This is proposed replacement wording for the published governance page,
escalated rather than resolved locally per the handoff pack §7.

## The conflict

The published page presents the Standards Committee as a currently operating body, listing its
remit ("Technical interoperability decisions / Protocol evolution and version management /
Standards adoption and deprecation / Testing and certification criteria") and its membership
composition ("Technical representatives from member organisations, invited experts, liaison
with W3C/OpenPeppol/OASIS").

The repository states the opposite, in the artifact that is authoritative on the point:

> **No Standards Committee is constituted.** — `governance/README.md`, "The bootstrap clause"

Every register and proposal in the repository is stamped accordingly: twenty interim
resolutions are in force *because* no body exists to ratify them, and nothing in the
repository has reached `Ratified`.

This is the same class of defect the repository's own claim triad exists to catch: a governance
body that is *designed* is being described as one that is *operating*. It matters more than an
ordinary copy error, because the page is the thing an assessor or an implementer would read to
decide whether the standard is independently governed.

## Proposed replacement

Describe the Committee as designed, and the interim arrangement as current:

> **Standards Committee — to be constituted.**
>
> The Standards Committee will hold technical interoperability decisions, protocol evolution
> and version management, standards adoption and deprecation, and testing and certification
> criteria. Its intended composition is technical representatives from member organisations,
> invited experts, and liaison with W3C, OpenPeppol and OASIS.
>
> **It is not yet constituted.** It will be constituted at the first external certification.
> Until then, decisions that would fall to the Committee are taken under a published bootstrap
> clause and recorded as **interim resolutions** — in force, reasoned in writing, and
> reversible by the Committee on the record once it exists. The interim arrangement, the review
> tiers it operates under, and its limits are documented in
> [GOVERNANCE.md](https://github.com/concerthq/signet-standard/blob/main/GOVERNANCE.md).

## Two further alignments worth making at the same time

1. **Review rule.** The page currently states no review rule and points at `CONTRIBUTING.md`.
   It could now point at `GOVERNANCE.md` for the two-tier rule and the 14-day comment period on
   normative changes.
2. **Repository identities.** The page says nothing about who reviews and merges. If it
   describes governance at all, the disclosure in `GOVERNANCE.md` — two accounts, one operator,
   procedural rather than independent separation — should not be discoverable only from the
   repository.

## What not to do

Do not soften the repository to match the page. The repository's position is the accurate one,
and it is load-bearing for every interim resolution recorded against it.
