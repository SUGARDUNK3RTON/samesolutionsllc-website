# Same Solutions — Planner
> Last updated: Tuesday April 28, 2026
> Updated by: Claude Code (automated refresh after substrate-work pivot)

## HARD DEADLINES
- End of April — Aceves SS-Q008 family-friend estimate window closes; Jon decides direction on $16,886 deck
- ASAP — Confirm 2025 tax filing actually landed (April 15 deadline passed; status [?])
- ASAP — Confirm insurance SEP call outcome with Marketplace (800) 318-2596 [?]

## THIS WEEK (April 27 – May 3)

### Monday 4/27
- Substrate work landed (see SUBSTRATE PIVOT below)

### Tuesday 4/28 (today)
- Aceves peak stain SS-Q004 reported done by sibling staining-job chat — verify in /manage
- PLANNER.md refresh (this commit)
- Four Winns H190 battery diagnosis chat opened
- Sea-Doo GTX DI 2001 v0.1 guide rendering

### Wednesday 4/29
- Order LT180 parts: AM131445 brake kit (~$25-45) + 4 inner tubes (~$60)
- Review logo v2 SVG (samesolutions-equipment-service-recovered.svg) — accept round-cap fix or iterate to v3 with polygon shapes
- Push lychee --exclude-mail fix-up commit to weekly maintenance CI

### Thursday 4/30
- 11:00 AM — Therapy (Catherine Howe)
- Aceves SS-Q008 — Jon's family-friend estimate window closes; expect decision

### Friday 5/1 – Sunday 5/3
- Monitor jetski v0.1 render output, iterate if needed
- Four Winns H190 diagnosis follow-up depending on chat progress

## NEXT WEEK (May 4 – May 10)
- LT180 brake job once parts arrive
- Logo finalization (v2 accept or v3 iterate)
- Substrate maintenance: address any lychee/CI follow-ups
- Continue equipment diagnostic chats as triggered

## SUBSTRATE PIVOT (since April 3)
- Equipment-service substrate built and deployed
  - Private repo: `samesolutions-equipment-service`
  - Cloudflare Pages: samesolutions-equipment-service.pages.dev
  - Cloudflare Access: 6 bypass-public paths + catch-all email auth
- METHODOLOGY.md v1.2 deployed (Principle 8: use tools and substrate, not users)
- SESSION-PRELUDE.md v1.0 deployed (kind-specific behavior + tool inventory)
- SYSTEM-DESIGN.md v1.3 deployed (load-bearing paths section)
- Weekly maintenance CI workflow deployed (lychee --exclude-mail bug — fix-up commit pending)
- Logo v2 SVG recovered from broken chat via conversation_search → `samesolutions-equipment-service-recovered.svg`

## ACTIVE QUOTES
- SS-Q003 Talmid $1,830.50 — done, invoicing status [?] verify in /manage
- SS-Q004 Aceves peak stain $301.50 — reported done 4/28 by sibling chat [?] verify in /manage
- SS-Q008 Aceves deck $16,886 — Jon waiting on family-friend estimate, end-of-April window
- SS-Q009 Tessman $450 painting — completion status [?] verify in /manage or with Sam

## FINANCIAL SNAPSHOT
> [?] All numbers below carried forward from April 3 snapshot — verify in /manage
- Outstanding: ~$1,508 (Letvin $695 [?] + Talmid $813 [?])
- Completed not invoiced: $1,830.50 (Haim SS-Q003) [?]
- SW order savings: ~$500-600 (status of bulk order [?])

## BACKLOG / TO VERIFY
- Tax filing status (April 15 passed) [?]
- Insurance SEP call outcome [?]
- Tessman SS-Q009 ($450) completion [?]
- SS-Q003 Talmid ($1,830.50) invoicing [?]
- Letvin $695 collection [?]
- CeCe arches painting outcome [?]
- Foran's Transmission subpage deploy status [?]

## Equipment Active

### LT180 lawn tractor
- Status: diagnosis complete, parts pending order
- Latest guide: guides/lt180/lt180-service-guide-v3.html
- Last touched: 2026-04-28
- Outstanding: AM131445 brake kit + 4 inner tubes (~$85-115)
- Next session trigger: parts arrive, brake job scheduled

### Sea-Doo GTX DI 2001
- Status: v0.1 guide in render with retroactive 4-TEC supercharger DHL
- Latest guide: guides/gtx-di-2001/ (v0.1 rendering)
- Last touched: 2026-04-28
- Outstanding: monitor render output, validate against retroactive DHL
- Next session trigger: render complete or render failure feedback

### Four Winns H190
- Status: battery diagnosis just opened
- Latest guide: guides/four-winns-h190/ (in progress)
- Last touched: 2026-04-28
- Outstanding: complete battery diagnosis path, capture findings
- Next session trigger: diagnostic next step or new symptom report
