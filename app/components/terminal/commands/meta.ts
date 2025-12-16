import type { Command } from "./types";
import { getCachedData, setCachedData } from "./utils";
import {
  getAchievementStats,
  getUnlockedAchievements,
  ACHIEVEMENTS,
  type AchievementId,
  unlockAchievement,
} from "../achievements";
import {
  getSessionUptime,
  getLastVisitString,
  getVisitData,
} from "../time-utils";
import {
  loadState,
  resetState,
  parseCommand as parseAdventureCommand,
  getStats as getAdventureStats,
  type AdventureState,
} from "../adventure-engine";
import {
  getPluginRegistry,
  examplePlugins,
  type PluginCommand,
} from "../plugin-system";

// GitHub constants
const GITHUB_USERNAME = "frhd";

interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  avatar_url: string;
  html_url: string;
  created_at: string;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
}

interface HackerNewsStory {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
  time: number;
}

// Adventure state management
let adventureState: AdventureState | null = null;
let adventureMode = false;

/**
 * Achievements command - view unlocked achievements
 */
const achievementsCommand: Command = {
  name: "achievements",
  description: "View your unlocked achievements",
  category: "progress",
  execute: (term) => {
    const stats = getAchievementStats();
    const unlocked = getUnlockedAchievements();

    term.writeln(term.colorize("=== Achievements ===", "brightYellow"));
    term.writeln("");
    term.writeln(
      `Progress: ${term.colorize(
        `${stats.unlocked}/${stats.total}`,
        "brightGreen"
      )} (${stats.percentage}%)`
    );
    term.writeln("");

    // Display all achievements
    const allIds = Object.keys(ACHIEVEMENTS) as AchievementId[];

    // Show unlocked achievements first
    const unlockedSet = new Set(unlocked);
    const sortedIds = [
      ...allIds.filter((id) => unlockedSet.has(id)),
      ...allIds.filter((id) => !unlockedSet.has(id)),
    ];

    for (const id of sortedIds) {
      const isUnlocked = unlockedSet.has(id);
      const achievement = ACHIEVEMENTS[id];

      if (achievement.secret && !isUnlocked) {
        term.writeln(term.colorize("○ 🔒 ?????? - Secret achievement", "dim"));
      } else {
        const status = isUnlocked ? "✓" : "○";
        const icon = isUnlocked ? achievement.icon : "🔒";
        const color = isUnlocked ? "brightGreen" : "dim";
        term.writeln(
          term.colorize(
            `${status} ${icon} ${achievement.name} - ${achievement.description}`,
            color
          )
        );
      }
    }

    term.writeln("");
    if (stats.unlocked < stats.total) {
      term.writeln(
        term.colorize(
          "Tip: Explore the terminal to unlock more achievements!",
          "dim"
        )
      );
    } else {
      term.writeln(
        term.colorize(
          "🎉 Congratulations! You've unlocked all achievements!",
          "brightMagenta"
        )
      );
    }
  },
};

/**
 * Uptime command - show current session duration
 */
const uptimeCommand: Command = {
  name: "uptime",
  description: "Show current session duration",
  category: "session",
  execute: (term) => {
    const uptime = getSessionUptime();
    term.writeln(term.colorize("=== Session Uptime ===", "brightCyan"));
    term.writeln("");
    term.writeln(`Current session: ${term.colorize(uptime, "brightGreen")}`);
    term.writeln("");
    term.writeln(term.colorize("Keep exploring!", "dim"));
  },
};

/**
 * Last command - show when you last visited
 */
const lastCommand: Command = {
  name: "last",
  description: "Show when you last visited",
  category: "session",
  execute: (term) => {
    const lastVisit = getLastVisitString();
    const visitData = getVisitData();

    term.writeln(term.colorize("=== Visit History ===", "brightCyan"));
    term.writeln("");

    if (lastVisit) {
      term.writeln(`Last visit: ${term.colorize(lastVisit, "brightYellow")}`);
    } else {
      term.writeln(term.colorize("This is your first visit!", "brightGreen"));
    }

    term.writeln(
      `Total visits: ${term.colorize(
        visitData.visitCount.toString(),
        "brightGreen"
      )}`
    );
  },
};

/**
 * Status command - show site and session status
 */
const statusCommand: Command = {
  name: "status",
  description: "Show site and session status",
  category: "live",
  execute: (term) => {
    const visitData = getVisitData();
    const uptime = getSessionUptime();

    term.writeln(term.colorize("=== Site Status ===", "brightCyan"));
    term.writeln("");
    term.writeln(
      `${term.colorize("Status:", "white")} ${term.colorize(
        "● Online",
        "brightGreen"
      )}`
    );
    term.writeln(`${term.colorize("Server:", "white")} Vercel Edge Network`);
    term.writeln(`${term.colorize("Region:", "white")} Global CDN`);
    term.writeln(`${term.colorize("Framework:", "white")} Next.js 15`);
    term.writeln(`${term.colorize("Rendering:", "white")} Static Export`);
    term.writeln("");
    term.writeln(term.colorize("=== Session Info ===", "brightYellow"));
    term.writeln(`${term.colorize("Current Session:", "white")} ${uptime}`);
    term.writeln(
      `${term.colorize("Your Visit Count:", "white")} ${term.colorize(
        visitData.visitCount.toString(),
        "brightGreen"
      )}`
    );
    term.writeln("");
    term.writeln(term.colorize("=== Browser Info ===", "brightMagenta"));

    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent;
      const isMobile = /Mobile|Android|iPhone/i.test(ua);
      const browser = ua.includes("Firefox")
        ? "Firefox"
        : ua.includes("Chrome")
        ? "Chrome"
        : ua.includes("Safari")
        ? "Safari"
        : ua.includes("Edge")
        ? "Edge"
        : "Unknown";

      term.writeln(`${term.colorize("Browser:", "white")} ${browser}`);
      term.writeln(
        `${term.colorize("Device:", "white")} ${isMobile ? "Mobile" : "Desktop"}`
      );
      term.writeln(
        `${term.colorize("Online:", "white")} ${
          navigator.onLine
            ? term.colorize("Yes", "brightGreen")
            : term.colorize("No", "brightRed")
        }`
      );
    }
  },
};

/**
 * GitHub command - show GitHub profile
 */
const githubCommand: Command = {
  name: "github",
  usage: "github [profile|repos|stats]",
  description: "Show GitHub profile summary",
  category: "live",
  execute: async (term, args) => {
    const subCommand = args[0]?.toLowerCase();

    if (!subCommand || subCommand === "profile") {
      await displayGitHubProfile(term);
    } else if (subCommand === "repos") {
      await displayGitHubRepos(term);
    } else if (subCommand === "stats") {
      await displayGitHubStats(term);
    } else {
      term.writeln(
        term.colorize("Usage: github [profile|repos|stats]", "brightYellow")
      );
      term.writeln("");
      term.writeln(
        `  ${term.colorize("github", "dim")}         Show GitHub profile summary`
      );
      term.writeln(
        `  ${term.colorize("github repos", "dim")}   List public repositories`
      );
      term.writeln(
        `  ${term.colorize("github stats", "dim")}   Show contribution stats`
      );
    }
  },
};

async function displayGitHubProfile(
  term: Parameters<Command["execute"]>[0]
): Promise<void> {
  const cacheKey = `frhd-github-profile-${GITHUB_USERNAME}`;
  let userData = getCachedData<GitHubUser>(cacheKey);

  if (!userData) {
    term.writeln(term.colorize("Fetching GitHub profile...", "brightCyan"));
    try {
      const response = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}`
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      userData = await response.json();
      setCachedData(cacheKey, userData);
    } catch (error) {
      term.writeln(term.colorize("Failed to fetch GitHub profile", "brightRed"));
      term.writeln(
        term.colorize(
          `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          "dim"
        )
      );
      return;
    }
  }

  if (!userData) {
    term.writeln(term.colorize("No profile data available", "brightRed"));
    return;
  }

  term.writeln(term.colorize("=== GitHub Profile ===", "brightCyan"));
  term.writeln("");
  term.writeln(
    `${term.colorize("User:", "white")} ${term.colorize(
      userData.login,
      "brightGreen"
    )}`
  );
  if (userData.name) {
    term.writeln(`${term.colorize("Name:", "white")} ${userData.name}`);
  }
  if (userData.bio) {
    term.writeln(`${term.colorize("Bio:", "white")} ${userData.bio}`);
  }
  term.writeln(
    `${term.colorize("Public Repos:", "white")} ${term.colorize(
      userData.public_repos.toString(),
      "brightYellow"
    )}`
  );
  term.writeln(`${term.colorize("Followers:", "white")} ${userData.followers}`);
  term.writeln(`${term.colorize("Following:", "white")} ${userData.following}`);
  term.writeln(
    `${term.colorize("URL:", "white")} ${term.colorize(
      userData.html_url,
      "brightBlue"
    )}`
  );
  term.writeln("");
  term.writeln(
    term.colorize("Use 'github repos' to see repositories", "dim")
  );
}

async function displayGitHubRepos(
  term: Parameters<Command["execute"]>[0]
): Promise<void> {
  const cacheKey = `frhd-github-repos-${GITHUB_USERNAME}`;
  let repos = getCachedData<GitHubRepo[]>(cacheKey);

  if (!repos) {
    term.writeln(term.colorize("Fetching repositories...", "brightCyan"));
    try {
      const response = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=10`
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      repos = await response.json();
      setCachedData(cacheKey, repos);
    } catch (error) {
      term.writeln(
        term.colorize("Failed to fetch repositories", "brightRed")
      );
      term.writeln(
        term.colorize(
          `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          "dim"
        )
      );
      return;
    }
  }

  term.writeln(term.colorize("=== Public Repositories ===", "brightCyan"));
  term.writeln("");

  if (!repos || repos.length === 0) {
    term.writeln(term.colorize("No public repositories found", "dim"));
    return;
  }

  for (const repo of repos.slice(0, 10)) {
    const stars =
      repo.stargazers_count > 0 ? ` ⭐${repo.stargazers_count}` : "";
    const lang = repo.language
      ? term.colorize(` [${repo.language}]`, "brightMagenta")
      : "";
    term.writeln(`${term.colorize(repo.name, "brightGreen")}${lang}${stars}`);
    if (repo.description) {
      term.writeln(
        `  ${term.colorize(repo.description.slice(0, 60), "dim")}${
          repo.description.length > 60 ? "..." : ""
        }`
      );
    }
  }

  term.writeln("");
  term.writeln(
    term.colorize(`View more at: github.com/${GITHUB_USERNAME}`, "dim")
  );
}

async function displayGitHubStats(
  term: Parameters<Command["execute"]>[0]
): Promise<void> {
  let userData = getCachedData<GitHubUser>(
    `frhd-github-profile-${GITHUB_USERNAME}`
  );
  let repos = getCachedData<GitHubRepo[]>(
    `frhd-github-repos-${GITHUB_USERNAME}`
  );

  if (!userData || !repos) {
    term.writeln(term.colorize("Fetching stats...", "brightCyan"));
    try {
      const [userResponse, reposResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
        fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`
        ),
      ]);

      if (!userResponse.ok || !reposResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      userData = await userResponse.json();
      repos = await reposResponse.json();
      setCachedData(`frhd-github-profile-${GITHUB_USERNAME}`, userData);
      setCachedData(`frhd-github-stats-${GITHUB_USERNAME}`, repos);
    } catch (error) {
      term.writeln(term.colorize("Failed to fetch stats", "brightRed"));
      term.writeln(
        term.colorize(
          `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          "dim"
        )
      );
      return;
    }
  }

  // Calculate stats from available data
  const totalStars =
    repos?.reduce((sum, repo) => sum + repo.stargazers_count, 0) || 0;
  const totalForks =
    repos?.reduce((sum, repo) => sum + repo.forks_count, 0) || 0;
  const languages = new Set(repos?.map((r) => r.language).filter(Boolean));
  const memberSince = userData?.created_at
    ? new Date(userData.created_at).getFullYear()
    : "Unknown";

  term.writeln(term.colorize("=== GitHub Stats ===", "brightCyan"));
  term.writeln("");
  term.writeln(
    `${term.colorize("Total Repositories:", "white")} ${term.colorize(
      userData?.public_repos?.toString() || "0",
      "brightYellow"
    )}`
  );
  term.writeln(
    `${term.colorize("Total Stars:", "white")} ${term.colorize(
      `⭐ ${totalStars}`,
      "brightYellow"
    )}`
  );
  term.writeln(
    `${term.colorize("Total Forks:", "white")} ${term.colorize(
      `🍴 ${totalForks}`,
      "brightGreen"
    )}`
  );
  term.writeln(
    `${term.colorize("Languages:", "white")} ${term.colorize(
      languages.size.toString(),
      "brightMagenta"
    )}`
  );
  term.writeln(`${term.colorize("Member Since:", "white")} ${memberSince}`);
  term.writeln(
    `${term.colorize("Followers:", "white")} ${userData?.followers || 0}`
  );
  term.writeln("");

  // Show top languages
  const langCounts: Record<string, number> = {};
  repos?.forEach((repo) => {
    if (repo.language) {
      langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
    }
  });
  const topLangs = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (topLangs.length > 0) {
    term.writeln(term.colorize("Top Languages:", "brightYellow"));
    for (const [lang, count] of topLangs) {
      const bar = "█".repeat(Math.min(count * 2, 20));
      term.writeln(
        `  ${term.colorize(lang.padEnd(12), "brightGreen")} ${term.colorize(
          bar,
          "brightCyan"
        )} ${count}`
      );
    }
  }

  term.writeln("");
  term.writeln(
    term.colorize("Note: Contribution graph requires authentication", "dim")
  );
}

/**
 * News command - show tech news from Hacker News
 */
const newsCommand: Command = {
  name: "news",
  usage: "news [--tech]",
  description: "Top tech news from Hacker News",
  category: "live",
  execute: async (term, args) => {
    const flag = args[0]?.toLowerCase();

    // Validate flag if provided
    if (flag && flag !== "--tech" && flag !== "-t") {
      term.writeln(term.colorize("Usage: news [--tech]", "brightYellow"));
      return;
    }

    const cacheKey = "frhd-hackernews-top";
    let stories = getCachedData<HackerNewsStory[]>(cacheKey);

    if (!stories) {
      term.writeln(term.colorize("Fetching latest tech news...", "brightCyan"));
      try {
        // Fetch top story IDs
        const idsResponse = await fetch(
          "https://hacker-news.firebaseio.com/v0/topstories.json"
        );
        if (!idsResponse.ok) {
          throw new Error(`HTTP ${idsResponse.status}`);
        }
        const allIds: number[] = await idsResponse.json();
        const topIds = allIds.slice(0, 10);

        // Fetch story details
        const storyPromises = topIds.map((id) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
            (r) => r.json()
          )
        );
        stories = await Promise.all(storyPromises);
        setCachedData(cacheKey, stories);
      } catch (error) {
        term.writeln(term.colorize("Failed to fetch news", "brightRed"));
        term.writeln(
          term.colorize(
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            "dim"
          )
        );
        return;
      }
    }

    term.writeln(
      term.colorize("=== Hacker News Top Stories ===", "brightCyan")
    );
    term.writeln("");

    if (!stories || stories.length === 0) {
      term.writeln(term.colorize("No stories found", "dim"));
      return;
    }

    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      if (!story) continue;

      const rank = term.colorize(`${(i + 1).toString().padStart(2)}.`, "dim");
      const points = term.colorize(`▲${story.score}`, "brightYellow");
      const title =
        story.title.length > 55
          ? story.title.slice(0, 55) + "..."
          : story.title;

      term.writeln(`${rank} ${title}`);
      term.writeln(
        `    ${points} by ${term.colorize(story.by, "brightGreen")}`
      );
    }

    term.writeln("");
    term.writeln(term.colorize("Source: news.ycombinator.com", "dim"));
    term.writeln(term.colorize("Data cached for 1 hour", "dim"));
  },
};

/**
 * Adventure command - text adventure game
 */
const adventureCommand: Command = {
  name: "adventure",
  usage: "adventure [command]",
  description: "Text adventure game",
  category: "games",
  execute: (term, args) => {
    const subCommand = args[0]?.toLowerCase();

    if (subCommand === "reset") {
      adventureState = resetState();
      adventureMode = false;
      term.writeln(term.colorize("Adventure progress reset.", "brightYellow"));
      term.writeln("Type 'adventure' to start a new journey.");
      return;
    }

    if (subCommand === "stats") {
      if (!adventureState) {
        adventureState = loadState();
      }
      const stats = getAdventureStats(adventureState);
      term.writeln(term.colorize("=== Adventure Stats ===", "brightCyan"));
      term.writeln("");
      term.writeln(
        `Moves: ${term.colorize(stats.moveCount.toString(), "brightGreen")}`
      );
      term.writeln(
        `Items: ${term.colorize(stats.itemsCollected.toString(), "brightYellow")}`
      );
      term.writeln(
        `Rooms: ${term.colorize(
          `${stats.roomsVisited}/${stats.totalRooms}`,
          "brightMagenta"
        )}`
      );
      term.writeln(
        `Complete: ${term.colorize(
          stats.gameComplete ? "Yes" : "No",
          stats.gameComplete ? "brightGreen" : "brightRed"
        )}`
      );
      return;
    }

    if (subCommand === "exit" || subCommand === "quit") {
      if (adventureMode) {
        adventureMode = false;
        term.writeln(term.colorize("Exited adventure mode.", "brightYellow"));
        term.writeln(
          "Your progress has been saved. Type 'adventure' to continue."
        );
      } else {
        term.writeln(term.colorize("You're not in adventure mode.", "dim"));
      }
      return;
    }

    if (subCommand === "help") {
      displayAdventureHelp(term);
      return;
    }

    // Start or continue adventure
    if (!adventureState) {
      adventureState = loadState();
    }

    // Unlock game_on achievement
    unlockAchievement("game_on");

    // Enable adventure mode
    adventureMode = true;

    // If a command is provided (e.g., "adventure look"), execute it
    if (args.length > 0 && subCommand !== "start") {
      const adventureInput = args.join(" ");
      const result = parseAdventureCommand(adventureInput, adventureState);
      adventureState = result.newState;
      result.output.forEach((line) => term.writeln(line));

      // Check for game completion achievement
      if (adventureState.gameComplete) {
        unlockAchievement("completionist");
      }
    } else {
      // Start or show current state
      const result = parseAdventureCommand("look", adventureState);
      adventureState = result.newState;
      result.output.forEach((line) => term.writeln(line));
    }

    term.writeln("");
    term.writeln(
      term.colorize(
        "Tip: Type commands directly or use 'adventure <command>'",
        "dim"
      )
    );
    term.writeln(
      term.colorize("Type 'adventure exit' to leave adventure mode", "dim")
    );
  },
};

function displayAdventureHelp(
  term: Parameters<Command["execute"]>[0]
): void {
  term.writeln(term.colorize("=== Adventure Mode ===", "brightCyan"));
  term.writeln("");
  term.writeln("An interactive text adventure exploring a developer's journey.");
  term.writeln("");
  term.writeln(term.colorize("Commands:", "brightYellow"));
  term.writeln("  adventure              Start or continue the adventure");
  term.writeln("  adventure reset        Reset progress and start over");
  term.writeln("  adventure stats        View your adventure statistics");
  term.writeln("  adventure exit         Exit adventure mode");
  term.writeln("  adventure help         Show this help");
  term.writeln("");
  term.writeln(term.colorize("In-game commands:", "brightYellow"));
  term.writeln("  look, l                Look around");
  term.writeln("  go <direction>         Move (north, south, east, west)");
  term.writeln("  n, s, e, w             Direction shortcuts");
  term.writeln("  take <item>            Pick up an item");
  term.writeln("  drop <item>            Drop an item");
  term.writeln("  inventory, i           Check your inventory");
  term.writeln("  examine <thing>        Examine something closely");
  term.writeln("  exits                  List available exits");
  term.writeln("  help                   In-game help");
  term.writeln("");
  term.writeln(
    term.colorize("Goal:", "brightGreen") +
      " Explore your career journey, collect memories,"
  );
  term.writeln("and reach the summit to claim your reward!");
}

/**
 * Plugin command - manage plugins
 */
const pluginCommand: Command = {
  name: "plugin",
  usage: "plugin list|install|remove|create",
  description: "Show installed plugins",
  category: "plugin",
  execute: async (term, args) => {
    const subCommand = args[0]?.toLowerCase();
    const registry = getPluginRegistry();

    if (!subCommand || subCommand === "list") {
      // List installed plugins
      const plugins = registry.getPlugins();

      term.writeln(term.colorize("=== Plugin System ===", "brightMagenta"));
      term.writeln("");

      if (plugins.length === 0) {
        term.writeln(term.colorize("No plugins installed.", "dim"));
        term.writeln("");
        term.writeln("Available example plugins:");
        term.writeln(
          `  ${term.colorize(
            "dice",
            "brightCyan"
          )}      - Roll dice with various configurations`
        );
        term.writeln(
          `  ${term.colorize("countdown", "brightCyan")} - Simple countdown timer`
        );
        term.writeln(
          `  ${term.colorize("ascii", "brightCyan")}     - Fun ASCII art emoticons`
        );
        term.writeln("");
        term.writeln(
          `Install with: ${term.colorize(
            "plugin install <name>",
            "brightYellow"
          )}`
        );
      } else {
        term.writeln(term.colorize("Installed Plugins:", "brightGreen"));
        term.writeln("");
        for (const plugin of plugins) {
          term.writeln(
            `  ${term.colorize(plugin.name, "brightCyan")} v${plugin.version}`
          );
          term.writeln(`    ${term.colorize(plugin.description, "dim")}`);
          term.writeln(`    ID: ${term.colorize(plugin.id, "dim")}`);
          term.writeln(
            `    Commands: ${plugin.commands
              .map((c: PluginCommand) => term.colorize(c.name, "brightYellow"))
              .join(", ")}`
          );
          term.writeln("");
        }
        term.writeln(
          `Remove with: ${term.colorize("plugin remove <id>", "brightYellow")}`
        );
      }
      return;
    }

    if (subCommand === "install") {
      const pluginId = args[1]?.toLowerCase();
      if (!pluginId) {
        term.writeln(
          term.colorize("Usage: plugin install <name>", "brightYellow")
        );
        term.writeln("");
        term.writeln("Available example plugins:");
        term.writeln(
          `  ${term.colorize(
            "dice",
            "brightCyan"
          )}      - Roll dice (adds 'roll' command)`
        );
        term.writeln(
          `  ${term.colorize(
            "countdown",
            "brightCyan"
          )} - Countdown timer (adds 'countdown' command)`
        );
        term.writeln(
          `  ${term.colorize(
            "ascii",
            "brightCyan"
          )}     - ASCII emoticons (adds 'shrug', 'tableflip', 'unflip')`
        );
        return;
      }

      // Check if it's an example plugin
      const exampleSource =
        examplePlugins[pluginId as keyof typeof examplePlugins];
      if (!exampleSource) {
        term.writeln(
          term.colorize(`Unknown plugin: ${pluginId}`, "brightRed")
        );
        term.writeln("");
        term.writeln("Available example plugins: dice, countdown, ascii");
        return;
      }

      try {
        const plugin = registry.parsePlugin(exampleSource);
        if (plugin) {
          registry.registerPlugin(plugin);
          term.writeln(
            term.colorize(`Installed plugin: ${plugin.name}`, "brightGreen")
          );
          term.writeln(
            `New commands: ${plugin.commands
              .map((c: PluginCommand) => term.colorize(c.name, "brightYellow"))
              .join(", ")}`
          );
        }
      } catch (e) {
        term.writeln(
          term.colorize(
            `Failed to install: ${
              e instanceof Error ? e.message : "Unknown error"
            }`,
            "brightRed"
          )
        );
      }
      return;
    }

    if (subCommand === "remove") {
      const pluginId = args[1];
      if (!pluginId) {
        term.writeln(
          term.colorize("Usage: plugin remove <id>", "brightYellow")
        );
        term.writeln("");
        const plugins = registry.getPlugins();
        if (plugins.length > 0) {
          term.writeln("Installed plugin IDs:");
          for (const plugin of plugins) {
            term.writeln(`  ${term.colorize(plugin.id, "brightCyan")}`);
          }
        }
        return;
      }

      const removed = registry.unregisterPlugin(pluginId);
      if (removed) {
        term.writeln(
          term.colorize(`Removed plugin: ${pluginId}`, "brightGreen")
        );
      } else {
        term.writeln(term.colorize(`Plugin not found: ${pluginId}`, "brightRed"));
      }
      return;
    }

    if (subCommand === "create") {
      term.writeln(
        term.colorize("=== Plugin Creation Guide ===", "brightCyan")
      );
      term.writeln("");
      term.writeln("Plugins are JavaScript objects with the following structure:");
      term.writeln("");
      term.writeln(term.colorize("const plugin = {", "brightYellow"));
      term.writeln(term.colorize('  name: "My Plugin",', "brightYellow"));
      term.writeln(term.colorize('  version: "1.0.0",', "brightYellow"));
      term.writeln(term.colorize('  author: "Your Name",', "brightYellow"));
      term.writeln(term.colorize('  description: "What it does",', "brightYellow"));
      term.writeln(term.colorize("  commands: [", "brightYellow"));
      term.writeln(term.colorize("    {", "brightYellow"));
      term.writeln(term.colorize('      name: "mycommand",', "brightYellow"));
      term.writeln(
        term.colorize('      description: "My custom command",', "brightYellow")
      );
      term.writeln(
        term.colorize("      execute: function(term, args) {", "brightYellow")
      );
      term.writeln(
        term.colorize('        term.writeln("Hello from plugin!");', "brightYellow")
      );
      term.writeln(term.colorize("      }", "brightYellow"));
      term.writeln(term.colorize("    }", "brightYellow"));
      term.writeln(term.colorize("  ]", "brightYellow"));
      term.writeln(term.colorize("};", "brightYellow"));
      term.writeln("");
      term.writeln(term.colorize("Available Terminal Methods:", "brightGreen"));
      term.writeln("  term.write(text)     - Write without newline");
      term.writeln("  term.writeln(text)   - Write with newline");
      term.writeln("  term.clear()         - Clear terminal");
      term.writeln("  term.colorize(text, color)");
      term.writeln("");
      term.writeln(term.colorize("Available Colors:", "brightGreen"));
      term.writeln("  red, green, yellow, blue, magenta, cyan, white");
      term.writeln("  brightRed, brightGreen, brightYellow, etc.");
      term.writeln("  bold, dim, italic, underline");
      term.writeln("");
      term.writeln(term.colorize("Note:", "brightYellow"));
      term.writeln("  Plugins run in a sandboxed environment.");
      term.writeln("  No access to window, document, fetch, localStorage.");
      term.writeln("  Async functions are supported with Promise.");
      return;
    }

    // Unknown subcommand
    term.writeln(
      term.colorize(`Unknown plugin command: ${subCommand}`, "brightRed")
    );
    term.writeln("");
    term.writeln("Usage:");
    term.writeln("  plugin list              - Show installed plugins");
    term.writeln("  plugin install <name>    - Install example plugin");
    term.writeln("  plugin remove <id>       - Remove installed plugin");
    term.writeln("  plugin create            - Show plugin creation guide");
  },
};

/**
 * All meta commands
 */
export const metaCommands: Command[] = [
  achievementsCommand,
  uptimeCommand,
  lastCommand,
  statusCommand,
  githubCommand,
  newsCommand,
  adventureCommand,
  pluginCommand,
];

/**
 * Export adventure mode state for use in extensions
 */
export function isInAdventureMode(): boolean {
  return adventureMode;
}

export function executeAdventureInput(
  term: Parameters<Command["execute"]>[0],
  input: string
): void {
  if (!adventureState) {
    adventureState = loadState();
  }
  const result = parseAdventureCommand(input, adventureState);
  adventureState = result.newState;
  result.output.forEach((line) => term.writeln(line));

  if (adventureState.gameComplete) {
    unlockAchievement("completionist");
  }
}
