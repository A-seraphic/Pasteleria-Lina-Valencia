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

export default function EssenceSection() {
  return (
    <section id="esencia" className="relative py-28 md:py-36 px-6">
      <div className="max-w-5xl mx-auto">
        <SlideRevealWrapper direction="up" className="text-center mb-16">
          <span
            className="font-inter text-xs tracking-[0.4em] uppercase font-medium"
            style={{ color: "#d4af37" }}
          >
            Lo que nos hace únicos
          </span>
          <h2
            className="font-playfair text-4xl md:text-5xl font-semibold mt-3"
            style={{ color: "#a50059" }}
          >
            Nuestra Esencia
          </h2>
          <div
            className="w-16 h-[1px] mx-auto mt-6"
            style={{ background: "#d4af37" }}
          />
        </SlideRevealWrapper>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {essenceItems.map((item, i) => {
            const Icon = item.icon;
            const directions = ["left", "up", "right"];
            return (
              <SlideRevealWrapper
                key={item.title}
                direction={directions[i]}
                delay={i * 0.15}
              >
                <div
                  className="relative p-8 rounded-3xl text-center transition-all duration-500 hover:scale-[1.02]"
                  style={{
                    background: "rgba(253, 250, 245, 0.6)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(212, 175, 55, 0.12)",
                    boxShadow: "0 8px 40px rgba(165, 0, 89, 0.04)",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    style={{ background: "rgba(212, 175, 55, 0.1)" }}
                  >
                    <Icon size={24} style={{ color: "#d4af37" }} />
                  </div>
                  <h3
                    className="font-playfair text-xl font-semibold mb-3"
                    style={{ color: "#a50059" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="font-inter text-sm leading-relaxed font-light"
                    style={{ color: "rgba(165, 0, 89, 0.55)" }}
                  >
                    {item.desc}
                  </p>
                </div>
              </SlideRevealWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}