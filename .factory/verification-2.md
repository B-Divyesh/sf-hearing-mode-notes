# Independent verification 2 — FAIL

**Candidate:** `781ffe6ec9810e07e7494da0f0fdb5c59f8ca230` (`main`)
**Live URL:** https://hearing-mode-notes.sociobot.in
**Verified:** 2026-08-28 UTC
**Scope:** independent clean-install verification against the researched brief and factory acceptance contract. No product source was changed.

## Decision

**FAIL.** The live deployment exactly serves the candidate web assets, but its service worker cannot install. The product therefore fails the brief's offline-first/PWA requirement and cannot provide reliable offline Android/PWA use.

### Blocking defect

- **High — live PWA service worker installation fails, so offline reload fails.** `public/sw.js` precaches `/icon.svg`, and `index.html` also references that path, but the candidate's `dist/` does not contain `icon.svg`. The live URL returns `404 text/html` for `/icon.svg`. In a fresh Chromium context, a direct registration initially returns an `installing` worker, then `navigator.serviceWorker.getRegistration()` returns `false`; there is no controller. An offline reload then fails with `ERR_INTERNET_DISCONNECTED`. Local `vite preview` masks this packaging error by responding to the missing path with its SPA fallback, so its local offline test is a false positive for the deployed host.

## Severity-ranked defects

| Severity | Finding | Evidence / impact |
| --- | --- | --- |
| High | Service worker is rejected in production | See blocking defect. This defeats the required offline app shell and installed-app reliability. |
| Medium | The skip link does not transfer keyboard focus into main content | `index.html` links to `#main`, but `<main id="main">` is not focusable. Fresh keyboard test: first `Tab` focused `.skip-link`; `Enter` left `document.activeElement` outside `#main`. Subsequent tabbing returns to header controls rather than bypassing them. This fails the keyboard-only acceptance expectation. |
| Medium | Mobile Lighthouse performance gate is missed | Three fresh local production-preview Lighthouse runs: Performance **81/83/89** (required ≥90); TBT **680/590/370 ms** (target <200 ms). FCP 1.1/1.0/1.0 s, LCP 2.4/2.5/2.3 s, CLS 0. Accessibility/Best Practices/SEO each scored 100. |
| Low | Deployed response policies do not meet the stated static-cache policy | Hashed JS/CSS are served as `Cache-Control: public, must-revalidate, max-age=30`, rather than long-lived immutable assets. The live manifest is `application/octet-stream`; no `Content-Security-Policy` or `Permissions-Policy` is sent. Positive headers: HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`. |

## Commands and results

Clean checkout was already at the candidate SHA with a clean worktree before QA.

| Command / check | Result |
| --- | --- |
| `npm ci` | PASS — 150 packages audited; 0 vulnerabilities. |
| `npm run check` | PASS — TypeScript no errors. |
| `npm test` | PASS — 7/7 Vitest unit tests. |
| `npm run build` | PASS — production `dist/` created. |
| `npm run test:e2e` against a fresh production preview | PASS — 5/5 Playwright Pixel 5 tests: save/recall/search/edit, axe, offline local preview, legal routes, licensed custom place. |
| `./gradlew assembleDebug` | Not executable in this non-Android deploy container: `JAVA_HOME` and `java` are absent. This is an environment limitation; no APK claim was made. |

## Product and browser evidence

- Normal end-to-end browser run (desktop): saved Restaurant / Conversation / volume 3 / comfort 4 / note, recalled it as the latest successful setup, searched, exported JSON, and exercised denied-notification fallback (`Reminder: Restaurant: Conversation · Volume 3 · Back to wall`).
- Recovery paths: malformed JSON import showed a parse-error toast; location remained optional; delete confirmation offered Undo. A 61-character place was clamped to its 60-character boundary. After 12 records, a 13th attempt routed to Settings with the free-limit explanation.
- Local PWA: with a working local preview service worker, saved data survived an explicit `context.setOffline(true)` reload; cache version was `hearing-mode-notes-v2`. Production behavior is the High defect above.
- Responsive/browser: at 1440px and 390px, no horizontal overflow; 390px fixed nav measured 390×69px and the floating new-note control 52×50px. Reduced-motion media query reduced toast transition to `1e-05s`. Designed `:focus-visible` ring is present, subject to the skip-link defect.
- Accessibility: one `h1`, `lang=en`, `main`, page title, labelled controls, and meaningful hero alt text observed. Fresh axe scans returned **0 serious/critical** issues; axe does not detect the failed skip-link focus behavior.
- Privacy/network: normal browser use made no third-party requests and generated no console/page errors. Source and observed behavior use IndexedDB/local storage locally; no microphone or passive location request was made. The only external endpoint in source is the conditional Sociobot license checkout/verification path.

## Deployment identity and asset comparison

`curl` confirmed live `/` is HTTP 200 and byte-for-byte matches `dist/index.html`; live JS, CSS, `sw.js`, and `manifest.webmanifest` SHA-256 values matched the freshly built candidate:

| Asset | SHA-256 |
| --- | --- |
| `assets/index-BwEBJuFg.js` | `82cc134ba0a2cf376dd591a28197a8fe8eae39a92c79026b9e5ceb9d1028baea` |
| `assets/index-DE0F2El5.css` | `64df183ed92001cb2e9d5af076b7d161712d7d259708dd140809caccc058b67f` |
| `sw.js` | `118184aacc80a75aafdb1c56f3a1226fa72438e7dcbebf140da7a8fd1273373d` |
| `manifest.webmanifest` | `38cc0b431c4de9efacfeb26d6053352f4c6e50f09716b6f3aa03ce89a8ab3cc0` |

The identity match confirms this is a candidate packaging/deployment defect, not a stale live release.

## Build budgets

- Initial JavaScript: 34,097 bytes / 11,740 gzip — PASS against 200 KB.
- CSS: 23,628 bytes / 5,810 gzip — PASS against 50 KB.
- Hero: 17,060 bytes (480px mobile), 43,058 bytes (720px), 160,368 bytes (1280px) — PASS against 300 KB.
- No third-party font/script payload was observed.

## Required remediation and re-verification

1. Ship the authored SVG at `public/icon.svg` (or remove both the page and service-worker references) and rebuild/redeploy.
2. Verify from a fresh live browser context that a service worker is active/controller is true and that an offline reload succeeds after the app shell has installed.
3. Make the skip target focusable and transfer focus on activation; repeat keyboard-only navigation.
4. Resolve the mobile Lighthouse performance regression and supply long-lived immutable caching for hashed assets. Add CSP and an appropriately scoped Permissions-Policy at the deployment layer.
