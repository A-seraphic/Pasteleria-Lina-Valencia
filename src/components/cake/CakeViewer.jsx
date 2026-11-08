import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { staticModelUrl } from "@/lib/cakeSpecs";
// three.js y el exportador se cargan solo cuando aparece la primera torta
const buildCakeModelUrl = (params) => import("@/lib/cake3d").then((m) => m.buildCakeModelUrl(params));

let viewerLib;
const loadViewer = () => (viewerLib ||= import("@google/model-viewer"));

/**
 * Torta 3D generada a escala real. Expone activateAR() y canActivateAR por ref.
 * transparent: deja ver lo que haya detrás (por ejemplo la cámara).
 */
const CakeViewer = forwardRef(function CakeViewer(
  { portion, slices, frosting = "rosa", pulled = true, autoRotate = true, interactive = true, orbit = "35deg 62deg auto", onReady },
  ref
) {
  const mvRef = useRef(null);
  const [libReady, setLibReady] = useState(false);
  const [src, setSrc] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    loadViewer().then(() => alive && setLibReady(true));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!portion) return;
    let alive = true;
    const params = {
      diameter: Number(portion.diameter),
      height: Number(portion.height),
      tiers: Number(portion.tiers) || 1,
      slices: Number(slices ?? portion.slices) || 1,
      frosting,
      pulled,
    };
    // Si hay un archivo pregenerado se usa (dirección real: sirve para el AR de Android);
    // si el tamaño fue editado en el panel, se genera en el momento.
    const file = pulled && staticModelUrl(params);
    if (file) setSrc(new URL(file, window.location.origin).href);
    else buildCakeModelUrl(params).then((url) => alive && setSrc(url));
    return () => { alive = false; };
  }, [portion?.diameter, portion?.height, portion?.tiers, portion?.slices, slices, frosting, pulled]);

  useEffect(() => {
    const mv = mvRef.current;
    if (!mv) return;
    const onLoad = () => {
      setLoaded(true);
      onReady?.({ canActivateAR: Boolean(mv.canActivateAR) });
    };
    mv.addEventListener("load", onLoad);
    return () => mv.removeEventListener("load", onLoad);
  }, [libReady, Boolean(src), onReady]);

  useImperativeHandle(ref, () => ({
    activateAR: () => mvRef.current?.activateAR(),
    get canActivateAR() { return Boolean(mvRef.current?.canActivateAR); },
  }), []);

  return (
    <div className="relative w-full h-full">
      {libReady && src && (
        <model-viewer
          ref={mvRef}
          src={src}
          alt="Torta 3D a escala real"
          ar=""
          ar-modes={src?.startsWith("blob:") ? "webxr quick-look" : "webxr scene-viewer quick-look"}
          ar-scale="fixed"
          ar-placement="floor"
          {...(interactive ? { "camera-controls": "" } : {})}
          {...(autoRotate ? { "auto-rotate": "" } : {})}
          auto-rotate-delay="600"
          rotation-per-second="18deg"
          camera-orbit={orbit}
          touch-action="pan-y"
          interaction-prompt="none"
          disable-zoom=""
          shadow-intensity="1.1"
          shadow-softness="0.9"
          exposure="1.05"
          environment-image="neutral"
          style={{ width: "100%", height: "100%", background: "transparent", "--poster-color": "transparent" }}
        >
          <span slot="ar-button" style={{ display: "none" }} />
        </model-viewer>
      )}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(212,175,55,0.25)", borderTopColor: "#d4af37" }} />
        </div>
      )}
    </div>
  );
});

export default CakeViewer;
