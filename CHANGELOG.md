# Changelog

> Append-only record of major architectural milestones and shipped work. For day-to-day priorities, see PLANNER.md. For repo rules, see CLAUDE.md.

Format: each entry is dated, names the milestone, and gives a one-sentence summary plus links to the relevant artifacts.

## 2026-05-01 — First customer-jobs HTML overview ships

Aceves fence replacement overview deployed to substrate at customer-jobs/aceves-home-fence-2026-04/overview.html. Decision-support format covering scope/material/gate decisions, with corrected 154.5 LF total and corrected E-W diagram orientation. First test of the customer-jobs HTML guide pattern; template abstraction deferred until a second example exists.

## 2026-05-01 — Logo v38 ships site-wide

Two interlocking S logo finalized after 38 geometry iterations. Single SVG variant works on both light and dark backgrounds via thin white outer halo. Deployed everywhere: root index.html hero, /manage app icons (192/512), inline base64 embed in /manage for print/PDF, favicon. APP_VERSION bumped v1.7.13 → v1.7.14. SW cache bumped v49 → v50. SW cleanup-filter bug fixed (hardcoded "v44" was deleting active caches on activate; now uses CURRENT_CACHES array).

## 2026-04-30 — Source-of-truth boundaries codified

Cross-session architectural decision after consult between this planning chat, jetski substrate chat, and Claude Code. PLANNER.md becomes single source of truth for global priorities. Substrate owns methodology, per-entity dossiers, customer-jobs research, and architectural decision records. /manage app owns customer/quote/invoice/property data. Chat memories are informational continuity only, not authoritative. Documented in CLAUDE.md "Source-of-truth boundaries" section.

## 2026-04-28 — Substrate pivot complete

Equipment-service substrate built from scratch and deployed.

- Private repo: `samesolutions-equipment-service` on GitHub
- Cloudflare Pages: `samesolutions-equipment-service.pages.dev`
- Cloudflare Access: 6 bypass-public paths + catch-all email auth
- METHODOLOGY.md v1.2 deployed (Principle 8: use tools and substrate, not users)
- SESSION-PRELUDE.md v1.0 deployed (kind-specific behavior + tool inventory)
- SYSTEM-DESIGN.md v1.3 deployed (load-bearing paths section)
- Weekly maintenance CI workflow deployed (lychee link checker; `--exclude-mail` bug pending fix in v0.23)
- First customer-jobs entry: aceves-home-fence-2026-04/
- Three equipment dossiers active: LT180 lawn tractor, Sea-Doo GTX DI 2001, Four Winns H190

## 2026-03-31 — Manage app v1.7.0 — unified renderer

Single `renderDocument(doc, {theme, editable, printMode, showHistory})` function replaces four separate document renderers (viewQuoteDetail, genInvHTML, showCustomerBillingDetail, printCustomerDocument). Foundation for the Admin Billing Tab merge.

## 2026-03 — GitHub → Cloudflare deployment pipeline established

Manage app moved from manual zip uploads to GitHub auto-deploy. Repo: SUGARDUNK3RTON/samesolutionsllc-website. PLANNER.md and CLAUDE.md added to repo root for mobile-accessible task tracking and Claude Code context.

## 2026-03 — Original public landing page lost

When the GitHub → Cloudflare pipeline took over root URL serving, the pre-existing public landing page was overwritten. Original page existed in samesolutionsllc-v115.zip uploaded to a March 10 Claude chat ("Separating dad's website from main codebase"). Recovery from local backup is possible but pending. Current root index.html is a Claude-Code-generated replacement.
