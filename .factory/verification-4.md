# Remember hearing-aid settings by place — verification 4

**Verdict: PASS**

- Findings: **0**
- Untested public claims: **0**
- Implementation candidate: `e88fdaa1402039e1c10c9d3caf64b960e09cb5c7`
- Documentation baseline: `cc956374961bf9f1fcd36af177c5d554beb4d9df`
- Live URL: <https://hearing-mode-notes.sociobot.in>
- Verified: 5 September 2026 UTC
- Work order: `hearing-mode-notes-verify-4`

The implementation passes with no finding at any severity and no untested public claim.

## First screen before scrolling

- **Job:** remember which hearing-aid listening setup worked at a place.
- **Audience:** hearing-aid wearers who need a quick, private record of place-specific settings.
- **First action:** **Try it with sample data**. The adjacent text says that it loads three sample notes.

Fresh 1440×900 desktop and 390×844 phone contexts showed the job heading, audience sentence, and first action before scrolling. The first hero section also contains the three short facts about device storage, offline use, and optional location. The page uses plain task language without a product-name headline, metaphor heading, or generic marketing wording.

## Candidate and live identity

The reviewed runtime implementation is `e88fdaa1402039e1c10c9d3caf64b960e09cb5c7`. Commit `911002c878e6e493a370aa1e7f380a99e004a28b` changes only the offline test wait, and `cc956374961bf9f1fcd36af177c5d554beb4d9df` changes only handoff documentation. Neither changes the deployed product image.

A clean build at the documentation baseline byte-matched the live deployment:

| Artifact | Clean build and live SHA-256 |
| --- | --- |
| `index.html` | `6efc5898ffb716b83a70f055c117ee893e8d53b81612e9b979ef1213046f5c91` |
| `assets/index-ONfwrFyn.js` | `1e7c0f856d73ccda2654efa3eee540c968916a0ec3edaeff929d166a707e79f6` |
| `assets/index-2qlRfanv.css` | `e3139c1849ce54600b8c6e9c671d3a8be3b6e8678e41f99540a6ba590867695e` |
| `sw.js` | `331dee36f68cce4566fcb36dd4726cac04e1946e0ba08269cce28be480331302` |
| `manifest.webmanifest` | `73e0dc98a9b0481d7241c591fb3ea92fba01b4b719818bea80e22de2ebc0b006` |

## Findings

There are no findings.

The researched one-time purchase remains an external registration dependency. The public product has no price, paid gate, checkout action, mock payment, or purchase promise. The free notebook is complete. This is not a live defect or an untested public claim.

## Public claims

`.factory/claims.json` declares 12 public claims. The live landing page, app screens, Privacy, Terms, metadata, and README were compared with the manifest. Every claim-like statement maps to a declared claim; no false, incomplete, missing, or untested public claim remains.

Every declared command was run separately from the clean dependency install. Each passed in desktop Chromium and the 390 px phone project:

| Claim | Separate command result | Observable result |
| --- | --- | --- |
| `sample-sandbox` | PASS, 2/2 | Three samples loaded; a pre-existing real note remained after demo exit. |
| `recall-last-setup` | PASS, 2/2 | The latest successful place, mode, and volume appeared on Home. |
| `search-notes` | PASS, 2/2 | Note text reduced the sample history to the matching record. |
| `export-notes` | PASS, 2/2 | JSON parsed with three records; CSV had its header and three rows. |
| `import-notes` | PASS, 2/2 | A valid backup added the imported Library record. |
| `offline-reload` | PASS, 2/2 | A dedicated controlled context reloaded `/demo` offline with sample output. |
| `private-local-notes` | PASS, 2/2 | No microphone call or third-party request occurred. |
| `optional-location` | PASS, 2/2 | No call occurred before the button; exactly one followed it. |
| `no-device-control` | PASS, 2/2 | The representative flow made no device connection request. |
| `theme-choice` | PASS, 2/2 | System, light, and dark applied the matching document state. |
| `custom-place-tabs` | PASS, 2/2 | A new reusable place appeared in the setup form. |
| `reminder-fallback` | PASS, 2/2 | The saved Restaurant setup appeared when notifications were unavailable. |

**Untested claim count: 0.**

## Live workflows

### Sample and real data

- PASS — `/demo` immediately showed the Restaurant setup and three realistic Restaurant, Commute, and Work records with modes, levels, comfort, and observations.
- PASS — the persistent **Demo — sample data** label remained on Home and History and stated that nothing is saved to the real notebook.
- PASS — after adding a demo-only Cinema record, **Reset demo** restored exactly the original three samples.
- PASS — a real Library record saved before the demo survived reload, demo use, reset, and **Start for real**. The demo-only record never appeared in real history.

### Normal, invalid, boundary, and recovery paths

- PASS — a realistic real setup saved, appeared as the latest successful setup, and survived reload.
- PASS — submitting an empty setup focused the required Place field and exposed native validation.
- PASS — Place stopped at its 60-character boundary.
- PASS — denied location produced a specific message and still allowed the note to be saved.
- PASS — malformed branded and wrong-product imports were rejected; Settings still rendered after reload.
- PASS — delete cancellation kept the note; confirmed deletion removed it; Undo restored it.
- PASS — light, dark, and system themes applied, and a custom place appeared in the next setup form.
- PASS — empty, populated, no-result, and fatal-storage recovery states exist in the candidate; populated and no-result paths are covered by the browser suite.

### Keyboard and accessibility

- PASS — the first Tab reached **Skip to main content**, and Enter focused `main#main`.
- PASS — place tabs respond to Arrow keys, Escape restores the setup opener, and Save moves focus to the stable main landmark.
- PASS — in-app navigation focused the new `h1` and announced `Setup history page`.
- PASS — fresh live axe scans in desktop and dark/reduced-motion phone contexts found zero serious or critical violations.
- PASS — the 390 px layout had no horizontal overflow, every visible interactive target measured at least 44×44 CSS px, and 200% text did not create horizontal loss.
- PASS — reduced motion computed the toast transition at `1e-05s`; there is no loop or flash.
- PASS — `verify-url.sh` reported `lang=en`, one `h1`, one main landmark, complete image alternatives, labelled buttons, and no console error.

### Offline, privacy, links, and routes

- PASS — a fresh service-worker context installed and controlled cache `hearing-mode-notes-v6`; `/demo` reloaded offline with the sample and demo label intact.
- PASS — `registration.update()` completed with an activated controller. Source inspection confirms versioned caches, `skipWaiting`, `clients.claim`, old-cache removal, and the update notice path.
- PASS — complete live use made no third-party, analytics, note-sync, microphone, or device-connection request. Location was called only after its button.
- PASS — `/`, `/demo`, `/?demo=1`, `/history`, `/settings`, `/privacy`, `/terms`, and the public Source link returned 200. The support address is an explicit `mailto:` link.
- PASS — route titles are specific. An unknown URL returned HTTP 404 and the designed **This page was not found** page with a working home action. The expected 404 is not a defect.
- PASS — the sitemap lists all public routes, and `robots.txt` points to it.

## Earlier finding disposition

| Earlier finding | Current evidence and disposition |
| --- | --- |
| Missing service-worker icon and failed offline install | **Resolved.** The icon is served, cache v6 controls the page, and live offline reload passes. |
| Stale live deployment | **Resolved.** All five compared runtime artifacts byte-match the clean candidate build. |
| Skip link did not focus main | **Resolved.** Fresh live keyboard use focuses `main#main`. |
| Mobile Lighthouse and TBT missed the gate | **Resolved.** Fresh mobile Lighthouse is 99 performance with 0 ms TBT. |
| No isolated one-click sample | **Resolved.** `/demo`, three records, persistent label, reset, and separate storage pass live. |
| No claim manifest or claim commands | **Resolved.** Twelve claims exist and all twelve commands pass separately in both projects. |
| Broken checkout | **Resolved honestly.** No checkout, price, paid gate, or payment claim is exposed while registration is unavailable. |
| Malformed import permanently blanked the app | **Resolved.** Complete validation rejects the file before an atomic write; reload remains usable. |
| Dialog focus and place-tab arrow keys failed | **Resolved.** Live Escape, ArrowRight, cancel, and local save-focus checks pass. |
| Four phone links were under 44 px | **Resolved.** The fresh 390 px audit found no undersized visible target. |
| Live headers, MIME, and cache policy were wrong | **Resolved.** CSP, Permissions-Policy, HSTS, nosniff, and referrer policy are live; the manifest MIME, immutable hashed assets, and no-cache worker are correct. |
| Android location permissions were absent | **Resolved.** Coarse and fine location are declared; microphone permission is absent. |
| Direct routes, metadata, sitemap, and 404 were incomplete | **Resolved.** Direct routes, titles, canonical/social metadata, sitemap, and HTTP 404 pass. |
| Landing audience, structure, footer, and copy audit were incomplete | **Resolved.** The audience, first action, facts, How it works, limits, standard footer, and copy audit are present. |

No earlier minor or major finding remains open.

## Clean-checkout gates

| Command or check | Result |
| --- | --- |
| `npm ci` | PASS — 149 packages installed; 0 vulnerabilities. |
| `npm run check` | PASS — no TypeScript errors. |
| `npm test` | PASS — 9/9 unit tests. |
| `npm run build` | PASS — production `dist/` created. |
| `npm run test:e2e` | PASS — 38/38 across desktop and 390 px phone. |
| All 12 claim commands, separately | PASS — 24/24 project runs. |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities. |
| `npx cap sync android` | PASS — production web assets and Android plugins synchronized. |
| `/opt/fleet/lib/verify-url.sh <live-demo>` | PASS. |

`./gradlew assembleDebug` cannot run in this static-deploy worker because Java and the Android SDK are absent. The README explicitly defers APK compilation to an Android artifact work order and makes no APK download or installed-artifact claim. This environment limit is not a finding or an untested claim.

This is a static local-first product. Backend tenant isolation, server restart persistence, health, and 429/Retry-After checks do not apply. The brief does not benefit from an AI step; local note capture, search, export, and import cover the useful workflow without sending personal notes to a model.

## Performance and deployment policy

Fresh live mobile Lighthouse 12.8.2 on `/demo` scored:

- Performance: **99**
- Accessibility: **100**
- Best Practices: **100**
- SEO: **100**
- FCP: **1.0 s**
- LCP: **2.0 s**
- TBT: **0 ms**
- CLS: **0**
- Total transfer: **225 KiB**

Build budgets pass: JavaScript is 34,588 bytes raw and 11.65 KiB gzip; CSS is 25,818 bytes raw and 6.21 KiB gzip; fonts are 0 bytes; the mobile hero is 17,060 bytes. The generated 1200×630 social card, responsive notebook illustration, hand-authored icons, and provenance remain consistent with `.factory/design.md`.

Live response policy also passes: HTTPS/HSTS, CSP, Permissions-Policy, Referrer-Policy, and `nosniff` are present; hashed JavaScript is immutable for one year; `sw.js` is `no-cache`; the manifest is `application/manifest+json`; and unknown routes preserve HTTP 404.

## Final decision

**PASS — 0 findings and 0 untested public claims.**
