import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SlideRevealWrapper from "./SlideRevealWrapper";
import { Heart, Sparkles, Leaf } from "lucide-react";

const essenceItems = [
  {
    icon: Heart,
    title: "Hecho con Amor",
    desc: "Cada creación nace de la pasión por el detalle y el cariño por lo artesanal. Nuestros postres llevan el corazón de Lina en cada capa.",
  },
  {
    icon: Sparkles,
    title: "Ingredientes Selectos",
    desc: "Utilizamos solo los ingredientes más finos: vainilla de Madagascar, chocolate belga y frutas de temporada cuidadosamente seleccionadas.",
  },
  {
    icon: Leaf,
    title: "Tradición Renovada",
    desc: "Fusionamos recetas heredadas con técnicas modernas de repostería francesa, creando sabores que evocan recuerdos y sorprenden al paladar.",
  },
];

function EssenceCard({ item, index, progress }) {
  const Icon = item.icon;
  // Cada tarjeta sube a distinta velocidad: sensación de capas en escritorio
  const y = useTransform(progress, [0, 1], [40 * (index + 1), -40 * (index + 1)]);
  return (
    <motion.article
      style={{ y }}
      className="essence-card snap-center shrink-0 w-[82%] sm:w-[60%] md:w-auto relative p-7 md:p-8 rounded-[28px] overflow-hidden"
    >
      <div className="absolute inset-0 -z-10" style={{
        background: "linear-gradient(160deg, rgba(253,250,245,0.92), rgba(248,232,240,0.85))",
        border: "1px solid rgba(212,175,55,0.18)", borderRadius: 28,
        boxShadow: "0 24px 60px -18px rgba(165,0,89,0.18)",
      }} />
      <span aria-hidden className="absolute -top-4 right-3 font-playfair text-[110px] font-semibold leading-none select-none"
        style={{ color: "rgba(212,175,55,0.13)" }}>
        0{index + 1}
      </span>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: "linear-gradient(145deg,#a50059,#6e003c)",
          boxShadow: "0 12px 24px rgba(165,0,89,0.3), inset 0 1px 0 rgba(255,255,255,0.25)",
        }}>
        <Icon size={24} style={{ color: "#f7e3a1" }} />
      </div>
      <h3 className="font-playfair text-[22px] font-semibold mb-3" style={{ color: "#a50059" }}>{item.title}</h3>
      <p className="font-inter text-[14px] leading-relaxed font-light" style={{ color: "rgba(165,0,89,0.6)" }}>{item.desc}</p>
    </motion.article>
  );
}

export default function EssenceSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const desktopProgress = useTransform(scrollYProgress, (v) => (window.innerWidth >= 768 ? v : 0.5));

  return (
    <section ref={ref} id="esencia" className="relative py-20 md:py-36">
      <div className="max-w-5xl mx-auto">
        <SlideRevealWrapper direction="up" className="text-center mb-10 md:mb-16 px-6">
          <span className="font-inter text-[11px] tracking-[0.4em] uppercase font-medium" style={{ color: "#d4af37" }}>
            Lo que nos hace únicos
          </span>
          <h2 className="font-playfair text-[34px] md:text-5xl font-semibold mt-3" style={{ color: "#a50059" }}>
            Nuestra <span className="italic font-normal text-shimmer">Esencia</span>
          </h2>
        </SlideRevealWrapper>

        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory px-6 pb-4 no-scrollbar">
          {essenceItems.map((item, i) => (
            <EssenceCard key={item.title} item={item} index={i} progress={desktopProgress} />
          ))}
        </div>
        <p className="md:hidden text-center font-inter text-[11px] mt-2" style={{ color: "rgba(165,0,89,0.35)" }}>
          Desliza para ver más →
        </p>
      </div>
    </section>
  );
}
