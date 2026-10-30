import SlideRevealWrapper from "./SlideRevealWrapper";
import { MapPin, Phone, Clock, Instagram } from "lucide-react";

export default function ContactSection() {
  return (
    <section id="contacto" className="relative py-28 md:py-36 px-6">
      <div className="max-w-4xl mx-auto">
        <SlideRevealWrapper direction="up" className="text-center mb-16">
          <span
            className="font-inter text-xs tracking-[0.4em] uppercase font-medium"
            style={{ color: "#d4af37" }}
          >
            Hablemos
          </span>
          <h2
            className="font-playfair text-4xl md:text-5xl font-semibold mt-3"
            style={{ color: "#a50059" }}
          >
            Contacto
          </h2>
          <div
            className="w-16 h-[1px] mx-auto mt-6"
            style={{ background: "#d4af37" }}
          />
        </SlideRevealWrapper>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Info */}
          <SlideRevealWrapper direction="left">
            <div
              className="p-8 rounded-3xl h-full"
              style={{
                background: "rgba(253, 250, 245, 0.6)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(212, 175, 55, 0.12)",
              }}
            >
              <h3
                className="font-playfair text-xl font-semibold mb-6"
                style={{ color: "#a50059" }}
              >
                Encuéntranos
              </h3>
              <div className="space-y-5">
                {[
                  { icon: MapPin, text: "Calle 85 #12-30, Bogotá" },
                  { icon: Phone, text: "+57 300 123 4567" },
                  { icon: Clock, text: "Lun - Sáb: 8:00 AM - 7:00 PM" },
                  { icon: Instagram, text: "@linavalenciapasteleria" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(212, 175, 55, 0.1)" }}
                    >
                      <Icon size={18} style={{ color: "#d4af37" }} />
                    </div>
                    <span
                      className="font-inter text-sm font-light"
                      style={{ color: "rgba(165, 0, 89, 0.7)" }}
                    >
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SlideRevealWrapper>

          {/* CTA Card */}
          <SlideRevealWrapper direction="right">
            <div
              className="p-8 rounded-3xl h-full flex flex-col justify-between"
              style={{
                background:
                  "linear-gradient(135deg, rgba(165, 0, 89, 0.04), rgba(212, 175, 55, 0.06))",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(212, 175, 55, 0.12)",
              }}
            >
              <div>
                <h3
                  className="font-playfair text-xl font-semibold mb-3"
                  style={{ color: "#a50059" }}
                >
                  ¿Un pedido especial?
                </h3>
                <p
                  className="font-inter text-sm font-light leading-relaxed mb-6"
                  style={{ color: "rgba(165, 0, 89, 0.55)" }}
                >
                  Bodas, celebraciones, eventos corporativos...
                  Cada ocasión merece un postre a la altura. Cuéntanos tu
                  idea y la haremos realidad.
                </p>
              </div>

              <a
                href="https://wa.me/573001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 rounded-full font-inter text-sm font-semibold tracking-wide uppercase transition-all duration-500 hover:scale-[1.03] hover:shadow-xl"
                style={{
                  background: "linear-gradient(135deg, #d4af37, #c49b2f)",
                  color: "#fdfaf5",
                }}
              >
                Escríbenos por WhatsApp
              </a>
            </div>
          </SlideRevealWrapper>
        </div>
      </div>
    </section>
  );
}