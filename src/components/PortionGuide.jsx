import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Camera } from "lucide-react";
import CakeARModal from "./cake/CakeARModal";
import GoldDust from "./fx/GoldDust";
import { Reveal, RevealItem, SplitTitle } from "./fx/Reveal";
import { usePublicCatalog } from "@/data/catalogStore";
import { estimateWeightKg } from "@/lib/cakeSpecs";

// three.js solo se descarga cuando la sección se acerca
const CakeStage = lazy(() => import("./cake/CakeStage"));

const EASE = [0.22, 1, 0.36, 1];
const STOP = 128; // ancho de cada tamaño en la regla

const CUTS = [
  { key: "generoso", label: "Generoso", factor: 0.75, note: "Porciones grandes, para golosos o como postre principal." },
  { key: "estandar", label: "Estándar", factor: 1, note: "Nuestro corte recomendado: buena porción y la torta se mantiene firme." },
  { key: "fino", label: "Fino", factor: 1.3, note: "Rinde más en eventos grandes. Cortes delgados, con cuchillo caliente." },
];

function CountUp({ value }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / 500);
      setShown(Math.round(a + (value - a) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{shown}</>;
}

// Regla deslizable: cada parada es un tamaño; la del centro es la elegida
function SizeRuler({ portions, activeIdx, onChange }) {
  const ref = useRef(null);
  const settling = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const want = activeIdx * STOP;
    if (Math.abs(el.scrollLeft - want) > 4) {
      settling.current = true;
      el.scrollTo({ left: want, behavior: "smooth" });
      setTimeout(() => { settling.current = false; }, 500);
    }
  }, [activeIdx]);

  const onScroll = () => {
    if (settling.current) return;
    const i = Math.round(ref.current.scrollLeft / STOP);
    if (i !== activeIdx && i >= 0 && i < portions.length) onChange(i);
  };

  return (
    <div className="relative">
      <div aria-hidden className="absolute left-1/2 -translate-x-1/2 top-0 h-[52px] w-[2px] rounded z-10" style={{ background: "var(--lv-gold)" }} />
      <div aria-hidden className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 rotate-45 z-10" style={{ background: "var(--lv-gold)" }} />
      <div
        ref={ref}
        onScroll={onScroll}
        role="listbox"
        aria-label="Tamaño de la torta"
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
        style={{ paddingInline: `calc(50% - ${STOP / 2}px)`, maskImage: "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)" }}
      >
        {portions.map((p, i) => {
          const on = i === activeIdx;
          return (
            <button
              key={p.id}
              role="option"
              aria-selected={on}
              onClick={() => onChange(i)}
              className="snap-center shrink-0 flex flex-col items-center pt-5 pb-1"
              style={{ width: STOP }}
            >
              <span className="w-full h-7" aria-hidden
                style={{ background: "repeating-linear-gradient(90deg, rgba(243,220,154,0.55) 0 1px, transparent 1px 12.8px)", maskImage: "linear-gradient(180deg,#000 40%,transparent)" }} />
              <span className="font-display text-[26px] font-semibold leading-none mt-2 transition-all duration-500"
                style={{ color: on ? "var(--lv-gold-soft)" : "rgba(253,250,245,0.45)", transform: on ? "scale(1.12)" : "scale(1)" }}>
                {p.diameter}<span className="text-[15px] ml-0.5">cm</span>
              </span>
              <span className="font-inter text-[13px] mt-1.5 transition-colors" style={{ color: on ? "var(--lv-cream)" : "rgba(253,250,245,0.45)" }}>
                {p.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PeopleRow({ count }) {
  const shown = Math.min(count, 48);
  return (
    <div className="flex flex-wrap gap-[6px]" aria-label={`${count} personas`}>
      <AnimatePresence initial={false}>
        {Array.from({ length: shown }, (_, i) => (
          <motion.span key={i} className="block w-[13px] h-[13px] rounded-full"
            style={{ background: i % 3 === 0 ? "var(--lv-gold)" : "rgba(253,250,245,0.85)" }}
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: Math.min(i * 0.015, 0.45) }} />
        ))}
      </AnimatePresence>
      {count > shown && <span className="font-inter text-[13px] leading-[13px]" style={{ color: "var(--lv-gold-soft)" }}>+{count - shown}</span>}
    </div>
  );
}

export default function PortionGuide() {
  const { portions } = usePublicCatalog();
  const stageRef = useRef(null);
  const near = useInView(stageRef, { margin: "400px 0px", once: true });

  const [idx, setIdx] = useState(() => Math.min(3, Math.max(0, portions.length - 1)));
  const [cutKey, setCutKey] = useState("estandar");
  const [showCup, setShowCup] = useState(true);
  const [arOpen, setArOpen] = useState(false);
  const onChange = useCallback((i) => setIdx(i), []);

  const active = portions[Math.min(idx, portions.length - 1)];
  const cut = CUTS.find((c) => c.key === cutKey);
  const slices = active ? Math.max(1, Math.round(active.slices * cut.factor)) : 0;
  const weight = useMemo(() => (active ? estimateWeightKg(active) : 0), [active]);
  if (!active) return null;

  return (
    <section id="porciones" className="relative overflow-hidden py-20 md:py-32" style={{ background: "var(--lv-wine-deep)" }}>
      <GoldDust count={60} />

      <div className="relative max-w-[1400px] mx-auto px-5 md:px-10">
        <div className="grid lg:grid-cols-[1fr_auto] gap-5 lg:items-end mb-6 md:mb-10">
          <SplitTitle lines={["¿Para cuántas", "personas?"]} style={{ color: "var(--lv-cream)" }}
            className="font-display font-semibold text-[46px] md:text-[88px] leading-[0.96]" />
          <Reveal>
            <RevealItem as="p" className="font-inter text-[16px] md:text-[18px] leading-relaxed max-w-[38ch]" style={{ color: "rgba(253,250,245,0.82)" }}>
              Desliza la regla y mira la torta crecer en su tamaño real, con una taza de café al lado para comparar.
            </RevealItem>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 lg:gap-12 items-start">
          {/* Escenario 3D */}
          <div className="min-w-0 lg:sticky lg:top-24">
            <div ref={stageRef} className="relative aspect-square md:aspect-[5/4] -mx-5 md:mx-0">
              <div aria-hidden className="absolute inset-x-[8%] bottom-[12%] h-[30%] rounded-[50%]"
                style={{ background: "radial-gradient(closest-side, rgba(243,220,154,0.22), transparent)" }} />
              {near && (
                <Suspense fallback={null}>
                  <CakeStage portion={active} slices={slices} showCup={showCup} />
                </Suspense>
              )}

              <div className="absolute left-5 md:left-2 bottom-2 pointer-events-none">
                <p className="font-display font-semibold leading-[0.85] text-[92px] md:text-[132px]" style={{ color: "var(--lv-gold-soft)" }}>
                  <CountUp value={slices} />
                </p>
                <p className="font-inter text-[15px] mt-1" style={{ color: "var(--lv-cream)" }}>porciones · corte {cut.label.toLowerCase()}</p>
              </div>
              <p className="absolute right-5 md:right-2 top-2 font-inter text-[14px] text-right pointer-events-none" style={{ color: "rgba(253,250,245,0.7)" }}>
                Ø {active.diameter} cm · {active.tiers > 1 ? `${active.tiers} pisos` : `${active.height} cm de alto`}
              </p>
            </div>
          </div>

          {/* Controles */}
          <div className="min-w-0 flex flex-col gap-7">
            <SizeRuler portions={portions} activeIdx={idx} onChange={onChange} />

            <div>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-full" style={{ background: "rgba(253,250,245,0.08)" }}>
                {CUTS.map((c) => (
                  <button key={c.key} onClick={() => setCutKey(c.key)}
                    className="relative py-3 rounded-full font-inter text-[14px] font-semibold"
                    style={{ color: cutKey === c.key ? "var(--lv-wine-deep)" : "var(--lv-cream)" }}>
                    {cutKey === c.key && (
                      <motion.span layoutId="cut-pill" className="absolute inset-0 rounded-full" style={{ background: "var(--lv-gold)" }}
                        transition={{ duration: 0.45, ease: EASE }} />
                    )}
                    <span className="relative">{c.label}</span>
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.p key={cutKey} className="font-inter text-[15px] mt-3 leading-relaxed" style={{ color: "rgba(253,250,245,0.78)" }}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                  {cut.note}
                </motion.p>
              </AnimatePresence>
            </div>

            <div>
              <p className="font-display text-[24px] mb-3" style={{ color: "var(--lv-cream)" }}>
                Alcanza para {slices} {slices === 1 ? "persona" : "personas"}
              </p>
              <PeopleRow count={slices} />
            </div>

            <dl className="grid grid-cols-3 gap-2">
              {[
                ["Peso aprox.", `${weight.toFixed(1)} kg`],
                ["Por porción", `${Math.round((weight * 1000) / slices)} g`],
                ["Sugerido", active.people],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl px-3 py-3.5" style={{ background: "rgba(253,250,245,0.07)" }}>
                  <dt className="font-inter text-[12px]" style={{ color: "rgba(253,250,245,0.6)" }}>{k}</dt>
                  <dd className="font-display text-[19px] md:text-[22px] font-semibold mt-0.5 leading-tight" style={{ color: "var(--lv-cream)" }}>{v}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setArOpen(true)}
                className="btn-press ar-cta flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-inter text-[15px] font-semibold"
                style={{ background: "var(--lv-gold)", color: "var(--lv-wine-deep)" }}>
                <Camera size={18} /> Verla en mi mesa
              </button>
              <button onClick={() => setShowCup((v) => !v)} aria-pressed={showCup}
                className="btn-press py-4 px-5 rounded-full font-inter text-[14px] font-medium"
                style={{ background: "rgba(253,250,245,0.08)", color: "var(--lv-cream)" }}>
                {showCup ? "Ocultar taza" : "Mostrar taza de referencia"}
              </button>
            </div>
            <p className="font-inter text-[13px]" style={{ color: "rgba(253,250,245,0.5)" }}>
              Porciones y peso son estimados. Para eventos grandes te asesoramos por WhatsApp.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {arOpen && <CakeARModal portions={portions} initialPortionId={active.id} onClose={() => setArOpen(false)} />}
      </AnimatePresence>
    </section>
  );
}
