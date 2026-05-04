# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Single-file PWA business management app for Same Solutions LLC, a handyman/technical services company.
- **App URL**: samesolutionsllc.com/manage
- **Stack**: Vanilla JS, Firebase (project: same-solutions-app), localStorage with versioned migrations, service worker cache
- **Deploy**: GitHub → Cloudflare auto-deploy on push
- **File**: `manage/index.html` (~28,599 lines, single file — all HTML, CSS, and JS)

## Source-of-truth boundaries

This repo participates in a multi-store architecture. Each concern has exactly one authoritative location:

- Global priorities, weekly focus, today's plan → PLANNER.md (this repo, this file)
- Major architectural milestones, shipped work, history → CHANGELOG.md (this repo)
- Repo rules, conventions, codebase guidance → CLAUDE.md (this repo, this file)
- Repo structure / what-lives-where → REPO.md (this repo)
- Customer/quote/invoice/property/equipment data → /manage app data model (localStorage, DATA_VERSION 15)
- Methodology, session protocol, kind-specific behavior → substrate METHODOLOGY.md + SESSION-PRELUDE.md
- Per-entity next-steps and dossiers → substrate index/<kind>/<id>.md
- Customer-jobs research artifacts → substrate customer-jobs/<property-id>-<job-type>-<YYYY-MM>/
- Cross-session architectural decisions → substrate architecture/pending/ then architecture/<date>-<topic>.md when resolved
- Personal projects research → substrate personal/<topic-id>/
- Service guides for Sam's equipment → substrate guides/<id>/

Chat memories are informational continuity only — never authoritative. When in doubt about where something belongs, check this list first.

## Canonical URL references

When chat outputs, prompts, or planner entries reference prior committed work, use canonical URLs — not local Downloads paths or chat memories.

- Substrate references: https://samesolutions-equipment-service.pages.dev/<path>
- Website references: https://samesolutionsllc.com/<path>

Why: chats can fetch URLs but can't see each other's local filesystems or memories. URL references make any prior work fetchable by any chat without re-uploading. Local-path references break when the source chat session ends.

Examples:

GOOD: "See substrate https://samesolutions-equipment-service.pages.dev/customer-jobs/aceves-home-fence-2026-04/overview.html"
BAD: "See C:/Users/smf13/Downloads/aceves-overview.html"

GOOD: "Per current PLANNER.md (https://samesolutionsllc.com/PLANNER.md)..."
BAD: "Per the version of PLANNER.md I remember..."

This rule applies to all chat outputs (prompts to Claude Code, planning documents, handoff messages) and to PLANNER.md item descriptions. Verify-by-URL rather than verify-by-local-file. The Class 4 cache patch precedent (2026-04-28) established that substrate is recoverable from bad commits, so post-commit URL verification is the canonical pattern; pre-commit zip uploads are deprecated.

## Brand Standards

- **Colors**: Black `#101820` + Gold `#FFB612` — NO gradients ever
- **Tagline**: "Same Solutions for Different Problems"
- **Logo**: Two interlocking hexagonal S shapes (black upper-left, gold lower-right)

## Critical Rules — NEVER VIOLATE

### Data Migrations

- ALL data changes go through versioned `migrateData()` — NEVER seed data blocks in the data-exists path
- Current: `DATA_VERSION 15`, 14 migrations (line ~4721 of manage/index.html)
- Increment DATA_VERSION for every new migration
- Each migration checks `if (fromVersion < N)` and runs once

### Before Every Commit

1. Run syntax check: `node -e "const c=require('fs').readFileSync('manage/index.html','utf8');const s=c.match(/<script>([\\s\\S]*?)<\\/script>/g);new Function(s.reduce((a,b)=>a.length>b.length?a:b).replace(/<\\/?script>/g,''));console.log('OK')"`
2. Check for duplicate functions: `grep 'function [a-zA-Z]' manage/index.html | sed 's/.*function \([a-zA-Z_]*\).*/\1/' | sort | uniq -d`
3. Bump service worker cache version in `manage/sw.js` (ss-manager-vNN, ss-static-vNN, ss-dynamic-vNN)
4. Bump `APP_VERSION` string in manage/index.html

### Code Integrity

- NEVER include instruction comments as code when integrating paste blocks
- NEVER paste raw artifacts from other chats — they may contain comment-formatted instructions that break syntax
- Always `parseFloat()` values before `.toFixed()` — prevents NaN on string data

## Commands

### Run tests

In-app: admin dropdown → 🧪 Run Tests (runs `runAppTests()`, 18+ automated checks)

### Local development

Serve `manage/` over HTTP(S) with any static file server.

## Architecture

### Key Systems

- **Auth**: Preset accounts in `PRESET_ACCOUNTS` object with base64-encoded passwords (`_pw` field, verified via `_pv()`)
- **Customer Portal**: Customers log in, see "My Property" + "My Billing" tabs. Admin sees all tabs.
- **Unified Renderer**: `renderDocument(doc, {theme, editable, showHistory, ...})` — ONE function for all quote/invoice display (dark, light, print themes)
- **Print**: `renderPrintDocument(docId, docType)` opens clean white-background window.print() view
- **Service Worker**: `manage/sw.js` — cache version v50. Must update all three cache names when static assets change. Skips Firebase/external API calls.

### Data Stores

- `data.customers{}` — all customer records
- `data.properties{}` — migration-added properties (also `PROPERTIES{}` for hardcoded ones)
- `data.jobs[]` — logged work entries
- `data.invoices[]` — invoice documents
- `data.quotes[]` — quote documents with lineItems arrays
- `data.expenses[]` — expense records
- `data.mileage[]` — IRS mileage tracking entries
- `data.equipment{}` — machines, RC vehicles, tools (keyed by ID like EQ-LOSI-MICRO-T)
- `data.appliances[]` — property appliances
- `data.assets{}` — tools and electronics
- `data.recurringEvents[]` — weekly/recurring calendar events

### Index Maps (for performance)

Built by `buildIndexes()` — always call after `loadData()`:
- `INDEX.contactJobs` — customer ID → job IDs
- `INDEX.invoiceJobs` — invoice ID → job IDs
- `INDEX.jobInvoice` — job ID → invoice ID
- `INDEX.propertyJobs` — property ID → job IDs

### Key Relationships

- Jobs → Invoices: many-to-one (job.invoice field)
- Properties → Customers: many-to-one
- Equipment → Trailers: linked by trailer.linkedEquipment

### UI Patterns

- **Pages**: Show/hide divs with class `.page`, routed via `showPage()`
- **Modals**: `openModal()` / `confirmModal()` (use these, not native `confirm()`)
- **Toasts**: `toast(msg, type)` where type = `'success'|'error'|'warning'`
- **Navigation**: Horizontal scrolling tab bar
- **Persistence**: `saveData()` to persist, `loadData()` to hydrate

### Naming Conventions

- Functions: camelCase, all global scope
- Constants: SCREAMING_SNAKE_CASE (`LOGO`, `BIZ`, `HOME_ADDRESS`, `MILEAGE_RATE`)
- HTML IDs: kebab-case (`#main-content`, `#dashboard`)

### Role-Based Access

- Admin: full access to all tabs
- Customer: portal view (My Property + My Billing)
- Household: property access
- Determined by `determineUserRole()`, checked via `isAdmin()`, `isHousehold()`

## Firebase

- Project: same-solutions-app
- localStorage key: `sameSolutionsData`
- Data versioned with `_version` field matching `DATA_VERSION` constant

## Known Tech Debt

- 6 data stores for assets/equipment/appliances should consolidate to 2
- 18 native `confirm()` calls should become `confirmModal()`
- 2,297 inline styles should extract to CSS classes
- Single file at 28K lines — module split planned

## Improvement Roadmap (Priority Order)

1. ✅ DONE — Unified document renderer (renderDocument)
2. P0 — Admin Billing tab (merge Quotes+Invoices for admin, same as customer portal)
3. P1 — Data store consolidation (6 stores → 2, DATA_VERSION 14 migration)
4. P1 — Firebase Auth migration (replace PRESET_ACCOUNTS)
5. P2 — CSS extraction (inline styles → classes)
6. P3 — Module split (single file → modules with build step)
