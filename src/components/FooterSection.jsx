export default function FooterSection() {
  return (
    <footer className="relative py-12 px-6 text-center">
      <div
        className="w-24 h-[1px] mx-auto mb-8"
        style={{ background: "rgba(212, 175, 55, 0.3)" }}
      />
      <span
        className="font-playfair text-2xl font-semibold"
        style={{ color: "#a50059" }}
      >
        Lina Valencia
      </span>
      <p
        className="font-inter text-xs tracking-[0.3em] uppercase mt-2 font-light"
        style={{ color: "rgba(212, 175, 55, 0.6)" }}
      >
        Pastelería Artesanal
      </p>
      <p
        className="font-inter text-xs mt-6"
        style={{ color: "rgba(165, 0, 89, 0.3)" }}
      >
        © {new Date().getFullYear()} Lina Valencia Pastelería. Todos los derechos reservados.
      </p>
    </footer>
  );
}