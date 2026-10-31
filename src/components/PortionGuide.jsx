import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Camera, Ruler, Weight, Layers } from "lucide-react";
import CakeViewer from "./cake/CakeViewer";
import CakeARModal from "./cake/CakeARModal";
import SlideRevealWrapper from "./SlideRevealWrapper";
import { usePublicCatalog } from "@/data/catalogStore";
import { estimateWeightKg } from "@/lib/cakeSpecs";

const EASE = [0.22, 1, 0.36, 1];

const CUTS = [
  { key: "generoso", label: "Generoso", factor: 0.75, note: "Porciones grandes, ideales para golosos y postre principal." },
  { key: "estandar", label: "Estándar", factor: 1, note: "El corte que recomendamos: buena porción y la torta se mantiene firme." },
  { key: "fino", label: "Fino", factor: 1.3, note: "Rinde más para eventos grandes. Cortes delgados, con cuchillo caliente." },
];

// Número que cuenta suavemente al cambiar
function CountUp({ value }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / 450);
      const v = Math.round(a + (value - a) * (1 - Math.pow(1 - k, 3)));
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{shown}</>;
}

// Círculos concéntricos a escala para comparar diámetros
function SizeRings({ portions, activeId, onSelect }) {
  const max = Math.max(...portions.map((p) => p.diameter));
  const sorted = [...portions].sort((a, b) => b.diameter - a.diameter);
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" role="img" aria-label="Comparación de diámetros">
      <defs>
        <radialGradient id="ring-fill" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff3f8" />
          <stop offset="100%" stopColor="#f3c6d8" />
        </radialGradient>
      </defs>
      {sorted.map((p) => {
        const r = (p.diameter / max) * 92;
        const active = p.id === activeId;
        return (
          <g key={p.id} onClick={() => onSelect(p.id)} style={{ cursor: "pointer" }}>
            <motion.circle
              cx="100" cy="100" r={r}
              fill={active ? "url(#ring-fill)" : "rgba(253,250,245,0.35)"}
              stroke={active ? "#a50059" : "rgba(212,175,55,0.45)"}
              strokeWidth={active ? 1.6 : 0.8}
              strokeDasharray={active ? "0" : "3 3"}
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
            />
          </g>
        );
      })}
      <circle cx="100" cy="100" r="2.5" fill="#d4af37" />
    </svg>
  );
}

// Una persona por porción (hasta 60 visibles)
function PeopleGrid({ count }) {
  const shown = Math.min(count, 60);
  return (
    <div className="flex flex-wrap gap-[5px]" aria-label={`${count} porciones`}>
      <AnimatePresence initial={false}>
        {Array.from({ length: shown }, (_, i) => (
          <motion.span
            key={i}
            className="block"
            initial={{ opacity: 0, scale: 0.3, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.35, ease: EASE, delay: Math.min(i * 0.012, 0.4) }}
          >
            <svg width="14" height="18" viewBox="0 0 14 18" aria-hidden="true">
              <circle cx="7" cy="4.5" r="3.6" fill={i % 2 ? "#d4af37" : "#a50059"} opacity="0.85" />
              <path d="M1 18c0-4 2.7-7 6-7s6 3 6 7z" fill={i % 2 ? "#d4af37" : "#a50059"} opacity="0.55" />
            </svg>
          </motion.span>
        ))}
      </AnimatePresence>
      {count > shown && <span className="text-[11px] self-end font-semibold" style={{ color: "#a50059" }}>+{count - shown}</span>}
    </div>
  );
}

export default function PortionGuide() {
  const { portions } = usePublicCatalog();
  const stageRef = useRef(null);
  const nearView = useInView(stageRef, { margin: "300px 0px", once: true });

  const [activeId, setActiveId] = useState(null);
  const [cutKey, setCutKey] = useState("estandar");
  const [arOpen, setArOpen] = useState(false);

  const active = portions.find((p) => p.id === activeId) || portions[Math.min(3, portions.length - 1)];
  const cut = CUTS.find((c) => c.key === cutKey);
  const slices = active ? Math.max(1, Math.round(active.slices * cut.factor)) : 0;
  const weight = useMemo(() => (active ? estimateWeightKg(active) : 0), [active]);

  if (!active) return null;

  return (
    <section id="porciones" className="relative py-20 md:py-32 px-4 md:px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(60% 50% at 20% 30%, rgba(212,175,55,0.10), transparent 70%), radial-gradient(50% 40% at 85% 70%, rgba(165,0,89,0.07), transparent 70%)" }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <SlideRevealWrapper direction="up" className="text-center mb-8 md:mb-14">
          <span className="font-inter text-[11px] tracking-[0.4em] uppercase font-medium" style={{ color: "#d4af37" }}>
            Guía de porciones
          </span>
          <h2 className="font-playfair text-[34px] leading-[1.1] md:text-6xl font-semibold mt-3" style={{ color: "#a50059" }}>
            ¿Cuántas porciones <span className="italic font-normal" style={{ color: "#d4af37" }}>salen?</span>
          </h2>
          <p className="font-inter text-sm md:text-base font-light mt-4 max-w-xl mx-auto" style={{ color: "rgba(165,0,89,0.6)" }}>
            Elige un tamaño, mira la torta en 3D cortada en porciones y ábrela con tu cámara para verla en tamaño real sobre tu mesa.
          </p>
        </SlideRevealWrapper>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5 md:gap-8 items-start">
          {/* ── Escenario 3D ── */}
          <div className="min-w-0 lg:sticky lg:top-24">
            <div
              ref={stageRef}
              className="relative rounded-[28px] md:rounded-[36px] overflow-hidden aspect-square md:aspect-[5/4]"
              style={{
                background: "radial-gradient(90% 70% at 50% 35%, #fffafc 0%, #f8e8ef 55%, #f1d9e4 100%)",
                border: "1px solid rgba(212,175,55,0.22)",
                boxShadow: "0 30px 80px rgba(165,0,89,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              {nearView && <CakeViewer portion={active} slices={slices} />}

              {/* Datos flotantes */}
              <div className="absolute top-3 left-3 right-3 flex justify-between gap-2 pointer-events-none">
                <Chip icon={<Ruler size={12} />} text={`Ø ${active.diameter} cm`} />
                <Chip icon={<Layers size={12} />} text={active.tiers > 1 ? `${active.tiers} pisos` : `${active.height} cm alto`} />
              </div>

              <div className="absolute left-3 bottom-3 pointer-events-none">
                <div className="rounded-2xl px-4 py-2.5"
                  style={{ background: "rgba(253,250,245,0.82)", backdropFilter: "blur(14px)", border: "1px solid rgba(212,175,55,0.2)" }}>
                  <p className="font-playfair text-4xl md:text-5xl font-semibold leading-none" style={{ color: "#a50059" }}>
                    <CountUp value={slices} />
                  </p>
                  <p className="font-inter text-[10px] tracking-[0.2em] uppercase mt-1" style={{ color: "#d4af37" }}>porciones</p>
                </div>
              </div>

              <button
                onClick={() => setArOpen(true)}
                className="ar-cta absolute right-3 bottom-3 flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full font-inter text-[12px] font-semibold tracking-wide active:scale-95 transition-transform"
                style={{ background: "linear-gradient(135deg,#a50059,#7d0044)", color: "#fdfaf5", boxShadow: "0 12px 30px rgba(165,0,89,0.35)" }}
              >
                <Camera size={16} /> Ver en mi espacio
              </button>
            </div>
            <p className="font-inter text-[11px] text-center mt-3" style={{ color: "rgba(165,0,89,0.4)" }}>
              Gira la torta con el dedo · la porción separada es una porción {cut.label.toLowerCase()}
            </p>
          </div>

          {/* ── Controles ── */}
          <div className="min-w-0 flex flex-col gap-4 md:gap-5">
            {/* Tamaños */}
            <Panel title="1. Elige el tamaño">
              <div className="flex lg:grid lg:grid-cols-2 gap-2.5 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0 pb-1 no-scrollbar">
                {portions.map((p) => {
                  const on = p.id === active.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActiveId(p.id)}
                      className="snap-start shrink-0 w-[150px] lg:w-auto text-left rounded-2xl p-3.5 transition-all duration-300 active:scale-[0.97]"
                      style={{
                        background: on ? "linear-gradient(140deg,#a50059,#7d0044)" : "rgba(253,250,245,0.8)",
                        border: on ? "1px solid transparent" : "1px solid rgba(212,175,55,0.18)",
                        boxShadow: on ? "0 14px 34px rgba(165,0,89,0.25)" : "0 2px 10px rgba(165,0,89,0.04)",
                        color: on ? "#fdfaf5" : "#a50059",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-inter text-[12px] font-semibold tracking-wide">{p.label}</span>
                        <span className="rounded-full" style={{
                          width: 10 + (p.diameter / 30) * 14, height: 10 + (p.diameter / 30) * 14,
                          border: `1.5px solid ${on ? "#f3d27a" : "#d4af37"}`, opacity: 0.9,
                        }} />
                      </div>
                      <p className="font-inter text-[11px] mt-1 opacity-80">{p.people}</p>
                      <p className="font-inter text-[10px] mt-1.5 tracking-wide" style={{ color: on ? "#f3d27a" : "#d4af37" }}>
                        Ø {p.diameter} cm{p.tiers > 1 ? ` · ${p.tiers} pisos` : ""}
                      </p>
                    </button>
                  );
                })}
              </div>
            </Panel>

            {/* Corte */}
            <Panel title="2. ¿Cómo la vas a cortar?">
              <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl" style={{ background: "rgba(212,175,55,0.1)" }}>
                {CUTS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setCutKey(c.key)}
                    className="relative py-2.5 rounded-xl font-inter text-[12px] font-semibold transition-colors"
                    style={{ color: cutKey === c.key ? "#fdfaf5" : "#a50059" }}
                  >
                    {cutKey === c.key && (
                      <motion.span layoutId="cut-pill" className="absolute inset-0 rounded-xl"
                        style={{ background: "linear-gradient(135deg,#d4af37,#b8912a)" }}
                        transition={{ duration: 0.35, ease: EASE }} />
                    )}
                    <span className="relative">{c.label}</span>
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.p key={cutKey} className="font-inter text-[12px] mt-2.5 leading-relaxed" style={{ color: "rgba(165,0,89,0.6)" }}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }}>
                  {cut.note}
                </motion.p>
              </AnimatePresence>
            </Panel>

            {/* Personas */}
            <Panel title={`3. Alcanza para ${slices} ${slices === 1 ? "persona" : "personas"}`}>
              <PeopleGrid count={slices} />
            </Panel>

            {/* Comparación */}
            <Panel title="Compara los tamaños">
              <div className="flex items-center gap-4">
                <div className="w-[120px] h-[120px] shrink-0">
                  <SizeRings portions={portions} activeId={active.id} onSelect={setActiveId} />
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 font-inter text-[12px] flex-1">
                  <Stat label="Diámetro" value={`${active.diameter} cm`} />
                  <Stat label="Alto" value={`${active.height} cm${active.tiers > 1 ? " c/u" : ""}`} />
                  <Stat label="Peso aprox." value={`${weight.toFixed(1)} kg`} icon={<Weight size={11} />} />
                  <Stat label="Porción" value={`${Math.round((weight * 1000) / slices)} g`} />
                </dl>
              </div>
            </Panel>
          </div>
        </div>

        <p className="font-inter text-[11px] text-center mt-10 font-light" style={{ color: "rgba(165,0,89,0.35)" }}>
          * Las porciones y el peso son estimados. Para eventos especiales, escríbenos y te asesoramos.
        </p>
      </div>

      <AnimatePresence>
        {arOpen && (
          <CakeARModal portions={portions} initialPortionId={active.id} onClose={() => setArOpen(false)} />
        )}
      </AnimatePresence>
    </section>
  );
}

function Chip({ icon, text }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-inter text-[11px] font-medium"
      style={{ background: "rgba(253,250,245,0.82)", backdropFilter: "blur(10px)", color: "#a50059", border: "1px solid rgba(212,175,55,0.2)" }}>
      <span style={{ color: "#d4af37" }}>{icon}</span>{text}
    </span>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-3xl p-4 md:p-5"
      style={{ background: "rgba(253,250,245,0.72)", backdropFilter: "blur(16px)", border: "1px solid rgba(212,175,55,0.14)", boxShadow: "0 10px 30px rgba(165,0,89,0.05)" }}>
      <h3 className="font-inter text-[11px] tracking-[0.18em] uppercase font-semibold mb-3" style={{ color: "#a50059" }}>{title}</h3>
      {children}
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div>
      <dt className="text-[10px] tracking-[0.12em] uppercase flex items-center gap-1" style={{ color: "rgba(165,0,89,0.45)" }}>{icon}{label}</dt>
      <dd className="font-playfair text-[17px] font-semibold" style={{ color: "#a50059" }}>{value}</dd>
    </div>
  );
}
