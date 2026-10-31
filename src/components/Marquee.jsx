import { motion, useScroll, useTransform } from "framer-motion";
import { usePublicCatalog } from "@/data/catalogStore";

// Cinta inclinada con las categorías del catálogo; se desplaza sola y con el scroll
export default function Marquee() {
  const { categories } = usePublicCatalog();
  const { scrollY } = useScroll();
  const x = useTransform(scrollY, [0, 3000], [0, -260]);
  const words = categories.map((c) => c.name);
  if (!words.length) return null;
  const row = [...words, ...words];

  return (
    <div className="relative z-10 py-6 md:py-10 overflow-hidden" aria-hidden>
      <motion.div
        className="py-3.5 md:py-5 -rotate-2 -mx-[5%] w-[110%]"
        style={{ background: "linear-gradient(90deg,#a50059,#7d0044)", boxShadow: "0 20px 40px rgba(165,0,89,0.22)" }}
      >
        <motion.div style={{ x }}>
          <div className="marquee-track">
            {[0, 1].map((k) => (
              <div key={k} className="flex items-center shrink-0">
                {row.map((w, i) => (
                  <span key={`${k}-${i}`} className="flex items-center font-playfair italic text-xl md:text-3xl whitespace-nowrap px-5 md:px-8" style={{ color: "#fdfaf5" }}>
                    {w}
                    <span className="ml-10 md:ml-16 text-base not-italic" style={{ color: "#d4af37" }}>✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
