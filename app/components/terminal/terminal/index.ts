/**
 * Terminal utilities barrel export
 */

// Colors
export { ansiColors, colorize, createColorizer, colors } from "./colors";

// History
export {
  createHistoryState,
  addToHistory,
  navigateHistoryUp,
  navigateHistoryDown,
  resetHistoryIndex,
  type HistoryState,
} from "./history";

// Completion
export {
  builtinCommands,
  getAllCommands,
  completeCommand,
  findCommonPrefix,
  type CompletionResult,
} from "./completion";

// Prompt
export {
  terminalLogo,
  renderPrompt,
  renderLogo,
  defaultPromptConfig,
  type PromptConfig,
} from "./prompt";

// Input
export {
  escapeSequences,
  handleBackspace,
  handleCharacterInput,
  handleCtrlC,
  getHomeCursorMove,
  getEndCursorMove,
} from "./input";

// Theme management
export {
  initializeTheme,
  applyTheme,
  createThemeChangeHandler,
  dispatchThemeChange,
  getStoredTheme,
  getTheme,
  getDefaultTheme,
} from "./theme-manager";

// Effects management
export {
  loadEffectComponents,
  loadMatrixComponent,
  loadCrtComponent,
  isCrtEnabled,
  setCrtEnabled,
  dispatchVisualEffect,
  dispatchMatrixEffect,
  dispatchCrtChange,
  createEffectExitHandler,
  effectHandlesOwnExit,
  type EffectComponentProps,
  type EffectComponent,
  type EffectRegistry,
  type EffectName,
  type PendingEffect,
} from "./effects";
