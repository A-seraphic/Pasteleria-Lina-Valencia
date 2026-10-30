import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Leaf } from "lucide-react";
import OrderForm from "./OrderForm";
import DessertCareModal from "./DessertCareModal";

const EASE = [0.76, 0, 0.24, 1];

const PALETTES = [
  { from: "#fdf0f5", to: "#f5e2ec" },
  { from: "#f5ede2", to: "#f0e0c8" },
  { from: "#f0edf7", to: "#e8dff2" },
  { from: "#fdf5e8", to: "#f7e8cc" },
  { from: "#edf5ec", to: "#d8ecd6" },
  { from: "#f5edf5", to: "#ecdded" },
  { from: "#edf3f5", to: "#d6e9ee" },
  { from: "#f5f0e8", to: "#ede5d0" },
  { from: "#f5e8e8", to: "#edd0d0" },
  { from: "#f0f5e8", to: "#e0edcc" },
  { from: "#f5ede0", to: "#eddfcc" },
];

const DECO_SHAPES = [
  [{ type: "circle", x: 8, y: 15, size: 36, color: "#d4af37", op: 0.15 }, { type: "star", x: 85, y: 20, size: 22, color: "#a50059", op: 0.18 }, { type: "leaf", x: 10, y: 72, size: 28, color: "#eed3d7", op: 0.22 }],
  [{ type: "diamond", x: 12, y: 18, size: 28, color: "#a50059", op: 0.13 }, { type: "circle", x: 82, y: 22, size: 40, color: "#d4af37", op: 0.12 }, { type: "star", x: 78, y: 70, size: 24, color: "#a50059", op: 0.18 }],
  [{ type: "star", x: 10, y: 22, size: 32, color: "#d4af37", op: 0.18 }, { type: "leaf", x: 80, y: 18, size: 36, color: "#a50059", op: 0.14 }, { type: "circle", x: 14, y: 68, size: 22, color: "#eed3d7", op: 0.28 }],
  [{ type: "leaf", x: 12, y: 16, size: 34, color: "#d4af37", op: 0.16 }, { type: "circle", x: 80, y: 24, size: 28, color: "#a50059", op: 0.12 }, { type: "diamond", x: 18, y: 74, size: 22, color: "#d4af37", op: 0.2 }],
  [{ type: "circle", x: 10, y: 20, size: 30, color: "#a50059", op: 0.13 }, { type: "leaf", x: 82, y: 16, size: 38, color: "#d4af37", op: 0.16 }, { type: "star", x: 20, y: 72, size: 26, color: "#a50059", op: 0.18 }],
  [{ type: "diamond", x: 14, y: 18, size: 32, color: "#d4af37", op: 0.18 }, { type: "circle", x: 82, y: 22, size: 24, color: "#a50059", op: 0.14 }, { type: "star", x: 80, y: 72, size: 28, color: "#d4af37", op: 0.16 }],
  [{ type: "star", x: 12, y: 16, size: 28, color: "#a50059", op: 0.16 }, { type: "leaf", x: 84, y: 20, size: 38, color: "#d4af37", op: 0.14 }, { type: "circle", x: 16, y: 70, size: 20, color: "#eed3d7", op: 0.26 }],
  [{ type: "circle", x: 10, y: 22, size: 36, color: "#d4af37", op: 0.14 }, { type: "star", x: 82, y: 16, size: 24, color: "#a50059", op: 0.18 }, { type: "leaf", x: 18, y: 72, size: 30, color: "#d4af37", op: 0.16 }],
  [{ type: "leaf", x: 14, y: 18, size: 34, color: "#a50059", op: 0.16 }, { type: "circle", x: 80, y: 22, size: 28, color: "#d4af37", op: 0.14 }, { type: "diamond", x: 78, y: 74, size: 22, color: "#a50059", op: 0.14 }],
  [{ type: "diamond", x: 12, y: 20, size: 30, color: "#d4af37", op: 0.18 }, { type: "leaf", x: 82, y: 18, size: 36, color: "#a50059", op: 0.13 }, { type: "circle", x: 16, y: 70, size: 26, color: "#d4af37", op: 0.16 }],
  [{ type: "circle", x: 14, y: 16, size: 40, color: "#d4af37", op: 0.13 }, { type: "diamond", x: 82, y: 20, size: 26, color: "#a50059", op: 0.15 }, { type: "leaf", x: 12, y: 72, size: 28, color: "#d4af37", op: 0.18 }],
];

function ShapeIcon({ type, size, color }) {
  if (type === "circle") return <div style={{ width: size, height: size, borderRadius: "50%", background: color }} />;
  if (type === "diamond") return <div style={{ width: size, height: size, background: color, transform: "rotate(45deg)" }} />;
  if (type === "star") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
  if (type === "leaf") return (
    <svg width={size} height={size * 1.3} viewBox="0 0 40 52" fill={color}>
      <ellipse cx="20" cy="26" rx="13" ry="22" transform="rotate(-18 20 26)" />
    </svg>
  );
  return null;
}

const imgVariants = {
  enter: (dir) => ({ x: dir > 0 ? "60%" : "-60%", scale: 0.88, opacity: 0 }),
  center: { x: "0%", scale: 1, opacity: 1, transition: { duration: 0.8, ease: EASE } },
  exit: (dir) => ({ x: dir > 0 ? "-55%" : "55%", scale: 0.9, opacity: 0, transition: { duration: 0.55, ease: EASE } }),
};

const textVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: 0.18 } },
  exit: { opacity: 0, y: -14, transition: { duration: 0.3, ease: EASE } },
};

export default function SubcatalogView({ product, productIdx, onBack, initialSubIdx = 0 }) {
  const [subIdx, setSubIdx] = useState(initialSubIdx);
  const [direction, setDirection] = useState(1);
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [careOpen, setCareOpen] = useState(false);

  const scrollRef  = useRef(null); // right panel
  const imageRef   = useRef(null); // left panel — also intercepts wheel/touch
  const isScrolling = useRef(false);

  const palette = PALETTES[productIdx % PALETTES.length] || PALETTES[0];
  const deco = DECO_SHAPES[productIdx % DECO_SHAPES.length] || [];
  const sub = product.subcategories[subIdx];

  const goTo = (idx) => {
    if (idx === subIdx || idx < 0 || idx >= product.subcategories.length) return;
    setDirection(idx > subIdx ? 1 : -1);
    setSubIdx(idx);
  };

  // Shared wheel + touch handlers — applied to BOTH panels
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) return; // Don't intercept wheel on mobile — allow native scroll

    const panels = [scrollRef.current, imageRef.current].filter(Boolean);
    let pending = false;

    const onWheel = (e) => {
      e.preventDefault();
      if (pending) return;
      pending = true;
      if (e.deltaY > 0) goTo(subIdx + 1);
      else goTo(subIdx - 1);
      setTimeout(() => { pending = false; }, 650);
    };

    panels.forEach(el => el.addEventListener("wheel", onWheel, { passive: false }));
    return () => panels.forEach(el => el.removeEventListener("wheel", onWheel));
  }, [subIdx, product]);

  useEffect(() => {
    const panels = [scrollRef.current, imageRef.current].filter(Boolean);
    let startY = null, startX = null;

    const onTouchStart = (e) => {
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
    };
    const onTouchEnd = (e) => {
      if (startY === null) return;
      const dy = startY - e.changedTouches[0].clientY;
      const dx = startX - e.changedTouches[0].clientX;
      // Only horizontal swipes change photos; vertical swipes allow native scroll
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        if (dx > 0) goTo(subIdx + 1);
        else goTo(subIdx - 1);
      }
      startY = null; startX = null;
    };

    panels.forEach(el => {
      el.addEventListener("touchstart", onTouchStart, { passive: true });
      el.addEventListener("touchend", onTouchEnd, { passive: true });
    });
    return () => panels.forEach(el => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    });
  }, [subIdx, product]);

  // Keyboard
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goTo(subIdx + 1);
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") goTo(subIdx - 1);
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [subIdx]);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-30 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden font-inter"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {/* ── LEFT — Visual ── */}
        <motion.div
          className="relative w-full md:w-1/2 flex-shrink-0 flex items-center justify-center overflow-hidden h-[40vh] md:h-auto"
          animate={{ background: `linear-gradient(145deg, ${palette.from} 40%, ${palette.to} 100%)` }}
          transition={{ duration: 0.8, ease: EASE }}
          ref={imageRef}
        >
          {deco.map((d, i) => (
            <motion.div
              key={`deco-${productIdx}-${i}`}
              className="absolute pointer-events-none"
              style={{ left: `${d.x}%`, top: `${d.y}%` }}
              initial={{ opacity: 0, scale: 0.4, rotate: 18, y: 16 }}
              animate={{ opacity: d.op, scale: 1, rotate: 0, y: 0 }}
              transition={{ duration: 0.85, ease: EASE, delay: 0.12 + i * 0.08 }}
            >
              <ShapeIcon type={d.type} size={d.size} color={d.color} />
            </motion.div>
          ))}

          {/* Back button */}
          <button
            onClick={onBack}
            className="absolute top-6 left-6 z-20 flex items-center gap-2 group transition-all duration-300"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{ background: "rgba(253,250,245,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(212,175,55,0.2)" }}
            >
              <ArrowLeft size={16} style={{ color: "#a50059" }} />
            </div>
            <span className="font-inter text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: "#a50059" }}>
              Categorías
            </span>
          </button>

          {/* Product image */}
          <div className="relative w-72 md:w-[320px] z-10">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`img-${subIdx}`}
                custom={direction}
                variants={imgVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="rounded-3xl overflow-hidden relative"
                style={{ aspectRatio: "3/4", boxShadow: "0 32px 80px rgba(165,0,89,0.14), 0 12px 32px rgba(212,175,55,0.1)" }}
              >
                <img src={sub.img} alt={sub.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.22) 0%, transparent 55%)" }} />
                <div
                  className="absolute top-4 left-4 px-3 py-1 rounded-full font-inter text-[10px] font-semibold tracking-[0.18em] uppercase"
                  style={{ background: "rgba(253,250,245,0.88)", backdropFilter: "blur(10px)", color: "#d4af37" }}
                >
                  {product.tag}
                </div>
                <div
                  className="absolute bottom-4 right-4 font-inter text-[10px] tracking-[0.15em] uppercase font-medium px-3 py-1 rounded-full"
                  style={{ background: "rgba(253,250,245,0.8)", backdropFilter: "blur(8px)", color: "#a50059" }}
                >
                  {subIdx + 1} / {product.subcategories.length}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-5">
              {product.subcategories.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="rounded-full transition-all duration-500"
                  style={{ width: subIdx === i ? 24 : 8, height: 8, background: subIdx === i ? "#d4af37" : "rgba(212,175,55,0.3)" }}
                />
              ))}
            </div>
          </div>

          {/* Scroll hint */}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 font-inter text-[10px] tracking-[0.2em] uppercase opacity-35 flex flex-col items-center gap-1"
            style={{ color: "#a50059" }}
          >
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>↕</motion.div>
            Scroll
          </div>
        </motion.div>

        {/* ── RIGHT — Content (no native scroll, wheel intercepted) ── */}
        <div
          ref={scrollRef}
          className="relative w-full md:w-1/2 flex-shrink-0 flex-1 md:flex-none overflow-visible md:overflow-hidden"
          style={{ background: "#fdfaf5" }}
        >
          {/* Sub bullets */}
          <div className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 z-10 flex-col gap-2.5">
            {product.subcategories.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                title={product.subcategories[i].name}
                className="rounded-full transition-all duration-500"
                style={{ width: 6, height: subIdx === i ? 28 : 6, background: subIdx === i ? "#d4af37" : "rgba(212,175,55,0.28)" }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="min-h-full md:h-full flex flex-col justify-start md:justify-center px-6 md:px-14 lg:px-20 py-20 md:py-12 overflow-visible md:overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${subIdx}`}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="max-w-md"
              >
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-5">
                  <button
                    onClick={onBack}
                    className="font-inter text-[10px] tracking-[0.2em] uppercase font-medium transition-opacity hover:opacity-70"
                    style={{ color: "rgba(165,0,89,0.4)" }}
                  >
                    Catálogo
                  </button>
                  <span style={{ color: "rgba(212,175,55,0.5)" }}>›</span>
                  <span className="font-inter text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: "#d4af37" }}>
                    {product.name}
                  </span>
                </div>

                <h1 className="font-playfair text-4xl md:text-5xl font-semibold leading-tight mb-2" style={{ color: "#a50059" }}>
                  {sub.name}
                </h1>
                <p className="font-inter text-sm italic font-light mb-1" style={{ color: "#d4af37" }}>{sub.subtitle}</p>
                <div className="h-[1px] w-12 my-5" style={{ background: "#d4af37" }} />

                <p className="font-inter text-sm font-light leading-relaxed mb-7" style={{ color: "rgba(165,0,89,0.6)" }}>
                  {sub.desc}
                </p>

                {/* Product details pills */}
                <div className="flex flex-wrap gap-2 mb-7">
                  {product.details.slice(0, 3).map((d) => (
                    <div
                      key={d.label}
                      className="px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.12)" }}
                    >
                      <span className="font-inter text-[10px] tracking-[0.12em] uppercase" style={{ color: "#d4af37" }}>{d.label}: </span>
                      <span className="font-inter text-[11px] font-light" style={{ color: "rgba(165,0,89,0.65)" }}>{d.value}</span>
                    </div>
                  ))}
                </div>

                {/* Price + CTAs */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <p className="font-inter text-[10px] tracking-[0.2em] uppercase mb-0.5" style={{ color: "rgba(165,0,89,0.35)" }}>Precio</p>
                    <p className="font-playfair text-2xl font-semibold" style={{ color: "#d4af37" }}>{sub.price}</p>
                  </div>
                  <button
                    onClick={() => setOrderFormOpen(true)}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-full font-inter text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-500 hover:scale-[1.04] hover:shadow-lg"
                    style={{ background: "linear-gradient(135deg, #a50059, #8a004c)", color: "#fdfaf5" }}
                  >
                    <Sparkles size={14} />
                    Personalizar
                  </button>
                </div>

                {/* Dessert care toggle — subtle label */}
                <button
                  onClick={() => setCareOpen(true)}
                  className="mt-6 flex items-center gap-2 transition-all duration-300 group"
                >
                  <span className="text-base">✨</span>
                  <span
                    className="font-inter text-[11px] tracking-[0.15em] uppercase font-medium border-b border-dashed transition-all duration-300 group-hover:opacity-100"
                    style={{ color: "rgba(212,175,55,0.7)", borderColor: "rgba(212,175,55,0.3)" }}
                  >
                    Cómo cuidar mi producto
                  </span>
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom strip */}
          <div
            className="hidden md:flex absolute bottom-0 left-0 right-0 px-14 md:px-20 py-4 border-t items-center justify-between"
            style={{ borderColor: "rgba(212,175,55,0.1)", background: "#fdfaf5" }}
          >
            <div className="flex gap-1">
              {product.subcategories.map((s, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="font-inter text-[10px] tracking-[0.12em] uppercase whitespace-nowrap transition-all duration-300 px-2 py-1 rounded-full"
                  style={{ color: subIdx === i ? "#d4af37" : "rgba(165,0,89,0.2)", fontWeight: subIdx === i ? 600 : 300 }}
                >
                  {i === subIdx ? s.name : "·"}
                </button>
              ))}
            </div>
            <span className="font-inter text-[10px]" style={{ color: "rgba(165,0,89,0.25)" }}>↕ scroll</span>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      {orderFormOpen && (
        <OrderForm product={product} subcategory={sub} onClose={() => setOrderFormOpen(false)} />
      )}
      {careOpen && (
        <DessertCareModal product={product} onClose={() => setCareOpen(false)} />
      )}
    </>
  );
}