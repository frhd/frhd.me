/**
 * Visual Effects Manager for Terminal
 * Handles loading, activation, and cleanup of visual effects
 */

import type { ComponentType } from "react";

// Effect component props interface
export interface EffectComponentProps {
  onComplete: () => void;
  [key: string]: unknown;
}

// Effect component type
export type EffectComponent = ComponentType<EffectComponentProps>;

// Effect registry type
export type EffectRegistry = Record<string, EffectComponent>;

// Available effect names
export type EffectName =
  | "matrix"
  | "pipes"
  | "plasma"
  | "fireworks"
  | "snake"
  | "tetris"
  | "typing"
  | "2048"
  | "vim";

// Pending effect state
export interface PendingEffect {
  effect: string;
  props: Record<string, unknown>;
}

/**
 * Load all visual effect components dynamically
 * @returns Promise resolving to effect registry
 */
export async function loadEffectComponents(): Promise<EffectRegistry> {
  const [pipes, plasma, fireworks, snake, tetris, typing, game2048, vim] =
    await Promise.all([
      import("../XTermPipes"),
      import("../XTermPlasma"),
      import("../XTermFireworks"),
      import("../XTermSnake"),
      import("../XTermTetris"),
      import("../XTermTyping"),
      import("../XTerm2048"),
      import("../XTermVim"),
    ]);

  return {
    pipes: pipes.default,
    plasma: plasma.default,
    fireworks: fireworks.default,
    snake: snake.default,
    tetris: tetris.default,
    typing: typing.default,
    "2048": game2048.default,
    vim: vim.default,
  };
}

/**
 * Load the Matrix rain effect component
 * @returns Promise resolving to Matrix component
 */
export async function loadMatrixComponent(): Promise<EffectComponent> {
  const matrixModule = await import("../XTermMatrixRain");
  return matrixModule.default;
}

/**
 * Load the CRT overlay effect component
 * @returns Promise resolving to CRT component
 */
export async function loadCrtComponent(): Promise<EffectComponent> {
  const crtModule = await import("../XTermCRT");
  return crtModule.default;
}

/**
 * Check if CRT effect is enabled in storage
 * @returns Whether CRT is enabled
 */
export function isCrtEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("frhd-terminal-crt") === "true";
}

/**
 * Set CRT effect enabled state in storage
 * @param enabled - Whether to enable CRT
 */
export function setCrtEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("frhd-terminal-crt", enabled ? "true" : "false");
}

/**
 * Dispatch visual effect activation event
 * @param effect - Name of the effect to activate
 * @param props - Additional props to pass to the effect
 */
export function dispatchVisualEffect(
  effect: string,
  props: Record<string, unknown> = {}
): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("visual-effect", {
        detail: { effect, ...props },
      })
    );
  }
}

/**
 * Dispatch Matrix effect activation event
 */
export function dispatchMatrixEffect(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("matrix-effect"));
  }
}

/**
 * Dispatch CRT toggle event
 * @param enabled - Whether CRT is enabled
 */
export function dispatchCrtChange(enabled: boolean): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("terminal-crt-change", {
        detail: { enabled },
      })
    );
  }
}

/**
 * Create keyboard handler for exiting effects
 * @param options - Handler options
 * @returns Event handler function
 */
export function createEffectExitHandler(options: {
  activeEffect: string | null;
  showMatrix: boolean;
  onExit: () => void;
}): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    // Skip vim - it handles its own keyboard events
    if (options.activeEffect === "vim") return;

    if (
      (options.showMatrix || options.activeEffect) &&
      (event.key.toLowerCase() === "q" || event.key === "Escape")
    ) {
      options.onExit();
      event.preventDefault();
    }
  };
}

/**
 * Check if an effect should handle its own exit
 * @param effectName - Name of the effect
 * @returns Whether the effect handles its own exit
 */
export function effectHandlesOwnExit(effectName: string | null): boolean {
  return effectName === "vim";
}
