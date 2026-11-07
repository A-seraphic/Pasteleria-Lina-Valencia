// Íconos de línea del manual de marca: corazón, cupcake, porción de torta y manga pastelera
const base = { fill: "none", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };

export function HeartIcon({ size = 24, color = "currentColor", ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...p}>
      <path {...base} style={{ stroke: color }} d="M12 20s-7.5-4.6-9.2-9.1C1.6 7.6 3.7 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.3 0 5.4 3.1 4.2 6.4C19.5 15.4 12 20 12 20z" />
    </svg>
  );
}

export function CupcakeIcon({ size = 24, color = "currentColor", ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...p}>
      <g {...base} style={{ stroke: color }}>
        <path d="M5 12.5h14l-1.8 8a1 1 0 0 1-1 .8H7.8a1 1 0 0 1-1-.8z" />
        <path d="M9 12.5l.6 8.8M15 12.5l-.6 8.8M12 12.5v8.8" />
        <path d="M4.6 12.5c-1.4-2.4.6-5 3-4.3.3-2.3 2.3-3.6 4.4-3.1 2.4-.6 4.6 1.2 4.3 3.4 2.5-.3 4 2.4 3 4" />
        <circle cx="12" cy="3.4" r="1.1" />
      </g>
    </svg>
  );
}

export function SliceIcon({ size = 24, color = "currentColor", ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...p}>
      <g {...base} style={{ stroke: color }}>
        <path d="M3 13.5L18 6.5l3 4.2v8.6H3z" />
        <path d="M3 16.5h18M18 6.5v12.8" />
        <path d="M14.2 6.8c.2-1.6 1.4-2.6 2.7-2.3 1.4.3 1.9 1.7 1.1 3" />
      </g>
    </svg>
  );
}

export function PipingIcon({ size = 24, color = "currentColor", ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...p}>
      <g {...base} style={{ stroke: color }}>
        <path d="M14.5 3.5c2.6 0 5.5 2.9 5.5 5.5l-8.6 8.6-5.5-5.5z" />
        <path d="M5.9 12.1l-1.6 5.4 2.2 2.2 5.4-1.6" />
        <path d="M4.3 17.5l-1.6 3.8 3.8-1.6" />
      </g>
    </svg>
  );
}

export const BRAND_ICONS = [HeartIcon, CupcakeIcon, SliceIcon, PipingIcon];
