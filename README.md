# Hearing Mode Notes

Hearing Mode Notes is a private, offline-first notebook for hearing-aid wearers who want to remember which mode, volume, and seating observation worked at a particular place. It is a memory aid—not a hearing-aid controller, amplifier, hearing test, or source of medical advice.

Live product: <https://hearing-mode-notes.sociobot.in>

## What v1 does

- Saves place, listening mode, volume, free-form observations, and an optional 1–5 sound-comfort rating.
- Marks successful setups and puts the latest one within a few seconds of the home screen.
- Searches across place, mode, volume, and notes.
- Shows a user-requested lock-screen notification for the last successful setup, with a clipboard fallback.
- Requests optional location only after a user presses the location button; coordinates stay inside the local note.
- Stores all notes and settings in IndexedDB and works after an offline reload.
- Exports full JSON backups and portable CSV; imports JSON backups.
- Supports light, dark, and system themes plus keyboard and screen-reader paths.
- Offers a useful 12-note free notebook. A ₹399 one-time Sociobot license unlocks unlimited notes and custom place tabs. Export and accessibility are never gated.

No microphone permission, analytics, advertising, tracking scripts, runtime CDN, account, or cloud note storage is used.

## Develop and verify

Requires Node.js 22+.

```sh
npm install
npm run dev
npm run check
npm test
npm run build
npm run test:e2e
```

The exact production build command is `npm run build`. Static output lands in `dist/`, including directly addressable `privacy/index.html` and `terms/index.html` routes. It also includes the deployment `_headers` policy: immutable caching for fingerprinted assets, a no-cache service worker, CSP, Permissions-Policy, and the correct web-manifest MIME type.

Playwright is pinned to 1.58.2. The end-to-end suite starts the production preview itself and covers desktop and 390px mobile layouts, IndexedDB persistence, a fresh service-worker controller plus offline reload, keyboard skip navigation, accessibility, editing/search, legal routes, and the licensed custom-place path.

## Android project

The app is PWA-first and includes a synced Capacitor project in `android/` with the application ID `in.sociobot.hearingmodenotes` (Android identifiers cannot contain the slug's hyphens). APK compilation and signing are intentionally deferred to the later Android artifact work order.

To refresh the native web bundle after changing the app:

```sh
npm run build
npx cap sync android
```

## Data and billing

Notes use the browser's IndexedDB. Preferences and the optional license token use local browser storage. The checkout link points only to the Sociobot billing API; Sociobot/Dodo is the merchant of record. No product ID or payment-provider secret is embedded.

Privacy details are available at `/privacy`, and purchase/use terms at `/terms`.

## Project references

- [Product brief](.factory/brief.json)
- [Visual thesis and asset provenance](.factory/design.md)
- [Build handoff](.factory/handoff.md)

## License

MIT © 2026 Sociobot (Param Factory). See [LICENSE](LICENSE).
