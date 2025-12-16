import type { ExtendedTerminal } from "./types";

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Typewriter effect - writes text character by character
 */
export async function typewriterEffect(
  term: ExtendedTerminal,
  text: string,
  delay: number
): Promise<void> {
  for (const char of text) {
    term.write(char);
    await sleep(delay);
  }
}

/**
 * Dispatch a custom window event
 */
export function dispatchEvent(eventName: string, detail: object = {}): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}

/**
 * Fortune messages - programming quotes
 */
export const FORTUNES = [
  "There are only two hard things in Computer Science: cache invalidation and naming things. — Phil Karlton",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. — Martin Fowler",
  "First, solve the problem. Then, write the code. — John Johnson",
  "The best error message is the one that never shows up. — Thomas Fuchs",
  "Debugging is twice as hard as writing the code in the first place. — Brian Kernighan",
  "It's not a bug – it's an undocumented feature. — Anonymous",
  "Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live. — John Woods",
  "Weeks of coding can save you hours of planning. — Unknown",
  "There is no Ctrl-Z in life. — Unknown",
  "Code is like humor. When you have to explain it, it's bad. — Cory House",
  "The only way to learn a new programming language is by writing programs in it. — Dennis Ritchie",
  "Programming today is a race between software engineers striving to build bigger and better idiot-proof programs, and the Universe trying to produce bigger and better idiots. So far, the Universe is winning. — Rick Cook",
  "Walking on water and developing software from a specification are easy if both are frozen. — Edward V. Berard",
  "Give a man a program, frustrate him for a day. Teach a man to program, frustrate him for a lifetime. — Muhammad Waseem",
  "A good programmer is someone who always looks both ways before crossing a one-way street. — Doug Linder",
  "Measuring programming progress by lines of code is like measuring aircraft building progress by weight. — Bill Gates",
  "Before software can be reusable it first has to be usable. — Ralph Johnson",
  "The computer was born to solve problems that did not exist before. — Bill Gates",
  "In order to understand recursion, one must first understand recursion. — Unknown",
  "Talk is cheap. Show me the code. — Linus Torvalds",
  "99 little bugs in the code. 99 little bugs. Take one down, patch it around. 127 little bugs in the code. — Unknown",
  "Programming is like sex: one mistake and you have to support it for the rest of your life. — Michael Sinz",
  "Software and cathedrals are much the same – first we build them, then we pray. — Sam Redwine",
  "The most disastrous thing that you can ever learn is your first programming language. — Alan Kay",
  "A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?' — Unknown",
];

/**
 * Figlet character definitions for ASCII art text
 */
export const FIGLET_CHARS: Record<string, string[]> = {
  A: ["  █  ", " █ █ ", "█████", "█   █", "█   █"],
  B: ["████ ", "█   █", "████ ", "█   █", "████ "],
  C: [" ████", "█    ", "█    ", "█    ", " ████"],
  D: ["████ ", "█   █", "█   █", "█   █", "████ "],
  E: ["█████", "█    ", "████ ", "█    ", "█████"],
  F: ["█████", "█    ", "████ ", "█    ", "█    "],
  G: [" ████", "█    ", "█  ██", "█   █", " ████"],
  H: ["█   █", "█   █", "█████", "█   █", "█   █"],
  I: ["█████", "  █  ", "  █  ", "  █  ", "█████"],
  J: ["█████", "   █ ", "   █ ", "█  █ ", " ██  "],
  K: ["█   █", "█  █ ", "███  ", "█  █ ", "█   █"],
  L: ["█    ", "█    ", "█    ", "█    ", "█████"],
  M: ["█   █", "██ ██", "█ █ █", "█   █", "█   █"],
  N: ["█   █", "██  █", "█ █ █", "█  ██", "█   █"],
  O: [" ███ ", "█   █", "█   █", "█   █", " ███ "],
  P: ["████ ", "█   █", "████ ", "█    ", "█    "],
  Q: [" ███ ", "█   █", "█   █", "█  █ ", " ██ █"],
  R: ["████ ", "█   █", "████ ", "█  █ ", "█   █"],
  S: [" ████", "█    ", " ███ ", "    █", "████ "],
  T: ["█████", "  █  ", "  █  ", "  █  ", "  █  "],
  U: ["█   █", "█   █", "█   █", "█   █", " ███ "],
  V: ["█   █", "█   █", "█   █", " █ █ ", "  █  "],
  W: ["█   █", "█   █", "█ █ █", "██ ██", "█   █"],
  X: ["█   █", " █ █ ", "  █  ", " █ █ ", "█   █"],
  Y: ["█   █", " █ █ ", "  █  ", "  █  ", "  █  "],
  Z: ["█████", "   █ ", "  █  ", " █   ", "█████"],
  " ": ["     ", "     ", "     ", "     ", "     "],
  "0": [" ███ ", "█  ██", "█ █ █", "██  █", " ███ "],
  "1": ["  █  ", " ██  ", "  █  ", "  █  ", " ███ "],
  "2": [" ███ ", "█   █", "  ██ ", " █   ", "█████"],
  "3": ["████ ", "    █", " ███ ", "    █", "████ "],
  "4": ["█   █", "█   █", "█████", "    █", "    █"],
  "5": ["█████", "█    ", "████ ", "    █", "████ "],
  "6": [" ███ ", "█    ", "████ ", "█   █", " ███ "],
  "7": ["█████", "   █ ", "  █  ", " █   ", "█    "],
  "8": [" ███ ", "█   █", " ███ ", "█   █", " ███ "],
  "9": [" ███ ", "█   █", " ████", "    █", " ███ "],
  "!": ["  █  ", "  █  ", "  █  ", "     ", "  █  "],
  "?": [" ███ ", "█   █", "  █  ", "     ", "  █  "],
};

/**
 * Weather condition definitions for simulated weather
 */
export const WEATHER_CONDITIONS = [
  {
    condition: "sunny",
    icon: [
      "    \\   /    ",
      "     .-.     ",
      "  ‒ (   ) ‒  ",
      "     `-᾿     ",
      "    /   \\    ",
    ],
    color: "brightYellow",
    temp: { min: 22, max: 35 },
    desc: "Clear sky",
  },
  {
    condition: "cloudy",
    icon: [
      "             ",
      "     .--.    ",
      "  .-(    ).  ",
      " (___.__)__) ",
      "             ",
    ],
    color: "white",
    temp: { min: 15, max: 25 },
    desc: "Cloudy",
  },
  {
    condition: "rainy",
    icon: [
      "     .-.     ",
      "    (   ).   ",
      "   (___(__)  ",
      "   ‚ʻ‚ʻ‚ʻ‚ʻ  ",
      "   ‚ʻ‚ʻ‚ʻ‚ʻ  ",
    ],
    color: "brightCyan",
    temp: { min: 10, max: 20 },
    desc: "Light rain",
  },
  {
    condition: "stormy",
    icon: [
      "     .-.     ",
      "    (   ).   ",
      "   (___(__)  ",
      "  ⚡ʻ‚⚡ʻ‚   ",
      "   ‚ʻ‚ʻ‚ʻ    ",
    ],
    color: "brightMagenta",
    temp: { min: 8, max: 18 },
    desc: "Thunderstorm",
  },
  {
    condition: "snowy",
    icon: [
      "     .-.     ",
      "    (   ).   ",
      "   (___(__)  ",
      "   * * * *   ",
      "  * * * *    ",
    ],
    color: "brightWhite",
    temp: { min: -10, max: 2 },
    desc: "Snowfall",
  },
  {
    condition: "foggy",
    icon: [
      "             ",
      "  _ - _ - _  ",
      " _ - _ - _ - ",
      "  - _ - _ -  ",
      "             ",
    ],
    color: "dim",
    temp: { min: 5, max: 15 },
    desc: "Foggy",
  },
];

/**
 * Steam locomotive ASCII frames for the sl command
 */
export const STEAM_LOCOMOTIVE_FRAMES = [
  [
    "      ====        ________                ___________ ",
    "  _D _|  |_______/        \\__I_I_____===__|_________| ",
    "   |(_)---  |   H\\________/ |   |        =|___ ___|   ",
    "   /     |  |   H  |  |     |   |         ||_| |_||   ",
    "  |      |  |   H  |__--------------------| [___] |   ",
    "  | ________|___H__/__|_____/[][]~\\_______|       |   ",
    "  |/ |   |-----------I_____I [][] []  D   |=======|__ ",
    "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ",
    " |/-=|___|=    ||    ||    ||    |_____/~\\___/        ",
    "  \\_/      \\O=====O=====O=====O_/      \\_/            ",
  ],
  [
    "      ====        ________                ___________ ",
    "  _D _|  |_______/        \\__I_I_____===__|_________| ",
    "   |(_)---  |   H\\________/ |   |        =|___ ___|   ",
    "   /     |  |   H  |  |     |   |         ||_| |_||   ",
    "  |      |  |   H  |__--------------------| [___] |   ",
    "  | ________|___H__/__|_____/[][]~\\_______|       |   ",
    "  |/ |   |-----------I_____I [][] []  D   |=======|__ ",
    "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ",
    " |/-=|___|=   O=====O=====O=====O|_____/~\\___/        ",
    "  \\_/      \\_/      \\_/     \\_/  \\_/      \\_/         ",
  ],
];

/**
 * Witty ping responses for various hosts
 */
export const PING_RESPONSES: Record<string, string[]> = {
  "google.com": [
    "64 bytes from the void: icmp_seq=1 ttl=∞ time=0.001ms",
    "Google knows you're pinging them. They already knew.",
    "64 bytes from the omniscient cloud: time=instant",
  ],
  localhost: [
    "64 bytes from yourself: Are you okay?",
    "Pinging yourself? That's deep.",
    "127.0.0.1 is lonely and appreciates the attention",
  ],
  "github.com": [
    "64 bytes from the code repository of dreams",
    "Response: 'Have you committed today?'",
    "GitHub responds: 'Your PR is still pending review'",
  ],
  "stackoverflow.com": [
    "64 bytes from the sacred texts",
    "Response: 'This question was marked as duplicate'",
    "Connection redirected to an answer from 2009",
  ],
  "frhd.me": [
    "64 bytes from home: You're already here!",
    "Response: 'Stop pinging yourself'",
    "Latency: 0ms (you're literally inside me)",
  ],
};

/**
 * Cache helper for live data commands
 */
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

interface CachedData<T> {
  data: T;
  timestamp: number;
}

export function getCachedData<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    const cached: CachedData<T> = JSON.parse(stored);
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    return cached.data;
  } catch {
    return null;
  }
}

export function setCachedData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const cached: CachedData<T> = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(cached));
  } catch {
    // Storage might be full, silently fail
  }
}
