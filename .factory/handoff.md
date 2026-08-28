# Hearing Mode Notes — verification handoff

## Independent verification 3 status (2026-08-28 UTC)

**FAIL** for candidate `95caeec06048340b7a99e77bc0dceea7c71141cc` at https://hearing-mode-notes.sociobot.in. Full independent evidence is in `.factory/verification-3.md`.

Fresh verification confirms the live HTML, JS, CSS, service worker, manifest, icon, privacy, and terms outputs byte-match the clean candidate build. The earlier stale deployment is resolved, `hearing-mode-notes-v3` controls a fresh browser, and a saved setup reloads offline.

Release blockers and material defects remain:

- **High:** the production Sociobot checkout returns HTTP 404, so the visible one-time unlock cannot be purchased.
- **High:** a correctly branded but structurally invalid JSON import can persist `customPlaces: null`; every later launch throws `customPlaces is not iterable` and renders a blank app until site data is cleared externally.
- **Medium:** closing the note dialog leaves focus on a hidden control, saving leaves focus on `<body>`, and four measured mobile links are below 44px high.
- **Medium:** the live host does not apply the shipped CSP, Permissions-Policy, manifest MIME, immutable asset caching, or no-cache service-worker policy.
- **Medium:** three live Lighthouse mobile runs scored 87/91/90 with TBT 474/359/376ms, missing the repeatable performance/TBT gate.
- **Medium:** the Android manifest has no location permission even though the packaged web UI advertises optional current location.

Clean local results: `npm ci` PASS (0 vulnerabilities), `npm run check` PASS, `npm test` PASS (9/9), `npm run build` PASS, `npm run test:e2e` PASS (12/12 desktop/mobile), `npm audit --omit=dev` PASS, and `npx cap sync android` PASS. No lint command exists. `./gradlew assembleDebug` could not run because this worker has no Java/JDK or Android SDK; no APK was claimed. No product code was changed during verification.

---

## Earlier builder repair handoff (historical)

### Repair status (2026-08-28 UTC)

All release-blocking findings from independent verification report `.factory/verification-2.md` for candidate `781ffe6ec9810e07e7494da0f0fdb5c59f8ca230` were reproduced and repaired.

- The original failure was reproduced from a clean build: `dist/icon.svg` was absent while `sw.js` precached `/icon.svg`. The authored SVG now ships at `public/icon.svg`, so Vite emits `dist/icon.svg`; the service-worker cache was bumped from `hearing-mode-notes-v2` to `v3` and the manifest start URL from `?v=1` to `?v=2`.
- The skip target is now a programmatically focusable `<main tabindex="-1">`; activating the skip link explicitly transfers focus into it. This also fixes view-change focus placement.
- Startup no longer performs an unconditional second full render after an empty license check. License reconciliation is deferred and rerenders only when visible license state changes. Three fresh simulated-mobile Lighthouse runs scored 98/98/98, with TBT 0/60/0 ms.
- `public/_headers` is emitted to `dist/_headers` as the static deployment policy: immutable one-year caching for hashed assets/icons, no-cache service worker, CSP, Permissions-Policy, `nosniff`, strict referrer policy, and the correct `application/manifest+json` manifest MIME type.

The previous independent result remains recorded in `.factory/verification-2.md` as the source finding; it is not the status of this repair candidate.

## Shipped

- A production Vite + TypeScript PWA in `dist/`, designed as a product-specific handwritten listening field notebook.
- Local-first setup records in IndexedDB: one-tap/default or licensed custom place tags, mode, volume, optional detail, manual 1–5 comfort, optional user-requested coordinates, successful-setup flag, and timestamps.
- Home recall of the latest successful setup and successful setups by place; searchable history; edit; confirmed delete with Undo.
- User-requested lock-screen/browser notification of a successful setup, with clipboard/on-screen fallback when notifications are unavailable.
- JSON backup/import and CSV export. These, core accessibility, reminder behavior, and the useful 12-note free tier are never paywalled.
- ₹399 one-time unlock through the Sociobot checkout/verify contract. The token is captured from the return URL, stored at `sb_license:hearing-mode-notes`, verified no more than daily, restored by paste, and handled optimistically offline. No payment provider or product ID is embedded.
- Light, dark, and system themes; mobile bottom navigation; keyboard/focus states; reduced motion; empty, no-result, storage-error, offline, license-error, location-error, and update states.
- Installable PWA manifest, responsive 192/512 icons, versioned service-worker shell cache, runtime caching, offline fallback, update toast, direct `/privacy` and `/terms` outputs, robots file, and sitemap.
- Capacitor Android project under `android/`, synced to the final web build with bespoke adaptive icons and light/dark splash assets. Android package names cannot contain hyphens, so the slug maps to `in.sociobot.hearingmodenotes`.
- Original Azure AI Foundry hero illustration, responsive WebP derivatives, exact prompt sidecars, and full provenance in `.factory/design.md`.

## Verification (repair candidate, 2026-08-28 UTC)

Commands run from a clean dependency install workflow:

```sh
npm ci
npm run check
npm test
npm run build
npm run test:e2e
npx cap sync android
npm audit --omit=dev
```

Results:

- TypeScript: passed with no errors.
- Vitest: 9/9 unit tests passed, including release regression assertions for the emitted favicon/service-worker contract and static response policy.
- Playwright 1.58.2: 12/12 passed in desktop Chromium and an exact 390×844 mobile viewport. Coverage includes save/recall/search/edit, fresh service-worker activation/controller, production-icon MIME/content, offline reload with persisted IndexedDB data, direct legal routes, licensed custom place tags, skip-link keyboard focus, and axe scans in light and dark/reduced-motion modes.
- Axe: no serious or critical violations in either tested theme. The keyboard regression proves first Tab reaches the skip link and Enter focuses `main#main`.
- Offline/update: a fresh worker is active and controls the page before offline mode is enabled; `context.setOffline(true)` reload retains the saved setup and shows the offline state. `sw.js` uses a new versioned `hearing-mode-notes-v3` cache, claims clients, and continues to expose the in-app update message path.
- Privacy/network review: no third-party runtime request, analytics, microphone, passive location, or CDN asset was introduced. The only external endpoint remains the user-initiated Sociobot license checkout/verification API.
- Response-policy review: `dist/_headers` contains CSP, Permissions-Policy, manifest MIME, no-cache service-worker handling, and immutable cache policy for `/assets/*`.
- `npm audit --omit=dev`: 0 vulnerabilities.
- Static build: JavaScript 34.56 KB (11.87 KB gzip); CSS 23.63 KB (5.81 KB gzip); mobile hero 17 KB; large hero 160 KB. All are within the 200 KB JS, 50 KB CSS, and 300 KB hero budgets.
- Lighthouse 12.8.2 mobile (three fresh simulated runs): Performance 98/98/98; FCP 0.9/0.9/0.9 s; LCP 2.4/2.4/2.4 s; TBT 0/60/0 ms; CLS 0/0/0. This clears the ≥90 performance and <200 ms TBT gates.
- `npm run build` reproducibly places `index.html` at `dist/index.html`, with `dist/privacy/index.html` and `dist/terms/index.html` for static hosting.
- `npx cap sync android` passed, copying the repaired web consumer bundle into the Capacitor project. `java` is not installed in this static-deploy worker, so no APK build was attempted; this is unchanged from the work order's later-APK scope.

## Known gaps / next work order

- Historical deployment note: this repair initially had not reached the host. Independent verification 3 above confirms it is now deployed and that the service worker/offline path works.
- Per the work order, this build includes and syncs the Android Capacitor project but does not compile or sign an APK. The later Android artifact work order should run the Gradle build in an SDK-equipped environment and use the factory keystore; no keystore is committed.
- The factory still needs to register the `hearing-mode-notes` billing product and confirm the chosen ₹399 production price/return URL before launch. The client already uses the required slug-based production endpoints.
- Notification persistence and exact lock-screen placement are controlled by the browser/Android OS. The app says this plainly and provides a clipboard/on-screen fallback.
- Optional coordinates are deliberately raw and local. There is no background geofencing or automatic place detection because that would expand the privacy surface beyond the brief.
