# Hearing Mode Notes repair 3 handoff

Date: 2026-09-05 UTC

## Result

**PASS — the two review findings and two untested claim families are resolved.**

- Implementation: `259a36a04489fcef97900ffa2cef034374acfeeb`
  - `c462d20ddc0c1ec8c90ec842ba6795c31b19ef8f` repairs the legal target, adds the search and erasure claim evidence, and keeps a deliberate demo erase empty after reload.
  - `259a36a04489fcef97900ffa2cef034374acfeeb` advances the offline shell to cache `hearing-mode-notes-v7`, so installed clients receive the new hashed app bundle.
- Documentation baseline before this repair: `c115158ac9d9695eec46565e2f0db0a58794bb3a`. The later handoff commit is documentation-only and does not change the deployed artifact.
- Live product: <https://hearing-mode-notes.sociobot.in>

## Product and first screen

- Job: remember which hearing-aid listening setup worked at a place.
- Audience: hearing-aid wearers who need a quick, private record of place-specific settings.
- First action: **Try it with sample data**. It opens `/demo` with Restaurant, Commute, and Work sample setups.

Fresh 1440×900 desktop and 390×844 phone HTTPS contexts showed the headline, audience sentence, and sample action before scrolling. The live demo kept its sample banner visible and showed three populated notes on History.

## Repairs

1. The support address on `/privacy` and `/terms` now has an explicit 44 px target. A phone regression audits every visible public control on `/`, `/demo`, `/history`, `/settings`, `/privacy`, `/terms`, and `/404.html`.
2. `search-notes` now declares and proves place, mode, volume, and observation search using the realistic sample records. It remains one tagged, outcome-based claim test.
3. `erase-local-data` is a new declared claim. Its demo-sandbox test changes the theme and reusable places, erases the current notebook, then proves the notes and settings are gone after reload.
4. An explicit demo erase no longer silently repopulates after reload in the same tab. **Reset demo** intentionally restores the samples; **Start for real** removes the session-only demo marker and clears only demo storage.
5. The service worker cache moved from v6 to v7 for this new hashed bundle. The live worker is `hearing-mode-notes-v7` and a fresh controlled context reloads `/demo` offline.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Missing offline worker/icon, stale deployment, skip-link focus, mobile performance | Resolved; live cache v7 controls the demo, artifact hashes match, keyboard focus works, and live mobile Lighthouse is 99. |
| Missing isolated sample and claim contract | Resolved; `/demo`, storage isolation, persistent banner, reset/start-real controls, 13 claims, and 13 separate commands pass. |
| Broken checkout | Resolved honestly; no checkout, price, paid gate, or purchase claim is exposed while billing registration is unavailable. |
| Malformed import persistence | Resolved; invalid data is rejected before its atomic write and the notebook still opens on reload. |
| Dialog focus, place arrows, phone targets | Resolved; focus/arrow checks and public-control target audit pass. Legal support targets are 182.8×44 CSS px live. |
| Headers, routes, metadata, 404, Android location declarations | Resolved in the shipped static config and Android source. The live missing route returns deliberate HTTP 404 with recovery UI. |

## Verification

All commands below ran in a detached clean checkout of implementation `259a36a` after `npm ci`:

```sh
npm ci
npm run check             # pass
npm test                  # 9/9 unit tests
npm run build             # pass; dist/
npm run test:e2e          # 40/40 desktop and 390 px browser checks
npm audit --omit=dev      # 0 production vulnerabilities
npx cap sync android      # pass
```

Every one of the 13 commands in `.factory/claims.json` also ran separately from that clean checkout. Each passed in both projects (26 claim runs total): sample isolation, recall, full-field search, export/import, offline reload, privacy, optional location, no device control, themes, place tabs, reminder fallback, and local erasure.

Additional evidence:

- Playwright axe found no serious or critical violations on live desktop or live dark/reduced-motion phone. The standalone axe CLI cannot launch because this worker has no system Chrome binary; the installed Playwright Chromium integration is the completed accessibility scan.
- `/opt/fleet/lib/verify-url.sh https://hearing-mode-notes.sociobot.in/demo /work/.evidence/repair-3-live` passed: 200, route title, `lang`, one `h1`, main landmark, complete image alternatives, labeled buttons, and no console errors.
- Live routes `/`, `/demo`, `/history`, `/settings`, `/privacy`, and `/terms` return 200. A deliberately missing route returns 404.
- Live mobile Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 2.0 s, TBT 0 ms, CLS 0, total transfer 219 KiB.
- Live desktop exercise saved a real note, opened the demo, changed it from three to four notes, reset it to three, then returned to confirm the real note remained. A fresh worker-controlled context reloaded the sample offline.
- The live HTML, JavaScript, CSS, worker, and manifest SHA-256 values match `dist/` from the implementation commit.

`./gradlew assembleDebug` remains unavailable in this static-deploy worker because `JAVA_HOME` and `java` are absent. The Capacitor project is synced, the README makes no APK availability claim, and an Android-SDK-equipped artifact work order is still needed for an APK.

## Deployment and data boundaries

The product was deployed with `/opt/fleet/lib/deploy-static.sh hearing-mode-notes dist`, reusing the existing `sf-hearing-mode-notes` Static Web App and Ready product domain. No backend, shared database, analytics, microphone access, or third-party note storage is used.

Real notes remain in IndexedDB `hearing-mode-notes`; demo notes remain in `demo:hearing-mode-notes`. The catalog description is verb-first, under 120 characters, and was copied to `/work/.evidence/catalog-description.txt`.

## Known dependency

The researched brief describes an eventual one-time purchase, but no Sociobot billing product is registered in this scope. The product deliberately exposes no price, checkout, mock payment, or paid gate. If registration becomes available, use the Sociobot hosted checkout contract and keep notes, export, accessibility, reminders, and safety behavior free.
