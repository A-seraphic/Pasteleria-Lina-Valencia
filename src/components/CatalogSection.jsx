import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import SubcatalogView from "./SubcatalogView";
import CategoryGallery from "./CategoryGallery";
import CatalogCard from "./CatalogCard";
import { Reveal, RevealItem, SplitTitle } from "./fx/Reveal";
import { usePublicCatalog } from "@/data/catalogStore";

export default function CatalogSection() {
  const { categories } = usePublicCatalog();
  const [openProduct, setOpenProduct] = useState(null); // galería de la categoría
  const [detail, setDetail] = useState(null); // ficha del producto

  const handleOpen = (product, idx) => {
    setOpenProduct({ product, productIdx: idx });
    setDetail(null);
  };
  const handleSelectProduct = (subIdx) => {
    if (!openProduct) return;
    setDetail({ ...openProduct, subIdx });
  };
  const total = categories.reduce((n, c) => n + c.subcategories.length, 0);

  return (
    <>
      <section id="catalogo" className="relative py-20 md:py-32">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10">
          <div className="grid md:grid-cols-[1fr_auto] gap-5 md:items-end mb-8 md:mb-12">
            <SplitTitle lines={["El catálogo"]} className="font-display font-semibold text-[52px] md:text-[96px] leading-[0.95]" />
            <Reveal>
              <RevealItem
                as="p"
                className="font-inter text-[16px] md:text-[18px] max-w-[36ch] leading-relaxed"
                style={{ color: "var(--lv-ink)" }}
              >
                {categories.length} categorías y {total} creaciones. Toca una para ver sus diseños, sabores y precios.
              </RevealItem>
            </Reveal>
          </div>

          {/* Atajos por categoría */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 pb-2 mb-6 md:mb-10">
            {categories.map((c, i) => (
              <button
                key={c.id}
                onClick={() => handleOpen(c, i)}
                className="btn-press shrink-0 px-4 py-2.5 rounded-full font-inter text-[14px] font-medium"
                style={{ background: "var(--lv-cream-2)", color: "var(--lv-wine)" }}
              >
                {c.name}
              </button>
            ))}
          </div>

          <Reveal className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6" stagger={0.06} amount={0.05}>
            {categories.map((product, i) => (
              <RevealItem key={product.id} y={36} className={i === 0 ? "col-span-2 row-span-1 md:row-span-2" : ""}>
                <CatalogCard product={product} featured={i === 0} onClick={() => handleOpen(product, i)} />
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </section>

      {createPortal(
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
        </AnimatePresence>,
        document.body,
      )}

      {createPortal(
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
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
