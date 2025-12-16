import { describe, it, expect } from "vitest";
import { getFileExtension, findColorRanges } from "../../vim/syntax";

describe("vim/syntax", () => {
  describe("getFileExtension", () => {
    it("should extract extension from filename", () => {
      expect(getFileExtension("hello.js")).toBe("js");
      expect(getFileExtension("example.py")).toBe("py");
      expect(getFileExtension("config.json")).toBe("json");
      expect(getFileExtension("readme.txt")).toBe("txt");
    });

    it("should handle files with multiple dots", () => {
      expect(getFileExtension("test.spec.ts")).toBe("ts");
      expect(getFileExtension("file.test.js")).toBe("js");
    });

    it("should return txt for files without extension", () => {
      expect(getFileExtension("Makefile")).toBe("txt");
      expect(getFileExtension("README")).toBe("txt");
    });
  });

  describe("findColorRanges", () => {
    it("should find JavaScript keywords", () => {
      const line = "const x = 1;";
      const ranges = findColorRanges(line, "js");

      const constRange = ranges.find(
        (r) => r.start === 0 && r.end === 5 && r.color === "#ff7b72"
      );
      expect(constRange).toBeDefined();
    });

    it("should find JavaScript comments", () => {
      const line = "// this is a comment";
      const ranges = findColorRanges(line, "js");

      const commentRange = ranges.find((r) => r.start === 0 && r.color === "#6a737d");
      expect(commentRange).toBeDefined();
    });

    it("should find JavaScript strings", () => {
      const line = 'const msg = "hello";';
      const ranges = findColorRanges(line, "js");

      const stringRange = ranges.find((r) => r.color === "#9ecbff");
      expect(stringRange).toBeDefined();
    });

    it("should find JavaScript numbers", () => {
      const line = "const x = 42;";
      const ranges = findColorRanges(line, "js");

      const numberRange = ranges.find((r) => r.color === "#79c0ff");
      expect(numberRange).toBeDefined();
    });

    it("should find Python keywords", () => {
      const line = "def hello():";
      const ranges = findColorRanges(line, "py");

      const defRange = ranges.find(
        (r) => r.start === 0 && r.end === 3 && r.color === "#ff7b72"
      );
      expect(defRange).toBeDefined();
    });

    it("should find Python comments", () => {
      const line = "# this is a comment";
      const ranges = findColorRanges(line, "py");

      const commentRange = ranges.find((r) => r.start === 0 && r.color === "#6a737d");
      expect(commentRange).toBeDefined();
    });

    it("should find JSON keys", () => {
      const line = '  "name": "test",';
      const ranges = findColorRanges(line, "json");

      const keyRange = ranges.find((r) => r.color === "#7ee787");
      expect(keyRange).toBeDefined();
    });

    it("should return empty array for unknown extension", () => {
      const line = "some text";
      const ranges = findColorRanges(line, "unknown");
      expect(ranges).toEqual([]);
    });

    it("should return empty array for txt files", () => {
      const line = "plain text";
      const ranges = findColorRanges(line, "txt");
      expect(ranges).toEqual([]);
    });
  });
});
