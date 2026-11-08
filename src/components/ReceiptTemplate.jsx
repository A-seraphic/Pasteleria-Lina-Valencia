import { formatCOP } from "@/data/defaults";

/**
 * ReceiptTemplate — el recibo que se descarga como imagen (html2canvas).
 * Todo lo que imprime viene de los ajustes del panel (receipt) y del pedido del cliente.
 * preview: se dibuja en pantalla (vista previa del panel) en vez de fuera de la vista.
 *
 * data: { items: [{ category, design, rows: [{ label, value, price }], answers: [{ label, value }], note, total, priceText }],
 *         fecha, detalles, total, orderCode, receipt }
 */
export default function ReceiptTemplate({ id, data, preview = false }) {
  const { items = [], fecha, detalles, total, orderCode, receipt: r = {} } = data;
  const lineStyle = { display: "flex", justifyContent: "space-between", gap: 16, padding: "7px 0", borderBottom: "1px solid rgba(212,175,55,0.14)" };
  const labelStyle = { fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(165,0,89,0.5)", maxWidth: 160, flexShrink: 0, paddingTop: 2 };
  const valueStyle = { fontSize: 13, color: "#5c0032", fontWeight: 600, textAlign: "right", wordBreak: "break-word" };
  const price = (n) => (r.showPrices && n ? <span style={{ display: "block", fontSize: 11, color: "#b8912a", fontWeight: 600 }}>+ {formatCOP(n)}</span> : null);
  const missingPrices = items.some((i) => !i.total);

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

      <div style={{ padding: "24px 34px 16px", textAlign: "center", borderBottom: "1px solid rgba(212,175,55,0.25)" }}>
        <img src="/brand/logo.png" alt="" crossOrigin="anonymous" style={{ width: 160, height: "auto", margin: "0 auto 6px", display: "block" }} />
        {r.title && <div style={{ fontSize: 25, fontWeight: 700, color: "#a50059" }}>{r.title}</div>}
        {r.subtitle && <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#b8912a", marginTop: 4 }}>{r.subtitle}</div>}
        {r.heading && <div style={{ fontSize: 13, color: "rgba(165,0,89,0.55)", marginTop: 6, fontStyle: "italic" }}>{r.heading}</div>}
      </div>

      <div style={{ padding: "13px 34px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(248,187,208,0.18)" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(165,0,89,0.45)" }}>Código</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#b8912a", marginTop: 2 }}>{orderCode}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(165,0,89,0.45)" }}>Fecha de pedido</div>
          <div style={{ fontSize: 13, color: "#a50059", marginTop: 2 }}>{new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}</div>
        </div>
      </div>

      {/* Un bloque por producto */}
      {items.map((item, n) => (
        <div key={item.uid || n} style={{ padding: "12px 34px 6px", borderBottom: "6px solid rgba(248,187,208,0.25)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#a50059" }}>
              {items.length > 1 && <span style={{ color: "#b8912a", marginRight: 6 }}>{n + 1}.</span>}
              {item.design}
            </div>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(165,0,89,0.5)" }}>{item.category}</div>
          </div>
          <div style={{ marginTop: 4 }}>
            {[...(item.rows || []), ...(item.answers || [])].filter((l) => l.value).map(({ label, value, price: p }, i) => (
              <div key={`${label}-${i}`} style={lineStyle}>
                <span style={labelStyle}>{label}</span>
                <span style={valueStyle}>{value}{price(p)}</span>
              </div>
            ))}
          </div>
          {item.note && (
            <div style={{ fontSize: 12, lineHeight: 1.45, color: "#5c0032", background: "rgba(212,175,55,0.1)", borderRadius: 10, padding: "8px 12px", margin: "8px 0 4px" }}>
              {item.note}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 6px", fontSize: 12.5, color: "#a50059" }}>
            <span style={{ letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 10.5, color: "rgba(165,0,89,0.55)" }}>{items.length > 1 ? "Subtotal" : "Valor"}</span>
            <span style={{ fontWeight: 700 }}>{r.showTotal && item.total ? formatCOP(item.total) : item.priceText || "Por confirmar"}</span>
          </div>
        </div>
      ))}

      {(r.showEventDate || (r.showNotes && detalles)) && (
        <div style={{ padding: "6px 34px 4px" }}>
          {r.showEventDate && (
            <div style={lineStyle}><span style={labelStyle}>Fecha del evento</span><span style={valueStyle}>{fecha || "Por definir"}</span></div>
          )}
          {r.showNotes && detalles && (
            <div style={lineStyle}><span style={labelStyle}>Notas</span><span style={valueStyle}>{detalles}</span></div>
          )}
        </div>
      )}

      {r.showTotal && total > 0 && (
        <div style={{ margin: "12px 34px 12px", padding: "14px 18px", borderRadius: 16, background: "#5c0032" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(253,250,245,0.75)" }}>
              Total estimado{items.length > 1 ? ` · ${items.length} productos` : ""}
            </span>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#f3dc9a" }}>{formatCOP(total)}</span>
          </div>
          {missingPrices && <div style={{ fontSize: 10.5, color: "rgba(253,250,245,0.7)", marginTop: 4 }}>+ productos con precio por confirmar</div>}
        </div>
      )}

      {r.showTerms && r.terms && (
        <div style={{ margin: "4px 34px 18px", fontSize: 11.5, lineHeight: 1.55, color: "rgba(92,0,50,0.7)", fontStyle: "italic" }}>{r.terms}</div>
      )}

      <div style={{ background: "linear-gradient(135deg, #d4af37, #c49b2f)", padding: "13px 34px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10.5, color: "rgba(253,250,245,0.9)", letterSpacing: "0.12em" }}>{r.footerLeft}</span>
        <span style={{ fontSize: 10.5, color: "rgba(253,250,245,0.85)", fontStyle: "italic" }}>{r.footerRight}</span>
      </div>
    </div>
  );
}
