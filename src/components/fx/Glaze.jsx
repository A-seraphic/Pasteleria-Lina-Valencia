import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const FLOW = [0.5, 0, 0.18, 1]; // arranca lento y se asienta, como glaseado espeso
const SPRINKLE_COLORS = ["#ffffff", "#d4af37", "#a50059", "#fff3b0", "#ff9ec7"];

function rng(seed) {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

// Distribución de gotas: anchos y largos variados, algunas sueltan gotitas
function makeDrips(width, maxLen, seed, density) {
  const rand = rng(seed);
  const count = Math.max(4, Math.round(width / density));
  const step = width / count;
  return Array.from({ length: count }, (_, i) => {
    const w = 20 + rand() * 22;
    const c = step * i + step / 2 + (rand() - 0.5) * step * 0.45;
    const long = rand() > 0.5;
    const len = maxLen * (long ? 0.62 + rand() * 0.38 : 0.2 + rand() * 0.3);
    return { i, c, w, len, falls: long && rand() > 0.45, delay: rand() * 0.55 };
  });
}

// Forma de una gota: baja ancha desde el glaseado, se afina y termina en un bulbo redondo
function dripGeometry(w, len) {
  const r = w * 0.42;
  const neck = w * 0.3;
  const yNeck = len - r * 0.9;
  const bottom = yNeck + Math.sqrt(r * r - neck * neck) + r;
  const d =
    `M0 0 C0 ${len * 0.3} ${w / 2 - neck} ${yNeck - len * 0.3} ${w / 2 - neck} ${yNeck} ` +
    `A${r} ${r} 0 1 0 ${w / 2 + neck} ${yNeck} ` +
    `C${w / 2 + neck} ${yNeck - len * 0.3} ${w} ${len * 0.3} ${w} 0 Z`;
  return { d, r, neck, yNeck, bottom };
}

// Borde ondulado entre x0 y x1 a la altura y (onda suave de amplitud a)
function wave(x0, x1, y, a, step = 64) {
  let p = "";
  for (let x = x0; x < x1; x += step) {
    const nx = Math.min(x + step, x1);
    p += ` Q${x + step / 2} ${y + a} ${nx} ${y}`;
    a = -a;
  }
  return p;
}

// Capa superior: borde de arriba ondulado (capa aparte) o recto (continúa el bloque), borde de abajo ondulado
function bandShape(width, band, lit) {
  let d = lit ? `M0 4${wave(0, width, 4, 3, 80)}` : `M0 -2 H${width}`;
  d += ` L${width} ${band}`;
  let a = -5;
  for (let x = width; x > 0; x -= 64) {
    const nx = Math.max(x - 64, 0);
    d += ` Q${x - 32} ${band + a} ${nx} ${band}`;
    a = -a;
  }
  return `${d} Z`;
}

/**
 * Glaseado de fresa brillante que gotea, con volumen real:
 * - luz difusa + especular (filtro SVG) para que cada gota se vea como un cilindro húmedo
 * - reflejo lateral y punto de luz en el bulbo, chispas de azúcar sobre la capa
 * - cada gota fluye desde debajo del glaseado (solo transform: fluido en celulares)
 * - algunas gotas sueltan una gotita que cae y se desvanece
 *
 * lit: la capa superior se ve como glaseado aparte (con borde brillante);
 *      sin lit, la capa continúa el color del bloque de arriba sin costura.
 */
export default function Glaze({
  color = "#f48fb1",
  shade = "#e0619a",
  height = 150,
  band = 24,
  lit = true,
  sprinkles = false,
  falling = true,
  play = true,
  delay = 0,
  seed = 7,
  density = 54,
  shadowColor = "#8a0045",
  className = "",
  style,
}) {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, "");

  useLayoutEffect(() => {
    const el = ref.current;
    const update = () => setWidth(Math.round(el.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const overlap = 12; // las gotas nacen debajo del borde del glaseado
  const maxLen = Math.max(30, height - band - 34);
  const drips = useMemo(() => (width ? makeDrips(width, maxLen, seed, density) : []), [width, maxLen, seed, density]);
  const dots = useMemo(() => {
    if (!sprinkles || !width) return [];
    const rand = rng(seed + 99);
    return Array.from({ length: Math.round(width / 16) }, () => ({
      x: rand() * width,
      y: 6 + rand() * (band - 10),
      rot: rand() * 180,
      c: SPRINKLE_COLORS[Math.floor(rand() * SPRINKLE_COLORS.length)],
    }));
  }, [sprinkles, width, band, seed]);

  const fid = `glz-f-${uid}`;
  const gid = `glz-g-${uid}`;
  const bid = `glz-b-${uid}`;
  const go = play || reduced;
  const animate = !reduced;

  const bandPath = width ? bandShape(width, band, lit) : "";

  return (
    <div ref={ref} aria-hidden className={`pointer-events-none ${className}`} style={{ height, ...style }}>
      {width > 0 && (
        <>
          <svg width="0" height="0" style={{ position: "absolute" }}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: color }} />
                <stop offset="60%" style={{ stopColor: color }} />
                <stop offset="100%" style={{ stopColor: shade }} />
              </linearGradient>
              <linearGradient id={bid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: color }} />
                <stop offset="100%" style={{ stopColor: lit ? shade : color }} />
              </linearGradient>
              {/* Volumen: el contorno desenfocado funciona como mapa de alturas */}
              <filter id={fid} x="-30%" y="-15%" width="160%" height="140%" colorInterpolationFilters="sRGB">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="h" />
                <feDiffuseLighting in="h" surfaceScale="3.6" diffuseConstant="1" lightingColor="#ffffff" result="d">
                  <feDistantLight azimuth="225" elevation="58" />
                </feDiffuseLighting>
                {/* color × (0.65·luz + 0.45): el interior plano conserva su color (0.65·sin 58° + 0.45 ≈ 1)
                    y el lado en sombra nunca baja del 45 %, sin contornos oscuros */}
                <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="0.65" k2="0.45" result="shaded" />
                <feSpecularLighting in="h" surfaceScale="3.6" specularConstant="1.1" specularExponent="34" lightingColor="#ffffff" result="s">
                  <feDistantLight azimuth="225" elevation="58" />
                </feSpecularLighting>
                <feComposite in="s" in2="SourceAlpha" operator="in" result="sIn" />
                <feComposite in="shaded" in2="sIn" operator="arithmetic" k2="1" k3="0.85" result="lit" />
                <feComposite in="lit" in2="SourceAlpha" operator="in" result="clip" />
                <feDropShadow in="clip" dx="0" dy="4" stdDeviation="3.4" floodColor={shadowColor} floodOpacity="0.22" />
              </filter>
            </defs>
          </svg>

          {/* Gotas: cada una fluye desde debajo del glaseado */}
          {drips.map((drip) => {
            const g = dripGeometry(drip.w, drip.len);
            const pad = 9;
            const boxW = drip.w + pad * 2;
            const boxH = g.bottom + pad + 4;
            const dur = 1.1 + drip.len / 110;
            return (
              <div key={drip.i} className="absolute overflow-hidden"
                style={{ left: drip.c - drip.w / 2 - pad, top: band - overlap, width: boxW, height: boxH }}>
                <motion.div
                  style={{ willChange: "transform" }}
                  initial={animate ? { y: "-102%" } : false}
                  animate={{ y: go ? "0%" : "-102%" }}
                  transition={{ duration: dur, ease: FLOW, delay: delay + drip.delay }}
                >
                  <svg width={boxW} height={boxH} className="block">
                    <g transform={`translate(${pad} 0)`}>
                      <path d={g.d} fill={`url(#${gid})`} filter={`url(#${fid})`} />
                      {/* reflejo largo del lado iluminado */}
                      <path d={`M${drip.w * 0.27} ${overlap + 4} C${drip.w * 0.24} ${g.yNeck * 0.5} ${drip.w / 2 - g.neck * 0.62} ${g.yNeck * 0.7} ${drip.w / 2 - g.neck * 0.55} ${g.yNeck}`}
                        fill="none" stroke="#ffffff" strokeOpacity="0.38" strokeWidth={Math.max(2, drip.w * 0.1)} strokeLinecap="round" />
                      {/* punto de luz en el bulbo */}
                      <ellipse cx={drip.w / 2 - g.r * 0.36} cy={g.yNeck + g.r * 0.32} rx={g.r * 0.2} ry={g.r * 0.3} fill="#ffffff" fillOpacity="0.85"
                        transform={`rotate(20 ${drip.w / 2 - g.r * 0.36} ${g.yNeck + g.r * 0.32})`} />
                    </g>
                  </svg>
                </motion.div>
              </div>
            );
          })}

          {/* Capa de glaseado encima de las gotas (tapa su nacimiento) */}
          <svg width={width} height={band + 10} className="absolute left-0 top-0 block overflow-visible">
            <path d={bandPath} fill={`url(#${bid})`} filter={lit ? `url(#${fid})` : undefined} />
            {lit && (
              <path d={`M0 7${wave(0, width, 7, 3, 80)}`} fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="2.2" strokeLinecap="round" />
            )}
            {dots.map((s, k) => (
              <rect key={k} x={s.x} y={s.y} width="7" height="2.6" rx="1.3" fill={s.c}
                transform={`rotate(${s.rot} ${s.x + 3.5} ${s.y + 1.3})`} />
            ))}
          </svg>

          {/* Gotitas que se desprenden */}
          {falling && animate && go && drips.filter((d) => d.falls).map((d, k) => {
            const g = dripGeometry(d.w, d.len);
            const size = d.w * 0.36;
            return (
              <span key={`drop-${d.i}`} className="glaze-drop absolute rounded-full"
                style={{
                  left: d.c - size / 2,
                  top: band - overlap + g.bottom - size * 0.75,
                  width: size,
                  height: size,
                  background: `radial-gradient(circle at 34% 30%, #ffffff 0 14%, transparent 15%), radial-gradient(circle at 50% 45%, ${color}, ${shade})`,
                  animationDelay: `${delay + 2.4 + k * 1.7}s`,
                  animationDuration: `${4.6 + k * 0.9}s`,
                }} />
            );
          })}
        </>
      )}
    </div>
  );
}
