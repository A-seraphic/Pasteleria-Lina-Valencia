import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Camera, Sparkles } from "lucide-react";
import { scrollToId } from "@/data/site";
import { usePublicCatalog } from "@/data/catalogStore";

const HERO_IMG = "https://media.base44.com/images/public/69f9758f7d1c8f8af9a6884c/b8c1349ab_generated_82178631.png";
const EASE = [0.22, 1, 0.36, 1];
const START = 1.9; // espera a que termine la pantalla de carga

const STATS = [
  { value: "100%", label: "Artesanal" },
  { value: "+15", label: "Rellenos" },
  { value: "3D", label: "Tamaño real" },
];

// Elementos flotantes en capas: cada uno se mueve a distinta velocidad al hacer scroll
const FLOATERS = [
  { x: "6%", y: "18%", size: 54, depth: -90, kind: "ring" },
  { x: "84%", y: "12%", size: 22, depth: -160, kind: "pearl" },
  { x: "90%", y: "58%", size: 70, depth: -60, kind: "ring" },
  { x: "12%", y: "72%", size: 16, depth: -200, kind: "pearl" },
  { x: "70%", y: "86%", size: 26, depth: -120, kind: "heart" },
];

function Floater({ f, progress }) {
  const y = useTransform(progress, [0, 1], [0, f.depth]);
  const rotate = useTransform(progress, [0, 1], [0, f.depth / 3]);
  const common = { position: "absolute", left: f.x, top: f.y, width: f.size, height: f.size, y, rotate };
  if (f.kind === "ring")
    return <motion.div aria-hidden style={{ ...common, borderRadius: "50%", border: "1.5px solid rgba(212,175,55,0.35)" }} />;
  if (f.kind === "pearl")
    return (
      <motion.div aria-hidden
        style={{ ...common, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #fff8dc, #d4af37 55%, #9c7a1e)", boxShadow: "0 8px 18px rgba(156,122,30,0.35)" }} />
    );
  return (
    <motion.svg aria-hidden viewBox="0 0 24 24" style={common}>
      <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.5 5c2 0 3.6 1.1 4.5 2.6C12 6.1 13.5 5 15.5 5 19 5 21.1 8.4 21.6 11.8 19.5 16.4 12 21 12 21z"
        fill="rgba(165,0,89,0.18)" />
    </motion.svg>
  );
}

export default function HeroSection() {
  const ref = useRef(null);
  const { categories } = usePublicCatalog();
  const fromPrice = categories[0]?.price;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Al bajar, la foto se inclina hacia atrás y se aleja (efecto 3D)
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 22]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Inclinación con el puntero o el dedo sobre la foto
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const tiltX = useSpring(useTransform(py, [-0.5, 0.5], [10, -10]), { stiffness: 140, damping: 16 });
  const tiltY = useSpring(useTransform(px, [-0.5, 0.5], [-12, 12]), { stiffness: 140, damping: 16 });
  const shineX = useTransform(px, [-0.5, 0.5], ["0%", "100%"]);

  const onPoint = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => { px.set(0); py.set(0); };

  return (
    <section ref={ref} id="inicio" className="relative min-h-[100svh] flex items-center overflow-hidden pt-24 pb-14 md:pt-28 px-5 md:px-6">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {FLOATERS.map((f, i) => <Floater key={i} f={f} progress={scrollYProgress} />)}
      </div>

      <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
        {/* Texto */}
        <motion.div className="flex flex-col items-center lg:items-start text-center lg:text-left" style={{ y: textY, opacity: fade }}>
          <motion.span
            className="inline-flex items-center gap-2 font-inter text-[10.5px] md:text-xs tracking-[0.35em] uppercase font-semibold mb-5 px-4 py-2 rounded-full"
            style={{ color: "#a50059", background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.3)" }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: START }}
          >
            <Sparkles size={12} style={{ color: "#d4af37" }} /> Pastelería de autor
          </motion.span>

          <h1 className="font-playfair text-[44px] leading-[1.04] sm:text-6xl lg:text-[76px] font-semibold mb-5" style={{ color: "#a50059" }}>
            {["Donde cada", "bocado cuenta", "una historia"].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-1">
                <motion.span
                  className="block"
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.1, ease: EASE, delay: START + 0.1 + i * 0.12 }}
                >
                  {i === 1 ? (
                    <><span className="italic font-normal text-shimmer">bocado</span> cuenta</>
                  ) : line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="font-inter text-[15px] md:text-lg font-light leading-relaxed max-w-md mb-7"
            style={{ color: "rgba(165,0,89,0.62)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: START + 0.5 }}
          >
            Tortas y postres hechos a mano, a tu medida. Elige sabores y rellenos, mira cuántas porciones salen y pruébala en tu mesa con la cámara.
          </motion.p>

          <motion.div className="flex flex-wrap justify-center lg:justify-start gap-3"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: START + 0.6 }}>
            <button
              onClick={() => scrollToId("#catalogo")}
              className="px-7 py-4 rounded-full font-inter text-[13px] font-semibold tracking-[0.12em] uppercase active:scale-95 transition-transform shadow-[0_14px_30px_rgba(165,0,89,0.28)]"
              style={{ background: "linear-gradient(135deg, #a50059, #7d0044)", color: "#fdfaf5" }}
            >
              Ver catálogo
            </button>
            <button
              onClick={() => scrollToId("#porciones")}
              className="flex items-center gap-2 px-6 py-4 rounded-full font-inter text-[13px] font-semibold tracking-wide active:scale-95 transition-transform"
              style={{ color: "#a50059", background: "rgba(253,250,245,0.8)", border: "1px solid rgba(212,175,55,0.4)", backdropFilter: "blur(10px)" }}
            >
              <Camera size={15} style={{ color: "#d4af37" }} /> Tamaño real
            </button>
          </motion.div>

          <motion.dl className="grid grid-cols-3 gap-2 mt-9 w-full max-w-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: START + 0.9 }}>
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl py-3 text-center"
                style={{ background: "rgba(253,250,245,0.65)", border: "1px solid rgba(212,175,55,0.18)", backdropFilter: "blur(10px)" }}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-playfair text-2xl font-semibold leading-none" style={{ color: "#a50059" }}>{s.value}</dd>
                <dd className="font-inter text-[10px] tracking-[0.18em] uppercase mt-1.5" style={{ color: "#b8912a" }}>{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* Foto con profundidad */}
        <motion.div
          className="relative flex justify-center"
          style={{ perspective: 1100, y: imgY }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: EASE, delay: START + 0.2 }}
        >
          <motion.div style={{ rotateX, scale, transformStyle: "preserve-3d" }}>
            <motion.div
              onPointerMove={onPoint}
              onPointerLeave={reset}
              className="relative w-[78vw] max-w-[360px] aspect-[4/5] md:w-96 rounded-[2.5rem] overflow-hidden touch-pan-y"
              style={{
                rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d",
                boxShadow: "0 50px 90px -20px rgba(165,0,89,0.35), 0 18px 36px rgba(212,175,55,0.12)",
              }}
            >
              <img src={HERO_IMG} alt="Torta artesanal de tres pisos con flores de azúcar" className="w-full h-full object-cover scale-[1.06]" />
              <motion.div aria-hidden className="absolute inset-0 mix-blend-soft-light"
                style={{ background: "radial-gradient(circle at var(--sx) 20%, rgba(255,255,255,0.7), transparent 45%)", "--sx": shineX }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 55%, rgba(84,0,45,0.35))" }} />
              <div className="absolute left-4 right-4 bottom-4 flex items-center justify-between" style={{ transform: "translateZ(40px)" }}>
                <span className="font-playfair italic text-lg text-white drop-shadow">Hecha a pedido</span>
                <span className="font-inter text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(253,250,245,0.9)", color: "#a50059" }}>Signature</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Insignia flotante con el precio de la primera categoría */}
          {fromPrice && <motion.div
            className="absolute -left-1 top-8 md:-left-6 rounded-2xl px-3.5 py-2.5 font-inter"
            style={{ background: "rgba(253,250,245,0.92)", backdropFilter: "blur(12px)", border: "1px solid rgba(212,175,55,0.3)", boxShadow: "0 16px 30px rgba(165,0,89,0.14)" }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <p className="text-[10px] tracking-[0.18em] uppercase" style={{ color: "#b8912a" }}>{categories[0].name}</p>
            <p className="font-playfair text-lg font-semibold leading-none" style={{ color: "#a50059" }}>{fromPrice}</p>
          </motion.div>}
        </motion.div>
      </div>

      {/* Indicador de scroll */}
      <motion.div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2" style={{ opacity: fade }}>
        <span className="font-inter text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(165,0,89,0.4)" }}>Desliza</span>
        <span className="w-[1px] h-10 overflow-hidden" style={{ background: "rgba(212,175,55,0.25)" }}>
          <motion.span className="block w-full h-1/2" style={{ background: "#d4af37" }} animate={{ y: ["-100%", "200%"] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
        </span>
      </motion.div>
    </section>
  );
}
