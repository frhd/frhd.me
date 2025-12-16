/**
 * Syntax highlighting for the vim editor
 */

import type { SyntaxPattern, ColorRange } from "./types";

export const SYNTAX_PATTERNS: Record<string, SyntaxPattern[]> = {
  js: [
    { pattern: /\/\/.*$/gm, color: "#6a737d" }, // comments
    { pattern: /\/\*[\s\S]*?\*\//g, color: "#6a737d" }, // multi-line comments
    { pattern: /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g, color: "#9ecbff" }, // strings
    {
      pattern:
        /\b(function|const|let|var|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new)\b/g,
      color: "#ff7b72",
    }, // keywords
    { pattern: /\b(true|false|null|undefined|NaN|Infinity)\b/g, color: "#79c0ff" }, // constants
    { pattern: /\b\d+\.?\d*\b/g, color: "#79c0ff" }, // numbers
    {
      pattern: /\b(console|Math|JSON|Array|Object|String|Number|Date)\b/g,
      color: "#ffa657",
    }, // built-ins
  ],
  ts: [
    { pattern: /\/\/.*$/gm, color: "#6a737d" }, // comments
    { pattern: /\/\*[\s\S]*?\*\//g, color: "#6a737d" }, // multi-line comments
    { pattern: /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g, color: "#9ecbff" }, // strings
    {
      pattern:
        /\b(function|const|let|var|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new|interface|type|enum|implements|extends|public|private|protected)\b/g,
      color: "#ff7b72",
    }, // keywords
    { pattern: /\b(true|false|null|undefined|NaN|Infinity)\b/g, color: "#79c0ff" }, // constants
    { pattern: /\b\d+\.?\d*\b/g, color: "#79c0ff" }, // numbers
    {
      pattern: /\b(console|Math|JSON|Array|Object|String|Number|Date)\b/g,
      color: "#ffa657",
    }, // built-ins
  ],
  py: [
    { pattern: /#.*$/gm, color: "#6a737d" }, // comments
    { pattern: /(["'])(?:(?!\1)[^\\]|\\.)*?\1/g, color: "#9ecbff" }, // strings
    { pattern: /"""[\s\S]*?"""|'''[\s\S]*?'''/g, color: "#9ecbff" }, // docstrings
    {
      pattern:
        /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|yield|lambda|pass|break|continue|raise|assert|global|nonlocal)\b/g,
      color: "#ff7b72",
    }, // keywords
    { pattern: /\b(True|False|None)\b/g, color: "#79c0ff" }, // constants
    { pattern: /\b\d+\.?\d*\b/g, color: "#79c0ff" }, // numbers
    {
      pattern:
        /\b(print|len|range|str|int|float|list|dict|set|tuple|type|isinstance|open)\b/g,
      color: "#ffa657",
    }, // built-ins
  ],
  json: [
    { pattern: /(["'])(?:(?!\1)[^\\]|\\.)*?\1(?=\s*:)/g, color: "#7ee787" }, // keys
    { pattern: /:\s*(["'])(?:(?!\1)[^\\]|\\.)*?\1/g, color: "#9ecbff" }, // string values
    { pattern: /\b(true|false|null)\b/g, color: "#79c0ff" }, // constants
    { pattern: /\b-?\d+\.?\d*\b/g, color: "#79c0ff" }, // numbers
  ],
  txt: [],
};

export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "txt";
}

export function findColorRanges(line: string, ext: string): ColorRange[] {
  const patterns = SYNTAX_PATTERNS[ext] || [];
  const colors: ColorRange[] = [];

  for (const { pattern, color } of patterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(line)) !== null) {
      colors.push({ start: match.index, end: match.index + match[0].length, color });
    }
  }

  // Sort by start position (later matches override earlier)
  colors.sort((a, b) => a.start - b.start);

  return colors;
}

export function highlightLine(
  ctx: CanvasRenderingContext2D,
  line: string,
  x: number,
  y: number,
  charWidth: number,
  ext: string,
  defaultColor: string = "#00ff00"
): void {
  const colors = findColorRanges(line, ext);

  let currentColorIndex = 0;
  for (let i = 0; i < line.length; i++) {
    let charColor = defaultColor;

    while (currentColorIndex < colors.length && colors[currentColorIndex].end <= i) {
      currentColorIndex++;
    }

    if (currentColorIndex < colors.length && colors[currentColorIndex].start <= i) {
      charColor = colors[currentColorIndex].color;
    }

    ctx.fillStyle = charColor;
    ctx.fillText(line[i], x + i * charWidth, y);
  }
}
