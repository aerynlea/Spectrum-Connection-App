"use client";

import type { CSSProperties } from "react";
import { useEffect, useSyncExternalStore } from "react";

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
const appearanceSubscribers = new Set<() => void>();

function resolveMode(mode: AppearanceMode) {
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
  const resolvedMode = resolveMode(mode);
  const root = document.documentElement;

  root.dataset.themeMode = mode;
  root.dataset.themePalette = palette;
  root.dataset.themeResolved = resolvedMode;
  root.style.colorScheme = resolvedMode;

  if (!persist) {
    return;
  }

  try {
    window.localStorage.setItem(appearanceStorageKeys.mode, mode);
    window.localStorage.setItem(appearanceStorageKeys.palette, palette);
  } catch {
    // Ignore storage failures so the app still remains usable.
  }
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

  return {
    mode,
    palette,
  };
}

function subscribeToAppearance(callback: () => void) {
  appearanceSubscribers.add(callback);

  return () => {
    appearanceSubscribers.delete(callback);
  };
}

function notifyAppearanceChange() {
  appearanceSubscribers.forEach((callback) => callback());
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
  const { mode, palette } = useSyncExternalStore(
    subscribeToAppearance,
    readAppearance,
    () => defaultAppearance,
  );

  useEffect(() => {
    applyAppearance(mode, palette, false);
  }, [mode, palette]);

  useEffect(() => {
    if (mode !== "system") {
      return undefined;
    }

    const media = window.matchMedia(mediaQuery);
    const syncSystemPreference = () => {
      applyAppearance("system", palette, false);
      notifyAppearanceChange();
    };

    syncSystemPreference();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", syncSystemPreference);
      return () => media.removeEventListener("change", syncSystemPreference);
    }

    media.addListener(syncSystemPreference);
    return () => media.removeListener(syncSystemPreference);
  }, [mode, palette]);

  const handleModeChange = (nextMode: AppearanceMode) => {
    applyAppearance(nextMode, palette);
    notifyAppearanceChange();
  };

  const handlePaletteChange = (nextPalette: AppearancePalette) => {
    applyAppearance(mode, nextPalette);
    notifyAppearanceChange();
  };

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
