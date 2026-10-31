import { useEffect, useRef } from "react";

/**
 * Momentum / smooth scroll using RAF + lerp (solo con rueda de mouse).
 * En pantallas táctiles se deja el scroll nativo, que ya tiene inercia y es más fluido.
 * Drives the page via window.scrollTo so existing scroll listeners keep working.
 * Elements marked with [data-scroll-lock] (modales, panel 3D) keep their own scroll.
 */
export default function useSmoothScroll({ ease = 0.08, enabled = true } = {}) {
  const target = useRef(0);
  const current = useRef(0);
  const rafId = useRef(null);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
    const clamp = (v) => Math.max(0, Math.min(v, maxScroll()));

    if (!enabled || isTouch || reduced) {
      window.smoothScrollTo = (y) =>
        window.scrollTo({ top: typeof y === "number" ? y : y.top ?? 0, behavior: reduced ? "auto" : "smooth" });
      return () => { delete window.smoothScrollTo; };
    }

    current.current = window.scrollY;
    target.current = window.scrollY;

    const loop = () => {
      current.current += (target.current - current.current) * ease;
      if (Math.abs(target.current - current.current) < 0.1) {
        current.current = target.current;
        window.scrollTo(0, current.current);
        rafId.current = null; // se detiene hasta el siguiente gesto
        return;
      }
      window.scrollTo(0, current.current);
      rafId.current = requestAnimationFrame(loop);
    };
    const kick = () => { if (!rafId.current) rafId.current = requestAnimationFrame(loop); };

    const onWheel = (e) => {
      if (e.ctrlKey || e.target.closest?.("[data-scroll-lock]")) return;
      if (document.body.dataset.scrollLocked) return;
      e.preventDefault();
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 40;
      if (e.deltaMode === 2) delta *= 800;
      if (!rafId.current) current.current = window.scrollY; // sincroniza tras scroll con teclado o barra
      target.current = clamp((rafId.current ? target.current : window.scrollY) + delta);
      kick();
    };

    window.smoothScrollTo = (y) => {
      current.current = window.scrollY;
      target.current = clamp(typeof y === "number" ? y : y.top ?? target.current);
      kick();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
      delete window.smoothScrollTo;
    };
  }, [ease, enabled]);
}
