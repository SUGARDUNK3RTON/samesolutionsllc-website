# Same Solutions — Planner

> Last updated: Friday May 1, 2026
> Single source of truth for global priorities. See CLAUDE.md for repo rules. See CHANGELOG.md for shipped work.

## HARD DEADLINES

- **Wed May 6** — filament must arrive for Pirates/Phillies print (ordered today/tomorrow)
- **Wed May 13 EOD** — all 16+ logos and chains printed and ready
- **Thu May 14 AM** — truck departs for family baseball game
- **Sat May 16** — game day

## THIS WEEK (May 1 – May 3)

### Friday 5/1 (today)
- Order filament for Pirates/Phillies 3D print (research chat outputting SKUs)
- Send filament order via Amazon Prime
- Logo v38 deployed site-wide (commit pushed earlier today)

### Saturday 5/2 – Sunday 5/3
- Begin Pirates/Phillies prints once first filament arrives (if early)
- Catch up on lower-priority items as time allows

## NEXT WEEK (May 4 – May 10)
- Pirates/Phillies print sprint — 16 logos + 16 chains across 7 print days
- Tessman SS-Q009 follow-up (verify in /manage, confirm color/schedule)
- Resume work on top architectural items (see ARCHITECTURAL BACKLOG below)

## RANKED BACKLOG

Priorities below are ordered. Substrate-managed entities (equipment, customer jobs) link out to their dossiers; quote and billing detail lives in /manage.

1. **Pirates/Phillies 3D print for Dad** — see substrate `personal/pirates-phillies-3d-print-2026-05/`
2. **Recover original landing page** — search local for `samesolutionsllc-v115.zip` (likely in Downloads or OneDrive). Backup recovery: open the March 10, 2026 Claude chat "Separating dad's website from main codebase" (URL `https://claude.ai/chat/2c03c29f-37a9-4c81-af4e-0e353007e1c6`) and re-download the zip from message history. Once recovered, drop the root `index.html` from the zip into the repo as `index-original.html` for reference and tell Claude Code to merge desired design elements into the current `index.html`.
3. **Janice Fisk evaluation** — 200 Cardinal St, Janet Tessman's neighbor, bigger job
4. **Collect Talmid ~$813** — bring up at next interaction (see /manage Billing)
5. **Invoice Haim SS-Q003 → SS-012** — completed work, not yet invoiced (see /manage Billing)
6. **Admin Billing Tab merge** — manage app architectural, see substrate `architecture/pending/`
7. **Data Store Consolidation / DATA_VERSION migration** — manage app architectural, see substrate `architecture/pending/`
8. **Firebase Auth Migration** — replace PRESET_ACCOUNTS, see substrate `architecture/pending/`
9. **SESSION-PRELUDE.md v1.0.1 patch** — Class 4 cache failure mode, see substrate
10. **Lychee CI bug fix** — `--exclude-mail` → `--include-mail` v0.23
11. **Aceves-lake property record verification** — confirm Union St Hubbard Lake property in /manage
12. **Tessman SS-Q009 follow-up** — see /manage Billing, confirm color/schedule
13. **Aceves fence quote corrections** — see substrate `customer-jobs/aceves-home-fence-2026-04/` (diagram orientation, scope 154.5 LF not 210)
14. **Aceves deck SS-Q008 follow-up** — see substrate `customer-jobs/aceves-home-deck-2026-04/` and /manage SS-Q008; Jon decision past due [?]
15. **Letvin appliance model numbers → KB** — see /manage Knowledge Base → Appliances
16. **Tankless water heater entry → KB** — replacing 1984 State CV 40 at sam-home, see /manage KB
17. **Home model room layout fix** — manage app, floor plan SVG rooms overlap
18. **LT180 spindle brake parts research** — see substrate `index/equipment/lt180.md`
19. **customer-jobs/ template codification** — refine from Aceves fence work, see substrate
20. **Water heater replacement (sam-home)** — 1984 unit, 41 years old, critical
21. **Sam's deck — scrape, replace boards, stain** — ~1/5 boards
22. **CeCe's studio arches — verify completion** [?]
23. **ACA enrollment for Sam + CeCe** — each household-of-1, separate filings
24. **CeCe Schedule C reconstruction** — tax prep for hair-stylist LLC
25. **Business cards — design + order** — logo v38 SVG ready as source
26. **Logo-based 3D prints** — keychains, magnets, desk pieces
27. **Pocket screwdrivers branded order** — pair with business card order?
28. **Foran's Transmission site — Dad review, push live** — subpage with mascot already built
29. **Paint: Windsor's room, master, basement, exterior wall** — part of SW bulk order
30. **Collect Letvin $695** — outstanding, deprioritized

## TO VERIFY (status unknown — flagged from prior planner)

- 2025 tax filing landed [?] (April 15 passed; W-2 only filer per earlier discussion)
- Insurance SEP call outcome with Marketplace (800) 318-2596 [?]
- SS-Q003 Talmid invoicing [?] (see #5 above)
- SS-Q004 Aceves peak stain $301.50 reported done 4/28 [?]
- SS-Q009 Tessman $617 painting completion [?] (see #12 above)
- CeCe arches painting outcome [?] (see #22 above)
- Foran's Transmission subpage deploy status [?] (see #28 above)
- SW bulk order placement and savings [?]

## ARCHITECTURAL BACKLOG

Cross-session architectural decisions live in substrate `architecture/pending/`. Items #6, #7, #8, #9 above point there. PLANNER.md tracks priority order; substrate tracks the decision content.

## EQUIPMENT REFERENCES

Per-equipment status, service guides, and next-steps live in substrate `index/equipment/<id>.md`. Active equipment as of last touch:

- LT180 lawn tractor — see substrate
- Sea-Doo GTX DI 2001 — see substrate
- Four Winns H190 — see substrate

PLANNER.md does not duplicate per-equipment status. Open the substrate dossier when working on an equipment item.

## QUOTES & BILLING

All quote, invoice, and customer financial data lives in /manage app data model (localStorage, DATA_VERSION 15). PLANNER.md does not duplicate financial snapshots. Open /manage Billing tab for current numbers.

## HOW TO USE THIS FILE

- **Single source of truth** for global priorities. Other files defer to this one.
- **Edit via Claude Code:** "update PLANNER.md, mark item N done, add new item between X and Y"
- **Edit via this chat:** I propose the edit, Claude Code applies it
- **`[?]` flag** = status unverified, needs Sam's confirmation before action
- **Per-entity work** lives in substrate (`index/<kind>/<id>.md` or `customer-jobs/<id>/`). PLANNER.md links to them.
- **Architectural decisions** live in substrate `architecture/pending/`. PLANNER.md ranks them by priority but doesn't hold the decision content.
- **Quote/billing data** lives in /manage. PLANNER.md references but does not duplicate.
- **Historical milestones** live in CHANGELOG.md. PLANNER.md is forward-looking only.
