# Hearing Mode Notes repair 5 handoff

Date: 2026-09-06 UTC

## Result

The two review 4 findings are resolved. No known product defect remains.

- Live product: <https://hearing-mode-notes.sociobot.in>
- Implementation SHA: `ef91743fc8ea78836c9d62ee303311708808a19f`
- Deployment: the clean build from that SHA was deployed successfully to the existing `sf-hearing-mode-notes` Static Web App.
- Live identity: the HTML, hashed JavaScript and CSS, service worker, manifest, icon, and generated route shells match that clean build byte for byte.

## Changes

- Corrected the hero image sizing so its HTML height no longer stretches the desktop first screen.
- Reduced the heading to the documented 48 px display scale.
- Made the phone header and notebook image compact enough to keep all three facts above the fixed navigation.
- Restored the search input's intended left inset by fixing the form-style cascade.
- Aligned the 390 px History panel with the viewport, removing its 4 px horizontal overflow.
- Suppressed the update toast on a first service-worker install so it cannot cover first-screen facts. Returning controlled pages still receive update notices.
- Advanced the offline cache to `hearing-mode-notes-v9`.
- Added outcome-based browser checks for first-screen geometry and History search geometry. They measure rendered positions, overflow, text/icon clearance, and a real filtered result.

## Finding disposition

### Review 4

- **R4-01 resolved:** at 1440×900, the final fact ends at 661.78 px. At 390×844, it ends at 747.17 px, 27.83 px above the fixed navigation at 775 px. The job, audience, sample action, and facts are visible at scroll position zero.
- **R4-02 resolved:** at 390 px, the History panel spans exactly 0–390 px, document width is exactly 390 px, and typed search text begins 12 px after the icon. Searching `Noise reduction` returns only the Commute note.

### Earlier reviews and verifications

- Service-worker installation, first-visit offline reload, and stale deployment: resolved; 10/10 fresh live phone contexts reloaded `/demo` offline using cache v9.
- Skip-link focus, route focus, dialog focus, place-tab arrows, reduced motion, and undersized targets: remain covered by the 44-run browser suite; Axe has no live violations.
- Missing sample sandbox and claims manifest: remain resolved; live sample entry, three seeded notes, persistent label, reset, and real-data isolation pass. All 13 claim commands pass separately.
- Broken checkout: remains resolved honestly. No price, checkout, paid gate, or purchase promise is public while registration is unavailable.
- Malformed import corruption: remains resolved; invalid data is rejected before a write and recovery is browser-tested.
- Response headers, MIME types, and cache policy: remain correct live, including CSP, Permissions-Policy, immutable hashed assets, manifest MIME, and `no-cache` for `sw.js`.
- Android location permissions: remain present; microphone permission remains absent.
- Direct routes, metadata, sitemap, and 404: remain correct. The unknown-route HTTP 404 is deliberate and shows the designed recovery page.
- Landing structure, plain copy, search coverage, and persistent data erasure: remain complete and covered by tests.

## Verification

A detached clean checkout at the implementation SHA was used for all repository gates:

~~~sh
npm ci
npm run check
npm test
npm run build
npm run test:e2e
npm audit --omit=dev
npx cap sync android
~~~

Results:

- TypeScript: pass.
- Unit tests: 9/9 pass.
- Browser tests: 44/44 pass across desktop Chromium and 390×844 phone projects.
- Public claims: all 13 commands from `.factory/claims.json` pass separately, 26/26 project runs.
- Production audit: 0 vulnerabilities.
- Capacitor sync: pass.
- Live URL verifier: pass; correct title, `lang=en`, one `h1`, one `main`, image alternatives, labelled buttons, and no console errors.
- Live Axe scans: zero violations on desktop light and phone dark/reduced-motion contexts.
- Live cold sample flow: three notes → four after a demo-only note → three after reset; the separate real note remained unchanged on desktop and phone.
- Live route checks: `/`, `/demo`, `/history`, `/settings`, `/privacy`, and `/terms` return 200; an unknown route returns the expected 404.

Fresh live mobile Lighthouse:

- Performance 98, Accessibility 100, Best Practices 100, SEO 100.
- FCP 1.0 s, LCP 2.0 s, TBT 150 ms, CLS 0.
- Transfer 225 KiB. Build output is 36,246 bytes JavaScript, 26,236 bytes CSS, no fonts, and a 17,060-byte phone hero image.

Evidence is under `/work/.evidence/repair-5/`.

## Known external limits

- One-time billing registration remains an external operator dependency. There is no current public offer, so no billing-offer metadata was written.
- This worker has no Java executable or Android SDK. The Capacitor project is synchronized, but APK compilation remains assigned to a later Android artifact work order. The product makes no APK download claim.
