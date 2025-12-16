// Terminal theme configuration for xterm.js

export interface TerminalTheme {
  name: string;
  displayName: string;
  description: string;
  colors: {
    background: string;
    foreground: string;
    cursor: string;
    cursorAccent: string;
    selectionBackground: string;
    black: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    white: string;
    brightBlack: string;
    brightRed: string;
    brightGreen: string;
    brightYellow: string;
    brightBlue: string;
    brightMagenta: string;
    brightCyan: string;
    brightWhite: string;
  };
}

export const themes: Record<string, TerminalTheme> = {
  matrix: {
    name: "matrix",
    displayName: "Matrix",
    description: "Classic green on black (default)",
    colors: {
      background: "#0a0a0a",
      foreground: "#00ff00",
      cursor: "#00ff00",
      cursorAccent: "#0a0a0a",
      selectionBackground: "#00ff0044",
      black: "#000000",
      red: "#ff0000",
      green: "#00ff00",
      yellow: "#ffff00",
      blue: "#0080ff",
      magenta: "#ff00ff",
      cyan: "#00ffff",
      white: "#ffffff",
      brightBlack: "#555555",
      brightRed: "#ff5555",
      brightGreen: "#55ff55",
      brightYellow: "#ffff55",
      brightBlue: "#5555ff",
      brightMagenta: "#ff55ff",
      brightCyan: "#55ffff",
      brightWhite: "#ffffff",
    },
  },

  amber: {
    name: "amber",
    displayName: "Amber",
    description: "Retro amber phosphor terminal",
    colors: {
      background: "#0a0800",
      foreground: "#ffb000",
      cursor: "#ffb000",
      cursorAccent: "#0a0800",
      selectionBackground: "#ffb00044",
      black: "#000000",
      red: "#ff6600",
      green: "#ffb000",
      yellow: "#ffd000",
      blue: "#cc8800",
      magenta: "#ff8800",
      cyan: "#ffcc00",
      white: "#ffdd88",
      brightBlack: "#665500",
      brightRed: "#ff8833",
      brightGreen: "#ffcc33",
      brightYellow: "#ffee55",
      brightBlue: "#ddaa33",
      brightMagenta: "#ffaa44",
      brightCyan: "#ffdd55",
      brightWhite: "#ffeeaa",
    },
  },

  cyberpunk: {
    name: "cyberpunk",
    displayName: "Cyberpunk",
    description: "Neon pink and cyan futuristic",
    colors: {
      background: "#0d0221",
      foreground: "#0abdc6",
      cursor: "#ff2a6d",
      cursorAccent: "#0d0221",
      selectionBackground: "#ff2a6d44",
      black: "#000000",
      red: "#ff2a6d",
      green: "#05d9e8",
      yellow: "#f9f002",
      blue: "#7700ff",
      magenta: "#ff2a6d",
      cyan: "#0abdc6",
      white: "#d1f7ff",
      brightBlack: "#5c4d7d",
      brightRed: "#ff6b9d",
      brightGreen: "#45f0df",
      brightYellow: "#fcf75e",
      brightBlue: "#9d4edd",
      brightMagenta: "#ff79c6",
      brightCyan: "#45f0df",
      brightWhite: "#ffffff",
    },
  },

  dracula: {
    name: "dracula",
    displayName: "Dracula",
    description: "Popular purple-based dark theme",
    colors: {
      background: "#282a36",
      foreground: "#f8f8f2",
      cursor: "#f8f8f2",
      cursorAccent: "#282a36",
      selectionBackground: "#44475a",
      black: "#21222c",
      red: "#ff5555",
      green: "#50fa7b",
      yellow: "#f1fa8c",
      blue: "#bd93f9",
      magenta: "#ff79c6",
      cyan: "#8be9fd",
      white: "#f8f8f2",
      brightBlack: "#6272a4",
      brightRed: "#ff6e6e",
      brightGreen: "#69ff94",
      brightYellow: "#ffffa5",
      brightBlue: "#d6acff",
      brightMagenta: "#ff92df",
      brightCyan: "#a4ffff",
      brightWhite: "#ffffff",
    },
  },

  light: {
    name: "light",
    displayName: "Light",
    description: "For the brave (or foolish)",
    colors: {
      background: "#ffffff",
      foreground: "#1a1a1a",
      cursor: "#1a1a1a",
      cursorAccent: "#ffffff",
      selectionBackground: "#0066ff33",
      black: "#000000",
      red: "#cc0000",
      green: "#007700",
      yellow: "#aa5500",
      blue: "#0066cc",
      magenta: "#8800aa",
      cyan: "#007788",
      white: "#eeeeee",
      brightBlack: "#555555",
      brightRed: "#ff3333",
      brightGreen: "#00aa00",
      brightYellow: "#ffaa00",
      brightBlue: "#0088ff",
      brightMagenta: "#aa44cc",
      brightCyan: "#00aaaa",
      brightWhite: "#ffffff",
    },
  },
};

const THEME_STORAGE_KEY = "frhd-terminal-theme";

export function getStoredTheme(): string {
  if (typeof window === "undefined") return "matrix";
  return localStorage.getItem(THEME_STORAGE_KEY) || "matrix";
}

export function setStoredTheme(themeName: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_STORAGE_KEY, themeName);
}

export function getTheme(name: string): TerminalTheme | undefined {
  return themes[name];
}

export function getThemeNames(): string[] {
  return Object.keys(themes);
}

export function getDefaultTheme(): TerminalTheme {
  return themes.matrix;
}
