import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

// Gotas con largos y anchos variados (determinista: no cambia en cada render)
function makeDrips(width, maxLen, seed) {
  let s = seed;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const count = Math.max(5, Math.round(width / 62));
  const step = width / count;
  return Array.from({ length: count }, (_, i) => {
    const c = step * i + step / 2 + (rand() - 0.5) * step * 0.35;
    const w = 20 + rand() * 22;
    const long = i % 3 === 0;
    const len = Math.min(maxLen, (long ? 0.55 : 0.22) * maxLen + rand() * maxLen * (long ? 0.4 : 0.3));
    return { c, w, len, falls: i % 4 === 1 && long };
  });
}

// Gota con cuello y bulbo redondo en la punta, como glaseado real
function dripPath({ c, w, len }, base) {
  const r = w * 0.42;
  const neck = w * 0.3;
  const yNeck = base + len - r * 0.9;
  return (
    `M${c - w / 2} -12 ` +
    `C${c - w / 2} ${base + len * 0.3} ${c - neck} ${yNeck - len * 0.25} ${c - neck} ${yNeck} ` +
    `A${r} ${r} 0 1 0 ${c + neck} ${yNeck} ` +
    `C${c + neck} ${yNeck - len * 0.25} ${c + w / 2} ${base + len * 0.3} ${c + w / 2} -12 Z`
  );
}

/**
 * Glaseado brillante que gotea, en 3D: degradado de volumen, brillo especular
 * (luz desde arriba a la izquierda), sombra suave y gotas que caen con rebote.
 * Algunas gotas sueltan una gotita que cae y se desvanece.
 * Se coloca justo debajo de un bloque del mismo color (color = color de ese bloque).
 */
export default function Drips({ color, shade, height = 130, seed = 7, play = true, delay = 0, falling = true, className = "", style }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const uid = useId().replace(/:/g, "");

  useLayoutEffect(() => {
    const el = ref.current;
    const update = () => setWidth(Math.round(el.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const base = 16;
  const maxLen = height - base - 34; // deja espacio para las gotitas que caen
  const drips = useMemo(() => (width ? makeDrips(width, maxLen, seed) : []), [width, maxLen, seed]);
  const dark = shade || color;

  return (
    <div ref={ref} aria-hidden className={`pointer-events-none ${className}`} style={{ height, ...style }}>
      {width > 0 && (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
          <defs>
            {/* Volumen: más claro arriba, más denso en las puntas */}
            <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: color }} />
              <stop offset="55%" style={{ stopColor: color }} />
              <stop offset="100%" style={{ stopColor: dark }} />
            </linearGradient>
            {/* Brillo especular + sombra: da el aspecto húmedo y en relieve */}
            <filter id={`f-${uid}`} x="-10%" y="-20%" width="120%" height="160%" colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="blur" />
              <feSpecularLighting in="blur" surfaceScale="4.5" specularConstant="1.05" specularExponent="36" lightingColor="#ffffff" result="spec">
                <fePointLight x={width * 0.25} y="-240" z="95" />
              </feSpecularLighting>
              <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
              <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.75" k4="0" result="lit" />
              <feDropShadow in="lit" dx="0" dy="5" stdDeviation="4.5" floodColor="#a50059" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* Gotas con brillo: empiezan por encima del borde para que la unión no muestre costuras */}
          <g filter={`url(#f-${uid})`} style={{ fill: `url(#g-${uid})` }}>
            {drips.map((d, i) => (
              <motion.path
                key={i}
                d={dripPath(d, base)}
                style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}
                initial={{ scaleY: 0 }}
                animate={play ? { scaleY: [0, 1.08, 0.97, 1] } : { scaleY: 0 }}
                transition={{ duration: 1.5 + (i % 4) * 0.3, times: [0, 0.6, 0.82, 1], ease: [0.33, 0, 0.2, 1], delay: delay + (i % 6) * 0.09 }}
              />
            ))}
          </g>
          {/* Banda superior plana, del mismo color del bloque de arriba, con borde ondulado */}
          <path style={{ fill: color }}
            d={`M0 -2 H${width} V${base} ` + Array.from({ length: Math.ceil(width / 60) + 1 }, (_, i) => `Q${width - i * 60 - 30} ${base + 7} ${width - (i + 1) * 60} ${base}`).join(" ") + " V-2 Z"} />

          {/* Reflejos en los bulbos: punto de luz que vende el volumen */}
          {drips.map((d, i) => (
            <motion.ellipse key={`h-${i}`} cx={d.c - d.w * 0.12} cy={base + d.len - d.w * 0.5} rx={d.w * 0.09} ry={d.w * 0.14}
              fill="#ffffff" initial={{ opacity: 0 }} animate={{ opacity: play ? 0.75 : 0 }}
              transition={{ delay: delay + 1.2 + (i % 6) * 0.09, duration: 0.6 }} />
          ))}

          {/* Gotitas que se desprenden y caen */}
          {falling && play && drips.filter((d) => d.falls).map((d, i) => (
            <motion.circle key={`f-${i}`} cx={d.c} cy={base + d.len} r={d.w * 0.2} style={{ fill: dark }}
              initial={{ opacity: 0, y: 0, scaleY: 1 }}
              animate={{ opacity: [0, 1, 1, 0], y: [0, 2, 26, 30], scaleY: [1, 1.25, 1.1, 0.9] }}
              transition={{ duration: 1.6, ease: "easeIn", delay: delay + 2.2 + i * 1.3, repeat: Infinity, repeatDelay: 4 + i * 1.7 }} />
          ))}
        </svg>
      )}
    </div>
  );
}
