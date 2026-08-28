import { describe, expect, it } from "vitest";
import type { SetupNote } from "../../src/types";
import { comfortLabel, filterNotes, reminderText } from "../../src/utils";

const note: SetupNote = {
  id: "one",
  place: "Corner café",
  mode: "Conversation",
  volume: "3",
  details: "Back to the wall",
  comfort: 4,
  worked: true,
  location: null,
  createdAt: "2026-08-28T12:00:00.000Z",
  updatedAt: "2026-08-28T12:00:00.000Z"
};

describe("note helpers", () => {
  it("searches all useful recall fields case-insensitively", () => {
    expect(filterNotes([note], "CAFÉ")).toEqual([note]);
    expect(filterNotes([note], "wall")).toEqual([note]);
    expect(filterNotes([note], "music")).toEqual([]);
  });

  it("builds a concise reminder", () => {
    expect(reminderText(note)).toBe("Corner café: Conversation · Volume 3 · Back to the wall");
  });

  it("uses plain-language comfort labels", () => {
    expect(comfortLabel(1)).toBe("Difficult");
    expect(comfortLabel(5)).toBe("Easy");
    expect(comfortLabel(null)).toBe("Not rated");
  });
});
