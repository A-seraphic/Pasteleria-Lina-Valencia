import { useEffect, useRef } from "react";

/**
 * Momentum / smooth scroll using RAF + lerp.
 * Intercepts wheel & touch events, applies inertia and drives the page
 * via window.scrollTo so all existing scroll listeners (parallax,
 * backgrounds, reveal animations) continue working unchanged.
 */
export default function useSmoothScroll({ ease = 0.08, enabled = true } = {}) {
  const target = useRef(0);
  const current = useRef(0);
  const rafId = useRef(null);
  const touchStartY = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    // Sync on mount in case the page already has a scroll position
    current.current = window.scrollY;
    target.current = window.scrollY;

    const maxScroll = () =>
      document.documentElement.scrollHeight - window.innerHeight;

    const clamp = (v) => Math.max(0, Math.min(v, maxScroll()));

    // ── wheel ──────────────────────────────────────────────────────────────
    const onWheel = (e) => {
      e.preventDefault();
      // Normalize delta across browsers / trackpads
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 40;   // Firefox line mode
      if (e.deltaMode === 2) delta *= 800;  // page mode
      target.current = clamp(target.current + delta);
    };

    // ── touch ──────────────────────────────────────────────────────────────
    const onTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      const dy = touchStartY.current - e.touches[0].clientY;
      touchStartY.current = e.touches[0].clientY;
      target.current = clamp(target.current + dy * 1.4);
    };

    // ── RAF loop ───────────────────────────────────────────────────────────
    const loop = () => {
      // Lerp: current approaches target smoothly
      current.current += (target.current - current.current) * ease;

      // Stop jitter when close enough
      if (Math.abs(target.current - current.current) < 0.1) {
        current.current = target.current;
      }

      window.scrollTo(0, current.current);
      rafId.current = requestAnimationFrame(loop);
    };

    // ── programmatic scroll (anchor links, navbar) ─────────────────────────
    // Override scrollTo / scrollIntoView so they feed target instead of jumping
    const origScrollTo = window.scrollTo.bind(window);
    window.smoothScrollTo = (y) => {
      target.current = clamp(typeof y === "number" ? y : y.top ?? target.current);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    rafId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      cancelAnimationFrame(rafId.current);
      delete window.smoothScrollTo;
    };
  }, [ease, enabled]);
}