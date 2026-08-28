import type { AppSettings, ExportBundle, SetupNote } from "./types";

const DB_NAME = "hearing-mode-notes";
const DB_VERSION = 1;
const NOTES = "notes";
const SETTINGS = "settings";

const defaultSettings: AppSettings = { theme: "system", customPlaces: [] };

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(NOTES)) {
        const store = db.createObjectStore(NOTES, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt");
        store.createIndex("place", "place");
      }
      if (!db.objectStoreNames.contains(SETTINGS)) db.createObjectStore(SETTINGS);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open your local notebook."));
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("The local notebook could not be updated."));
  });
}

export async function getNotes(): Promise<SetupNote[]> {
  const db = await database();
  const notes = await requestResult(db.transaction(NOTES).objectStore(NOTES).getAll()) as SetupNote[];
  db.close();
  return notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveNote(note: SetupNote): Promise<void> {
  const db = await database();
  await requestResult(db.transaction(NOTES, "readwrite").objectStore(NOTES).put(note));
  db.close();
}

export async function deleteNote(id: string): Promise<void> {
  const db = await database();
  await requestResult(db.transaction(NOTES, "readwrite").objectStore(NOTES).delete(id));
  db.close();
}

export async function getSettings(): Promise<AppSettings> {
  const db = await database();
  const stored = await requestResult(db.transaction(SETTINGS).objectStore(SETTINGS).get("app")) as AppSettings | undefined;
  db.close();
  return { ...defaultSettings, ...stored };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await database();
  await requestResult(db.transaction(SETTINGS, "readwrite").objectStore(SETTINGS).put(settings, "app"));
  db.close();
}

export function makeExport(notes: SetupNote[], settings: AppSettings): ExportBundle {
  return { product: "hearing-mode-notes", version: 1, exportedAt: new Date().toISOString(), notes, settings };
}

export function validateImport(value: unknown): ExportBundle {
  if (!value || typeof value !== "object") throw new Error("Choose a Hearing Mode Notes JSON export.");
  const bundle = value as Partial<ExportBundle>;
  if (bundle.product !== "hearing-mode-notes" || bundle.version !== 1 || !Array.isArray(bundle.notes)) {
    throw new Error("This file is not a supported Hearing Mode Notes export.");
  }
  for (const note of bundle.notes) {
    if (!note || typeof note.id !== "string" || typeof note.place !== "string" || typeof note.mode !== "string" || typeof note.updatedAt !== "string") {
      throw new Error("One or more notes in this export are incomplete.");
    }
  }
  return bundle as ExportBundle;
}

export async function importBundle(bundle: ExportBundle): Promise<void> {
  for (const note of bundle.notes) await saveNote(note);
  if (bundle.settings) await saveSettings({ ...defaultSettings, ...bundle.settings });
}

export function toCsv(notes: SetupNote[]): string {
  const escape = (value: string | number | boolean | null) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const header = ["place", "mode", "volume", "comfort", "worked", "details", "latitude", "longitude", "updated_at"];
  const rows = notes.map((note) => [note.place, note.mode, note.volume, note.comfort, note.worked, note.details, note.location?.latitude ?? "", note.location?.longitude ?? "", note.updatedAt]);
  return [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

export async function clearAllData(): Promise<void> {
  const db = await database();
  const tx = db.transaction([NOTES, SETTINGS], "readwrite");
  tx.objectStore(NOTES).clear();
  tx.objectStore(SETTINGS).clear();
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Could not clear local data."));
  });
  db.close();
}
