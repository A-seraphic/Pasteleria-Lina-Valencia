/**
 * ReceiptTemplate — off-screen HTML template rendered by html2canvas.
 * Must be mounted in the DOM but positioned out of view.
 */
export default function ReceiptTemplate({ id, data }) {
  const { product, subcategory, sabor, bizcocho, porciones, fecha, detalles, orderCode } = data;

  return (
    <div
      id={id}
      style={{
        position: "fixed",
        left: "-9999px",
        top: 0,
        width: 480,
        background: "#fdfaf5",
        fontFamily: "'Georgia', serif",
        border: "2px solid #d4af37",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "none",
      }}
    >
      {/* Top gold bar */}
      <div style={{ background: "linear-gradient(135deg, #d4af37, #c49b2f)", height: 6 }} />

      {/* Header */}
      <div style={{ padding: "28px 36px 20px", borderBottom: "1px solid rgba(212,175,55,0.25)", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase", color: "#d4af37", marginBottom: 6 }}>
          Pastelería de Autor
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#a50059", letterSpacing: "0.02em" }}>
          Lina Valencia
        </div>
        <div style={{ fontSize: 12, color: "rgba(165,0,89,0.45)", marginTop: 4, fontStyle: "italic" }}>
          Recibo de Pedido
        </div>
      </div>

      {/* Order code + date */}
      <div style={{ padding: "16px 36px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(212,175,55,0.07)" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(165,0,89,0.4)" }}>Código de pedido</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#d4af37", marginTop: 2 }}>{orderCode}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(165,0,89,0.4)" }}>Fecha de pedido</div>
          <div style={{ fontSize: 13, color: "#a50059", marginTop: 2 }}>{new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}</div>
        </div>
      </div>

      {/* Divider ornament */}
      <div style={{ textAlign: "center", color: "#d4af37", fontSize: 18, padding: "8px 0", letterSpacing: 8 }}>
        ✦ · · · ✦
      </div>

      {/* Details */}
      <div style={{ padding: "0 36px 24px" }}>
        {[
          { label: "Producto", value: product.name },
          { label: "Variedad / Diseño", value: sabor || subcategory?.name },
          { label: "Sabor de bizcocho", value: bizcocho },
          { label: "Porciones", value: porciones || "No especificado" },
          { label: "Fecha del evento", value: fecha || "No especificada" },
          { label: "Notas especiales", value: detalles || "Sin notas adicionales" },
          { label: "Precio referencia", value: subcategory?.price },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(212,175,55,0.12)" }}>
            <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(165,0,89,0.45)", maxWidth: 160 }}>{label}</span>
            <span style={{ fontSize: 13, color: "#a50059", fontWeight: 600, textAlign: "right", maxWidth: 240, wordBreak: "break-word" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Bottom gold bar + footnote */}
      <div style={{ background: "linear-gradient(135deg, #d4af37, #c49b2f)", padding: "14px 36px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: "rgba(253,250,245,0.8)", letterSpacing: "0.15em" }}>
          linavalenciapasteleria.com
        </span>
        <span style={{ fontSize: 10, color: "rgba(253,250,245,0.7)", fontStyle: "italic" }}>
          Hecho con amor 🎂
        </span>
      </div>
    </div>
  );
}