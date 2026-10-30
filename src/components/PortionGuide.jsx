import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.22, 1, 0.36, 1];

const PORTIONS = [
  { label: "Individual",   value: "1–2 personas",   size: "10 cm",     slices: 2  },
  { label: "Para dos",     value: "2–4 personas",    size: "15 cm",     slices: 4  },
  { label: "Pequeño",      value: "6–8 personas",    size: "18 cm",     slices: 8  },
  { label: "Familiar",     value: "10–12 personas",  size: "24 cm",     slices: 12 },
  { label: "Celebración",  value: "20–25 personas",  size: "30 cm",     slices: 20 },
  { label: "Gran Evento",  value: "+40 personas",    size: "Consultar", slices: 40 },
];

// ── Animated Isometric Cake SVG ────────────────────────────────────────────────
function IsoCake({ slices }) {
  const CX = 110, CY = 80, RX = 88, RY = 44, H = 32;
  const drawn = Math.min(slices, 32);

  // We use a ref-based angle store to animate lines with GSAP
  const linesRef = useRef([]);
  const prevSlicesRef = useRef(drawn);

  // Animate line angles when slices change
  useEffect(() => {
    const prev = prevSlicesRef.current;
    if (prev === drawn) return;
    prevSlicesRef.current = drawn;

    linesRef.current.forEach((el, i) => {
      if (!el) return;
      const targetAngle = (360 / drawn) * i - 90;
      gsap.to(el, {
        attr: { transform: `rotate(${targetAngle}, ${CX}, ${CY})` },
        duration: 0.55,
        ease: "power2.out",
      });
    });
  }, [drawn]);

  const slicePaths = [];
  for (let i = 0; i < drawn; i++) {
    const a0 = (2 * Math.PI * i) / drawn - Math.PI / 2;
    const a1 = (2 * Math.PI * (i + 1)) / drawn - Math.PI / 2;
    const isFirst = i === 0;
    const lift = isFirst ? 7 : 0;
    const midA = (a0 + a1) / 2;
    const lx = Math.cos(midA) * lift * 0.5;
    const ly = Math.sin(midA) * lift * 0.28;
    const x0 = CX + lx, y0 = CY - ly;
    const x1 = CX + RX * Math.cos(a0) + lx, y1 = CY + RY * Math.sin(a0) - ly;
    const x2 = CX + RX * Math.cos(a1) + lx, y2 = CY + RY * Math.sin(a1) - ly;

    slicePaths.push(
      <g key={i} style={{ transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)" }}>
        {isFirst && (
          <path
            d={`M ${x1} ${y1} L ${x1} ${y1 + H} L ${x0} ${y0 + H} L ${x0} ${y0} Z`}
            fill="#e8b9cc" stroke="#d4af37" strokeWidth="0.7" opacity="0.7"
          />
        )}
        <path
          d={`M ${x0} ${y0} L ${x1} ${y1} A ${RX} ${RY} 0 0 1 ${x2} ${y2} Z`}
          fill={isFirst ? "rgba(253,240,245,0.92)" : "#fdf0f5"}
          stroke="#a50059"
          strokeWidth={isFirst ? "1.2" : "0.6"}
          strokeOpacity={isFirst ? 0.5 : 0.25}
          style={{ transition: "all 0.55s cubic-bezier(0.22,1,0.36,1)" }}
        />
        {/* Cut line from center — used by GSAP for angle animation */}
        <line
          ref={(el) => (linesRef.current[i] = el)}
          x1={CX} y1={CY}
          x2={CX + RX * Math.cos(a0)} y2={CY + RY * Math.sin(a0)}
          stroke="rgba(165,0,89,0.18)" strokeWidth="0.7" strokeDasharray="3 3"
          style={{ transition: "all 0.55s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </g>
    );
  }

  return (
    <svg viewBox="0 0 220 160" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <clipPath id="cake-side-clip">
          <rect x="0" y={CY} width="220" height={H + RY + 10} />
        </clipPath>
      </defs>
      <ellipse cx={CX} cy={CY + H} rx={RX} ry={RY} fill="#f0d8e4" stroke="#d4af37" strokeWidth="1.2" clipPath="url(#cake-side-clip)" />
      <path d={`M ${CX - RX} ${CY} L ${CX - RX} ${CY + H} A ${RX} ${RY} 0 0 0 ${CX + RX} ${CY + H} L ${CX + RX} ${CY} A ${RX} ${RY} 0 0 1 ${CX - RX} ${CY} Z`}
        fill="#f5e0ec" stroke="#d4af37" strokeWidth="1" opacity="0.8" />
      <path d={`M ${CX - RX} ${CY + 6} A ${RX} ${RY} 0 0 0 ${CX + RX} ${CY + 6}`}
        fill="none" stroke="rgba(253,250,245,0.6)" strokeWidth="5" />
      <g>{slicePaths}</g>
      <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke="#d4af37" strokeWidth="1.4" />
      <circle cx={CX} cy={CY} r="3" fill="#d4af37" opacity="0.5" />
      {[30, 90, 150, 210, 270, 330].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return <circle key={deg} cx={CX + RX * 0.45 * Math.cos(rad)} cy={CY + RY * 0.45 * Math.sin(rad)} r="2.5" fill="#d4af37" opacity="0.4" />;
      })}
    </svg>
  );
}

// ── Slice Stepper ──────────────────────────────────────────────────────────────
function SliceStepper({ base, customSlices, onChange }) {
  const min = Math.max(1, base - 5);
  const max = base + 5;
  const atMin = customSlices <= min;
  const atMax = customSlices >= max;
  const isIdeal = customSlices === base;
  const isMin = customSlices === min;
  const isMaxW = customSlices === max;

  const feedback = isMaxW
    ? { text: "⚠️ Cuidado: Rebanadas muy finas, el pastel podría perder estructura al cortarlo.", color: "#8a004c" }
    : isMin
    ? { text: "Rebanadas gruesas (Ideales para golosos)", color: "#d4af37" }
    : { text: "Corte estándar recomendado", color: "rgba(165,0,89,0.45)" };

  const counterRef = useRef(null);

  const step = (delta) => {
    const next = Math.min(max, Math.max(min, customSlices + delta));
    if (next === customSlices) return;
    // Micro-bounce on the number
    if (counterRef.current) {
      gsap.fromTo(counterRef.current,
        { scale: delta > 0 ? 1.22 : 0.82, y: delta > 0 ? -6 : 6 },
        { scale: 1, y: 0, duration: 0.38, ease: "back.out(2)" }
      );
    }
    onChange(next);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full pt-2">
      {/* Divider */}
      <div className="w-full h-[1px]" style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.3), transparent)" }} />

      {/* Counter + stepper */}
      <div className="flex items-center gap-5">
        {/* − button */}
        <button
          onClick={() => step(-1)}
          disabled={atMin}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background: atMin ? "rgba(212,175,55,0.05)" : "rgba(212,175,55,0.12)",
            border: "1px solid rgba(212,175,55,0.3)",
            color: atMin ? "rgba(212,175,55,0.25)" : "#d4af37",
            cursor: atMin ? "not-allowed" : "pointer",
            boxShadow: atMin ? "none" : "0 2px 10px rgba(212,175,55,0.12)",
          }}
          onMouseEnter={(e) => { if (!atMin) e.currentTarget.style.transform = "scale(1.12)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>

        {/* Number display */}
        <div className="flex flex-col items-center" style={{ minWidth: 80 }}>
          <span
            ref={counterRef}
            className="font-playfair font-semibold leading-none inline-block"
            style={{ fontSize: 42, color: "#a50059", willChange: "transform" }}
          >
            {customSlices}
          </span>
          <span className="font-inter text-[10px] tracking-[0.18em] uppercase mt-0.5" style={{ color: "rgba(165,0,89,0.4)" }}>
            Porciones
          </span>
        </div>

        {/* + button */}
        <button
          onClick={() => step(1)}
          disabled={atMax}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background: atMax ? "rgba(212,175,55,0.05)" : "linear-gradient(135deg, rgba(212,175,55,0.22), rgba(212,175,55,0.1))",
            border: "1px solid rgba(212,175,55,0.3)",
            color: atMax ? "rgba(212,175,55,0.25)" : "#d4af37",
            cursor: atMax ? "not-allowed" : "pointer",
            boxShadow: atMax ? "none" : "0 2px 10px rgba(212,175,55,0.15)",
          }}
          onMouseEnter={(e) => { if (!atMax) e.currentTarget.style.transform = "scale(1.12)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
      </div>

      {/* Range indicator bar */}
      <div className="flex items-center gap-2 w-full max-w-[200px]">
        <span className="font-inter text-[9px]" style={{ color: "rgba(212,175,55,0.4)" }}>{min}</span>
        <div className="flex-1 h-1.5 rounded-full relative overflow-hidden" style={{ background: "rgba(212,175,55,0.12)" }}>
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ background: "linear-gradient(to right, #d4af37, #c49b2f)" }}
            animate={{ width: `${((customSlices - min) / (max - min)) * 100}%` }}
            transition={{ duration: 0.4, ease: EASE }}
          />
        </div>
        <span className="font-inter text-[9px]" style={{ color: "rgba(212,175,55,0.4)" }}>{max}</span>
      </div>

      {/* Feedback message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={feedback.text}
          className="font-inter text-[10px] text-center leading-relaxed max-w-[220px]"
          style={{ color: feedback.color }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          {feedback.text}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const ICONS = [
  <svg key="i" viewBox="0 0 40 40" fill="none" width="26" height="26"><circle cx="20" cy="14" r="6" stroke="#d4af37" strokeWidth="1.5"/><path d="M8 34c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  <svg key="d" viewBox="0 0 40 40" fill="none" width="26" height="26"><circle cx="14" cy="14" r="5" stroke="#d4af37" strokeWidth="1.5"/><circle cx="26" cy="14" r="5" stroke="#d4af37" strokeWidth="1.5"/><path d="M4 34c0-5.523 4.477-10 10-10M22 34c0-5.523 4.477-10 10-10" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  <svg key="p" viewBox="0 0 40 40" fill="none" width="26" height="26"><rect x="6" y="22" width="28" height="10" rx="3" stroke="#d4af37" strokeWidth="1.5"/><path d="M10 22v-4a10 10 0 0 1 20 0v4" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  <svg key="f" viewBox="0 0 40 40" fill="none" width="26" height="26"><rect x="4" y="20" width="32" height="12" rx="3" stroke="#d4af37" strokeWidth="1.5"/><rect x="9" y="12" width="22" height="8" rx="2" stroke="#d4af37" strokeWidth="1.5"/><path d="M10 26h20M13 17h14" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  <svg key="c" viewBox="0 0 40 40" fill="none" width="26" height="26"><rect x="3" y="22" width="34" height="11" rx="3" stroke="#d4af37" strokeWidth="1.5"/><rect x="8" y="14" width="24" height="8" rx="2" stroke="#d4af37" strokeWidth="1.5"/><rect x="13" y="8" width="14" height="6" rx="2" stroke="#d4af37" strokeWidth="1.5"/></svg>,
  <svg key="g" viewBox="0 0 40 40" fill="none" width="26" height="26"><rect x="2" y="24" width="36" height="10" rx="3" stroke="#d4af37" strokeWidth="1.5"/><rect x="7" y="16" width="26" height="8" rx="2" stroke="#d4af37" strokeWidth="1.5"/><rect x="12" y="9" width="16" height="7" rx="2" stroke="#d4af37" strokeWidth="1.5"/><circle cx="20" cy="5" r="2.5" stroke="#d4af37" strokeWidth="1.3"/></svg>,
];

// ── Main Component ─────────────────────────────────────────────────────────────
export default function PortionGuide() {
  const sectionRef  = useRef(null);
  const bgRef       = useRef(null);
  const titleRef    = useRef(null);
  const subtitleRef = useRef(null);
  const dividerRef  = useRef(null);
  const cardsRef    = useRef([]);
  const cakeRef     = useRef(null);

  const [activeIdx, setActiveIdx] = useState(3);
  // customSlices is reset to the base whenever the card changes
  const [customSlices, setCustomSlices] = useState(PORTIONS[3].slices);

  const active = PORTIONS[activeIdx];

  const handleCardSelect = useCallback((i) => {
    setActiveIdx(i);
    setCustomSlices(PORTIONS[i].slices);
  }, []);

  // ── GSAP ScrollTrigger ──────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        yPercent: -18, ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 1.2 },
      });

      gsap.fromTo(titleRef.current, { opacity: 0, y: 60, scale: 0.94 }, {
        opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: titleRef.current, start: "top 82%", toggleActions: "play none none none" },
      });

      gsap.fromTo([subtitleRef.current, dividerRef.current], { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.12,
        scrollTrigger: { trigger: subtitleRef.current, start: "top 85%", toggleActions: "play none none none" },
      });

      gsap.fromTo(cardsRef.current, { opacity: 0, y: 80, scale: 0.82, rotationX: 14, transformOrigin: "50% 100%" }, {
        opacity: 1, y: 0, scale: 1, rotationX: 0, duration: 0.9, ease: "power3.out",
        stagger: { amount: 0.55, from: "start" },
        scrollTrigger: { trigger: cardsRef.current[0], start: "top 80%", toggleActions: "play none none none" },
      });

      cardsRef.current.forEach((card, i) => {
        const depth = (i % 2 === 0 ? -1 : 1) * (8 + i * 2);
        gsap.to(card, {
          y: depth, ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 0.8 + i * 0.1 },
        });
      });

      gsap.fromTo(cakeRef.current, { opacity: 0, scale: 0.78, y: 40 }, {
        opacity: 1, scale: 1, y: 0, duration: 1.1, ease: "back.out(1.5)",
        scrollTrigger: { trigger: cakeRef.current, start: "top 78%", toggleActions: "play none none none" },
      });

      gsap.to(cakeRef.current, {
        y: -30, ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 1.5 },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 px-6 overflow-hidden">

      <div ref={bgRef} className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(212,175,55,0.07) 0%, transparent 70%)", transform: "scale(1.3)" }}
      />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-16 overflow-hidden">
          <span ref={subtitleRef} className="font-inter text-xs tracking-[0.45em] uppercase font-medium inline-block"
            style={{ color: "#d4af37", opacity: 0 }}>
            Referencia
          </span>
          <h2 ref={titleRef} className="font-playfair text-4xl md:text-6xl font-semibold mt-3 leading-tight"
            style={{ color: "#a50059", opacity: 0 }}>
            Guía de <span className="italic font-normal" style={{ color: "#d4af37" }}>Porciones</span>
          </h2>
          <div ref={dividerRef} className="w-16 h-[1px] mx-auto mt-6"
            style={{ background: "linear-gradient(to right, transparent, #d4af37, transparent)", opacity: 0 }} />
        </div>

        {/* Main layout */}
        <div className="flex flex-col lg:flex-row gap-12 items-center">

          {/* Cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 w-full lg:flex-1">
            {PORTIONS.map((p, i) => {
              const isActive = i === activeIdx;
              return (
                <div
                  key={p.label}
                  ref={(el) => (cardsRef.current[i] = el)}
                  onClick={() => handleCardSelect(i)}
                  className={`flex flex-col items-center gap-2 p-5 rounded-3xl text-center cursor-pointer select-none ${isActive ? "is-active" : ""}`}
                  style={{
                    background: isActive ? "rgba(212,175,55,0.13)" : "rgba(253,250,245,0.72)",
                    backdropFilter: "blur(14px)",
                    border: isActive ? "1.5px solid rgba(212,175,55,0.5)" : "1px solid rgba(212,175,55,0.12)",
                    boxShadow: isActive ? "0 16px 48px rgba(165,0,89,0.11), 0 4px 12px rgba(212,175,55,0.1)" : "0 4px 20px rgba(165,0,89,0.04)",
                    transform: isActive ? "translateY(-6px)" : "translateY(0px)",
                    transition: "background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1)",
                    willChange: "transform",
                  }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: isActive ? "rgba(212,175,55,0.18)" : "rgba(212,175,55,0.08)" }}>
                    {ICONS[i]}
                  </div>
                  <span className="font-inter text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: "#a50059" }}>{p.label}</span>
                  <span className="font-inter text-[10px] font-light" style={{ color: "rgba(165,0,89,0.5)" }}>{p.value}</span>
                  <span className="font-inter text-[9px] tracking-[0.1em] px-2.5 py-1 rounded-full"
                    style={{ background: isActive ? "rgba(212,175,55,0.22)" : "rgba(212,175,55,0.08)", color: "#d4af37" }}>
                    {p.size}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 3D Cake visualizer + Stepper */}
          <div ref={cakeRef} className="flex-shrink-0 flex flex-col items-center"
            style={{ width: "min(360px, 90vw)", opacity: 0, willChange: "transform" }}>
            <div className="w-full rounded-3xl p-7 flex flex-col items-center gap-4"
              style={{
                background: "rgba(253,250,245,0.8)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(212,175,55,0.18)",
                boxShadow: "0 28px 70px rgba(165,0,89,0.09), 0 8px 24px rgba(212,175,55,0.07)",
              }}>

              {/* Cake SVG */}
              <div style={{ width: "100%", aspectRatio: "16/9", position: "relative" }}>
                <IsoCake key={`cake-${activeIdx}`} slices={customSlices} />
              </div>

              {/* Label */}
              <AnimatePresence mode="wait">
                <motion.div key={`label-${activeIdx}`} className="text-center"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.32, ease: EASE }}>
                  <p className="font-playfair text-xl font-semibold" style={{ color: "#a50059" }}>{active.label}</p>
                  <p className="font-inter text-xs font-light mt-0.5" style={{ color: "rgba(165,0,89,0.45)" }}>
                    {active.value} · {active.size !== "Consultar" ? `Ø ${active.size}` : "Bajo pedido"}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Stepper simulator */}
              <SliceStepper
                base={active.slices}
                customSlices={customSlices}
                onChange={setCustomSlices}
              />
            </div>

            <p className="font-inter text-[10px] mt-4 text-center" style={{ color: "rgba(165,0,89,0.2)" }}>
              Ajusta las porciones con los controles ± para simular el corte
            </p>
          </div>
        </div>

        <p className="font-inter text-[11px] text-center mt-12 font-light" style={{ color: "rgba(165,0,89,0.28)" }}>
          * Las porciones son estimados. Para eventos especiales, consulta con nosotros.
        </p>
      </div>
    </section>
  );
}