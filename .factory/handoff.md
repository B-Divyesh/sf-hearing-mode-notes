# Hearing Mode Notes review 2 handoff

Date: 2026-09-05

## Review result

**Verdict: FAIL — 2 findings and 2 untested public claims.**

No product code was changed. The full report is `.factory/review-2.md`.

The reviewed runtime implementation is `e88fdaa1402039e1c10c9d3caf64b960e09cb5c7`. The documentation baseline is `34ba42eaafbe16e4654fadbb52e987c2ffa9d315`. The intervening code change at `911002c` changes only a browser-test wait and does not change the deployed product image. Fresh build hashes match the live HTML, JavaScript, CSS, service worker, and manifest.

## Findings to address

1. On a 390×844 phone, the `support@sociobot.in` link is 174.8×20 CSS px on both `/privacy` and `/terms`. Make each contact target at least 44×44 CSS px, then audit every interactive target on every public route.
2. Register and tag outcome tests for two public claim families that are missing from `.factory/claims.json`:
   - History says search works by place, mode, volume, or entered note text. The current claim and tagged test cover only note text.
   - Privacy and Settings say users can erase local notes and settings. No declared claim command covers the erase result.

Both omitted capabilities worked during live manual review. The finding is that visitors are promised more than the required repeatable claim evidence covers.

## Verified behavior

- Fresh desktop and 390 px phone contexts showed the job, hearing-aid-wearer audience, and **Try it with sample data** before scrolling.
- `/demo` and `/?demo=1` loaded three realistic records with a persistent demo label.
- A demo-only record was removed by **Reset demo**. A real record survived demo use and **Start for real**.
- Normal save and recall, blank-field validation, the 60-character place boundary, special-character handling, denied location, no-result search, delete cancellation, Undo, malformed import, wrong-product import, blocked storage, reminder fallback, downloads, custom-place removal, and erasure worked live.
- Keyboard skip, dialog focus restoration, place Arrow keys, route focus/announcement, browser Back with scroll restoration, 200% text, dark mode, reduced motion, and phone layout passed apart from the legal contact targets.
- A live axe scan found zero serious or critical violations. Live use made only same-origin requests, with no microphone or device-connection call and one location call after its button.
- Cache `hearing-mode-notes-v6` controlled the page; `/demo` reloaded offline; the worker update check completed.
- Public routes and route titles passed. All discovered links returned 200 except the deliberate missing route, which correctly returned HTTP 404 with the designed recovery page.
- The one-time checkout remains absent because no billing product is registered. No price, paid gate, checkout, or purchase promise is exposed. The free notebook is complete.

## Commands run from a clean checkout

```sh
npm ci
npm run check
npm test
npm run build
npm run test:e2e
npm audit --omit=dev
npx cap sync android
```

Results: 9/9 unit tests, 38/38 browser checks, clean build, zero production dependency vulnerabilities, and successful Capacitor sync. Every one of the 12 commands in `.factory/claims.json` was also run separately; all 24 desktop/phone runs passed.

`/opt/fleet/lib/verify-url.sh https://hearing-mode-notes.sociobot.in/demo ...` passed. Fresh live mobile Lighthouse 12.8.2 scored 98 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO, with LCP 2.0 s, TBT 140 ms, and CLS 0.

`./gradlew assembleDebug` could not run because this static review worker has no Java executable, `JAVA_HOME`, or Android SDK. The README makes no APK availability claim and defers compilation to the Android artifact work order.

## Evidence

- Repository report: `.factory/review-2.md`
- Copied report: `/work/.evidence/qa-report.md`
- Machine result: `/work/.evidence/qa-result.json`
- Live screenshots and automation summary: `/work/.evidence/review-2/`
- Lighthouse JSON: `/work/.evidence/review-2/lighthouse-mobile.json`
