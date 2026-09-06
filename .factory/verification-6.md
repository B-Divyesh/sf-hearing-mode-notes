# Remember hearing-aid settings by place — verification 6

**Verdict: PASS**

- Findings: **0**
- Untested public claims: **0**
- Implementation candidate: `2810c7061ae9623819d0fceb41509aff174b9ace`
- Documentation baseline: `b8b2fd9cc3c419e46de4ee306fb59a318e1ffe18`
- Live URL: <https://hearing-mode-notes.sociobot.in>
- Verified: 6 September 2026 UTC
- Work order: `hearing-mode-notes-verify-6`

The implementation passes with no finding at any severity and no untested public claim.

## First screen before scrolling

- **Job:** remember hearing-aid settings by place.
- **Audience:** hearing-aid wearers who need a private record of which setup worked in each place.
- **First action:** **Try it with sample data**. The adjacent text says it loads three sample notes.

Fresh 1440×900 desktop and 390×844 phone contexts showed the job, audience, and first action before scrolling. The page also shows the three plain facts and uses no metaphor or mood heading. Screenshots are in `/work/.evidence/verification-6/desktop-first-screen.png` and `phone-first-screen.png`.

## Candidate and live identity

The reviewed implementation is `2810c7061ae9623819d0fceb41509aff174b9ace`. The later commit `b8b2fd9cc3c419e46de4ee306fb59a318e1ffe18` changes only `.factory/handoff.md`, so it does not require a different product image.

A clean build at the implementation candidate matched the live deployment byte for byte:

| Artifact | Clean build and live SHA-256 |
| --- | --- |
| `index.html` | `18d296704983cdab7cdf1fdcbba5d53dab11d2f105bfef99a8eb0982b619029f` |
| `assets/index-CxqxJ7MJ.js` | `ca19b8afc52503857e3a027ffa032bfa75be9cb441b40e70d0b3bf5564a2f19c` |
| `assets/index-ZJEaQypd.css` | `cbf59ac865e99b58215dc3c9af83961005d7aeb92f1e0da7cd9241de2873a634` |
| `sw.js` | `75ad72ef7df93a97350d71719e9961fa54900812187ac5249989aab6f154ba39` |
| `manifest.webmanifest` | `73e0dc98a9b0481d7241c591fb3ea92fba01b4b719818bea80e22de2ebc0b006` |
| `icon.svg` | `ada4d0f16e5fbbf17f3e0fad54adf3eaecd0a659739b9a01cfd079f089017745` |

The generated `/demo`, `/history`, `/settings`, `/privacy`, `/terms`, and `/404.html` shells also matched byte for byte. The live runtime is the reviewed implementation.

## Findings

There are no findings.

The researched one-time purchase still depends on external billing registration. The public product has no price, checkout, paid gate, or purchase promise. The complete local notebook remains available, so this is neither a defect nor an untested public claim.

## Public claims

The landing page, app routes, legal pages, metadata, manifest, README, and copy audit were compared with `.factory/claims.json`. All public claim-like copy maps to the 13 declared claims. Each claim ID occurs in exactly one tagged test. No missing, false, incomplete, or untested claim remains.

Every declared command ran separately from the clean candidate checkout. Each command completed two project runs, one desktop and one 390 px phone run.

| Claim | Result | Observed outcome |
| --- | --- | --- |
| `sample-sandbox` | PASS, 2/2 | Three sample notes loaded and a real Home note remained separate. |
| `recall-last-setup` | PASS, 2/2 | The newest successful place, mode, and volume appeared on Home. |
| `search-notes` | PASS, 2/2 | Place, mode, volume, and note-text searches each returned the correct note. |
| `export-notes` | PASS, 2/2 | JSON contained three notes; CSV contained its header and three rows. |
| `import-notes` | PASS, 2/2 | A valid backup added its Library setup. |
| `offline-reload` | PASS, 2/2 | Dedicated first-visit contexts reloaded the populated demo offline. |
| `private-local-notes` | PASS, 2/2 | No microphone call or third-party request occurred. |
| `optional-location` | PASS, 2/2 | Location ran only after its named button. |
| `no-device-control` | PASS, 2/2 | No browser device-connection request occurred. |
| `theme-choice` | PASS, 2/2 | System, light, and dark applied their matching states. |
| `custom-place-tabs` | PASS, 2/2 | A named place appeared in the setup form. |
| `reminder-fallback` | PASS, 2/2 | The saved setup appeared when notifications were unavailable. |
| `erase-local-data` | PASS, 2/2 | Notes, theme, and custom places remained erased after reload. |

**Untested public claim count: 0.**

## Live product exercises

### Sample and real data

- PASS — one click opened `/demo` with the Restaurant setup and three realistic Restaurant, Commute, and Work records.
- PASS — the persistent **Demo — sample data** label states that nothing is saved to the real notebook.
- PASS — a temporary fourth demo note appeared, then **Reset demo** restored the original three.
- PASS — **Start for real** returned to the real notebook. Its Home note survived demo use and reset, while the temporary demo note did not appear.
- PASS — the sample data remained available offline.

### Normal, invalid, boundary, and recovery paths

- PASS — a realistic setup with punctuation and text resembling markup saved as text and survived reload.
- PASS — blank submission focused the required Place field; Place stopped at 60 characters.
- PASS — denied location gave a clear message and did not block saving.
- PASS — search covered place, mode, volume, and note text; the no-result state offered **Clear filters**.
- PASS — delete cancellation kept the record; confirmed deletion offered Undo; Undo restored it.
- PASS — malformed branded import was rejected before any write, and Settings remained usable after reload.
- PASS — the claim suite verified valid import, JSON/CSV export, theme changes, custom places, reminder fallback, persistent erasure, and empty state.
- PASS — blocked IndexedDB showed **Your notebook could not open** and **Try again**.
- PASS — browser Back restored History and its 500 px scroll position.

### Keyboard, accessibility, and phone layout

- PASS — skip-link focus, route-heading focus, dialog Escape restoration, post-save focus, place-tab Arrow keys, and native radio behavior passed.
- PASS — the visible keyboard focus treatment measured a 3 px coral outline.
- PASS — live Axe scans found zero violations in desktop light and phone dark/reduced-motion contexts.
- PASS — all visible controls on `/`, `/demo`, `/history`, `/settings`, `/privacy`, `/terms`, and `/404.html` measured at least 44×44 CSS px at 390 px.
- PASS — the 390 px layout had no horizontal loss; this also covers a 780 px desktop viewport at 200% zoom. Text and actions remained available.
- PASS — reduced motion computed the toast transition at `0.00001s`; no loop or flash exists.
- PASS — `verify-url.sh` found `lang=en`, one `h1`, one `main`, complete image alternatives, labelled buttons, and no console errors.

### Offline, update, privacy, links, and routes

- PASS — ten independent fresh phone contexts waited for **Offline ready**, disconnected immediately, reloaded `/demo`, and showed the Restaurant setup plus demo label: **10/10**. Every context used cache `hearing-mode-notes-v8`.
- PASS — `registration.update()` completed while the page retained an active controlling worker. Source and tests cover versioned cache cleanup, `skipWaiting`, `clients.claim`, and the update notice.
- PASS — complete live save, invalid, search, reminder, location, delete, import, and reload paths made no third-party request, microphone call, or device-connection request. Location ran once only after its button.
- PASS — the six public routes returned HTTP 200 with route-specific titles, one `h1`, one `main`, `lang=en`, and valid phone targets.
- PASS — the public Source link and every internal route returned 200; the support address is an explicit `mailto:` link.
- PASS — an unknown path returned HTTP 404 and the designed **This page was not found** screen with a working home link. This deliberate 404 is expected, not a defect.
- PASS — canonical, Open Graph, Twitter, touch icon, manifest, robots, sitemap, CSP, Permissions-Policy, HSTS, referrer, MIME, service-worker cache, and `nosniff` checks passed.

This is a static, local-first product. Backend tenant isolation, server restart persistence, health, and 429/Retry-After checks do not apply. It is not a CLI, library, or desktop package. An AI step would conflict with the private, quick local-memory job and is not missed leverage.

## Earlier finding disposition

| Earlier issue | Current disposition |
| --- | --- |
| Service worker could not install because an icon was missing | **Resolved.** The icon is live; cache v8 controls the app; 10/10 immediate offline reloads pass. |
| Live deployment was stale | **Resolved.** Clean candidate artifacts and every generated route shell match live byte for byte. |
| Skip link did not focus main | **Resolved.** Keyboard use focuses `main#main`. |
| Mobile performance and blocking time missed the gate | **Resolved.** Fresh Lighthouse scores 98 performance with 130 ms TBT. |
| No isolated one-click sample | **Resolved.** One-click entry, three notes, persistent label, reset, and real-data isolation pass live. |
| No claim manifest or claim commands | **Resolved.** Thirteen claims exist, each has one tagged test, and all 13 commands pass separately. |
| Broken checkout | **Resolved honestly.** No payment control or paid promise is public while billing registration is unavailable. |
| Malformed import permanently blanked the app | **Resolved.** Validation rejects malformed data before writing; reload remains usable. |
| Dialog focus and place-tab Arrow keys failed | **Resolved.** Escape, save focus, and Arrow keys pass live and in both test projects. |
| Brand, footer, and legal support links were undersized | **Resolved.** The all-route 390 px audit found no target below 44×44 CSS px. |
| Live response headers, MIME, and caching were wrong | **Resolved.** The expected security headers, manifest MIME, immutable asset policy, and no-cache worker are live. |
| Android location permissions were missing | **Resolved in source.** Coarse and fine location are declared; microphone permission is absent. |
| Direct routes, metadata, sitemap, and 404 were incomplete | **Resolved.** Direct routes, titles, metadata, sitemap, links, and the deliberate HTTP 404 pass. |
| Landing audience, structure, footer, and copy audit were incomplete | **Resolved.** Job, audience, action, facts, How it works, limits, footer, and copy audit are present. |
| Search claimed four fields but tested only note text | **Resolved.** The declared test covers place, mode, volume, and note text. |
| Local erasure was unregistered and untested | **Resolved.** The claim proves notes and settings remain erased after reload. |
| First-visit offline reload was nondeterministic | **Resolved.** The explicit cached-shell acknowledgement passed the claim command and 10/10 fresh live phone runs without a delay after readiness. |

No earlier major, medium, or minor finding remains open.

## Clean-checkout gates

A detached worktree at the exact implementation candidate was clean before and after the checks. Node.js dependencies were installed with `npm ci` before runtime measurements.

| Command or check | Result |
| --- | --- |
| `npm ci` | PASS — 149 packages installed; 0 vulnerabilities. |
| `npm run check` | PASS — no TypeScript errors. |
| `npm test` | PASS — 9/9 unit tests. |
| `npm run build` | PASS — production `dist/` generated. |
| `npm run test:e2e` | PASS — 40/40 desktop and 390 px phone checks. |
| All 13 `.factory/claims.json` commands, separately | PASS — 26/26 project runs. |
| `npm audit --omit=dev` | PASS — 0 production vulnerabilities. |
| `npx cap sync android` | PASS — web assets and Android plugins synchronized. |
| `/opt/fleet/lib/verify-url.sh <live-demo>` | PASS. |

`./gradlew assembleDebug` cannot run because this worker has no Java executable or Android SDK. README explicitly defers APK compilation and makes no APK or installed-artifact claim. This environment limit is not a finding or an untested claim.

## Performance and bundle budgets

Fresh live mobile Lighthouse 12.8.2 on `/demo` completed its JSON report with:

- Performance: **98**
- Accessibility: **100**
- Best Practices: **100**
- SEO: **100**
- FCP: **1.0 s**
- LCP: **2.0 s**
- TBT: **130 ms**
- CLS: **0**
- Total transfer: **221 KiB**

The Lighthouse wrapper reported a Chromium tab crash only after writing the complete report, the same post-report environment behavior recorded earlier. The report contains all categories and metrics above.

Build budgets pass: JavaScript is 36,168 bytes raw and 11,994 bytes gzip; CSS is 26,049 bytes raw and 6,287 bytes gzip; fonts are 0 bytes; the phone hero is 17,060 bytes. Original image provenance remains recorded in `.factory/design.md`.

Evidence is in `/work/.evidence/verification-6/`, including `live-qa.json`, first-screen screenshots, `verify-url/verify.json`, and `lighthouse-mobile.json`.

## Final decision

**PASS — 0 findings and 0 untested public claims.**
