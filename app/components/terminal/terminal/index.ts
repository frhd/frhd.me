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
