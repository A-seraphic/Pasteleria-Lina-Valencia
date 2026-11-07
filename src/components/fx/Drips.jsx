import { useMemo } from "react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

// Gotas de glaseado con largos y anchos variados (determinista para que no cambie en cada render)
function makeDrips(count, seed) {
  let s = seed;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const drips = [];
  const step = 1200 / count;
  for (let i = 0; i < count; i++) {
    const c = step * i + step / 2 + (rand() - 0.5) * step * 0.4;
    const w = 26 + rand() * 30;
    const len = 18 + rand() * (i % 3 === 0 ? 90 : 45);
    drips.push({ c, w, len });
  }
  return drips;
}

const dripPath = ({ c, w, len }, base) =>
  `M${c - w / 2} ${base - 1} C${c - w / 2} ${base + len * 0.55} ${c - w * 0.42} ${base + len} ${c} ${base + len} ` +
  `C${c + w * 0.42} ${base + len} ${c + w / 2} ${base + len * 0.55} ${c + w / 2} ${base - 1} Z`;

/**
 * Borde de glaseado que gotea. Se coloca debajo de un bloque del mismo color.
 * animate: las gotas "caen" una a una (escala vertical desde arriba) cuando play es true.
 */
export default function Drips({ color, count = 14, seed = 7, height = 120, animate = true, play = true, delay = 0, className = "", style }) {
  const drips = useMemo(() => makeDrips(count, seed), [count, seed]);
  const base = 18;
  return (
    <svg viewBox={`0 0 1200 ${height}`} preserveAspectRatio="none" aria-hidden className={`block w-full ${className}`} style={{ height, ...style }}>
      <rect x="0" y="0" width="1200" height={base} style={{ fill: color }} />
      {/* Ondulación del borde */}
      <path d={`M0 ${base} Q 75 ${base + 10} 150 ${base} T 300 ${base} T 450 ${base} T 600 ${base} T 750 ${base} T 900 ${base} T 1050 ${base} T 1200 ${base} V 0 H 0 Z`} style={{ fill: color }} />
      {drips.map((d, i) => (
        <motion.path
          key={i}
          d={dripPath(d, base)}
          style={{ fill: color, transformBox: "fill-box", transformOrigin: "50% 0%" }}
          initial={animate ? { scaleY: 0 } : false}
          animate={{ scaleY: play ? 1 : 0 }}
          transition={{ duration: 1.1 + (i % 4) * 0.25, ease: EASE, delay: delay + (i % 5) * 0.07 }}
        />
      ))}
    </svg>
  );
}
