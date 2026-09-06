# Remember hearing-aid settings by place — review 3

**Verdict: FAIL**

- Findings: **1** (0 High, 1 Medium, 0 Low)
- Untested public claims: **0**
- Implementation candidate: `259a36a04489fcef97900ffa2cef034374acfeeb`
- Documentation baseline: `681ee36f416c1976ee2197655c4244f9ec20b10f`
- Live URL: <https://hearing-mode-notes.sociobot.in>
- Reviewed: 6 September 2026 UTC
- Work order: `hearing-mode-notes-review-3`

The product does not pass this strict review because its promised offline reload has a repeatable first-visit timing failure. No public claim is untested.

## First screen before scrolling

- **Job:** remember which hearing-aid setup worked at a place.
- **Audience:** hearing-aid wearers who need a private place-specific record.
- **First action:** **Try it with sample data**. The adjacent line says it loads three sample notes.

Fresh 1440×900 desktop and 390×844 phone contexts showed the job, audience, action, and three facts before scrolling. The heading names the job. The page uses plain words and no metaphor or mood heading.

## Candidate and live identity

The reviewed implementation is `259a36a04489fcef97900ffa2cef034374acfeeb`. The later commits through `681ee36f416c1976ee2197655c4244f9ec20b10f` change only `.factory/handoff.md` and add `.factory/verification-5.md`.

A clean candidate build matched the live deployment byte for byte for `index.html`, JavaScript, CSS, `sw.js`, the manifest, icon, 404 shell, and generated `/demo`, `/history`, `/settings`, `/privacy`, and `/terms` shells. This finding applies to the deployed candidate, not a stale release.

## Finding

| ID | Severity | Finding | Evidence and impact |
| --- | --- | --- | --- |
| R3-01 | **Medium** | Offline reload is not reliable immediately after the first visit, and its required claim test is flaky. | The first clean `npm run test:e2e` run failed the phone `@claim:offline-reload` case and finished 39/40. A full rerun passed 40/40, and the exact declared claim command passed 2/2. A five-repeat stress run then reproduced the failure once: 9/10 passed, with the failing phone page ending at `chrome-error://chromewebdata/` after `net::ERR_INTERNET_DISCONNECTED`. Against the live host, 10/10 fresh phone contexts failed when the connection was removed immediately after an active controller appeared. Five live runs with waits from 100 to 2,000 ms all passed. The public claim says “Works offline after the first visit,” so a repeatable readiness window and nondeterministic build proof are not acceptable for this core offline product. Data was not lost, and retrying after a short online wait recovers, so severity is Medium rather than High. |

Required remediation: make the first-visit offline-ready state reliable and expose a deterministic readiness condition. Then run the exact claim command, the full suite, and repeated phone offline transitions from fresh contexts with no failed run.

## Public claims

The landing page, product screens, Privacy, Terms, metadata, and README were compared with `.factory/claims.json`. All claim-like public statements map to one of 13 declared claims, and every ID appears in exactly one tagged test. There are **0 untested public claims**.

Every declared command was run separately from the detached candidate checkout. All 13 commands passed once in desktop Chromium and the 390 px phone project, for 26/26 project runs:

| Claim | Exact command result |
| --- | --- |
| `sample-sandbox` | PASS, 2/2 |
| `recall-last-setup` | PASS, 2/2 |
| `search-notes` | PASS, 2/2 |
| `export-notes` | PASS, 2/2 |
| `import-notes` | PASS, 2/2 |
| `offline-reload` | PASS, 2/2; repeated run exposed R3-01 |
| `private-local-notes` | PASS, 2/2 |
| `optional-location` | PASS, 2/2 |
| `no-device-control` | PASS, 2/2 |
| `theme-choice` | PASS, 2/2 |
| `custom-place-tabs` | PASS, 2/2 |
| `reminder-fallback` | PASS, 2/2 |
| `erase-local-data` | PASS, 2/2 |

## Live product exercises

### Sample and real data

- PASS — one click opened `/demo` with the Restaurant setup and three realistic records.
- PASS — the persistent **Demo — sample data** label said nothing is saved to the real notebook.
- PASS — a demo-only Library note raised the count to four; **Reset demo** restored three.
- PASS — **Start for real** discarded demo changes. A real Home note survived demo use, reset, exit, and reload.

### Normal, invalid, boundary, and recovery paths

- PASS — a Home / Everyday / Level 2 / comfort 4 note with literal special characters saved and survived reload.
- PASS — blank submission focused Place and exposed the browser's required-field message; Place stopped at 60 characters.
- PASS — denied location showed a recovery message and did not block saving.
- PASS — four-field search, no-result recovery, delete cancellation, confirmed deletion, and Undo worked.
- PASS — malformed branded import was rejected before a write and Settings still opened after reload.
- PASS — blocked IndexedDB showed **Your notebook could not open** and **Try again**.
- PASS — browser Back restored History, focus, its route announcement, and a non-zero scroll position.

### Accessibility, phone, and motion

- PASS — the skip link was first in keyboard order and moved focus into `main`; place tabs used Arrow keys and Escape restored the opener.
- PASS — fresh light desktop and dark/reduced-motion phone axe scans found no serious or critical violations.
- PASS — every visible control on `/`, `/demo`, `/history`, `/settings`, `/privacy`, `/terms`, and `/404.html` measured at least 44×44 CSS px at 390 px.
- PASS — 200% root text produced no horizontal loss. Reduced motion computed the toast transition as `1e-05s`.
- PASS — `/opt/fleet/lib/verify-url.sh` reported `lang=en`, one `h1`, one main landmark, complete image alternatives, labelled buttons, and no console errors.

### Privacy, links, and routes

- PASS — normal and sample flows made no third-party request. Microphone and device-connection counters remained zero; location ran only after its button.
- PASS — the six public routes returned 200 with route-specific titles, one `h1`, and one `main`.
- PASS — the Source link returned 200 and legal support is an explicit `mailto:` link.
- PASS — an unknown URL returned HTTP 404 with the designed **This page was not found** screen. The deliberate 404 is expected, not a defect.
- PASS — sitemap, robots, standalone manifest, CSP, Permissions-Policy, HSTS, referrer policy, `nosniff`, MIME, and cache headers are present and correct.

This product has no backend, so tenant isolation, server restart persistence, health, and 429/Retry-After do not apply. It is not a CLI, library, or desktop package. Private local capture and recall do not need an AI step.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Missing worker icon, failed installation, and stale deployment | **Resolved.** The icon is live, cache v7 installs, artifacts match, and delayed offline reload succeeds. R3-01 is a distinct first-ready timing failure. |
| Skip-link focus and mobile performance failures | **Resolved.** Keyboard focus enters main. Fresh Lighthouse scored 99 performance with 0 ms TBT. |
| Missing sample sandbox and claim contract | **Resolved.** The isolated sample, persistent label, reset, real-data separation, and 13 registered claim tests exist. |
| Broken checkout | **Resolved honestly.** No checkout, price, paid gate, or purchase promise is public while billing registration is unavailable. |
| Malformed import blanked the app | **Resolved.** Invalid data is rejected before the atomic write and reload remains usable. |
| Dialog focus and place-tab Arrow keys | **Resolved.** Escape restores the opener, Save has stable focus, and Arrow keys move selection. |
| Undersized phone links, including legal support | **Resolved.** The all-route 390 px audit found no visible target under 44×44 CSS px. |
| Missing live headers, MIME, and cache policy | **Resolved.** The deployed response policy matches the required behavior. |
| Missing Android location permissions | **Resolved in source.** Coarse and fine location are declared; microphone permission is absent. |
| Direct routes, metadata, sitemap, and 404 gaps | **Resolved.** Direct routes, titles, metadata, sitemap, links, and the deliberate HTTP 404 pass. |
| Landing audience, structure, footer, and copy audit gaps | **Resolved.** The first screen, standard sections, footer, and copy audit meet the contract. |
| Search claim covered only note text | **Resolved.** Its single tagged test covers place, mode, volume, and note text. |
| Local-data erasure was unregistered | **Resolved.** The declared test proves notes and settings stay erased after reload. |

No earlier reported finding remains open. R3-01 is newly established by repeated timing checks.

## Clean-checkout gates

A detached worktree at the implementation candidate was clean after repository checks.

| Command or check | Result |
| --- | --- |
| `npm ci` | PASS — 149 packages installed; 0 vulnerabilities. |
| `npm run check` | PASS — no TypeScript errors. |
| `npm test` | PASS — 9/9 unit tests. |
| `npm run build` | PASS — production `dist/` created. |
| `npm run test:e2e` | FAIL 39/40 on the first run; PASS 40/40 on rerun. The failure is R3-01. |
| All 13 declared claim commands, separately | PASS — 26/26 project runs. |
| Offline claim with `--repeat-each=5` | FAIL — 9/10 passed; one phone run failed. |
| `npm audit --omit=dev` | PASS — 0 production vulnerabilities. |
| `npx cap sync android` | PASS. |
| `/opt/fleet/lib/verify-url.sh <live-demo>` | PASS. |

`./gradlew assembleDebug` remains unavailable because Java, `JAVA_HOME`, and the Android SDK are absent. The README defers APK compilation and makes no APK availability claim, so this environment limit is not an additional finding or an untested claim.

## Performance and bundle budgets

Fresh live mobile Lighthouse 12.8.2 on `/demo` scored 99 performance, 100 accessibility, 100 best practices, and 100 SEO. FCP was 0.91 s, LCP 1.96 s, TBT 0 ms, CLS 0, and transfer 230,448 bytes.

The clean build uses 34,775 bytes of JavaScript (11,619 gzip), 25,931 bytes of CSS (6,257 gzip), no fonts, and a 17,060-byte mobile hero. These pass the declared budgets.

Evidence is under `/work/.evidence/review-3/`, including the live screenshots, browser audits, Lighthouse JSON, claim logs, clean gate logs, failed traces, and repeated offline results.

## Final decision

**FAIL — 1 finding and 0 untested public claims.**
