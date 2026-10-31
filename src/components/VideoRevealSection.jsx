import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Fallback poster image from Unsplash — luxury pastry atelier
const FALLBACK = "https://images.unsplash.com/photo-1562440499-64c9a111f713?w=1600&q=80&auto=format&fit=crop";

// We use a hosted royalty-free video of a pastry kitchen / elegant food
// Pixabay / Pexels MP4 direct links work well here
const VIDEO_SRC = "https://media.base44.com/videos/public/69f9758f7d1c8f8af9a6884c/e34a700fe_Lneadetiempo3.mp4";

export default function VideoRevealSection() {
  const sectionRef = useRef(null);
  const maskRef = useRef(null);
  const videoRef = useRef(null);
  const textRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── 1. Clip-path mask expand: circle(0%) → circle(150%) ─────────────────
      gsap.fromTo(
        maskRef.current,
        { clipPath: "circle(0% at 50% 50%)" },
        {
          clipPath: "circle(150% at 50% 50%)",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            end: "top 10%",
            scrub: 1.2
          }
        }
      );

      // ── 2. Video parallax — moves up as user scrolls down ───────────────────
      gsap.to(videoRef.current, {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.4
        }
      });

      // ── 3. Text parallax — slight downward drift + scale ────────────────────
      gsap.fromTo(
        textRef.current,
        { y: 0, scale: 1, opacity: 0 },
        {
          y: 40,
          scale: 1.04,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            end: "bottom top",
            scrub: 1
          }
        }
      );

      // ── 4. Exit blur + darken when scrolling out ─────────────────────────────
      gsap.to(overlayRef.current, {
        opacity: 0.72,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "70% center",
          end: "bottom top",
          scrub: 1
        }
      });

      gsap.to(maskRef.current, {
        filter: "blur(0px)",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 10%",
          end: "center center",
          scrub: 1,
          onUpdate: (self) => {

            // Blur in on entry, blur out on exit
          } } });

      // Blur out on exit
      gsap.fromTo(
        maskRef.current,
        { filter: "blur(0px)" },
        {
          filter: "blur(10px)",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "65% center",
            end: "bottom top",
            scrub: 1.2
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="video-reveal-container"
      className="relative overflow-hidden"
      style={{ height: "100vh" }}>
      
      {/* ── Masked video layer ────────────────────────────────────────────── */}
      <div
        ref={maskRef}
        className="absolute inset-0"
        style={{
          clipPath: "circle(0% at 50% 50%)",
          willChange: "clip-path, filter"
        }}>
        
        {/* Video */}
        <video
          ref={videoRef}
          className="absolute w-full h-full object-cover"
          style={{ top: "-10%", height: "120%", willChange: "transform" }}
          src={VIDEO_SRC}
          poster={FALLBACK}
          autoPlay
          muted
          loop
          playsInline />
        

        {/* Vignette overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)",
            pointerEvents: "none"
          }} />
        

        {/* Exit darkening overlay */}
        <div
          ref={overlayRef}
          className="absolute inset-0"
          style={{ background: "rgba(30,0,20,0.0)", pointerEvents: "none" }} />
        
      </div>

      {/* ── Background fallback (visible before mask opens) ───────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 80% at 50% 50%, #f5e8ef 0%, #ede0e8 100%)",
          zIndex: -1
        }} />
      

      {/* ── Centered text ────────────────────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center z-10 px-6 pointer-events-none">
        <div ref={textRef} className="text-center" style={{ willChange: "transform, opacity" }}>
          <span
            className="font-inter text-xs tracking-[0.45em] uppercase font-medium block mb-4"
            style={{ color: "rgba(212,175,55,0.9)", textShadow: "0 1px 12px rgba(0,0,0,0.4)" }}>
            
            Lina Valencia Pastelería
          </span>
          <h2
            className="font-playfair text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.1]"
            style={{
              color: "#fdfaf5",
              textShadow: "0 4px 32px rgba(0,0,0,0.5), 0 1px 8px rgba(0,0,0,0.3)"
            }}>
            
            La magia de lo
            <br />
            <span className="italic font-normal" style={{ color: "#d4af37" }}>artesanal</span>
            <br />
            en cada detalle
          </h2>
          <div
            className="w-16 h-[1px] mx-auto mt-6"
            style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.8), transparent)" }} />
          
        </div>
      </div>
    </section>);

}