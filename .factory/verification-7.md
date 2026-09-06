# Remember hearing-aid settings by place — verification 7

**Verdict: PASS — 0 findings and 0 untested public claims.**

- Findings: **0** (0 high, 0 medium, 0 low)
- Untested public claims: **0**
- Implementation candidate: `ef91743fc8ea78836c9d62ee303311708808a19f`
- Documentation baseline: `d59473e23ea73df96d4e6c277cadac3c3b2e8b41`
- Live URL: <https://hearing-mode-notes.sociobot.in>
- Verified: 2026-09-06 UTC

The product passes independent verification for its real job: letting hearing-aid wearers quickly retrieve a private record of the listening setup that worked at a place.

## First screen before scrolling

- **Job:** remember hearing-aid settings by place.
- **Audience:** hearing-aid wearers who need a private record of which setup worked in each place.
- **First action:** **Try it with sample data**. It loads three sample notes.

Fresh desktop and phone contexts passed. At 1440×900, the job, audience, action, and three facts ended at 667.78 px. At 390×844, they ended at 752.80 px, above the fixed navigation at 775 px. The page starts at scroll position zero. The wording is direct and product-specific.

## Candidate and live identity

A clean clone started at documentation baseline `d59473e`; the product implementation is `ef91743`, with the later commit changing only documentation. A clean build byte-matched the live `index.html`, hashed JavaScript and CSS, service worker, manifest, icon, and generated `/demo`, `/history`, `/settings`, `/privacy`, `/terms`, and `/404.html` shells. The live runtime is therefore the reviewed candidate, not a stale deployment.

## Claims and clean-checkout gates

`npm ci` installed documented prerequisites in the clean clone. All declared commands completed successfully.

| Check | Result |
| --- | --- |
| `npm run check` | PASS — no TypeScript errors. |
| `npm test` | PASS — 9/9 unit tests. |
| `npm run build` | PASS — `dist/` produced. |
| `npm run test:e2e` | PASS — 44/44 browser tests. |
| 13 commands in `.factory/claims.json`, separately | PASS — 26/26 desktop/phone runs. |
| `npm audit --omit=dev` | PASS — 0 production vulnerabilities. |
| `npx cap sync android` | PASS. |

All 13 public claims have exactly one tagged test and passed: sample sandbox, latest-setup recall, four-field search, JSON/CSV export, import, offline reload, local/private notes, optional location, no device control, theme choice, custom tabs, reminder fallback, and data erasure. Landing, app, legal, README, manifest, and copy-audit text did not expose an additional unlisted claim.

The clean build contains 36,246 B JavaScript (12,100 B gzip), 26,236 B CSS (6,310 B gzip), no fonts, and a 17,060 B phone hero; all static budgets pass.

## Live product exercises

- **Sample sandbox:** a fresh phone used the landing action and got the persistent `Demo — sample data` label, Restaurant as the latest setup, and three realistic Restaurant, Commute, and Work records. A fourth demo-only note appeared; **Reset demo** restored three. **Start for real** retained the one real verification note and no demo note.
- **Search:** at 390 px, `Noise reduction` returned only Commute. The document width was exactly 390 px and input text began 12 px after the icon.
- **Normal, invalid, boundary, and recovery:** the 44-test suite passed save/recall, required-field handling, the 60-character place boundary, denied-location recovery, delete/cancel/Undo, imports and exports, theme/place settings, reminder fallback, empty state, and persistent erasure in desktop and phone projects. A live malformed branded import was rejected with `This file is not a supported Hearing Mode Notes export.` and Settings remained usable after reload.
- **Keyboard:** live ArrowRight moved Home to Work, Escape restored the opener, and a saved setup focused `main#main` after rendering. Skip link, route focus, and Back/scroll are browser-tested.
- **Privacy:** live instrumentation observed 0 microphone calls, 0 device-connection calls, and 0 third-party requests during the demo flow. Optional location is exercised only after its named button.
- **Offline/update:** 10/10 fresh 390×844 contexts waited for `Offline ready`, went offline immediately, reloaded `/demo`, and showed Restaurant and the demo label. Runtime/browser coverage confirms active worker control and update registration.
- **Routes/links:** `/`, `/demo`, `/history`, `/settings`, `/privacy`, `/terms`, and `/404.html` returned 200 with one `h1`, one `main`, and route titles. The 390 px all-route audit found no visible target below 44×44 CSS px. An unknown route returned the designed recovery screen with HTTP 404; this deliberate 404 is expected. `robots.txt`, `sitemap.xml`, and the public Source link returned 200; support is `mailto:`.

## Accessibility, policy, and performance

`verify-url.sh` passed on live `/demo`: 200, title, `lang=en`, one `h1`, `main`, image alternatives, labelled buttons, and no load-console errors. Independent live Axe scans found **0 violations** in desktop light and phone dark/reduced-motion contexts. Live responses have CSP, Permissions-Policy, HSTS, `nosniff`, strict referrer policy, correct manifest MIME, immutable hashed-asset caching, and `no-cache` for `sw.js`.

Fresh Lighthouse mobile evidence recorded Performance **99**, Accessibility **100**, FCP **1.0 s**, LCP **2.0 s**, TBT **30 ms**, and CLS **0**. Its wrapper crashed a tab after writing JSON; the resulting Best Practices/SEO diagnostics were not treated as product evidence because they report the wrapper console error and a robots fetch that direct HTTP checking confirmed as 200.

## Earlier finding disposition

Every finding from reviews 1–4 and verifications 2–6 is closed and independently rechecked.

| Earlier issue | Disposition |
| --- | --- |
| Missing worker icon, failed offline install, stale deployment, first-ready offline flake | Resolved: candidate bytes match live; 10/10 immediate fresh-phone offline reloads pass. |
| Skip link, dialog/save focus, and place-tab Arrow keys | Resolved: live keyboard checks pass. |
| Mobile performance/TBT | Resolved: fresh Performance 99, TBT 30 ms. |
| Missing demo sandbox and documentation | Resolved: one-click sample, three notes, persistent label, reset, Start for real, and isolation pass. |
| Missing claims contract; incomplete search/erasure coverage | Resolved: 13 one-test-per-claim commands all pass separately. |
| Broken paid checkout | Resolved honestly: no public price, checkout, paid gate, or purchase promise while billing registration is pending. |
| Malformed import blanked the app | Resolved: live malformed input is rejected and reload is usable. |
| Undersized brand/footer/legal links | Resolved: all-route phone target audit passes. |
| Missing live headers, MIME, and cache policy | Resolved: all required deployed policies pass. |
| Missing Android location permissions | Resolved in source: coarse/fine location declared; microphone permission absent. |
| Routes, metadata, sitemap, and 404 gaps | Resolved: direct routes, metadata, links, sitemap, and deliberate 404 pass. |
| Landing audience, structure, and copy-audit gaps | Resolved: job, audience, action, facts, sections, footer, and audit are present. |
| Review 4 first-screen facts below viewport | Resolved: verified desktop/phone geometry is within usable bounds. |
| Review 4 phone History overflow/icon overlap | Resolved: 390 px width and 12 px gap pass live. |

No earlier major, medium, or minor finding remains open.

## Scope limits

This is a static, local-first PWA; backend tenant isolation, restart persistence, health, and 429/Retry-After checks do not apply. It is not a CLI, library, or desktop artifact. An AI feature would conflict with the private local-memory job.

`./gradlew assembleDebug` is unavailable in this worker because Java/Android SDK are absent. README explicitly defers APK production and makes no APK or installed-artifact claim, so this is not a finding or untested claim. Billing registration remains an external dependency with no public offer until available.
