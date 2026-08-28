import "./styles.css";
import { captureLicenseFromUrl, checkoutUrl, optimisticLicenseState, removeLicense, storeLicense, verifyLicense, type LicenseState } from "./license";
import { clearAllData, deleteNote, getNotes, getSettings, importBundle, makeExport, saveNote, saveSettings, toCsv, validateImport } from "./storage";
import type { AppSettings, LocationPoint, SetupNote, Theme } from "./types";
import { comfortLabel, createId, DEFAULT_PLACES, filterNotes, formatDate, FREE_NOTE_LIMIT, relativeDate, reminderText } from "./utils";

type View = "home" | "history" | "settings";

const rootElement = document.querySelector<HTMLDivElement>("#app");
if (!rootElement) throw new Error("App root not found");
const root: HTMLDivElement = rootElement;

let notes: SetupNote[] = [];
let settings: AppSettings = { theme: "system", customPlaces: [] };
let license: LicenseState = optimisticLicenseState();
let view: View = "home";
let query = "";
let workedOnly = false;
let draftLocation: LocationPoint | null = null;
let editingId: string | null = null;
let lastDeleted: SetupNote | null = null;

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);

function icon(name: "book" | "plus" | "home" | "history" | "settings" | "search" | "pin" | "bell" | "lock" | "download" | "check"): string {
  const paths = {
    book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Zm0 13a3 3 0 0 1 3-3h11M9 8h6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    home: '<path d="m3 11 9-8 9 8v9h-6v-6H9v6H3v-9Z"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v6l4 2"/>',
    settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
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

function legalPage(kind: "privacy" | "terms"): string {
  const privacy = kind === "privacy";
  return `
    <header class="site-header"><a class="brand" href="/">${icon("book")}<span>Hearing Mode Notes</span></a></header>
    <main id="main" class="legal-page">
      <p class="eyebrow">The plain-language ${privacy ? "privacy note" : "terms"}</p>
      <h1>${privacy ? "Your notes stay yours." : "Terms of use"}</h1>
      ${privacy ? `
        <p><strong>Effective 28 August 2026.</strong> Hearing Mode Notes stores listening setup notes, preferences, optional coordinates, and any pasted license token on your device. The notes are not sent to us.</p>
        <h2>What leaves your device</h2><p>If you buy or verify a one-time unlock, your browser contacts the Sociobot billing service with the license token. Sociobot/Dodo is the merchant of record and handles checkout details under its own policies. The app has no analytics, advertising, microphone access, or background location tracking.</p>
        <h2>Your controls</h2><p>You can export notes as JSON or CSV, import a JSON backup, remove a license, or erase all local data from Settings. Removing the app or clearing browser storage may also erase notes, so keep an export if they matter to you.</p>
        <h2>Permissions</h2><p>Location is requested only after you press “Add current location” and is saved only in that note. Notifications are requested only after you ask for a lock-screen reminder.</p>` : `
        <p><strong>Effective 28 August 2026.</strong> Hearing Mode Notes is a personal memory aid. It does not control hearing aids, amplify sound, test hearing, diagnose a condition, or provide medical advice. Always use the controls and guidance supplied with your own device.</p>
        <h2>Using the app</h2><p>You are responsible for the notes you enter and for keeping exports safe. The software is provided “as is” under the MIT License, without warranties. Do not rely on a reminder for safety-critical decisions.</p>
        <h2>One-time unlock</h2><p>The optional ₹399 one-time purchase unlocks unlimited notes and custom place tags for this product. Core notes, reminders, search, accessibility, and export remain available free. Sociobot/Dodo is the merchant of record; refunds are handled there and revoke the related license. A license may be restored by pasting its token in Settings.</p>`}
      <h2>Questions</h2><p>Contact <a href="mailto:support@sociobot.in">support@sociobot.in</a>.</p>
      <p><a class="text-link" href="/">← Return to your notebook</a></p>
    </main>
    <footer class="site-footer"><span>No microphone. No tracking.</span><span><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></span></footer>`;
}

function header(): string {
  return `<header class="site-header">
    <a class="brand" href="/" aria-label="Hearing Mode Notes home">${icon("book")}<span>Hearing Mode Notes</span></a>
    <div class="connection" data-online aria-live="polite"><span class="status-dot"></span><span>${navigator.onLine ? "Saved on this device" : "Offline — notes still work"}</span></div>
    <button class="button primary compact desktop-new" type="button" data-new>${icon("plus")} Note a setup</button>
  </header>`;
}

function navigation(): string {
  return `<nav class="app-nav" aria-label="Notebook">
    ${(["home", "history", "settings"] as View[]).map((item) => `<button type="button" data-view="${item}" ${view === item ? 'aria-current="page"' : ""}>${icon(item)}<span>${item[0]?.toUpperCase()}${item.slice(1)}</span></button>`).join("")}
  </nav>`;
}

function noteEntry(note: SetupNote): string {
  return `<article class="note-entry" data-note-id="${escapeHtml(note.id)}">
    <div class="entry-rule"><span class="place-tab">${escapeHtml(note.place)}</span>${note.worked ? '<span class="worked-stamp">✓ Worked</span>' : ""}<time datetime="${escapeHtml(note.updatedAt)}" title="${escapeHtml(formatDate(note.updatedAt))}">${escapeHtml(relativeDate(note.updatedAt))}</time></div>
    <div class="entry-content">
      <div><h3>${escapeHtml(note.mode)}</h3>${note.volume ? `<p class="volume">Volume: <strong>${escapeHtml(note.volume)}</strong></p>` : ""}</div>
      ${note.comfort ? `<div class="comfort-readout" aria-label="Comfort ${note.comfort} out of 5, ${comfortLabel(note.comfort)}"><strong>${note.comfort}/5</strong><span>${comfortLabel(note.comfort)}</span></div>` : ""}
    </div>
    ${note.details ? `<p class="entry-notes">${escapeHtml(note.details)}</p>` : ""}
    ${note.location ? `<p class="location-note">${icon("pin")} Location saved with this note</p>` : ""}
    <div class="entry-actions">
      ${note.worked ? `<button class="button quiet" type="button" data-remind="${escapeHtml(note.id)}">${icon("bell")} Show reminder</button>` : ""}
      <button class="button quiet" type="button" data-edit="${escapeHtml(note.id)}">Edit</button>
      <button class="button quiet danger-text" type="button" data-delete="${escapeHtml(note.id)}">Delete</button>
    </div>
  </article>`;
}

function homeView(): string {
  const lastWorked = notes.find((note) => note.worked);
  const placeRecents = [...new Map(notes.filter((note) => note.worked).map((note) => [note.place.toLocaleLowerCase(), note])).values()].slice(0, 5);
  return `<div class="page home-page">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy"><p class="eyebrow">Your listening field notes</p><h1 id="hero-title">Remember what worked, right where you need it.</h1><p class="lede">Save a place, mode, and volume in a few taps. Find the setup next time—without sharing a sound or a health detail.</p><button class="button primary hero-action" type="button" data-new>${icon("plus")} Note a setup</button><p class="privacy-line">${icon("lock")} Offline-first · no microphone · optional location</p></div>
      <picture class="hero-art"><source media="(max-width: 700px)" srcset="/assets/notebook-hero-720.webp"><img src="/assets/notebook-hero-1280.webp" width="1280" height="853" alt="A tactile paper notebook with an abstract mode slider, place pin, five comfort circles, and a pencil" fetchpriority="high" decoding="async"></picture>
    </section>
    ${lastWorked ? `<section class="last-setup" aria-labelledby="last-title"><div class="section-heading"><div><p class="eyebrow">Last successful setup</p><h2 id="last-title">Ready to return to ${escapeHtml(lastWorked.place)}</h2></div><span class="worked-stamp">✓ Worked</span></div><div class="setup-strip"><div><span>Mode</span><strong>${escapeHtml(lastWorked.mode)}</strong></div><div><span>Volume</span><strong>${escapeHtml(lastWorked.volume || "Not noted")}</strong></div><div><span>Comfort</span><strong>${lastWorked.comfort ? `${lastWorked.comfort}/5 · ${comfortLabel(lastWorked.comfort)}` : "Not rated"}</strong></div></div><div class="entry-actions"><button class="button secondary" type="button" data-remind="${escapeHtml(lastWorked.id)}">${icon("bell")} Show lock-screen reminder</button><button class="button quiet" type="button" data-edit="${escapeHtml(lastWorked.id)}">Update this setup</button></div></section>` : `<section class="empty-notebook" aria-labelledby="empty-title"><div class="empty-mark">01</div><div><p class="eyebrow">A fresh page</p><h2 id="empty-title">Start with a place you visit often.</h2><p>Your first saved setup will appear here for quick recall. Try Home, Work, or your regular café.</p><button class="button secondary" type="button" data-new>Make the first note</button></div></section>`}
    ${placeRecents.length ? `<section class="place-memory" aria-labelledby="places-title"><div class="section-heading"><div><p class="eyebrow">Under 10 seconds</p><h2 id="places-title">What worked by place</h2></div><button class="text-button" type="button" data-view="history">See all notes</button></div><div class="place-grid">${placeRecents.map((note) => `<button type="button" class="place-memory-item" data-find-place="${escapeHtml(note.place)}"><span>${escapeHtml(note.place)}</span><strong>${escapeHtml(note.mode)}</strong><small>${note.volume ? `Volume ${escapeHtml(note.volume)}` : "No volume noted"}</small></button>`).join("")}</div></section>` : ""}
    <section class="boundary-note"><span class="margin-scribble" aria-hidden="true">not a remote</span><div><h2>A memory aid, not a device controller.</h2><p>Hearing Mode Notes does not connect to, control, test, or make claims about hearing aids. It simply remembers the observations you enter.</p></div></section>
  </div>`;
}

function historyView(): string {
  const visible = filterNotes(notes, query).filter((note) => !workedOnly || note.worked);
  return `<div class="page history-page"><div class="page-title"><p class="eyebrow">Your local notebook</p><h1>Setup history</h1><p>Search by place, mode, volume, or anything you wrote.</p></div>
    <div class="history-tools"><label class="search-field">${icon("search")}<span class="sr-only">Search notes</span><input type="search" data-search value="${escapeHtml(query)}" placeholder="Search your notes"></label><label class="check-control"><input type="checkbox" data-worked-only ${workedOnly ? "checked" : ""}><span>Only setups that worked</span></label></div>
    <div class="history-summary" aria-live="polite"><strong>${visible.length}</strong> ${visible.length === 1 ? "note" : "notes"}${license.unlocked ? " · unlimited unlocked" : ` · ${Math.max(0, FREE_NOTE_LIMIT - notes.length)} free slots left`}</div>
    ${visible.length ? `<div class="notes-list">${visible.map(noteEntry).join("")}</div>` : notes.length ? `<div class="no-results"><h2>No notes match that search.</h2><p>Try a place name or clear the “worked” filter.</p><button class="button secondary" type="button" data-clear-search>Clear filters</button></div>` : `<div class="no-results"><h2>Your notebook is still blank.</h2><p>Add a setup now so it is ready the next time you return.</p><button class="button primary" type="button" data-new>${icon("plus")} Note a setup</button></div>`}
  </div>`;
}

function settingsView(): string {
  return `<div class="page settings-page"><div class="page-title"><p class="eyebrow">Kept on this device</p><h1>Settings & ownership</h1><p>Choose the page treatment, carry your data with you, or unlock more room.</p></div>
    <section class="settings-section" aria-labelledby="appearance-title"><h2 id="appearance-title">Appearance</h2><fieldset class="theme-options"><legend>Notebook theme</legend>${(["system", "light", "dark"] as Theme[]).map((theme) => `<label><input type="radio" name="theme" value="${theme}" ${settings.theme === theme ? "checked" : ""}><span>${theme[0]?.toUpperCase()}${theme.slice(1)}</span></label>`).join("")}</fieldset></section>
    <section class="settings-section" aria-labelledby="data-title"><div><h2 id="data-title">Your notebook, your file</h2><p>JSON keeps a complete backup for restoring. CSV opens easily in spreadsheets. Export is always free.</p></div><div class="settings-actions"><button class="button secondary" type="button" data-export-json>${icon("download")} Export JSON</button><button class="button quiet bordered" type="button" data-export-csv>Export CSV</button><label class="button quiet bordered file-button">Import JSON<input type="file" accept="application/json,.json" data-import></label></div></section>
    <section class="settings-section paid-section" aria-labelledby="unlock-title"><div class="paid-copy"><p class="eyebrow">One-time personal unlock</p><h2 id="unlock-title">${license.unlocked ? "Unlimited notebook unlocked" : "Keep every place you learn"}</h2><p>${license.unlocked ? "This device has unlimited notes and custom place tags." : `The free notebook includes ${FREE_NOTE_LIMIT} records. Pay ₹399 once for unlimited records and custom place tags—no subscription.`}</p>${license.notice ? `<p class="inline-notice">${escapeHtml(license.notice)}</p>` : ""}</div>
      ${license.unlocked ? `<div class="license-active">${icon("check")} <strong>License active</strong><button class="text-button" type="button" data-remove-license>Remove from this device</button></div>` : `<div class="purchase-box"><a class="button primary" href="${checkoutUrl}">Buy the one-time unlock</a><details><summary>Have a license? Restore it</summary><form data-license-form><label for="license-token">License token</label><div class="inline-form"><input id="license-token" name="license" autocomplete="off" required><button class="button secondary" type="submit">Verify license</button></div></form></details><small>Sociobot/Dodo is the merchant of record. Refunds are handled there.</small></div>`}
    </section>
    <section class="settings-section danger-zone" aria-labelledby="erase-title"><div><h2 id="erase-title">Erase this notebook</h2><p>Permanently removes notes and settings from this browser. Export first if you need a copy.</p></div><button class="button danger" type="button" data-clear-data>Erase all local data</button></section>
    <section class="small-print"><h2>Product boundaries</h2><p>No microphone access. Location is optional and used only when you press the location button. This app is not medical advice and does not control any hearing device.</p></section>
  </div>`;
}

function noteDialog(): string {
  const note = editingId ? notes.find((item) => item.id === editingId) : undefined;
  const places = [...DEFAULT_PLACES, ...settings.customPlaces];
  const selectedComfort = note?.comfort ?? null;
  return `<dialog id="note-dialog" class="sheet-dialog" aria-labelledby="note-dialog-title"><form method="dialog" data-note-form>
    <div class="dialog-heading"><div><p class="eyebrow">${note ? "Revise an observation" : "A new field note"}</p><h2 id="note-dialog-title">${note ? "Update this setup" : "What worked here?"}</h2></div><button class="icon-button" type="button" data-close-dialog aria-label="Close setup form">×</button></div>
    <div class="form-scroll"><fieldset class="place-field"><legend>Place <span aria-hidden="true">*</span></legend><p class="field-help">Pick a tab or enter your own.</p><div class="tag-picker">${places.map((place) => `<button type="button" class="place-choice" data-place-choice="${escapeHtml(place)}" ${note?.place === place ? 'aria-pressed="true"' : 'aria-pressed="false"'}>${note?.place === place ? "✓ " : ""}${escapeHtml(place)}</button>`).join("")}</div><label for="place-input">Place name</label><input id="place-input" name="place" value="${escapeHtml(note?.place ?? "")}" required maxlength="60" autocomplete="off"></fieldset>
    <div class="form-row"><label for="mode-input">Listening mode <span aria-hidden="true">*</span><small>The name shown in your device's app or controls</small></label><input id="mode-input" name="mode" value="${escapeHtml(note?.mode ?? "")}" list="mode-suggestions" required maxlength="80" autocomplete="off"><datalist id="mode-suggestions"><option value="Everyday"><option value="Conversation"><option value="Noise reduction"><option value="Music"><option value="Outdoor"><option value="Telecoil"></datalist></div>
    <div class="form-row"><label for="volume-input">Volume or level <small>Optional; words or numbers are both fine</small></label><input id="volume-input" name="volume" value="${escapeHtml(note?.volume ?? "")}" maxlength="40" placeholder="e.g. 3, 60%, two taps down"></div>
    <fieldset class="comfort-field"><legend>Sound comfort <small>Optional</small></legend><div class="comfort-options" role="radiogroup">${[1, 2, 3, 4, 5].map((value) => `<label><input type="radio" name="comfort" value="${value}" ${selectedComfort === value ? "checked" : ""}><span>${value}</span></label>`).join("")}</div><div class="comfort-anchors"><span>Difficult</span><span>Easy</span></div></fieldset>
    <div class="form-row"><label for="details-input">What made it work? <small>Optional</small></label><textarea id="details-input" name="details" rows="3" maxlength="400" placeholder="e.g. Sat with my back to the wall">${escapeHtml(note?.details ?? "")}</textarea></div>
    <label class="worked-control"><input type="checkbox" name="worked" ${note?.worked ?? true ? "checked" : ""}><span><strong>This setup worked well</strong><small>Successful setups appear first for quick recall.</small></span></label>
    <div class="location-control"><button class="button quiet bordered" type="button" data-add-location>${icon("pin")} ${note?.location ? "Refresh current location" : "Add current location"}</button><p data-location-status aria-live="polite">${note?.location ? "A location is saved with this note." : "Optional. Requested only when you press the button."}</p></div></div>
    <div class="dialog-actions"><button class="button quiet" type="button" data-close-dialog>Cancel</button><button class="button primary" type="submit">${note ? "Save changes" : "Save setup"}</button></div><p class="form-error" data-form-error role="alert"></p>
  </form></dialog>`;
}

function confirmDialog(): string {
  return `<dialog id="confirm-dialog" class="confirm-dialog" aria-labelledby="confirm-title"><form method="dialog"><h2 id="confirm-title">Delete this note?</h2><p data-confirm-copy>This removes the note from this device.</p><div class="dialog-actions"><button class="button quiet" value="cancel">Keep note</button><button class="button danger" value="confirm">Delete note</button></div></form></dialog>`;
}

function shell(): string {
  return `${header()}${navigation()}<main id="main">${view === "home" ? homeView() : view === "history" ? historyView() : settingsView()}</main><button class="floating-new" type="button" data-new aria-label="Note a setup">${icon("plus")}<span>New note</span></button>${noteDialog()}${confirmDialog()}<div class="toast" data-toast role="status" aria-live="polite" aria-atomic="true"></div><footer class="site-footer"><span>Private by default. Made for remembering, not controlling.</span><span><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="https://github.com/B-Divyesh/sf-hearing-mode-notes">Source</a></span><small>Hero imagery generated for this product with Azure AI Foundry.</small></footer>`;
}

function render(): void {
  const path = location.pathname.replace(/\/$/, "");
  if (path === "/privacy" || path === "/terms") {
    root.innerHTML = legalPage(path.slice(1) as "privacy" | "terms");
    setTheme(settings.theme);
    return;
  }
  root.innerHTML = shell();
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

function openNote(id: string | null = null): void {
  if (!id && !license.unlocked && notes.length >= FREE_NOTE_LIMIT) {
    view = "settings";
    render();
    showToast(`The free notebook holds ${FREE_NOTE_LIMIT} notes. Export stays free, or unlock unlimited notes once.`);
    return;
  }
  editingId = id;
  draftLocation = id ? notes.find((note) => note.id === id)?.location ?? null : null;
  render();
  const dialog = document.querySelector<HTMLDialogElement>("#note-dialog");
  dialog?.showModal();
  dialog?.querySelector<HTMLElement>("[data-place-choice], input")?.focus();
}

function closeNote(): void {
  document.querySelector<HTMLDialogElement>("#note-dialog")?.close();
  editingId = null;
  draftLocation = null;
}

async function saveForm(form: HTMLFormElement): Promise<void> {
  const data = new FormData(form);
  const place = String(data.get("place") ?? "").trim();
  const mode = String(data.get("mode") ?? "").trim();
  const error = form.querySelector<HTMLElement>("[data-form-error]");
  if (!place || !mode) {
    if (error) error.textContent = "Add both a place and a listening mode.";
    const missing = (!place ? form.elements.namedItem("place") : form.elements.namedItem("mode")) as HTMLElement | null;
    missing?.focus();
    return;
  }
  const existing = editingId ? notes.find((note) => note.id === editingId) : undefined;
  const now = new Date().toISOString();
  const note: SetupNote = {
    id: existing?.id ?? createId(), place, mode,
    volume: String(data.get("volume") ?? "").trim(),
    details: String(data.get("details") ?? "").trim(),
    comfort: data.get("comfort") ? Number(data.get("comfort")) : null,
    worked: data.get("worked") === "on",
    location: draftLocation,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
  try {
    await saveNote(note);
    notes = await getNotes();
    editingId = null;
    draftLocation = null;
    render();
    showToast(existing ? "Setup updated." : "Setup saved on this device.");
  } catch {
    if (error) error.textContent = "This setup could not be saved. Check available device storage and try again.";
  }
}

async function addLocation(button: HTMLButtonElement): Promise<void> {
  const status = document.querySelector<HTMLElement>("[data-location-status]");
  if (!navigator.geolocation) {
    if (status) status.textContent = "Location is not available in this browser. You can still save the note.";
    return;
  }
  button.disabled = true;
  if (status) status.textContent = "Getting your location…";
  navigator.geolocation.getCurrentPosition((position) => {
    draftLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy };
    if (status) status.textContent = "Location added to this note only.";
    button.disabled = false;
  }, (geolocationError) => {
    const denied = geolocationError.code === geolocationError.PERMISSION_DENIED;
    if (status) status.textContent = denied ? "Location permission was not granted. The note can still be saved." : "Location could not be found. Try again outdoors or save without it.";
    button.disabled = false;
  }, { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 });
}

async function showReminder(note: SetupNote): Promise<void> {
  const body = reminderText(note);
  try {
    if (!("Notification" in window)) throw new Error("unsupported");
    const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    if (permission !== "granted") throw new Error("denied");
    const registration = await navigator.serviceWorker?.ready;
    if (registration) await registration.showNotification(`Setup for ${note.place}`, { body, icon: "/icon-192.png", badge: "/icon-192.png", tag: "hearing-mode-last-setup", requireInteraction: true });
    else new Notification(`Setup for ${note.place}`, { body, icon: "/icon-192.png", tag: "hearing-mode-last-setup" });
    showToast("Reminder shown. Your device decides how long it stays on the lock screen.");
  } catch {
    try {
      await navigator.clipboard.writeText(body);
      showToast("Notifications are unavailable, so the setup was copied instead.");
    } catch {
      showToast(`Reminder: ${body}`);
    }
  }
}

function download(name: string, contents: string, type: string): void {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function bindEvents(): void {
  document.querySelectorAll<HTMLElement>("[data-new]").forEach((button) => button.addEventListener("click", () => openNote()));
  document.querySelectorAll<HTMLButtonElement>("[data-view]").forEach((button) => button.addEventListener("click", () => {
    view = button.dataset.view as View;
    render();
    document.querySelector<HTMLElement>("#main h1")?.focus({ preventScroll: true });
    scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }));
  document.querySelectorAll<HTMLElement>("[data-close-dialog]").forEach((button) => button.addEventListener("click", closeNote));
  document.querySelectorAll<HTMLButtonElement>("[data-place-choice]").forEach((button) => button.addEventListener("click", () => {
    const input = document.querySelector<HTMLInputElement>("#place-input");
    if (input) input.value = button.dataset.placeChoice ?? "";
    document.querySelectorAll<HTMLButtonElement>("[data-place-choice]").forEach((choice) => { const selected = choice === button; choice.setAttribute("aria-pressed", String(selected)); choice.textContent = `${selected ? "✓ " : ""}${choice.dataset.placeChoice}`; });
  }));
  document.querySelector<HTMLFormElement>("[data-note-form]")?.addEventListener("submit", (event) => { event.preventDefault(); void saveForm(event.currentTarget as HTMLFormElement); });
  document.querySelector<HTMLButtonElement>("[data-add-location]")?.addEventListener("click", (event) => void addLocation(event.currentTarget as HTMLButtonElement));
  document.querySelectorAll<HTMLButtonElement>("[data-edit]").forEach((button) => button.addEventListener("click", () => openNote(button.dataset.edit ?? null)));
  document.querySelectorAll<HTMLButtonElement>("[data-remind]").forEach((button) => button.addEventListener("click", () => { const note = notes.find((item) => item.id === button.dataset.remind); if (note) void showReminder(note); }));
  document.querySelectorAll<HTMLButtonElement>("[data-delete]").forEach((button) => button.addEventListener("click", () => {
    const note = notes.find((item) => item.id === button.dataset.delete);
    const dialog = document.querySelector<HTMLDialogElement>("#confirm-dialog");
    const copy = dialog?.querySelector<HTMLElement>("[data-confirm-copy]");
    if (!note || !dialog) return;
    if (copy) copy.textContent = `Delete the ${note.mode} setup for ${note.place}? You can undo immediately afterward.`;
    dialog.showModal();
    dialog.addEventListener("close", async () => {
      if (dialog.returnValue !== "confirm") return;
      lastDeleted = note;
      await deleteNote(note.id);
      notes = await getNotes();
      render();
      showToast("Note deleted.", { label: "Undo", run: () => void (async () => { if (lastDeleted) { await saveNote(lastDeleted); notes = await getNotes(); lastDeleted = null; render(); showToast("Note restored."); } })() });
    }, { once: true });
  }));
  const search = document.querySelector<HTMLInputElement>("[data-search]");
  search?.addEventListener("input", () => { query = search.value; const cursor = search.selectionStart; render(); const replacement = document.querySelector<HTMLInputElement>("[data-search]"); replacement?.focus(); if (cursor !== null) replacement?.setSelectionRange(cursor, cursor); });
  document.querySelector<HTMLInputElement>("[data-worked-only]")?.addEventListener("change", (event) => { workedOnly = (event.currentTarget as HTMLInputElement).checked; render(); });
  document.querySelector<HTMLButtonElement>("[data-clear-search]")?.addEventListener("click", () => { query = ""; workedOnly = false; render(); });
  document.querySelectorAll<HTMLButtonElement>("[data-find-place]").forEach((button) => button.addEventListener("click", () => { query = button.dataset.findPlace ?? ""; view = "history"; render(); }));
  document.querySelectorAll<HTMLInputElement>('input[name="theme"]').forEach((input) => input.addEventListener("change", async () => { settings.theme = input.value as Theme; await saveSettings(settings); setTheme(settings.theme); }));
  document.querySelector<HTMLButtonElement>("[data-export-json]")?.addEventListener("click", () => download(`hearing-mode-notes-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(makeExport(notes, settings), null, 2), "application/json"));
  document.querySelector<HTMLButtonElement>("[data-export-csv]")?.addEventListener("click", () => download(`hearing-mode-notes-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(notes), "text/csv"));
  document.querySelector<HTMLInputElement>("[data-import]")?.addEventListener("change", async (event) => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    try { const bundle = validateImport(JSON.parse(await file.text())); await importBundle(bundle); notes = await getNotes(); settings = await getSettings(); render(); showToast(`${bundle.notes.length} notes imported or updated.`); }
    catch (error) { showToast(error instanceof Error ? error.message : "The file could not be imported."); }
  });
  document.querySelector<HTMLFormElement>("[data-license-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    try { storeLicense(String(data.get("license") ?? "")); license = await verifyLicense(true); render(); showToast(license.unlocked ? "Unlimited notebook unlocked." : license.notice ?? "That license could not be verified."); }
    catch (error) { showToast(error instanceof Error ? error.message : "The license could not be saved."); }
  });
  document.querySelector<HTMLButtonElement>("[data-remove-license]")?.addEventListener("click", () => { removeLicense(); license = optimisticLicenseState(); render(); showToast("License removed from this device."); });
  document.querySelector<HTMLButtonElement>("[data-clear-data]")?.addEventListener("click", async () => {
    if (!confirm("Erase every local note and setting from this browser? This cannot be undone.")) return;
    await clearAllData(); notes = []; settings = await getSettings(); render(); showToast("Local notebook erased.");
  });
}

function updateOnlineState(): void {
  const node = document.querySelector<HTMLElement>("[data-online] span:last-child");
  if (node) node.textContent = navigator.onLine ? "Saved on this device" : "Offline — notes still work";
  document.documentElement.classList.toggle("offline", !navigator.onLine);
}

async function init(): Promise<void> {
  captureLicenseFromUrl();
  license = optimisticLicenseState();
  try {
    [notes, settings] = await Promise.all([getNotes(), getSettings()]);
  } catch {
    root.innerHTML = `<main id="main" class="fatal-error"><h1>Your notebook could not open.</h1><p>Device storage may be blocked or full. Allow site storage, then reload. No notes were sent anywhere.</p><button class="button primary" onclick="location.reload()">Try again</button></main>`;
    return;
  }
  render();
  updateOnlineState();
  if (new URL(location.href).searchParams.get("new") === "1") openNote();
  window.addEventListener("online", updateOnlineState);
  window.addEventListener("offline", updateOnlineState);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => { if (event.data?.type === "SW_UPDATED") showToast("Notebook updated and ready offline."); });
    navigator.serviceWorker.register("/sw.js").catch(() => showToast("Offline setup is unavailable right now. Your local notes still work."));
  }
  license = await verifyLicense();
  render();
}

void init();
