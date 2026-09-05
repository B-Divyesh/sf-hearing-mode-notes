import type { AppSettings, ExportBundle, LocationPoint, SetupNote, Theme } from "./types";

const REAL_DB_NAME = "hearing-mode-notes";
const DEMO_DB_NAME = "demo:hearing-mode-notes";
const DB_VERSION = 1;
const NOTES = "notes";
const SETTINGS = "settings";

const defaultSettings: AppSettings = { theme: "system", customPlaces: [] };
let databaseName = REAL_DB_NAME;

/** Keeps the one-click sample in an IndexedDB database the real notebook never opens. */
export function useStorageNamespace(namespace: "real" | "demo"): void {
  databaseName = namespace === "demo" ? DEMO_DB_NAME : REAL_DB_NAME;
}

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, DB_VERSION);
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
  const notes = await requestResult(db.transaction(NOTES).objectStore(NOTES).getAll()) as unknown[];
  db.close();
  // Older or manually corrupted browser data must never stop the notebook opening.
  return notes.filter(isSetupNote).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
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
  const stored = await requestResult(db.transaction(SETTINGS).objectStore(SETTINGS).get("app")) as unknown;
  db.close();
  return normaliseSettings(stored);
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
  if (bundle.product !== "hearing-mode-notes" || bundle.version !== 1 || !Array.isArray(bundle.notes) || !isIsoDate(bundle.exportedAt) || !isSettings(bundle.settings)) {
    throw new Error("This file is not a supported Hearing Mode Notes export.");
  }
  for (const note of bundle.notes) {
    if (!isSetupNote(note)) {
      throw new Error("One or more notes in this export are incomplete.");
    }
  }
  return {
    product: "hearing-mode-notes",
    version: 1,
    exportedAt: bundle.exportedAt,
    notes: bundle.notes as SetupNote[],
    settings: normaliseSettings(bundle.settings)
  };
}

export async function importBundle(bundle: ExportBundle): Promise<void> {
  // Validate before opening a write transaction, then commit notes and settings together.
  const valid = validateImport(bundle);
  const db = await database();
  const tx = db.transaction([NOTES, SETTINGS], "readwrite");
  for (const note of valid.notes) tx.objectStore(NOTES).put(note);
  tx.objectStore(SETTINGS).put(valid.settings, "app");
  await transactionDone(tx, "The import could not be saved. Your existing notebook was left unchanged.");
  db.close();
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
  await transactionDone(tx, "Could not clear local data.");
  db.close();
}

function transactionDone(tx: IDBTransaction, message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = tx.onerror = () => reject(tx.error ?? new Error(message));
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validText(value: unknown, max: number, required = false): value is string {
  return typeof value === "string" && value.length <= max && (!required || value.trim().length > 0);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isLocation(value: unknown): value is LocationPoint | null {
  if (value === null) return true;
  if (!isRecord(value)) return false;
  return [value.latitude, value.longitude, value.accuracy].every((item) => typeof item === "number" && Number.isFinite(item))
    && Math.abs(value.latitude as number) <= 90 && Math.abs(value.longitude as number) <= 180 && (value.accuracy as number) >= 0;
}

function isSetupNote(value: unknown): value is SetupNote {
  if (!isRecord(value)) return false;
  return validText(value.id, 120, true)
    && validText(value.place, 60, true)
    && validText(value.mode, 80, true)
    && validText(value.volume, 40)
    && validText(value.details, 400)
    && (value.comfort === null || (typeof value.comfort === "number" && Number.isInteger(value.comfort) && value.comfort >= 1 && value.comfort <= 5))
    && typeof value.worked === "boolean"
    && isLocation(value.location)
    && isIsoDate(value.createdAt)
    && isIsoDate(value.updatedAt);
}

function isSettings(value: unknown): value is AppSettings {
  if (!isRecord(value) || !["system", "light", "dark"].includes(String(value.theme)) || !Array.isArray(value.customPlaces)) return false;
  return value.customPlaces.every((place) => validText(place, 40, true));
}

function normaliseSettings(value: unknown): AppSettings {
  if (!isRecord(value)) return { ...defaultSettings };
  const theme: Theme = ["system", "light", "dark"].includes(String(value.theme)) ? value.theme as Theme : defaultSettings.theme;
  const customPlaces = Array.isArray(value.customPlaces)
    ? value.customPlaces.filter((place): place is string => validText(place, 40, true)).filter((place, index, values) => values.findIndex((item) => item.localeCompare(place, undefined, { sensitivity: "accent" }) === 0) === index)
    : [];
  return { theme, customPlaces };
}
