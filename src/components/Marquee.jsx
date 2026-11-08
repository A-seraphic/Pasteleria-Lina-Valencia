import { motion, useScroll, useTransform, useVelocity, useSpring } from "framer-motion";
import { usePublicCatalog } from "@/data/catalogStore";
import { BRAND_ICONS } from "./fx/BrandIcons";
import { scrollToId } from "@/data/site";

/**
 * Cinta de encaje: borde festoneado como blonda de pastelería, perlas doradas
 * de glaseado y las categorías en letra script. Corre sola y se inclina
 * levemente según la velocidad del scroll.
 */
export default function Marquee() {
  const { categories } = usePublicCatalog();
  const { scrollY } = useScroll();
  const x = useTransform(scrollY, [0, 3000], [0, -220]);
  const velocity = useVelocity(scrollY);
  const skew = useSpring(useTransform(velocity, [-2500, 0, 2500], [4, 0, -4]), { stiffness: 200, damping: 30 });
  if (!categories.length) return null;
  const row = [...categories, ...categories];

  return (
    <div className="relative z-0 pt-8 md:pt-12 pb-8 md:pb-12 overflow-hidden">
      <motion.div className="lace-band" style={{ skewY: skew }}>
        <div aria-hidden className="pearl-row" />
        <motion.div style={{ x }} className="py-3 md:py-4">
          <div className="marquee-track lace-track">
            {[0, 1].map((k) => (
              <div key={k} className="flex items-center shrink-0" aria-hidden={k === 1}>
                {row.map((c, i) => {
                  const Icon = BRAND_ICONS[i % BRAND_ICONS.length];
                  return (
                    <span key={`${k}-${i}`} className="flex items-center">
                      <button
                        tabIndex={k === 1 ? -1 : 0}
                        onClick={() => scrollToId("#catalogo")}
                        className="font-script whitespace-nowrap px-6 md:px-9 text-[38px] md:text-[54px] leading-[1.25] transition-colors hover:text-[var(--lv-fuchsia)]"
                        style={{ color: "var(--lv-wine)" }}
                      >
                        {c.name}
                      </button>
                      <Icon size={26} color="var(--lv-gold)" />
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </motion.div>
        <div aria-hidden className="pearl-row" />
      </motion.div>
    </div>
  );
}
