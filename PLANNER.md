# Same Solutions — Planner

> Last updated: Monday May 11, 2026
> Single source of truth for global priorities. See CLAUDE.md for repo rules. See CHANGELOG.md for shipped work.

## HARD DEADLINES

- **Wed May 13 EOD** — all 16+ logos and chains printed and ready
- **Thu May 14 AM** — truck departs for family baseball game
- **Sat May 16** — game day at Hubbard Lake

## THIS WEEK (May 11 – May 17)

### Mon 5/11 — Wed 5/13
- Pirates/Phillies print sprint final stretch — v3 file is canonical (mesh-verified pauses at z=10mm and z=12mm); v1/v2 superseded
- Verify all 16 medallions + 16 chains complete by Wed EOD

### Thu 5/14
- Truck loads AM for Hubbard Lake; depart

### Sat 5/16
- Game day

## RANKED BACKLOG

Priorities below are ordered. Substrate-managed entities (equipment, customer jobs) link out to their dossiers; quote and billing detail lives in /manage.

1. **Pirates/Phillies 3D print for Dad** — v3 print file canonical (mesh-verified pauses), print sprint in final week, game day Sat 5/16. See substrate `personal/pirates-phillies-3d-print-2026-05/`.
2. **Janice Fisk evaluation** — 200 Cardinal St, Janet Tessman's neighbor, bigger job
3. **Collect Talmid ~$813** — bring up at next interaction (see /manage Billing)
4. **Invoice Haim SS-Q003 → SS-012** — completed work, not yet invoiced (see /manage Billing)
5. **Admin Billing Tab merge** — manage app architectural, see substrate `architecture/pending/`
6. **Data Store Consolidation / DATA_VERSION migration** — manage app architectural, see substrate `architecture/pending/`
7. **Firebase Auth Migration** — replace PRESET_ACCOUNTS, see substrate `architecture/pending/`
8. **SESSION-PRELUDE.md v1.0.1 patch** — Class 4 cache failure mode, see substrate
9. **Lychee CI bug fix** — `--exclude-mail` → `--include-mail` v0.23
10. **Aceves-lake property record verification** — confirm Union St Hubbard Lake property in /manage
11. **Tessman SS-Q009 follow-up** — see /manage Billing, confirm color/schedule
12. **Aceves fence quote corrections** — overview shipped 2026-05-01, awaiting Jon's lane decisions on scope/material/gate before tightening final quote in /manage. See substrate `customer-jobs/aceves-home-fence-2026-04/`.
13. **Aceves deck SS-Q008 follow-up** — see substrate `customer-jobs/aceves-home-deck-2026-04/` and /manage SS-Q008; Jon decision past due [?]
14. **Letvin appliance model numbers → KB** — see /manage Knowledge Base → Appliances
15. **Tankless water heater entry → KB** — replacing 1984 State CV 40 at sam-home, see /manage KB
16. **Home model room layout fix** — manage app, floor plan SVG rooms overlap
17. **LT180 spindle brake parts research** — see substrate `index/equipment/lt180.md`
18. **customer-jobs/ template codification** — refine from Aceves fence work, see substrate
19. **Home tab for manage app** — personal dashboard inside /manage (tasks, quick links, notes). Design spec at substrate `personal/home-tab-design-spec-2026-05/`. Build deferred until post-Pittsburgh trip per Sam.
20. **Water heater replacement (sam-home)** — 1984 unit, 41 years old, critical
21. **Sam's deck — scrape, replace boards, stain** — ~1/5 boards
22. **CeCe's studio arches — verify completion** [?]
23. **ACA enrollment for Sam + CeCe** — each household-of-1, separate filings
24. **CeCe Schedule C reconstruction** — tax prep for hair-stylist LLC
25. **Business cards — design + order** — logo v38 SVG ready as source
26. **Metal 3D printing business exploration** — multi-month iterative research project. Substrate folder at personal/metal-3dp-business-exploration-2026/. Scope reframed 2026-05-10 to broader fabrication/lifestyle venture (Chris as 2nd partner, 4 friends in orbit, possibly multi-LLC shared-shop structure). Two-track research split now active (metal 3DP technical + lifestyle business / career exit). Living documents, no fixed deliverable date.
27. **Landing page v4 follow-up** — booking form backend (real submit handler) and work gallery, deferred from v3 ship
28. **Logo-based 3D prints** — keychains, magnets, desk pieces
29. **Pocket screwdrivers branded order** — pair with business card order?
30. **Foran's Transmission site — Dad review, push live** — subpage with mascot already built
31. **Paint: Windsor's room, master, basement, exterior wall** — part of SW bulk order
32. **Collect Letvin $695** — outstanding, deprioritized

## TO VERIFY (status unknown — flagged from prior planner)

- 2025 tax filing landed [?] (April 15 passed; W-2 only filer per earlier discussion)
- Insurance SEP call outcome with Marketplace (800) 318-2596 [?]
- SS-Q003 Talmid invoicing [?] (see #4 above)
- SS-Q004 Aceves peak stain $301.50 reported done 4/28 [?]
- SS-Q009 Tessman $617 painting completion [?] (see #11 above)
- CeCe arches painting outcome [?] (see #22 above)
- Foran's Transmission subpage deploy status [?] (see #30 above)
- SW bulk order placement and savings [?] — walk-in sheet v2 finalized 2026-05-05, walk-in not yet executed

## RECENTLY COMPLETED

> Items shipped recently. Preserved here for context/history. Convention: items stay for ~2 weeks or until their CHANGELOG.md entry is established, then can be removed at next PLANNER maintenance pass. The authoritative record is CHANGELOG.md.

- **Landing page v3 merge** (2026-05-01) — engineer-first hybrid 7-service list, structured contact cards, credential framing, archive of v115 original. See CHANGELOG.
- **Booking form → CTA replacement** (2026-05-04) — non-functional `<form>` block replaced with call/email CTA card. Eliminated dead UI. See CHANGELOG.
- **robots.txt with /archive/ disallow** (2026-05-04) — historical artifacts excluded from public crawl.
- **Canonical URL doctrine added to CLAUDE.md** (2026-05-04) — substrate references via pages.dev URLs, not local paths.
- **McCabe v16 → v17 migration** (2026-05-04) — `mccabe-home` moved from `PROPERTIES{}` const to `data.properties{}` (Tessman pattern). DATA_VERSION 17, APP_VERSION v1.7.16.
- **utilities.css extraction** (2026-05-04, two commits) — 747 inline-style attributes dropped (~31% reduction). 111 utility classes consolidated into single `manage/utilities.css`. Brand `#000` → `#101820` normalized. APP_VERSION v1.7.18.
- **Playwright smoke test + GitHub Action CI** (2026-05-10) — 4 smoke tests (public landing, manage entry, asset 200s, mobile viewport) run on every push to main. Stale "(Preview)" suffix removed from public title in same commit.
- **Metal 3DP business exploration substrate project** (2026-05-09) — multi-folder iterative-research project scaffolded; first personal-project using sub-folder pattern.

## ARCHITECTURAL BACKLOG

Cross-session architectural decisions live in substrate `architecture/pending/`. Items #5, #6, #7, #8 above point there. PLANNER.md tracks priority order; substrate tracks the decision content.

## EQUIPMENT REFERENCES

Per-equipment status, service guides, and next-steps live in substrate `index/equipment/<id>.md`. Active equipment as of last touch:

- LT180 lawn tractor — see substrate
- Sea-Doo GTX DI 2001 — see substrate
- Four Winns H190 — see substrate

PLANNER.md does not duplicate per-equipment status. Open the substrate dossier when working on an equipment item.

## QUOTES & BILLING

All quote, invoice, and customer financial data lives in /manage app data model (localStorage, DATA_VERSION 17). PLANNER.md does not duplicate financial snapshots. Open /manage Billing tab for current numbers.

## HOW TO USE THIS FILE

- **Single source of truth** for global priorities. Other files defer to this one.
- **Edit via Claude Code:** "update PLANNER.md, mark item N done, add new item between X and Y"
- **Edit via this chat:** I propose the edit, Claude Code applies it
- **`[?]` flag** = status unverified, needs Sam's confirmation before action
- **Per-entity work** lives in substrate (`index/<kind>/<id>.md` or `customer-jobs/<id>/`). PLANNER.md links to them.
- **Architectural decisions** live in substrate `architecture/pending/`. PLANNER.md ranks them by priority but doesn't hold the decision content.
- **Quote/billing data** lives in /manage. PLANNER.md references but does not duplicate.
- **Historical milestones** live in CHANGELOG.md. PLANNER.md is forward-looking only; RECENTLY COMPLETED is a transient holding area.
