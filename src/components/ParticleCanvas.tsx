"use client";

import { useEffect, useRef } from "react";

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // Particle grid
    const COLS = Math.floor(width / 28);
    const ROWS = Math.floor(height / 28);
    const SPACING_X = width / COLS;
    const SPACING_Y = height / ROWS;

    type Particle = {
      x: number; y: number;
      ox: number; oy: number;
      vx: number; vy: number;
      size: number;
      opacity: number;
      targetOpacity: number;
      hue: number;
    };

    const particles: Particle[] = [];

    for (let row = 0; row <= ROWS; row++) {
      for (let col = 0; col <= COLS; col++) {
        const ox = col * SPACING_X;
        const oy = row * SPACING_Y;
        particles.push({
          x: ox, y: oy, ox, oy,
          vx: 0, vy: 0,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.3 + 0.05,
          targetOpacity: Math.random() * 0.3 + 0.05,
          hue: 220 + Math.random() * 40,
        });
      }
    }

    // Wave effect
    let waveTime = 0;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      waveTime += 0.015;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particles) {
        // Wave displacement
        const waveY = Math.sin(p.ox * 0.015 + waveTime) * 6;
        const waveX = Math.cos(p.oy * 0.015 + waveTime * 0.7) * 3;

        // Mouse repulsion
        const dx = p.ox - mx;
        const dy = p.oy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 100;
        let pushX = 0, pushY = 0;

        if (dist < radius) {
          const force = (radius - dist) / radius;
          pushX = (dx / dist) * force * 30;
          pushY = (dy / dist) * force * 30;

          p.targetOpacity = Math.min(0.8, p.opacity + force * 0.5);
        } else {
          p.targetOpacity = Math.random() * 0.3 + 0.05;
        }

        // Spring back
        p.vx = (p.ox + waveX + pushX - p.x) * 0.12;
        p.vy = (p.oy + waveY + pushY - p.y) * 0.12;
        p.x += p.vx;
        p.y += p.vy;
        p.opacity += (p.targetOpacity - p.opacity) * 0.05;

        // Draw
        const isDim = dist > radius;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, ${isDim ? 65 : 90}%, ${p.opacity})`;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < SPACING_X * 1.6) {
            const alpha = (1 - dist / (SPACING_X * 1.6)) * 0.08;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(100, 130, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleLeave = () => { mouseRef.current = { x: -1000, y: -1000 }; };

    const handleResize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };

    canvas.addEventListener("mousemove", handleMouse);
    canvas.addEventListener("mouseleave", handleLeave);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousemove", handleMouse);
      canvas.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
