// Time-based features utility

const VISIT_STORAGE_KEY = "frhd-terminal-visit";
const SESSION_START_KEY = "frhd-terminal-session-start";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface VisitData {
  lastVisit: number | null;
  visitCount: number;
}

export interface Holiday {
  name: string;
  month: number; // 1-12
  day?: number; // For specific dates (optional)
  endDay?: number; // For date ranges
}

// Get current time of day
export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) {
    return "morning";
  } else if (hour >= 12 && hour < 18) {
    return "afternoon";
  } else if (hour >= 18 && hour < 22) {
    return "evening";
  } else {
    return "night";
  }
}

// Get time-based greeting
export function getTimeGreeting(): string {
  const timeOfDay = getTimeOfDay();

  switch (timeOfDay) {
    case "morning":
      return "Good morning, early coder...";
    case "afternoon":
      return "Good afternoon, digital explorer...";
    case "evening":
      return "Good evening, night wanderer...";
    case "night":
      return "Burning the midnight oil...";
  }
}

// Defined holidays/special dates
const HOLIDAYS: Holiday[] = [
  { name: "halloween", month: 10, day: 31 },
  { name: "winter", month: 12, day: 1, endDay: 31 },
  { name: "newYear", month: 1, day: 1 },
  { name: "aprilFools", month: 4, day: 1 },
];

// Check if today is a special date
export function getCurrentHoliday(): string | null {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth is 0-indexed
  const day = now.getDate();

  for (const holiday of HOLIDAYS) {
    if (holiday.month === month) {
      if (holiday.endDay) {
        // Date range
        if (day >= (holiday.day || 1) && day <= holiday.endDay) {
          return holiday.name;
        }
      } else if (holiday.day === day) {
        // Specific date
        return holiday.name;
      }
    }
  }

  return null;
}

// Get seasonal ASCII art / special message
export function getSeasonalMessage(): string | null {
  const holiday = getCurrentHoliday();

  switch (holiday) {
    case "halloween":
      return `
  \x1b[33m      _____
    .'     '.
   /  o   o  \\
  |     <     |
  |  \\  ---  /|
   \\  '._.'  /
    '._____.'\x1b[0m

\x1b[35m🎃 Happy Halloween! Watch out for bugs... 👻\x1b[0m`;

    case "winter":
      return `
  \x1b[37m    *  .  *
       * .
     *   *
        .      *
   .   *   .      *
\x1b[0m
\x1b[36m❄️  Happy Holidays! May your code compile on the first try. ❄️\x1b[0m`;

    case "newYear":
      return `
  \x1b[33m🎉 Happy New Year! 🎉\x1b[0m
  \x1b[36mMay your code be clean and your commits be meaningful.\x1b[0m`;

    case "aprilFools":
      return `
  \x1b[35m🃏 April Fools' Day! 🃏\x1b[0m
  \x1b[33mDon't trust any commit messages today...\x1b[0m`;

    default:
      return null;
  }
}

// Session tracking

export function initSession(): void {
  if (typeof window === "undefined") return;

  // Set session start time if not already set
  if (!sessionStorage.getItem(SESSION_START_KEY)) {
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
  }

  // Update visit data
  updateVisitData();
}

export function getSessionUptime(): string {
  if (typeof window === "undefined") return "0 seconds";

  const startTime = sessionStorage.getItem(SESSION_START_KEY);
  if (!startTime) return "0 seconds";

  const elapsed = Date.now() - parseInt(startTime, 10);
  return formatDuration(elapsed);
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days !== 1 ? "s" : ""}, ${hours % 24} hour${hours % 24 !== 1 ? "s" : ""}`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}, ${minutes % 60} minute${minutes % 60 !== 1 ? "s" : ""}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}, ${seconds % 60} second${seconds % 60 !== 1 ? "s" : ""}`;
  } else {
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  }
}

// Visit tracking

function updateVisitData(): void {
  if (typeof window === "undefined") return;

  const stored = localStorage.getItem(VISIT_STORAGE_KEY);
  let data: VisitData = {
    lastVisit: null,
    visitCount: 0,
  };

  if (stored) {
    try {
      data = JSON.parse(stored);
    } catch {
      // Invalid data, use defaults
    }
  }

  // Store current visit before updating
  const previousVisit = data.lastVisit;

  // Update data
  data.lastVisit = Date.now();
  data.visitCount += 1;

  localStorage.setItem(VISIT_STORAGE_KEY, JSON.stringify(data));

  // Keep track of previous visit for return greeting
  if (previousVisit) {
    sessionStorage.setItem("previous-visit", previousVisit.toString());
  }
}

export function getVisitData(): VisitData {
  if (typeof window === "undefined") {
    return { lastVisit: null, visitCount: 0 };
  }

  const stored = localStorage.getItem(VISIT_STORAGE_KEY);
  if (!stored) {
    return { lastVisit: null, visitCount: 0 };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return { lastVisit: null, visitCount: 0 };
  }
}

export function getLastVisitString(): string | null {
  if (typeof window === "undefined") return null;

  // Get the previous visit (before current session)
  const previousVisit = sessionStorage.getItem("previous-visit");
  if (!previousVisit) return null;

  const lastVisit = parseInt(previousVisit, 10);
  const now = Date.now();
  const diff = now - lastVisit;

  // Calculate time ago
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  } else {
    return "just now";
  }
}

export function getReturnGreeting(): string | null {
  const lastVisit = getLastVisitString();
  if (!lastVisit) return null;

  const visitData = getVisitData();
  if (visitData.visitCount <= 1) return null;

  return `Welcome back! Last seen ${lastVisit}.`;
}
