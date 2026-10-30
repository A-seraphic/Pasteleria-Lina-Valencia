/**
 * CatalogCard — editorial, minimal, elevated on hover.
 * - Compact body: tight padding, no variety count
 * - Progressive shadow on hover
 */
export default function CatalogCard({ product, isHovered, isFaded, onHover, onLeave, onClick }) {
  return (
    <div
      className="catalog-card rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer"
      style={{
        background: "rgba(253,250,245,0.72)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(212,175,55,0.09)",
        boxShadow: isHovered
          ? "0 20px 56px rgba(165,0,89,0.13), 0 6px 18px rgba(212,175,55,0.08)"
          : "0 2px 10px rgba(165,0,89,0.04)",
        transform: isHovered ? "translateY(-7px)" : "translateY(0)",
        filter: isFaded ? "blur(1.5px)" : "none",
        opacity: isFaded ? 0.55 : 1,
        transition: "box-shadow 0.35s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease, filter 0.35s ease",
        willChange: "transform",
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* Image — square on mobile, 5/4 on md+ */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
        <style>{`
          @media (min-width: 768px) { .catalog-card .catalog-img-wrap { aspect-ratio: 5/4 !important; } }
        `}</style>
        <div className="catalog-img-wrap absolute inset-0">
          <img
            src={product.img}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700"
            style={{ transform: isHovered ? "scale(1.06)" : "scale(1)" }}
          />
        </div>
        {/* Soft bottom fade */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent 55%, rgba(253,250,245,0.38))" }}
        />
        {/* Tag pill — sm+ only */}
        <div
          className="hidden sm:block absolute top-2.5 left-2.5 px-2.5 py-[3px] rounded-full font-inter text-[9px] font-semibold tracking-[0.14em] uppercase"
          style={{ background: "rgba(253,250,245,0.9)", backdropFilter: "blur(8px)", color: "#d4af37" }}
        >
          {product.tag}
        </div>
      </div>

      {/* Body — ultra-compact */}
      <div className="px-3 pt-2.5 pb-3 md:px-4 md:pt-3 md:pb-4">
        <h3
          className="font-playfair text-[13px] md:text-base font-semibold leading-snug"
          style={{ color: "#a50059" }}
        >
          {product.name}
        </h3>

        {/* Tagline — md+ */}
        <p className="hidden md:block font-inter text-[11px] font-light italic mt-0.5 mb-3" style={{ color: "#d4af37" }}>
          {product.tagline}
        </p>

        <div className="flex items-center justify-between mt-1.5 md:mt-0">
          <span className="font-inter text-[11px] md:text-xs font-semibold" style={{ color: "#d4af37" }}>
            {product.price}
          </span>
          <button
            className="px-2.5 md:px-4 py-1 md:py-1.5 rounded-full font-inter text-[9px] md:text-[11px] font-semibold tracking-wide uppercase transition-all duration-300 hover:scale-[1.05]"
            style={{ background: "rgba(212,175,55,0.09)", color: "#a50059", border: "1px solid rgba(212,175,55,0.18)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg,#d4af37,#c49b2f)";
              e.currentTarget.style.color = "#fdfaf5";
              e.currentTarget.style.borderColor = "transparent";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(212,175,55,0.09)";
              e.currentTarget.style.color = "#a50059";
              e.currentTarget.style.borderColor = "rgba(212,175,55,0.18)";
            }}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            <span className="hidden sm:inline">Ver</span>
            <span className="sm:hidden">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}