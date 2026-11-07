import { useEffect, useRef } from "react";

const DEFAULT_COLORS = ["#d4af37", "#f3dc9a", "#ffffff"];

/**
 * Polvo de azúcar y oro: partículas que flotan y suben despacio.
 * Se pausa fuera de pantalla y con "reducir movimiento" queda estático.
 */
export default function GoldDust({ count = 46, colors = DEFAULT_COLORS, className = "", speed = 1 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, visible = true;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const n = window.innerWidth < 640 ? Math.round(count * 0.6) : count;
    const parts = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 2.2,
      vy: (0.08 + Math.random() * 0.35) * speed,
      sway: Math.random() * Math.PI * 2,
      tw: Math.random() * Math.PI * 2,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        if (!reduced) {
          p.y -= p.vy;
          p.x += Math.sin(t / 1600 + p.sway) * 0.25;
          if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; }
        }
        const alpha = 0.35 + 0.45 * Math.abs(Math.sin(t / 900 + p.tw));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (p.r > 2) {
          // destello en cruz en las partículas grandes
          ctx.globalAlpha = alpha * 0.5;
          ctx.fillRect(p.x - p.r * 2.2, p.y - 0.4, p.r * 4.4, 0.8);
          ctx.fillRect(p.x - 0.4, p.y - p.r * 2.2, 0.8, p.r * 4.4);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t) => {
      draw(t);
      if (!reduced && visible) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [count, speed, colors]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 w-full h-full ${className}`} />;
}
