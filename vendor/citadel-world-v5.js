import {
  THREE,
  EffectComposer,
  RenderPass,
  UnrealBloomPass,
  OutputPass
} from './three-citadel-bundle.js';

/**
 * Builds a custom Dark Scholarly Study environment for PMREMGenerator
 * (0.07 linear study luminance, 2900K warm overhead astrolabe strips, 4800K cyan floor bounce)
 * so dark basalt (#111318) never washes out while brass (#B8924A/#D8B467) gleams with crisp speculars.
 */
function createDarkStudyEnvironment(THREE, renderer) {
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x06080C);

  // Overhead 2900K warm gold reflection rings
  const warmMat = new THREE.MeshBasicMaterial({ color: 0xFFB84D });
  const warmRing = new THREE.Mesh(new THREE.TorusGeometry(6.0, 0.45, 8, 48), warmMat);
  warmRing.rotation.x = Math.PI / 2;
  warmRing.position.y = 8.0;
  envScene.add(warmRing);

  // Side raking warm brass reflection panels
  const brassStripMat = new THREE.MeshBasicMaterial({ color: 0xD8B467 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(2.2, 5.5, 0.1), brassStripMat);
    panel.position.set(Math.cos(a) * 11.0, 3.5, Math.sin(a) * 11.0);
    panel.lookAt(0, 1.5, 0);
    envScene.add(panel);
  }

  // Subterranean 4800K cyan root bounce strip
  const cyanMat = new THREE.MeshBasicMaterial({ color: 0x2CE6D8 });
  const cyanRing = new THREE.Mesh(new THREE.TorusGeometry(4.5, 0.25, 8, 48), cyanMat);
  cyanRing.rotation.x = Math.PI / 2;
  cyanRing.position.y = -4.0;
  envScene.add(cyanRing);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(envScene, 0.035).texture;
  pmrem.dispose();
  return envTex;
}

/**
 * Generates a high-resolution 2048x2048 carved obsidian cartographic relief,
 * degree-tick vernier rings, N/E/S/W compass rose, and sunken harbor wave-groove map.
 */
function createCarvedTableTextures() {
  const size = 2048;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bctx = bumpCanvas.getContext('2d');

  const cx = size / 2;
  const cy = size / 2;

  // Base matte volcanic obsidian (#111318)
  ctx.fillStyle = '#0E1015';
  ctx.fillRect(0, 0, size, size);

  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, size, size);

  // Basalt micro-grain & fracture lines
  for (let i = 0; i < 7500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 1 + Math.random() * 2.5;
    const v = 12 + Math.floor(Math.random() * 12);
    ctx.fillStyle = `rgb(${v},${v + 2},${v + 5})`;
    ctx.fillRect(x, y, r, r);

    const bv = 108 + Math.floor(Math.random() * 40);
    bctx.fillStyle = `rgb(${bv},${bv},${bv})`;
    bctx.fillRect(x, y, r, r);
  }

  // Sunken Harbor Basin wave V-grooves in SE quadrant (between City and Bootcamp)
  ctx.save();
  bctx.save();
  for (let w = 1; w <= 30; w++) {
    const rad = 100 + w * 24;
    ctx.strokeStyle = w % 4 === 0 ? 'rgba(44, 230, 216, 0.18)' : 'rgba(42, 48, 60, 0.65)';
    ctx.lineWidth = w % 4 === 0 ? 2.2 : 1.4;
    ctx.beginPath();
    ctx.arc(cx + 340, cy - 40, rad, -0.7, 0.9);
    ctx.stroke();

    bctx.strokeStyle = '#383838';
    bctx.lineWidth = 2.2;
    ctx.beginPath();
    bctx.arc(cx + 340, cy - 40, rad, -0.7, 0.9);
    bctx.stroke();
  }
  ctx.restore();
  bctx.restore();

  // Concentric Engraved Brass & Basalt Astrolabe Latitude Graticules
  const ringRadii = [210, 310, 420, 540, 660, 775, 880, 955];
  ringRadii.forEach((r, idx) => {
    ctx.strokeStyle = idx % 2 === 0 ? 'rgba(216, 180, 103, 0.48)' : 'rgba(92, 71, 36, 0.55)';
    ctx.lineWidth = idx % 3 === 0 ? 3.2 : 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    bctx.strokeStyle = idx % 2 === 0 ? '#d8d8d8' : '#404040';
    bctx.lineWidth = 3.0;
    bctx.beginPath();
    bctx.arc(cx, cy, r, 0, Math.PI * 2);
    bctx.stroke();
  });

  // 360 Degree Vernier Ticks & 24 Meridian Radial Hairlines
  for (let deg = 0; deg < 360; deg += 2) {
    const a = (deg * Math.PI) / 180;
    const isMajor = deg % 30 === 0;
    const isMid = deg % 10 === 0;
    const r0 = 885;
    const r1 = isMajor ? 950 : isMid ? 928 : 906;

    ctx.strokeStyle = isMajor ? 'rgba(216, 180, 103, 0.85)' : 'rgba(184, 146, 74, 0.42)';
    ctx.lineWidth = isMajor ? 3.4 : 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.stroke();

    if (deg % 15 === 0) {
      ctx.strokeStyle = 'rgba(184, 146, 74, 0.18)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 215, cy + Math.sin(a) * 215);
      ctx.lineTo(cx + Math.cos(a) * 880, cy + Math.sin(a) * 880);
      ctx.stroke();
    }
  }

  const colorTex = new THREE.CanvasTexture(colorCanvas);
  colorTex.colorSpace = THREE.SRGBColorSpace;
  colorTex.anisotropy = 8;

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.anisotropy = 8;

  return { colorTex, bumpTex };
}

/**
 * Helper to create a toothed mechanical gear ring with extruded 3D gear teeth
 * and optional internal spokes.
 */
function createToothedGearGroup(THREE, {
  radius = 1.0,
  tube = 0.04,
  teeth = 64,
  toothSize = 0.035,
  spokes = 0,
  matRim,
  matTooth
}) {
  const grp = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 12, Math.max(48, teeth)), matRim);
  rim.rotation.x = Math.PI / 2;
  grp.add(rim);

  if (teeth > 0) {
    const toothGeo = new THREE.BoxGeometry(toothSize * 1.35, tube * 1.45, toothSize * 0.9);
    const inst = new THREE.InstancedMesh(toothGeo, matTooth || matRim, teeth);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const tr = radius + tube * 0.85;
      dummy.position.set(Math.cos(a) * tr, 0, Math.sin(a) * tr);
      dummy.rotation.set(0, -a, 0);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
    grp.add(inst);
  }

  for (let s = 0; s < spokes; s++) {
    const a = (s / spokes) * Math.PI * 2;
    const spoke = new THREE.Mesh(
      new THREE.CylinderGeometry(tube * 0.42, tube * 0.42, radius * 1.95, 8),
      matRim
    );
    spoke.rotation.z = Math.PI / 2;
    spoke.rotation.y = a;
    grp.add(spoke);
  }

  return grp;
}

export function initCitadelWorldV5(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07090D);
  scene.fog = new THREE.FogExp2(0x07090D, 0.028);

  // Custom Dark Study PMREM Environment (keeps obsidian #111318 dark & makes brass #B8924A gleam)
  scene.environment = createDarkStudyEnvironment(THREE, renderer);
  scene.environmentIntensity = 0.65;

  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);

  // Post-processing: RenderPass + UnrealBloomPass (Vision's high >0.88 threshold so zero whiteout!) + OutputPass
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.16, // controlled strength so every individual filament & gear tooth stays razor-sharp
    0.32, // tight radius
    0.88  // high threshold (>0.88 linear per Vision's spec)
  );
  composer.addPass(bloomPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  // --- VISION'S LIGHTING & LUMINANCE BUDGET ---
  const ambientLight = new THREE.HemisphereLight(0x202838, 0x080A0E, 0.72);
  scene.add(ambientLight);

  // 2900K Overhead Citadel Astrolabe Key Light with crisp shadow map
  const astrolabeKeyLight = new THREE.DirectionalLight(0xFFB84D, 2.45);
  astrolabeKeyLight.position.set(3.8, 10.5, 4.8);
  astrolabeKeyLight.castShadow = true;
  astrolabeKeyLight.shadow.mapSize.width = 1024;
  astrolabeKeyLight.shadow.mapSize.height = 1024;
  astrolabeKeyLight.shadow.camera.near = 1.0;
  astrolabeKeyLight.shadow.camera.far = 24.0;
  const d = 7.2;
  astrolabeKeyLight.shadow.camera.left = -d;
  astrolabeKeyLight.shadow.camera.right = d;
  astrolabeKeyLight.shadow.camera.top = d;
  astrolabeKeyLight.shadow.camera.bottom = -d;
  astrolabeKeyLight.shadow.bias = -0.0006;
  scene.add(astrolabeKeyLight);

  // 2900K Canopy Synaptic Point Light
  const canopyGoldLight = new THREE.PointLight(0xFFB84D, 2.6, 11.0, 1.5);
  canopyGoldLight.position.set(0, 3.25, 0);
  scene.add(canopyGoldLight);

  // 4800K Milled Groove Cyan Bounce Lights
  const rootCyanLight = new THREE.PointLight(0x2CE6D8, 3.2, 10.0, 1.4);
  rootCyanLight.position.set(0.8, 0.65, 0.7);
  scene.add(rootCyanLight);

  const cityCyanLight = new THREE.PointLight(0x2CE6D8, 2.2, 6.5, 1.6);
  cityCyanLight.position.set(2.35, 1.2, 1.95);
  scene.add(cityCyanLight);

  // 2100K Workshop Furnace Hearth Light
  const furnaceEmberLight = new THREE.PointLight(0xFF6B2B, 2.8, 7.5, 1.6);
  furnaceEmberLight.position.set(-3.1, 0.95, 1.35);
  scene.add(furnaceEmberLight);

  // --- 60 / 30 / 10 PHYSICAL MATERIALS ---
  const { colorTex: tableColorTex, bumpTex: tableBumpTex } = createCarvedTableTextures();

  // 60% Base: Matte Volcanic Obsidian & Slate (low metalness so it stays dark carved stone!)
  const matObsidianCarved = new THREE.MeshStandardMaterial({
    map: tableColorTex,
    bumpMap: tableBumpTex,
    bumpScale: 0.04,
    roughness: 0.82,
    metalness: 0.06
  });

  const matObsidianSolid = new THREE.MeshStandardMaterial({
    color: 0x111318,
    bumpMap: tableBumpTex,
    bumpScale: 0.025,
    roughness: 0.80,
    metalness: 0.08
  });

  const matMilledTrench = new THREE.MeshStandardMaterial({
    color: 0x07090D,
    roughness: 0.92,
    metalness: 0.04
  });

  const matSlateBootcamp = new THREE.MeshStandardMaterial({
    color: 0x242A36,
    roughness: 0.72,
    metalness: 0.12
  });

  const matTravertineCampus = new THREE.MeshStandardMaterial({
    color: 0xDDD5C7,
    roughness: 0.65,
    metalness: 0.04
  });

  // 30% Structure & Craft: Clockwork Metals
  const matAgedBrass = new THREE.MeshStandardMaterial({
    color: 0xB8924A,
    roughness: 0.30,
    metalness: 0.86
  });

  const matSpecularBrass = new THREE.MeshStandardMaterial({
    color: 0xD8B467,
    roughness: 0.18,
    metalness: 0.92
  });

  const matOxidizedBronze = new THREE.MeshStandardMaterial({
    color: 0x4A381B,
    roughness: 0.48,
    metalness: 0.74
  });

  const matWorkshopCopper = new THREE.MeshStandardMaterial({
    color: 0xA85638,
    roughness: 0.30,
    metalness: 0.84
  });

  // 10% Emission: Controlled Bioluminescence (crisp individual strands, zero white-out)
  const matCyanRoot = new THREE.MeshStandardMaterial({
    color: 0x2CE6D8,
    emissive: 0x18B8AC,
    emissiveIntensity: 1.05,
    roughness: 0.22
  });

  const matCyanCore = new THREE.MeshStandardMaterial({
    color: 0xB8FFF9,
    emissive: 0x2CE6D8,
    emissiveIntensity: 1.45,
    roughness: 0.15
  });

  const matGoldCanopy = new THREE.MeshStandardMaterial({
    color: 0xFFB84D,
    emissive: 0xE59422,
    emissiveIntensity: 1.15,
    roughness: 0.22
  });

  const matEmberHeart = new THREE.MeshStandardMaterial({
    color: 0xFF6B2B,
    emissive: 0xE6480F,
    emissiveIntensity: 1.55,
    roughness: 0.22
  });

  const matParchment = new THREE.MeshStandardMaterial({
    color: 0xF2EEE4,
    roughness: 0.78,
    metalness: 0.02
  });

  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  const animatedParts = {
    outerRing: null,
    horizonRing: null,
    middleRing: null,
    equatorialRing: null,
    innerRing: null,
    wormPinion: null,
    cityHeliostat: null,
    cityEscapement: null,
    cityFoundationGear: null,
    workshopCarillon: null,
    workshopBeam: null,
    campusGear: null,
    bootcampFresnel: null,
    spores: null
  };

  // ============================================================================
  // 1. STRUCTURE #1: 9-STRATA CARVED TOPOGRAPHIC OBSIDIAN TABLE & BRASS BEZEL
  // ============================================================================
  const tableBase = new THREE.Mesh(new THREE.CylinderGeometry(6.88, 7.18, 0.54, 96), matObsidianCarved);
  tableBase.position.y = -0.27;
  tableBase.receiveShadow = true;
  worldGroup.add(tableBase);

  const harborDisc = new THREE.Mesh(new THREE.CylinderGeometry(6.65, 6.65, 0.06, 96), matObsidianCarved);
  harborDisc.position.y = 0.0;
  harborDisc.receiveShadow = true;
  worldGroup.add(harborDisc);

  // 9 Stepped Topographic Basalt Strata across the Central Plateau & 4 Realm Peninsulas
  const topographicLobes = [
    { x: 0.0, z: 0.0, r0: 2.45, r1: 1.42, steps: 7, hStep: 0.020 },
    { x: 2.35, z: 1.95, r0: 2.05, r1: 1.38, steps: 9, hStep: 0.022 }, // City Highland
    { x: -3.10, z: 1.35, r0: 1.88, r1: 1.22, steps: 8, hStep: 0.020 }, // Workshop Caldera
    { x: -2.55, z: -2.35, r0: 1.85, r1: 1.24, steps: 8, hStep: 0.020 }, // Campus Acropolis
    { x: 2.75, z: -2.25, r0: 1.68, r1: 0.98, steps: 9, hStep: 0.022 }  // Bootcamp Sea-Cliff
  ];

  topographicLobes.forEach((lobe, lIdx) => {
    for (let s = 0; s < lobe.steps; s++) {
      const frac = s / (lobe.steps - 1);
      const rad = THREE.MathUtils.lerp(lobe.r0, lobe.r1, frac);
      const y = 0.02 + s * lobe.hStep;
      const segs = lIdx === 0 ? 64 : 12 + (s % 3) * 4;
      const stratum = new THREE.Mesh(
        new THREE.CylinderGeometry(rad - 0.02, rad, lobe.hStep, segs),
        s % 3 === 2 ? matSlateBootcamp : matObsidianCarved
      );
      stratum.position.set(lobe.x, y, lobe.z);
      stratum.rotation.y = s * 0.22;
      stratum.castShadow = true;
      stratum.receiveShadow = true;
      worldGroup.add(stratum);

      if (s % 3 === 0) {
        const lip = new THREE.Mesh(
          new THREE.TorusGeometry(rad - 0.015, 0.008, 8, segs),
          s === lobe.steps - 1 ? matSpecularBrass : matOxidizedBronze
        );
        lip.rotation.x = Math.PI / 2;
        lip.position.set(lobe.x, y + lobe.hStep * 0.5, lobe.z);
        worldGroup.add(lip);
      }
    }
  });

  // 12-Segment Cast-Brass Perimeter Instrument Bezel (R = 6.85m) + 180 Gear Teeth + 48 Hex Rivets
  const outerBezelGear = createToothedGearGroup(THREE, {
    radius: 6.84,
    tube: 0.11,
    teeth: 180,
    toothSize: 0.055,
    spokes: 0,
    matRim: matAgedBrass,
    matTooth: matSpecularBrass
  });
  outerBezelGear.position.y = 0.04;
  worldGroup.add(outerBezelGear);

  const innerVernierRim = new THREE.Mesh(new THREE.TorusGeometry(6.62, 0.045, 14, 120), matSpecularBrass);
  innerVernierRim.rotation.x = Math.PI / 2;
  innerVernierRim.position.y = 0.06;
  worldGroup.add(innerVernierRim);

  const rivetGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.06, 6);
  const rivetInst = new THREE.InstancedMesh(rivetGeo, matSpecularBrass, 48);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    dummy.position.set(Math.cos(a) * 6.84, 0.13, Math.sin(a) * 6.84);
    dummy.rotation.set(0, -a, 0);
    dummy.updateMatrix();
    rivetInst.setMatrixAt(i, dummy.matrix);
  }
  rivetInst.instanceMatrix.needsUpdate = true;
  worldGroup.add(rivetInst);

  for (let c = 0; c < 4; c++) {
    const a = (c / 4) * Math.PI * 2;
    const clampGrp = new THREE.Group();
    clampGrp.position.set(Math.cos(a) * 6.75, 0.12, Math.sin(a) * 6.75);
    clampGrp.rotation.y = -a;
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.16, 0.38), matSpecularBrass);
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.22, 16), matAgedBrass);
    dial.position.y = 0.06;
    clampGrp.add(jaw, dial);
    worldGroup.add(clampGrp);
  }

  // ============================================================================
  // 2. STRUCTURE #2: SUNKEN ASTROLABE WELL, GNARLED BONSAI KAGE TRUNK,
  //    64 WEEPING-WILLOW CANOPY CURTAINS & 5-RING TOOTHED CARDANIC ASTROLABE
  // ============================================================================
  const wellOuterGear = createToothedGearGroup(THREE, {
    radius: 1.46,
    tube: 0.075,
    teeth: 96,
    toothSize: 0.032,
    spokes: 8,
    matRim: matSpecularBrass,
    matTooth: matAgedBrass
  });
  wellOuterGear.position.y = 0.18;
  worldGroup.add(wellOuterGear);

  const wellStep2 = new THREE.Mesh(new THREE.CylinderGeometry(1.36, 1.18, 0.22, 48), matMilledTrench);
  wellStep2.position.y = 0.10;
  worldGroup.add(wellStep2);

  for (let b = 0; b < 8; b++) {
    const a = (b / 8) * Math.PI * 2;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.065), matAgedBrass);
    rib.position.set(Math.cos(a) * 1.18, 0.22, Math.sin(a) * 1.18);
    rib.rotation.y = -a;
    worldGroup.add(rib);
  }

  // Kage Bonsai-Braided Trunk:
  // 12 Gnarled Structural Bronze/Brass Boughs + 24 Cyan Optical Root Veins + 16 Gold Canopy Capillaries
  // With clear negative space between strands so the tree silhouette reads like Approved Ref #2!
  const kageTreeGroup = new THREE.Group();
  worldGroup.add(kageTreeGroup);

  const totalStrands = 48;
  for (let i = 0; i < totalStrands; i++) {
    const angle0 = (i / totalStrands) * Math.PI * 2;
    const isStructuralArmature = i % 3 === 0;
    const isCyanVein = i % 3 === 1;
    const boughCluster = i % 6;
    const boughAngle = (boughCluster / 6) * Math.PI * 2 + 0.25;

    const pts = [];
    const steps = 16;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const y = 0.14 + t * 2.95;
      const rootFlare = Math.pow(1.0 - t, 2.8) * 0.85;
      const waist = 0.18 + Math.sin(t * Math.PI) * 0.10;
      const canopySpread = Math.pow(t, 2.5) * 1.68;
      const r = rootFlare + waist * (1.0 - t * 0.55) + canopySpread;

      const twist = angle0 + t * Math.PI * 1.45 + Math.sin(t * 4.5 + i) * 0.14;
      const finalAngle = THREE.MathUtils.lerp(twist, boughAngle + ((i % 8 - 3.5) * 0.065), Math.pow(t, 1.7));
      const archDrop = t > 0.78 ? Math.pow((t - 0.78) / 0.22, 2.0) * 0.26 : 0;

      pts.push(new THREE.Vector3(
        Math.cos(finalAngle) * r,
        y - archDrop,
        Math.sin(finalAngle) * r
      ));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const radius = isStructuralArmature ? 0.028 : (isCyanVein ? 0.013 : 0.009);
    const tubeGeo = new THREE.TubeGeometry(curve, 20, radius, 6, false);
    const mat = isStructuralArmature
      ? (i % 6 === 0 ? matOxidizedBronze : matAgedBrass)
      : (isCyanVein ? matCyanRoot : matGoldCanopy);
    kageTreeGroup.add(new THREE.Mesh(tubeGeo, mat));
  }

  // 5 Machined Brass Ferrule Ligature Collars with Hex Bolts Binding the Trunk
  const collarSpecs = [
    { y: 0.58, r: 0.56 },
    { y: 1.04, r: 0.38 },
    { y: 1.50, r: 0.30 },
    { y: 1.96, r: 0.36 },
    { y: 2.42, r: 0.58 }
  ];
  collarSpecs.forEach((cs) => {
    const collar = new THREE.Mesh(new THREE.TorusGeometry(cs.r, 0.032, 10, 32), matSpecularBrass);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = cs.y;
    kageTreeGroup.add(collar);

    for (let k = 0; k < 6; k++) {
      const ka = (k / 6) * Math.PI * 2;
      const lug = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.065, 0.085), matAgedBrass);
      lug.position.set(Math.cos(ka) * cs.r, cs.y, Math.sin(ka) * cs.r);
      lug.rotation.y = -ka;
      kageTreeGroup.add(lug);
    }
  });

  // 56 Weeping-Willow Catenary Fiber Curtains + Faceted Teardrop Optical Condensers
  const canopyGroup = new THREE.Group();
  kageTreeGroup.add(canopyGroup);

  const condenserGeo = new THREE.OctahedronGeometry(0.036, 0);
  condenserGeo.scale(0.72, 1.65, 0.72);

  for (let w = 0; w < 56; w++) {
    const ang = (w / 56) * Math.PI * 2 + (w % 4) * 0.03;
    const reach = 0.85 + (w % 5) * 0.22;
    const sx = Math.cos(ang) * reach;
    const sz = Math.sin(ang) * reach;
    const topY = 2.88 + (w % 3) * 0.10;
    const dropLen = 0.52 + (w % 4) * 0.18;

    const curtainCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.62, topY, sz * 0.62),
      new THREE.Vector3(sx * 0.92, topY + 0.06 - dropLen * 0.25, sz * 0.92),
      new THREE.Vector3(sx * 1.04, topY - dropLen * 0.65, sz * 1.04),
      new THREE.Vector3(sx * 1.06, topY - dropLen, sz * 1.06)
    ]);
    const curtainGeo = new THREE.TubeGeometry(curtainCurve, 10, 0.007, 5, false);
    const isCyanTip = w % 4 === 0;
    canopyGroup.add(new THREE.Mesh(curtainGeo, isCyanTip ? matCyanCore : matGoldCanopy));

    const drop = new THREE.Mesh(condenserGeo, isCyanTip ? matCyanCore : matGoldCanopy);
    drop.position.set(sx * 1.06, topY - dropLen - 0.04, sz * 1.06);
    canopyGroup.add(drop);
  }

  // 280 Drifting Bioluminescent Spores around Kage & the Obsidian Table
  const sporeCount = 280;
  const sporeGeo = new THREE.BufferGeometry();
  const sporePos = new Float32Array(sporeCount * 3);
  for (let i = 0; i < sporeCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.45 + Math.random() * 5.6;
    const y = 0.25 + Math.random() * 3.8;
    sporePos[i * 3] = Math.cos(a) * r;
    sporePos[i * 3 + 1] = y;
    sporePos[i * 3 + 2] = Math.sin(a) * r;
  }
  sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePos, 3));
  const sporeMat = new THREE.PointsMaterial({
    color: 0xFFC864,
    size: 0.045,
    transparent: true,
    opacity: 0.78
  });
  const sporePoints = new THREE.Points(sporeGeo, sporeMat);
  worldGroup.add(sporePoints);
  animatedParts.spores = sporePoints;

  // 5-Ring Toothed Cardanic Citadel Astrolabe (Crowning Kage at y = 2.95m)
  const astrolabeRig = new THREE.Group();
  astrolabeRig.position.y = 2.95;
  worldGroup.add(astrolabeRig);

  for (let side of [-1, 1]) {
    const archPts = [];
    for (let k = 0; k <= 14; k++) {
      const t = k / 14;
      const ay = 0.18 + t * 2.77;
      const ax = side * (1.44 + Math.sin(t * Math.PI) * 0.58);
      archPts.push(new THREE.Vector3(ax, ay, 0));
    }
    const archCurve = new THREE.CatmullRomCurve3(archPts);
    worldGroup.add(new THREE.Mesh(new THREE.TubeGeometry(archCurve, 20, 0.040, 8, false), matAgedBrass));
  }

  const wormPinion = createToothedGearGroup(THREE, {
    radius: 0.22,
    tube: 0.035,
    teeth: 18,
    toothSize: 0.025,
    spokes: 4,
    matRim: matSpecularBrass,
    matTooth: matAgedBrass
  });
  wormPinion.position.set(1.96, 2.95, 0);
  wormPinion.rotation.z = Math.PI / 2;
  worldGroup.add(wormPinion);
  animatedParts.wormPinion = wormPinion;

  const ring1 = createToothedGearGroup(THREE, {
    radius: 1.92,
    tube: 0.048,
    teeth: 120,
    toothSize: 0.028,
    spokes: 0,
    matRim: matSpecularBrass,
    matTooth: matAgedBrass
  });
  for (let c = 0; c < 4; c++) {
    const a = (c / 4) * Math.PI * 2;
    const cartouche = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.11, 0.12), matSpecularBrass);
    cartouche.position.set(Math.cos(a) * 1.92, 0, Math.sin(a) * 1.92);
    cartouche.rotation.y = -a;
    ring1.add(cartouche);
  }
  ring1.rotation.x = Math.PI * 0.34;
  astrolabeRig.add(ring1);
  animatedParts.outerRing = ring1;

  const ring2 = createToothedGearGroup(THREE, {
    radius: 1.66,
    tube: 0.038,
    teeth: 84,
    toothSize: 0.024,
    spokes: 0,
    matRim: matAgedBrass,
    matTooth: matSpecularBrass
  });
  for (let s of [-1, 1]) {
    const lensHolder = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 16), matSpecularBrass);
    lensHolder.position.set(s * 1.66, 0, 0);
    lensHolder.add(new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), matGoldCanopy));
    ring2.add(lensHolder);
  }
  ring2.rotation.z = Math.PI * 0.22;
  ring2.rotation.x = -Math.PI * 0.18;
  astrolabeRig.add(ring2);
  animatedParts.horizonRing = ring2;

  const ring3 = createToothedGearGroup(THREE, {
    radius: 1.42,
    tube: 0.032,
    teeth: 64,
    toothSize: 0.022,
    spokes: 4,
    matRim: matSpecularBrass,
    matTooth: matAgedBrass
  });
  ring3.rotation.y = Math.PI * 0.25;
  ring3.rotation.x = -Math.PI * 0.32;
  astrolabeRig.add(ring3);
  animatedParts.middleRing = ring3;

  const ring4 = createToothedGearGroup(THREE, {
    radius: 1.18,
    tube: 0.026,
    teeth: 48,
    toothSize: 0.018,
    spokes: 0,
    matRim: matAgedBrass,
    matTooth: matSpecularBrass
  });
  ring4.rotation.x = Math.PI * 0.48;
  astrolabeRig.add(ring4);
  animatedParts.equatorialRing = ring4;

  const ring5 = createToothedGearGroup(THREE, {
    radius: 0.88,
    tube: 0.028,
    teeth: 36,
    toothSize: 0.018,
    spokes: 6,
    matRim: matSpecularBrass,
    matTooth: matAgedBrass
  });
  ring5.add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 20), matGoldCanopy));
  astrolabeRig.add(ring5);
  animatedParts.innerRing = ring5;

  // ============================================================================
  // 3. MILLED KINTSUGI ROOT CHANNELS, RETAINING BRIDGES & 4 IRIS MEMORY NODES
  // ============================================================================
  const realmTargets = [
    { key: 'city', pos: new THREE.Vector3(2.35, 0.18, 1.95), primary: true },
    { key: 'workshop', pos: new THREE.Vector3(-3.10, 0.18, 1.35), primary: false },
    { key: 'campus', pos: new THREE.Vector3(-2.55, 0.18, -2.35), primary: false },
    { key: 'bootcamp', pos: new THREE.Vector3(2.75, 0.18, -2.25), primary: false }
  ];

  let primaryCityCurve = null;
  const memoryRootNodes = [];

  realmTargets.forEach((rt) => {
    const mid = rt.pos.clone().multiplyScalar(0.52);
    mid.x += rt.pos.z > 0 ? 0.38 : -0.38;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.18, 0),
      new THREE.Vector3(mid.x * 0.55, 0.18, mid.z * 0.55),
      new THREE.Vector3(mid.x, 0.18, mid.z),
      rt.pos.clone()
    ]);

    if (rt.primary) primaryCityCurve = curve;

    const trenchMesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 36, rt.primary ? 0.11 : 0.075, 8, false),
      matMilledTrench
    );
    trenchMesh.position.y = -0.025;
    worldGroup.add(trenchMesh);

    for (let strand = -1; strand <= 1; strand++) {
      const offsetCurve = new THREE.CatmullRomCurve3(
        curve.getPoints(20).map((p, idx) => new THREE.Vector3(
          p.x + strand * 0.028 + Math.sin(idx * 0.9 + strand) * 0.012,
          p.y + (strand === 0 ? 0.015 : 0.005),
          p.z - strand * 0.022
        ))
      );
      const sMat = strand === 0 ? (rt.primary ? matCyanCore : matCyanRoot) : (strand === 1 ? matCyanRoot : matSpecularBrass);
      const sRad = strand === 0 ? (rt.primary ? 0.028 : 0.020) : 0.014;
      worldGroup.add(new THREE.Mesh(new THREE.TubeGeometry(offsetCurve, 36, sRad, 6, false), sMat));
    }

    for (let b = 1; b <= 5; b++) {
      const u = b / 6.0;
      const pt = curve.getPointAt(u);
      const tang = curve.getTangentAt(u);
      const staple = new THREE.Mesh(new THREE.TorusGeometry(rt.primary ? 0.115 : 0.085, 0.018, 8, 16, Math.PI), matAgedBrass);
      staple.position.set(pt.x, pt.y - 0.01, pt.z);
      staple.rotation.y = Math.atan2(tang.x, tang.z);
      worldGroup.add(staple);
    }
  });

  // 4 Sunken 6-Leaf Brass Iris-Diaphragm Memory Root Nodes along Kage -> City Artery
  for (let i = 0; i < 4; i++) {
    const t = 0.22 + i * 0.19;
    const pt = primaryCityCurve.getPointAt(t);
    const nodeGroup = new THREE.Group();
    nodeGroup.position.copy(pt);

    const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.23, 0.07, 6), matAgedBrass);
    nodeGroup.add(bezel);

    for (let leaf = 0; leaf < 6; leaf++) {
      const la = (leaf / 6) * Math.PI * 2;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.085, 0.035), matSpecularBrass);
      blade.position.set(Math.cos(la) * 0.13, 0.02, Math.sin(la) * 0.13);
      blade.rotation.y = -la + 0.35;
      nodeGroup.add(blade);
    }

    for (let side of [-1, 1]) {
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.11, 12), matSpecularBrass);
      screw.position.set(side * 0.22, 0.03, 0);
      nodeGroup.add(screw);
    }

    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.10, 1), matCyanCore.clone());
    gem.scale.set(1.0, 0.65, 1.0);
    gem.position.y = 0.05;
    nodeGroup.add(gem);

    worldGroup.add(nodeGroup);
    memoryRootNodes.push({ group: nodeGroup, gem, t });
  }

  const taskPulseGroup = new THREE.Group();
  taskPulseGroup.visible = false;
  const pulseCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 1), matGoldCanopy);
  const pulseRing = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.02, 8, 24), matCyanCore);
  pulseRing.rotation.x = Math.PI / 2;
  taskPulseGroup.add(pulseCore, pulseRing);
  worldGroup.add(taskPulseGroup);

  // ============================================================================
  // 4. STRUCTURE #3: I · NOW · THE CITY CITADEL (MOVEO CREATIVE)
  // ============================================================================
  const cityGroup = new THREE.Group();
  cityGroup.position.set(2.35, 0.18, 1.95);
  worldGroup.add(cityGroup);

  const cityFoundationGear = createToothedGearGroup(THREE, {
    radius: 1.48,
    tube: 0.055,
    teeth: 72,
    toothSize: 0.038,
    spokes: 8,
    matRim: matAgedBrass,
    matTooth: matSpecularBrass
  });
  cityFoundationGear.position.y = 0.06;
  cityGroup.add(cityFoundationGear);
  animatedParts.cityFoundationGear = cityFoundationGear;

  const curtainTier1 = new THREE.Mesh(new THREE.CylinderGeometry(1.36, 1.46, 0.28, 8), matObsidianSolid);
  curtainTier1.position.y = 0.18;
  curtainTier1.castShadow = true;
  curtainTier1.receiveShadow = true;
  cityGroup.add(curtainTier1);

  const curtainTier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.16, 1.24, 0.24, 8), matSlateBootcamp);
  curtainTier2.position.y = 0.42;
  curtainTier2.castShadow = true;
  cityGroup.add(curtainTier2);

  for (let b = 0; b < 8; b++) {
    const a = (b / 8) * Math.PI * 2 + Math.PI / 8;
    const bx = Math.cos(a) * 1.32;
    const bz = Math.sin(a) * 1.32;
    const bartizan = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.48, 8), matObsidianSolid);
    bartizan.position.set(bx, 0.34, bz);
    bartizan.castShadow = true;
    cityGroup.add(bartizan);

    const bRoof = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.26, 8), matAgedBrass);
    bRoof.position.set(bx, 0.71, bz);
    cityGroup.add(bRoof);

    const bSlit = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.33), b % 2 === 0 ? matGoldCanopy : matCyanRoot);
    bSlit.position.set(bx, 0.36, bz);
    bSlit.rotation.y = -a;
    cityGroup.add(bSlit);
  }

  const sluiceArch = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.045, 10, 24, Math.PI), matSpecularBrass);
  sluiceArch.position.set(-0.88, 0.26, -0.78);
  sluiceArch.rotation.y = -Math.PI * 0.72;
  cityGroup.add(sluiceArch);

  const escapementBridge = new THREE.Group();
  escapementBridge.position.set(-0.75, 0.62, -0.68);
  escapementBridge.rotation.y = -Math.PI * 0.72;
  const escBeam = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.045, 0.065), matSpecularBrass);
  const escGear = createToothedGearGroup(THREE, {
    radius: 0.18,
    tube: 0.025,
    teeth: 20,
    toothSize: 0.02,
    spokes: 4,
    matRim: matSpecularBrass,
    matTooth: matAgedBrass
  });
  escGear.rotation.x = Math.PI / 2;
  escapementBridge.add(escBeam, escGear);
  cityGroup.add(escapementBridge);
  animatedParts.cityEscapement = escapementBridge;

  function buildCitadelTower({ x, z, w, h, spireH, isHero = false }) {
    const tGrp = new THREE.Group();
    tGrp.position.set(x, 0.48, z);

    const lowerH = h * 0.58;
    const upperH = h * 0.42;
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(w, lowerH, w), matObsidianSolid);
    lowerBody.position.y = lowerH / 2;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    tGrp.add(lowerBody);

    const waistCornice = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, 0.06, w + 0.08), matAgedBrass);
    waistCornice.position.y = lowerH;
    tGrp.add(waistCornice);

    const upperW = w * 0.84;
    const upperBody = new THREE.Mesh(new THREE.BoxGeometry(upperW, upperH, upperW), matSlateBootcamp);
    upperBody.position.y = lowerH + upperH / 2;
    upperBody.castShadow = true;
    tGrp.add(upperBody);

    for (let cx of [-1, 1]) {
      for (let cz of [-1, 1]) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.042, h, 0.042), matAgedBrass);
        rib.position.set(cx * (w * 0.48), h / 2, cz * (w * 0.48));
        tGrp.add(rib);
      }
    }

    const cols = isHero ? 3 : 2;
    const rows = isHero ? 4 : 3;
    for (let r = 0; r < rows; r++) {
      const wy = 0.22 + (r / rows) * (h - 0.36);
      const curW = r < 2 ? w : upperW;
      for (let c = 0; c < cols; c++) {
        const offset = (c - (cols - 1) / 2) * (curW * 0.28);
        const winMat = (r + c) % 3 === 0 ? matCyanRoot : matGoldCanopy;
        const paneX = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.14, curW + 0.018), winMat);
        paneX.position.set(offset, wy, 0);
        const paneZ = new THREE.Mesh(new THREE.BoxGeometry(curW + 0.018, 0.14, 0.038), winMat);
        paneZ.position.set(0, wy, offset);
        tGrp.add(paneX, paneZ);
      }
    }

    const crown = new THREE.Mesh(new THREE.BoxGeometry(upperW + 0.10, 0.08, upperW + 0.10), matSpecularBrass);
    crown.position.y = h;
    tGrp.add(crown);

    const spire = new THREE.Mesh(new THREE.ConeGeometry(upperW * 0.56, spireH, 8), isHero ? matSpecularBrass : matAgedBrass);
    spire.position.y = h + spireH / 2;
    spire.castShadow = true;
    tGrp.add(spire);

    for (let px of [-1, 1]) {
      for (let pz of [-1, 1]) {
        const pin = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.22, 4), matSpecularBrass);
        pin.position.set(px * (upperW * 0.46), h + 0.11, pz * (upperW * 0.46));
        tGrp.add(pin);
      }
    }

    return tGrp;
  }

  const centralKeep = buildCitadelTower({ x: 0, z: 0, w: 0.68, h: 2.15, spireH: 0.55, isHero: true });
  cityGroup.add(centralKeep);

  const heliostatGroup = new THREE.Group();
  heliostatGroup.position.set(0, 3.28, 0);
  const helioRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.022, 10, 32), matSpecularBrass);
  const helioMirror = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.025, 24), matGoldCanopy);
  helioMirror.rotation.x = Math.PI * 0.32;
  heliostatGroup.add(helioRing, helioMirror);
  cityGroup.add(heliostatGroup);
  animatedParts.cityHeliostat = heliostatGroup;

  for (let fb = 0; fb < 8; fb++) {
    const a = (fb / 8) * Math.PI * 2;
    const buttress = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.055, 0.045), matAgedBrass);
    buttress.position.set(Math.cos(a) * 0.52, 1.45, Math.sin(a) * 0.52);
    buttress.rotation.y = -a;
    buttress.rotation.z = -0.52;
    cityGroup.add(buttress);
  }

  const cityTowers = [
    { x: -0.64, z: 0.48, w: 0.40, h: 1.48, spireH: 0.45, bridge: true },
    { x: 0.64, z: 0.48, w: 0.42, h: 1.62, spireH: 0.48, bridge: true },
    { x: -0.58, z: -0.56, w: 0.38, h: 1.36, spireH: 0.42, bridge: true },
    { x: 0.58, z: -0.56, w: 0.38, h: 1.44, spireH: 0.44, bridge: true },
    { x: 0.0, z: 0.82, w: 0.32, h: 1.08, spireH: 0.34, bridge: false },
    { x: -0.86, z: -0.04, w: 0.30, h: 1.02, spireH: 0.32, bridge: false },
    { x: 0.86, z: -0.04, w: 0.30, h: 1.05, spireH: 0.32, bridge: false },
    { x: 0.0, z: -0.84, w: 0.32, h: 0.98, spireH: 0.30, bridge: false }
  ];

  cityTowers.forEach((ct) => {
    cityGroup.add(buildCitadelTower(ct));
    if (ct.bridge) {
      const dist = Math.hypot(ct.x, ct.z);
      const bridgeAngle = Math.atan2(ct.x, ct.z);
      const skyBridge = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, dist), matSpecularBrass);
      skyBridge.position.set(ct.x * 0.5, 1.42, ct.z * 0.5);
      skyBridge.rotation.y = bridgeAngle;
      cityGroup.add(skyBridge);
    }
  });

  // ============================================================================
  // 5. STRUCTURE #4: II · THE WORKSHOP (COPPER FOUNDRY & 4 CRAFT ALCOVES)
  // ============================================================================
  const workshopGroup = new THREE.Group();
  workshopGroup.position.set(-3.10, 0.18, 1.35);
  worldGroup.add(workshopGroup);

  const wsPlinth = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.42, 0.24, 16), matObsidianSolid);
  wsPlinth.position.y = 0.12;
  wsPlinth.receiveShadow = true;
  workshopGroup.add(wsPlinth);

  const wsGearBase = createToothedGearGroup(THREE, {
    radius: 1.36,
    tube: 0.045,
    teeth: 60,
    toothSize: 0.032,
    spokes: 6,
    matRim: matWorkshopCopper,
    matTooth: matAgedBrass
  });
  wsGearBase.position.y = 0.22;
  workshopGroup.add(wsGearBase);

  const foundryDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.48, 24), matWorkshopCopper);
  foundryDrum.position.y = 0.48;
  foundryDrum.castShadow = true;
  workshopGroup.add(foundryDrum);

  const foundryDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.62, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52),
    matWorkshopCopper
  );
  foundryDome.position.y = 0.72;
  foundryDome.castShadow = true;
  workshopGroup.add(foundryDome);

  for (let r = 0; r < 12; r++) {
    const a = (r / 12) * Math.PI * 2;
    const rib = new THREE.Mesh(
      new THREE.TorusGeometry(0.625, 0.018, 8, 24, Math.PI * 0.5),
      matSpecularBrass
    );
    rib.position.y = 0.72;
    rib.rotation.y = a;
    workshopGroup.add(rib);
  }

  const cupola = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.22, 0.28, 12), matSpecularBrass);
  cupola.position.y = 1.38;
  const cupolaGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.22, 12), matEmberHeart);
  cupolaGlow.position.y = 1.38;
  const cupolaCap = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.22, 12), matWorkshopCopper);
  cupolaCap.position.y = 1.62;
  workshopGroup.add(cupola, cupolaGlow, cupolaCap);

  for (let side of [-0.36, 0.36]) {
    const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.12, 1.35, 12), matWorkshopCopper);
    stack.position.set(side, 1.05, -0.42);
    stack.castShadow = true;
    const crownBand = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.08, 12), matSpecularBrass);
    crownBand.position.set(side, 1.68, -0.42);
    workshopGroup.add(stack, crownBand);
  }

  const furnaceArch = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.055, 12, 24, Math.PI), matAgedBrass);
  furnaceArch.position.set(0.25, 0.32, 0.58);
  furnaceArch.rotation.y = 0.38;
  const coalGrate = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.28, 16), matEmberHeart);
  coalGrate.position.set(0.22, 0.34, 0.52);
  workshopGroup.add(furnaceArch, coalGrate);

  const walkingBeam = new THREE.Group();
  walkingBeam.position.set(0.55, 0.92, 0.15);
  walkingBeam.add(new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.065, 0.08), matSpecularBrass));
  workshopGroup.add(walkingBeam);
  animatedParts.workshopBeam = walkingBeam;

  // Alcove A (SW): Virtual Garden
  const alcoveGarden = new THREE.Group();
  alcoveGarden.position.set(-0.68, 0.26, 0.56);
  const gardenBase = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.14, 16), matAgedBrass);
  const gardenBonsai = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 1), matCyanCore);
  gardenBonsai.position.y = 0.22;
  alcoveGarden.add(gardenBase, gardenBonsai);
  for (let g = 0; g < 8; g++) {
    const ga = (g / 8) * Math.PI;
    const cageRib = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.014, 6, 20, Math.PI), matSpecularBrass);
    cageRib.position.y = 0.07;
    cageRib.rotation.y = ga;
    alcoveGarden.add(cageRib);
  }
  workshopGroup.add(alcoveGarden);

  // Alcove B (SE): Chord Cycle
  const alcoveChord = new THREE.Group();
  alcoveChord.position.set(0.76, 0.36, 0.52);
  const carillonDrum = createToothedGearGroup(THREE, {
    radius: 0.24,
    tube: 0.04,
    teeth: 12,
    toothSize: 0.035,
    spokes: 6,
    matRim: matSpecularBrass,
    matTooth: matGoldCanopy
  });
  alcoveChord.add(carillonDrum);
  workshopGroup.add(alcoveChord);
  animatedParts.workshopCarillon = carillonDrum;

  // Alcove C (NE): Doodle Reborn
  const alcoveDoodle = new THREE.Group();
  alcoveDoodle.position.set(0.72, 0.38, -0.58);
  const easelBoard = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.03), matParchment);
  easelBoard.rotation.x = -0.45;
  const easelFrame = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.02), matAgedBrass);
  easelFrame.rotation.x = -0.45;
  easelFrame.position.z = -0.015;
  alcoveDoodle.add(easelBoard, easelFrame);
  workshopGroup.add(alcoveDoodle);

  // Alcove D (NW): 3D Blender Craft
  const alcoveBlender = new THREE.Group();
  alcoveBlender.position.set(-0.74, 0.32, -0.54);
  const turntable = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.08, 16), matSpecularBrass);
  const wireBust = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 0), matGoldCanopy);
  wireBust.position.y = 0.20;
  alcoveBlender.add(turntable, wireBust);
  workshopGroup.add(alcoveBlender);

  // ============================================================================
  // 6. STRUCTURE #5A: III · 2022–26 THE CAMPUS (MISTER BIT & CODING ACADEMY)
  // ============================================================================
  const campusGroup = new THREE.Group();
  campusGroup.position.set(-2.55, 0.18, -2.35);
  worldGroup.add(campusGroup);

  const campusGear = createToothedGearGroup(THREE, {
    radius: 1.32,
    tube: 0.045,
    teeth: 64,
    toothSize: 0.03,
    spokes: 8,
    matRim: matAgedBrass,
    matTooth: matSpecularBrass
  });
  campusGear.position.y = 0.08;
  campusGroup.add(campusGear);
  animatedParts.campusGear = campusGear;

  const campusPlinth = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.22, 1.36), matTravertineCampus);
  campusPlinth.position.y = 0.20;
  campusPlinth.receiveShadow = true;
  campusGroup.add(campusPlinth);

  for (let row = 0; row < 5; row++) {
    const r = 0.26 + row * 0.11;
    const tierBench = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.032, 8, 24, Math.PI),
      row % 2 === 0 ? matTravertineCampus : matAgedBrass
    );
    tierBench.rotation.x = Math.PI / 2;
    tierBench.position.set(0, 0.32 + row * 0.045, -0.05);
    campusGroup.add(tierBench);
  }

  const chalkboard = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.42, 0.06), matObsidianSolid);
  chalkboard.position.set(0, 0.54, -0.48);
  const chalkFrame = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.48, 0.04), matSpecularBrass);
  chalkFrame.position.set(0, 0.54, -0.49);
  const chalkGlow = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.03, 0.07), matCyanRoot);
  chalkGlow.position.set(0, 0.54, -0.48);
  campusGroup.add(chalkboard, chalkFrame, chalkGlow);

  for (let c = 0; c < 14; c++) {
    const isFront = c < 7;
    const idx = c % 7;
    const cx = -0.72 + idx * 0.24;
    const cz = isFront ? 0.52 : -0.56;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.058, 0.68, 16), matTravertineCampus);
    col.position.set(cx, 0.65, cz);
    col.castShadow = true;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.05, 0.13), matAgedBrass);
    cap.position.set(cx, 1.00, cz);
    campusGroup.add(col, cap);
  }

  const entablature = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.10, 1.24), matAgedBrass);
  entablature.position.y = 1.06;
  entablature.castShadow = true;
  campusGroup.add(entablature);

  for (let dRib = 0; dRib < 6; dRib++) {
    const a = (dRib / 6) * Math.PI;
    const domeArc = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.02, 8, 24, Math.PI), matSpecularBrass);
    domeArc.position.y = 1.11;
    domeArc.rotation.y = a;
    campusGroup.add(domeArc);
  }
  const campusLantern = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), matGoldCanopy);
  campusLantern.position.y = 1.34;
  campusGroup.add(campusLantern);

  // ============================================================================
  // 7. STRUCTURE #5B: IV · 2021 BOOTCAMP (COLUMNAR BASALT CLIFFS & FRESNEL LIGHTHOUSE)
  // ============================================================================
  const bootcampGroup = new THREE.Group();
  bootcampGroup.position.set(2.75, 0.18, -2.25);
  worldGroup.add(bootcampGroup);

  for (let b = 0; b < 28; b++) {
    const a = (b / 28) * Math.PI * 2;
    const dist = 0.18 + (b % 4) * 0.24;
    const bh = 0.28 + (1.1 - dist) * 0.42 + (b % 3) * 0.09;
    const hexCol = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.16, bh, 6), matSlateBootcamp);
    hexCol.position.set(Math.cos(a) * dist, bh / 2, Math.sin(a) * dist);
    hexCol.castShadow = true;
    hexCol.receiveShadow = true;
    bootcampGroup.add(hexCol);
  }

  for (let st = 0; st < 16; st++) {
    const sa = st * 0.18;
    const sr = 0.92 - st * 0.025;
    const sy = 0.08 + st * 0.038;
    const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.09), matSpecularBrass);
    stepMesh.position.set(Math.cos(sa) * sr, sy, Math.sin(sa) * sr);
    stepMesh.rotation.y = -sa;
    bootcampGroup.add(stepMesh);
  }

  const lighthouseShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.32, 1.48, 8), matSlateBootcamp);
  lighthouseShaft.position.set(0.08, 1.12, -0.05);
  lighthouseShaft.castShadow = true;
  bootcampGroup.add(lighthouseShaft);

  for (let tb = 0; tb < 3; tb++) {
    const ty = 0.68 + tb * 0.42;
    const tr = 0.29 - tb * 0.03;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(tr, tr, 0.05, 8), matSpecularBrass);
    band.position.set(0.08, ty, -0.05);
    bootcampGroup.add(band);
  }

  const watchGallery = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.09, 16), matSpecularBrass);
  watchGallery.position.set(0.08, 1.88, -0.05);
  bootcampGroup.add(watchGallery);

  const fresnelGroup = new THREE.Group();
  fresnelGroup.position.set(0.08, 2.06, -0.05);
  const fresnelCore = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.24, 16), matGoldCanopy);
  const fresnelCage = createToothedGearGroup(THREE, {
    radius: 0.19,
    tube: 0.018,
    teeth: 16,
    toothSize: 0.015,
    spokes: 4,
    matRim: matSpecularBrass,
    matTooth: matAgedBrass
  });
  fresnelGroup.add(fresnelCore, fresnelCage);
  bootcampGroup.add(fresnelGroup);
  animatedParts.bootcampFresnel = fresnelGroup;

  const lighthouseCupola = new THREE.Mesh(new THREE.ConeGeometry(0.23, 0.26, 12), matWorkshopCopper);
  lighthouseCupola.position.set(0.08, 2.31, -0.05);
  bootcampGroup.add(lighthouseCupola);

  for (let sh = 0; sh < 2; sh++) {
    const shipGrp = new THREE.Group();
    shipGrp.position.set(1.15 + sh * 0.42, -0.10, 0.72 - sh * 0.35);
    shipGrp.rotation.y = 0.6 + sh * 0.5;
    const hull = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 6), matAgedBrass);
    hull.rotation.z = Math.PI / 2;
    const sail = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.26, 3), matParchment);
    sail.position.y = 0.14;
    shipGrp.add(hull, sail);
    bootcampGroup.add(shipGrp);
  }

  return {
    renderer,
    scene,
    camera,
    composer,
    worldGroup,
    animatedParts,
    primaryCityCurve,
    memoryRootNodes,
    taskPulseGroup,
    lights: {
      astrolabeKeyLight,
      canopyGoldLight,
      rootCyanLight,
      cityCyanLight,
      furnaceEmberLight
    },
    materials: {
      matCyanRoot,
      matGoldCanopy
    }
  };
}
