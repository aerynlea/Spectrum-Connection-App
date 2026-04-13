export const appearanceModeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export const appearancePaletteOptions = [
  {
    value: "guiding-light",
    label: "Guiding Light",
    description: "Soft blue, lavender, and warm coral.",
    swatch: ["#7bbcff", "#8572e9", "#ff9c73"],
  },
  {
    value: "coastal",
    label: "Coastal Calm",
    description: "Sea glass blue, indigo, and apricot.",
    swatch: ["#68c8dd", "#4b77d8", "#ffaf88"],
  },
  {
    value: "sunrise",
    label: "Sunrise",
    description: "Peach, rose, and golden light.",
    swatch: ["#ffb48f", "#e779a7", "#ffd27a"],
  },
  {
    value: "meadow",
    label: "Meadow",
    description: "Sage, teal, and soft amber.",
    swatch: ["#6fbfb1", "#5b8fb8", "#f1c978"],
  },
] as const;

export type AppearanceMode = (typeof appearanceModeOptions)[number]["value"];
export type AppearancePalette = (typeof appearancePaletteOptions)[number]["value"];

export const appearanceStorageKeys = {
  mode: "guiding-light-theme-mode",
  palette: "guiding-light-theme-palette",
} as const;

export const defaultAppearance = {
  mode: "system",
  palette: "guiding-light",
} satisfies {
  mode: AppearanceMode;
  palette: AppearancePalette;
};

const appearanceModes = appearanceModeOptions.map((option) => option.value);
const appearancePalettes = appearancePaletteOptions.map((option) => option.value);

export function isAppearanceMode(value: string | null | undefined): value is AppearanceMode {
  return appearanceModes.includes(value as AppearanceMode);
}

export function isAppearancePalette(
  value: string | null | undefined,
): value is AppearancePalette {
  return appearancePalettes.includes(value as AppearancePalette);
}

export function getAppearanceBootstrapScript() {
  return `
    (function () {
      var root = document.documentElement;
      var modeKey = ${JSON.stringify(appearanceStorageKeys.mode)};
      var paletteKey = ${JSON.stringify(appearanceStorageKeys.palette)};
      var defaultMode = ${JSON.stringify(defaultAppearance.mode)};
      var defaultPalette = ${JSON.stringify(defaultAppearance.palette)};
      var validModes = ${JSON.stringify(appearanceModes)};
      var validPalettes = ${JSON.stringify(appearancePalettes)};

      function readStorage(key) {
        try {
          return window.localStorage.getItem(key);
        } catch {
          return null;
        }
      }

      function sanitize(value, validValues, fallback) {
        return validValues.indexOf(value) >= 0 ? value : fallback;
      }

      var mode = sanitize(readStorage(modeKey), validModes, defaultMode);
      var palette = sanitize(readStorage(paletteKey), validPalettes, defaultPalette);
      var resolvedMode =
        mode === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : mode;

      root.dataset.themeMode = mode;
      root.dataset.themePalette = palette;
      root.dataset.themeResolved = resolvedMode;
      root.style.colorScheme = resolvedMode;
    })();
  `;
}
