/**
 * Prompt rendering utilities for the terminal
 */

import { colorize } from "./colors";

export interface PromptConfig {
  user: string;
  host: string;
  cwd: string;
}

/**
 * ASCII art logo displayed on terminal initialization
 */
export const terminalLogo = [
  "  __      _         _                  ",
  " / _|    | |       | |                 ",
  "| |_ _ __| |__   __| |  _ __ ___   ___ ",
  "|  _| '__| '_ \\ / _` | | '_ ` _ \\ / _ \\",
  "| | | |  | | | | (_| |_| | | | | |  __/",
  "|_| |_|  |_| |_|\\__,_(_)_| |_| |_|\\___|",
  "",
];

/**
 * Render the terminal prompt
 */
export function renderPrompt(config: PromptConfig): string {
  const { user, host, cwd } = config;
  return `${colorize(user, "brightYellow")}@${colorize(host, "brightGreen")}:${colorize(cwd, "brightBlue")}$ `;
}

/**
 * Render the colorized logo
 */
export function renderLogo(): string[] {
  return terminalLogo.map((line) => colorize(line, "brightGreen"));
}

/**
 * Default prompt configuration
 */
export const defaultPromptConfig: PromptConfig = {
  user: "guest",
  host: "frhd.me",
  cwd: "~",
};
