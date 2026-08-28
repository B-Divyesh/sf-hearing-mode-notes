# Hearing Mode Notes — build handoff

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

## Verification (2026-08-28 UTC)

Commands run from a clean dependency install workflow:

```sh
npm run check
npm test
npm run build
npm run test:e2e
npx cap sync android
npm audit --omit=dev
```

Results:

- TypeScript: passed with no errors.
- Vitest: 7/7 unit tests passed.
- Playwright 1.58.2, Pixel 5 project: 5/5 passed. Coverage includes save/recall/search/edit, local persistence through an explicitly offline reload, direct legal routes, licensed custom place tags, and axe scans in light and dark/reduced-motion modes.
- Axe: no serious or critical violations in either tested theme.
- Factory URL verifier: HTTP 200; no console errors; title and `lang` present; exactly one `h1`; main landmark present; 0 missing image alts; 0 unlabeled buttons.
- `npm audit --omit=dev`: 0 vulnerabilities.
- Static build: JavaScript 34.10 KB (11.74 KB gzip); CSS 23.63 KB (5.81 KB gzip); mobile hero 20 KB; large hero 160 KB. All are within the 200 KB JS, 50 KB CSS, and 300 KB hero budgets.
- Lighthouse 12.8.2 mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100. FCP 0.9 s, LCP 2.1 s, TBT 20 ms, CLS 0, Speed Index 0.9 s.
- `npm run build` reproducibly places `index.html` at `dist/index.html`, with `dist/privacy/index.html` and `dist/terms/index.html` for static hosting.

## Known gaps / next work order

- Per the work order, this build includes and syncs the Android Capacitor project but does not compile or sign an APK. The later Android artifact work order should run the Gradle build in an SDK-equipped environment and use the factory keystore; no keystore is committed.
- The factory still needs to register the `hearing-mode-notes` billing product and confirm the chosen ₹399 production price/return URL before launch. The client already uses the required slug-based production endpoints.
- Notification persistence and exact lock-screen placement are controlled by the browser/Android OS. The app says this plainly and provides a clipboard/on-screen fallback.
- Optional coordinates are deliberately raw and local. There is no background geofencing or automatic place detection because that would expand the privacy surface beyond the brief.
