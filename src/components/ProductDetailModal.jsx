import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

export default function ProductDetailModal({ product, onClose }) {
  const [activeSubIdx, setActiveSubIdx] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [imgKey, setImgKey] = useState(0);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const activeSub = product.subcategories[activeSubIdx];
  const total = product.subcategories.length;

  const goTo = (idx) => {
    if (idx === activeSubIdx) return;
    setDirection(idx > activeSubIdx ? 1 : -1);
    setActiveSubIdx(idx);
    setImgKey((k) => k + 1);
  };

  const next = () => goTo((activeSubIdx + 1) % total);
  const prev = () => goTo((activeSubIdx - 1 + total) % total);

  const imageVariants = {
    enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0, scale: 0.95 }),
  };

  const textVariants = {
    enter: (dir) => ({ y: dir > 0 ? 30 : -30, opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit: (dir) => ({ y: dir > 0 ? -30 : 30, opacity: 0 }),
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(253, 250, 245, 0.85)", backdropFilter: "blur(24px)" }}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-[2.5rem] flex flex-col"
        style={{
          background: "rgba(253, 250, 245, 0.95)",
          border: "1px solid rgba(212, 175, 55, 0.15)",
          boxShadow: "0 40px 80px rgba(165, 0, 89, 0.1), 0 10px 30px rgba(212, 175, 55, 0.06)",
        }}
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.96 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
          <button onClick={onClose} className="flex items-center gap-2 group transition-all duration-300 hover:gap-3">
            <ArrowLeft size={18} style={{ color: "#a50059" }} className="transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="font-inter text-sm font-medium" style={{ color: "#a50059" }}>Volver al catálogo</span>
          </button>
          <div className="text-center">
            <p className="font-inter text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: "#d4af37" }}>
              {product.tag}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105"
            style={{ background: "rgba(165, 0, 89, 0.06)" }}
          >
            <X size={16} style={{ color: "#a50059" }} />
          </button>
        </div>

        {/* Product Header */}
        <div className="px-8 pt-6 pb-4">
          <h2 className="font-playfair text-3xl md:text-4xl font-semibold" style={{ color: "#a50059" }}>
            {product.name}
          </h2>
          <p className="font-inter text-base font-light italic mt-1" style={{ color: "#d4af37" }}>
            {product.tagline}
          </p>
          <p className="font-inter text-sm font-light mt-3 max-w-xl leading-relaxed" style={{ color: "rgba(165,0,89,0.55)" }}>
            {product.description}
          </p>
        </div>

        {/* Details pills */}
        <div className="px-8 pb-6 flex flex-wrap gap-3">
          {product.details.map((d) => (
            <div
              key={d.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.12)" }}
            >
              <span className="font-inter text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: "#d4af37" }}>{d.label}</span>
              <span className="font-inter text-xs font-light" style={{ color: "rgba(165,0,89,0.7)" }}>{d.value}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-8 h-[1px] mb-6" style={{ background: "rgba(212,175,55,0.12)" }} />

        {/* Subcategory Nav */}
        <div className="px-8 mb-6">
          <p className="font-inter text-[10px] tracking-[0.35em] uppercase font-medium mb-3" style={{ color: "#d4af37" }}>
            Variedades
          </p>
          <div className="flex gap-2 flex-wrap">
            {product.subcategories.map((sub, i) => (
              <button
                key={sub.name}
                onClick={() => goTo(i)}
                className="px-4 py-2 rounded-full font-inter text-xs font-medium transition-all duration-400"
                style={{
                  background: activeSubIdx === i ? "linear-gradient(135deg, #d4af37, #c49b2f)" : "rgba(212,175,55,0.08)",
                  color: activeSubIdx === i ? "#fdfaf5" : "#a50059",
                  border: `1px solid ${activeSubIdx === i ? "transparent" : "rgba(212,175,55,0.15)"}`,
                  transform: activeSubIdx === i ? "scale(1.04)" : "scale(1)",
                  boxShadow: activeSubIdx === i ? "0 4px 15px rgba(212,175,55,0.25)" : "none",
                }}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>

        {/* CATALOG PAGE - Main display */}
        <div className="px-8 pb-8">
          <div
            className="rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[340px]"
            style={{
              background: "rgba(253,250,245,0.7)",
              border: "1px solid rgba(212,175,55,0.1)",
            }}
          >
            {/* Image side */}
            <div className="relative overflow-hidden min-h-[260px] md:min-h-[340px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.img
                  key={`img-${activeSubIdx}`}
                  src={activeSub.img}
                  alt={activeSub.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  custom={direction}
                  variants={imageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </AnimatePresence>

              {/* Nav arrows on image */}
              <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                <button
                  onClick={prev}
                  className="pointer-events-auto w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ background: "rgba(253,250,245,0.85)", backdropFilter: "blur(10px)" }}
                >
                  <ChevronLeft size={18} style={{ color: "#a50059" }} />
                </button>
                <button
                  onClick={next}
                  className="pointer-events-auto w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ background: "rgba(253,250,245,0.85)", backdropFilter: "blur(10px)" }}
                >
                  <ChevronRight size={18} style={{ color: "#a50059" }} />
                </button>
              </div>

              {/* Page indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {product.subcategories.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className="rounded-full transition-all duration-400"
                    style={{
                      width: activeSubIdx === i ? 20 : 6,
                      height: 6,
                      background: activeSubIdx === i ? "#d4af37" : "rgba(253,250,245,0.7)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Text side */}
            <div className="p-8 md:p-10 flex flex-col justify-between">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`text-${activeSubIdx}`}
                  custom={direction}
                  variants={textVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col h-full"
                >
                  <div>
                    <span
                      className="font-inter text-[10px] tracking-[0.35em] uppercase font-medium"
                      style={{ color: "#d4af37" }}
                    >
                      {activeSub.subtitle}
                    </span>
                    <h3
                      className="font-playfair text-2xl md:text-3xl font-semibold mt-2 mb-4"
                      style={{ color: "#a50059" }}
                    >
                      {activeSub.name}
                    </h3>
                    <p
                      className="font-inter text-sm font-light leading-relaxed"
                      style={{ color: "rgba(165,0,89,0.6)" }}
                    >
                      {activeSub.desc}
                    </p>
                  </div>

                  <div className="mt-8">
                    <div className="flex items-center gap-1 mb-5">
                      <div className="h-[1px] flex-1" style={{ background: "rgba(212,175,55,0.2)" }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-inter text-[10px] tracking-[0.2em] uppercase" style={{ color: "rgba(165,0,89,0.4)" }}>Precio</p>
                        <p className="font-playfair text-xl font-semibold mt-0.5" style={{ color: "#d4af37" }}>
                          {activeSub.price}
                        </p>
                      </div>
                      <a
                        href="https://wa.me/573001234567"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-full font-inter text-xs font-semibold tracking-wide uppercase transition-all duration-400 hover:scale-[1.05] hover:shadow-lg"
                        style={{
                          background: "linear-gradient(135deg, #d4af37, #c49b2f)",
                          color: "#fdfaf5",
                        }}
                      >
                        Pedir por WhatsApp
                      </a>
                    </div>

                    {/* Sub-page counter */}
                    <p className="font-inter text-[10px] mt-5 text-right" style={{ color: "rgba(165,0,89,0.3)" }}>
                      {activeSubIdx + 1} / {total}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}