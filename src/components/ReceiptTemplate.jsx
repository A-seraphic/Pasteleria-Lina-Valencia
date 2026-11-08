import { formatCOP } from "@/data/defaults";

/**
 * ReceiptTemplate — el recibo que se descarga como imagen (html2canvas).
 * Todo lo que imprime viene de los ajustes del panel (receipt) y de lo que eligió el cliente.
 * preview: se dibuja en pantalla (vista previa del panel) en vez de fuera de la vista.
 *
 * data: { product, design, rows: [{ label, value, price }], answers: [{ label, value }],
 *         fecha, detalles, note, total, orderCode, receipt }
 */
export default function ReceiptTemplate({ id, data, preview = false }) {
  const { product, design, rows = [], answers = [], fecha, detalles, note, total, orderCode, receipt: r = {} } = data;
  const lineStyle = { display: "flex", justifyContent: "space-between", gap: 16, padding: "9px 0", borderBottom: "1px solid rgba(212,175,55,0.16)" };
  const labelStyle = { fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(165,0,89,0.5)", maxWidth: 170, flexShrink: 0 };
  const valueStyle = { fontSize: 13.5, color: "#5c0032", fontWeight: 600, textAlign: "right", wordBreak: "break-word" };
  const price = (n) => (r.showPrices && n ? <span style={{ display: "block", fontSize: 11.5, color: "#b8912a", fontWeight: 600 }}>+ {formatCOP(n)}</span> : null);

  const lines = [
    { label: "Producto", value: product?.name },
    { label: "Diseño", value: design },
    ...rows,
    ...answers,
    ...(r.showEventDate ? [{ label: "Fecha del evento", value: fecha || "Por definir" }] : []),
    ...(r.showNotes ? [{ label: "Notas", value: detalles || "Sin notas" }] : []),
  ].filter((l) => l.value);

  return (
    <div
      id={id}
      style={{
        position: preview ? "relative" : "fixed",
        left: preview ? 0 : "-9999px",
        top: 0,
        width: 480,
        background: "#fffdf8",
        fontFamily: "'Georgia', serif",
        border: "2px solid #d4af37",
        borderRadius: 24,
        overflow: "hidden",
      }}
    >
      <div style={{ background: "linear-gradient(135deg, #e91e8c, #a50059)", height: 7 }} />

      <div style={{ padding: "26px 34px 18px", textAlign: "center", borderBottom: "1px solid rgba(212,175,55,0.25)" }}>
        <img src="/brand/logo.png" alt="" crossOrigin="anonymous" style={{ width: 170, height: "auto", margin: "0 auto 6px", display: "block" }} />
        {r.title && <div style={{ fontSize: 26, fontWeight: 700, color: "#a50059" }}>{r.title}</div>}
        {r.subtitle && <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#b8912a", marginTop: 4 }}>{r.subtitle}</div>}
        {r.heading && <div style={{ fontSize: 13, color: "rgba(165,0,89,0.55)", marginTop: 6, fontStyle: "italic" }}>{r.heading}</div>}
      </div>

      <div style={{ padding: "14px 34px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(248,187,208,0.18)" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(165,0,89,0.45)" }}>Código</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#b8912a", marginTop: 2 }}>{orderCode}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(165,0,89,0.45)" }}>Fecha de pedido</div>
          <div style={{ fontSize: 13, color: "#a50059", marginTop: 2 }}>{new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}</div>
        </div>
      </div>

      <div style={{ padding: "6px 34px 10px" }}>
        {lines.map(({ label, value, price: p }, i) => (
          <div key={`${label}-${i}`} style={lineStyle}>
            <span style={labelStyle}>{label}</span>
            <span style={valueStyle}>{value}{price(p)}</span>
          </div>
        ))}
      </div>

      {r.showTotal && total > 0 && (
        <div style={{ margin: "4px 34px 14px", padding: "14px 18px", borderRadius: 16, background: "#5c0032", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(253,250,245,0.75)" }}>Total estimado</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: "#f3dc9a" }}>{formatCOP(total)}</span>
        </div>
      )}

      {note && (
        <div style={{ margin: "0 34px 12px", fontSize: 12.5, lineHeight: 1.5, color: "#5c0032", background: "rgba(212,175,55,0.1)", borderRadius: 12, padding: "10px 14px" }}>
          {note}
        </div>
      )}
      {r.showTerms && r.terms && (
        <div style={{ margin: "0 34px 18px", fontSize: 11.5, lineHeight: 1.55, color: "rgba(92,0,50,0.7)", fontStyle: "italic" }}>{r.terms}</div>
      )}

      <div style={{ background: "linear-gradient(135deg, #d4af37, #c49b2f)", padding: "13px 34px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10.5, color: "rgba(253,250,245,0.9)", letterSpacing: "0.12em" }}>{r.footerLeft}</span>
        <span style={{ fontSize: 10.5, color: "rgba(253,250,245,0.85)", fontStyle: "italic" }}>{r.footerRight}</span>
      </div>
    </div>
  );
}
