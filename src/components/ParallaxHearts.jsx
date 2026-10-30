import { useEffect, useRef } from "react";

const hearts = [
  { x: 8, y: 12, size: 28, speed: 0.02, color: "#d4af37" },
  { x: 85, y: 8, size: 22, speed: 0.035, color: "#a50059" },
  { x: 20, y: 45, size: 18, speed: 0.015, color: "#d4af37" },
  { x: 72, y: 30, size: 32, speed: 0.025, color: "#a50059" },
  { x: 45, y: 65, size: 20, speed: 0.04, color: "#d4af37" },
  { x: 90, y: 55, size: 24, speed: 0.018, color: "#a50059" },
  { x: 15, y: 78, size: 26, speed: 0.03, color: "#d4af37" },
  { x: 60, y: 85, size: 16, speed: 0.022, color: "#a50059" },
  { x: 35, y: 20, size: 14, speed: 0.045, color: "#d4af37" },
  { x: 78, y: 72, size: 20, speed: 0.028, color: "#a50059" },
  { x: 50, y: 40, size: 12, speed: 0.05, color: "#d4af37" },
  { x: 5, y: 55, size: 30, speed: 0.012, color: "#a50059" },
];

export default function ParallaxHearts() {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollY = window.scrollY;
      const els = containerRef.current.querySelectorAll("[data-heart]");
      els.forEach((el, i) => {
        const heart = hearts[i];
        if (heart) {
          const offset = scrollY * heart.speed;
          el.style.transform = `translateY(${-offset}px) rotate(${offset * 0.5}deg)`;
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {hearts.map((h, i) => (
        <svg
          key={i}
          data-heart
          viewBox="0 0 24 24"
          fill={h.color}
          style={{
            position: "absolute",
            left: `${h.x}%`,
            top: `${h.y}%`,
            width: h.size,
            height: h.size,
            opacity: 0.1,
            willChange: "transform",
          }}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ))}
    </div>
  );
}