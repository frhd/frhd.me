"use client";

import { useEffect, useRef } from "react";

interface FireworksProps {
  onComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

interface Firework {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  color: string;
  exploded: boolean;
}

export default function XTermFireworks({ onComplete }: FireworksProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Focus the container on mount to capture keyboard events
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      "#ff0000", "#ff6600", "#ffff00", "#00ff00",
      "#00ffff", "#0066ff", "#ff00ff", "#ff66ff",
      "#ffffff", "#ffcc00",
    ];

    const particles: Particle[] = [];
    const fireworks: Firework[] = [];
    const gravity = 0.05;

    const createFirework = () => {
      fireworks.push({
        x: Math.random() * canvas.width,
        y: canvas.height,
        vy: -(8 + Math.random() * 4),
        targetY: canvas.height * (0.2 + Math.random() * 0.3),
        color: colors[Math.floor(Math.random() * colors.length)],
        exploded: false,
      });
    };

    const explode = (firework: Firework) => {
      const particleCount = 80 + Math.floor(Math.random() * 40);
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 2 + Math.random() * 4;
        particles.push({
          x: firework.x,
          y: firework.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: firework.color,
          life: 1,
          maxLife: 60 + Math.random() * 40,
          size: 2 + Math.random() * 2,
        });
      }

      // Add some sparkle particles
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;
        particles.push({
          x: firework.x,
          y: firework.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: "#ffffff",
          life: 1,
          maxLife: 30 + Math.random() * 20,
          size: 1,
        });
      }
    };

    let lastFirework = 0;
    let animationId: number;

    const animate = (time: number) => {
      // Semi-transparent black for trail effect
      ctx.fillStyle = "rgba(10, 10, 10, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Launch new fireworks periodically
      if (time - lastFirework > 500 + Math.random() * 1000) {
        createFirework();
        if (Math.random() > 0.5) createFirework(); // Sometimes launch two
        lastFirework = time;
      }

      // Update and draw fireworks
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];

        if (!fw.exploded) {
          fw.y += fw.vy;
          fw.vy += gravity * 0.5;

          // Draw rocket trail
          ctx.beginPath();
          ctx.fillStyle = fw.color;
          ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
          ctx.fill();

          // Trail sparkles
          ctx.fillStyle = "#ffcc00";
          for (let j = 0; j < 3; j++) {
            ctx.beginPath();
            ctx.arc(
              fw.x + (Math.random() - 0.5) * 4,
              fw.y + j * 5 + Math.random() * 5,
              1,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }

          if (fw.y <= fw.targetY) {
            fw.exploded = true;
            explode(fw);
          }
        } else {
          fireworks.splice(i, 1);
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vy += gravity;
        p.vx *= 0.99;
        p.life -= 1 / p.maxLife;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Draw particle with glow
        const alpha = p.life;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.globalAlpha = alpha * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [onComplete]);

  return (
    <div ref={containerRef} tabIndex={-1} style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "#0a0a0a", outline: "none" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", bottom: "1rem", left: "50%", transform: "translateX(-50%)", color: "white", fontSize: "0.875rem", opacity: 0.5 }}>
        Press &apos;q&apos; or ESC to exit
      </div>
    </div>
  );
}
