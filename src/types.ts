export type Theme = "system" | "light" | "dark";

export interface LocationPoint {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface SetupNote {
  id: string;
  place: string;
  mode: string;
  volume: string;
  details: string;
  comfort: number | null;
  worked: boolean;
  location: LocationPoint | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  theme: Theme;
  customPlaces: string[];
}

export interface ExportBundle {
  product: "hearing-mode-notes";
  version: 1;
  exportedAt: string;
  notes: SetupNote[];
  settings: AppSettings;
}
