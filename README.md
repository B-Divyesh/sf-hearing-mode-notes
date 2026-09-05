# Hearing Mode Notes

Hearing Mode Notes helps hearing-aid wearers remember which setting worked at a particular place. It is a private memory aid, not a hearing-aid controller or medical service.

Try the one-click sample at [hearing-mode-notes.sociobot.in/demo](https://hearing-mode-notes.sociobot.in/demo). It loads three realistic notes in a separate local database. Reset the sample or start for real from the persistent demo banner.

## What it does

- Shows the latest successful setup on the home screen.
- Searches saved setups by the words in the note.
- Exports saved setups as JSON and CSV, then imports a valid Hearing Mode Notes JSON backup.
- Works offline after the first visit.
- Keeps notes on your device with no microphone or third-party tracking requests.
- Requests location only after you press **Add current location**.
- Does not connect to or control hearing aids.
- Lets you choose light, dark, or system appearance.
- Lets you add a reusable place tab.
- Shows the saved setup when notifications are unavailable.

Each statement above is registered and browser-tested in [.factory/claims.json](.factory/claims.json).

## Run and verify

Requires Node.js 22+.

~~~sh
npm ci
npm run dev
npm run check
npm test
npm run build
npm run test:e2e
npx cap sync android
npm audit --omit=dev
~~~

The production build is npm run build; it writes the static site to dist/.

Run every public-claim command from a clean checkout with:

~~~sh
node -e 'for (const claim of require("./.factory/claims.json")) console.log(claim.test)'
~~~

Then run each printed command. Each command starts a production preview and exercises only /demo.

## Android project

The product is PWA-first and includes a Capacitor Android project with application ID in.sociobot.hearingmodenotes.

Refresh the Android web bundle after changes:

~~~sh
npm run build
npx cap sync android
~~~

APK compilation and signing are deferred to an Android SDK-equipped artifact work order; this repository makes no APK download claim.

## Data, demo, and product boundaries

Real notes and sample notes use different IndexedDB databases. Leaving the demo clears its sample database and never reads or writes the real notebook. See [.factory/demo.md](.factory/demo.md) for the exact sandbox contract.

The notebook is intentionally local-first. Purchase registration is documented in the handoff.

Privacy details are available at [/privacy](https://hearing-mode-notes.sociobot.in/privacy), and terms are at [/terms](https://hearing-mode-notes.sociobot.in/terms).

## Project references

- [Product brief](.factory/brief.json)
- [Visual thesis and asset provenance](.factory/design.md)
- [Demo contract](.factory/demo.md)
- [Public claims and test commands](.factory/claims.json)
- [Build handoff](.factory/handoff.md)

## License

MIT © 2026 Sociobot (Param Factory). See [LICENSE](LICENSE).
