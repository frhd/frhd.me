import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  sleep,
  typewriterEffect,
  dispatchEvent,
  FORTUNES,
  FIGLET_CHARS,
  WEATHER_CONDITIONS,
  PING_RESPONSES,
  getCachedData,
  setCachedData,
} from "../../commands/utils";

describe("sleep", () => {
  it("should return a promise that resolves after the specified time", async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(45); // Allow some tolerance
  });
});

describe("typewriterEffect", () => {
  it("should write characters one at a time", async () => {
    const mockTerm = {
      write: vi.fn(),
      writeln: vi.fn(),
      clear: vi.fn(),
      scrollToTop: vi.fn(),
      colorize: vi.fn(),
      cwd: "~",
      disconnect: vi.fn(),
    };

    await typewriterEffect(mockTerm, "Hi", 10);
    expect(mockTerm.write).toHaveBeenCalledTimes(2);
    expect(mockTerm.write).toHaveBeenNthCalledWith(1, "H");
    expect(mockTerm.write).toHaveBeenNthCalledWith(2, "i");
  });
});

describe("dispatchEvent", () => {
  it("should dispatch a custom event on window", () => {
    const handler = vi.fn();
    window.addEventListener("test-event", handler);

    dispatchEvent("test-event", { foo: "bar" });

    expect(handler).toHaveBeenCalled();
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({ foo: "bar" });

    window.removeEventListener("test-event", handler);
  });
});

describe("Constants", () => {
  describe("FORTUNES", () => {
    it("should contain programming quotes", () => {
      expect(FORTUNES.length).toBeGreaterThan(0);
      expect(typeof FORTUNES[0]).toBe("string");
    });
  });

  describe("FIGLET_CHARS", () => {
    it("should contain character definitions", () => {
      expect(FIGLET_CHARS["A"]).toBeDefined();
      expect(FIGLET_CHARS["A"].length).toBe(5); // 5 rows per character
    });

    it("should have a space character", () => {
      expect(FIGLET_CHARS[" "]).toBeDefined();
    });
  });

  describe("WEATHER_CONDITIONS", () => {
    it("should contain weather conditions with icons", () => {
      expect(WEATHER_CONDITIONS.length).toBeGreaterThan(0);
      const sunny = WEATHER_CONDITIONS.find((w) => w.condition === "sunny");
      expect(sunny).toBeDefined();
      expect(sunny?.icon.length).toBe(5);
      expect(sunny?.temp.min).toBeLessThan(sunny?.temp.max || 0);
    });
  });

  describe("PING_RESPONSES", () => {
    it("should contain responses for known hosts", () => {
      expect(PING_RESPONSES["google.com"]).toBeDefined();
      expect(PING_RESPONSES["google.com"].length).toBeGreaterThan(0);
    });
  });
});

describe("Cache utilities", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("setCachedData", () => {
    it("should store data in localStorage", () => {
      setCachedData("test-key", { foo: "bar" });
      const stored = localStorage.getItem("test-key");
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.data).toEqual({ foo: "bar" });
      expect(parsed.timestamp).toBeGreaterThan(0);
    });
  });

  describe("getCachedData", () => {
    it("should retrieve cached data", () => {
      const data = { test: 123 };
      setCachedData("get-test", data);
      const result = getCachedData<typeof data>("get-test");
      expect(result).toEqual(data);
    });

    it("should return null for non-existent keys", () => {
      const result = getCachedData("non-existent");
      expect(result).toBeNull();
    });

    it("should return null for expired data", () => {
      // Manually store expired data
      const expiredCache = {
        data: { old: true },
        timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      };
      localStorage.setItem("expired-key", JSON.stringify(expiredCache));

      const result = getCachedData("expired-key");
      expect(result).toBeNull();
    });
  });
});
