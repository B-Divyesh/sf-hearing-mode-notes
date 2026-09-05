# Remember hearing-aid settings by place — review 2

**Verdict: FAIL**

- Findings: **2** (0 High, 2 Medium, 0 Low)
- Untested public claims: **2**
- Implementation candidate: `e88fdaa1402039e1c10c9d3caf64b960e09cb5c7`
- Documentation baseline: `34ba42eaafbe16e4654fadbb52e987c2ffa9d315`
- Live URL: <https://hearing-mode-notes.sociobot.in>
- Reviewed: 5 September 2026 UTC
- Work order: `hearing-mode-notes-review-2`

PASS is not allowed because two findings and two untested public claim families remain.

## First screen before scrolling

- **Job:** remember which hearing-aid listening setup worked at a place.
- **Audience:** hearing-aid wearers who need a quick, private record of place-specific settings.
- **First action:** **Try it with sample data**. The adjacent text says that it loads three sample notes.

Fresh 1440×900 desktop and 390×844 phone contexts showed the job heading, audience sentence, and first action before scrolling. The words are direct and task-specific. The heading is not the product name, and no metaphor or mood heading is used.

## Candidate and live identity

The reviewed implementation is `e88fdaa1402039e1c10c9d3caf64b960e09cb5c7`. Commit `911002c878e6e493a370aa1e7f380a99e004a28b` changes only the offline browser test wait. Commits through the documentation baseline `34ba42eaafbe16e4654fadbb52e987c2ffa9d315` otherwise change review and handoff files. None changes the deployed product image.

A clean build at the documentation baseline matched the live deployment byte for byte:

| Artifact | Clean build and live SHA-256 |
| --- | --- |
| `index.html` | `6efc5898ffb716b83a70f055c117ee893e8d53b81612e9b979ef1213046f5c91` |
| `assets/index-ONfwrFyn.js` | `1e7c0f856d73ccda2654efa3eee540c968916a0ec3edaeff929d166a707e79f6` |
| `assets/index-2qlRfanv.css` | `e3139c1849ce54600b8c6e9c671d3a8be3b6e8678e41f99540a6ba590867695e` |
| `sw.js` | `331dee36f68cce4566fcb36dd4726cac04e1946e0ba08269cce28be480331302` |
| `manifest.webmanifest` | `73e0dc98a9b0481d7241c591fb3ea92fba01b4b719818bea80e22de2ebc0b006` |

## Findings

| ID | Severity | Finding | Evidence and impact |
| --- | --- | --- | --- |
| R2-01 | **Medium** | The support email link is below the required phone touch-target size on both legal pages. | In a fresh 390×844 browser, `support@sociobot.in` measured **174.8×20 CSS px** on `/privacy` and `/terms`. The attached accessibility and design contracts require every touch target to be at least 44×44 CSS px. The previously reported brand and footer links now pass, but these two visible links do not. |
| R2-02 | **Medium** | The public-claim manifest and tagged tests omit two explicit claim families. | The History page promises, “Search by place, mode, volume, or what you wrote,” while `search-notes` claims and tests only words in the note. The Privacy page also promises that users can “erase local data in Settings,” and Settings says it clears local notes and settings, but no claim entry or `@claim:` test covers erasure. Both behaviors worked in live manual checks, but the claims contract requires each public claim to have its own registered, repeatable command. |

**Untested public claim count: 2.** These are the broader four-field search claim and the local-data erasure claim.

## Declared public claims

`.factory/claims.json` contains 12 entries, and each ID appears in exactly one tagged browser test. Every declared command was run separately from the clean checkout. All 12 commands passed in desktop Chromium and the 390 px phone project:

| Declared claim | Result | Observed outcome |
| --- | --- | --- |
| `sample-sandbox` | PASS, 2/2 | Three samples loaded and the real note remained separate. |
| `recall-last-setup` | PASS, 2/2 | The latest successful place, mode, and volume appeared on Home. |
| `search-notes` | PASS, 2/2 | Words from a sample observation returned its one matching note. |
| `export-notes` | PASS, 2/2 | JSON contained three notes; CSV contained its header and three rows. |
| `import-notes` | PASS, 2/2 | A valid backup added the Library setup. |
| `offline-reload` | PASS, 2/2 | A dedicated controlled context reloaded `/demo` offline. |
| `private-local-notes` | PASS, 2/2 | No microphone call or third-party request occurred. |
| `optional-location` | PASS, 2/2 | Location ran only after its button. |
| `no-device-control` | PASS, 2/2 | No device-connection request occurred. |
| `theme-choice` | PASS, 2/2 | System, light, and dark applied their exact states. |
| `custom-place-tabs` | PASS, 2/2 | A new reusable place appeared in the setup form. |
| `reminder-fallback` | PASS, 2/2 | The saved Restaurant setup appeared when notifications were unavailable. |

The two omissions in R2-02 mean the complete public claim audit does not pass even though all declared commands pass.

## Live product checks

### Sample and data isolation

- PASS — the first click opened `/demo`, immediately showed the latest Restaurant setup, and exposed three realistic Restaurant, Commute, and Work records.
- PASS — the persistent **Demo — sample data** label remained on Home and History and said that nothing is saved to the real notebook.
- PASS — adding a demo-only Cinema setup produced four sample records; **Reset demo** restored the original three.
- PASS — a real Home setup created in the same fresh context survived demo use, reset, **Start for real**, and reload. The demo-only setup did not appear in real history.
- PASS — `/?demo=1` independently entered the same isolated sample mode.

### Normal, invalid, boundary, and recovery paths

- PASS — a realistic place, mode, volume, comfort rating, and seating note saved and became the latest successful setup.
- PASS — a blank form focused the required Place field and exposed browser validation.
- PASS — Place stopped at its 60-character limit, and `Restaurant & Café <quiet>` rendered as text.
- PASS — denied location produced a specific message and still allowed save.
- PASS — search returned a note by detail. Additional live checks returned one correct record for place, mode, and volume terms.
- PASS — no-result search showed a clear recovery action.
- PASS — delete cancellation retained the record; confirmed deletion exposed Undo; Undo restored it.
- PASS — malformed branded and wrong-product JSON imports were rejected, and Settings remained usable after reload.
- PASS — JSON and CSV downloads contained three complete sample rows. The notification-unavailable path showed the saved setup.
- PASS — custom-place removal and the confirmed sample-data erase action both worked live.
- PASS — blocking IndexedDB before launch produced **Your notebook could not open** with a **Try again** action.

### Keyboard, accessibility, and responsive behavior

- PASS — the first Tab reached **Skip to main content**, and Enter focused `main#main`.
- PASS — place tabs moved with Arrow keys; Escape returned focus to the setup opener; Save focused the stable main landmark.
- PASS — in-app navigation focused and announced the new page heading. Browser Back restored the prior demo view and its 700 px scroll position.
- PASS — a live dark, reduced-motion phone axe scan found zero serious or critical violations. Lighthouse accessibility scored 100.
- PASS — the 390 px demo had no horizontal overflow. At 200% text size it still had no horizontal overflow.
- PASS — reduced motion changed the toast transition to `1e-05s`; no loop or flash was present.
- FAIL — the two legal-page contact targets in R2-01 are only 20 px high.

### Offline, privacy, routes, and links

- PASS — a fresh context installed and controlled `hearing-mode-notes-v6`; `/demo` reloaded offline with sample content and its label.
- PASS — `registration.update()` completed and the active worker remained `activated`.
- PASS — normal, invalid, delete, search, and location flows contacted only `hearing-mode-notes.sociobot.in`. Microphone and device-connection call counts remained zero; location was called once, after its button.
- PASS — `/`, `/demo`, `/history`, `/settings`, `/privacy`, and `/terms` returned 200 with route-specific titles, one `h1`, and one `main`.
- PASS — all discovered product links and the public GitHub source link returned 200; the support link is an explicit `mailto:` URL.
- PASS — an unknown live path returned HTTP 404 and the designed **This page was not found** screen with a working home link. This deliberate 404 is expected, not a defect.
- PASS — `robots.txt` and the sitemap are live and list the six public routes.

This product has no backend. Tenant isolation, server restart persistence, health, and 429/Retry-After checks do not apply. The brief does not need an AI step; sending private listening notes to a model would not improve the core job.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Missing service-worker icon and failed offline install | **Resolved.** The icon is live, cache v6 controls the app, and fresh offline reload passes. |
| Stale live deployment | **Resolved.** The five compared runtime artifacts match the clean build. |
| Skip link did not focus main | **Resolved.** Fresh phone keyboard use focused `main#main`. |
| Mobile Lighthouse and TBT missed the gate | **Resolved.** The fresh run scored 98 performance with 140 ms TBT. |
| No isolated one-click sample | **Resolved.** One-click entry, three records, persistent label, reset, query entry, and real-data separation pass. |
| No claims manifest or claim commands | **Partly resolved.** Twelve declared commands pass, but two explicit public claims remain outside the manifest and required tagged coverage; see R2-02. |
| Broken checkout | **Resolved honestly.** No checkout, price, paid gate, or payment promise is exposed while registration is unavailable. The free notebook is complete. |
| Malformed import permanently blanked the app | **Resolved.** Both malformed variants were rejected and reload stayed usable. |
| Dialog focus and place-tag Arrow keys failed | **Resolved.** Escape, ArrowRight, and post-save focus pass live. |
| Four phone links were under 44 px | **Exact earlier elements resolved; acceptance area still open.** The brand and footer links pass, but the legal-page support links expose the same size failure; see R2-01. |
| Live headers, MIME, and cache policy were wrong | **Resolved.** CSP, Permissions-Policy, HSTS, `nosniff`, referrer policy, manifest MIME, immutable hashed assets, and no-cache worker headers are live. |
| Android location permissions were absent | **Resolved in source.** Coarse and fine location are declared; microphone permission is absent. |
| Direct routes, metadata, sitemap, and 404 were incomplete | **Resolved.** Direct routes, titles, metadata, sitemap, links, and HTTP 404 behavior pass. |
| Landing audience, structure, footer, and copy audit were incomplete | **Resolved.** Job, audience, first action, facts, How it works, limits, footer, and copy audit are present. |

## Clean-checkout and quality gates

A detached checkout at documentation baseline `34ba42e` was clean before and after the repository commands.

| Command or check | Result |
| --- | --- |
| `npm ci` | PASS — 149 packages installed; 0 vulnerabilities. |
| `npm run check` | PASS — no TypeScript errors. |
| `npm test` | PASS — 9/9 unit tests. |
| `npm run build` | PASS — production `dist/` created. |
| `npm run test:e2e` | PASS — 38/38 browser checks across desktop and 390 px phone. |
| All 12 declared claim commands, separately | PASS — 24/24 project runs. |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities. |
| `npx cap sync android` | PASS — web assets and Android plugins synchronized. |
| `/opt/fleet/lib/verify-url.sh <live-demo>` | PASS — 200, title, `lang`, one `h1`, main, image alternatives, labelled buttons, and no console errors. |

`./gradlew assembleDebug` could not run because this static review worker has no Java executable, `JAVA_HOME`, or Android SDK. The README explicitly defers APK compilation to an Android artifact work order and makes no installed-APK claim, so this environment limit is not an untested public claim.

## Performance and deployment policy

Fresh live mobile Lighthouse 12.8.2 on `/demo` scored:

- Performance: **98**
- Accessibility: **100**
- Best Practices: **100**
- SEO: **100**
- FCP: **1.0 s**
- LCP: **2.0 s**
- TBT: **140 ms**
- CLS: **0**
- Total transfer: **221 KiB**

Build budgets pass: JavaScript is 34,588 bytes raw and 11,646 bytes gzip; CSS is 25,818 bytes raw and 6,213 bytes gzip; fonts are 0 bytes; the mobile hero is 17,060 bytes. The generated social card, responsive notebook image, hand-authored icons, and provenance match `.factory/design.md`.

Live response policy passes: HTTPS/HSTS, CSP, Permissions-Policy, Referrer-Policy, and `nosniff` are present; hashed JavaScript is immutable for one year; `sw.js` is `no-cache`; the manifest is `application/manifest+json`; and unknown routes preserve HTTP 404.

## Final decision

**FAIL — 2 findings and 2 untested public claims.**
