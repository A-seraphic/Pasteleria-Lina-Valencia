import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildCakeScene } from "@/lib/cake3d";
import { tierLayout } from "@/lib/cakeSpecs";

const easeOutBack = (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/**
 * Escenario 3D de la guía de porciones (three.js directo, sin recargas):
 * la torta crece o se encoge al cambiar de tamaño, la porción se desliza afuera,
 * y se gira arrastrando con el dedo (con inercia).
 */
export default function CakeStage({ portion, slices, frosting = "rosa" }) {
  const mountRef = useRef(null);
  const api = useRef(null);

  // Montaje único del renderer
  useEffect(() => {
    const mount = mountRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "pan-y";
    renderer.domElement.style.cursor = "grab";

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 20);
    const target = new THREE.Vector3(0, 0.07, 0);

    scene.add(new THREE.HemisphereLight(0xfff2f6, 0x5c0032, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(0.6, 1.3, 0.8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = key.shadow.camera.bottom = -0.5;
    key.shadow.camera.right = key.shadow.camera.top = 0.5;
    key.shadow.radius = 6;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xf3dc9a, 1.2);
    rim.position.set(-0.8, 0.6, -0.9);
    scene.add(rim);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.ShadowMaterial({ opacity: 0.3 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const turntable = new THREE.Group();
    scene.add(turntable);

    const state = {
      cake: null, anims: [],
      dist: 0.9, distTo: 0.9, targetYTo: 0.07,
      rotY: -0.5, vel: 0.0025, dragging: false, lastX: 0, idleAt: 0,
      visible: true, raf: 0,
    };

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // Arrastre horizontal para girar; el vertical deja hacer scroll
    const el = renderer.domElement;
    const down = (e) => { state.dragging = true; state.lastX = e.clientX; el.style.cursor = "grabbing"; };
    const move = (e) => {
      if (!state.dragging) return;
      const dx = e.clientX - state.lastX;
      state.lastX = e.clientX;
      state.vel = dx * 0.006;
      state.rotY += state.vel;
    };
    const up = () => { state.dragging = false; state.idleAt = performance.now(); el.style.cursor = "grab"; };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);

    const loop = (now) => {
      // Inercia y vuelta suave al giro automático
      if (!state.dragging) {
        const auto = now - state.idleAt > 1800 ? 0.0028 : 0;
        state.vel += (auto - state.vel) * 0.03;
        state.rotY += state.vel;
      }
      turntable.rotation.y = state.rotY;

      state.dist += (state.distTo - state.dist) * 0.06;
      target.y += (state.targetYTo - target.y) * 0.06;
      const phi = THREE.MathUtils.degToRad(64);
      camera.position.set(0, target.y + state.dist * Math.cos(phi), state.dist * Math.sin(phi));
      camera.lookAt(target);

      state.anims = state.anims.filter((a) => {
        const k = Math.min(1, (now - a.start) / a.dur);
        if (k >= 0) a.step(a.ease(k));
        return k < 1;
      });

      renderer.render(scene, camera);
      if (state.visible) state.raf = requestAnimationFrame(loop);
    };
    state.raf = requestAnimationFrame(loop);

    const io = new IntersectionObserver(([e]) => {
      state.visible = e.isIntersecting;
      cancelAnimationFrame(state.raf);
      if (state.visible) state.raf = requestAnimationFrame(loop);
    });
    io.observe(mount);

    api.current = { THREE, scene, turntable, state };

    return () => {
      cancelAnimationFrame(state.raf);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      pmrem.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  // Cambio de torta: transición de escala y porción que se desliza
  useEffect(() => {
    const a = api.current;
    if (!a || !portion) return;
    const { turntable, state } = a;
    const params = {
      diameter: Number(portion.diameter), height: Number(portion.height),
      tiers: Number(portion.tiers) || 1, slices: Number(slices) || 1, frosting, pulled: true,
    };
    const next = buildCakeScene(params).children[0];
    const prev = state.cake;
    const prevD = prev?.userData.diameter || params.diameter;
    next.userData.diameter = params.diameter;

    const now = performance.now();
    if (prev) {
      state.anims.push({ start: now, dur: 260, ease: easeOut, step: (k) => prev.scale.setScalar(1 - 0.15 * k) });
      setTimeout(() => { turntable.remove(prev); prev.traverse((o) => o.geometry?.dispose()); }, 260);
    }
    const from = Math.min(1.6, Math.max(0.5, prevD / params.diameter));
    next.scale.setScalar(prev ? from : 0.6);
    turntable.add(next);
    state.anims.push({ start: now + (prev ? 120 : 0), dur: 820, ease: easeOutBack, step: (k) => next.scale.setScalar(from + (1 - from) * k) });

    let pulled;
    next.traverse((o) => { if (o.userData.pulled) pulled = o; });
    if (pulled) {
      const { from: f, to: t } = pulled.userData.pulled;
      pulled.position.fromArray(f);
      state.anims.push({
        start: now + 650, dur: 900, ease: easeOut,
        step: (k) => pulled.position.set(f[0] + (t[0] - f[0]) * k, f[1] + (t[1] - f[1]) * k + Math.sin(k * Math.PI) * 0.02, f[2] + (t[2] - f[2]) * k),
      });
    }
    state.cake = next;

    // Encuadre según el tamaño de la torta
    const layout = tierLayout(params);
    const top = layout.reduce((h, t) => h + t.h, 0);
    state.distTo = 0.52 + (params.diameter / 30) * 0.42 + Math.max(0, top - 12) / 60;
    state.targetYTo = Math.max(0.07, (top / 100 + 0.01) * 0.5);
  }, [portion?.id, portion?.diameter, portion?.height, portion?.tiers, slices, frosting]);


  return <div ref={mountRef} className="absolute inset-0" aria-label="Torta 3D que puedes girar arrastrando" role="img" />;
}
