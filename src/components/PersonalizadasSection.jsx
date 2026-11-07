import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";

import GoldDust from "./fx/GoldDust";
import { SplitTitle } from "./fx/Reveal";
import { whatsappUrl } from "@/data/site";

gsap.registerPlugin(ScrollTrigger, Draggable);

const CARDS = [
  {
    img: "https://media.base44.com/images/public/69f9758f7d1c8f8af9a6884c/b087a2735_ChatGPTImage28jun202605_47_52pm.png",
    label: "Feliz 90 Años",
  },
  {
    img: "https://media.base44.com/images/public/69f9758f7d1c8f8af9a6884c/27bbac698_ChatGPTImage28jun202605_48_45pm.png",
    label: "Dani · Mariposas",
  },
  { img: "https://media.base44.com/images/public/69f9758f7d1c8f8af9a6884c/243a59231_ChatGPTImage28jun202605_48_56pm.png", label: "Mis 15" },
  {
    img: "https://media.base44.com/images/public/69f9758f7d1c8f8af9a6884c/abd51d06c_ChatGPTImage28jun202605_49_05pm.png",
    label: "Samuel 12 · Fútbol",
  },
  {
    img: "https://media.base44.com/images/public/69f9758f7d1c8f8af9a6884c/50e1a3a21_ChatGPTImage28jun202605_49_20pm.png",
    label: "Powerpuff Girls",
  },
  {
    img: "https://media.base44.com/images/public/69f9758f7d1c8f8af9a6884c/e445ddd13_ChatGPTImage28jun202605_49_31pm.png",
    label: "Graduación Medicina",
  },
  {
    img: "https://media.base44.com/images/public/69f9758f7d1c8f8af9a6884c/a973fcbbd_ChatGPTImage28jun202605_49_39pm.png",
    label: "Paw Patrol",
  },
  {
    img: "https://media.base44.com/images/public/69f9758f7d1c8f8af9a6884c/c814b2678_ChatGPTImage28jun202605_49_46pm.png",
    label: "Naked Cake Floral",
  },
  {
    img: "https://media.base44.com/images/public/69f9758f7d1c8f8af9a6884c/6fffd31a0_ChatGPTImage28jun202605_49_53pm.png",
    label: "San Pedro Huila",
  },
  {
    img: "https://media.base44.com/images/public/69f9758f7d1c8f8af9a6884c/78c2f2fd8_ChatGPTImage28jun202605_50_05pm.png",
    label: "Happy Birthday Art",
  },
];

const RADIUS = 480;
const CARD_COUNT = CARDS.length;
const ANGLE_STEP = 360 / CARD_COUNT;

export default function PersonalizadasSection() {
  const sectionRef = useRef(null);
  const ringRef = useRef(null);
  const dragProxyRef = useRef(null);
  const itemRefs = useRef([]);
  const innerRefs = useRef([]);
  const visualRefs = useRef([]);
  const autoRotateFn = useRef(null);
  const interactionEnabled = useRef(false);
  const isDragging = useRef(false);
  const isHovering = useRef(false);
  const currentRotation = useRef(0);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const listeners = [];
    let dragInstance = null;

    function startAutoRotate() {
      if (autoRotateFn.current) return;
      const fn = () => {
        if (!interactionEnabled.current || isDragging.current || isHovering.current) return;
        currentRotation.current += 0.12;
        if (ringRef.current) {
          gsap.set(ringRef.current, { rotationY: currentRotation.current });
        }
      };
      autoRotateFn.current = fn;
      gsap.ticker.add(fn);
    }

    function stopAutoRotate() {
      if (autoRotateFn.current) {
        gsap.ticker.remove(autoRotateFn.current);
        autoRotateFn.current = null;
      }
    }

    const ctx = gsap.context(() => {
      // ── Initial chaotic state ──────────────────────────────────────────
      itemRefs.current.forEach((item, i) => {
        if (!item) return;
        gsap.set(item, {
          x: gsap.utils.random(isMobile ? -180 : -380, isMobile ? 180 : 380),
          y: gsap.utils.random(-180, 180),
          rotationX: gsap.utils.random(-30, 30),
          rotationY: gsap.utils.random(-60, 60),
        });
      });

      innerRefs.current.forEach((inner) => {
        if (!inner) return;
        gsap.set(inner, { z: gsap.utils.random(-1500, -1000) });
      });

      visualRefs.current.forEach((visual) => {
        if (!visual) return;
        // el desenfoque es costoso en celulares: allí solo se usa opacidad
        gsap.set(visual, isMobile ? { opacity: 0 } : { opacity: 0, filter: "blur(20px)" });
      });

      // ── Assembly timeline (staggered) ──────────────────────────────────
      const tl = gsap.timeline();

      itemRefs.current.forEach((item, i) => {
        if (!item) return;
        tl.to(
          item,
          {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: i * ANGLE_STEP,
            duration: 1.6,
            ease: "power4.out",
          },
          i * 0.08,
        );
      });

      innerRefs.current.forEach((inner, i) => {
        if (!inner) return;
        tl.to(
          inner,
          {
            z: isMobile ? 250 : RADIUS,
            duration: 1.6,
            ease: "power4.out",
          },
          i * 0.08,
        );
      });

      visualRefs.current.forEach((visual, i) => {
        if (!visual) return;
        tl.to(
          visual,
          {
            opacity: 1,
            ...(isMobile ? {} : { filter: "blur(0px)" }),
            duration: 1.4,
            ease: "power4.out",
          },
          i * 0.08,
        );
      });

      // ── ScrollTrigger (responsive) ─────────────────────────────────────
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: isMobile ? "+=140%" : "+=300%",
        pin: true,
        scrub: isMobile ? 1 : 2,
        animation: tl,
        onUpdate: (self) => {
          if (self.progress > 0.95) {
            if (!interactionEnabled.current) {
              interactionEnabled.current = true;
              startAutoRotate();
            }
          } else {
            if (interactionEnabled.current) {
              interactionEnabled.current = false;
              stopAutoRotate();
            }
          }
        },
        onLeaveBack: () => {
          interactionEnabled.current = false;
          stopAutoRotate();
          if (ringRef.current) {
            gsap.set(ringRef.current, { rotationY: 0 });
            currentRotation.current = 0;
          }
        },
      });

      // ── Draggable (proxy with section trigger) ─────────────────────────
      dragInstance = Draggable.create(dragProxyRef.current, {
        type: "x",
        trigger: sectionRef.current,
        onPress: function () {
          isDragging.current = true;
          stopAutoRotate();
          this._startX = this.x;
          this._startRot = currentRotation.current;
        },
        onDrag: function () {
          const deltaX = this.x - this._startX;
          currentRotation.current = this._startRot + deltaX * 0.35;
          if (ringRef.current) {
            gsap.set(ringRef.current, { rotationY: currentRotation.current });
          }
        },
        onRelease: function () {
          isDragging.current = false;
          gsap.set(this.target, { x: 0 });
          if (interactionEnabled.current && !isHovering.current) {
            startAutoRotate();
          }
        },
      })[0];

      // ── Hover handlers ─────────────────────────────────────────────────
      visualRefs.current.forEach((visual, i) => {
        if (!visual) return;

        const onEnter = () => {
          if (!interactionEnabled.current || isDragging.current) return;
          isHovering.current = true;
          stopAutoRotate();

          gsap.to(visual, { scale: 1.08, duration: 0.4, ease: "power2.out" });

          visualRefs.current.forEach((v, j) => {
            if (j === i || !v) return;
            gsap.to(v, { opacity: 0.55, filter: "blur(5px)", duration: 0.4, ease: "power2.out" });
          });
        };

        const onLeave = () => {
          isHovering.current = false;
          visualRefs.current.forEach((v) => {
            if (!v) return;
            gsap.to(v, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "power2.out" });
          });
          if (interactionEnabled.current) startAutoRotate();
        };

        visual.addEventListener("mouseenter", onEnter);
        visual.addEventListener("mouseleave", onLeave);
        listeners.push({ el: visual, onEnter, onLeave });
      });
    }, sectionRef);

    return () => {
      stopAutoRotate();
      if (dragInstance) dragInstance.kill();
      listeners.forEach(({ el, onEnter, onLeave }) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
      ctx.revert();
    };
  }, []);

  // GSAP envuelve la sección al fijarla (pin); el div externo mantiene estable el árbol de React
  return (
    <div>
      <section
        ref={sectionRef}
        id="personalizadas"
        className="relative w-full overflow-hidden flex flex-col items-center"
        style={{
          height: "max(100svh, 720px)",
          background: "var(--lv-blush)",
        }}
      >
        <style>{`
        .pers-card-item { position: absolute; width: 0; height: 0; transform-style: preserve-3d; will-change: transform; }
        .pers-card-3d { position: absolute; width: 0; height: 0; transform-style: preserve-3d; will-change: transform; }
        .pers-card-visual {
          position: absolute; width: 220px; height: 280px;
          margin-left: -110px; margin-top: -140px;
          border-radius: 18px; overflow: hidden;
          backface-visibility: hidden; cursor: grab;
          will-change: transform, opacity, filter;
        }
        .pers-card-visual:active { cursor: grabbing; }
        .pers-card-label { opacity: 0; transition: opacity 0.3s ease; }
        .pers-card-visual:hover .pers-card-label { opacity: 1; }
        @media (hover: none) { .pers-card-label { opacity: 1; } }
        @media (max-width: 768px) {
          .pers-card-visual { width: 160px; height: 200px; margin-left: -80px; margin-top: -100px; }
        }
      `}</style>

        <GoldDust count={30} colors={["#d4af37", "#a50059", "#f3dc9a"]} />

        {/* Encabezado */}
        <div className="relative z-10 text-center pt-20 md:pt-24 px-6">
          <SplitTitle
            lines={["Si lo imaginas,", "lo hacemos torta"]}
            className="font-display font-semibold text-[40px] md:text-[76px] leading-[1]"
          />
          <p className="font-inter text-[16px] md:text-[18px] mt-4 max-w-[40ch] mx-auto" style={{ color: "var(--lv-ink)" }}>
            Quince años, grados, bodas, personajes. Arrastra el carrusel y toca la que te guste.
          </p>
          <a
            href={whatsappUrl("¡Hola Lina! Quiero una torta personalizada 🎂")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-press inline-flex mt-5 px-6 py-3.5 rounded-full font-inter text-[15px] font-semibold"
            style={{ background: "var(--lv-wine)", color: "var(--lv-cream)" }}
          >
            Diseñar la mía
          </a>
        </div>

        {/* 3D Scene */}
        <div className="absolute inset-0" style={{ perspective: "2000px", perspectiveOrigin: "50% 45%" }}>
          <div ref={ringRef} className="absolute" style={{ top: "64%", left: "50%", width: 0, height: 0, transformStyle: "preserve-3d" }}>
            {CARDS.map((card, i) => (
              <div key={i} ref={(el) => (itemRefs.current[i] = el)} className="pers-card-item">
                <div ref={(el) => (innerRefs.current[i] = el)} className="pers-card-3d">
                  <div
                    ref={(el) => (visualRefs.current[i] = el)}
                    className="pers-card-visual"
                    style={{ boxShadow: "0 18px 40px rgba(92,0,50,0.18)" }}
                  >
                    <img src={card.img} alt={card.label} className="w-full h-full object-cover" draggable={false} />
                    <div
                      className="pers-card-label absolute bottom-0 left-0 right-0 px-4 py-3"
                      style={{ background: "linear-gradient(to top, rgba(92,0,50,0.85), transparent)" }}
                    >
                      <span className="font-inter text-[13px] font-medium text-white">{card.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drag proxy */}
        <div ref={dragProxyRef} className="absolute inset-0" style={{ zIndex: 40, pointerEvents: "none" }} />

        {/* Hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <span className="font-inter text-[13px]" style={{ color: "rgba(74,0,40,0.55)" }}>
            Arrastra para girar el carrusel
          </span>
        </div>
      </section>
    </div>
  );
}
