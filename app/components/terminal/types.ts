export interface Command {
  name: string;
  description: string;
  action: (args?: string[]) => CommandOutput;
}

export interface CommandOutput {
  content: string | React.ReactNode;
  type?: 'text' | 'matrix' | 'glitch' | 'decrypt' | 'error';
  duration?: number;
}

export interface TerminalHistoryItem {
  input: string;
  output: CommandOutput;
  timestamp: Date;
}