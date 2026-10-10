"use client";
import { useEffect, useRef } from "react";

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    // Soft cloud-like blobs (like the reference hero bg)
    const blobs = [
      { x: 0.15, y: 0.25, r: 0.35, color: "#bae6fd", opacity: 0.45 },
      { x: 0.85, y: 0.15, r: 0.3, color: "#e0f2fe", opacity: 0.35 },
      { x: 0.7, y: 0.75, r: 0.28, color: "#cffafe", opacity: 0.3 },
      { x: 0.3, y: 0.8, r: 0.22, color: "#f0fdf4", opacity: 0.25 },
    ];

    // Particle field
    const particles: { x: number; y: number; ox: number; oy: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    const COLS = Math.floor(W / 40);
    const ROWS = Math.floor(H / 40);
    for (let r = 0; r <= ROWS; r++) {
      for (let c = 0; c <= COLS; c++) {
        particles.push({
          x: (c / COLS) * W, y: (r / ROWS) * H,
          ox: (c / COLS) * W, oy: (r / ROWS) * H,
          vx: 0, vy: 0,
          size: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.18 + 0.04,
        });
      }
    }

    let t = 0;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#060a12");
      grad.addColorStop(1, "#0d1a2e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Soft glowing blobs
      for (const b of blobs) {
        const grd = ctx.createRadialGradient(b.x * W, b.y * H, 0, b.x * W, b.y * H, b.r * Math.min(W, H));
        grd.addColorStop(0, b.color + Math.round(b.opacity * 255).toString(16).padStart(2, "0"));
        grd.addColorStop(1, b.color + "00");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(b.x * W, b.y * H, b.r * Math.min(W, H), 0, Math.PI * 2);
        ctx.fill();
      }

      t += 0.012;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particles) {
        const wave = Math.sin(p.ox * 0.012 + t) * 8 + Math.cos(p.oy * 0.01 + t * 0.7) * 5;
        const dx = p.ox - mx;
        const dy = p.oy - my;
        const dist = Math.hypot(dx, dy);
        let pushX = 0, pushY = 0;
        if (dist < 90) {
          const f = (90 - dist) / 90;
          pushX = (dx / dist) * f * 28;
          pushY = (dy / dist) * f * 28;
        }
        p.vx = (p.ox + pushX - p.x) * 0.1;
        p.vy = (p.oy + wave + pushY - p.y) * 0.1;
        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186,230,253,${p.alpha})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouseRef.current = { x: -999, y: -999 }; };
    const onResize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W; canvas.height = H;
    };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
}
