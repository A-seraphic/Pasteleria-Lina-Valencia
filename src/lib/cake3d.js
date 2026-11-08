import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { FROSTINGS, tierLayout } from "./cakeSpecs";

const SPONGE = "#f1d6a6";
const FILLING = "#c2185b";
const GOLD = "#d4af37";
const cm = (v) => v / 100; // el modelo se exporta en metros para la escala real

const cache = new Map();

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0, ...opts });
}

// Cuña cerrada (con caras de corte) entre los ángulos a0 y a1, de alto h, apoyada en y0
function wedge(r, a0, a1, h, y0, material) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(r * Math.cos(a0), r * Math.sin(a0));
  shape.absarc(0, 0, r, a0, a1, false);
  shape.lineTo(0, 0);
  const segs = Math.max(3, Math.ceil(((a1 - a0) / (Math.PI * 2)) * 72));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: segs });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, y0, 0);
  return new THREE.Mesh(geo, material);
}

// Reparte las porciones entre pisos según el área de cada uno
function slicesPerTier(layout, total) {
  const areas = layout.map((t) => t.d * t.d);
  const sum = areas.reduce((a, b) => a + b, 0);
  const counts = areas.map((a) => Math.max(layout.length > 1 ? 4 : 1, Math.round((a / sum) * total)));
  counts[0] += total - counts.reduce((a, b) => a + b, 0);
  counts[0] = Math.max(1, counts[0]);
  return counts;
}

export function buildCakeScene({ diameter = 20, height = 10, tiers = 1, slices = 8, frosting = "rosa", pulled = true }) {
  const palette = FROSTINGS[frosting] || FROSTINGS.rosa;
  const m = {
    sponge: mat(SPONGE, { roughness: 0.9 }),
    filling: mat(FILLING, { roughness: 0.45 }),
    frosting: mat(palette.frosting, { roughness: 0.5, side: THREE.DoubleSide }),
    gold: mat(GOLD, { metalness: 0.85, roughness: 0.28 }),
    accent: mat(palette.accent, { roughness: 0.4 }),
    board: mat("#ffffff", { roughness: 0.35 }),
  };
  // Caras de corte más oscuras: así se distingue dónde va cada porción
  const shadeOf = (material, k) => {
    const c = material.clone();
    c.color = material.color.clone().multiplyScalar(k);
    c.side = THREE.FrontSide;
    return c;
  };
  const cut = {
    sponge: [m.sponge, shadeOf(m.sponge, 0.6)],
    filling: [m.filling, shadeOf(m.filling, 0.6)],
    frosting: [m.frosting, shadeOf(m.frosting, 0.55)],
  };

  const root = new THREE.Group();
  const layout = tierLayout({ diameter, height, tiers });
  const counts = slicesPerTier(layout, slices);
  const gap = cm(0.55); // separación entre porciones: deja ver el corte

  // Base de presentación
  const boardR = cm(layout[0].d / 2 + 3);
  const board = new THREE.Mesh(new THREE.CylinderGeometry(boardR, boardR, cm(1), 64), m.board);
  board.position.y = cm(0.5);
  root.add(board);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(boardR, cm(0.25), 8, 64), m.gold);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = cm(1);
  root.add(rim);

  layout.forEach((tier, ti) => {
    const r = cm(tier.d / 2);
    const h = cm(tier.h);
    const y0 = cm(1) + cm(tier.y);
    const n = counts[ti];
    const tierGroup = new THREE.Group();

    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = ((i + 1) / n) * Math.PI * 2;
      const mid = (a0 + a1) / 2;
      const slice = new THREE.Group();
      const sponge = h * 0.4;
      const fill = h * 0.1;
      const top = h - sponge * 2 - fill;
      slice.add(wedge(r, a0, a1, sponge, 0, cut.sponge));
      slice.add(wedge(r, a0, a1, fill, sponge, cut.filling));
      slice.add(wedge(r, a0, a1, sponge, sponge + fill, cut.sponge));
      slice.add(wedge(r + cm(0.15), a0, a1, top, h - top, cut.frosting));
      // Cobertura exterior de la cuña
      const shell = new THREE.Mesh(
        new THREE.CylinderGeometry(r + cm(0.15), r + cm(0.15), h, Math.max(3, Math.ceil(72 / n)), 1, true, a0 + Math.PI / 2, a1 - a0),
        m.frosting
      );
      shell.position.y = h / 2;
      slice.add(shell);

      // Separación de corte; en el piso de abajo una porción sale para mostrar el tamaño
      const isPulled = pulled && ti === 0 && i === 0 && n > 1;
      const push = isPulled ? r * 0.32 : gap;
      slice.position.set(Math.cos(mid) * push, isPulled ? cm(0.6) : 0, -Math.sin(mid) * push);
      // El escenario animado usa estas posiciones para deslizar la porción hacia afuera
      if (isPulled) slice.userData.pulled = { from: [Math.cos(mid) * gap, 0, -Math.sin(mid) * gap], to: slice.position.toArray() };
      tierGroup.add(slice);
    }

    // Perlas doradas en el borde superior
    const pearls = Math.max(10, Math.round(tier.d * 2.2));
    const pearlGeo = new THREE.SphereGeometry(cm(0.45), 10, 8);
    for (let i = 0; i < pearls; i++) {
      const a = (i / pearls) * Math.PI * 2;
      const p = new THREE.Mesh(pearlGeo, m.gold);
      p.position.set(Math.cos(a) * (r - cm(0.6)), h + cm(0.25), -Math.sin(a) * (r - cm(0.6)));
      tierGroup.add(p);
    }
    // Rosetas en el piso más alto
    if (ti === layout.length - 1) {
      const rosettes = Math.min(8, Math.max(3, Math.round(tier.d / 4)));
      const rosetteGeo = new THREE.SphereGeometry(cm(1.1), 14, 10);
      for (let i = 0; i < rosettes; i++) {
        const a = (i / rosettes) * Math.PI * 2 + 0.3;
        const ro = new THREE.Mesh(rosetteGeo, m.accent);
        ro.scale.y = 0.6;
        ro.position.set(Math.cos(a) * r * 0.5, h + cm(0.5), -Math.sin(a) * r * 0.5);
        tierGroup.add(ro);
      }
    }

    tierGroup.position.y = y0;
    root.add(tierGroup);
  });

  root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const scene = new THREE.Scene();
  scene.add(root);
  return scene;
}

// Devuelve una URL blob .glb lista para <model-viewer>
export async function buildCakeModelUrl(params) {
  const key = JSON.stringify(params);
  if (cache.has(key)) return cache.get(key);
  const promise = (async () => {
    const scene = buildCakeScene(params);
    const glb = await new GLTFExporter().parseAsync(scene, { binary: true });
    return URL.createObjectURL(new Blob([glb], { type: "model/gltf-binary" }));
  })();
  cache.set(key, promise);
  return promise;
}
