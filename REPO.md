# Repository Structure — samesolutionsllc-website

> **Last updated**: March 31, 2026 | **Repo**: github.com/SUGARDUNK3RTON/samesolutionsllc-website

## How This Repo Works

Everything in this repo is publicly served by **Cloudflare Pages**. When you `git push`, Cloudflare automatically deploys all files to samesolutionsllc.com within ~60 seconds.

```
You edit (VS Code) → git push → GitHub → Cloudflare auto-deploy → Live site
```

- Root files serve at `samesolutionsllc.com/`
- Files in `manage/` serve at `samesolutionsllc.com/manage/`
- **Every file is public** — don't put anything private here

## File Map

```
samesolutionsllc-website/
│
├── index.html .............. Public landing page (customer-facing)
│                             What people see at samesolutionsllc.com
│
├── CLAUDE.md ............... AI instructions for Claude Code
│                             App rules, brand standards, accounts, architecture
│                             Claude Code reads this before every task
│
├── PLANNER.md .............. Task tracker / planner
│                             View on phone via GitHub app
│                             Check off tasks by editing on GitHub
│
├── REPO.md ................. This file — repo documentation
│
└── manage/ ................. The business management PWA
    │
    ├── index.html .......... THE APP (~28,500 lines, v1.7.1)
    │                         Single-file PWA: HTML + CSS + JavaScript
    │                         All business logic, data migrations, UI
    │                         Firebase integration, customer portal
    │
    ├── sw.js ............... Service worker
    │                         Makes the app work offline (PWA feature)
    │                         Cache version MUST bump every deploy
    │                         (ss-manager-vNN, ss-static-vNN, ss-dynamic-vNN)
    │
    ├── manifest.json ....... PWA manifest
    │                         App name, icons, colors, display mode
    │                         Tells phones to treat it as installable app
    │
    ├── icon-192.png ........ App icon (192x192)
    │                         Shows on phone home screen
    │
    └── icon-512.png ........ App icon (512x512)
                              Splash screen when app launches
```

## Key Concepts

### PWA (Progressive Web App)
The app at `/manage` works like a native phone app. Three files make this happen:
- **manifest.json** — tells the browser "this is an app, here's its name and icon"
- **sw.js** — caches files so the app works offline
- **index.html** — the actual app code

### Service Worker Cache (sw.js)
The service worker caches your app files so they load fast and work offline. BUT — browsers hold onto the cache aggressively. When you update the app, you MUST bump the cache version numbers in sw.js so the browser knows to re-download. If you forget, users see the old version.

### Data Migrations (in index.html)
All app data lives in the browser's localStorage. When you add new data (customers, quotes, properties), you write a migration in the `migrateData()` function. Each migration has a version number (currently at 13). The app checks the stored version vs the code version and runs any new migrations automatically.

### Firebase (same-solutions-app)
Firebase provides optional cloud sync and authentication. The app works without it (falls back to localStorage only). Firebase config is in the code but the app is designed to work even if Firebase is unreachable.

## Deploy Checklist

Before every deploy:
1. Bump `APP_VERSION` string in index.html
2. Bump service worker cache versions in sw.js
3. Run syntax check (see CLAUDE.md for command)
4. `git add -A && git commit -m "v1.X.X description" && git push`
5. Verify: F12 → Console → `APP_VERSION` on live site

## URLs

| URL | What It Serves |
|-----|---------------|
| samesolutionsllc.com | Root index.html (public landing page) |
| samesolutionsllc.com/manage | manage/index.html (the app) |
| samesolutionsllc.com/manage/manifest.json | PWA manifest |
| samesolutionsllc.com/manage/sw.js | Service worker |

## Access

- **GitHub**: github.com/SUGARDUNK3RTON/samesolutionsllc-website
- **Cloudflare**: Linked to GitHub, auto-deploys on push
- **Firebase Console**: console.firebase.google.com (project: same-solutions-app)

## Service Worker cleanup bug (fixed v50)

**Bug**: In `sw.js`, the activate handler had `keys.filter(key => !key.includes("v44")))` — an extra closing paren shifted `Promise.all`'s close earlier, so `.map(...)` was called on a Promise instead of an array, throwing a TypeError. Cleanup never executed for any release after the `"v44"` literal was introduced.

**Consequence**: Every cache version from v44 through v49 stayed resident in users' browsers. The install handler kept adding new caches each release, but nothing was cleaning the old ones up.

**Fix**: Corrected paren placement (close `filter()`, chain `.map()`, then close `Promise.all`), and replaced the hardcoded `"v44"` literal with a `CURRENT_CACHES = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE]` constant so future cache bumps no longer need to touch the filter.

**v50 was the first activate to actually run cleanup** — users will see a one-time reclamation of v44–v49 storage on their next visit.
