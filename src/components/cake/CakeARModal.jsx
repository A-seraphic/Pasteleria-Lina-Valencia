import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Camera, Ruler, Users, Info, RotateCcw } from "lucide-react";
import CakeViewer from "./CakeViewer";
import { FROSTINGS } from "@/lib/cakeSpecs";
import useScrollLock from "@/hooks/useScrollLock";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Experiencia "mírala en tu espacio": torta 3D a escala real.
 * - Con WebXR (Android/Chrome) o Quick Look (iPhone) se ancla al piso o la mesa en tamaño real.
 * - Si el navegador no soporta AR, abre la cámara y muestra la torta encima como guía.
 */
export default function CakeARModal({ portions, initialPortionId, title, onClose }) {
  useScrollLock(true);
  const viewerRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [portionId, setPortionId] = useState(initialPortionId ?? portions[0]?.id);
  const [frosting, setFrosting] = useState("rosa");
  const [canAR, setCanAR] = useState(null);
  const [cameraMode, setCameraMode] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const chipsRef = useRef(null);
  const portion = portions.find((p) => p.id === portionId) || portions[0];

  // Mantiene visible el tamaño elegido en la fila deslizable
  useEffect(() => {
    chipsRef.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [portionId]);
  const onReady = useCallback(({ canActivateAR }) => setCanAR(canActivateAR), []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraMode(false);
  };

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const openCamera = async () => {
    setCameraError("");
    if (viewerRef.current?.canActivateAR) {
      viewerRef.current.activateAR();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream;
      setCameraMode(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      setCameraError("No pudimos abrir la cámara. Revisa el permiso de cámara del navegador e inténtalo de nuevo.");
    }
  };

  return createPortal(
    <motion.div
      data-scroll-lock
      className="fixed inset-0 z-[90] flex flex-col font-inter"
      style={{ background: cameraMode ? "#000" : "var(--lv-wine-deep)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {cameraMode && (
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted autoPlay />
      )}

      {/* Barra superior */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-4 pt-[max(env(safe-area-inset-top),16px)] pb-2">
        <div className="min-w-0">
          <p className="text-[14px]" style={{ color: "var(--lv-gold-soft)" }}>
            {cameraMode ? "Cámara" : "Tamaño real en 3D"}
          </p>
          <h3 className="font-display text-[26px] font-semibold truncate" style={{ color: "var(--lv-cream)" }}>
            {title || `Torta ${portion?.label ?? ""}`}
          </h3>
        </div>
        <button
          onClick={cameraMode ? stopCamera : onClose}
          aria-label={cameraMode ? "Cerrar cámara" : "Cerrar"}
          className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{ background: "rgba(253,250,245,0.9)", backdropFilter: "blur(10px)", color: "#a50059", boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Visor */}
      <div className="relative z-10 flex-1 min-h-0">
        <CakeViewer
          ref={viewerRef}
          portion={portion}
          frosting={frosting}
          pulled={!cameraMode}
          onReady={onReady}
          orbit={cameraMode ? "0deg 75deg auto" : "35deg 62deg auto"}
        />
        {cameraMode && (
          <div className="absolute left-4 right-4 top-2 rounded-2xl px-4 py-3 text-[12px] leading-snug flex gap-2"
            style={{ background: "rgba(0,0,0,0.45)", color: "#fff", backdropFilter: "blur(8px)" }}>
            <Info size={16} className="shrink-0 mt-0.5" />
            Tu navegador no detecta superficies, así que la torta flota sobre la cámara como guía. Para verla anclada en tamaño real usa Chrome en Android o Safari en iPhone.
          </div>
        )}
      </div>

      {/* Controles */}
      <div
        className="relative z-10 rounded-t-[28px] px-4 pt-4 pb-[max(env(safe-area-inset-bottom),16px)]"
        style={{ background: "var(--lv-cream)" }}
      >
        <div ref={chipsRef} className="flex gap-2 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-1 no-scrollbar">
          {portions.map((p) => {
            const active = p.id === portion?.id;
            return (
              <button
                key={p.id}
                onClick={() => setPortionId(p.id)}
                aria-pressed={active}
                className="snap-start shrink-0 rounded-2xl px-4 py-2.5 text-left transition-all active:scale-95"
                style={{
                  background: active ? "var(--lv-wine)" : "var(--lv-cream-2)",
                  color: active ? "#fdfaf5" : "#a50059",
                  
                }}
              >
                <span className="block text-[12px] font-semibold">{p.label}</span>
                <span className="block text-[10px] opacity-75">Ø {p.diameter} cm · {p.slices} porc.</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-3 text-[11px]" style={{ color: "rgba(165,0,89,0.7)" }}>
            <span className="flex items-center gap-1"><Ruler size={13} /> {portion?.diameter} × {portion?.height} cm</span>
            <span className="flex items-center gap-1"><Users size={13} /> {portion?.people}</span>
          </div>
          <div className="flex gap-1.5" role="radiogroup" aria-label="Color de cobertura">
            {Object.entries(FROSTINGS).map(([key, f]) => (
              <button
                key={key}
                role="radio"
                aria-checked={frosting === key}
                aria-label={f.label}
                onClick={() => setFrosting(key)}
                className="w-7 h-7 rounded-full transition-transform active:scale-90"
                style={{
                  background: f.frosting,
                  boxShadow: frosting === key ? "0 0 0 2px #fdfaf5, 0 0 0 4px #d4af37" : "inset 0 0 0 1px rgba(0,0,0,0.08)",
                }}
              />
            ))}
          </div>
        </div>

        {cameraError && <p className="mt-3 text-[12px]" style={{ color: "#b3261e" }}>{cameraError}</p>}

        <div className="flex gap-2 mt-4">
          {cameraMode ? (
            <button onClick={stopCamera}
              className="btn-press flex-1 flex items-center justify-center gap-2 py-4 rounded-full text-[15px] font-semibold"
              style={{ background: "rgba(165,0,89,0.08)", color: "#a50059" }}>
              <RotateCcw size={16} /> Volver al 3D
            </button>
          ) : (
            <button onClick={openCamera}
              className="btn-press ar-cta flex-1 flex items-center justify-center gap-2 py-4 rounded-full text-[15px] font-semibold"
              style={{ background: "var(--lv-wine)", color: "#fdfaf5" }}>
              <Camera size={17} /> {canAR === false ? "Abrir cámara" : "Ver en mi espacio"}
            </button>
          )}
        </div>
        {!cameraMode && (
          <p className="mt-2 text-center text-[10.5px]" style={{ color: "rgba(165,0,89,0.45)" }}>
            {canAR ? "Apunta al piso o a una mesa: la torta aparece en su tamaño real." : "Gira la torta con el dedo. Desde el celular puedes verla con la cámara."}
          </p>
        )}
      </div>
    </motion.div>,
    document.body
  );
}
