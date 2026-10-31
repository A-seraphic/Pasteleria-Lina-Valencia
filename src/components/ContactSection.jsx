import SlideRevealWrapper from "./SlideRevealWrapper";
import { MapPin, Phone, Clock, Instagram, ArrowUpRight } from "lucide-react";
import { SITE, whatsappUrl, instagramUrl, mapsUrl } from "@/data/site";

const ROWS = [
  { icon: MapPin, label: "Visítanos", text: SITE.address, href: mapsUrl() },
  { icon: Phone, label: "Llámanos", text: SITE.phoneLabel, href: `tel:+${SITE.whatsapp}` },
  { icon: Instagram, label: "Instagram", text: `@${SITE.instagram}`, href: instagramUrl() },
  { icon: Clock, label: "Horario", text: SITE.hours },
];

export default function ContactSection() {
  return (
    <section id="contacto" className="relative py-20 md:py-36 px-5 md:px-6">
      <div className="max-w-5xl mx-auto">
        <SlideRevealWrapper direction="up" className="text-center mb-10 md:mb-16">
          <span className="font-inter text-[11px] tracking-[0.4em] uppercase font-medium" style={{ color: "#d4af37" }}>
            Hablemos
          </span>
          <h2 className="font-playfair text-[34px] md:text-5xl font-semibold mt-3" style={{ color: "#a50059" }}>
            Hagamos tu <span className="italic font-normal text-shimmer">celebración</span>
          </h2>
        </SlideRevealWrapper>

        <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-4 md:gap-6">
          {/* Tarjeta principal */}
          <SlideRevealWrapper direction="up">
            <div className="relative h-full rounded-[30px] p-7 md:p-10 overflow-hidden"
              style={{ background: "linear-gradient(150deg,#a50059 0%,#7d0044 60%,#5c0032 100%)", boxShadow: "0 30px 70px -20px rgba(165,0,89,0.55)" }}>
              <div aria-hidden className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ border: "1.5px solid rgba(247,227,161,0.25)" }} />
              <div aria-hidden className="absolute -right-6 -top-6 w-32 h-32 rounded-full" style={{ border: "1.5px solid rgba(247,227,161,0.18)" }} />
              <span className="font-inter text-[10px] tracking-[0.3em] uppercase" style={{ color: "#f7e3a1" }}>Pedidos personalizados</span>
              <h3 className="font-playfair text-[28px] md:text-4xl font-semibold leading-tight mt-3 mb-4 text-white">
                ¿Tienes una idea? <br /><span className="italic font-normal" style={{ color: "#f7e3a1" }}>La hacemos realidad.</span>
              </h3>
              <p className="font-inter text-[14px] font-light leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.75)" }}>
                Bodas, cumpleaños, quince años, eventos corporativos. Cuéntanos la fecha, el número de invitados y la temática y te enviamos una propuesta.
              </p>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="ar-cta flex items-center justify-center gap-2 w-full px-6 py-4 rounded-2xl font-inter text-[13px] font-semibold tracking-[0.12em] uppercase active:scale-[0.98] transition-transform"
                style={{ background: "#25d366", color: "#fff", boxShadow: "0 14px 30px rgba(0,0,0,0.25)" }}
              >
                Escríbenos por WhatsApp
              </a>
            </div>
          </SlideRevealWrapper>

          {/* Datos de contacto, todos tocables */}
          <SlideRevealWrapper direction="up" delay={0.1}>
            <ul className="h-full rounded-[30px] p-2.5 flex flex-col"
              style={{ background: "rgba(253,250,245,0.78)", backdropFilter: "blur(16px)", border: "1px solid rgba(212,175,55,0.18)" }}>
              {ROWS.map(({ icon: Icon, label, text, href }) => {
                const content = (
                  <>
                    <span className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(212,175,55,0.14)" }}>
                      <Icon size={18} style={{ color: "#b8912a" }} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-inter text-[10px] tracking-[0.2em] uppercase" style={{ color: "rgba(165,0,89,0.45)" }}>{label}</span>
                      <span className="block font-inter text-[14px] truncate" style={{ color: "#a50059" }}>{text}</span>
                    </span>
                    {href && <ArrowUpRight size={16} style={{ color: "#d4af37" }} />}
                  </>
                );
                return (
                  <li key={label} className="flex-1">
                    {href ? (
                      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                        className="h-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-colors hover:bg-[rgba(212,175,55,0.08)] active:bg-[rgba(212,175,55,0.14)]">
                        {content}
                      </a>
                    ) : (
                      <div className="h-full flex items-center gap-3.5 p-3.5">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </SlideRevealWrapper>
        </div>
      </div>
    </section>
  );
}
