import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search, X, ArrowUpRight } from "lucide-react";
import SubcatalogView from "./SubcatalogView";
import CategoryGallery from "./CategoryGallery";
import CatalogCard from "./CatalogCard";
import { Reveal, RevealItem, SplitTitle } from "./fx/Reveal";
import { usePublicCatalog } from "@/data/catalogStore";
import { whatsappUrl } from "@/data/site";

const EASE = [0.22, 1, 0.36, 1];
const norm = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Catálogo. La categoría y el producto abiertos viven en la dirección (?c=1&p=102):
 * el botón Atrás del teléfono cierra la ficha y cualquier producto se puede compartir por enlace.
 */
export default function CatalogSection() {
  const { categories } = usePublicCatalog();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const cId = Number(params.get("c")) || null;
  const pId = Number(params.get("p")) || null;
  const catIdx = categories.findIndex((c) => c.id === cId);
  const category = catIdx >= 0 ? categories[catIdx] : null;
  const subIdx = category && pId ? category.subcategories.findIndex((s) => s.id === pId) : -1;

  // Abrir empuja una entrada al historial; cerrar vuelve atrás si la abrimos nosotros
  const open = (next) => setParams(next, { state: { lv: true } });
  const close = (fallback) => (location.state?.lv ? navigate(-1) : setParams(fallback, { replace: true }));

  const openCategory = (c) => open({ c: String(c.id) });
  const openProduct = (c, s) => open({ c: String(c.id), p: String(s.id) });

  const total = categories.reduce((n, c) => n + c.subcategories.length, 0);

  // Buscador: todas las palabras deben aparecer en el nombre, subtítulo, descripción o categoría
  const results = useMemo(() => {
    const words = norm(query).split(/\s+/).filter((w) => w.length > 1);
    if (!words.length) return null;
    return categories.flatMap((c) =>
      c.subcategories
        .filter((s) => {
          const text = norm(`${s.name} ${s.subtitle} ${s.desc} ${c.name} ${s.badge}`);
          return words.every((w) => text.includes(w));
        })
        .map((s) => ({ c, s }))
    );
  }, [query, categories]);

  return (
    <>
      <section id="catalogo" className="relative py-20 md:py-32">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10">
          <div className="grid md:grid-cols-[1fr_auto] gap-5 md:items-end mb-7 md:mb-10">
            <SplitTitle lines={["El catálogo"]} className="font-display font-semibold text-[52px] md:text-[96px] leading-[0.95]" />
            <Reveal>
              <RevealItem as="p" className="font-inter text-[16px] md:text-[18px] max-w-[36ch] leading-relaxed" style={{ color: "var(--lv-ink)" }}>
                {categories.length} categorías y {total} creaciones. Toca una para ver sus diseños, sabores y precios.
              </RevealItem>
            </Reveal>
          </div>

          {/* Buscador */}
          <label className="relative block mb-4 md:mb-6 md:max-w-xl">
            <span className="sr-only">Buscar en el catálogo</span>
            <Search size={19} className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--lv-gold)" }} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca: chocolate, quince años, cupcakes…"
              className="w-full rounded-full pr-12 py-4 font-inter text-[16px] outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(233,30,140,0.25)]"
              style={{ background: "var(--lv-cream-2)", color: "var(--lv-ink)", paddingLeft: 52 }}
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Borrar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center" style={{ color: "var(--lv-wine)" }}>
                <X size={17} />
              </button>
            )}
          </label>

          <AnimatePresence mode="wait">
            {results ? (
              <motion.div key="results" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }}>
                <p className="font-inter text-[15px] mb-4" style={{ color: "var(--lv-ink)" }} aria-live="polite">
                  {results.length ? `${results.length} ${results.length === 1 ? "resultado" : "resultados"} para “${query.trim()}”` : `No encontramos “${query.trim()}”.`}
                </p>
                {results.length ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                    {results.map(({ c, s }, i) => (
                      <motion.button key={s.id} type="button" onClick={() => openProduct(c, s)} className="group text-left"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: Math.min(i * 0.04, 0.4) }}
                        whileTap={{ scale: 0.97 }}>
                        <span className="relative block aspect-[4/5] rounded-[22px] overflow-hidden" style={{ background: "var(--lv-blush)" }}>
                          <img src={s.img} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-[1.06]" />
                          <span className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--lv-wine)", color: "var(--lv-cream)" }}>
                            <ArrowUpRight size={16} />
                          </span>
                        </span>
                        <span className="block font-inter text-[12.5px] mt-2.5 px-1" style={{ color: "#8a6a1f" }}>{c.name}</span>
                        <span className="block font-display text-[18px] md:text-[21px] font-semibold leading-tight px-1" style={{ color: "var(--lv-wine)" }}>{s.name}</span>
                        <span className="block font-inter text-[14px] mt-0.5 px-1" style={{ color: "var(--lv-ink)" }}>{s.price}</span>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <a href={whatsappUrl(`¡Hola Lina! Busco ${query.trim()}. ¿Lo pueden hacer? 🎂`)} target="_blank" rel="noopener noreferrer"
                    className="btn-press inline-flex px-6 py-3.5 rounded-full font-inter text-[15px] font-semibold" style={{ background: "var(--lv-wine)", color: "var(--lv-cream)" }}>
                    Pregúntale a Lina si lo puede hacer
                  </a>
                )}
              </motion.div>
            ) : (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                {/* Atajos por categoría */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 pb-2 mb-6 md:mb-10">
                  {categories.map((c) => (
                    <button key={c.id} onClick={() => openCategory(c)}
                      className="btn-press shrink-0 px-4 py-2.5 rounded-full font-inter text-[14px] font-medium"
                      style={{ background: "var(--lv-cream-2)", color: "var(--lv-wine)" }}>
                      {c.name}
                    </button>
                  ))}
                </div>

                <Reveal className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6" stagger={0.06} amount={0.05}>
                  {categories.map((product, i) => (
                    <RevealItem key={product.id} y={36} className={i === 0 ? "col-span-2 row-span-1 md:row-span-2" : ""}>
                      <CatalogCard product={product} featured={i === 0} onClick={() => openCategory(product)} />
                    </RevealItem>
                  ))}
                </Reveal>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {createPortal(
        <AnimatePresence>
          {category && subIdx < 0 && (
            <CategoryGallery
              key={`gallery-${category.id}`}
              product={category}
              productIdx={catIdx}
              onSelect={(i) => openProduct(category, category.subcategories[i])}
              onBack={() => close({})}
            />
          )}
        </AnimatePresence>,
        document.body
      )}

      {createPortal(
        <AnimatePresence>
          {category && subIdx >= 0 && (
            <SubcatalogView
              key={`detail-${category.id}`}
              product={category}
              productIdx={catIdx}
              initialSubIdx={subIdx}
              onIndexChange={(i) => setParams({ c: String(category.id), p: String(category.subcategories[i].id) }, { replace: true, state: location.state })}
              onBack={() => close({ c: String(category.id) })}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
