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

If someone explicitly erases the sample notebook in Settings, that cleared state remains after reload in the current demo tab. **Reset demo** restores the three samples. The session-only `demo:hearing-mode-notes:seeded` marker prevents an erased sample from being silently recreated; it is removed when the person starts for real.

The browser regression test tagged @claim:sample-sandbox saves a real note, enters demo, then returns to prove the real note is still intact.

## Offline verification

@claim:offline-reload opens /demo in its own fresh browser context, waits for the visible **Offline ready** state, switches that context offline, reloads, and checks the sample setup remains visible. The state appears only after the worker confirms that the page shell and its JavaScript and CSS are cached.
