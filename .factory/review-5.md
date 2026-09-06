# Remember hearing-aid settings by place — review 5

**Verdict: PASS — 0 findings and 0 untested public claims.**

- Findings: **0** (0 high, 0 medium, 0 low)
- Untested public claims: **0**
- Implementation candidate: `ef91743fc8ea78836c9d62ee303311708808a19f`
- Documentation baseline: `603dec4986931e7db81996c94d2a6dc16a7a5be9`
- Live URL: <https://hearing-mode-notes.sociobot.in>
- Reviewed: 2026-09-06 UTC
- Work order: `hearing-mode-notes-review-5`

The product passes the fresh strict review for its real job: helping hearing-aid wearers privately remember which listening setup worked at a place.

## First screen before scrolling

- **Job:** remember hearing-aid settings by place.
- **Audience:** hearing-aid wearers who need a private record of which setup worked in each place.
- **First action:** **Try it with sample data**. The adjacent text says it loads three sample notes.

Fresh 1440×900 desktop and 390×844 phone contexts started at scroll position zero. Both showed the job, audience, sample action, and all three facts before scrolling. The final desktop item ended at 667.42 px in a 900 px viewport. The final phone item ended at 752.04 px, above the fixed navigation at 775 px. The title names the job, and the copy uses plain words without metaphor or mood headings.

## Candidate and live identity

The clean review clone started at documentation commit `603dec4`. The latest product implementation is `ef91743`; the later `d59473e` and `603dec4` commits change only factory documentation.

A clean build byte-matched the live home shell, hashed JavaScript and CSS, service worker, manifest, icon, and generated Demo, History, Settings, Privacy, Terms, and 404 shells. The live runtime is the reviewed implementation candidate.

## Findings and public claims

There are no findings.

All 13 entries in `.factory/claims.json` have exactly one matching `@claim:<id>` test. Every declared command passed separately in both browser projects: sample isolation, latest successful setup, four-field search, JSON/CSV export, JSON import, offline reload, local privacy, optional location, no device control, appearance choice, custom place tabs, reminder fallback, and data erasure.

Landing, app, metadata, manifest, legal, README, catalog, and copy-audit wording were checked for additional claim-like statements. Each is covered by the declared claim family and observable test evidence. **Untested claim count: 0.**

## Clean-checkout gates

A fresh clone at `603dec4` was clean before and after verification. Documented prerequisites were installed before runtime tests.

| Command or check | Result |
| --- | --- |
| `npm ci` | PASS — 149 packages installed; 0 vulnerabilities. |
| `npm run dev -- --host 127.0.0.1` plus HTTP probe | PASS — Vite started and `/` returned 200. |
| `npm run check` | PASS — no TypeScript errors. |
| `npm test` | PASS — 9/9 unit tests. |
| `npm run build` | PASS — production `dist/` generated. |
| `npm run test:e2e` | PASS — 44/44 desktop and 390 px phone tests. |
| All 13 claim commands, separately | PASS — 26/26 browser-project runs. |
| `npm audit --omit=dev` | PASS — 0 production vulnerabilities. |
| `npx cap sync android` | PASS — web assets and Android plugins synchronized. |
| `/opt/fleet/lib/verify-url.sh <live-demo>` | PASS — 200, title, `lang`, one `h1`, `main`, image alternatives, labels, and no load errors. |

The build contains 36,246 B JavaScript (12,100 B gzip), 26,236 B CSS (6,310 B gzip), no fonts, and a 17,060 B phone hero image. All static budgets pass.

## Live sample and product paths

- A fresh phone saved a real Home / Everyday / Level 2 setup, then entered the sample from the landing action.
- The persistent **Demo — sample data** label stated that nothing is saved to the notebook.
- The first sample output showed Restaurant / Conversation / Level 3 and comfort 4. History contained three realistic Restaurant, Commute, and Work notes.
- A fourth demo-only note was added. **Reset demo** removed it and restored the original three notes.
- **Start for real** returned to the one real note. No sample or demo-only note appeared in real History.
- Search returned the correct single record for place, mode, volume, and note text.
- Live JSON contained three notes. Live CSV contained the expected header and three data rows. A valid Library backup imported and rendered.
- Empty Home and History states gave a next action. A blocked-storage launch showed a specific recovery screen and **Try again**.
- Blank required input focused Place and exposed the browser validation message. Place input stopped at 60 characters. Denied location explained that the note could still be saved.
- A malformed branded import was rejected as unsupported; Settings remained usable after reload.
- Delete cancellation kept the note. Confirmed delete offered Undo, which restored all three sample notes.
- Notification-unavailable fallback displayed the saved Restaurant setup. Light, dark, and system appearance plus a reusable Library tab worked.
- The installed-app shortcut URL `/?new=1` opened the new-setup dialog.

All live exercises used fresh temporary contexts. No existing browser profile or real user data was opened or changed.

## Accessibility, privacy, offline, and site structure

- Independent live Axe scans found 0 violations in desktop light and phone dark/reduced-motion contexts. Reduced motion computed to `0.01ms`; no loop or flash exists.
- Keyboard checks passed skip navigation, dialog focus restoration, Escape, place-tab ArrowRight, post-save focus, route-heading focus, the live route announcement, and browser Back.
- Every visible control on `/`, `/demo`, `/history`, `/settings`, `/privacy`, `/terms`, and `/404.html` measured at least 44×44 CSS px at 390 px. No route overflowed horizontally.
- Live privacy instrumentation recorded zero microphone calls, zero device-connection calls, zero location calls before the named button, one after it, and zero third-party requests. The Android manifest has coarse/fine location and no microphone permission.
- Ten of ten fresh phone contexts reached `Offline ready`, went offline immediately, reloaded `/demo`, and retained the populated sample and demo label. Each used cache `hearing-mode-notes-v9`.
- The worker precaches the exact built shell, claims clients, removes old caches, and exposes an update message. A two-version deployment transition was unavailable; source and runtime registration cover the current update path.
- Home, Demo, History, Settings, Privacy, Terms, and 404 shells returned 200 with one `h1`, one `main`, `lang=en`, and route-specific titles. Every crawled link returned 200 or was an explicit `mailto:`.
- An unknown URL returned HTTP 404 with the designed **This page was not found** screen and a working home link. This deliberate 404 is expected, not a defect.
- Live CSP, Permissions-Policy, HSTS, `nosniff`, strict referrer policy, manifest MIME, immutable hashed-asset caching, and `no-cache` service-worker handling pass.

This is a static local-first PWA. Backend tenant isolation, restart persistence, health, and 429/Retry-After checks do not apply. It is not a CLI, library, or desktop product. An AI step would work against the quick, private, offline job; import/export already provides the useful portability step.

## Earlier finding disposition

Every finding from reviews 1–4 and verifications 2–7 remains closed.

| Earlier issue | Current disposition |
| --- | --- |
| Missing icon, failed worker installation, stale deployment, and first-ready offline race | **Resolved.** Candidate artifacts match live; the icon and cache v9 are live; 10/10 immediate offline reloads pass. |
| Skip link, dialog/save focus, route focus, and place-tab Arrow keys | **Resolved.** Fresh live keyboard checks pass. |
| Mobile performance and blocking time | **Resolved.** Fresh Lighthouse recorded Performance 98, LCP 2.0 s, TBT 120 ms, and CLS 0. |
| Missing one-click sample and data isolation | **Resolved.** Entry, realistic output, persistent label, reset, Start for real, and real-data separation pass. |
| Missing or incomplete claim coverage | **Resolved.** Thirteen one-test-per-claim commands all pass; search covers four fields and erasure persists after reload. |
| Broken paid checkout | **Resolved honestly.** No price, checkout, paid gate, or purchase promise is public while billing registration remains external. |
| Malformed import blanked later launches | **Resolved.** Complete validation rejects malformed input before writing; reload remains usable. |
| Undersized brand, footer, and legal links | **Resolved.** The live all-route phone audit found no target below 44×44 CSS px. |
| Missing live headers, correct MIME, and cache policy | **Resolved.** All required deployed response policies pass. |
| Missing Android location permissions | **Resolved in source.** Coarse and fine location are declared; microphone permission is absent. |
| Direct routes, metadata, sitemap, links, and 404 gaps | **Resolved.** Direct routes, titles, metadata resources, links, and deliberate HTTP 404 pass. |
| Landing audience, structure, plain copy, footer, and copy audit gaps | **Resolved.** Job, audience, first action, facts, standard sections, footer, and audit pass. |
| First-screen facts fell below the viewport | **Resolved.** Desktop and phone geometry is within the usable first viewport. |
| Phone History search overflowed and overlapped its icon | **Resolved.** Live width is exactly 390 px with no overlap or horizontal scrolling. |

No earlier high, medium, or low finding remains open.

## Performance and Android scope

Fresh live mobile Lighthouse 12.8.2 wrote a complete report before its known post-report browser-tab crash: Performance **98**, Accessibility **100**, Best Practices **100**, SEO **100**, FCP **1.0 s**, LCP **2.0 s**, TBT **120 ms**, CLS **0**, and total transfer **226 KiB**. Direct live checks independently confirm the policies and resources.

`./gradlew assembleDebug` cannot run because this worker has no Java executable or Android SDK. The README explicitly defers APK production and makes no APK or installed-artifact claim. The Capacitor project synchronizes successfully, so this environment limit is not a finding or an untested claim.

Evidence is stored in `/work/.evidence/review-5/`, including first-screen and populated-demo screenshots, `verify-url` output, and the Lighthouse JSON report.

## Final decision

**PASS — 0 findings and 0 untested public claims.**
