"use client";

import { useEffect, useRef } from "react";

interface XTermMatrixRainProps {
  duration?: number;
  onComplete?: () => void;
}

export default function XTermMatrixRain({
  duration = Infinity, // Run indefinitely by default
  onComplete,
}: XTermMatrixRainProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Focus the container on mount to capture keyboard events
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Keyboard event handler for 'q' key and Escape
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'q' || event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        onComplete?.();
      }
    };
    
    // Add keyboard listener with capture to intercept before other handlers
    document.addEventListener('keydown', handleKeyPress, true);
    document.addEventListener('keyup', handleKeyPress, true);

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Enhanced Matrix rain configuration
    const fontSize = 12; // Smaller font = more streams
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(0).map(() => -Math.random() * 100); // Randomized start positions
    const dropSpeeds: number[] = Array(columns).fill(0).map(() => Math.random() * 1.2 + 0.8); // Faster speeds between 0.8-2.0
    const trailLengths: number[] = Array(columns).fill(0).map(() => Math.random() * 15 + 5); // Variable trail lengths
    
    // Frame rate control - faster animation
    let lastTime = 0;
    const targetFPS = 35; // Increased from 24 to 35 for faster animation
    const frameInterval = 1000 / targetFPS;

    // Enhanced character set with more variety
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿ";

    // Animation function with enhanced effects
    const animate = (currentTime: number) => {
      if (currentTime - lastTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime;

      // Enhanced fade effect for better trails
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)"; // Slightly stronger fade for cleaner trails
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Matrix green with enhanced effects
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Create brighter leading character
        const isLeadingChar = Math.random() > 0.85;
        let brightness = Math.random() * 0.4 + 0.6; // Base brightness 0.6 to 1.0
        
        if (isLeadingChar) {
          brightness = 1.0; // Full brightness for leading chars
        }
        
        const green = Math.floor(255 * brightness);
        ctx.fillStyle = `rgb(0, ${green}, 0)`;
        
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset column more frequently for more dynamic streams
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.96) { // Increased from 0.985 to 0.96
          drops[i] = 0;
          // Give it a new random speed and trail length
          dropSpeeds[i] = Math.random() * 1.2 + 0.8;
          trailLengths[i] = Math.random() * 15 + 5;
        }

        // Move drop down at its individual speed
        drops[i] += dropSpeeds[i];
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener('keydown', handleKeyPress, true);
      document.removeEventListener('keyup', handleKeyPress, true);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [duration, onComplete]);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1000,
        outline: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        className="matrix-rain-overlay"
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}