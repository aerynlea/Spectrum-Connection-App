"use client";

import type { CSSProperties } from "react";
import { useSyncExternalStore } from "react";

import {
  appearanceModeOptions,
  appearancePaletteOptions,
  appearanceStorageKeys,
  defaultAppearance,
  isAppearanceMode,
  isAppearancePalette,
  type AppearanceMode,
  type AppearancePalette,
} from "@/lib/appearance";

type AppearanceControlsProps = {
  variant?: "popover" | "inline";
};

const mediaQuery = "(prefers-color-scheme: dark)";
const appearanceEventName = "guiding-light-appearancechange";
let cachedAppearanceSnapshot: {
  mode: AppearanceMode;
  palette: AppearancePalette;
} = defaultAppearance;

function resolveMode(mode: AppearanceMode) {
  if (typeof window === "undefined") {
    return "light";
  }

  if (mode === "system") {
    return window.matchMedia(mediaQuery).matches ? "dark" : "light";
  }

  return mode;
}

function applyAppearance(
  mode: AppearanceMode,
  palette: AppearancePalette,
  persist = true,
) {
  if (typeof document === "undefined") {
    return;
  }

  const resolvedMode = resolveMode(mode);
  const root = document.documentElement;

  root.dataset.themeMode = mode;
  root.dataset.themePalette = palette;
  root.dataset.themeResolved = resolvedMode;
  root.style.colorScheme = resolvedMode;

  if (!persist || typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(appearanceStorageKeys.mode, mode);
    window.localStorage.setItem(appearanceStorageKeys.palette, palette);
  } catch {
    // Ignore storage failures so the app still remains usable.
  }

  window.dispatchEvent(new Event(appearanceEventName));
}

function readAppearance() {
  if (typeof document === "undefined") {
    return defaultAppearance;
  }

  const root = document.documentElement;
  const mode = isAppearanceMode(root.dataset.themeMode)
    ? root.dataset.themeMode
    : defaultAppearance.mode;
  const palette = isAppearancePalette(root.dataset.themePalette)
    ? root.dataset.themePalette
    : defaultAppearance.palette;

  if (
    cachedAppearanceSnapshot.mode === mode &&
    cachedAppearanceSnapshot.palette === palette
  ) {
    return cachedAppearanceSnapshot;
  }

  cachedAppearanceSnapshot = {
    mode,
    palette,
  };

  return cachedAppearanceSnapshot;
}

function subscribeToAppearance(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key &&
      event.key !== appearanceStorageKeys.mode &&
      event.key !== appearanceStorageKeys.palette
    ) {
      return;
    }

    onStoreChange();
  };

  const media = window.matchMedia(mediaQuery);
  const handleSystemChange = () => {
    const appearance = readAppearance();

    if (appearance.mode === "system") {
      applyAppearance("system", appearance.palette, false);
    }

    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(appearanceEventName, onStoreChange);

  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", handleSystemChange);
  } else {
    media.addListener(handleSystemChange);
  }

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(appearanceEventName, onStoreChange);

    if (typeof media.addEventListener === "function") {
      media.removeEventListener("change", handleSystemChange);
      return;
    }

    media.removeListener(handleSystemChange);
  };
}

function AppearancePanelContent({
  mode,
  palette,
  onModeChange,
  onPaletteChange,
}: {
  mode: AppearanceMode;
  palette: AppearancePalette;
  onModeChange: (nextMode: AppearanceMode) => void;
  onPaletteChange: (nextPalette: AppearancePalette) => void;
}) {
  return (
    <div className="appearance-panel__surface">
      <div className="appearance-panel__section">
        <p className="appearance-panel__label">Mode</p>
        <div className="appearance-choice-row">
          {appearanceModeOptions.map((option) => (
            <button
              aria-pressed={mode === option.value}
              className={
                mode === option.value
                  ? "appearance-choice appearance-choice--active"
                  : "appearance-choice"
              }
              key={option.value}
              onClick={() => onModeChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="appearance-panel__section">
        <p className="appearance-panel__label">Color</p>
        <div className="palette-grid">
          {appearancePaletteOptions.map((option) => (
            <button
              aria-pressed={palette === option.value}
              className={
                palette === option.value
                  ? "palette-option palette-option--active"
                  : "palette-option"
              }
              key={option.value}
              onClick={() => onPaletteChange(option.value)}
              type="button"
            >
              <span
                aria-hidden="true"
                className="palette-option__swatch"
                style={
                  {
                    "--swatch-a": option.swatch[0],
                    "--swatch-b": option.swatch[1],
                    "--swatch-c": option.swatch[2],
                  } as CSSProperties
                }
              />
              <span className="palette-option__copy">
                <span>{option.label}</span>
                <span>{option.description}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AppearanceControls({
  variant = "popover",
}: AppearanceControlsProps) {
  const appearance = useSyncExternalStore(
    subscribeToAppearance,
    readAppearance,
    () => defaultAppearance,
  );

  const handleModeChange = (nextMode: AppearanceMode) => {
    if (appearance.mode === nextMode) {
      return;
    }

    applyAppearance(nextMode, appearance.palette);
  };

  const handlePaletteChange = (nextPalette: AppearancePalette) => {
    if (appearance.palette === nextPalette) {
      return;
    }

    applyAppearance(appearance.mode, nextPalette);
  };

  const { mode, palette } = appearance;

  if (variant === "inline") {
    return (
      <section className="appearance-panel appearance-panel--inline">
        <div className="appearance-panel__header">
          <p className="appearance-panel__title">Display</p>
          <p className="appearance-panel__hint">Keep the app calm and comfortable.</p>
        </div>
        <AppearancePanelContent
          mode={mode}
          onModeChange={handleModeChange}
          onPaletteChange={handlePaletteChange}
          palette={palette}
        />
      </section>
    );
  }

  return (
    <details className="appearance-panel appearance-panel--popover">
      <summary className="appearance-panel__toggle">
        <span className="appearance-panel__toggle-label">Display</span>
      </summary>
      <AppearancePanelContent
        mode={mode}
        onModeChange={handleModeChange}
        onPaletteChange={handlePaletteChange}
        palette={palette}
      />
    </details>
  );
}
