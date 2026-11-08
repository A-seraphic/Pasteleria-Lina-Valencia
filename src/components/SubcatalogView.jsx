import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Camera, ChevronLeft, ChevronRight, ShoppingBag, Share2, Check } from "lucide-react";
import { useCart } from "@/data/cart";
import OrderForm from "./OrderForm";
import DessertCareModal from "./DessertCareModal";
import CakeARModal from "./cake/CakeARModal";
import useScrollLock from "@/hooks/useScrollLock";
import { usePublicCatalog, productGroups } from "@/data/catalogStore";
import { formatCOP } from "@/data/defaults";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Ficha de producto: fotos deslizables (scroll nativo con imán), datos y opciones,
 * y una barra fija abajo con el precio y la acción principal.
 */
export default function SubcatalogView({ product, onBack, onIndexChange, initialSubIdx = 0 }) {
  const [subIdx, setSubIdx] = useState(initialSubIdx);
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [careOpen, setCareOpen] = useState(false);
  const [arOpen, setArOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { options, portions, groups, receipt } = usePublicCatalog();
  const cart = useCart();
  const trackRef = useRef(null);
  const scrollerRef = useRef(null);
  useScrollLock(true);

  const subs = product.subcategories;
  const sub = subs[subIdx] || subs[0];
  const subGroups = productGroups(sub, options, groups);
  const subPortions = portions.filter((p) => sub?.portionIds?.includes(p.id));
  const canAR = sub?.ar && subPortions.length > 0;

  const goTo = (i) => {
    const el = trackRef.current;
    if (!el || i < 0 || i >= subs.length) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  // Posición inicial y sincronía del índice con el deslizamiento
  useEffect(() => {
    const el = trackRef.current;
    if (el) el.scrollLeft = initialSubIdx * el.clientWidth;
  }, [initialSubIdx]);

  const onTrackScroll = () => {
    const el = trackRef.current;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== subIdx && subs[i]) {
      setSubIdx(i);
      onIndexChange?.(i);
      scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Compartir el enlace directo a este diseño (WhatsApp, Instagram…) o copiarlo
  const share = async () => {
    const url = `${window.location.origin}/?c=${product.id}&p=${sub.id}`;
    const data = { title: `${sub.name} · Lina Valencia`, text: `Mira esta creación de Lina Valencia: ${sub.name} (${sub.price})`, url };
    try {
      if (navigator.share) return await navigator.share(data);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // el cliente canceló el menú de compartir
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (orderFormOpen || careOpen || arOpen) return;
      if (e.key === "ArrowRight") goTo(subIdx + 1);
      if (e.key === "ArrowLeft") goTo(subIdx - 1);
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [subIdx, orderFormOpen, careOpen, arOpen]);

  return (
    <>
      <motion.div
        data-scroll-lock
        ref={scrollerRef}
        className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain md:overflow-hidden font-inter"
        style={{ background: "var(--lv-cream)" }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        <div className="md:grid md:grid-cols-2 md:h-full">
          {/* Fotos */}
          <div className="relative md:h-full" style={{ background: "var(--lv-blush)" }}>
            <div ref={trackRef} onScroll={onTrackScroll}
              className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar aspect-[4/5] md:aspect-auto md:h-full">
              {subs.map((s, i) => (
                <div key={s.id ?? i} className="relative shrink-0 w-full h-full snap-center overflow-hidden">
                  <motion.img src={s.img} alt={s.name} draggable={false}
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.15 }} animate={{ scale: i === subIdx ? 1 : 1.08 }}
                    transition={{ duration: 1.2, ease: EASE }} />
                </div>
              ))}
            </div>

            <button onClick={onBack} aria-label="Volver"
              className="btn-press absolute top-[max(env(safe-area-inset-top),16px)] left-4 w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: "var(--lv-cream)", color: "var(--lv-wine)" }}>
              <ArrowLeft size={19} />
            </button>
            <button onClick={share} aria-label={copied ? "Enlace copiado" : "Compartir este diseño"}
              className="btn-press absolute top-[max(env(safe-area-inset-top),16px)] right-4 h-11 px-4 rounded-full flex items-center gap-2 font-inter text-[14px] font-semibold"
              style={{ background: "var(--lv-cream)", color: "var(--lv-wine)" }}>
              {copied ? <Check size={17} /> : <Share2 size={17} />}
              <span className="hidden sm:inline">{copied ? "Enlace copiado" : "Compartir"}</span>
            </button>

            {subs.length > 1 && (
              <>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                  {subs.map((_, i) => (
                    <button key={i} onClick={() => goTo(i)} aria-label={`Ver diseño ${i + 1}`}
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: i === subIdx ? 26 : 8, background: i === subIdx ? "var(--lv-cream)" : "rgba(253,250,245,0.55)" }} />
                  ))}
                </div>
                <button onClick={() => goTo(subIdx - 1)} disabled={subIdx === 0} aria-label="Anterior"
                  className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full items-center justify-center disabled:opacity-0 transition-opacity btn-press"
                  style={{ background: "var(--lv-cream)", color: "var(--lv-wine)" }}>
                  <ChevronLeft size={22} />
                </button>
                <button onClick={() => goTo(subIdx + 1)} disabled={subIdx === subs.length - 1} aria-label="Siguiente"
                  className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full items-center justify-center disabled:opacity-0 transition-opacity btn-press"
                  style={{ background: "var(--lv-cream)", color: "var(--lv-wine)" }}>
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>

          {/* Información */}
          <div data-scroll-lock className="md:h-full md:overflow-y-auto overscroll-contain">
            <AnimatePresence mode="wait">
              <motion.div key={sub.id ?? subIdx} className="px-5 md:px-12 lg:px-16 pt-7 md:pt-20 pb-36 max-w-xl"
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: EASE }}>
                <button onClick={onBack} className="font-inter text-[14px] font-medium" style={{ color: "#8a6a1f" }}>
                  {product.name}
                </button>
                <h1 className="font-display font-semibold text-[40px] md:text-[56px] leading-[1] mt-2" style={{ color: "var(--lv-wine)" }}>
                  {sub.name}
                </h1>
                {sub.subtitle && <p className="font-display italic text-[20px] mt-2" style={{ color: "var(--lv-ink)" }}>{sub.subtitle}</p>}
                <p className="font-display text-[30px] font-semibold mt-4" style={{ color: "var(--lv-wine)" }}>{sub.price}</p>

                <p className="font-inter text-[17px] leading-relaxed mt-5" style={{ color: "var(--lv-ink)" }}>{sub.desc}</p>

                {sub.leadDays > 0 && (
                  <p className="font-inter text-[15px] mt-4 inline-flex rounded-full px-4 py-2" style={{ background: "var(--lv-rose-soft)", color: "var(--lv-wine)" }}>
                    Pídela con {sub.leadDays} {sub.leadDays === 1 ? "día" : "días"} de anticipación
                  </p>
                )}

                {subGroups.length > 0 && (
                  <div className="mt-8 space-y-5">
                    {subGroups.map(({ group, options: opts }) => (
                      <div key={group.key}>
                        <h2 className="font-display text-[21px] mb-2.5" style={{ color: "var(--lv-wine)" }}>{group.label}</h2>
                        <div className="flex flex-wrap gap-2">
                          {opts.map((o) => (
                            <span key={o.id} title={o.description || undefined} className="px-3.5 py-2 rounded-full font-inter text-[14px]"
                              style={{ background: "var(--lv-cream-2)", color: "var(--lv-ink)" }}>
                              {o.name}
                              {receipt.showPrices && o.priceExtra > 0 && (
                                <span className="ml-1.5 text-[12.5px] font-semibold" style={{ color: "#8a6a1f" }}>+{formatCOP(o.priceExtra)}</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {product.details?.length > 0 && (
                  <dl className="mt-8 rounded-[22px] p-5 grid grid-cols-2 gap-x-4 gap-y-4" style={{ background: "var(--lv-cream-2)" }}>
                    {product.details.map((d) => (
                      <div key={d.label}>
                        <dt className="font-inter text-[13px]" style={{ color: "rgba(74,0,40,0.6)" }}>{d.label}</dt>
                        <dd className="font-inter text-[15px] font-medium mt-0.5" style={{ color: "var(--lv-ink)" }}>{d.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {subs.length > 1 && (
                  <div className="mt-8">
                    <h2 className="font-display text-[21px] mb-3" style={{ color: "var(--lv-wine)" }}>Más de {product.name}</h2>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0">
                      {subs.map((s, i) => (
                        <button key={s.id ?? i} onClick={() => goTo(i)} className="btn-press shrink-0 w-28 text-left">
                          <span className="block aspect-square rounded-2xl overflow-hidden transition-all"
                            style={{ outline: i === subIdx ? "3px solid var(--lv-gold)" : "none", outlineOffset: 2 }}>
                            <img src={s.img} alt="" className="w-full h-full object-cover" />
                          </span>
                          <span className="block font-inter text-[13px] mt-1.5 truncate" style={{ color: "var(--lv-ink)" }}>{s.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => setCareOpen(true)} className="nav-link mt-8 font-inter text-[15px] font-medium" style={{ color: "var(--lv-wine)" }}>
                  Cómo cuidar mi postre
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Barra de acción fija */}
        <motion.div
          className="fixed bottom-0 inset-x-0 md:left-1/2 z-10 px-4 md:px-12 pt-3 pb-[max(env(safe-area-inset-bottom),14px)] flex items-center gap-2"
          style={{ background: "rgba(253,250,245,0.96)" }}
          initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
        >
          <button onClick={() => setOrderFormOpen(true)}
            className="btn-press flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-inter text-[15px] font-semibold"
            style={{ background: "var(--lv-wine)", color: "var(--lv-cream)" }}>
            <Sparkles size={16} /> Personalizar y pedir
          </button>
          {cart.count > 0 && (
            <button onClick={() => cart.setOpen(true)} aria-label={`Mi pedido, ${cart.count} productos`}
              className="btn-press relative h-[54px] w-[54px] shrink-0 rounded-full flex items-center justify-center"
              style={{ background: "var(--lv-cream-2)", color: "var(--lv-wine)" }}>
              <ShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full flex items-center justify-center font-inter text-[12px] font-semibold"
                style={{ background: "var(--lv-gold)", color: "var(--lv-wine-deep)" }}>{cart.count}</span>
            </button>
          )}
          {canAR && (
            <button onClick={() => setArOpen(true)} aria-label="Ver tamaño real con la cámara"
              className="btn-press ar-cta h-[54px] px-5 rounded-full flex items-center gap-2 font-inter text-[14px] font-semibold"
              style={{ background: "var(--lv-gold)", color: "var(--lv-wine-deep)" }}>
              <Camera size={18} /> <span className="hidden sm:inline">Tamaño real</span>
            </button>
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {arOpen && <CakeARModal portions={subPortions} title={sub.name} onClose={() => setArOpen(false)} />}
      </AnimatePresence>
      {careOpen && <DessertCareModal product={product} onClose={() => setCareOpen(false)} />}
      {orderFormOpen && (
        <OrderForm product={product} subcategory={sub} groups={subGroups} portions={subPortions} receipt={receipt} onClose={() => setOrderFormOpen(false)} />
      )}
    </>
  );
}
