# Review 1 — remember hearing-aid settings by place

**Verdict: FAIL**

- Findings: **10** (4 High, 6 Medium, 0 Low)
- Untested public claims: **23**
- Implementation candidate: `22cbe818b39b24facf2e9aeaf4e0487208a0c659`
- Documentation baseline: `e0ee383b8e91f596e35eb9541a3b962f9e2ed377`
- Live URL: <https://hearing-mode-notes.sociobot.in>
- Reviewed: 5 September 2026 UTC

PASS is not allowed because findings and untested claims remain.

## First screen before scrolling

- **Job:** remember the hearing-aid mode, volume, comfort, and seating detail that worked at a place.
- **Audience:** hearing-aid wearers who change settings by place. The researched audience is clear, but the first-screen sentence does not name hearing-aid wearers.
- **First action shown:** `Note a setup`. It is visible without scrolling at 1440×900 and 390×844. The required `Try it with sample data` action is absent.

The headline names the job in eight words. The job, supporting sentence, action, and facts fit in the first phone viewport. The supporting sentence explains the action but does not state who the product is for.

All live data exercises used new temporary browser contexts. They did not open or change an existing browser profile. The required sample sandbox does not exist, so sample reset and separation from real data could not be proven.

## Candidate and live identity

The last product implementation commit is `22cbe818b39b24facf2e9aeaf4e0487208a0c659`. Commits `95caeec06048340b7a99e77bc0dceea7c71141cc` and `e0ee383b8e91f596e35eb9541a3b962f9e2ed377` change only review documentation. A fresh build at the current clean checkout byte-matches the live product:

| Artifact | Local and live SHA-256 |
| --- | --- |
| `index.html` | `aafb4c1d409253664671ebb266a526e1d75b3fdca250efbf70d906cad21067ae` |
| `assets/index-B0J2NDwn.js` | `7c48e752f8a402191dc9aadb721e4c8a83baa239f74afd799d76477076ff3a07` |
| `sw.js` | `095a0f706817da32f10394c47bdd1b85b0581dadc04c9f27089a76f3bdc0796b` |
| `manifest.webmanifest` | `4933b64c5fba00cbfb31d5961e786adbcd674ed27beb3414cd3f2fdd0d92d759` |

The live runtime is the reviewed implementation. No fresh product image is needed for the later report-only commits.

## Findings

| ID | Severity | Finding | Current evidence |
| --- | --- | --- | --- |
| R1-01 | **High** | The required one-click sample sandbox is absent. | There is no sample action on the first screen. `/demo` and `/?demo=1` both return the ordinary empty app with the home title. Neither has the persistent sample label, `Reset demo`, nor `Start for real`. Both open the normal `hearing-mode-notes` IndexedDB name. `.factory/demo.md` is absent. Sample output, reset, and real-data isolation cannot be exercised. |
| R1-02 | **High** | No public claim is registered or covered by the required claim test. | `.factory/claims.json` is absent and `rg -n '@claim:' .` finds zero tags. The site and README make 23 distinct claim families listed below. Existing unit and end-to-end tests are useful, but none is the required one-test-per-claim sandbox evidence. Several claims are also false or incomplete in production. |
| R1-03 | **High** | The visible one-time purchase cannot start. | `GET https://api.sociobot.in/api/v1/products/hearing-mode-notes/checkout` returns HTTP 404 with `{"error":"enabled factory product","status":404}`. This 404 breaks the buy action; it is not an expected product 404 page. The verify endpoint is online and returns a valid structured `invalid` result for a test token. This finding from verification 3 is unchanged. |
| R1-04 | **High** | A structurally invalid branded import corrupts the app and removes all recovery UI. | Importing a version-1 bundle with a minimally accepted note and `settings: {"theme":"invalid","customPlaces":null}` produces `TypeError: i.customPlaces is not iterable`. The app becomes empty with zero `h1` elements and fails again after reload because the invalid settings persist. The user must clear site data outside the app and may lose valid notes. This finding from verification 3 is unchanged. |
| R1-05 | **Medium** | Dialog focus and the promised place-tag arrow keys are incomplete. | Escape from the setup dialog leaves focus on `<body>`. After Save, focus also lands on `<body>`, not a stable result or trigger. `ArrowRight` on the Home place tag leaves focus and selection on Home, despite `.factory/design.md` promising arrow-key support for tag groups. The native comfort radio group does move from rating 1 to 2. The repaired skip link passes. |
| R1-06 | **Medium** | Four phone links remain below the 44×44 CSS-pixel target. | At 390×844, the brand link measures 194×28; footer Privacy, Terms, and Source links measure 51×16, 41×16, and 48×16. This verification-3 finding is unchanged. Other main controls meet the target. |
| R1-07 | **Medium** | The live host still does not apply the shipped response policy. | The document has no CSP or Permissions-Policy. The manifest is `application/octet-stream`. Hashed JS, `sw.js`, and the document all receive `Cache-Control: public, must-revalidate, max-age=30`; the repository promises immutable fingerprinted assets and no-cache service-worker handling. HSTS, `nosniff`, and strict-origin referrer policy are present. This verification-2/3 finding is unchanged. |
| R1-08 | **Medium** | The Android project still cannot grant the advertised optional location action. | `android/app/src/main/AndroidManifest.xml` declares only `android.permission.INTERNET`; it declares neither coarse nor fine location. The packaged web action calls `navigator.geolocation`. No microphone permission is present. The later-APK scope remains documented, but this source defect is unresolved. |
| R1-09 | **Medium** | Routing, route metadata, and the 404 behavior do not meet the site contract. | Privacy and Terms retain the home title instead of route-specific titles. History and Settings keep URL `/`; reload returns Home and browser history cannot restore the view. An unknown path returns HTTP 200 and the ordinary home app, not a designed 404 response. There is no canonical, Open Graph, Twitter card, apple-touch icon, or 1200×630 social image. There is no `staticwebapp.config.json`, and the sitemap cannot list the missing demo. |
| R1-10 | **Medium** | The landing structure and copy evidence are incomplete. | The first-screen sentence does not name the audience. The landing page has no `How it works` section and no paid-tier section; pricing appears only after opening Settings. The header has no Demo or Privacy link, and the footer lacks `Built by Param Factory` and a build/version. Headings such as `A fresh page` and `Keep every place you learn` do not name the section in plain words. `.factory/copy-audit.md` is absent. The visual system itself is distinct and consistent with `.factory/design.md`. |

## Public claim audit

Every row below has no `.factory/claims.json` entry, no `@claim:<id>` test, and no declared sandbox command. Manual evidence does not replace the required build-time claim contract.

| # | Public or documented claim family | Manual disposition |
| ---: | --- | --- |
| 1 | Saves place, listening mode, volume, observations, and comfort | Observed working. Untested as a claim. |
| 2 | Brings back a successful setup in a few seconds or under 10 seconds | Output observed; the quantitative limit is not measured by a claim test. |
| 3 | Searches place, mode, volume, and note text | Observed working. Untested as a claim. |
| 4 | Shows a requested lock-screen/browser reminder | Fallback observed; an OS lock screen is not covered by a claim test. |
| 5 | Copies or shows a reminder when notifications are unavailable | Observed on-screen fallback. Untested as a claim. |
| 6 | Requests location only after a button press and stores it in the note | Denied-permission recovery observed; storage/network claim is unregistered. Android packaging is incomplete. |
| 7 | Stores notes and settings locally and survives reload | Observed with IndexedDB. Untested as a claim. |
| 8 | Works after an offline reload | Passed five fresh live offline runs. Untested as a claim. |
| 9 | Exports a complete JSON backup | One-note export inspected. Untested as a claim. |
| 10 | Exports portable CSV | Header and one data row inspected. Untested as a claim. |
| 11 | Imports a JSON backup | Valid import works, but structural validation is unsafe. Untested as a claim. |
| 12 | Supports light, dark, and system themes | Dark selection observed. Untested as a claim. |
| 13 | Supports keyboard and screen-reader paths | Partly false because focus restoration and tag-arrow behavior fail. Untested as a claim. |
| 14 | Includes 12 free notes | Boundary observed. Untested as a claim. |
| 15 | ₹399 one-time purchase gives unlimited notes and custom place tags | False end to end because checkout returns 404. Untested as a claim. |
| 16 | Export, accessibility, reminders, and safety behavior remain free | Free export observed; full set is unregistered. |
| 17 | No microphone access or permission | Source, manifest, and request review support it. Untested as a claim. |
| 18 | No analytics, advertising, tracking, runtime CDN, account, or cloud note storage | Normal flow contacted only the product host. Untested as a claim. |
| 19 | Notes and health details do not leave the device | Normal flow supports it; the required whole-demo request-log test is absent. |
| 20 | Does not control hearing aids, amplify sound, test hearing, or give medical advice | Source and UI support the boundary. Untested as a claim. |
| 21 | Users can erase data, remove a license, and keep exports | Local erase and export observed. Untested as a claim. |
| 22 | Installable, versioned PWA updates and continues offline | Manifest and worker inspected; offline passed. No version-transition claim test exists. |
| 23 | Production output supplies CSP, permissions, MIME, immutable assets, and no-cache worker policy | The build contains `_headers`; the live host does not apply most of it. Untested as a claim. |

**Untested claim count: 23.**

## Live workflow results

### Core, invalid, boundary, and recovery paths

- PASS — a realistic Restaurant note with Conversation mode, `Level 3 — two taps down`, comfort 4, and seating details rendered as the latest successful setup and survived reload.
- PASS — a realistic Café note was found by note text.
- PASS — blank required input moved focus to Place and exposed the browser validation message.
- PASS — a 65-character place entry stopped at the 60-character boundary.
- PASS — denied location showed `Location permission was not granted. The note can still be saved.` and did not block Save.
- PASS — delete cancel kept the note; confirmed delete showed Undo; Undo restored it.
- PASS — `Erase all local data` cleared notes in the temporary context.
- PASS — importing 12 valid notes reached the free limit and redirected a new-note action to Settings with the correct message.
- PASS — JSON and CSV downloads used dated names and contained the saved row.
- FAIL — the corrupt branded import causes a persistent blank app (R1-04).

### Demo and data separation

- FAIL — there is no demo entry action or seeded output.
- FAIL — there is no persistent sample label, reset, start-real action, or separate storage namespace.
- NOT TESTABLE — reset and proof that demo changes cannot touch real data, because no demo exists. These are covered by R1-01 rather than counted again.

### Accessibility and responsive behavior

- PASS — `/opt/fleet/lib/verify-url.sh` reports title, `lang=en`, one `h1`, `main`, image alt text, labelled buttons, and no load console error.
- PASS — `@axe-core/cli` 4.10.3 reports 0 violations on the live home page. The repository's Playwright axe checks pass in light and dark/reduced-motion modes.
- PASS — the skip link is first in tab order and Enter focuses `main#main`.
- PASS — the native rating group responds to arrow keys.
- PASS — reduced motion computes animation/transition durations at `0.01ms`; no loop or flash was found.
- PASS — no horizontal overflow at 390 px; desktop and phone layouts are readable.
- FAIL — dialog focus/tag arrows (R1-05) and four phone targets (R1-06).

### Offline, update, privacy, and links

- PASS — five of five fresh live contexts installed `hearing-mode-notes-v3`, saved a setup, went offline, reloaded, and retained the setup with the offline label.
- PASS by inspection — the worker has a versioned cache, `skipWaiting`, `clients.claim`, old-cache removal, and an update message. A transition between two deployed worker versions was not available.
- PASS — normal save, search, reminder fallback, export, theme, delete, and erase flows contacted only `hearing-mode-notes.sociobot.in`; no console or page errors occurred.
- PASS — internal Privacy and Terms links return 200; the public Source link returns 200; the support address is an explicit `mailto:` link.
- FAIL — the buy link is broken (R1-03), and unknown-route behavior is wrong (R1-09).
- Not applicable — this static/local-first product has no product backend, tenant store, health endpoint, restart-persistence contract, or product request-rate limit to test.

### Android scope

- PASS — `npx cap sync android` copies the production bundle and updates plugins.
- FAIL — location permissions are absent (R1-08).
- Environment limit, not an extra finding — `./gradlew assembleDebug` cannot run because this worker has no Java/JDK or Android SDK. README explicitly defers APK compilation and makes no installed-APK claim.

## Clean-checkout commands

The checkout was clean at `e0ee383b8e91f596e35eb9541a3b962f9e2ed377` before review. Product code was not changed.

| Command | Result |
| --- | --- |
| `npm install` | PASS — 149 packages installed, 0 vulnerabilities. |
| `npm run dev -- --host 127.0.0.1` plus HTTP probe | PASS — Vite started and `/` returned 200. |
| `npm run check` | PASS — no TypeScript errors. |
| `npm test` | PASS — 9/9. |
| `npm run build` | PASS — `dist/` produced. |
| `npm run test:e2e` | PASS — 12/12 across desktop and 390 px projects. |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities. |
| `npx cap sync android` | PASS. |
| `./gradlew assembleDebug` | Not runnable — Java/JDK absent; APK is explicitly deferred. |
| `/opt/fleet/lib/verify-url.sh <live> <evidence>` | PASS. |
| `npx @axe-core/cli@4.10.2 <live>` with matched Chrome 145 | PASS — 0 violations. |

There is no declared claim command because `.factory/claims.json` does not exist. This absence is R1-02, not a skipped command.

## Performance and bundle evidence

- JS: 34,556 bytes raw / 11,846 gzip — PASS against 200 KB.
- CSS: 23,628 bytes raw / 5,836 gzip — PASS against 50 KB.
- Fonts: 0 bytes — PASS.
- Mobile hero: 17,060 bytes; larger variants 43,058 and 160,368 bytes — PASS against 300 KB.
- Three completed Lighthouse 12.8.2 live JSON reports: Performance **99/99/99**, Accessibility **100/100/100**, Best Practices **100/100/100**, SEO **100/100/100**; LCP **1.96/1.99/1.95 s**, TBT **0/0/0 ms**, CLS **0/0/0**. Chromium emitted a post-report tab-crash diagnostic after each file was written; the completed reports contain all listed categories and metrics.

The earlier performance finding is resolved in this environment. It is not included in the finding count.

## Earlier finding disposition

| Earlier issue | Current disposition |
| --- | --- |
| Missing precached icon prevented service-worker installation | **Resolved.** `/icon.svg` returns 200 as SVG; fresh worker and offline reload pass. |
| Skip link did not focus main | **Resolved.** First Tab and Enter focus `main#main`. |
| Mobile Lighthouse/TBT missed the gate | **Resolved in current measurement.** Three completed reports score 99 with 0 ms TBT; see the tool caveat above. |
| Live deployment was stale | **Resolved.** Compared shell/code artifacts byte-match the implementation candidate. |
| Checkout returned 404 | **Open — R1-03.** |
| Invalid branded import blanked the app | **Open — R1-04.** |
| Dialog/save focus was lost | **Open — R1-05.** |
| Four phone links were too small | **Open — R1-06.** |
| Live response policy differed from `_headers` | **Open — R1-07.** |
| Android location permissions were missing | **Open — R1-08.** |

## Final decision

**FAIL — 10 findings and 23 untested public claims.**

The core local notebook is useful, fast, visually specific, and works offline. It cannot pass this review until the sample sandbox and claims contract exist, checkout works, corrupt imports cannot persist, and all remaining medium findings are closed and retested.
