import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

const ABOUT_IMG_DESKTOP = "https://media.base44.com/images/public/69f9758f7d1c8f8af9a6884c/b23739b26_WhatsAppImage2026-09-10at65525PM.jpeg";
const ABOUT_IMG_MOBILE = "https://media.base44.com/images/public/69f9758f7d1c8f8af9a6884c/45544a097_ChatGPTImage10sept202610_09_38pm.png";

export default function AboutSection() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="nosotros"
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ minHeight: "80vh" }}
    >
      <div className="flex flex-col md:flex-row" style={{ minHeight: "80vh" }}>

        {/* ── LEFT: Image reveal ── */}
        <div className="relative w-full md:w-[45%] flex-shrink-0 overflow-hidden" style={{ minHeight: "55vw", maxHeight: "90vh" }}>
          <motion.img
            src={ABOUT_IMG_DESKTOP}
            alt="Lina Valencia en su taller de pastelería"
            className="absolute inset-0 w-full h-full object-cover hidden md:block"
            initial={{ scale: 1.12, x: -40, opacity: 0 }}
            animate={visible ? { scale: 1, x: 0, opacity: 1 } : {}}
            transition={{ duration: 1.3, ease: EASE }}
          />
          <motion.img
            src={ABOUT_IMG_MOBILE}
            alt="Lina Valencia en su taller de pastelería"
            className="absolute inset-0 w-full h-full object-cover md:hidden"
            initial={{ scale: 1.12, x: -40, opacity: 0 }}
            animate={visible ? { scale: 1, x: 0, opacity: 1 } : {}}
            transition={{ duration: 1.3, ease: EASE }}
          />
          {/* Reveal mask that slides away */}
          <motion.div
            className="absolute inset-0 z-10"
            style={{ background: "var(--lv-cream)", transformOrigin: "left" }}
            initial={{ scaleX: 1 }}
            animate={visible ? { scaleX: 0 } : {}}
            transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
          />
          {/* Soft edge gradient */}
          <div
            className="absolute inset-0 z-20 hidden md:block"
            style={{ background: "linear-gradient(to right, transparent 70%, var(--lv-cream) 100%)" }}
          />
          {/* Gold accent bar */}
          <motion.div
            className="absolute bottom-0 left-0 w-1 z-20"
            style={{ background: "linear-gradient(to bottom, transparent, #d4af37)", height: "40%" }}
            initial={{ scaleY: 0, transformOrigin: "bottom" }}
            animate={visible ? { scaleY: 1 } : {}}
            transition={{ duration: 0.9, ease: EASE, delay: 0.6 }}
          />
        </div>

        {/* ── RIGHT: Text ── */}
        <div
          className="relative w-full md:w-[55%] flex items-center"
          style={{ background: "var(--lv-cream)" }}
        >
          <div className="px-6 md:px-16 lg:px-24 py-16 md:py-20 max-w-2xl">
            {/* Heading */}
            <motion.h2
              className="font-display text-[44px] md:text-6xl lg:text-7xl font-semibold leading-[1] mb-6"
              style={{ color: "#a50059" }}
              initial={{ opacity: 0, y: 20 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, ease: EASE, delay: 0.52 }}
            >
              Arte que nace
              <br />
              <span className="italic font-normal" style={{ color: "#d4af37" }}>del amor</span>
            </motion.h2>

            {/* Divider */}
            <motion.div
              className="h-[1px] mb-8"
              style={{ background: "linear-gradient(to right, #d4af37, transparent)", width: 60 }}
              initial={{ scaleX: 0, transformOrigin: "left" }}
              animate={visible ? { scaleX: 1 } : {}}
              transition={{ duration: 0.6, ease: EASE, delay: 0.62 }}
            />

            {/* Paragraph 1 */}
            <motion.p
              className="font-inter text-[17px] md:text-[18px] leading-relaxed mb-5"
              style={{ color: "var(--lv-ink)" }}
              initial={{ opacity: 0, y: 18 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE, delay: 0.7 }}
            >
              Todo comenzó con una receta heredada, una cocina pequeña y una pasión desbordante.
              Lina Valencia fundó su pastelería con la convicción de que cada postre puede
              convertirse en un momento memorable — un sabor que se recuerda para siempre.
            </motion.p>

            {/* Paragraph 2 */}
            <motion.p
              className="font-inter text-[17px] md:text-[18px] leading-relaxed mb-10"
              style={{ color: "var(--lv-ink)" }}
              initial={{ opacity: 0, y: 18 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE, delay: 0.82 }}
            >
              Hoy, cada creación lleva consigo décadas de técnica francesa, ingredientes
              seleccionados con cuidado y el alma artesanal de quien hornea con intención.
              No producimos en serie — cada pieza es única, como el momento que celebras.
            </motion.p>

            {/* Signature */}
            <motion.div
              className="flex items-center gap-5"
              initial={{ opacity: 0, y: 14 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, ease: EASE, delay: 0.95 }}
            >
              <div>
                <p
                  className="font-playfair text-xl italic"
                  style={{ color: "#a50059" }}
                >
                  Lina Valencia
                </p>
                <p
                  className="font-inter text-[10px] tracking-[0.25em] uppercase mt-0.5"
                  style={{ color: "rgba(212,175,55,0.7)" }}
                >
                  Fundadora & Chef Pastelera
                </p>
              </div>
              <a
                href="#catalogo"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.querySelector("#catalogo");
                  if (!el) return;
                  const y = el.getBoundingClientRect().top + window.scrollY;
                  if (window.smoothScrollTo) {
                    window.smoothScrollTo(y);
                  } else {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="ml-auto px-6 py-3 rounded-full font-inter text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-400 hover:scale-[1.04]"
                style={{
                  background: "rgba(212,175,55,0.09)",
                  border: "1px solid rgba(212,175,55,0.22)",
                  color: "#a50059",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg,#d4af37,#c49b2f)";
                  e.currentTarget.style.color = "#fdfaf5";
                  e.currentTarget.style.borderColor = "transparent";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(212,175,55,0.09)";
                  e.currentTarget.style.color = "#a50059";
                  e.currentTarget.style.borderColor = "rgba(212,175,55,0.22)";
                }}
              >
                Ver catálogo
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}