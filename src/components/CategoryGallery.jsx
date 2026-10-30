import { motion } from "framer-motion";
import { ArrowLeft, Eye } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

/**
 * CategoryGallery — elegant product-card gallery for one category.
 * Clicking a card opens the book-style detail view on that product.
 */
export default function CategoryGallery({ product, productIdx, onSelect, onBack }) {
  return (
    <motion.div
      className="fixed inset-0 z-30 overflow-y-auto font-inter"
      style={{ background: "#fdfaf5" }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <style>{`
        .gallery-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        @media (min-width: 768px)  { .gallery-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; } }
        @media (min-width: 1024px) { .gallery-grid { grid-template-columns: repeat(4, 1fr); gap: 24px; } }
        .gallery-card { transition: transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.5s cubic-bezier(0.22,1,0.36,1); }
        .gallery-card:hover { transform: translateY(-8px); box-shadow: 0 24px 56px rgba(165,0,89,0.16), 0 8px 24px rgba(212,175,55,0.1) !important; }
        .gallery-card:hover .gallery-img { transform: scale(1.08); }
        .gallery-img { transition: transform 0.7s cubic-bezier(0.22,1,0.36,1); }
        .gallery-card:hover .gallery-cta { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* Back button */}
      <button
        onClick={onBack}
        className="fixed top-5 left-5 z-10 flex items-center gap-2 group"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{ background: "rgba(253,250,245,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(212,175,55,0.25)", boxShadow: "0 4px 16px rgba(165,0,89,0.08)" }}
        >
          <ArrowLeft size={17} style={{ color: "#a50059" }} />
        </div>
        <span className="font-inter text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: "#a50059" }}>
          Categorías
        </span>
      </button>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-20 md:pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="font-inter text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: "rgba(165,0,89,0.4)" }}>Catálogo</span>
            <span style={{ color: "rgba(212,175,55,0.5)" }}>›</span>
            <span className="font-inter text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: "#d4af37" }}>{product.tag}</span>
          </div>
          <h2 className="font-playfair text-3xl md:text-5xl font-semibold" style={{ color: "#a50059" }}>
            {product.name}
          </h2>
          <div className="w-12 h-[1px] mx-auto mt-5" style={{ background: "#d4af37" }} />
          <p className="font-inter text-xs md:text-sm font-light mt-4 max-w-md mx-auto" style={{ color: "rgba(165,0,89,0.5)" }}>
            Selecciona una creación para ver su detalle
          </p>
        </div>

        {/* Cards grid */}
        <div className="gallery-grid">
          {product.subcategories.map((sub, i) => (
            <motion.div
              key={`${product.id}-${i}`}
              className="gallery-card relative rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer"
              style={{
                background: "rgba(253,250,245,0.7)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(212,175,55,0.12)",
                boxShadow: "0 4px 20px rgba(165,0,89,0.06)",
              }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.06 * i }}
              onClick={() => onSelect(i)}
            >
              {/* Image */}
              <div className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
                <img
                  src={sub.img}
                  alt={sub.name}
                  className="gallery-img w-full h-full object-cover"
                  draggable={false}
                />
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 45%)" }} />
                <div
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-full font-inter text-[9px] font-semibold tracking-[0.16em] uppercase"
                  style={{ background: "rgba(253,250,245,0.88)", backdropFilter: "blur(10px)", color: "#d4af37" }}
                >
                  {i + 1}
                </div>
              </div>

              {/* Body */}
              <div className="p-3 md:p-4">
                <h3 className="font-playfair text-sm md:text-base font-semibold leading-snug" style={{ color: "#a50059" }}>
                  {sub.name}
                </h3>
                <p className="font-inter text-[10px] md:text-[11px] italic font-light mt-0.5 line-clamp-1" style={{ color: "#d4af37" }}>
                  {sub.subtitle}
                </p>
                <div className="flex items-center justify-between mt-2.5 md:mt-3">
                  <span className="font-playfair text-sm md:text-base font-semibold" style={{ color: "#d4af37" }}>
                    {sub.price}
                  </span>
                  <div
                    className="gallery-cta flex items-center gap-1.5 px-3 py-1.5 rounded-full font-inter text-[9px] md:text-[10px] font-semibold tracking-[0.12em] uppercase"
                    style={{
                      background: "linear-gradient(135deg, #a50059, #8a004c)",
                      color: "#fdfaf5",
                      opacity: 0,
                      transform: "translateY(4px)",
                      transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
                    }}
                  >
                    <Eye size={11} />
                    Ver
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}