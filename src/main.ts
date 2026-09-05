import "./styles.css";
import { clearAllData, deleteNote, getNotes, getSettings, importBundle, makeExport, saveNote, saveSettings, toCsv, useStorageNamespace, validateImport } from "./storage";
import type { AppSettings, ExportBundle, LocationPoint, SetupNote, Theme } from "./types";
import { comfortLabel, createId, DEFAULT_PLACES, filterNotes, formatDate, reminderText } from "./utils";

type View = "home" | "history" | "settings";

const rootElement = document.querySelector<HTMLDivElement>("#app");
if (!rootElement) throw new Error("App root not found");
const root: HTMLDivElement = rootElement;

const currentUrl = () => new URL(location.href);
const initialPath = location.pathname.replace(/\/$/, "") || "/";
const isDemo = initialPath === "/demo" || currentUrl().searchParams.get("demo") === "1";
const demoBase = initialPath === "/demo" ? "/demo" : "/";
useStorageNamespace(isDemo ? "demo" : "real");

let notes: SetupNote[] = [];
let settings: AppSettings = { theme: "system", customPlaces: [] };
let view: View = "home";
let query = "";
let workedOnly = false;
let draftLocation: LocationPoint | null = null;
let editingId: string | null = null;
let lastDeleted: SetupNote | null = null;
let noteOpener: HTMLElement | null = null;
let saveClosingDialog = false;

const SAMPLE_BUNDLE: ExportBundle = {
  product: "hearing-mode-notes",
  version: 1,
  exportedAt: "2026-09-05T09:00:00.000Z",
  settings: { theme: "system", customPlaces: ["Community hall"] },
  notes: [
    { id: "sample-restaurant", place: "Restaurant", mode: "Conversation", volume: "Level 3 — two taps down", comfort: 4, worked: true, details: "Sat with my back to the wall. Ask for the quieter corner table.", location: null, createdAt: "2026-09-04T18:30:00.000Z", updatedAt: "2026-09-04T18:30:00.000Z" },
    { id: "sample-commute", place: "Commute", mode: "Noise reduction", volume: "Level 2", comfort: 3, worked: true, details: "Good on the morning train. Keep announcements audible.", location: null, createdAt: "2026-09-03T08:10:00.000Z", updatedAt: "2026-09-03T08:10:00.000Z" },
    { id: "sample-work", place: "Work", mode: "Everyday", volume: "60%", comfort: 5, worked: true, details: "Meeting room near the door was comfortable.", location: null, createdAt: "2026-09-02T13:00:00.000Z", updatedAt: "2026-09-02T13:00:00.000Z" }
  ]
};

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);

function icon(name: "book" | "plus" | "home" | "history" | "settings" | "search" | "pin" | "bell" | "lock" | "download" | "check"): string {
  const paths = {
    book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Zm0 13a3 3 0 0 1 3-3h11M9 8h6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    home: '<path d="m3 11 9-8 9 8v9h-6v-6H9v6H3v-9Z"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v6l4 2"/>',
    settings: '<circle cx="12" cy="12" r="3.5"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 21h16"/>',
    check: '<path d="m4 12 5 5L20 6"/>'
  };
  return `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24">${paths[name]}</svg>`;
}

function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  const dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#181A1B" : "#F4EEDC");
}

function routeView(): View {
  const path = location.pathname.replace(/\/$/, "") || "/";
  const requested = isDemo ? currentUrl().searchParams.get("view") : path.slice(1);
  return requested === "history" || requested === "settings" ? requested : "home";
}

function routeIsKnown(): boolean {
  const path = location.pathname.replace(/\/$/, "") || "/";
  return ["/", "/demo", "/history", "/settings", "/privacy", "/terms", "/404"].includes(path);
}

function urlForView(next: View): string {
  if (!isDemo) return next === "home" ? "/" : `/${next}`;
  const url = new URL(demoBase, location.origin);
  if (demoBase === "/") url.searchParams.set("demo", "1");
  if (next !== "home") url.searchParams.set("view", next);
  return `${url.pathname}${url.search}`;
}

function setMetadata(): void {
  const path = location.pathname.replace(/\/$/, "") || "/";
  const title = path === "/privacy" ? "Privacy — Hearing Mode Notes"
    : path === "/terms" ? "Terms — Hearing Mode Notes"
      : path === "/demo" || isDemo ? "Demo — Hearing Mode Notes"
        : path === "/history" ? "History — Hearing Mode Notes"
          : path === "/settings" ? "Settings — Hearing Mode Notes"
            : path === "/404" || !routeIsKnown() ? "Page not found — Hearing Mode Notes"
              : "Hearing Mode Notes — remember settings by place";
  document.title = title;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", `https://hearing-mode-notes.sociobot.in${path}`);
  document.querySelectorAll<HTMLMetaElement>('meta[property="og:title"], meta[name="twitter:title"]').forEach((element) => element.content = title);
}

function header(): string {
  return `<header class="site-header">
    <a class="brand" href="${isDemo ? demoBase : "/"}" aria-label="Hearing Mode Notes home">${icon("book")}<span>Hearing Mode Notes</span></a>
    <nav class="site-links" aria-label="Site"><a href="/demo">Try sample</a><a href="${urlForView("history")}" data-route>History</a><a href="/privacy" data-route>Privacy</a></nav>
    <button class="button primary compact desktop-new" type="button" data-new data-focus-key="new">${icon("plus")} Note a setup</button>
  </header>`;
}

function navigation(): string {
  return `<nav class="app-nav" aria-label="Notebook">${(["home", "history", "settings"] as View[]).map((item) => `<a href="${urlForView(item)}" data-route ${view === item ? 'aria-current="page"' : ""}>${icon(item)}<span>${item[0]?.toUpperCase()}${item.slice(1)}</span></a>`).join("")}</nav>`;
}

function demoBanner(): string {
  if (!isDemo) return "";
  return `<aside class="demo-banner" aria-label="Demo mode"><span><strong>Demo — sample data</strong><span>Nothing is saved to your notebook.</span></span><span class="demo-actions"><button type="button" class="text-button" data-reset-demo>Reset demo</button><button type="button" class="button secondary compact" data-start-real>Start for real</button></span></aside>`;
}

function noteEntry(note: SetupNote): string {
  return `<article class="note-entry" data-note-id="${escapeHtml(note.id)}">
    <div class="entry-rule"><span class="place-tab">${escapeHtml(note.place)}</span>${note.worked ? '<span class="worked-stamp">✓ Worked</span>' : ""}<time datetime="${escapeHtml(note.updatedAt)}" title="${escapeHtml(formatDate(note.updatedAt))}">${escapeHtml(formatDate(note.updatedAt))}</time></div>
    <div class="entry-content"><div><h3>${escapeHtml(note.mode)}</h3>${note.volume ? `<p class="volume">Volume: <strong>${escapeHtml(note.volume)}</strong></p>` : ""}</div>${note.comfort ? `<div class="comfort-readout" aria-label="Comfort ${note.comfort} out of 5, ${comfortLabel(note.comfort)}"><strong>${note.comfort}/5</strong><span>${comfortLabel(note.comfort)}</span></div>` : ""}</div>
    ${note.details ? `<p class="entry-notes">${escapeHtml(note.details)}</p>` : ""}${note.location ? `<p class="location-note">${icon("pin")} Location saved with this note</p>` : ""}
    <div class="entry-actions">${note.worked ? `<button class="button quiet" type="button" data-remind="${escapeHtml(note.id)}">${icon("bell")} Show reminder</button>` : ""}<button class="button quiet" type="button" data-edit="${escapeHtml(note.id)}">Edit</button><button class="button quiet danger-text" type="button" data-delete="${escapeHtml(note.id)}">Delete</button></div>
  </article>`;
}

function homeView(): string {
  const lastWorked = notes.find((note) => note.worked);
  const places = [...new Map(notes.filter((note) => note.worked).map((note) => [note.place.toLocaleLowerCase(), note])).values()].slice(0, 5);
  return `<div class="page home-page">
    <section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow">Private setup notes</p><h1 id="hero-title">Remember hearing-aid settings by place</h1><p class="lede">For hearing-aid wearers who need a private record of which setup worked in each place.</p><div class="hero-actions"><a class="button primary hero-action" href="/demo">Try it with sample data</a><span>Loads three sample notes.</span><button class="button secondary" type="button" data-new data-focus-key="new">${icon("plus")} Note a setup</button></div><ul class="plain-facts"><li>Stored on this device.</li><li>Works offline after the first visit.</li><li>Location only when you ask.</li></ul></div>
    <picture class="hero-art"><source media="(max-width: 700px)" srcset="/assets/notebook-hero-480.webp 480w, /assets/notebook-hero-720.webp 720w" sizes="100vw"><img src="/assets/notebook-hero-1280.webp" srcset="/assets/notebook-hero-720.webp 720w, /assets/notebook-hero-1280.webp 1280w" sizes="(max-width: 700px) 100vw, 48vw" width="1280" height="853" alt="A paper notebook showing abstract listening notes, comfort circles, and a pencil" fetchpriority="high" decoding="async"></picture></section>
    ${lastWorked ? `<section class="last-setup" aria-labelledby="last-title"><div class="section-heading"><div><p class="eyebrow">Last successful setup</p><h2 id="last-title">Setup for ${escapeHtml(lastWorked.place)}</h2></div><span class="worked-stamp">✓ Worked</span></div><div class="setup-strip"><div><span>Mode</span><strong>${escapeHtml(lastWorked.mode)}</strong></div><div><span>Volume</span><strong>${escapeHtml(lastWorked.volume || "Not noted")}</strong></div><div><span>Comfort</span><strong>${lastWorked.comfort ? `${lastWorked.comfort}/5 · ${comfortLabel(lastWorked.comfort)}` : "Not rated"}</strong></div></div><div class="entry-actions"><button class="button secondary" type="button" data-remind="${escapeHtml(lastWorked.id)}">${icon("bell")} Show reminder</button><button class="button quiet" type="button" data-edit="${escapeHtml(lastWorked.id)}">Update this setup</button></div></section>` : `<section class="empty-notebook" aria-labelledby="empty-title"><div class="empty-mark">01</div><div><h2 id="empty-title">Your saved setup will appear here</h2><p>Save a place, listening mode, and volume to find it again.</p><button class="button secondary" type="button" data-new data-focus-key="new">Make the first note</button></div></section>`}
    ${places.length ? `<section class="place-memory" aria-labelledby="places-title"><div class="section-heading"><div><h2 id="places-title">Successful setups by place</h2><p>Choose a place to search its saved setup.</p></div><a class="text-link" href="${urlForView("history")}" data-route>See all notes</a></div><div class="place-grid">${places.map((note) => `<button type="button" class="place-memory-item" data-find-place="${escapeHtml(note.place)}"><span>${escapeHtml(note.place)}</span><strong>${escapeHtml(note.mode)}</strong><small>${note.volume ? `Volume ${escapeHtml(note.volume)}` : "No volume noted"}</small></button>`).join("")}</div></section>` : ""}
    <section class="how-it-works" aria-labelledby="how-title"><h2 id="how-title">How it works</h2><ol><li><strong>Save a setup.</strong><span>Record the place, mode, volume, and comfort.</span></li><li><strong>Mark what worked.</strong><span>Keep successful setups easy to find.</span></li><li><strong>Check it next time.</strong><span>Search by place or show a reminder.</span></li></ol></section>
    <section class="boundary-note" aria-labelledby="limits-title"><div><h2 id="limits-title">Privacy and limits</h2><p>Your notes stay on this device. The app does not use your microphone or control hearing aids. It is not medical advice.</p></div></section>
  </div>`;
}

function historyView(): string {
  const visible = filterNotes(notes, query).filter((note) => !workedOnly || note.worked);
  return `<div class="page history-page"><div class="page-title"><p class="eyebrow">Your local notebook</p><h1>Setup history</h1><p>Search by place, mode, volume, or what you wrote.</p></div><div class="history-tools"><label class="search-field">${icon("search")}<span class="sr-only">Search notes</span><input type="search" data-search value="${escapeHtml(query)}" placeholder="Search your notes"></label><label class="check-control"><input type="checkbox" data-worked-only ${workedOnly ? "checked" : ""}><span>Only setups that worked</span></label></div><div class="history-summary" aria-live="polite"><strong>${visible.length}</strong> ${visible.length === 1 ? "note" : "notes"}</div>${visible.length ? `<div class="notes-list">${visible.map(noteEntry).join("")}</div>` : notes.length ? `<div class="no-results"><h2>No notes match that search</h2><p>Try a place name or clear the filter.</p><button class="button secondary" type="button" data-clear-search>Clear filters</button></div>` : `<div class="no-results"><h2>No saved setups yet</h2><p>Add a setup to find it here later.</p><button class="button primary" type="button" data-new data-focus-key="new">${icon("plus")} Note a setup</button></div>`}</div>`;
}

function settingsView(): string {
  return `<div class="page settings-page"><div class="page-title"><p class="eyebrow">Kept on this device</p><h1>Settings and data</h1><p>Choose a theme, move your data, and manage your place tabs.</p></div>
    <section class="settings-section" aria-labelledby="appearance-title"><h2 id="appearance-title">Appearance</h2><fieldset class="theme-options"><legend>Notebook theme</legend>${(["system", "light", "dark"] as Theme[]).map((theme) => `<label><input type="radio" name="theme" value="${theme}" ${settings.theme === theme ? "checked" : ""}><span>${theme[0]?.toUpperCase()}${theme.slice(1)}</span></label>`).join("")}</fieldset></section>
    <section class="settings-section" aria-labelledby="data-title"><div><h2 id="data-title">Export and import</h2><p>Export notes as JSON or CSV. Import a complete JSON backup.</p></div><div class="settings-actions"><button class="button secondary" type="button" data-export-json>${icon("download")} Export JSON</button><button class="button quiet bordered" type="button" data-export-csv>Export CSV</button><label class="button quiet bordered file-button">Import JSON<input type="file" accept="application/json,.json" data-import></label></div></section>
    <section class="settings-section" aria-labelledby="places-title"><div><h2 id="places-title">Place tabs</h2><p>Add a name you use often and select it in a new setup.</p></div><div><form class="custom-place-form" data-custom-place-form><label for="custom-place">Add a place tab</label><div class="inline-form"><input id="custom-place" name="place" maxlength="40" required placeholder="e.g. Community hall"><button class="button secondary" type="submit">Add place</button></div></form>${settings.customPlaces.length ? `<ul class="custom-place-list" aria-label="Custom place tabs">${settings.customPlaces.map((place) => `<li><span>${escapeHtml(place)}</span><button type="button" data-remove-place="${escapeHtml(place)}" aria-label="Remove ${escapeHtml(place)}">×</button></li>`).join("")}</ul>` : ""}</div></section>
    <section class="settings-section danger-zone" aria-labelledby="erase-title"><div><h2 id="erase-title">Erase this ${isDemo ? "sample" : "notebook"}</h2><p>Clear ${isDemo ? "sample" : "local"} notes and settings from this browser.</p></div><button class="button danger" type="button" data-clear-data>Erase all ${isDemo ? "sample" : "local"} data</button></section>
  </div>`;
}

function legalPage(kind: "privacy" | "terms"): string {
  const privacy = kind === "privacy";
  return `${header()}<main id="main" class="legal-page" tabindex="-1"><p class="eyebrow">${privacy ? "Privacy" : "Terms"}</p><h1>${privacy ? "Privacy for your listening notes" : "Terms for using Hearing Mode Notes"}</h1>${privacy ? `<p>Hearing Mode Notes stores your setup notes, preferences, and optional coordinates in this browser. The notes are not sent to us.</p><h2>What the app does not use</h2><p>The app has no analytics, advertising, microphone access, or background location tracking.</p><h2>Your controls</h2><p>Export notes as JSON or CSV, import a valid JSON backup, or erase local data in Settings.</p><h2>Permissions</h2><p>Location is requested only after you press “Add current location.”</p>` : `<p>Hearing Mode Notes is a personal memory aid. It does not control hearing aids or provide medical advice.</p><h2>Using the app</h2><p>You are responsible for the notes you enter and for keeping exports safe. Do not rely on a reminder for safety-critical decisions.</p>`}<h2>Questions</h2><p>Contact <a href="mailto:support@sociobot.in">support@sociobot.in</a>.</p></main>${footer()}`;
}

function notFoundPage(): string {
  return `${header()}<main id="main" class="legal-page not-found" tabindex="-1"><p class="eyebrow">404</p><h1>This page was not found</h1><p>Use the notebook home page to save or find a listening setup.</p><a class="button primary" href="/">Go to Hearing Mode Notes</a></main>${footer()}`;
}

function noteDialog(): string {
  const note = editingId ? notes.find((item) => item.id === editingId) : undefined;
  const places = [...DEFAULT_PLACES, ...settings.customPlaces];
  return `<dialog id="note-dialog" class="sheet-dialog" aria-labelledby="note-dialog-title"><form method="dialog" data-note-form><div class="dialog-heading"><div><p class="eyebrow">${note ? "Update a setup" : "New setup"}</p><h2 id="note-dialog-title">${note ? "Update this setup" : "What worked here?"}</h2></div><button class="icon-button" type="button" data-close-dialog aria-label="Close setup form">×</button></div><div class="form-scroll"><fieldset class="place-field"><legend>Place <span aria-hidden="true">*</span></legend><p class="field-help">Choose a tab or enter a name.</p><div class="tag-picker" role="group" aria-label="Place tabs">${places.map((place) => `<button type="button" class="place-choice" aria-label="${escapeHtml(place)}" data-place-choice="${escapeHtml(place)}" ${note?.place === place ? 'aria-pressed="true"' : 'aria-pressed="false"'}>${note?.place === place ? "✓ " : ""}${escapeHtml(place)}</button>`).join("")}</div><label for="place-input">Place name</label><input id="place-input" name="place" value="${escapeHtml(note?.place ?? "")}" required maxlength="60" autocomplete="off"></fieldset><div class="form-row"><label for="mode-input">Listening mode <span aria-hidden="true">*</span><small>The name shown in your device controls</small></label><input id="mode-input" name="mode" value="${escapeHtml(note?.mode ?? "")}" required maxlength="80" autocomplete="off"></div><div class="form-row"><label for="volume-input">Volume or level <small>Optional</small></label><input id="volume-input" name="volume" value="${escapeHtml(note?.volume ?? "")}" maxlength="40" placeholder="e.g. 3 or two taps down"></div><fieldset class="comfort-field"><legend>Sound comfort <small>Optional</small></legend><div class="comfort-options" role="radiogroup">${[1, 2, 3, 4, 5].map((value) => `<label><input type="radio" name="comfort" value="${value}" ${note?.comfort === value ? "checked" : ""}><span>${value}</span></label>`).join("")}</div><div class="comfort-anchors"><span>Difficult</span><span>Easy</span></div></fieldset><div class="form-row"><label for="details-input">What made it work? <small>Optional</small></label><textarea id="details-input" name="details" rows="3" maxlength="400" placeholder="e.g. Sat with my back to the wall">${escapeHtml(note?.details ?? "")}</textarea></div><label class="worked-control"><input type="checkbox" name="worked" ${note?.worked ?? true ? "checked" : ""}><span><strong>This setup worked well</strong><small>Successful setups appear first for quick recall.</small></span></label><div class="location-control"><button class="button quiet bordered" type="button" data-add-location>${icon("pin")} ${note?.location ? "Refresh current location" : "Add current location"}</button><p data-location-status aria-live="polite">${note?.location ? "A location is saved with this note." : "Optional. Requested only when you press the button."}</p></div></div><div class="dialog-actions"><button class="button quiet" type="button" data-close-dialog>Cancel</button><button class="button primary" type="submit">${note ? "Save changes" : "Save setup"}</button></div><p class="form-error" data-form-error role="alert"></p></form></dialog>`;
}

function confirmDialog(): string {
  return `<dialog id="confirm-dialog" class="confirm-dialog" aria-labelledby="confirm-title"><form method="dialog"><h2 id="confirm-title">Delete this note?</h2><p data-confirm-copy>This removes the note from this device.</p><div class="dialog-actions"><button class="button quiet" value="cancel">Keep note</button><button class="button danger" value="confirm">Delete note</button></div></form></dialog>`;
}

function footer(): string {
  return `<footer class="site-footer"><span>Private listening setup notes stored on your device.</span><span><a href="/privacy" data-route>Privacy</a><a href="/terms" data-route>Terms</a><a href="https://github.com/B-Divyesh/sf-hearing-mode-notes">Source</a></span><small>Built by Param Factory · Build 1.1.0 · Hero imagery generated for this product with Azure AI Foundry.</small></footer>`;
}

function shell(): string {
  const content = view === "home" ? homeView() : view === "history" ? historyView() : settingsView();
  return `${header()}${demoBanner()}${navigation()}<main id="main" tabindex="-1">${content}</main><button class="floating-new" type="button" data-new data-focus-key="new" aria-label="New note">${icon("plus")}<span>New note</span></button>${noteDialog()}${confirmDialog()}<div class="toast" data-toast role="status" aria-live="polite" aria-atomic="true"></div>${footer()}`;
}

function render(): void {
  setMetadata();
  const path = location.pathname.replace(/\/$/, "") || "/";
  if (path === "/privacy" || path === "/terms") root.innerHTML = legalPage(path.slice(1) as "privacy" | "terms");
  else if (!routeIsKnown()) root.innerHTML = notFoundPage();
  else { view = routeView(); root.innerHTML = shell(); }
  setTheme(settings.theme);
  bindEvents();
}

function showToast(message: string, action?: { label: string; run: () => void }): void {
  const toast = document.querySelector<HTMLElement>("[data-toast]");
  if (!toast) return;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>${action ? `<button type="button">${escapeHtml(action.label)}</button>` : ""}`;
  toast.classList.add("visible");
  const button = toast.querySelector("button");
  if (button && action) button.addEventListener("click", () => { action.run(); toast.classList.remove("visible"); });
  window.setTimeout(() => toast.classList.remove("visible"), 6000);
}

function focusMain(): void { requestAnimationFrame(() => document.querySelector<HTMLElement>("#main")?.focus({ preventScroll: true })); }

function focusRouteHeading(): void {
  requestAnimationFrame(() => {
    const heading = document.querySelector<HTMLElement>("#main h1");
    if (!heading) { focusMain(); return; }
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    const announcer = document.querySelector<HTMLElement>("#route-announcer");
    if (announcer) announcer.textContent = `${heading.textContent?.trim() ?? "New page"} page`;
  });
}

function restoreNoteFocus(): void {
  if (noteOpener?.isConnected) { noteOpener.focus(); return; }
  const visibleTrigger = [...document.querySelectorAll<HTMLElement>("[data-focus-key='new']")].find((element) => element.getClientRects().length > 0);
  visibleTrigger?.focus();
}

function openNote(opener: HTMLElement, id: string | null = null): void {
  editingId = id;
  draftLocation = id ? notes.find((note) => note.id === id)?.location ?? null : null;
  noteOpener = opener;
  saveClosingDialog = false;
  render();
  const dialog = document.querySelector<HTMLDialogElement>("#note-dialog");
  if (!dialog) return;
  dialog.addEventListener("close", () => {
    editingId = null;
    draftLocation = null;
    if (!saveClosingDialog) requestAnimationFrame(restoreNoteFocus);
    noteOpener = null;
    saveClosingDialog = false;
  }, { once: true });
  dialog.showModal();
  dialog.querySelector<HTMLElement>("[data-place-choice], input")?.focus();
}

function closeNote(): void { document.querySelector<HTMLDialogElement>("#note-dialog")?.close(); }

async function saveForm(form: HTMLFormElement): Promise<void> {
  const data = new FormData(form);
  const place = String(data.get("place") ?? "").trim();
  const mode = String(data.get("mode") ?? "").trim();
  const error = form.querySelector<HTMLElement>("[data-form-error]");
  if (!place || !mode) {
    if (error) error.textContent = "Add both a place and a listening mode.";
    ((!place ? form.elements.namedItem("place") : form.elements.namedItem("mode")) as HTMLElement | null)?.focus();
    return;
  }
  const existing = editingId ? notes.find((note) => note.id === editingId) : undefined;
  const now = new Date().toISOString();
  const note: SetupNote = { id: existing?.id ?? createId(), place, mode, volume: String(data.get("volume") ?? "").trim(), details: String(data.get("details") ?? "").trim(), comfort: data.get("comfort") ? Number(data.get("comfort")) : null, worked: data.get("worked") === "on", location: draftLocation, createdAt: existing?.createdAt ?? now, updatedAt: now };
  try {
    await saveNote(note);
    notes = await getNotes();
    saveClosingDialog = true;
    document.querySelector<HTMLDialogElement>("#note-dialog")?.close();
    editingId = null;
    draftLocation = null;
    render();
    focusMain();
    showToast(existing ? "Setup updated." : "Setup saved on this device.");
  } catch { if (error) error.textContent = "This setup could not be saved. Check available device storage and try again."; }
}

async function addLocation(button: HTMLButtonElement): Promise<void> {
  const status = document.querySelector<HTMLElement>("[data-location-status]");
  if (!navigator.geolocation) { if (status) status.textContent = "Location is not available in this browser. You can still save the note."; return; }
  button.disabled = true;
  if (status) status.textContent = "Getting your location…";
  navigator.geolocation.getCurrentPosition((position) => { draftLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy }; if (status) status.textContent = "Location added to this note only."; button.disabled = false; }, (error) => { if (status) status.textContent = error.code === error.PERMISSION_DENIED ? "Location permission was not granted. The note can still be saved." : "Location could not be found. Try again or save without it."; button.disabled = false; }, { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 });
}

async function showReminder(note: SetupNote): Promise<void> {
  const body = reminderText(note);
  try { if (!("Notification" in window)) throw new Error("unsupported"); const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission; if (permission !== "granted") throw new Error("denied"); const registration = await navigator.serviceWorker?.ready; if (registration) await registration.showNotification(`Setup for ${note.place}`, { body, icon: "/icon-192.png", badge: "/icon-192.png", tag: "hearing-mode-last-setup", requireInteraction: true }); else new Notification(`Setup for ${note.place}`, { body, icon: "/icon-192.png", tag: "hearing-mode-last-setup" }); showToast("Reminder shown. Your device decides how long it remains visible."); }
  catch { try { await navigator.clipboard.writeText(body); showToast("Notifications are unavailable, so the setup was copied instead."); } catch { showToast(`Reminder: ${body}`); } }
}

function download(name: string, contents: string, type: string): void { const url = URL.createObjectURL(new Blob([contents], { type })); const link = document.createElement("a"); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url); }

function navigate(url: string): void { history.pushState({}, "", url); view = routeView(); render(); scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }); focusRouteHeading(); }

function bindEvents(): void {
  document.querySelectorAll<HTMLAnchorElement>("a[data-route]").forEach((anchor) => anchor.addEventListener("click", (event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); navigate(anchor.getAttribute("href") ?? "/"); }));
  document.querySelectorAll<HTMLElement>("[data-new]").forEach((button) => button.addEventListener("click", () => openNote(button)));
  document.querySelectorAll<HTMLElement>("[data-close-dialog]").forEach((button) => button.addEventListener("click", closeNote));
  document.querySelectorAll<HTMLButtonElement>("[data-place-choice]").forEach((button, index, choices) => {
    const choose = () => { const input = document.querySelector<HTMLInputElement>("#place-input"); if (input) input.value = button.dataset.placeChoice ?? ""; choices.forEach((choice) => { const selected = choice === button; choice.setAttribute("aria-pressed", String(selected)); choice.textContent = `${selected ? "✓ " : ""}${choice.dataset.placeChoice}`; }); };
    button.addEventListener("click", choose);
    button.addEventListener("keydown", (event) => { const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0; if (!direction && event.key !== "Home" && event.key !== "End") return; event.preventDefault(); const target = event.key === "Home" ? choices[0] : event.key === "End" ? choices[choices.length - 1] : choices[(index + direction + choices.length) % choices.length]; target?.focus(); target?.click(); });
  });
  document.querySelector<HTMLFormElement>("[data-note-form]")?.addEventListener("submit", (event) => { event.preventDefault(); void saveForm(event.currentTarget as HTMLFormElement); });
  document.querySelector<HTMLButtonElement>("[data-add-location]")?.addEventListener("click", (event) => void addLocation(event.currentTarget as HTMLButtonElement));
  document.querySelectorAll<HTMLButtonElement>("[data-edit]").forEach((button) => button.addEventListener("click", () => openNote(button, button.dataset.edit ?? null)));
  document.querySelectorAll<HTMLButtonElement>("[data-remind]").forEach((button) => button.addEventListener("click", () => { const note = notes.find((item) => item.id === button.dataset.remind); if (note) void showReminder(note); }));
  document.querySelectorAll<HTMLButtonElement>("[data-delete]").forEach((button) => button.addEventListener("click", () => { const note = notes.find((item) => item.id === button.dataset.delete); const dialog = document.querySelector<HTMLDialogElement>("#confirm-dialog"); const copy = dialog?.querySelector<HTMLElement>("[data-confirm-copy]"); if (!note || !dialog) return; if (copy) copy.textContent = `Delete the ${note.mode} setup for ${note.place}? You can undo immediately afterward.`; dialog.showModal(); dialog.addEventListener("close", async () => { if (dialog.returnValue !== "confirm") return; lastDeleted = note; await deleteNote(note.id); notes = await getNotes(); render(); showToast("Note deleted.", { label: "Undo", run: () => void (async () => { if (lastDeleted) { await saveNote(lastDeleted); notes = await getNotes(); lastDeleted = null; render(); showToast("Note restored."); } })() }); }, { once: true }); }));
  const search = document.querySelector<HTMLInputElement>("[data-search]");
  search?.addEventListener("input", () => { query = search.value; const cursor = search.selectionStart; render(); const replacement = document.querySelector<HTMLInputElement>("[data-search]"); replacement?.focus(); if (cursor !== null) replacement?.setSelectionRange(cursor, cursor); });
  document.querySelector<HTMLInputElement>("[data-worked-only]")?.addEventListener("change", (event) => { workedOnly = (event.currentTarget as HTMLInputElement).checked; render(); });
  document.querySelector<HTMLButtonElement>("[data-clear-search]")?.addEventListener("click", () => { query = ""; workedOnly = false; render(); });
  document.querySelectorAll<HTMLButtonElement>("[data-find-place]").forEach((button) => button.addEventListener("click", () => { query = button.dataset.findPlace ?? ""; navigate(urlForView("history")); }));
  document.querySelectorAll<HTMLInputElement>('input[name="theme"]').forEach((input) => input.addEventListener("change", async () => { settings.theme = input.value as Theme; await saveSettings(settings); setTheme(settings.theme); }));
  document.querySelector<HTMLButtonElement>("[data-export-json]")?.addEventListener("click", () => download(`hearing-mode-notes-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(makeExport(notes, settings), null, 2), "application/json"));
  document.querySelector<HTMLButtonElement>("[data-export-csv]")?.addEventListener("click", () => download(`hearing-mode-notes-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(notes), "text/csv"));
  document.querySelector<HTMLInputElement>("[data-import]")?.addEventListener("change", async (event) => { const file = (event.currentTarget as HTMLInputElement).files?.[0]; if (!file) return; try { const bundle = validateImport(JSON.parse(await file.text())); await importBundle(bundle); notes = await getNotes(); settings = await getSettings(); render(); showToast(`${bundle.notes.length} notes imported or updated.`); } catch (error) { showToast(error instanceof Error ? error.message : "The file could not be imported."); } });
  document.querySelector<HTMLFormElement>("[data-custom-place-form]")?.addEventListener("submit", async (event) => { event.preventDefault(); const place = String(new FormData(event.currentTarget as HTMLFormElement).get("place") ?? "").trim(); if (!place) return; if ([...DEFAULT_PLACES, ...settings.customPlaces].some((item) => item.localeCompare(place, undefined, { sensitivity: "accent" }) === 0)) { showToast("That place tab already exists."); return; } settings.customPlaces = [...settings.customPlaces, place]; await saveSettings(settings); render(); showToast(`${place} added to your place tabs.`); });
  document.querySelectorAll<HTMLButtonElement>("[data-remove-place]").forEach((button) => button.addEventListener("click", async () => { const place = button.dataset.removePlace ?? ""; settings.customPlaces = settings.customPlaces.filter((item) => item !== place); await saveSettings(settings); render(); showToast(`${place} removed from your place tabs. Existing notes are unchanged.`); }));
  document.querySelector<HTMLButtonElement>("[data-clear-data]")?.addEventListener("click", async () => { if (!confirm(`Erase every ${isDemo ? "sample" : "local"} note and setting from this browser? This cannot be undone.`)) return; await clearAllData(); notes = []; settings = await getSettings(); render(); showToast(`${isDemo ? "Sample" : "Local"} notebook erased.`); });
  document.querySelector<HTMLButtonElement>("[data-reset-demo]")?.addEventListener("click", () => void resetDemo());
  document.querySelector<HTMLButtonElement>("[data-start-real]")?.addEventListener("click", () => void startForReal());
}

async function resetDemo(): Promise<void> { await clearAllData(); await importBundle(SAMPLE_BUNDLE); [notes, settings] = await Promise.all([getNotes(), getSettings()]); render(); showToast("Sample notes reset."); }
async function startForReal(): Promise<void> { await clearAllData(); location.assign("/"); }

function updateOnlineState(): void { document.documentElement.classList.toggle("offline", !navigator.onLine); }

async function init(): Promise<void> {
  try { [notes, settings] = await Promise.all([getNotes(), getSettings()]); if (isDemo && notes.length === 0) { await importBundle(SAMPLE_BUNDLE); [notes, settings] = await Promise.all([getNotes(), getSettings()]); } }
  catch { root.innerHTML = `<main id="main" class="fatal-error" tabindex="-1"><h1>Your notebook could not open</h1><p>Device storage may be blocked or full. Allow site storage, then reload.</p><button class="button primary" type="button" data-reload>Try again</button></main>`; root.querySelector<HTMLButtonElement>("[data-reload]")?.addEventListener("click", () => location.reload()); return; }
  view = routeView(); render(); updateOnlineState();
  window.addEventListener("online", updateOnlineState); window.addEventListener("offline", updateOnlineState);
  window.addEventListener("popstate", () => { view = routeView(); render(); focusRouteHeading(); });
  if ("serviceWorker" in navigator) { navigator.serviceWorker.addEventListener("message", (event) => { if (event.data?.type === "SW_UPDATED") showToast("Notebook updated and ready offline."); }); const register = () => navigator.serviceWorker.register("/sw.js").catch(() => showToast("Offline setup is unavailable right now. Your local notes still work.")); if (document.readyState === "complete") void register(); else window.addEventListener("load", () => void register(), { once: true }); }
  if (currentUrl().searchParams.get("new") === "1") openNote(document.querySelector<HTMLElement>("[data-new]") ?? root);
}

document.querySelector<HTMLAnchorElement>(".skip-link")?.addEventListener("click", () => requestAnimationFrame(focusMain));
void init();
