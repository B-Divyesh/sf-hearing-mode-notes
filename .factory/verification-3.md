# Independent verification 3 — FAIL

**Candidate:** `95caeec06048340b7a99e77bc0dceea7c71141cc` (`main`)  
**Live URL:** https://hearing-mode-notes.sociobot.in  
**Verified:** 2026-08-28 UTC  
**Work order:** `hearing-mode-notes-verify-3`  
**Scope:** clean-checkout product, deployment, PWA, accessibility, privacy, performance, and Android-project verification against `.factory/brief.json`, `.factory/design.md`, and `AGENTS.md`. No product code was changed.

## Decision

**FAIL.** The previous stale-deployment/service-worker blocker is resolved: the live deployment now byte-matches the candidate build, installs `hearing-mode-notes-v3`, and reloads saved notes offline. However, the release still has two High-severity defects: the one-time purchase cannot be started, and a structurally invalid but correctly branded import can persist corrupt settings and leave the app blank on every subsequent launch.

## Severity-ranked defects

| Severity | Finding | Fresh evidence and impact |
| --- | --- | --- |
| **High** | Production purchase is unavailable | `GET https://api.sociobot.in/api/v1/products/hearing-mode-notes/checkout` returned HTTP **404** with `{"error":"enabled factory product","status":404}`. The visible “Buy the one-time unlock” action therefore cannot complete the brief's one-time purchase flow. The verify endpoint itself is online and correctly returned `{valid:false,reason:"invalid"}` for an invalid token, including CORS for the product origin. |
| **High** | Import accepts corrupt settings and permanently blanks the app for that browser profile | Through the live “Import JSON” control, a branded/versioned bundle with a minimally shaped note and `settings: {theme:"invalid",customPlaces:null}` was accepted and written to IndexedDB. On reload the page raised `i.customPlaces is not iterable`; `#app` was empty and no recovery UI was rendered. Reload repeats the failure because the invalid setting persists. Recovery requires clearing site data outside the app, which can also discard the user's real notes. `validateImport()` checks only a few note fields and does not validate settings or the complete note schema. |
| **Medium** | Dialog and save focus management fails keyboard/screen-reader expectations | Opening the note dialog by keyboard focuses “Home,” but Escape closes it while focus remains on that now-hidden button; the next Tab jumps to the footer instead of returning to the destroyed opener. After a keyboard-only save, focus lands on `<body>`. The core workflow is keyboard-operable, but context is lost after close/save. |
| **Medium** | Several mobile interactive targets are below the required 44×44 CSS px | At 390×844, the brand link measured 194×28 and footer Privacy/Terms/Source links measured 51×16, 41×16, and 48×16. These violate the attached accessibility/design baseline even though axe does not flag them. |
| **Medium** | Live response policies do not match the shipped `_headers` contract | The live document has no `Content-Security-Policy` or `Permissions-Policy`. Hashed JS/CSS, images, and `sw.js` all receive `Cache-Control: public, must-revalidate, max-age=30` rather than immutable one-year asset caching and no-cache service-worker handling. The manifest is served as `application/octet-stream`, not `application/manifest+json`. Positive controls: HTTPS/HSTS, `nosniff`, strict referrer policy, Brotli for JS/CSS. |
| **Medium** | Stated mobile performance gate is not repeatable in the supplied environment | Three fresh Lighthouse 12.8.2 runs against live scored **87/91/90** performance; TBT was **474/359/376 ms** (target <200 ms). LCP was 1.96/1.97/1.97 s and CLS 0. Three runs against the same clean local build were 87/92/93 with TBT 477/316/235 ms, showing this is not a stale deployment difference. Accessibility, Best Practices, and SEO were 100 in every live run. |
| **Medium** | Android project omits permissions required by its advertised optional location action | `android/app/src/main/AndroidManifest.xml` declares only `android.permission.INTERNET`; neither coarse nor fine location permission exists anywhere in the Android/Capacitor manifests. The web action calls `navigator.geolocation`, so the packaged Android WebView cannot grant OS location access. This does positively confirm there is no microphone permission. Runtime APK confirmation was unavailable because this worker has no Java or Android SDK. |

## Clean-checkout gates

A detached worktree was created at the exact candidate SHA; it was clean before and after the repository gates.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 149 packages installed; 0 vulnerabilities. |
| `npm run check` | PASS — TypeScript emitted no errors. |
| Lint | Not available — no lint script/configuration is provided. |
| `npm test` | PASS — 9/9 Vitest tests across 3 files. |
| `npm run build` | PASS — exact Vite/postbuild production command produced `dist/`. |
| `npm run test:e2e` | PASS — 12/12 Playwright tests in desktop Chromium and the exact 390×844 mobile project. |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities. |
| `npx cap sync android` | PASS — clean production web assets copied and Android plugins updated. |
| `cd android && ./gradlew assembleDebug` | **Not executable in this worker:** `java` is absent, `JAVA_HOME` is unset, and no Android SDK variables exist. No APK claim is made. |

There is no library/CLI/backend surface, so consumer packaging, API concurrency, server persistence, and server health/build-identity checks do not apply.

## Live product exercises

### Core job and recovery paths

- PASS — empty state and primary action were clear at desktop and 390px mobile.
- PASS — saved `Restaurant & Café <quiet>` / `Conversation` / `3 / two taps down` / comfort 4 / a seating note, then recalled it on Home, searched by detail, edited volume, and observed persisted output.
- PASS — required blank input moved focus to the missing Place field; place length stopped at its 60-character boundary; special characters rendered as text.
- PASS — denied geolocation produced a specific recoverable message and still allowed save.
- PASS — reminder use without notification permission produced an on-screen/clipboard fallback.
- PASS — JSON and CSV downloaded with dated product filenames. Unparseable JSON and a wrong-product bundle produced visible error messages without altering the current session.
- **FAIL** — the correctly branded malformed bundle described above corrupts the next and subsequent launches.
- PASS — delete cancellation kept the note; confirmed deletion offered Undo and restored it.
- PASS — importing 12 valid notes reached the free boundary; a new-note action routed to Settings with the 12-note explanation. Export remained available.
- PASS — no console errors, page errors, request failures, or unexpected outbound hosts occurred during the complete normal flow.

### PWA, persistence, and update behavior

- PASS — a fresh context obtained an active `/sw.js` controller and `hearing-mode-notes-v3` cache; the formerly missing `/icon.svg` now returns HTTP 200 as `image/svg+xml`.
- PASS — after saving Home/Everyday, `context.setOffline(true)` plus reload retained IndexedDB data and rendered “Offline — notes still work.” The expected navigation request failed with `ERR_INTERNET_DISCONNECTED` and the service worker supplied the app shell.
- PASS by inspection/runtime update check — `registration.update()` completes; the worker uses a versioned cache, `skipWaiting()`, `clients.claim()`, old-cache removal, and an in-app `SW_UPDATED` message path. A real transition between two separately deployed worker versions was not available in this single-candidate verification.
- PASS — Chromium reported a valid install manifest with no manifest parsing errors, standalone display, versioned start URL, 192/512 icons, and a maskable 512 icon.

### Accessibility and responsive behavior

- PASS — desktop and 390px dark/reduced-motion axe scans found **0 serious or critical** findings; Lighthouse accessibility was 100 in all six runs.
- PASS — `lang="en"`, meaningful title, exactly one `h1`, one `main`, labelled controls, meaningful hero alt text, no horizontal overflow at 390px, and a visible 3px focus ring were observed.
- PASS — first Tab focused “Skip to main content”; Enter moved focus to `main#main`. A complete note could be saved using only Tab, Enter, and typing.
- PASS — reduced motion changed transitions to effectively instant (`0.01ms` / computed `1e-05s`) with no looping or flashing content.
- FAIL — focus restoration and touch-target exceptions are recorded above.

### Privacy and outbound requests

- PASS — normal use contacted only `hearing-mode-notes.sociobot.in`; no analytics, advertising, runtime CDN, microphone API, passive location, or note-sync request was found or observed.
- PASS — notes/settings use IndexedDB; license state alone uses product-scoped local storage. Optional coordinates remain in the note record.
- PASS — Android declares no microphone permission. Location is requested only from the explicit button, subject to the Android packaging defect above.
- PASS — a returned `?license=` token was stored under `sb_license:hearing-mode-notes`, removed from the URL, and verified only against the Sociobot API. A real invalid token kept the app locked and showed “License no longer active” without console/page errors.
- FAIL — the checkout service is unregistered/unavailable as recorded above.

## Deployment identity

The live deployment matches the clean candidate build byte for byte for all compared shell/code artifacts:

| Artifact | Clean build and live SHA-256 |
| --- | --- |
| `index.html` | `aafb4c1d409253664671ebb266a526e1d75b3fdca250efbf70d906cad21067ae` |
| `assets/index-B0J2NDwn.js` | `7c48e752f8a402191dc9aadb721e4c8a83baa239f74afd799d76477076ff3a07` |
| `assets/index-DE0F2El5.css` | `64df183ed92001cb2e9d5af076b7d161712d7d259708dd140809caccc058b67f` |
| `sw.js` | `095a0f706817da32f10394c47bdd1b85b0581dadc04c9f27089a76f3bdc0796b` |
| `manifest.webmanifest` | `4933b64c5fba00cbfb31d5961e786adbcd674ed27beb3414cd3f2fdd0d92d759` |
| `icon.svg` | `ada4d0f16e5fbbf17f3e0fad54adf3eaecd0a659739b9a01cfd079f089017745` |

The live `Last-Modified` value was `Fri, 28 Aug 2026 05:59:19 GMT`. Direct `/privacy/` and `/terms/` returned HTTP 200 and matched the generated legal shell.

## Bundle budgets

- JavaScript: **34,556 B raw / 11,846 B gzip** — PASS (≤200 KB).
- CSS: **23,628 B raw / 5,836 B gzip** — PASS (≤50 KB).
- Fonts: **0 B** — PASS; system stacks only.
- Mobile hero WebP: **17,060 B** — PASS (≤300 KB); 720/1280 variants are 43,058/160,368 B.
- LCP and CLS passed; Lighthouse performance/TBT did not consistently meet the stated gate, as detailed above.

## Required before PASS

1. Register/enable the Sociobot production product and verify the live checkout redirects through a completed test purchase/return flow.
2. Strictly validate imported notes and settings before any IndexedDB write; make import atomic and ensure startup offers an in-app recovery path for invalid persisted data.
3. Restore focus to a stable triggering control after dialog close/save and provide ≥44×44 CSS px mobile targets for every link/control.
4. Configure the actual host to emit the repository's CSP, Permissions-Policy, manifest MIME, immutable fingerprinted-asset caching, and no-cache service-worker policy.
5. Bring repeatable mobile Lighthouse/TBT within the recorded gate.
6. Add contextual Android location permissions (without adding microphone permission), then build and exercise a debug APK in an SDK-equipped worker.
