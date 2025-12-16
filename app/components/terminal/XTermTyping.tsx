"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface TypingProps {
  onComplete: () => void;
}

const CODE_SNIPPETS = [
  `function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}`,
  `const quickSort = (arr) => {\n  if (arr.length <= 1) return arr;\n  const pivot = arr[0];\n  const left = arr.slice(1).filter(x => x < pivot);\n  const right = arr.slice(1).filter(x => x >= pivot);\n  return [...quickSort(left), pivot, ...quickSort(right)];\n};`,
  `async function fetchData(url) {\n  const response = await fetch(url);\n  const data = await response.json();\n  return data;\n}`,
  `class Stack {\n  constructor() {\n    this.items = [];\n  }\n  push(item) {\n    this.items.push(item);\n  }\n  pop() {\n    return this.items.pop();\n  }\n}`,
  `const debounce = (fn, delay) => {\n  let timeoutId;\n  return (...args) => {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => fn(...args), delay);\n  };\n};`,
  `function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`,
  `const memoize = (fn) => {\n  const cache = new Map();\n  return (...args) => {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn(...args);\n    cache.set(key, result);\n    return result;\n  };\n};`,
  `interface User {\n  id: number;\n  name: string;\n  email: string;\n  createdAt: Date;\n}\n\ntype UserUpdate = Partial<User>;`,
];

export default function XTermTyping({ onComplete }: TypingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSnippet, setCurrentSnippet] = useState("");
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  const handleComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  // Load high score and initialize
  useEffect(() => {
    const savedHighScore = localStorage.getItem("frhd-typing-highscore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    // Select random snippet
    const snippet = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
    setCurrentSnippet(snippet);
  }, []);

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Calculate WPM in real-time
  useEffect(() => {
    if (startTime && !endTime && typedText.length > 0) {
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      if (elapsedMinutes > 0) {
        // Words are calculated as characters / 5
        const words = typedText.length / 5;
        setWpm(Math.round(words / elapsedMinutes));
      }
    }
  }, [typedText, startTime, endTime]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Exit on ESC or Q when complete or at start
      if (event.key === "Escape" || (event.key.toLowerCase() === "q" && (isComplete || typedText.length === 0))) {
        event.preventDefault();
        event.stopPropagation();
        handleComplete();
        return;
      }

      // Restart on Space when complete
      if (isComplete && event.key === " ") {
        event.preventDefault();
        const snippet = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
        setCurrentSnippet(snippet);
        setTypedText("");
        setStartTime(null);
        setEndTime(null);
        setWpm(0);
        setAccuracy(100);
        setErrors(0);
        setTotalKeystrokes(0);
        setIsComplete(false);
        return;
      }

      if (isComplete) return;

      // Handle backspace
      if (event.key === "Backspace") {
        event.preventDefault();
        setTypedText((prev) => prev.slice(0, -1));
        return;
      }

      // Handle Tab as spaces
      if (event.key === "Tab") {
        event.preventDefault();
        const nextChar = currentSnippet[typedText.length];
        if (nextChar === " " || nextChar === "\n") {
          // Skip whitespace
          let skipCount = 0;
          for (let i = typedText.length; i < currentSnippet.length; i++) {
            if (currentSnippet[i] === " " || currentSnippet[i] === "\n") {
              skipCount++;
            } else {
              break;
            }
          }
          setTypedText((prev) => prev + currentSnippet.slice(prev.length, prev.length + skipCount));
        }
        return;
      }

      // Ignore modifier keys and special keys
      if (event.key.length > 1 && event.key !== "Enter") return;

      event.preventDefault();

      // Start timer on first keystroke
      if (!startTime) {
        setStartTime(Date.now());
      }

      const expectedChar = currentSnippet[typedText.length];
      const inputChar = event.key === "Enter" ? "\n" : event.key;

      setTotalKeystrokes((prev) => prev + 1);

      if (inputChar === expectedChar) {
        const newTypedText = typedText + inputChar;
        setTypedText(newTypedText);

        // Check completion
        if (newTypedText.length >= currentSnippet.length) {
          const now = Date.now();
          setEndTime(now);
          setIsComplete(true);

          const elapsedMinutes = (now - startTime!) / 60000;
          const finalWpm = Math.round((newTypedText.length / 5) / elapsedMinutes);
          setWpm(finalWpm);

          // Save high score
          if (finalWpm > highScore) {
            setHighScore(finalWpm);
            localStorage.setItem("frhd-typing-highscore", finalWpm.toString());
          }
        }
      } else {
        // Wrong character - still add it but mark as error
        setTypedText((prev) => prev + inputChar);
        setErrors((prev) => prev + 1);
      }

      // Update accuracy
      setAccuracy(Math.round(((totalKeystrokes + 1 - errors - (inputChar !== expectedChar ? 1 : 0)) / (totalKeystrokes + 1)) * 100));
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [currentSnippet, typedText, startTime, endTime, isComplete, errors, totalKeystrokes, highScore, handleComplete]);

  // Render the text with highlighting
  const renderText = () => {
    const chars: React.JSX.Element[] = [];

    for (let i = 0; i < currentSnippet.length; i++) {
      const char = currentSnippet[i];
      const typedChar = typedText[i];
      const isCurrent = i === typedText.length;
      const displayChar = char === "\n" ? "↵\n" : char;

      let className = "text-gray-600"; // Untyped
      if (i < typedText.length) {
        if (typedChar === char) {
          className = "text-green-400"; // Correct
        } else {
          className = "text-red-500 bg-red-900/30"; // Wrong
        }
      }

      chars.push(
        <span key={i} className={`${className} relative`}>
          {isCurrent && cursorVisible && (
            <span className="absolute left-0 top-0 w-0.5 h-full bg-green-400 animate-pulse" />
          )}
          {displayChar}
        </span>
      );
    }

    return chars;
  };

  const elapsedTime = startTime
    ? Math.floor(((endTime || Date.now()) - startTime) / 1000)
    : 0;
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-8"
    >
      {/* Header */}
      <div className="w-full max-w-4xl mb-4">
        <div className="flex justify-between items-center text-green-400 font-mono mb-4">
          <div className="text-xl">Typing Test</div>
          <div className="flex gap-6 text-sm">
            <span>WPM: <span className="text-yellow-400">{wpm}</span></span>
            <span>Accuracy: <span className={accuracy >= 90 ? "text-green-400" : accuracy >= 70 ? "text-yellow-400" : "text-red-400"}>{accuracy}%</span></span>
            <span>Time: <span className="text-cyan-400">{minutes}:{seconds.toString().padStart(2, "0")}</span></span>
            <span>Best: <span className="text-purple-400">{highScore} WPM</span></span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-100"
            style={{ width: `${(typedText.length / currentSnippet.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Text display */}
      <div className="w-full max-w-4xl bg-gray-900/50 rounded-lg p-6 font-mono text-lg whitespace-pre-wrap leading-relaxed border border-gray-700">
        {renderText()}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-gray-500 text-sm font-mono">
        {!startTime && "Start typing to begin | TAB to skip whitespace | Q/ESC to exit"}
        {startTime && !isComplete && "Keep typing! | TAB to skip whitespace | ESC to exit"}
      </div>

      {/* Completion screen */}
      {isComplete && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
          <div className="text-center font-mono">
            <h2 className="text-4xl text-green-400 mb-8">Test Complete!</h2>

            <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-xl mb-8">
              <div className="text-right text-gray-400">Speed:</div>
              <div className="text-left text-yellow-400">{wpm} WPM</div>

              <div className="text-right text-gray-400">Accuracy:</div>
              <div className={`text-left ${accuracy >= 90 ? "text-green-400" : accuracy >= 70 ? "text-yellow-400" : "text-red-400"}`}>{accuracy}%</div>

              <div className="text-right text-gray-400">Time:</div>
              <div className="text-left text-cyan-400">{minutes}:{seconds.toString().padStart(2, "0")}</div>

              <div className="text-right text-gray-400">Characters:</div>
              <div className="text-left text-white">{typedText.length}</div>

              <div className="text-right text-gray-400">Errors:</div>
              <div className={`text-left ${errors === 0 ? "text-green-400" : "text-red-400"}`}>{errors}</div>
            </div>

            {wpm >= highScore && wpm > 0 && (
              <div className="text-2xl text-purple-400 mb-6 animate-pulse">
                🎉 New High Score! 🎉
              </div>
            )}

            {wpm >= 60 && (
              <div className="text-green-400 mb-6">
                Speed Demon! You type faster than most programmers! 🚀
              </div>
            )}

            <div className="text-gray-500 mt-8">
              Press SPACE to try again | Q/ESC to exit
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
