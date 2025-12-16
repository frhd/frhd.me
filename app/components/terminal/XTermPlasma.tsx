"use client";

import { useEffect, useRef } from "react";

interface PlasmaProps {
  onComplete: () => void;
}

export default function XTermPlasma({ onComplete }: PlasmaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size (lower res for performance, will scale up)
    const scale = 4;
    canvas.width = Math.floor(window.innerWidth / scale);
    canvas.height = Math.floor(window.innerHeight / scale);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.imageSmoothingEnabled = false;

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    let time = 0;

    // Precompute sin table for performance
    const sinTable: number[] = [];
    for (let i = 0; i < 512; i++) {
      sinTable[i] = Math.sin((i / 512) * Math.PI * 2);
    }

    const getSin = (val: number): number => {
      const idx = Math.floor(((val % 1) + 1) % 1 * 512);
      return sinTable[idx];
    };

    const animate = () => {
      time += 0.02;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          // Classic plasma formula
          const v1 = getSin(x / 30 + time);
          const v2 = getSin((y / 20 + time) * 0.5);
          const v3 = getSin((x / 25 + y / 25 + time) * 0.3);
          const v4 = getSin(Math.sqrt((x - canvas.width / 2) ** 2 + (y - canvas.height / 2) ** 2) / 30 + time);

          const v = (v1 + v2 + v3 + v4) / 4;

          // Color palette (cyberpunk-ish)
          const r = Math.floor((getSin(v * 2 + time * 0.3) + 1) * 127);
          const g = Math.floor((getSin(v * 2 + time * 0.3 + 0.33) + 1) * 80);
          const b = Math.floor((getSin(v * 2 + time * 0.3 + 0.66) + 1) * 127);

          const idx = (y * canvas.width + x) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      animationId = requestAnimationFrame(animate);
    };

    let animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = Math.floor(window.innerWidth / scale);
      canvas.height = Math.floor(window.innerHeight / scale);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-50">
        Press &apos;q&apos; or ESC to exit
      </div>
    </div>
  );
}
