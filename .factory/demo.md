# Demo sandbox

## Entry point

Open /demo or /?demo=1. The landing page links to /demo with the visible **Try it with sample data** action.

## Sample data

The demo starts with three realistic successful setups:

- Restaurant — Conversation, Level 3 — two taps down, comfort 4, quieter corner table.
- Commute — Noise reduction, Level 2, comfort 3, morning train.
- Work — Everyday, 60%, comfort 5, meeting room near the door.

The first demo screen already shows the Restaurant setup as the latest successful setup.

## Isolation and reset

Real notes use IndexedDB database hearing-mode-notes. Demo notes use demo:hearing-mode-notes; code selects that namespace before any database is opened. The demo never reads or writes the real database.

The persistent **Demo — sample data** banner contains:

- **Reset demo** — clears and reseeds only demo:hearing-mode-notes.
- **Start for real** — clears only demo:hearing-mode-notes, then opens /.

The browser regression test tagged @claim:sample-sandbox saves a real note, enters demo, then returns to prove the real note is still intact.

## Offline verification

@claim:offline-reload opens /demo in its own fresh browser context, waits for the service worker to control it, switches that context offline, reloads, and checks the sample setup remains visible.
