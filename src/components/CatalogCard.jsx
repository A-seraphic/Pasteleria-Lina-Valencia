import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Box } from "lucide-react";

/**
 * Tarjeta de categoría: foto protagonista con inclinación 3D y brillo que sigue al puntero.
 * featured: la primera del catálogo, más grande y con su descripción.
 */
export default function CatalogCard({ product, featured, onClick }) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [6, -6]), { stiffness: 180, damping: 18 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-8, 8]), { stiffness: 180, damping: 18 });
  const glare = useTransform([px, py], ([x, y]) => `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.4), transparent 50%)`);
  const has3D = product.subcategories?.some((s) => s.ar);

  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };

  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <motion.button
        type="button"
        onClick={onClick}
        onPointerMove={onMove}
        onPointerLeave={() => { px.set(0.5); py.set(0.5); }}
        whileTap={{ scale: 0.97 }}
        aria-label={`Ver ${product.name}`}
        className="group relative w-full h-full flex flex-col text-left"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <div className={`relative w-full overflow-hidden rounded-[22px] md:rounded-[28px] ${featured ? "aspect-[16/11] md:aspect-auto md:flex-1 md:min-h-[420px]" : "aspect-[4/5]"}`}
          style={{ background: "var(--lv-blush)" }}>
          <img src={product.img} alt="" loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] md:group-hover:scale-[1.07]" />
          <motion.div aria-hidden className="absolute inset-0 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: glare }} />
          {has3D && (
            <span className="absolute top-3 right-3 h-8 px-3 rounded-full flex items-center gap-1.5 font-inter text-[12px] font-semibold"
              style={{ background: "var(--lv-cream)", color: "var(--lv-wine)", transform: "translateZ(30px)" }}>
              <Box size={13} style={{ color: "var(--lv-gold)" }} /> 3D
            </span>
          )}
          <span className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-500 md:group-hover:rotate-45"
            style={{ background: "var(--lv-wine)", color: "var(--lv-cream)", transform: "translateZ(40px)" }}>
            <ArrowUpRight size={18} />
          </span>
        </div>

        <div className="pt-3 md:pt-4 px-1" style={{ transform: "translateZ(20px)" }}>
          <h3 className={`font-display font-semibold leading-tight ${featured ? "text-[28px] md:text-[40px]" : "text-[19px] md:text-[24px]"}`} style={{ color: "var(--lv-wine)" }}>
            {product.name}
          </h3>
          {featured && product.shortDesc && (
            <p className="font-inter text-[15px] mt-1.5 max-w-[42ch]" style={{ color: "var(--lv-ink)" }}>{product.shortDesc}</p>
          )}
          <p className="font-inter text-[14px] md:text-[15px] mt-1" style={{ color: "#8a6a1f" }}>
            {product.price}
            <span className="block md:inline md:before:content-['_·_'] text-[13px] md:text-[15px]" style={{ color: "rgba(74,0,40,0.55)" }}>
              {product.subcategories?.length || 0} diseños
            </span>
          </p>
        </div>
      </motion.button>
    </div>
  );
}
