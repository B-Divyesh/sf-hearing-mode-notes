import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { clearAllData, getNotes, getSettings, importBundle, makeExport, saveNote, saveSettings, toCsv, validateImport } from "../../src/storage";
import type { SetupNote } from "../../src/types";

const note: SetupNote = {
  id: "test-note",
  place: "Train",
  mode: "Noise reduction",
  volume: "2 taps down",
  details: "Window seat",
  comfort: 4,
  worked: true,
  location: { latitude: 10, longitude: 20, accuracy: 30 },
  createdAt: "2026-08-28T10:00:00.000Z",
  updatedAt: "2026-08-28T10:00:00.000Z"
};

beforeEach(async () => clearAllData());

describe("local notebook", () => {
  it("persists a complete setup in IndexedDB", async () => {
    await saveNote(note);
    expect(await getNotes()).toEqual([note]);
  });

  it("round-trips a JSON ownership export", async () => {
    const bundle = makeExport([note], { theme: "dark", customPlaces: ["Library"] });
    const validated = validateImport(JSON.parse(JSON.stringify(bundle)));
    await importBundle(validated);
    expect((await getNotes())[0]?.place).toBe("Train");
  });

  it("rejects unrelated imports", () => {
    expect(() => validateImport({ product: "something-else", notes: [] })).toThrow(/not a supported/);
  });

  it("rejects malformed settings before changing an existing notebook", async () => {
    await saveNote(note);
    await saveSettings({ theme: "light", customPlaces: ["Library"] });
    const malformed = {
      ...makeExport([{ ...note, id: "imported" }], { theme: "dark", customPlaces: ["Hall"] }),
      settings: { theme: "invalid", customPlaces: null }
    };

    expect(() => validateImport(malformed)).toThrow(/not a supported/);
    await expect(importBundle(malformed as never)).rejects.toThrow(/not a supported/);
    expect(await getNotes()).toEqual([note]);
    expect(await getSettings()).toEqual({ theme: "light", customPlaces: ["Library"] });
  });

  it("filters corrupt local records so the notebook can recover on launch", async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("hearing-mode-notes");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("notes", "readwrite");
      tx.objectStore("notes").put({ id: "bad", place: "Home", customPlaces: null });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();

    expect(await getNotes()).toEqual([]);
  });

  it("quotes CSV fields", () => {
    expect(toCsv([{ ...note, details: 'Near the door, "quiet"' }])).toContain('"Near the door, ""quiet"""');
  });
});
