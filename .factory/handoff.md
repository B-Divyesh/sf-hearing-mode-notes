# Hearing Mode Notes repair 4 handoff

Date: 2026-09-06 UTC

## Result

**PASS — 0 open findings and 0 untested public claims.**

- Implementation SHA: `2810c7061ae9623819d0fceb41509aff174b9ace`
- Previous strict-review baseline: `0f00e1152117be838a0a71ea89cef2f69400b344`
- Live product: <https://hearing-mode-notes.sociobot.in>
- The documentation commit is separate from the implementation SHA; no product source changed after the implementation commit above.

## What changed

The first offline reload is now deterministic at the service-worker boundary.

- The build writes the exact Vite JavaScript and CSS filenames into the production service worker. The worker precaches that complete shell atomically instead of discovering filenames by parsing HTML during installation.
- The worker reports whether the document, demo route, JavaScript, and CSS are all in cache. The app exposes a plain **Offline ready** status only after that acknowledgement.
- The outcome-based offline claim waits for that visible ready condition, takes its own browser context offline immediately, reloads the demo, and checks the real sample screen and its persistent demo label.
- The demo instructions and copy audit record the new readiness state. The catalog description remains verb-first, 68 bytes, and is copied to `/work/.evidence/catalog-description.txt`.

No product scope changed. Notes remain local-first; the app does not control hearing aids, use the microphone, or provide medical advice.

## First screen

- Job: remember hearing-aid settings by place.
- Audience: hearing-aid wearers who need a private record of which setup worked in each place.
- First action: **Try it with sample data**. It loads three realistic sample notes.

Fresh 1440×900 desktop and 390×844 phone sessions showed all three before scrolling. The live screenshots are in `/work/.evidence/hearing-mode-notes-repair-4/live/`.

## Verification

All commands below ran from a separate clean worktree at the implementation SHA after `npm ci`:

| Check | Result |
| --- | --- |
| `npm run check` | PASS |
| `npm test` | PASS — 9/9 unit tests |
| `npm run build` | PASS — production `dist/` generated |
| `npm run test:e2e` | PASS — 40/40 desktop and 390 px phone browser checks |
| All 13 commands in `.factory/claims.json`, run separately | PASS — 26/26 project runs |
| Phone `@claim:offline-reload --repeat-each=10` | PASS — 10/10 fresh first-activation offline reloads |
| `npm audit --omit=dev` | PASS — 0 production vulnerabilities |
| `npx cap sync android` | PASS — web assets and Android plugins synchronized |

The clean command setup also confirmed the generated worker contains the exact hashed JavaScript and CSS filenames. The full local repeat across desktop and phone was 20/20.

## Live verification

- Deployed the static `dist/` with the product’s existing Static Web Apps configuration. Live `sw.js`, index JavaScript, CSS, generated route shells, manifest, and icon match the implementation build byte-for-byte.
- Ten fresh HTTPS phone contexts waited for **Offline ready**, went offline immediately, reloaded `/demo`, and all showed the Restaurant setup and persistent Demo label: **10/10 passed** with no console errors.
- The one-click demo showed three populated notes and its persistent label. Adding a temporary fourth sample, resetting, and returning to real mode left the separate real Home note intact.
- `verify-url.sh` passed on live `/demo`: 200 response, route title, `lang`, one `h1`, one `main`, complete image alternatives, labelled buttons, and no load errors.
- Fresh live axe scans found 0 violations on desktop light and phone dark/reduced-motion contexts.
- All six normal public routes returned 200 with route-specific titles, one `h1`, and one `main`. An unknown route returned the designed page with HTTP 404; this expected 404 is not a defect.
- Privacy request recording during the demo found only `hearing-mode-notes.sociobot.in`; no third-party request or console error appeared. The service worker remained activated after `registration.update()`.
- Live mobile Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 2.0 s, TBT 0 ms, CLS 0, transfer 225 KiB. Report: `/work/.evidence/hearing-mode-notes-repair-4/lighthouse-mobile.json`.

## Earlier findings

All earlier issues remain resolved: worker installation and deployment identity; skip-link focus; performance; isolated demo and claim coverage; malformed import recovery; dialog focus and place-tab keys; 44 px touch targets; response headers and cache policy; Android location permissions; direct routes, metadata, sitemap, and designed 404; landing copy and structure; four-field search coverage; and persistent local-data erasure.

R3-01 is now resolved by the atomic cache manifest and explicit offline-ready acknowledgement described above.

## Known limitations

- The researched one-time purchase remains an external billing-registration dependency. No price, checkout, paid gate, or purchase promise is public; the complete free local notebook remains available.
- This worker has no Java/Android SDK, so `assembleDebug` was not run. Capacitor sync succeeds and the public product makes no APK download or installed-artifact claim.
