import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { clearAllData, getNotes, importBundle, makeExport, saveNote, toCsv, validateImport } from "../../src/storage";
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

  it("quotes CSV fields", () => {
    expect(toCsv([{ ...note, details: 'Near the door, "quiet"' }])).toContain('"Near the door, ""quiet"""');
  });
});
