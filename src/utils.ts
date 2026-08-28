import type { SetupNote } from "./types";

export const FREE_NOTE_LIMIT = 12;
export const DEFAULT_PLACES = ["Home", "Work", "Café", "Restaurant", "Commute", "Outdoors"];

export function createId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function relativeDate(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(value);
}

export function comfortLabel(value: number | null): string {
  return value ? ["", "Difficult", "Tiring", "Okay", "Comfortable", "Easy"][value] ?? "Not rated" : "Not rated";
}

export function reminderText(note: SetupNote): string {
  const parts = [`${note.place}: ${note.mode}`];
  if (note.volume) parts.push(`Volume ${note.volume}`);
  if (note.details) parts.push(note.details);
  return parts.join(" · ");
}

export function filterNotes(notes: SetupNote[], query: string): SetupNote[] {
  const term = query.trim().toLocaleLowerCase();
  if (!term) return notes;
  return notes.filter((note) => [note.place, note.mode, note.volume, note.details].some((value) => value.toLocaleLowerCase().includes(term)));
}
