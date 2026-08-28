# Hearing Mode Notes — visual thesis

## Direction: the pocket listening lab book

The product should feel like the small field notebook a careful listener keeps in a coat pocket: private, quick to scan, and improved by use. It is deliberately not a clinical dashboard and not a hardware remote. Ruled-paper rhythm, blunt ink marks, circled ratings, and clipped observations make each saved setup feel like a useful result from the wearer's own lived experiment.

The interface passes the two-second test by giving the newest successful setup the visual weight of a notebook page marker and keeping one indigo “Note a setup” action in the thumb zone. On phones the editorial illustration is cropped to a compact margin scene; history becomes a single vertical stack and secondary explanatory copy drops away.

## Palette

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| Paper / background | `#F4EEDC` | `#181A1B` | Warm recycled paper / charcoal desk |
| Sheet / surface | `#FFFDF5` | `#232729` | The active notebook leaf |
| Graphite / text | `#252A2B` | `#F4F0E4` | Main writing |
| Pencil / muted | `#5F6462` | `#B9BFBC` | Dates and supporting notes |
| Fountain ink / accent | `#244B75` | `#8FBDE9` | Primary actions and links |
| Accent contrast | `#FFFFFF` | `#142536` | Text on ink |
| Coral pencil | `#A83F35` | `#FF9A8E` | Important annotations and destructive actions |
| Sage stamp | `#3F684F` | `#91C9A5` | Successful setup marker |
| Ochre tab | `#80621B` | `#E2C36A` | Offline/update attention |
| Rule line | `#D7CFB9` | `#3D4445` | Notebook ruling and separators |

All body/text pairings are at least 4.5:1. Color is never the only state cue: every state also has a word, symbol, or shape.

## Type and spacing

- Headings and handwritten marginalia: `Georgia`, `Times New Roman`, serif. Its human irregularity at display sizes provides the notebook voice without loading a font file.
- UI and long-form copy: `system-ui`, `-apple-system`, `Segoe UI`, sans-serif. It remains clear at 200% zoom and keeps the app payload small.
- Scale: 14px metadata, 16px supporting text, 18px controls, 22px section heading, 34–48px display heading. Body is never below 16px.
- Spacing follows a 4px base: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. Controls have at least 44px targets and 8px separation.
- Reading measures stop around 68 characters. Numbers use tabular figures.

## Interaction grammar

- Place tags resemble labeled paper tabs. Selecting one fills it with ink and shows a check, so color is not the only signal.
- Comfort is a row of five large circled numbers with plain-language anchors (“Difficult” to “Easy”).
- Saved records are ruled entries rather than floating dashboard cards. The newest successful record receives a sage `WORKED` stamp.
- The app never reads a microphone or silently fetches location. “Use my location” is an optional, contextual button; coordinates are stored only inside the local note.
- Delete requires a named confirmation and then offers a short Undo action.
- Keyboard: natural tab order; tag and rating groups support arrow keys; Escape closes dialogs.

## Motion

Page transitions and new-note reveals use 180–240ms opacity plus a 6px vertical movement, as though a leaf settles onto the desk. Toasts rise from the bottom edge. No motion loops. Under `prefers-reduced-motion`, transforms and smooth scrolling are removed and state changes are immediate opacity cuts.

## Asset plan and provenance

The hero is a generated editorial still-life: a top-down, handmade-paper notebook page with abstract hearing-device mode marks, a place tab, a comfort scale, a blue pencil, and a soft cast shadow. It explains the app as memory and observation without suggesting that the app controls hardware. UI icons and the app mark are hand-authored SVG linework in the repository.

Prompt sheet:

> Use case: stylized-concept. Asset type: responsive PWA hero illustration. Primary request: an intimate top-down editorial still life of a pocket field notebook used to remember listening setups by place. Scene/backdrop: warm recycled-paper desk. Subject: one open cream notebook leaf with simple abstract blue-ink diagrams of a listening mode slider, a small map-pin tab, five hand-circled comfort dots, and a green success stamp; a navy mechanical pencil resting diagonally. Style/medium: tactile cut-paper and coloured-pencil illustration, subtle imperfect edges, sophisticated accessibility editorial art. Composition: landscape, subject biased slightly right with quiet paper margin, no screen mockup. Lighting/mood: soft morning window light, reassuring and private. Palette: oat paper, fountain-pen indigo, graphite, muted coral, sage. Materials: visible paper fibres, dry pencil grain, restrained shadow. Constraints: no people, no ears, no medical symbols, no brand, no UI text, no readable writing, no watermark, no logo, no device-control implication.

- Generator: Azure AI Foundry via `/opt/fleet/lib/gen-image.sh`, deployment `factory-image`.
- Generation date: 2026-08-28.
- License/provenance: original generated image commissioned for this product; no reference images, brands, or copyrighted characters.
- Source candidates and exact prompt sidecars live in `assets/src/`; shipped WebP derivatives live in `public/assets/` and remain at or below 300 KB.

## Dark treatment

Dark mode turns the scene into an ink notebook on a charcoal desk rather than inverting it mechanically. The illustration stays warm but is slightly muted by CSS. System preference is the default and a persistent theme control allows light, dark, or system.
