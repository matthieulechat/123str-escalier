import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Pt, StairResult } from "../stair.ts";

// Matériaux partagés entre les reconstructions (seule la géométrie change avec les cotes).
const MAT = {
  brut: new THREE.MeshStandardMaterial({
    color: "#9ca3af",
    side: THREE.DoubleSide,
  }),
  balanced: new THREE.MeshStandardMaterial({
    color: "#38bdf8",
    side: THREE.DoubleSide,
  }),
  fini: new THREE.MeshStandardMaterial({
    color: "#d6b98a",
    side: THREE.DoubleSide,
  }),
  edge: new THREE.LineBasicMaterial({ color: "#334155" }),
  wall: new THREE.MeshStandardMaterial({
    color: "#cbd5e1",
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),
};

interface Vertex {
  p: Pt;
  len: number; // abscisse curviligne sur sa ligne (jour ou mur)
}

// Sommets de `line` dont l'abscisse curviligne est strictement entre a et b (coins du mur, arc du jour).
const between = (line: Pt[], a: number, b: number): Vertex[] => {
  const out: Vertex[] = [];
  let acc = 0;
  line.forEach((p, i) => {
    if (i > 0) acc += Math.hypot(p.x - line[i - 1].x, p.y - line[i - 1].y);
    if (acc > a + 1e-6 && acc < b - 1e-6) out.push({ p, len: acc });
  });
  return out;
};

// Solide vertical sur le polygone en plan : dessus plat au niveau `top`, dessous au niveau `bottom[i]` de chaque sommet.
// Repère three : x = x du plan, y = niveau, z = y du plan (vue de dessus identique au Plan).
const solid = (
  pts: Pt[],
  bottom: number[],
  top: number,
  flip: number,
): THREE.BufferGeometry => {
  // Les angles vifs du jour donnent des sommets en double : la triangulation ne les supporte pas.
  const keep = pts.map(
    (p, i) =>
      i === 0 || Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) > 1e-6,
  );
  const P = pts.filter((_, i) => keep[i]);
  const B = bottom.filter((_, i) => keep[i]);
  const v = (i: number, up: boolean) => [
    P[i].x,
    up ? top : B[i],
    flip * P[i].y,
  ];
  const pos: number[] = [];
  THREE.ShapeUtils.triangulateShape(
    P.map((p) => new THREE.Vector2(p.x, p.y)),
    [],
  ).forEach(([a, b, c]) =>
    pos.push(
      ...v(a, true),
      ...v(b, true),
      ...v(c, true),
      ...v(c, false),
      ...v(b, false),
      ...v(a, false),
    ),
  );
  P.forEach((_, i) => {
    const j = (i + 1) % P.length;
    pos.push(
      ...v(i, true),
      ...v(i, false),
      ...v(j, false),
      ...v(i, true),
      ...v(j, false),
      ...v(j, true),
    );
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals(); // non indexé : une normale par face (rendu à facettes)
  return geo;
};

// Un seul maillage par matériau : quelques appels de dessin au lieu d'un par marche.
const merged = (geos: THREE.BufferGeometry[], mat: THREE.Material): THREE.Group => {
  const g = new THREE.Group();
  if (!geos.length) return g;
  const geo = mergeGeometries(geos);
  geos.forEach((x) => x.dispose());
  g.add(new THREE.Mesh(geo, mat));
  return g;
};

const buildStair = (
  r: StairResult,
): { stair: THREE.Group; finish: THREE.Group; balanced: THREE.Group } => {
  const flip = r.input.sens === "gauche" ? -1 : 1;
  const { risers, rows, innerLine, outerLine, n, h, g, input } = r;
  const geos = { brut: [] as THREE.BufferGeometry[], balanced: [] as THREE.BufferGeometry[], fini: [] as THREE.BufferGeometry[] };

  // Sous-face de paillasse (même convention que la Coupe) : parallèle aux angles rentrants bruts,
  // décalée de l'épaisseur perpendiculaire ; posée sur le sol brut en bas, sous la dalle du palier en haut.
  // ponytail: pente prise sur la ligne de foulée, la sous-face des balancées est la surface réglée entre contremarches.
  const off = input.paillasse * Math.hypot(1, h / g);
  const zMax = r.nbHaut - input.dalleHaut;
  const soffit = (j: number) =>
    Math.min(
      Math.max(input.nfBas + j * h - input.finMarche - off, r.nbBas),
      zMax,
    );
  const lerp = (za: number, zb: number, la: number, lb: number, l: number) =>
    za + ((zb - za) * (l - la)) / (lb - la);

  // Arêtes tracées à la main (et non EdgesGeometry) : les blocs de marche se touchent sans partager
  // leurs sommets, ce qui dessinait des traits parasites sur les flancs.
  const lines: number[] = [];
  const finiLines: number[] = []; // suivent la coche des finitions
  const seg = (p: Pt, zp: number, q: Pt, zq: number, out = lines) => out.push(p.x, zp, flip * p.y, q.x, zq, flip * q.y);
  const poly = (pts: Pt[], zs: number[], close: boolean, out = lines) =>
    pts.forEach((p, k) => (k < pts.length - 1 || close) && seg(p, zs[k], pts[(k + 1) % pts.length], zs[(k + 1) % pts.length], out));
  const lineMesh = (pos: number[]) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return new THREE.LineSegments(geo, MAT.edge);
  };

  for (let i = 0; i < n - 1; i++) {
    const a = risers[i];
    const b = risers[i + 1];
    const [za, zb] = [soffit(i), soffit(i + 1)];
    const inner = between(innerLine, a.u, b.u);
    const outer = between(outerLine, a.outerLen, b.outerLen).reverse();
    const top = rows[i].nb;
    const pts = [
      a.brutInner,
      ...inner.map((x) => x.p),
      b.brutInner,
      b.brutOuter,
      ...outer.map((x) => x.p),
      a.brutOuter,
    ];
    const bottom = [
      za,
      ...inner.map((x) => lerp(za, zb, a.u, b.u, x.len)),
      zb,
      zb,
      ...outer.map((x) => lerp(za, zb, a.outerLen, b.outerLen, x.len)),
      za,
    ].map((z) => Math.min(z, top - 1));
    geos[a.balanced || b.balanced ? "balanced" : "brut"].push(solid(pts, bottom, top, flip));

    // Contour du giron, sous-face le long du jour et du mur, arêtes verticales des contremarches.
    const ni = inner.length;
    poly(pts, pts.map(() => top), true);
    poly(pts.slice(0, ni + 2), bottom.slice(0, ni + 2), false);
    poly(pts.slice(ni + 2).concat(pts[0]), bottom.slice(ni + 2).concat(bottom[0]), false);
    const zLow = i === 0 ? za : rows[i - 1].nb; // pied de la contremarche de départ de ce bloc
    seg(a.brutInner, zLow, a.brutInner, top);
    seg(a.brutOuter, zLow, a.brutOuter, top);
    if (i === 0) seg(a.brutInner, za, a.brutOuter, za);
    if (i === n - 2) {
      seg(b.brutInner, zb, b.brutInner, top);
      seg(b.brutOuter, zb, b.brutOuter, top);
      seg(b.brutInner, zb, b.brutOuter, zb);
    }

    if (input.finMarche > 0) {
      const fini = [
        a.inner,
        ...inner.map((x) => x.p),
        b.inner,
        b.outer,
        ...outer.map((x) => x.p),
        a.outer,
      ];
      geos.fini.push(solid(fini, fini.map(() => top), rows[i].nf, flip));
      poly(fini, fini.map(() => rows[i].nf), true, finiLines);
    }
  }

  // Finition des contremarches : entre la face brute et la face finie, du dessus brut de la marche inférieure
  // (sol brut au départ) jusque sous la finition de la marche.
  if (input.finContremarche > 0)
    risers.forEach((x, j) => {
      const bottom = j === 0 ? r.nbBas : rows[j - 1].nb;
      geos.fini.push(solid([x.inner, x.outer, x.brutOuter, x.brutInner], [bottom, bottom, bottom, bottom], rows[j].nb, flip));
    });
  const stair = new THREE.Group();
  const finish = merged(geos.fini, MAT.fini);
  const balanced = merged(geos.balanced, MAT.balanced);
  stair.add(merged(geos.brut, MAT.brut), balanced, finish);
  stair.add(lineMesh(lines));
  finish.add(lineMesh(finiLines));

  // Mur extérieur translucide, du niveau brut bas au niveau fini haut.
  const pos: number[] = [];
  outerLine.forEach((p) =>
    pos.push(p.x, r.nbBas, flip * p.y, p.x, input.nfHaut, flip * p.y),
  );
  const idx: number[] = [];
  for (let k = 0; k < outerLine.length - 1; k++)
    idx.push(2 * k, 2 * k + 1, 2 * k + 2, 2 * k + 1, 2 * k + 3, 2 * k + 2);
  const wall = new THREE.BufferGeometry();
  wall.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  wall.setIndex(idx);
  wall.computeVertexNormals();
  stair.add(new THREE.Mesh(wall, MAT.wall));
  return { stair, finish, balanced };
};

// Les matériaux sont partagés : on ne libère que les géométries.
const disposeGeometries = (g: THREE.Object3D) =>
  g.traverse((o) => {
    if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments)
      o.geometry.dispose();
  });

interface Scene3DProps {
  r: StairResult;
  showFinish: boolean;
  showBalanced: boolean; // bleu sur les marches balancées, sinon couleur du béton
}

// Vue 3D orbitale. Un seul contexte WebGL ; seule la géométrie est reconstruite à chaque calcul.
const Scene3D = ({ r, showFinish, showBalanced }: Scene3DProps) => {
  const host = useRef<HTMLDivElement>(null);
  const ctx = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    render: () => void;
    placed: boolean; // cadrage initial fait pour cette scène
    finish?: THREE.Group;
    balanced?: THREE.Group;
  } | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // ponytail: plafonné pour la fluidité sur écrans haute densité
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight("#ffffff", "#64748b", 2));
    const sun = new THREE.DirectionalLight("#ffffff", 2);
    sun.position.set(-1, 3, 2);
    scene.add(sun);
    const camera = new THREE.PerspectiveCamera(40, 1, 1, 20000);
    const controls = new OrbitControls(camera, renderer.domElement);
    const render = () => renderer.render(scene, camera);
    controls.addEventListener("change", render);
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return; // volet masqué (saisie invalide)
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      render();
    });
    ro.observe(el);
    ctx.current = { scene, camera, controls, render, placed: false };
    return () => {
      ro.disconnect();
      controls.dispose();
      disposeGeometries(scene);
      renderer.dispose();
      renderer.domElement.remove();
      ctx.current = null;
    };
  }, []);

  useEffect(() => {
    const c = ctx.current;
    if (!c) return;
    const { stair, finish, balanced } = buildStair(r);
    c.scene.add(stair);
    c.finish = finish;
    c.balanced = balanced;
    // Cadrage initial seulement : la caméra reste où l'utilisateur l'a mise quand les cotes changent.
    if (!c.placed) {
      const box = new THREE.Box3().setFromObject(stair);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3()).length();
      c.camera.position
        .copy(center)
        .add(new THREE.Vector3(-0.7, 0.6, 0.9).multiplyScalar(size));
      c.controls.target.copy(center);
      c.controls.update();
      c.placed = true;
    }
    return () => {
      c.scene.remove(stair);
      disposeGeometries(stair);
    };
  }, [r]);

  // Après la reconstruction (effet précédent) : affiche ou masque les finitions, puis redessine.
  useEffect(() => {
    const c = ctx.current;
    if (!c?.finish) return;
    c.finish.visible = showFinish;
    c.balanced?.children.forEach((o) => {
      if (o instanceof THREE.Mesh) o.material = showBalanced ? MAT.balanced : MAT.brut;
    });
    c.render();
  }, [r, showFinish, showBalanced]);

  return (
    <div
      ref={host}
      className="h-[28rem] w-full cursor-grab touch-none active:cursor-grabbing"
      role="img"
      aria-label="Vue 3D de l'escalier, orientable à la souris"
    />
  );
};

export default Scene3D;
