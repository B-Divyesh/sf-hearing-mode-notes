# Remember hearing-aid settings by place — review 4

**Verdict: FAIL**

- Findings: **2** (0 High, 1 Medium, 1 Low)
- Untested public claims: **0**
- Implementation candidate: `2810c7061ae9623819d0fceb41509aff174b9ace`
- Documentation baseline: `399506ba813e212261b31263f602d8b4053f9caa`
- Live URL: <https://hearing-mode-notes.sociobot.in>
- Reviewed: 6 September 2026 UTC
- Work order: `hearing-mode-notes-review-4`

The product does not pass this strict review because two layout findings remain. Every public claim is declared and tested.

## First screen before scrolling

- **Job:** remember hearing-aid settings by place.
- **Audience:** hearing-aid wearers who need a private record of which setup worked in each place.
- **First action:** **Try it with sample data**. The adjacent text says it loads three sample notes.

Fresh 1440×900 desktop and 390×844 phone contexts showed the job, audience, and first action before scrolling. The title names the job, and the copy uses plain words without metaphor or mood headings. The required three facts do not all fit in the first screen; see R4-01.

## Candidate and live identity

The reviewed implementation is `2810c7061ae9623819d0fceb41509aff174b9ace`. Commits through `399506ba813e212261b31263f602d8b4053f9caa` change only verification documentation and handoff text.

A clean build at the implementation candidate matched the live deployment byte for byte:

| Artifact | Clean build and live SHA-256 |
| --- | --- |
| `index.html` | `18d296704983cdab7cdf1fdcbba5d53dab11d2f105bfef99a8eb0982b619029f` |
| `assets/index-CxqxJ7MJ.js` | `ca19b8afc52503857e3a027ffa032bfa75be9cb441b40e70d0b3bf5564a2f19c` |
| `assets/index-ZJEaQypd.css` | `cbf59ac865e99b58215dc3c9af83961005d7aeb92f1e0da7cd9241de2873a634` |
| `sw.js` | `75ad72ef7df93a97350d71719e9961fa54900812187ac5249989aab6f154ba39` |
| `manifest.webmanifest` | `73e0dc98a9b0481d7241c591fb3ea92fba01b4b719818bea80e22de2ebc0b006` |
| `icon.svg` | `ada4d0f16e5fbbf17f3e0fad54adf3eaecd0a659739b9a01cfd079f089017745` |

The generated `/demo`, `/history`, `/settings`, `/privacy`, `/terms`, and `/404.html` shells also matched. The live runtime is the reviewed implementation.

## Findings

| ID | Severity | Finding | Evidence and impact |
| --- | --- | --- | --- |
| R4-01 | **Medium** | The three required privacy/offline/location facts are not present in the first viewport. | At 1440×900, the final fact ends at **905.64 px**. At 390×844, the fixed app navigation begins at **775 px**, while the facts occupy **800.11–877.17 px**, placing all three under the navigation or below the viewport. The job, audience, and sample action remain visible, but visitors must scroll to see the mandatory facts. |
| R4-02 | **Low** | The History search control has overlapping text and causes phone horizontal scrolling. | At 390 px, the search panel spans **−4 to 394 px**, making the document 394 px wide with a measurable 4 px horizontal scroll. The input text begins at **25 px**, while the search icon spans **27–47 px**, so the icon overlays the placeholder and entered text. Search still works and its accessible name is valid, so severity is Low. Evidence: `/work/.evidence/review-4/phone-history.png` and `live-review.json`. |

## Public claims

The landing page, app routes, legal pages, metadata, manifest, README, and copy audit were compared with `.factory/claims.json`. All claim-like copy maps to one of the 13 entries, and each ID occurs in exactly one tagged test. There are **0 untested public claims**.

Every declared command ran separately from the clean candidate checkout. Each passed in desktop Chromium and the 390 px phone project:

| Claim | Result |
| --- | --- |
| `sample-sandbox` | PASS, 2/2 |
| `recall-last-setup` | PASS, 2/2 |
| `search-notes` | PASS, 2/2 |
| `export-notes` | PASS, 2/2 |
| `import-notes` | PASS, 2/2 |
| `offline-reload` | PASS, 2/2 |
| `private-local-notes` | PASS, 2/2 |
| `optional-location` | PASS, 2/2 |
| `no-device-control` | PASS, 2/2 |
| `theme-choice` | PASS, 2/2 |
| `custom-place-tabs` | PASS, 2/2 |
| `reminder-fallback` | PASS, 2/2 |
| `erase-local-data` | PASS, 2/2 |

**Untested public claim count: 0.**

## Live product exercises

### Sample and real data

- PASS — one click opened `/demo` with the latest Restaurant setup and three realistic Restaurant, Commute, and Work records.
- PASS — the persistent **Demo — sample data** label states that nothing is saved to the real notebook.
- PASS — a fourth demo-only Library note appeared, then **Reset demo** restored the original three notes.
- PASS — **Start for real** returned to a fresh-context real notebook. Its Home note survived demo use and reset; the demo-only note never entered real history.

### Normal, invalid, boundary, and recovery paths

- PASS — a realistic place, listening mode, volume, comfort rating, and observation saved and survived navigation.
- PASS — blank submission focused Place; a 61-character place stopped at 60 characters.
- PASS — punctuation and markup-like text rendered as text, not markup.
- PASS — denied location gave a clear recovery message and did not block Save.
- PASS — search covered place, mode, volume, and observation text. The no-result state offered **Clear filters**.
- PASS — delete cancellation kept the note; confirmed deletion offered Undo; Undo restored it.
- PASS — a malformed branded import was rejected before a write and Settings remained usable after reload.
- PASS — blocked IndexedDB showed **Your notebook could not open** and **Try again**.
- PASS — browser Back restored History, heading focus, announcement, and its prior scroll position.

### Accessibility, keyboard, phone, and motion

- PASS — skip-link focus, route-heading focus, dialog Escape restoration, post-save focus, place-tab Arrow keys, and native form behavior worked.
- PASS — every visible control on all public routes measured at least 44×44 CSS px at 390 px.
- PASS — Playwright Axe in dark/reduced-motion mode and `@axe-core/cli` on the live demo both found zero violations.
- PASS — reduced motion computed the toast transition at `0.01ms`; no loop or flash exists.
- PASS — `verify-url.sh` found `lang=en`, one `h1`, one `main`, complete image alternatives, labelled buttons, and no console errors.
- FAIL — first-screen facts and the History search layout are R4-01 and R4-02.

### Offline, privacy, links, and routes

- PASS — ten independent fresh phone contexts disconnected immediately after **Offline ready**, reloaded `/demo`, and retained the sample and demo label: **10/10**, cache `hearing-mode-notes-v8`.
- PASS — `registration.update()` completed with an activated controlling worker.
- PASS — the live demo, save, search, invalid, location-denial, delete, reset, and recovery flows made no third-party request. Microphone and device-connection counters remained zero.
- PASS — all six public routes, robots, sitemap, and the product Source link returned 200. Legal support uses `mailto:`.
- PASS — direct routes have route-specific titles, one `h1`, one `main`, and `lang=en`.
- PASS — an unknown route returned HTTP 404 and the designed **This page was not found** screen with a working home link. Its expected failed-resource console line is not a defect.
- PASS — canonical, Open Graph, Twitter, touch icon, CSP, Permissions-Policy, HSTS, referrer, MIME, service-worker cache, immutable asset, and `nosniff` checks passed.

This is a static, local-first product. Backend tenant isolation, restart persistence, health, and 429/Retry-After checks do not apply. It is not a CLI, library, or desktop package. Sending private setup notes to an AI service would not improve the quick local recall job, so no AI feature is missed leverage.

## Earlier finding disposition

| Earlier issue | Current disposition |
| --- | --- |
| Service worker could not install because an icon was missing | **Resolved.** The icon is live; cache v8 controls the app; 10/10 immediate offline reloads pass. |
| Live deployment was stale | **Resolved.** Clean candidate artifacts and generated route shells match live byte for byte. |
| Skip link did not focus main | **Resolved.** Fresh keyboard use focuses `main#main`. |
| Mobile performance and blocking time missed the gate | **Resolved.** Fresh Lighthouse is 99 performance with 0 ms TBT. |
| No isolated one-click sample | **Resolved.** One-click entry, three notes, persistent label, reset, and real-data isolation pass live. |
| No claim manifest or claim commands | **Resolved.** Thirteen claims each have one tagged test; all 13 separate commands pass. |
| Broken checkout | **Resolved honestly.** No price, checkout, paid gate, or purchase promise is public while billing is unavailable. |
| Malformed import permanently blanked the app | **Resolved.** Validation rejects malformed data before writing, and reload remains usable. |
| Dialog focus and place-tab Arrow keys failed | **Resolved.** Escape, save focus, and Arrow keys pass. |
| Brand, footer, and legal support links were undersized | **Resolved.** No visible public control is below 44×44 CSS px at 390 px. |
| Live response headers, MIME, and caching were wrong | **Resolved.** The required security, MIME, immutable-asset, and no-cache worker policies are live. |
| Android location permissions were missing | **Resolved in source.** Coarse and fine location are declared; microphone permission is absent. |
| Direct routes, metadata, sitemap, and 404 were incomplete | **Resolved.** Direct routes, titles, metadata, sitemap, links, and the deliberate HTTP 404 pass. |
| Landing audience, structure, footer, and copy audit were incomplete | **Partly superseded.** Audience, sections, footer, and audit remain present, but the newly measured first-screen placement defect is R4-01. |
| Search claimed four fields but tested only note text | **Resolved.** The declared test covers place, mode, volume, and note text. R4-02 is a separate visual defect. |
| Local erasure was unregistered and untested | **Resolved.** The claim proves notes and settings remain erased after reload. |
| First-visit offline reload was nondeterministic | **Resolved.** The exact command passes, and 10/10 fresh live phone runs pass immediately after readiness. |

No earlier open defect has regressed. R4-01 and R4-02 are newly measured findings.

## Clean-checkout gates

A detached worktree at the exact implementation candidate was clean before and after the checks. Documented Node.js prerequisites were installed with `npm ci`.

| Command or check | Result |
| --- | --- |
| `npm ci` | PASS — 149 packages installed; 0 vulnerabilities. |
| `npm run dev -- --host 127.0.0.1` | PASS — Vite started successfully. |
| `npm run check` | PASS — no TypeScript errors. |
| `npm test` | PASS — 9/9 unit tests. |
| `npm run build` | PASS — production `dist/` generated. |
| `npm run test:e2e` | PASS — 40/40 desktop and phone checks. |
| All 13 claim commands, separately | PASS — 26/26 project runs. |
| `npm audit --omit=dev` | PASS — 0 production vulnerabilities. |
| `npx cap sync android` | PASS — web assets and Android plugins synchronized. |
| `/opt/fleet/lib/verify-url.sh <live-demo>` | PASS. |
| `npx @axe-core/cli <live-demo>` | PASS — 0 violations. |

`./gradlew assembleDebug` is unavailable because this worker has no Java executable or Android SDK. README explicitly defers APK compilation and makes no APK download or installed-artifact claim, so this is neither a finding nor an untested claim.

## Performance and bundle budgets

Fresh live mobile Lighthouse 12.8.2 on `/demo` scored Performance **99**, Accessibility **100**, Best Practices **100**, and SEO **100**. FCP was **0.9 s**, LCP **2.0 s**, TBT **0 ms**, CLS **0**, and total transfer **221 KiB**.

The clean build uses 36,168 bytes of JavaScript (11,994 gzip), 26,049 bytes of CSS (6,287 gzip), no fonts, and a 17,060-byte phone hero. These pass the product budgets.

Evidence is under `/work/.evidence/review-4/`, including first-screen and History screenshots, `live-review.json`, `axe-live.json`, `verify-url/verify.json`, and `lighthouse-mobile.json`.

## Final decision

**FAIL — 2 findings and 0 untested public claims.**
