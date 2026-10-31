import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Box } from "lucide-react";

/**
 * CatalogCard — tarjeta con inclinación 3D y brillo que sigue al puntero.
 * En pantallas táctiles no hay estados hover que se queden pegados.
 */
export default function CatalogCard({ product, isHovered, isFaded, onHover, onLeave, onClick }) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [7, -7]), { stiffness: 180, damping: 18 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-9, 9]), { stiffness: 180, damping: 18 });
  const glare = useTransform([px, py], ([x, y]) => `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.45), transparent 55%)`);
  const has3D = product.subcategories?.some((s) => s.ar);

  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onOut = () => { px.set(0.5); py.set(0.5); onLeave?.(); };

  return (
    <div style={{ perspective: 900 }}>
      <motion.button
        type="button"
        className="catalog-card group relative w-full text-left rounded-[22px] md:rounded-3xl overflow-hidden"
        style={{
          rotateX, rotateY, transformStyle: "preserve-3d",
          background: "rgba(253,250,245,0.78)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(212,175,55,0.14)",
          boxShadow: isHovered
            ? "0 28px 60px -12px rgba(165,0,89,0.28), 0 8px 20px rgba(212,175,55,0.12)"
            : "0 6px 22px rgba(165,0,89,0.07)",
          opacity: isFaded ? 0.6 : 1,
          transition: "box-shadow .4s ease, opacity .35s ease",
        }}
        onPointerMove={onMove}
        onPointerEnter={(e) => e.pointerType === "mouse" && onHover?.()}
        onPointerLeave={onOut}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        aria-label={`Ver ${product.name}`}
      >
        <div className="relative overflow-hidden aspect-square md:aspect-[5/4]">
          <img
            src={product.img}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out md:group-hover:scale-[1.08]"
          />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, transparent 50%, rgba(84,0,45,0.32))" }} />
          <motion.div className="absolute inset-0 pointer-events-none hidden md:block opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: glare }} />

          {product.tag && (
            <span className="absolute top-2.5 left-2.5 px-2.5 py-[3px] rounded-full font-inter text-[9px] font-semibold tracking-[0.14em] uppercase"
              style={{ background: "rgba(253,250,245,0.92)", color: "#b8912a", transform: "translateZ(30px)" }}>
              {product.tag}
            </span>
          )}
          {has3D && (
            <span className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center"
              title="Disponible en 3D" style={{ background: "rgba(165,0,89,0.88)", color: "#fdfaf5" }}>
              <Box size={13} />
            </span>
          )}
          <span className="absolute bottom-2.5 left-3 font-inter text-[10px] tracking-[0.12em] uppercase text-white/90">
            {product.subcategories?.length || 0} opciones
          </span>
        </div>

        <div className="px-3 pt-2.5 pb-3 md:px-4 md:pt-3.5 md:pb-4" style={{ transform: "translateZ(20px)" }}>
          <h3 className="font-playfair text-[15px] md:text-lg font-semibold leading-tight" style={{ color: "#a50059" }}>
            {product.name}
          </h3>
          <p className="hidden md:block font-inter text-[11px] font-light italic mt-0.5" style={{ color: "#b8912a" }}>
            {product.tagline}
          </p>
          <div className="flex items-center justify-between mt-2 md:mt-3 gap-2">
            <span className="font-inter text-[11px] md:text-xs font-semibold truncate" style={{ color: "#b8912a" }}>
              {product.price}
            </span>
            <span className="w-7 h-7 md:w-8 md:h-8 shrink-0 rounded-full flex items-center justify-center transition-colors md:group-hover:bg-[#a50059] md:group-hover:text-[#fdfaf5]"
              style={{ background: "rgba(212,175,55,0.14)", color: "#a50059" }}>
              <ArrowUpRight size={15} />
            </span>
          </div>
        </div>
      </motion.button>
    </div>
  );
}
