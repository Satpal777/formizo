export const FORM_THEMES = [
  {
    id: "midnight",
    name: "Midnight",
    page: "#181818",
    surface: "#1e1e1e",
    elevated: "#252526",
    border: "#2b2b2b",
    input: "#181818",
    text: "#ffffff",
    muted: "#9d9d9d",
    accent: "#3794ff",
    accentText: "#ffffff",
  },
  {
    id: "mint",
    name: "Mint",
    page: "#effaf4",
    surface: "#ffffff",
    elevated: "#f7fcf9",
    border: "#bfe7cf",
    input: "#ffffff",
    text: "#123524",
    muted: "#517361",
    accent: "#16834a",
    accentText: "#ffffff",
  },
  {
    id: "studio",
    name: "Studio",
    page: "#f6f3ee",
    surface: "#fffaf2",
    elevated: "#f0e8dc",
    border: "#d8c9b7",
    input: "#fffdf8",
    text: "#2b2520",
    muted: "#776b60",
    accent: "#b45309",
    accentText: "#ffffff",
  },
  {
    id: "ocean",
    name: "Ocean",
    page: "#eef7fb",
    surface: "#ffffff",
    elevated: "#e3f2f8",
    border: "#b9dce9",
    input: "#ffffff",
    text: "#102f3f",
    muted: "#526f7c",
    accent: "#087ea4",
    accentText: "#ffffff",
  },
] as const;

export type FormThemeId = (typeof FORM_THEMES)[number]["id"];
export type FormTheme = (typeof FORM_THEMES)[number];

export const DEFAULT_FORM_THEME_ID: FormThemeId = "midnight";

export function getFormTheme(themeId: string | null | undefined): FormTheme {
  return FORM_THEMES.find((theme) => theme.id === themeId) ?? FORM_THEMES[0];
}
