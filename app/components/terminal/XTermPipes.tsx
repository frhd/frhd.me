"use client";

import { useEffect, useRef } from "react";

interface PipesProps {
  onComplete: () => void;
}

interface Pipe {
  x: number;
  y: number;
  direction: number; // 0: up, 1: right, 2: down, 3: left
  color: string;
}

export default function XTermPipes({ onComplete }: PipesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      "#00ff00", // green
      "#ff00ff", // magenta
      "#00ffff", // cyan
      "#ffff00", // yellow
      "#ff6600", // orange
      "#ff0066", // pink
    ];

    const gridSize = 20;
    const pipes: Pipe[] = [];
    const maxPipes = 8;

    // Pipe characters for ASCII look
    const pipeWidth = 4;

    // Create initial pipes
    for (let i = 0; i < maxPipes; i++) {
      pipes.push({
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize,
        direction: Math.floor(Math.random() * 4),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Draw background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawPipeSegment = (pipe: Pipe, prevDir: number) => {
      ctx.strokeStyle = pipe.color;
      ctx.lineWidth = pipeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const half = gridSize / 2;

      ctx.beginPath();

      // Draw from center based on previous direction
      let startX = pipe.x + half;
      let startY = pipe.y + half;
      let endX = startX;
      let endY = startY;

      // Move start point based on where we came from
      switch (prevDir) {
        case 0: startY = pipe.y + gridSize; break; // came from below
        case 1: startX = pipe.x; break; // came from left
        case 2: startY = pipe.y; break; // came from above
        case 3: startX = pipe.x + gridSize; break; // came from right
      }

      // Move end point based on where we're going
      switch (pipe.direction) {
        case 0: endY = pipe.y; break; // going up
        case 1: endX = pipe.x + gridSize; break; // going right
        case 2: endY = pipe.y + gridSize; break; // going down
        case 3: endX = pipe.x; break; // going left
      }

      ctx.moveTo(startX, startY);
      ctx.lineTo(pipe.x + half, pipe.y + half);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    };

    const updatePipe = (pipe: Pipe) => {
      const prevDir = pipe.direction;

      // Move pipe
      switch (pipe.direction) {
        case 0: pipe.y -= gridSize; break; // up
        case 1: pipe.x += gridSize; break; // right
        case 2: pipe.y += gridSize; break; // down
        case 3: pipe.x -= gridSize; break; // left
      }

      // Wrap around screen
      if (pipe.x < 0) pipe.x = canvas.width - gridSize;
      if (pipe.x >= canvas.width) pipe.x = 0;
      if (pipe.y < 0) pipe.y = canvas.height - gridSize;
      if (pipe.y >= canvas.height) pipe.y = 0;

      // Random direction change (but not reverse)
      if (Math.random() > 0.85) {
        const change = Math.random() > 0.5 ? 1 : -1;
        pipe.direction = (pipe.direction + change + 4) % 4;
      }

      drawPipeSegment(pipe, prevDir);
    };

    let animationId: number;
    let frameCount = 0;

    const animate = () => {
      frameCount++;

      // Update pipes every few frames for smoother look
      if (frameCount % 3 === 0) {
        pipes.forEach(updatePipe);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-green-500 text-sm opacity-50">
        Press &apos;q&apos; or ESC to exit
      </div>
    </div>
  );
}
