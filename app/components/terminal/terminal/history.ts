/**
 * Command history management for the terminal
 */

export interface HistoryState {
  history: string[];
  historyIndex: number;
}

/**
 * Create initial history state
 */
export function createHistoryState(): HistoryState {
  return {
    history: [],
    historyIndex: -1,
  };
}

/**
 * Add a command to history
 */
export function addToHistory(state: HistoryState, command: string): HistoryState {
  return {
    history: [...state.history, command],
    historyIndex: state.history.length + 1,
  };
}

/**
 * Navigate to previous history item
 * Returns the new state and the command to display (or undefined if at start)
 */
export function navigateHistoryUp(
  state: HistoryState
): { state: HistoryState; command: string | undefined } {
  if (state.historyIndex > 0) {
    const newIndex = state.historyIndex - 1;
    return {
      state: { ...state, historyIndex: newIndex },
      command: state.history[newIndex],
    };
  }
  return { state, command: undefined };
}

/**
 * Navigate to next history item
 * Returns the new state and the command to display (or empty string if at end)
 */
export function navigateHistoryDown(
  state: HistoryState
): { state: HistoryState; command: string | undefined } {
  if (state.historyIndex < state.history.length - 1) {
    const newIndex = state.historyIndex + 1;
    return {
      state: { ...state, historyIndex: newIndex },
      command: state.history[newIndex],
    };
  } else if (state.historyIndex === state.history.length - 1) {
    return {
      state: { ...state, historyIndex: state.history.length },
      command: "",
    };
  }
  return { state, command: undefined };
}

/**
 * Reset history index to end (after history length)
 */
export function resetHistoryIndex(state: HistoryState): HistoryState {
  return {
    ...state,
    historyIndex: state.history.length,
  };
}
