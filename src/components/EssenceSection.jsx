import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal, RevealItem, SplitTitle } from "./fx/Reveal";

const BASE = "https://media.base44.com/images/public/69f9758f7d1c8f8af9a6884c/";

const essenceItems = [
  {
    title: "Hecho con amor",
    desc: "Cada creación nace del detalle y del cariño por lo artesanal. Nuestros postres llevan el corazón de Lina en cada capa.",
    img: `${BASE}13e00a964_icon_personalizadas.png`,
  },
  {
    title: "Ingredientes selectos",
    desc: "Vainilla de Madagascar, chocolate belga y frutas de temporada elegidas a mano, sin atajos ni premezclas.",
    img: `${BASE}0ef810e6b_icon_ponques.png`,
  },
  {
    title: "Tradición renovada",
    desc: "Recetas heredadas con técnicas de repostería francesa: sabores que recuerdan a casa y sorprenden en la mesa.",
    img: `${BASE}7c3e75a0b_icon_postres.png`,
  },
];

function EssenceRow({ item, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const flip = index % 2 === 1;

  return (
    <Reveal as="article" className={`grid md:grid-cols-2 gap-6 md:gap-16 items-center ${flip ? "md:[&>*:first-child]:order-2" : ""}`}>
      <RevealItem y={40}>
        <div ref={ref} className="relative aspect-[5/4] md:aspect-[4/3] rounded-[26px] md:rounded-[34px] overflow-hidden" style={{ background: "var(--lv-blush)" }}>
          <motion.img src={item.img} alt="" loading="lazy" className="absolute inset-0 w-full h-[120%] -top-[10%] object-cover" style={{ y: imgY }} />
        </div>
      </RevealItem>
      <div>
        <RevealItem as="h3" className="font-display font-semibold text-[36px] md:text-[56px] leading-[1]" style={{ color: "var(--lv-wine)" }}>
          {item.title}
        </RevealItem>
        <RevealItem as="p" className="font-inter text-[17px] md:text-[19px] leading-relaxed mt-4 max-w-[38ch]" style={{ color: "var(--lv-ink)" }}>
          {item.desc}
        </RevealItem>
      </div>
    </Reveal>
  );
}

export default function EssenceSection() {
  return (
    <section id="esencia" className="relative py-20 md:py-32">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        <SplitTitle lines={["Lo que nos", "hace distintos"]} className="font-display font-semibold text-[44px] md:text-[84px] leading-[0.98] mb-12 md:mb-20" />
        <div className="space-y-16 md:space-y-28">
          {essenceItems.map((item, i) => (
            <EssenceRow key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
