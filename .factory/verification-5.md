# Remember hearing-aid settings by place — verification 5

**Verdict: PASS**

- Findings: **0**
- Untested public claims: **0**
- Implementation candidate: `259a36a04489fcef97900ffa2cef034374acfeeb`
- Documentation baseline: `4f7a541a32951bcd250fc4c06885f396da7025cd`
- Live URL: <https://hearing-mode-notes.sociobot.in>
- Verified: 5 September 2026 UTC
- Work order: `hearing-mode-notes-verify-5`

The implementation passes with no finding at any severity and no untested public claim.

## First screen before scrolling

- **Job:** remember which hearing-aid listening setup worked at a place.
- **Audience:** hearing-aid wearers who need a quick, private record of place-specific settings.
- **First action:** **Try it with sample data**. The adjacent text says it loads three sample notes.

Fresh 1440×900 desktop and 390×844 phone contexts showed the job heading, audience sentence, and first action before scrolling. The three short facts state device storage, offline use, and optional location. The words are direct and contain no metaphor or mood heading.

## Candidate and live identity

The reviewed implementation is `259a36a04489fcef97900ffa2cef034374acfeeb`. Commit `4f7a541a32951bcd250fc4c06885f396da7025cd` changes only `.factory/handoff.md` after that implementation and does not require another product image.

A clean build at the implementation candidate byte-matched the live deployment:

| Artifact | Clean build and live SHA-256 |
| --- | --- |
| `index.html` | `abc5e2d8cc241fca413330b530cb7dee1ff013b5cce2af891345a26c50249b25` |
| `assets/index-zdhSvbaR.js` | `3face298e6d1ea7c238ef227911b119236e3197527ab93818b5efba56855a8bb` |
| `assets/index-DMjaMN43.css` | `b0e536b7e193f15d21ca47322d3ed44784abfcc3f5625f33fa624b5ae7a59a49` |
| `sw.js` | `e34b5e31f0ebf5a34a62c0b142637ecfd1ed0bb23b1c3f9805c65b9b0d70b751` |
| `manifest.webmanifest` | `73e0dc98a9b0481d7241c591fb3ea92fba01b4b719818bea80e22de2ebc0b006` |
| `icon.svg` | `ada4d0f16e5fbbf17f3e0fad54adf3eaecd0a659739b9a01cfd079f089017745` |

The generated shells for `/demo`, `/history`, `/settings`, `/privacy`, `/terms`, and `/404.html` also matched byte for byte.

## Findings

There are no findings.

The researched one-time purchase remains an external registration dependency. The public product exposes no price, checkout, paid gate, or purchase promise. The free notebook completes the researched job. This is not a defect or an untested public claim.

## Public claims

The landing page, app screens, Privacy, Terms, metadata, and README were compared with `.factory/claims.json`. All claim-like public copy maps to 13 declared claims. No missing, false, incomplete, or untested public claim remains.

Every declared command was run separately from the detached clean checkout. Each final evidence file records 2 expected project runs and 0 unexpected, flaky, or skipped runs.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `sample-sandbox` | PASS, 2/2 | Three samples loaded and a real note remained separate. Evidence: `/work/.evidence/verification-5/claims/sample-sandbox.json`. |
| `recall-last-setup` | PASS, 2/2 | The latest successful place, mode, and volume appeared on Home. Evidence: `/work/.evidence/verification-5/claims/recall-last-setup.json`. |
| `search-notes` | PASS, 2/2 | Place, mode, volume, and note-text searches each returned one matching sample. Evidence: `/work/.evidence/verification-5/claims/search-notes.json`. |
| `export-notes` | PASS, 2/2 | JSON parsed with three notes; CSV contained its header and three rows. Evidence: `/work/.evidence/verification-5/claims/export-notes.json`. |
| `import-notes` | PASS, 2/2 | A valid backup added the Library setup. Evidence: `/work/.evidence/verification-5/claims/import-notes.json`. |
| `offline-reload` | PASS, 2/2 | Dedicated controlled contexts reloaded the demo offline. Evidence: `/work/.evidence/verification-5/claims/offline-reload.json`. |
| `private-local-notes` | PASS, 2/2 | No microphone call or third-party request occurred. Evidence: `/work/.evidence/verification-5/claims/private-local-notes.json`. |
| `optional-location` | PASS, 2/2 | Location ran only after its named button. Evidence: `/work/.evidence/verification-5/claims/optional-location.json`. |
| `no-device-control` | PASS, 2/2 | No device-connection request occurred. Evidence: `/work/.evidence/verification-5/claims/no-device-control.json`. |
| `theme-choice` | PASS, 2/2 | System, light, and dark applied their matching states. Evidence: `/work/.evidence/verification-5/claims/theme-choice.json`. |
| `custom-place-tabs` | PASS, 2/2 | A named place appeared in the next setup form. Evidence: `/work/.evidence/verification-5/claims/custom-place-tabs.json`. |
| `reminder-fallback` | PASS, 2/2 | The saved Restaurant setup appeared when notifications were unavailable. Evidence: `/work/.evidence/verification-5/claims/reminder-fallback.json`. |
| `erase-local-data` | PASS, 2/2 | Notes, theme, and reusable places remained erased after reload. Evidence: `/work/.evidence/verification-5/claims/erase-local-data.json`. |

**Untested public claim count: 0.**

## Live product exercises

### Sample and real data

- PASS — one click opened `/demo` and showed the latest Restaurant setup plus three realistic Restaurant, Commute, and Work notes.
- PASS — the persistent **Demo — sample data** label remained visible and said that nothing is saved to the real notebook.
- PASS — adding a demo-only note raised the count to four; **Reset demo** restored the original three.
- PASS — **Start for real** returned to the real notebook. Its saved Home note survived demo use, reset, exit, and reload; the demo-only note never appeared there.
- PASS — `/?demo=1` independently entered the same isolated sample mode.

### Normal, invalid, boundary, and recovery paths

- PASS — a realistic Home / Everyday / Level 2 / comfort 4 note with special characters saved, rendered as text, and survived reload.
- PASS — a blank submission focused Place and announced the missing fields; Place stopped at its 60-character limit.
- PASS — denied location produced a clear message and did not block saving.
- PASS — place, mode, volume, and note-text searches returned the correct records; a no-result search offered **Clear filters**.
- PASS — delete cancellation kept the note; confirmed deletion offered Undo; Undo restored it.
- PASS — a malformed branded import was rejected before any write, and Settings remained usable after reload.
- PASS — confirmed local erasure removed notes, theme, and reusable places through reload.
- PASS — blocked IndexedDB showed **Your notebook could not open** and a **Try again** action.
- PASS — browser Back restored History and its 577 px scroll position.

### Keyboard, accessibility, and phone layout

- PASS — the first Tab reached **Skip to main content**, and Enter focused `main#main`.
- PASS — place tabs responded to Arrow keys; Escape restored the setup opener; route changes focused and announced their heading.
- PASS — fresh live axe scans on light desktop and dark/reduced-motion phone found 0 serious or critical violations.
- PASS — every visible control on `/`, `/demo`, `/history`, `/settings`, `/privacy`, `/terms`, and `/404.html` measured at least 44×44 CSS px at 390 px. This includes both repaired legal support links.
- PASS — 200% text produced no horizontal loss. Reduced motion computed the toast transition at `1e-05s`; no loop or flash was present.
- PASS — `/opt/fleet/lib/verify-url.sh` reported `lang=en`, one `h1`, one main landmark, complete image alternatives, labelled buttons, and no console errors.

### Offline, privacy, links, and routes

- PASS — a fresh service-worker context installed `hearing-mode-notes-v7`; `registration.update()` completed with an activated worker, and `/demo` reloaded offline with its sample and demo label.
- PASS — normal, invalid, search, location, and offline flows made no third-party, analytics, note-sync, microphone, or device-connection request. Location was called once, only after its button.
- PASS — `/`, `/demo`, `/history`, `/settings`, `/privacy`, and `/terms` returned 200 with route-specific titles, one `h1`, and one `main`.
- PASS — internal links and the public Source link returned 200; legal support uses an explicit `mailto:` URL.
- PASS — an unknown URL returned HTTP 404 and the designed **This page was not found** screen with a working home action. This expected 404 is not a defect.
- PASS — the sitemap lists all six public routes; `robots.txt` points to it. The standalone manifest has its versioned start URL, 192/512 icons, maskable icon, and standalone display.
- PASS — live CSP, Permissions-Policy, HSTS, referrer policy, and `nosniff` headers are present. Hashed assets are immutable, `sw.js` is `no-cache`, and the manifest MIME is correct.

This product has no backend. Tenant isolation, server restart persistence, health, and 429/Retry-After do not apply. It is not a CLI, library, or desktop package. The brief does not benefit from an AI step because the useful job is private local capture and recall.

## Earlier finding disposition

| Earlier finding | Current evidence and disposition |
| --- | --- |
| Missing worker icon, failed offline install, and stale deployment | **Resolved.** The icon is live, cache v7 controls the demo, offline reload passes, and live artifacts match the clean candidate. |
| Skip-link focus and mobile performance failures | **Resolved.** Fresh phone keyboard use focused main; Lighthouse scored 97 performance with 180 ms TBT. |
| Missing isolated sample and claim contract | **Resolved.** One-click sample, persistent label, reset, separate storage, 13 claims, and all 13 separate commands pass. |
| Broken checkout | **Resolved honestly.** No checkout, price, paid gate, or payment promise is exposed while registration is unavailable. |
| Malformed import permanently blanked the app | **Resolved.** Invalid data is rejected before its atomic write; reload remains usable. |
| Dialog focus and place-tab Arrow keys | **Resolved.** ArrowRight, Escape, and stable focus pass live and in both browser projects. |
| Undersized phone links, including legal support | **Resolved.** The all-route audit found no target under 44×44 CSS px. |
| Missing live headers, correct MIME, and cache policy | **Resolved.** Live response headers and cache behavior match the shipped policy. |
| Missing Android location permissions | **Resolved in source.** Coarse and fine location are declared; microphone permission is absent. |
| Direct routes, metadata, sitemap, and 404 gaps | **Resolved.** Direct routes, titles, metadata, sitemap, links, and the deliberate HTTP 404 pass. |
| Landing audience, structure, footer, and copy audit gaps | **Resolved.** Job, audience, action, facts, How it works, limits, footer, and copy audit are present. |
| Search claim covered only note text | **Resolved.** The single declared search claim and tagged test cover place, mode, volume, and note text. |
| Local-data erasure was unregistered and untested | **Resolved.** The declared claim proves notes and settings remain erased after reload. |

No earlier major, medium, or minor finding remains open.

## Clean-checkout gates

A detached worktree at the exact implementation candidate was clean before and after repository checks.

| Command or check | Result |
| --- | --- |
| `npm ci` | PASS — 149 packages installed; 0 vulnerabilities. |
| `npm run check` | PASS — no TypeScript errors. |
| `npm test` | PASS — 9/9 unit tests. |
| `npm run build` | PASS — production `dist/` created. |
| `npm run test:e2e` | PASS — 40/40 across desktop Chromium and the exact 390 px phone project. |
| All 13 claim commands, separately | PASS — 26/26 project runs. |
| `npm audit --omit=dev` | PASS — 0 production vulnerabilities. |
| `npx cap sync android` | PASS — production web assets and Android plugins synchronized. |
| `/opt/fleet/lib/verify-url.sh <live-demo>` | PASS. |

`./gradlew assembleDebug` cannot run in this worker because Java, `JAVA_HOME`, and the Android SDK are absent. The README defers APK compilation to an Android SDK-equipped work order and makes no APK download or installed-artifact claim. This environment limit is not a finding or an untested claim.

## Performance and bundle budgets

Fresh live mobile Lighthouse 12.8.2 on `/demo` scored:

- Performance: **97**
- Accessibility: **100**
- Best Practices: **100**
- SEO: **100**
- FCP: **1.0 s**
- LCP: **2.0 s**
- TBT: **180 ms**
- CLS: **0**
- Total transfer: **225 KiB**

Build budgets pass: JavaScript is 34,775 bytes raw and 11,619 bytes gzip; CSS is 25,931 bytes raw and 6,257 bytes gzip; fonts are 0 bytes; the mobile hero is 17,060 bytes. Original image provenance remains recorded in `.factory/design.md`.

Evidence includes `/work/.evidence/verification-5/lighthouse-mobile.json`, `/work/.evidence/verification-5/desktop-real-history.png`, `/work/.evidence/verification-5/phone-demo.png`, and the 13 claim JSON reports.

## Final decision

**PASS — 0 findings and 0 untested public claims.**
