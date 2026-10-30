import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import SlideRevealWrapper from "./SlideRevealWrapper";
import SubcatalogView from "./SubcatalogView";
import CategoryGallery from "./CategoryGallery";
import CatalogCard from "./CatalogCard";
import { CATALOG } from "../data/catalogData";

export default function CatalogSection() {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [openProduct, setOpenProduct] = useState(null); // gallery state
  const [detail, setDetail] = useState(null); // book detail state

  const handleOpen = (product, idx) => {
    setOpenProduct({ product, productIdx: idx });
    setDetail(null);
  };
  const handleSelectProduct = (subIdx) => {
    if (!openProduct) return;
    setDetail({ ...openProduct, subIdx });
  };

  return (
    <>
      <section id="catalogo" className="relative py-20 md:py-28 lg:py-36 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <SlideRevealWrapper direction="up" className="text-center mb-10 md:mb-16">
            <span className="font-inter text-xs tracking-[0.4em] uppercase font-medium" style={{ color: "#d4af37" }}>
              Nuestras Creaciones
            </span>
            <h2 className="font-playfair text-4xl md:text-5xl font-semibold mt-3" style={{ color: "#a50059" }}>
              Catálogo
            </h2>
            <div className="w-16 h-[1px] mx-auto mt-6" style={{ background: "#d4af37" }} />
          </SlideRevealWrapper>

          {/*
            Grid breakpoints:
              mobile  < 768px  → 2 cols, gap-2.5  (compact cards)
              tablet  768–1024 → 3 cols, gap-5
              desktop > 1024px → 4 cols, gap-5
          */}
          <style>{`
            #catalog-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; transition: all 0.3s ease; }
            @media (min-width: 768px)  { #catalog-grid { grid-template-columns: repeat(3,1fr); gap: 20px; } }
            @media (min-width: 1024px) { #catalog-grid { grid-template-columns: repeat(4,1fr); gap: 20px; } }
          `}</style>
          <div id="catalog-grid">

            {CATALOG.map((product, i) => (
              <SlideRevealWrapper key={product.id} direction="up" delay={i * 0.055}>
                <CatalogCard
                  product={product}
                  index={i}
                  isHovered={hoveredIdx === i}
                  isFaded={hoveredIdx !== null && hoveredIdx !== i}
                  onHover={() => setHoveredIdx(i)}
                  onLeave={() => setHoveredIdx(null)}
                  onClick={() => handleOpen(product, i)}
                />
              </SlideRevealWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Category gallery overlay */}
      <AnimatePresence>
        {openProduct && !detail && (
          <CategoryGallery
            key={`gallery-${openProduct.productIdx}`}
            product={openProduct.product}
            productIdx={openProduct.productIdx}
            onSelect={handleSelectProduct}
            onBack={() => setOpenProduct(null)}
          />
        )}
      </AnimatePresence>

      {/* Immersive book detail overlay */}
      <AnimatePresence>
        {detail && (
          <SubcatalogView
            key={`detail-${detail.productIdx}-${detail.subIdx}`}
            product={detail.product}
            productIdx={detail.productIdx}
            initialSubIdx={detail.subIdx}
            onBack={() => setDetail(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}