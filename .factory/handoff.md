# Hearing Mode Notes verification 4 handoff

Date: 2026-09-05

## Independent verification 4

**Verdict: PASS — 0 findings and 0 untested public claims.**

Verification 4 independently opened the live product in fresh desktop and 390 px phone contexts, exercised the one-click sample, proved reset and real-data isolation, checked normal and recovery paths, tested keyboard and reduced-motion behavior, reloaded the controlled app offline, inspected routes and a deliberate HTTP 404, and audited privacy requests. All twelve declared claim commands passed separately in both browser projects. The full browser suite passed 38/38.

The clean build byte-matches the live HTML, JavaScript, CSS, service worker, and manifest. Fresh live Lighthouse scored 99 performance and 100 accessibility. CSP, Permissions-Policy, manifest MIME, immutable asset caching, no-cache service-worker handling, legal routes, and the designed 404 all pass live.

The complete report is `.factory/verification-4.md`. Evidence is copied to `/work/.evidence/qa-report.md`, with the machine result at `/work/.evidence/qa-result.json`.

## Product and first screen

Job: remember which hearing-aid listening setup worked in a particular place.

Audience: hearing-aid wearers who need a quick private record of place-specific settings.

First action: **Try it with sample data**. It opens `/demo`, immediately shows three realistic saved setups, and explains that the sample is separate from the person's notebook.

## Implementation

Deployed implementation commit: `e88fdaa1402039e1c10c9d3caf64b960e09cb5c7`

Later verification-only commit: `911002c878e6e493a370aa1e7f380a99e004a28b` (it makes the offline browser check wait for the cached document; it does not change the deployed product image).

This repair adds an isolated one-click demo, outcome-based public-claim tests, strict import validation, recovery from malformed local records, accessible dialog and route focus handling, direct static routes with route metadata, a real 404 response page, a deployed-header configuration, and a completed local-first PWA path.

- `/demo` and `/?demo=1` use IndexedDB database `demo:hearing-mode-notes`; real notes use `hearing-mode-notes`.
- The persistent demo banner offers **Reset demo** and **Start for real**. Reset only reseeds the demo database; leaving demo clears only that database.
- The sample contains Restaurant, Commute, and Work records. It has no access to real notes.
- Imports are fully validated before one atomic transaction. Invalid files cannot replace valid data; malformed stored records are ignored during recovery.
- The app has route-specific static and dynamic titles, descriptions, canonicals, social metadata, sitemap entries, a designed 404, security headers, and direct route HTML for crawler-safe deep links.
- The unavailable paid checkout was removed rather than represented by a broken link. The free product remains complete.

The catalog description is in `.factory/catalog-description.txt` and has been copied to `/work/.evidence/catalog-description.txt`.

## Earlier review disposition

| Review finding | Current disposition |
| --- | --- |
| No tryable sample and no isolated demo | Fixed with `/demo`, three seeded records, persistent label, reset, start-for-real, and separate IndexedDB namespaces. |
| No claims manifest or independently runnable proof | Fixed with 12 public claims in `.factory/claims.json`; each has one tagged browser outcome check. |
| Broken external checkout | Fixed honestly by removing the purchase UI and price promise. Sociobot billing registration is a named external dependency below. |
| Corrupt import could blank the app | Fixed with schema validation, an atomic write transaction, malformed-record filtering, and unit/browser recovery checks. |
| Dialog focus and place-tag arrow keys | Fixed with trigger restoration, post-save focus, Escape handling, Home/End/arrow movement, and an outcome test. |
| Small branded/footer phone targets | Fixed at 44 px minimum and checked on the 390 px project. |
| Required headers/config did not match the deployed host | Fixed with `staticwebapp.config.json`, copied to `dist/`, including CSP, Permissions-Policy, Referrer-Policy, MIME/cache rules, and a response-level 404 override. |
| Android location permission missing | Fixed with coarse and fine location declarations only; no microphone permission is declared. |
| Missing direct routes, titles, metadata, sitemap, and designed 404 | Fixed with generated route files, per-route metadata, `sitemap.xml`, `robots.txt`, social card, and a true HTTP 404 configuration. |
| Landing content, plain language, and audit incomplete | Fixed with a job-named headline, audience sentence, first action, three facts, and `.factory/copy-audit.md`. |

## Verification

Clean dependency install was run with `npm ci`. Final checks:

```sh
npm run check              # pass
npm test                   # 9 passing unit tests
npm run build              # pass; writes dist/
npm run test:e2e           # 38 passing checks, desktop and 390 px phone
npx cap sync android       # pass
npm audit --omit=dev       # 0 vulnerabilities
```

Every command listed in `.factory/claims.json` was also executed separately after the clean install; all 12 passed in both browser projects. The suite uses a fresh browser context for the offline reload claim and confirms the service worker controls `/demo` before going offline.

The browser suite additionally covers malformed import recovery, keyboard/dialog focus, tag arrows, dark and reduced-motion axe scans with no serious or critical violations, phone target sizes, route titles, designed 404 rendering, a real upstream 404 after service-worker control, and route focus/announcement.

`/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/demo /work/.evidence/verify-local` passed: 200, title, `lang`, one h1, main landmark, no missing image alt text, no unlabeled buttons, and no console errors. Axe is integrated in Playwright because the container has no standalone chromedriver.

Mobile Lighthouse on `/demo`, using the worker's Chromium headless shell, scored Performance 99, Accessibility 100, Best Practices 100, SEO 100. It measured LCP 2.1 s, CLS 0, TBT 0 ms, and 218 KiB total transfer. The report is `/work/.evidence/lighthouse-mobile-final.json`.

`./gradlew assembleDebug` was attempted. It cannot run in this static-deploy worker because no Java/JDK is installed (`JAVA_HOME` and `java` are absent). The Capacitor project and synced web bundle are present; this product makes no APK download claim.

## Assets and privacy

The social card is a 1200×630 WebP derivative of an original Azure AI Foundry notebook still life. Prompt, date, generator, and review constraints are in `assets/src/notebook-social-source.json` and `.factory/design.md`. It contains no people, brands, readable text, medical symbol, or device-control implication.

There are no analytics, CDNs, third-party scripts, microphone access, background location access, or backend data store. Location is requested only after the person presses the contextual button. The app does not connect to or control hearing devices.

## Deployment and live verification

The implementation image `e88fdaa1402039e1c10c9d3caf64b960e09cb5c7` was pushed and deployed successfully with the durable static deployment configuration. The product remains a one-replica static app and uses no backend or volume.

Cold HTTPS checks passed after deployment:

- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown route returns HTTP 404 and renders the designed not-found page.
- `/manifest.webmanifest` returns `application/manifest+json`; `/sw.js` returns `text/javascript` with `Cache-Control: no-cache`.
- The live response has HTTPS/HSTS, CSP, `X-Content-Type-Options`, Referrer-Policy, and the intended Permissions-Policy. No console errors or warnings were observed on fresh desktop or 390 px phone loads.
- `verify-url.sh` passed against `https://hearing-mode-notes.sociobot.in/demo`: 200, route title, `lang`, one h1, main, complete image alt text, labeled controls, and no console errors.
- Fresh desktop and phone contexts inspected the first screen before scrolling. Both showed the job heading, hearing-aid-wearer audience sentence, and **Try it with sample data** first action. The sample banner remained visible and History contained three realistic notes.
- On desktop, a real note was created, demo was opened, **Reset demo** restored exactly three sample notes, and **Start for real** retained the real note. The demo never changed real IndexedDB data.
- A fresh service-worker context reloaded `/demo` offline with the sample visible. A separate worker-controlled context navigated to an unknown live URL and received HTTP 404 with the not-found page.
- Live axe scans on demo desktop and phone found zero serious or critical violations.

## Known dependency

The researched brief describes an eventual one-time purchase, but no Sociobot billing product is registered for this product in the provided scope. There is deliberately no broken checkout, mock payment, price, or paid gate. If a later work order registers it, use the Sociobot billing API/hosted checkout contract and keep export, privacy, and core notes free.
