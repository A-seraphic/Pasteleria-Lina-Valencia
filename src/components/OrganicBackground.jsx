/**
 * OrganicBackground — clean, smooth color transitions only.
 * No golden strokes, no vectors, no SVGs. Just a soft scroll-tinted gradient.
 */
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function OrganicBackground() {
  const wrapRef = useRef(null);
  const gradRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.6,
        onUpdate: (self) => {
          const p = self.progress;
          if (!gradRef.current) return;
          // Smooth transition: crema → soft rosa polvado
          const r = Math.round(253 - p * 9);
          const g = Math.round(250 - p * 20);
          const b = Math.round(245 - p * 12);
          gradRef.current.style.background =
            `radial-gradient(ellipse 100% 55% at 50% ${18 + p * 28}%, rgba(${r},${g},${b},1) 0%, rgba(245,${218 + Math.round(p * 10)},228,0.55) 55%, transparent 100%)`;
        },
      });
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      <div
        ref={gradRef}
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 100% 55% at 50% 18%, #fdfaf5 0%, rgba(245,218,228,0.55) 55%, transparent 100%)",
        }}
      />
    </div>
  );
}