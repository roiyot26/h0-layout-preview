import {
  THREE,
  GLTFLoader,
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
  envScene.background = new THREE.Color(0x182232);

  // Overhead 2900K warm gold reflection rings
  const warmMat = new THREE.MeshBasicMaterial({ color: 0x9E7232 });
  const warmRing = new THREE.Mesh(new THREE.TorusGeometry(6.0, 0.45, 8, 48), warmMat);
  warmRing.rotation.x = Math.PI / 2;
  warmRing.position.y = 8.0;
  envScene.add(warmRing);

  // Side raking warm brass reflection panels
  const brassStripMat = new THREE.MeshBasicMaterial({ color: 0x8C7242 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(2.2, 5.5, 0.1), brassStripMat);
    panel.position.set(Math.cos(a) * 11.0, 3.5, Math.sin(a) * 11.0);
    panel.lookAt(0, 1.5, 0);
    envScene.add(panel);
  }

  // Subterranean 4800K cyan root bounce strip
  const cyanMat = new THREE.MeshBasicMaterial({ color: 0x1E8C84 });
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
  colorTex.anisotropy = 16;
  colorTex.minFilter = THREE.LinearMipmapLinearFilter;
  colorTex.magFilter = THREE.LinearFilter;

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.anisotropy = 16;

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


/**
 * SAMANA STUDIO & HYPERREALISM REQUIREMENT #3:
 * Generates a high-resolution 2048x2048 tactile Raw Board-Formed Architectural Concrete
 * & Chiseled Coursed Ashlar Stone Masonry texture atlas (colorMap, bumpMap, roughnessMap).
 * Every brick course, recessed mortar joint, formwork seam, tie-rod hole, and chipped stone edge
 * catches the 2900K god-rays with tactile physical presence.
 */
function createStoneConcreteMasonryTextures(THREE, maxAnisotropy = 16) {
  const size = 2048;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bctx = bumpCanvas.getContext('2d');

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rctx = roughCanvas.getContext('2d');

  // Deep recessed mortar joints (#141820) with subtle lime-mortar mineral fleck
  ctx.fillStyle = '#141820';
  ctx.fillRect(0, 0, size, size);

  bctx.fillStyle = '#101010'; // deep recessed mortar in bump map
  bctx.fillRect(0, 0, size, size);

  rctx.fillStyle = '#F2F2F2'; // mortar is matte/rough
  rctx.fillRect(0, 0, size, size);

  // 32 horizontal courses of bright, legible chiseled limestone/granite ashlar & board-formed concrete lifts
  const rows = 32;
  const rowH = size / rows;
  const mortar = 5.5;

  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    const isConcreteLift = r % 6 === 0; // Board-formed architectural concrete band every 6th course
    const cols = isConcreteLift ? 8 : (12 + (r % 3) * 2);
    const colW = size / cols;
    const stagger = (r % 2) * (colW * 0.5);

    for (let c = -1; c <= cols; c++) {
      const xRaw = c * colW + stagger + (rand() - 0.5) * 5.5;
      const wRaw = colW - mortar;
      const hRaw = rowH - mortar;
      const bx = xRaw + mortar * 0.5;
      const by = y + mortar * 0.5;

      // ROUND 1 & ROUND 3: Lifted warm weathered limestone / granite / architectural concrete midtones (#3B4352 - #687386)
      const baseTone = isConcreteLift
        ? 78 + Math.floor(rand() * 24)
        : 58 + Math.floor(rand() * 36);
      const warmShift = rand() > 0.45 ? 10 : 3;
      const red = Math.min(255, baseTone + warmShift);
      const grn = Math.min(255, baseTone + 5 + Math.floor(warmShift * 0.7));
      const blu = Math.min(255, baseTone + 12);

      ctx.fillStyle = `rgb(${red},${grn},${blu})`;
      ctx.fillRect(bx, by, wRaw, hRaw);

      // Subtle internal stone mineral gradient across each block face
      const faceGrad = ctx.createLinearGradient(bx, by, bx, by + hRaw);
      faceGrad.addColorStop(0.0, 'rgba(245, 232, 208, 0.16)');
      faceGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
      faceGrad.addColorStop(1.0, 'rgba(12, 16, 24, 0.24)');
      ctx.fillStyle = faceGrad;
      ctx.fillRect(bx, by, wRaw, hRaw);

      // Crisp chiseled top & left chamfer highlight (#8E98A8 / warm gold #F2DFB8)
      ctx.fillStyle = isConcreteLift
        ? 'rgba(238, 230, 214, 0.48)'
        : 'rgba(242, 214, 162, 0.42)';
      ctx.fillRect(bx, by, wRaw, 4.2);
      ctx.fillRect(bx, by, 3.8, hRaw);

      // Bottom & right deep shadow bevel above mortar joint
      ctx.fillStyle = 'rgba(10, 13, 19, 0.82)';
      ctx.fillRect(bx, by + hRaw - 4.2, wRaw, 4.2);
      ctx.fillRect(bx + wRaw - 3.8, by, 3.8, hRaw);

      // Bump height per individual block (strong 3D relief)
      const bumpVal = isConcreteLift
        ? 215 + Math.floor(rand() * 35)
        : 170 + Math.floor(rand() * 80);
      bctx.fillStyle = `rgb(${bumpVal},${bumpVal},${bumpVal})`;
      bctx.fillRect(bx + 2, by + 2, Math.max(2, wRaw - 4), Math.max(2, hRaw - 4));

      // Sharp bevel highlight in bump map
      bctx.fillStyle = '#FFFFFF';
      bctx.fillRect(bx + 1, by + 1, Math.max(2, wRaw - 2), 3.0);

      // Roughness variation per stone block
      const roughVal = isConcreteLift
        ? 140 + Math.floor(rand() * 35)
        : 120 + Math.floor(rand() * 65);
      rctx.fillStyle = `rgb(${roughVal},${roughVal},${roughVal})`;
      rctx.fillRect(bx + 2, by + 2, Math.max(2, wRaw - 4), Math.max(2, hRaw - 4));

      // ROUND 3: Diagonal mason's tooth-chisel tool marks & board-form wood grain striations
      if (isConcreteLift) {
        // Horizontal board-form wood grain lines
        ctx.strokeStyle = 'rgba(30, 36, 46, 0.32)';
        bctx.strokeStyle = '#9A9A9A';
        ctx.lineWidth = 1.2;
        bctx.lineWidth = 1.2;
        for (let g = 1; g <= 4; g++) {
          const gy = by + (g / 5) * hRaw + (rand() - 0.5) * 2.0;
          ctx.beginPath();
          ctx.moveTo(bx + 3, gy);
          ctx.lineTo(bx + wRaw - 3, gy);
          ctx.stroke();
          bctx.beginPath();
          bctx.moveTo(bx + 3, gy);
          bctx.lineTo(bx + wRaw - 3, gy);
          bctx.stroke();
        }
      } else {
        // Diagonal parallel mason chisel strokes across the dressed stone face
        const chiselCount = 7 + Math.floor(rand() * 6);
        ctx.strokeStyle = 'rgba(236, 224, 202, 0.22)';
        bctx.strokeStyle = '#E8E8E8';
        ctx.lineWidth = 1.3;
        bctx.lineWidth = 1.4;
        for (let ch = 0; ch < chiselCount; ch++) {
          const cx0 = bx + 6 + (ch / chiselCount) * Math.max(8, wRaw - 16);
          const cy0 = by + 7 + rand() * Math.max(6, hRaw - 18);
          ctx.beginPath();
          ctx.moveTo(cx0, cy0);
          ctx.lineTo(cx0 + 7, cy0 + 9);
          ctx.stroke();
          bctx.beginPath();
          bctx.moveTo(cx0, cy0);
          bctx.lineTo(cx0 + 7, cy0 + 9);
          bctx.stroke();
        }
      }

      // Formwork tie-rod cone holes & verdigris bronze plugs on architectural concrete lifts
      if (isConcreteLift && c >= 0 && c < cols) {
        const holeX = bx + wRaw * 0.5;
        const holeY = by + hRaw * 0.5;
        ctx.fillStyle = '#0D1017';
        ctx.beginPath();
        ctx.arc(holeX, holeY, 6.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(216, 180, 103, 0.62)';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Subtle verdigris / damp rainwater streak below tie-rod hole
        const streakGrad = ctx.createLinearGradient(holeX, holeY + 6, holeX, by + hRaw);
        streakGrad.addColorStop(0.0, 'rgba(58, 148, 132, 0.35)');
        streakGrad.addColorStop(1.0, 'rgba(20, 26, 34, 0.0)');
        ctx.fillStyle = streakGrad;
        ctx.fillRect(holeX - 3.5, holeY + 6, 7.0, hRaw * 0.45);

        bctx.fillStyle = '#181818';
        bctx.beginPath();
        bctx.arc(holeX, holeY, 6.8, 0, Math.PI * 2);
        bctx.fill();
      }

      // Spalled/chipped stone corners, mortar efflorescence & micro-pitting
      for (let p = 0; p < 18; p++) {
        const px = bx + 3 + rand() * Math.max(4, wRaw - 6);
        const py = by + 3 + rand() * Math.max(4, hRaw - 6);
        const pw = 2 + rand() * 7.5;
        const ph = 1.5 + rand() * 4.0;
        const darkPit = rand() > 0.48;
        ctx.fillStyle = darkPit ? 'rgba(14,18,26,0.58)' : 'rgba(238,230,214,0.26)';
        ctx.fillRect(px, py, pw, ph);

        bctx.fillStyle = darkPit ? '#484848' : '#F4F4F4';
        bctx.fillRect(px, py, pw, ph);
      }

      // Occasional mossy / lime-efflorescence weathering in lower mortar pockets
      if (rand() > 0.72) {
        ctx.fillStyle = rand() > 0.5 ? 'rgba(64, 118, 76, 0.32)' : 'rgba(218, 212, 198, 0.24)';
        ctx.fillRect(bx + 4, by + hRaw - 6.5, wRaw * (0.25 + rand() * 0.45), 5.5);
      }
    }
  }

  const colorTex = new THREE.CanvasTexture(colorCanvas);
  colorTex.colorSpace = THREE.SRGBColorSpace;
  colorTex.wrapS = THREE.RepeatWrapping;
  colorTex.wrapT = THREE.RepeatWrapping;
  colorTex.repeat.set(2.5, 3.5);
  colorTex.anisotropy = maxAnisotropy;
  colorTex.minFilter = THREE.LinearMipmapLinearFilter;
  colorTex.magFilter = THREE.LinearFilter;

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.wrapS = THREE.RepeatWrapping;
  bumpTex.wrapT = THREE.RepeatWrapping;
  bumpTex.repeat.set(2.5, 3.5);
  bumpTex.anisotropy = maxAnisotropy;
  bumpTex.minFilter = THREE.LinearMipmapLinearFilter;
  bumpTex.magFilter = THREE.LinearFilter;

  const roughTex = new THREE.CanvasTexture(roughCanvas);
  roughTex.wrapS = THREE.RepeatWrapping;
  roughTex.wrapT = THREE.RepeatWrapping;
  roughTex.repeat.set(2.5, 3.5);
  roughTex.anisotropy = maxAnisotropy;
  roughTex.minFilter = THREE.LinearMipmapLinearFilter;
  roughTex.magFilter = THREE.LinearFilter;

  return { colorTex, bumpTex, roughTex };
}

/**
 * ROUND 2 HYPERREALISM:
 * Generates a 1024x1024 Individual Feather Rachis (Central Shaft) & Microscopic Barb/Barbule
 * Strand Texture Atlas (colorTex + bumpTex) so every sculpted primary, secondary, covert,
 * and tail feather shows individual feather strands and burnished gold/bronze tips!
 */
function createFeatherPlumageTextures(THREE, maxAnisotropy = 16) {
  const w = 512;
  const h = 1024;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = w;
  colorCanvas.height = h;
  const ctx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const bctx = bumpCanvas.getContext('2d');

  // Base natural dark-bronze & warm chestnut-amber falcon feather vane gradient (zero neon cyan/white)
  const vaneGrad = ctx.createLinearGradient(0, 0, 0, h);
  vaneGrad.addColorStop(0.00, '#C89648'); // Burnished antique gold tip
  vaneGrad.addColorStop(0.18, '#9A6B2E'); // Warm chestnut-amber sub-terminal band
  vaneGrad.addColorStop(0.36, '#5C4632'); // Rich umber-bronze mid-vane
  vaneGrad.addColorStop(0.68, '#3B342E'); // Deep sepia-slate inner vane
  vaneGrad.addColorStop(1.00, '#242220'); // Basal dark covert base
  ctx.fillStyle = vaneGrad;
  ctx.fillRect(0, 0, w, h);

  bctx.fillStyle = '#505050';
  bctx.fillRect(0, 0, w, h);

  const shaftX = w * 0.5;

  // Draw 180 pairs of diagonal microscopic feather barbs & interlocking barbules radiating from the central rachis
  for (let i = 0; i < 185; i++) {
    const t = i / 185;
    const y0 = t * h;
    const barbSpread = Math.sin(Math.pow(t, 0.75) * Math.PI) * (w * 0.48);
    const tipDrop = -38 * (1.0 - t * 0.35);

    const isHighlightBarb = i % 2 === 0;
    const isGoldTipZone = t < 0.22;
    ctx.strokeStyle = isGoldTipZone
      ? (isHighlightBarb ? 'rgba(224, 182, 106, 0.88)' : 'rgba(112, 74, 24, 0.82)')
      : (isHighlightBarb ? 'rgba(176, 144, 98, 0.75)' : 'rgba(26, 22, 18, 0.85)');
    ctx.lineWidth = isHighlightBarb ? 2.1 : 1.5;

    bctx.strokeStyle = isHighlightBarb ? '#E8E8E8' : '#262626';
    bctx.lineWidth = isHighlightBarb ? 2.2 : 1.6;

    // Left vane barb
    ctx.beginPath();
    ctx.moveTo(shaftX, y0);
    ctx.quadraticCurveTo(shaftX - barbSpread * 0.55, y0 + tipDrop * 0.55, shaftX - barbSpread, y0 + tipDrop);
    ctx.stroke();

    bctx.beginPath();
    bctx.moveTo(shaftX, y0);
    bctx.quadraticCurveTo(shaftX - barbSpread * 0.55, y0 + tipDrop * 0.55, shaftX - barbSpread, y0 + tipDrop);
    bctx.stroke();

    // Right vane barb
    ctx.beginPath();
    ctx.moveTo(shaftX, y0);
    ctx.quadraticCurveTo(shaftX + barbSpread * 0.55, y0 + tipDrop * 0.55, shaftX + barbSpread, y0 + tipDrop);
    ctx.stroke();

    bctx.beginPath();
    bctx.moveTo(shaftX, y0);
    bctx.quadraticCurveTo(shaftX + barbSpread * 0.55, y0 + tipDrop * 0.55, shaftX + barbSpread, y0 + tipDrop);
    bctx.stroke();
  }

  // Crisp central feather Rachis (quill shaft) tapering from base (bottom) to tip (top)
  ctx.fillStyle = '#C4A472';
  bctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(shaftX - 7.5, h);
  ctx.lineTo(shaftX - 1.5, 12);
  ctx.lineTo(shaftX + 1.5, 12);
  ctx.lineTo(shaftX + 7.5, h);
  ctx.closePath();
  ctx.fill();

  bctx.beginPath();
  bctx.moveTo(shaftX - 8.5, h);
  bctx.lineTo(shaftX - 2.0, 12);
  bctx.lineTo(shaftX + 2.0, 12);
  bctx.lineTo(shaftX + 8.5, h);
  bctx.closePath();
  bctx.fill();

  const colorTex = new THREE.CanvasTexture(colorCanvas);
  colorTex.colorSpace = THREE.SRGBColorSpace;
  colorTex.anisotropy = maxAnisotropy;
  colorTex.minFilter = THREE.LinearMipmapLinearFilter;
  colorTex.magFilter = THREE.LinearFilter;

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.anisotropy = maxAnisotropy;
  bumpTex.minFilter = THREE.LinearMipmapLinearFilter;
  bumpTex.magFilter = THREE.LinearFilter;

  return { colorTex, bumpTex };
}

/**
 * ROUND 4 HYPERREALISM (THE KAGE WORLD-TREE):
 * Generates a 2048x2048 Deep-Grooved Gnarled Ancient Bark + Velvety Emerald/Lichen Moss
 * + Bioluminescent Cyan/Gold Sap Vein texture suite (colorTex, bumpTex, roughTex, emissiveTex).
 */
function createHyperrealBarkTextures(THREE, maxAnisotropy = 16) {
  const size = 2048;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bctx = bumpCanvas.getContext('2d');

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rctx = roughCanvas.getContext('2d');

  const emissiveCanvas = document.createElement('canvas');
  emissiveCanvas.width = size;
  emissiveCanvas.height = size;
  const ectx = emissiveCanvas.getContext('2d');

  // Deep bark fissure shadow base
  ctx.fillStyle = '#1C1510';
  ctx.fillRect(0, 0, size, size);

  bctx.fillStyle = '#121212';
  bctx.fillRect(0, 0, size, size);

  rctx.fillStyle = '#E8E8E8';
  rctx.fillRect(0, 0, size, size);

  ectx.fillStyle = '#000000';
  ectx.fillRect(0, 0, size, size);

  let seed = 4242;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // 1. 68 Deeply Furrowed Longitudinal Gnarled Bark Ridges & Crevices
  const ridgeCount = 68;
  for (let r = 0; r < ridgeCount; r++) {
    const baseX = (r / ridgeCount) * size;
    const ridgeW = (size / ridgeCount) * (0.68 + rand() * 0.42);

    // Draw overlapping scaly bark plates along each vertical ridge
    const segs = 28;
    let curX = baseX;
    for (let s = 0; s < segs; s++) {
      const y0 = (s / segs) * size;
      const hSeg = (size / segs) * 1.12;
      const waveX = Math.sin(s * 0.55 + r * 0.8) * 18.0 + (rand() - 0.5) * 10.0;
      const rx = (curX + waveX + size) % size;

      // Warm ancient redwood/oak/olive bark tones (#443428 - #6E5642)
      const lum = 56 + Math.floor(rand() * 38);
      const red = Math.min(255, lum + 24);
      const grn = Math.min(255, lum + 10);
      const blu = Math.min(255, lum - 2);

      ctx.fillStyle = `rgb(${red},${grn},${blu})`;
      ctx.fillRect(rx, y0, ridgeW, hSeg);

      // Sunlit bark ridge crest highlight
      ctx.fillStyle = 'rgba(218, 186, 142, 0.36)';
      ctx.fillRect(rx + 2, y0, ridgeW * 0.36, hSeg);

      // Deep fissure crevice shadow on right edge of bark plate
      ctx.fillStyle = 'rgba(12, 9, 6, 0.88)';
      ctx.fillRect(rx + ridgeW - 5.5, y0, 5.5, hSeg);

      // High-relief bump value for raised bark ridge
      const bVal = 155 + Math.floor(rand() * 90);
      bctx.fillStyle = `rgb(${bVal},${bVal},${bVal})`;
      bctx.fillRect(rx + 3, y0 + 2, Math.max(2, ridgeW - 7), hSeg - 3);

      // Roughness for bark ridge
      const rVal = 145 + Math.floor(rand() * 65);
      rctx.fillStyle = `rgb(${rVal},${rVal},${rVal})`;
      rctx.fillRect(rx + 3, y0 + 2, Math.max(2, ridgeW - 7), hSeg - 3);
    }
  }

  // 2. Velvety Emerald & Lichen Moss Patches growing in damp bark grooves & root hollows
  for (let m = 0; m < 420; m++) {
    const mx = rand() * size;
    const my = rand() * size;
    const mw = 14 + rand() * 58;
    const mh = 24 + rand() * 96;

    const isLichen = rand() > 0.78;
    const mossGrad = ctx.createRadialGradient(mx, my, mw * 0.1, mx, my, Math.max(mw, mh) * 0.6);
    if (isLichen) {
      mossGrad.addColorStop(0.0, 'rgba(136, 188, 124, 0.88)');
      mossGrad.addColorStop(0.6, 'rgba(78, 138, 82, 0.62)');
      mossGrad.addColorStop(1.0, 'rgba(42, 78, 46, 0.0)');
    } else {
      mossGrad.addColorStop(0.0, 'rgba(72, 152, 78, 0.92)');
      mossGrad.addColorStop(0.55, 'rgba(46, 112, 54, 0.74)');
      mossGrad.addColorStop(1.0, 'rgba(26, 64, 32, 0.0)');
    }
    ctx.fillStyle = mossGrad;
    ctx.beginPath();
    ctx.ellipse(mx, my, mw * 0.5, mh * 0.5, (rand() - 0.5) * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Velvety moss micro-tufts in bump & roughness maps
    bctx.fillStyle = 'rgba(220, 220, 220, 0.55)';
    bctx.beginPath();
    bctx.ellipse(mx, my, mw * 0.45, mh * 0.45, 0, 0, Math.PI * 2);
    bctx.fill();

    rctx.fillStyle = '#FAFAFA'; // Moss is velvety matte
    rctx.beginPath();
    rctx.ellipse(mx, my, mw * 0.48, mh * 0.48, 0, 0, Math.PI * 2);
    rctx.fill();
  }

  // 3. Thin Bioluminescent Cyan & Gold Sap Veins glowing inside deep bark fissures
  for (let v = 0; v < 26; v++) {
    let vx = (v / 26) * size + (rand() - 0.5) * 30;
    const isCyanSap = v % 2 === 0;
    const sapColor = isCyanSap ? 'rgba(42, 118, 96, 0.45)' : 'rgba(148, 104, 48, 0.45)';

    ctx.strokeStyle = sapColor;
    ctx.lineWidth = 2.4;
    ectx.strokeStyle = sapColor;
    ectx.lineWidth = 3.2;

    ctx.beginPath();
    ectx.beginPath();
    ctx.moveTo(vx, 0);
    ectx.moveTo(vx, 0);
    for (let sy = 1; sy <= 24; sy++) {
      const ny = (sy / 24) * size;
      vx += Math.sin(sy * 0.8 + v) * 14.0 + (rand() - 0.5) * 12.0;
      ctx.lineTo(vx, ny);
      ectx.lineTo(vx, ny);
    }
    ctx.stroke();
    ectx.stroke();
  }

  const colorTex = new THREE.CanvasTexture(colorCanvas);
  colorTex.colorSpace = THREE.SRGBColorSpace;
  colorTex.wrapS = THREE.RepeatWrapping;
  colorTex.wrapT = THREE.RepeatWrapping;
  colorTex.repeat.set(2.0, 2.5);
  colorTex.anisotropy = maxAnisotropy;
  colorTex.minFilter = THREE.LinearMipmapLinearFilter;
  colorTex.magFilter = THREE.LinearFilter;

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.wrapS = THREE.RepeatWrapping;
  bumpTex.wrapT = THREE.RepeatWrapping;
  bumpTex.repeat.set(2.0, 2.5);
  bumpTex.anisotropy = maxAnisotropy;
  bumpTex.minFilter = THREE.LinearMipmapLinearFilter;
  bumpTex.magFilter = THREE.LinearFilter;

  const roughTex = new THREE.CanvasTexture(roughCanvas);
  roughTex.wrapS = THREE.RepeatWrapping;
  roughTex.wrapT = THREE.RepeatWrapping;
  roughTex.repeat.set(2.0, 2.5);
  roughTex.anisotropy = maxAnisotropy;
  roughTex.minFilter = THREE.LinearMipmapLinearFilter;
  roughTex.magFilter = THREE.LinearFilter;

  const emissiveTex = new THREE.CanvasTexture(emissiveCanvas);
  emissiveTex.colorSpace = THREE.SRGBColorSpace;
  emissiveTex.wrapS = THREE.RepeatWrapping;
  emissiveTex.wrapT = THREE.RepeatWrapping;
  emissiveTex.repeat.set(2.0, 2.5);
  emissiveTex.anisotropy = maxAnisotropy;

  return { colorTex, bumpTex, roughTex, emissiveTex };
}

/**
 * ROUND 4 HYPERREALISM (THE KAGE WORLD-TREE):
 * Generates a 1024x1024 Translucent Botanical Leaf Blade Texture with:
 * - Crisp acuminate leaf silhouette (alpha channel),
 * - Central midrib, curved secondary lateral veins, and fine tertiary venation network,
 * - Subsurface bioluminescent golden-amber (#FFB84D) or cyan-teal (#2CE6D8) vein glow.
 */
function createTranslucentLeafTextures(THREE, palette = 'gold', maxAnisotropy = 16) {
  const size = 1024;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d');

  const emissiveCanvas = document.createElement('canvas');
  emissiveCanvas.width = size;
  emissiveCanvas.height = size;
  const ectx = emissiveCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bctx = bumpCanvas.getContext('2d');

  ctx.clearRect(0, 0, size, size);
  ectx.clearRect(0, 0, size, size);
  bctx.fillStyle = '#404040';
  bctx.fillRect(0, 0, size, size);

  const cx = size * 0.5;

  // Define acuminate botanical leaf blade silhouette clip path (base at bottom y=960, acuminate tip at top y=45)
  function traceLeafOutline(c) {
    c.beginPath();
    c.moveTo(cx, 965);
    c.bezierCurveTo(cx - 285, 840, cx - 340, 480, cx, 42);
    c.bezierCurveTo(cx + 340, 480, cx + 285, 840, cx, 965);
    c.closePath();
  }

  ctx.save();
  traceLeafOutline(ctx);
  ctx.clip();

  ectx.save();
  traceLeafOutline(ectx);
  ectx.clip();

  // Translucent leaf lamina gradient (emerald-jade & golden-amber or bioluminescent teal)
  const laminaGrad = ctx.createRadialGradient(cx, size * 0.52, 30, cx, size * 0.52, 460);
  if (palette === 'gold') {
    laminaGrad.addColorStop(0.0, 'rgba(198, 156, 68, 0.98)');
    laminaGrad.addColorStop(0.45, 'rgba(148, 118, 48, 0.96)');
    laminaGrad.addColorStop(0.82, 'rgba(68, 112, 56, 0.95)');
    laminaGrad.addColorStop(1.0, 'rgba(42, 78, 38, 0.94)');
  } else {
    laminaGrad.addColorStop(0.0, 'rgba(82, 168, 142, 0.98)');
    laminaGrad.addColorStop(0.45, 'rgba(54, 132, 112, 0.96)');
    laminaGrad.addColorStop(0.82, 'rgba(38, 98, 82, 0.95)');
    laminaGrad.addColorStop(1.0, 'rgba(26, 68, 56, 0.94)');
  }
  ctx.fillStyle = laminaGrad;
  ctx.fillRect(0, 0, size, size);

  // Soft subsurface glow in emissive map
  const subGrad = ectx.createRadialGradient(cx, size * 0.52, 20, cx, size * 0.52, 430);
  if (palette === 'gold') {
    subGrad.addColorStop(0.0, 'rgba(255, 196, 88, 0.72)');
    subGrad.addColorStop(0.6, 'rgba(232, 146, 36, 0.42)');
    subGrad.addColorStop(1.0, 'rgba(48, 96, 44, 0.14)');
  } else {
    subGrad.addColorStop(0.0, 'rgba(120, 255, 242, 0.76)');
    subGrad.addColorStop(0.6, 'rgba(38, 210, 196, 0.45)');
    subGrad.addColorStop(1.0, 'rgba(24, 92, 82, 0.16)');
  }
  ectx.fillStyle = subGrad;
  ectx.fillRect(0, 0, size, size);

  // Fine tertiary venation mesh (reticulate leaf capillaries)
  const veinStroke = palette === 'gold' ? 'rgba(255, 238, 182, 0.45)' : 'rgba(195, 255, 248, 0.48)';
  ctx.strokeStyle = veinStroke;
  ctx.lineWidth = 1.8;
  ectx.strokeStyle = veinStroke;
  ectx.lineWidth = 2.0;

  // 11 pairs of curved secondary lateral veins + branching tertiary veinlets
  for (let v = 1; v <= 11; v++) {
    const t = v / 12;
    const yStart = 920 - t * 790;
    const span = Math.sin(t * Math.PI) * 295;
    const yTip = yStart - 85 - (1 - t) * 45;

    for (let side of [-1, 1]) {
      ctx.strokeStyle = palette === 'gold' ? '#D8B268' : '#78C8B4';
      ctx.lineWidth = 5.2 * (1 - t * 0.45);
      ectx.strokeStyle = palette === 'gold' ? '#FFD470' : '#58FFF0';
      ectx.lineWidth = 6.0 * (1 - t * 0.45);
      bctx.strokeStyle = '#E8E8E8';
      bctx.lineWidth = 6.0 * (1 - t * 0.45);

      const ctrlX = cx + side * span * 0.55;
      const ctrlY = yStart - 24;
      const endX = cx + side * span;

      [ctx, ectx, bctx].forEach((c) => {
        c.beginPath();
        c.moveTo(cx, yStart);
        c.quadraticCurveTo(ctrlX, ctrlY, endX, yTip);
        c.stroke();
      });

      // 4 fine tertiary veinlets branching off each secondary vein
      for (let tv = 1; tv <= 4; tv++) {
        const u = tv / 5;
        const bx = (1 - u) * (1 - u) * cx + 2 * (1 - u) * u * ctrlX + u * u * endX;
        const by = (1 - u) * (1 - u) * yStart + 2 * (1 - u) * u * ctrlY + u * u * yTip;
        const tx = bx + side * (22 + tv * 6);
        const ty = by - (28 + (tv % 2) * 18);

        ctx.lineWidth = 2.0;
        ectx.lineWidth = 2.2;
        bctx.lineWidth = 2.2;
        [ctx, ectx, bctx].forEach((c) => {
          c.beginPath();
          c.moveTo(bx, by);
          c.lineTo(tx, ty);
          c.stroke();
        });
      }
    }
  }

  // Prominent glowing central Midrib vein tapering from petiole (y=965) to apex (y=42)
  [ctx, ectx, bctx].forEach((c, idx) => {
    c.fillStyle = idx === 2 ? '#FFFFFF' : (palette === 'gold' ? '#CCA454' : '#68B8A4');
    c.beginPath();
    c.moveTo(cx - 10, 965);
    c.lineTo(cx - 1.5, 42);
    c.lineTo(cx + 1.5, 42);
    c.lineTo(cx + 10, 965);
    c.closePath();
    c.fill();
  });

  ctx.restore();
  ectx.restore();

  const colorTex = new THREE.CanvasTexture(colorCanvas);
  colorTex.colorSpace = THREE.SRGBColorSpace;
  colorTex.anisotropy = maxAnisotropy;
  colorTex.minFilter = THREE.LinearMipmapLinearFilter;
  colorTex.magFilter = THREE.LinearFilter;

  const emissiveTex = new THREE.CanvasTexture(emissiveCanvas);
  emissiveTex.colorSpace = THREE.SRGBColorSpace;
  emissiveTex.anisotropy = maxAnisotropy;

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.anisotropy = maxAnisotropy;

  return { colorTex, emissiveTex, bumpTex };
}

/**
 * Soft multi-lobe volumetric cloud puff texture with smooth radial alpha falloff
 * (zero harsh edges) and warm 2900K upper rim scattering.
 */
function createVolumetricCloudTexture(THREE) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);

  const puffs = [
    { x: 0.50, y: 0.52, r: 0.42, a: 0.55 },
    { x: 0.34, y: 0.54, r: 0.30, a: 0.42 },
    { x: 0.66, y: 0.54, r: 0.30, a: 0.42 },
    { x: 0.44, y: 0.39, r: 0.28, a: 0.46 },
    { x: 0.58, y: 0.41, r: 0.26, a: 0.40 },
    { x: 0.26, y: 0.60, r: 0.22, a: 0.30 },
    { x: 0.74, y: 0.60, r: 0.22, a: 0.30 }
  ];

  puffs.forEach((p) => {
    const gx = p.x * size;
    const gy = p.y * size;
    const gr = p.r * size;
    const grad = ctx.createRadialGradient(gx, gy - gr * 0.15, gr * 0.05, gx, gy, gr);
    grad.addColorStop(0.0, `rgba(255, 242, 220, ${p.a})`);
    grad.addColorStop(0.42, `rgba(208, 218, 234, ${p.a * 0.72})`);
    grad.addColorStop(0.75, `rgba(116, 134, 162, ${p.a * 0.32})`);
    grad.addColorStop(1.0, 'rgba(18, 24, 34, 0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * ROUND 2 HYPERREALISM:
 * Builds an anatomical, multi-layered Feathered Falcon / Sea-Swift with:
 * - Sculpted torso, breast, head, brow ridge, amber eyes, hooked golden beak, and tucked golden talons
 * - 9 individually fanned overlapping tail feathers with central rachis & gold terminal bands
 * - Multi-layered articulated wings (15 individual overlapping sculpted feather blades per wing:
 *   8 fanned Primary flight feathers + 7 Secondary feathers + upper covert feather shingles),
 *   textured with microscopic feather barbs & rachis shafts!
 */
function createArticulatedBird(THREE, { matBody, matWing, matGoldTip, matFeather, scale = 1.0 }) {
  const birdGroup = new THREE.Group();
  birdGroup.scale.setScalar(scale);

  const featherMat = matFeather || matWing;

  // Helper: Organic curved acuminate feather blade (NEVER a rectangular BoxGeometry!)
  function createCurvedFeatherGeo(width, length, camber = 0.005, curveBack = 0.012) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    // Smooth convex leading edge
    shape.bezierCurveTo(width * 0.55, length * 0.22, width * 0.52, length * 0.72, curveBack, length);
    // Scalloped trailing edge tapering back to calamus quill root
    shape.bezierCurveTo(-width * 0.48, length * 0.68, -width * 0.52, length * 0.24, 0, 0);
    const geo = new THREE.ShapeGeometry(shape, 10);
    // Rotate so feather lies horizontally along -Z (trailing) and +X/-X (span) with 3D aerodynamic camber
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      const pz = pos.getZ(i);
      const u = Math.min(1.0, Math.abs(pz) / Math.max(0.001, length));
      const archY = Math.sin(u * Math.PI) * camber - Math.pow(u, 1.8) * (camber * 0.45);
      pos.setY(i, pos.getY(i) + archY);
    }
    geo.computeVertexNormals();
    return geo;
  }

  // 1. Sculpted aerodynamic owl/falcon torso & plumed breast along +Z
  const torsoGeo = new THREE.SphereGeometry(0.032, 16, 14);
  torsoGeo.scale(0.88, 0.78, 2.35);
  const torsoMesh = new THREE.Mesh(torsoGeo, matBody);
  birdGroup.add(torsoMesh);

  const breastGeo = new THREE.SphereGeometry(0.034, 14, 12);
  breastGeo.scale(0.92, 0.80, 1.42);
  const breastMesh = new THREE.Mesh(breastGeo, featherMat);
  breastMesh.position.set(0, -0.004, 0.028);
  birdGroup.add(breastMesh);

  // Dorsal mantle covert cape
  const mantleGeo = new THREE.SphereGeometry(0.033, 14, 12);
  mantleGeo.scale(1.02, 0.52, 1.50);
  const mantleMesh = new THREE.Mesh(mantleGeo, featherMat);
  mantleMesh.position.set(0, 0.015, 0.018);
  birdGroup.add(mantleMesh);

  // 2. Sculpted Hogwarts Owl / Falcon Head, Facial Disc, Amber Eyes & Hooked Beak at +Z
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.015, 0.078);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.025, 14, 12), matBody);
  skull.scale.set(0.96, 0.90, 1.15);
  headGroup.add(skull);

  for (let side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 10, 10), matGoldTip);
    eye.position.set(side * 0.016, 0.004, 0.014);
    headGroup.add(eye);
    // Subtle owl ear-tuft / supercilium plume
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.0045, 0.018, 6), featherMat);
    tuft.position.set(side * 0.014, 0.018, 0.004);
    tuft.rotation.z = side * -0.35;
    tuft.rotation.x = -0.35;
    headGroup.add(tuft);
  }

  const beakGeo = new THREE.ConeGeometry(0.009, 0.036, 10);
  beakGeo.rotateX(Math.PI * 0.58);
  const beakMesh = new THREE.Mesh(beakGeo, matGoldTip);
  beakMesh.position.set(0, -0.003, 0.030);
  headGroup.add(beakMesh);
  birdGroup.add(headGroup);

  // 3. Tucked Talons underneath torso
  for (let side of [-1, 1]) {
    const talon = new THREE.Mesh(new THREE.ConeGeometry(0.0055, 0.028, 8), matGoldTip);
    talon.rotation.x = -Math.PI * 0.38;
    talon.position.set(side * 0.015, -0.024, -0.022);
    birdGroup.add(talon);
  }

  // 4. Fanned 9-Feather Curved Tail (Rectrices) at -Z rear
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 0.005, -0.068);
  const tailFeatherGeo = createCurvedFeatherGeo(0.022, 0.105, 0.004, 0.0);
  for (let t = -4; t <= 4; t++) {
    const absT = Math.abs(t);
    const fLen = 1.0 - absT * 0.045;
    const tailFeather = new THREE.Mesh(
      tailFeatherGeo,
      absT >= 3 ? matGoldTip : featherMat
    );
    tailFeather.scale.set(1.0, 1.0, fLen);
    tailFeather.position.set(t * 0.0065, absT * 0.0008, 0);
    tailFeather.rotation.y = t * 0.115;
    tailFeather.rotation.z = t * -0.025;
    tailGroup.add(tailFeather);
  }
  birdGroup.add(tailGroup);

  // 5. Curved Elliptical / Crescent Feathered Wings (15 Curved Tapered Bezier Feathers per Wing!)
  const primaryFeatherGeo = createCurvedFeatherGeo(0.028, 0.155, 0.006, -0.012);
  const secondaryFeatherGeo = createCurvedFeatherGeo(0.030, 0.112, 0.005, -0.006);
  const covertFeatherGeo = createCurvedFeatherGeo(0.032, 0.064, 0.004, 0.0);

  function buildFeatheredWing(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.020, 0.010, 0.016);

    // Smooth curved leading-edge muscular wing margin (CatmullRomCurve3 tube, never straight bars)
    const sparCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.002, 0.010),
      new THREE.Vector3(side * 0.085, 0.006, 0.024),
      new THREE.Vector3(side * 0.175, 0.007, 0.012),
      new THREE.Vector3(side * 0.255, 0.004, -0.022)
    ]);
    const sparMesh = new THREE.Mesh(new THREE.TubeGeometry(sparCurve, 14, 0.0055, 8, false), matBody);
    pivot.add(sparMesh);

    // Layer A: 7 Overlapping Curved Secondary Flight Feathers along inner forearm
    for (let s = 0; s < 7; s++) {
      const u = s / 6;
      const anchor = sparCurve.getPointAt(0.08 + u * 0.42);
      const chordLen = 0.90 + Math.sin(u * Math.PI) * 0.18;
      const secFeather = new THREE.Mesh(secondaryFeatherGeo, featherMat);
      secFeather.scale.set(side, 1.0, chordLen);
      secFeather.position.set(anchor.x, anchor.y - 0.001, anchor.z);
      secFeather.rotation.y = side * (-0.05 - u * 0.14);
      secFeather.rotation.x = 0.05;
      pivot.add(secFeather);

      // Overlapping Curved Greater Wing Covert shingle
      const covFeather = new THREE.Mesh(covertFeatherGeo, s % 2 === 0 ? matBody : featherMat);
      covFeather.scale.set(side, 1.0, 1.0);
      covFeather.position.set(anchor.x, anchor.y + 0.003, anchor.z + 0.004);
      covFeather.rotation.y = side * (-0.04 - u * 0.10);
      covFeather.rotation.x = 0.08;
      pivot.add(covFeather);
    }

    // Layer B: 8 Swept Curved Primary Flight Feathers (Remiges) fanned at the outer hand wing
    for (let p = 0; p < 8; p++) {
      const v = p / 7;
      const anchor = sparCurve.getPointAt(0.52 + v * 0.46);
      const lenScale = 0.86 + Math.sin(v * Math.PI * 0.82) * 0.28;
      const primFeather = new THREE.Mesh(
        primaryFeatherGeo,
        p >= 5 ? matGoldTip : featherMat
      );
      primFeather.scale.set(side * (0.94 - v * 0.20), 1.0, lenScale);
      primFeather.position.set(anchor.x, anchor.y, anchor.z);
      primFeather.rotation.y = side * (-0.18 - v * 0.62);
      primFeather.rotation.z = side * (v * 0.08);
      primFeather.rotation.x = 0.03 - v * 0.04;
      pivot.add(primFeather);
    }

    return pivot;
  }

  const leftWing = buildFeatheredWing(-1);
  const rightWing = buildFeatheredWing(1);
  birdGroup.add(leftWing, rightWing);

  return { birdGroup, leftWing, rightWing, tailGroup, headGroup };
}

/**
 * v8 EYWA WOODSPRITE (Atokirina') / BIOLUMINESCENT FOREST SPIRIT:
 * Builds a delicate, pulsing jellyfish-like Pandora Woodsprite with a translucent
 * ruffled bell and 12 silken bioluminescent trailing cilia tentacles with glowing tips.
 */
function createLuminousDragonfly(THREE, { matBody, matGlow, matWing, scale = 1.0 }) {
  const dfGroup = new THREE.Group();
  dfGroup.scale.setScalar(scale);

  // Translucent pulsing medusa bell crown
  const bellGeo = new THREE.SphereGeometry(0.022, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62);
  bellGeo.scale(1.15, 0.72, 1.15);
  const bell = new THREE.Mesh(bellGeo, matWing);
  dfGroup.add(bell);

  // Inner glowing seed nucleus
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.008, 10, 10), matGlow);
  core.position.set(0, -0.002, 0);
  dfGroup.add(core);

  // 8 feathery ruffled bell-margin frills (animated via wings array)
  const wings = [];
  for (let f = 0; f < 8; f++) {
    const ang = (f / 8) * Math.PI * 2;
    const wPivot = new THREE.Group();
    wPivot.position.set(Math.cos(ang) * 0.018, -0.004, Math.sin(ang) * 0.018);
    wPivot.rotation.y = -ang;

    const frondCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.016, -0.018, 0.004),
      new THREE.Vector3(0.026, -0.044, -0.003),
      new THREE.Vector3(0.020, -0.072, 0.005)
    ]);
    const frondMesh = new THREE.Mesh(new THREE.TubeGeometry(frondCurve, 10, 0.0018, 5, false), matWing);
    const tipBead = new THREE.Mesh(new THREE.SphereGeometry(0.0032, 6, 6), matGlow);
    tipBead.position.set(0.020, -0.072, 0.005);
    wPivot.add(frondMesh, tipBead);
    dfGroup.add(wPivot);
    wings.push({ pivot: wPivot, side: f % 2 === 0 ? 1 : -1, pair: f % 2 });
  }

  return { dfGroup, wings };
}

/**
 * v8 HOGWARTS POINTED GOTHIC LANCET & TRACERY WINDOW ASSEMBLY:
 * True pointed equilateral Gothic arch (ExtrudeGeometry/ShapeGeometry — NEVER a rectangular box!),
 * recessed glowing candlelit leaded-glass lancet pane, Y-tracery mullions, and quatrefoil rose crown.
 */
function createDetailedWindowAssembly(THREE, {
  width = 0.095,
  height = 0.21,
  matStoneFrame,
  matMullion,
  matGlow
}) {
  const winGrp = new THREE.Group();
  const hw = width * 0.5;
  const springY = height * 0.15;
  const baseY = -height * 0.5;
  const apexY = height * 0.52;

  // 0. v9 DEEP 3D RECESSED STONE REVEAL / SHADOW ALCOVE CAVITY
  // Ensures windows have real physical wall thickness & deep interior shadow even with bloom=0!
  const revealShape = new THREE.Shape();
  revealShape.moveTo(-hw * 0.96, baseY - 0.004);
  revealShape.lineTo(hw * 0.96, baseY - 0.004);
  revealShape.lineTo(hw * 0.96, springY);
  revealShape.quadraticCurveTo(hw * 0.84, (springY + apexY) * 0.56, 0, apexY + 0.008);
  revealShape.quadraticCurveTo(-hw * 0.84, (springY + apexY) * 0.56, -hw * 0.96, springY);
  revealShape.closePath();

  const revealGeo = new THREE.ExtrudeGeometry(revealShape, {
    depth: 0.026,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.003,
    bevelSegments: 2
  });
  const revealMat = new THREE.MeshStandardMaterial({
    color: 0x12151E,
    roughness: 0.92,
    metalness: 0.05
  });
  const revealMesh = new THREE.Mesh(revealGeo, revealMat);
  revealMesh.position.z = -0.020;
  revealMesh.castShadow = true;
  revealMesh.receiveShadow = true;
  winGrp.add(revealMesh);

  // 1. Recessed Leaded Stained-Glass Lancet Pane (set deep inside the stone reveal)
  const paneShape = new THREE.Shape();
  paneShape.moveTo(-hw * 0.82, baseY);
  paneShape.lineTo(hw * 0.82, baseY);
  paneShape.lineTo(hw * 0.82, springY);
  paneShape.quadraticCurveTo(hw * 0.76, (springY + apexY) * 0.55, 0, apexY);
  paneShape.quadraticCurveTo(-hw * 0.76, (springY + apexY) * 0.55, -hw * 0.82, springY);
  paneShape.closePath();

  const paneGeo = new THREE.ShapeGeometry(paneShape, 12);
  const pane = new THREE.Mesh(paneGeo, matGlow);
  pane.position.z = -0.007;
  winGrp.add(pane);

  // 2. Projecting 3D Chamfered Gothic Stone Hood Moulding, Jambs & Archivolt
  const archFrameCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-hw * 1.02, baseY - 0.004, 0.008),
    new THREE.Vector3(-hw * 1.02, springY, 0.009),
    new THREE.Vector3(-hw * 0.60, (springY + apexY) * 0.56, 0.011),
    new THREE.Vector3(0, apexY + 0.015, 0.012),
    new THREE.Vector3(hw * 0.60, (springY + apexY) * 0.56, 0.011),
    new THREE.Vector3(hw * 1.02, springY, 0.009),
    new THREE.Vector3(hw * 1.02, baseY - 0.004, 0.008)
  ]);
  const archFrame = new THREE.Mesh(
    new THREE.TubeGeometry(archFrameCurve, 24, 0.0125, 8, false),
    matStoneFrame
  );
  archFrame.castShadow = true;
  archFrame.receiveShadow = true;
  winGrp.add(archFrame);

  // Inner chamfered stone archivolt order for layered Gothic depth
  const innerArchCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-hw * 0.86, baseY, 0.002),
    new THREE.Vector3(-hw * 0.86, springY, 0.002),
    new THREE.Vector3(-hw * 0.50, (springY + apexY) * 0.54, 0.003),
    new THREE.Vector3(0, apexY + 0.004, 0.003),
    new THREE.Vector3(hw * 0.50, (springY + apexY) * 0.54, 0.003),
    new THREE.Vector3(hw * 0.86, springY, 0.002),
    new THREE.Vector3(hw * 0.86, baseY, 0.002)
  ]);
  const innerArch = new THREE.Mesh(
    new THREE.TubeGeometry(innerArchCurve, 20, 0.0065, 6, false),
    matStoneFrame
  );
  winGrp.add(innerArch);

  // Gothic Finial / Dripstone Boss & Label Stops
  const apexFinial = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.042, 8), matStoneFrame);
  apexFinial.position.set(0, apexY + 0.032, 0.012);
  winGrp.add(apexFinial);

  // Weathered Sloped Stone Sill with Corbelled Drip Edge
  const sill = new THREE.Mesh(new THREE.BoxGeometry(width * 1.24, 0.022, 0.036), matStoneFrame);
  sill.position.set(0, baseY - 0.009, 0.008);
  sill.castShadow = true;
  sill.receiveShadow = true;
  winGrp.add(sill);

  // 3. Carved Stone Mullions, Horizontal Transoms & Quatrefoil Tracery
  const centerMullion = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0042, 0.0048, (springY - baseY) * 1.04, 8),
    matStoneFrame
  );
  centerMullion.position.set(0, (springY + baseY) * 0.5, -0.001);
  winGrp.add(centerMullion);

  // Horizontal leaded transom bar
  const transom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0032, 0.0032, width * 0.84, 6),
    matMullion
  );
  transom.rotation.z = Math.PI / 2;
  transom.position.set(0, baseY + (springY - baseY) * 0.52, -0.002);
  winGrp.add(transom);

  for (let side of [-1, 1]) {
    const traceryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, springY - 0.01, -0.001),
      new THREE.Vector3(side * hw * 0.38, (springY + apexY) * 0.45, -0.001),
      new THREE.Vector3(side * hw * 0.74, springY + 0.02, -0.001)
    ]);
    winGrp.add(new THREE.Mesh(new THREE.TubeGeometry(traceryCurve, 8, 0.0038, 6, false), matStoneFrame));
  }

  const rosette = new THREE.Mesh(new THREE.TorusGeometry(width * 0.17, 0.0042, 6, 16), matStoneFrame);
  rosette.position.set(0, (springY + apexY) * 0.48, -0.001);
  winGrp.add(rosette);

  return winGrp;
}
export function initCitadelWorldV6(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true
  });
  // ROUND 1: Full 2x Retina pixel ratio + 4x Hardware MSAA HalfFloat RenderTarget for zero stair-stepping!
  const pixelRatio = Math.min(window.devicePixelRatio || 2, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.38; // v8 Cinematic Hogwarts Night + Eywa Bioluminescence
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const maxAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy() || 16, 16);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070B16);
  scene.fog = new THREE.FogExp2(0x0B1222, 0.0125); // Deep Scottish Highland midnight-indigo mist

  // Lifted PMREM Study Environment (crisp specular reflections on slate, stone, brass & bioluminescence)
  scene.environment = createDarkStudyEnvironment(THREE, renderer);
  scene.environmentIntensity = 0.56;

  // Dramatic Moonlit Midnight-Indigo & Twilight Horizon Sky Dome (Hogwarts Night + Pandora Aurora horizon)
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 512;
  skyCanvas.height = 256;
  const sctx = skyCanvas.getContext('2d');
  const skyGrad = sctx.createLinearGradient(0, 0, 0, 256);
  skyGrad.addColorStop(0.00, '#040710');
  skyGrad.addColorStop(0.38, '#0A1328');
  skyGrad.addColorStop(0.68, '#162544');
  skyGrad.addColorStop(0.86, '#262B4E');
  skyGrad.addColorStop(0.95, '#382B44');
  skyGrad.addColorStop(1.00, '#0C1220');
  sctx.fillStyle = skyGrad;
  sctx.fillRect(0, 0, 512, 256);
  const skyTex = new THREE.CanvasTexture(skyCanvas);
  skyTex.colorSpace = THREE.SRGBColorSpace;
  const skyDome = new THREE.Mesh(
    new THREE.SphereGeometry(96, 32, 20),
    new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })
  );
  skyDome.name = 'GRP_Atmospheric_SkyDome';
  scene.add(skyDome);

  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 160);

  // Post-processing with explicit 4x-MSAA HalfFloat RenderTarget + matched 2x pixelRatio
  const msaaRenderTarget = new THREE.WebGLRenderTarget(
    Math.floor(window.innerWidth * pixelRatio),
    Math.floor(window.innerHeight * pixelRatio),
    {
      samples: /SwiftShader|llvmpipe/i.test(renderer.getContext().getParameter(renderer.getContext().RENDERER) || '') ? 0 : 4,
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter
    }
  );
  const composer = new EffectComposer(renderer, msaaRenderTarget);
  composer.setPixelRatio(pixelRatio);
  composer.setSize(window.innerWidth, window.innerHeight);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // v8 CALIBRATED CINEMATIC MICRO-BLOOM:
  // threshold = 0.88 ensures stone masonry, cliff rock, bark & feathers have ZERO bloom blur,
  // while Eywa's bioluminescent willow tendrils & Hogwarts' candlelit lancet windows glow lusciously!
  // v9 PHYSICALLY-MOTIVATED SUBTLE BLOOM + MANDATORY ?bloom=0 QUALITY GATE SUPPORT
  const urlParamsV9 = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const bloomDisabled = urlParamsV9 && urlParamsV9.get('bloom') === '0';
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio),
    0.12, // strength = 0.12 (subtle physically-motivated halation, never obscures geometry)
    0.22, // radius = 0.22 (tight controlled falloff)
    0.95  // threshold = 0.95 (only true high-luminance cores trigger bloom; stone/slate/bark have 0 bloom)
  );
  bloomPass.enabled = !bloomDisabled;
  if (bloomPass.materialHighPassFilter && bloomPass.materialHighPassFilter.fragmentShader) {
    bloomPass.materialHighPassFilter.fragmentShader = bloomPass.materialHighPassFilter.fragmentShader.replace(
      'gl_FragColor = mix( outputColor, texel, alpha );',
      'vec4 safeTex = mix(vec4(0.0, 0.0, 0.0, 1.0), texel, bvec4(texel == texel)); vec4 clampedTexel = clamp( safeTex, vec4(0.0), vec4(16.0, 16.0, 16.0, 1.0) ); float safeV = luminance( clampedTexel.xyz ); float safeAlpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, safeV ); gl_FragColor = mix( outputColor, clampedTexel, safeAlpha );'
    );
    bloomPass.materialHighPassFilter.needsUpdate = true;
  }
  if (bloomPass.separableBlurMaterials) {
    bloomPass.separableBlurMaterials.forEach((mat) => {
      if (mat && mat.fragmentShader) {
        mat.fragmentShader = mat.fragmentShader.replace(
          'vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;',
          'vec3 s1raw = texture2D( colorTexture, vUv + uvOffset ).rgb; vec3 sample1 = clamp(mix(vec3(0.0), s1raw, bvec3(s1raw == s1raw)), vec3(0.0), vec3(24.0));'
        ).replace(
          'vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;',
          'vec3 s2raw = texture2D( colorTexture, vUv - uvOffset ).rgb; vec3 sample2 = clamp(mix(vec3(0.0), s2raw, bvec3(s2raw == s2raw)), vec3(0.0), vec3(24.0));'
        ).replace(
          'vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;',
          'vec3 cRaw = texture2D( colorTexture, vUv ).rgb; vec3 diffuseSum = clamp(mix(vec3(0.0), cRaw, bvec3(cRaw == cRaw)), vec3(0.0), vec3(24.0)) * centerWeight;'
        );
        mat.needsUpdate = true;
      }
    });
  }
  composer.addPass(bloomPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  // --- v8 DRAMATIC CINEMATIC LIGHTING: HOGWARTS GOLDEN UPLIGHTS + SILVER MOONLIGHT RIM + EYWA BIOLUMINESCENCE ---
  const ambientLight = new THREE.HemisphereLight(0x4E6FA8, 0x181E2E, 1.08);
  scene.add(ambientLight);

  // Cool Silver-Blue Moonlight Rim & Key Light with 2048x2048 high-res shadow map
  const astrolabeKeyLight = new THREE.DirectionalLight(0x9CC4FF, 2.15);
  astrolabeKeyLight.position.set(-4.8, 10.2, -4.5);
  astrolabeKeyLight.castShadow = true;
  astrolabeKeyLight.shadow.mapSize.width = 4096;
  astrolabeKeyLight.shadow.mapSize.height = 4096;
  astrolabeKeyLight.shadow.camera.near = 1.0;
  astrolabeKeyLight.shadow.camera.far = 28.0;
  const d = 7.8;
  astrolabeKeyLight.shadow.camera.left = -d;
  astrolabeKeyLight.shadow.camera.right = d;
  astrolabeKeyLight.shadow.camera.top = d;
  astrolabeKeyLight.shadow.camera.bottom = -d;
  astrolabeKeyLight.shadow.bias = -0.00025;
  astrolabeKeyLight.shadow.normalBias = 0.012;
  scene.add(astrolabeKeyLight);

  // Warm 2700K Golden Architectural Raking Light across Hogwarts Spires, Viaduct & Owls
  const grazingFillLight = new THREE.DirectionalLight(0xFFB866, 1.75);
  grazingFillLight.position.set(5.8, 3.2, 6.0);
  scene.add(grazingFillLight);

  // Cool Moonlight Counter-Rim from NNW for dramatic spire & willow silhouette separation
  const ceruleanRimLight = new THREE.DirectionalLight(0x70B8FF, 1.45);
  ceruleanRimLight.position.set(-5.5, 6.0, -6.2);
  scene.add(ceruleanRimLight);

  // Eywa Canopy Bioluminescent Violet-Magenta Heart Light
  const canopyGoldLight = new THREE.PointLight(0xDA70FF, 2.35, 11.5, 1.5);
  canopyGoldLight.position.set(0, 2.85, 0.15);
  scene.add(canopyGoldLight);

  // Eywa Braided Trunk & Tendrils Front Bioluminescent Pink-Lavender Fill
  const kageBarkKeyLight = new THREE.PointLight(0xFF9CEE, 1.95, 7.5, 1.55);
  kageBarkKeyLight.position.set(0.75, 1.75, 2.05);
  scene.add(kageBarkKeyLight);

  // Eywa Snaking Root Neural-Vein Cyan-Aqua Glow Light
  const rootCyanLight = new THREE.PointLight(0x38F2E6, 2.10, 9.5, 1.55);
  rootCyanLight.position.set(0.55, 0.65, 0.75);
  scene.add(rootCyanLight);

  // Hogwarts Cliff Base & Viaduct Golden 2700K Architectural Uplights (Universal/Film Hogwarts night look!)
  const cityCyanLight = new THREE.PointLight(0xFFA038, 2.45, 8.0, 1.5);
  cityCyanLight.position.set(2.05, 0.85, 2.35);
  scene.add(cityCyanLight);

  const cityWarmUplight = new THREE.PointLight(0xFFB852, 2.65, 9.0, 1.45);
  cityWarmUplight.position.set(3.25, 1.35, 3.15);
  scene.add(cityWarmUplight);

  const hogwartsGreatHallUplight = new THREE.PointLight(0xFF9E32, 2.15, 7.0, 1.5);
  hogwartsGreatHallUplight.position.set(2.55, 1.10, 1.35);
  scene.add(hogwartsGreatHallUplight);

  // Dedicated Bootcamp Basalt Cliffs, Viaduct & Lighthouse Uplight (for ?view=bootcamp)
  const bootcampWarmLight = new THREE.PointLight(0xFFB44C, 2.25, 9.5, 1.5);
  bootcampWarmLight.position.set(2.15, 1.65, -1.35);
  scene.add(bootcampWarmLight);

  // 2100K Workshop Furnace Hearth Light
  const furnaceEmberLight = new THREE.PointLight(0xFF7B3B, 1.95, 8.5, 1.6);
  furnaceEmberLight.position.set(-3.1, 1.15, 1.35);
  scene.add(furnaceEmberLight);

  // --- 60 / 30 / 10 PHYSICAL MATERIALS (WITH 16x ANISOTROPY & CINEMATIC CONTRAST) ---
  const { colorTex: tableColorTex, bumpTex: tableBumpTex } = createCarvedTableTextures();
  const {
    colorTex: masonryColorTex,
    bumpTex: masonryBumpTex,
    roughTex: masonryRoughTex
  } = createStoneConcreteMasonryTextures(THREE, maxAnisotropy);

  const {
    colorTex: featherColorTex,
    bumpTex: featherBumpTex
  } = createFeatherPlumageTextures(THREE, maxAnisotropy);

  const {
    colorTex: barkColorTex,
    bumpTex: barkBumpTex,
    roughTex: barkRoughTex,
    emissiveTex: barkEmissiveTex
  } = createHyperrealBarkTextures(THREE, maxAnisotropy);

  const {
    colorTex: leafGoldColorTex,
    emissiveTex: leafGoldEmissiveTex,
    bumpTex: leafGoldBumpTex
  } = createTranslucentLeafTextures(THREE, 'gold', maxAnisotropy);

  const {
    colorTex: leafCyanColorTex,
    emissiveTex: leafCyanEmissiveTex,
    bumpTex: leafCyanBumpTex
  } = createTranslucentLeafTextures(THREE, 'cyan', maxAnisotropy);

  // --- v9 REAL PHOTOGRAMMETRY CC0 PBR TEXTURE PIPELINE (Poly Haven 1K Maps) ---
  const texLoader = new THREE.TextureLoader();
  function loadPbrTex(url, isSRGB, repX, repY) {
    const t = texLoader.load(url);
    t.colorSpace = isSRGB ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repX, repY);
    t.anisotropy = maxAnisotropy;
    return t;
  }

  const phBrickDiff = loadPbrTex('../vendor/textures/castle_brick_broken_06_diffuse_1k.jpg', true, 3.5, 3.5);
  const phBrickNorm = loadPbrTex('../vendor/textures/castle_brick_broken_06_nor_gl_1k.jpg', false, 3.5, 3.5);
  const phBrickRough = loadPbrTex('../vendor/textures/castle_brick_broken_06_rough_1k.jpg', false, 3.5, 3.5);
  const phBrickAO = loadPbrTex('../vendor/textures/castle_brick_broken_06_ao_1k.jpg', false, 3.5, 3.5);

  const phSlateDiff = loadPbrTex('../vendor/textures/roof_slates_02_diffuse_1k.jpg', true, 4.0, 4.0);
  const phSlateNorm = loadPbrTex('../vendor/textures/roof_slates_02_nor_gl_1k.jpg', false, 4.0, 4.0);
  const phSlateRough = loadPbrTex('../vendor/textures/roof_slates_02_rough_1k.jpg', false, 4.0, 4.0);

  const phRockDiff = loadPbrTex('../vendor/textures/rock_face_03_diffuse_1k.jpg', true, 3.0, 3.0);
  const phRockNorm = loadPbrTex('../vendor/textures/rock_face_03_nor_gl_1k.jpg', false, 3.0, 3.0);
  const phRockRough = loadPbrTex('../vendor/textures/rock_face_03_rough_1k.jpg', false, 3.0, 3.0);

  const phBarkDiff = loadPbrTex('../vendor/textures/bark_willow_02_diffuse_1k.jpg', true, 2.5, 4.5);
  const phBarkNorm = loadPbrTex('../vendor/textures/bark_willow_02_nor_gl_1k.jpg', false, 2.5, 4.5);
  const phBarkRough = loadPbrTex('../vendor/textures/bark_willow_02_rough_1k.jpg', false, 2.5, 4.5);

  const phMossDiff = loadPbrTex('../vendor/textures/moss_01_diffuse_1k.jpg', true, 3.0, 3.0);
  const phMossNorm = loadPbrTex('../vendor/textures/moss_01_nor_gl_1k.jpg', false, 3.0, 3.0);
  const phMossRough = loadPbrTex('../vendor/textures/moss_01_rough_1k.jpg', false, 3.0, 3.0);

  // 60% Base: Matte Volcanic Obsidian Table & Scottish Highland Castle Ashlar Stone / Slate
  const matObsidianCarved = new THREE.MeshStandardMaterial({
    color: 0xB8C4D8,
    map: tableColorTex,
    bumpMap: tableBumpTex,
    bumpScale: 0.048,
    roughness: 0.74,
    metalness: 0.08
  });

  const matObsidianSolid = new THREE.MeshStandardMaterial({
    color: 0x5A667A,
    map: phRockDiff,
    normalMap: phRockNorm,
    normalScale: new THREE.Vector2(1.45, 1.45),
    roughnessMap: phRockRough,
    roughness: 0.86,
    metalness: 0.06
  });

  const matMilledTrench = new THREE.MeshStandardMaterial({
    color: 0x080C14,
    roughness: 0.88,
    metalness: 0.06
  });

  // Hogwarts Turret Slate Roof Material (Real Poly Haven roof_slates_02 PBR)
  const matSlateBootcamp = new THREE.MeshStandardMaterial({
    color: 0x62738C,
    map: phSlateDiff,
    normalMap: phSlateNorm,
    normalScale: new THREE.Vector2(1.55, 1.55),
    roughnessMap: phSlateRough,
    roughness: 0.68,
    metalness: 0.14
  });

  // Hogwarts Weathered Highland Sandstone / Limestone Ashlar Masonry (Real Poly Haven castle_brick_broken_06 PBR)
  const matArchitecturalConcrete = new THREE.MeshStandardMaterial({
    color: 0xC4B49E,
    map: phBrickDiff,
    normalMap: phBrickNorm,
    normalScale: new THREE.Vector2(1.50, 1.50),
    roughnessMap: phBrickRough,
    aoMap: phBrickAO,
    aoMapIntensity: 0.65,
    roughness: 0.80,
    metalness: 0.05
  });

  // Warm Buff Cotswold / Highland Dressed Stone Trim & Buttresses
  const matTravertineCampus = new THREE.MeshStandardMaterial({
    color: 0xDFD0B8,
    map: phBrickDiff,
    normalMap: phBrickNorm,
    normalScale: new THREE.Vector2(0.95, 0.95),
    roughnessMap: phBrickRough,
    roughness: 0.72,
    metalness: 0.05
  });

  // Eywa Ancient Gnarled Willow Bark (Real Poly Haven bark_willow_02 PBR + subtle bioluminescent fissure veins)
  const matKageGnarledBark = new THREE.MeshStandardMaterial({
    color: 0x9C8A9E,
    map: phBarkDiff,
    normalMap: phBarkNorm,
    normalScale: new THREE.Vector2(1.75, 1.75),
    roughnessMap: phBarkRough,
    roughness: 0.84,
    metalness: 0.04,
    emissive: 0x1E3848,
    emissiveMap: barkEmissiveTex,
    emissiveIntensity: 0.22
  });

  // Bioluminescent Pandora Sanctuary Moss (Real Poly Haven moss_01 PBR)
  const matKageVelvetMoss = new THREE.MeshStandardMaterial({
    color: 0x48A88C,
    map: phMossDiff,
    normalMap: phMossNorm,
    normalScale: new THREE.Vector2(1.35, 1.35),
    roughnessMap: phMossRough,
    roughness: 0.86,
    metalness: 0.04,
    emissive: 0x0E443E,
    emissiveIntensity: 0.24
  });

  // Eywa Bioluminescent Willow Tendril Materials (calibrated so every individual weeping strand & braided trunk is razor-sharp!)
  const matEywaTendrilViolet = new THREE.MeshStandardMaterial({
    color: 0xE298FF,
    emissive: 0xC852FF,
    emissiveIntensity: 0.94,
    roughness: 0.26,
    metalness: 0.05
  });

  const matEywaTendrilPink = new THREE.MeshStandardMaterial({
    color: 0xFFB8F0,
    emissive: 0xFF66DC,
    emissiveIntensity: 0.96,
    roughness: 0.24,
    metalness: 0.04
  });

  const matEywaTendrilPearl = new THREE.MeshStandardMaterial({
    color: 0xFAF0FF,
    emissive: 0xE8C8FF,
    emissiveIntensity: 1.04,
    roughness: 0.20,
    metalness: 0.04
  });

  const matEywaTendrilCyan = new THREE.MeshStandardMaterial({
    color: 0x98FFF4,
    emissive: 0x2CE6D8,
    emissiveIntensity: 0.95,
    roughness: 0.24,
    metalness: 0.05
  });

  const matTranslucentLeafGold = new THREE.MeshStandardMaterial({
    color: 0xF6D4FF,
    map: leafGoldColorTex,
    emissive: 0xE066FF,
    emissiveMap: leafGoldEmissiveTex,
    emissiveIntensity: 1.25,
    bumpMap: leafGoldBumpTex,
    bumpScale: 0.042,
    roughness: 0.34,
    metalness: 0.04,
    alphaTest: 0.28,
    transparent: true,
    side: THREE.DoubleSide
  });

  const matTranslucentLeafCyan = new THREE.MeshStandardMaterial({
    color: 0xD8FFF8,
    map: leafCyanColorTex,
    emissive: 0x38F2E6,
    emissiveMap: leafCyanEmissiveTex,
    emissiveIntensity: 1.25,
    bumpMap: leafCyanBumpTex,
    bumpScale: 0.042,
    roughness: 0.34,
    metalness: 0.04,
    alphaTest: 0.28,
    transparent: true,
    side: THREE.DoubleSide
  });

  // 30% Structure & Craft: Clockwork Metals
  const matAgedBrass = new THREE.MeshStandardMaterial({
    color: 0xB8924A,
    roughness: 0.30,
    metalness: 0.86
  });

  const matSpecularBrass = new THREE.MeshStandardMaterial({
    color: 0xCCA65A,
    roughness: 0.28,
    metalness: 0.84
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

  // 10% Emission (v8 Calibrated for Hogwarts Candlelight + Eywa Neural Veins)
  const matCyanRoot = new THREE.MeshStandardMaterial({
    color: 0x68FAF0,
    emissive: 0x2CE6D8,
    emissiveIntensity: 1.28,
    roughness: 0.28,
    metalness: 0.08
  });

  const matCyanCore = new THREE.MeshStandardMaterial({
    color: 0x98FFF8,
    emissive: 0x38F2E6,
    emissiveIntensity: 1.48,
    roughness: 0.24,
    metalness: 0.10
  });

  // Warm Floating-Candle Amber Glow for Hogwarts Lancet Windows (#FFB347)
  const matGoldCanopy = new THREE.MeshStandardMaterial({
    color: 0xFFE2A8,
    emissive: 0xFFA834,
    emissiveIntensity: 1.42,
    roughness: 0.26,
    metalness: 0.10
  });

  const matEmberHeart = new THREE.MeshStandardMaterial({
    color: 0xFF9452,
    emissive: 0xFF5A18,
    emissiveIntensity: 1.35,
    roughness: 0.28,
    metalness: 0.12
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
  // ============================================================================
  // v9 PHASE E: 3-LAYER ATMOSPHERIC WORLD EXPANSION (ELIMINATE FLOATING TABLETOP!)
  //   - Layer 3 (Background): Expansive Scottish Highland Loch water plane (R=88m),
  //     360° ring of craggy mountain ranges (R=18..54m), distant cliff watchtowers
  //     with warm 2700K window pinpricks, and low-lying valley mist strata.
  //   - Layer 1 (Foreground): Rugged coastal cliff aprons & stone parapet lanterns
  //     anchoring the sanctuary into a continuous Highland loch & mountain valley.
  // ============================================================================
  const envExpansionGroup = new THREE.Group();
  envExpansionGroup.name = 'GRP_V9_3Layer_Environment';
  worldGroup.add(envExpansionGroup);

  // 1A. Expansive Scottish Highland Loch Water Plane (R = 88m at y = -0.34m)
  const lochWaterMat = new THREE.MeshStandardMaterial({
    color: 0x0A1526,
    normalMap: phRockNorm,
    normalScale: new THREE.Vector2(0.32, 0.32),
    roughness: 0.16,
    metalness: 0.78
  });
  const lochWaterPlane = new THREE.Mesh(new THREE.CircleGeometry(88.0, 96), lochWaterMat);
  lochWaterPlane.rotation.x = -Math.PI / 2;
  lochWaterPlane.position.y = -0.34;
  lochWaterPlane.receiveShadow = true;
  envExpansionGroup.add(lochWaterPlane);

  // 1B. Submerged & Shoreline Craggy Highland Reefs & Cliff Promontories around the Sanctuary
  //     Breaks up the circular table silhouette so the sanctuary rises out of natural craggy cliffs!
  const shorelineCragMat = new THREE.MeshStandardMaterial({
    color: 0x3A4354,
    map: phRockDiff,
    normalMap: phRockNorm,
    normalScale: new THREE.Vector2(1.6, 1.6),
    roughnessMap: phRockRough,
    roughness: 0.88,
    metalness: 0.06
  });

  function createMountainPeak(rx, ry, rz, seed) {
    const geo = new THREE.ConeGeometry(1.0, 1.0, 14, 6);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      const hFrac = vy + 0.5; // 0 at base, 1 at peak
      const ang = Math.atan2(vz, vx);
      const ridge = 1.0
        + 0.26 * Math.sin(ang * 3.0 + seed)
        + 0.18 * Math.cos(ang * 5.0 - seed * 1.7 + hFrac * 4.0)
        + 0.12 * Math.sin(hFrac * 7.0 + ang * 2.0);
      pos.setXYZ(
        i,
        vx * rx * ridge + Math.sin(hFrac * 3.0 + seed) * (rx * 0.08),
        (hFrac * ry) * (0.88 + 0.16 * Math.sin(ang * 2.0 + seed)),
        vz * rz * ridge + Math.cos(hFrac * 3.0 - seed) * (rz * 0.08)
      );
    }
    geo.computeVertexNormals();
    return geo;
  }

  // 18 Craggy Shoreline Headlands & Skerries bridging R = 6.6m..12.8m into the Loch
  for (let sh = 0; sh < 18; sh++) {
    const ang = (sh / 18) * Math.PI * 2 + (sh % 2) * 0.09;
    const dist = 7.1 + (sh % 3) * 1.45;
    const rx = 1.45 + (sh % 4) * 0.45;
    const ry = 0.55 + (sh % 3) * 0.32;
    const rz = 1.35 + (sh % 3) * 0.40;
    const skerryMesh = new THREE.Mesh(createMountainPeak(rx, ry, rz, sh * 1.3), shorelineCragMat);
    skerryMesh.position.set(Math.cos(ang) * dist, -0.36, Math.sin(ang) * dist);
    skerryMesh.rotation.y = ang + 0.4;
    skerryMesh.castShadow = true;
    skerryMesh.receiveShadow = true;
    envExpansionGroup.add(skerryMesh);
  }

  // 1C. 360-Degree Layered Scottish Highland Mountain Ranges & Silhouettes (R = 19m..48m)
  const mountainNearMat = new THREE.MeshStandardMaterial({
    color: 0x1E2738,
    map: phRockDiff,
    normalMap: phRockNorm,
    normalScale: new THREE.Vector2(1.2, 1.2),
    roughness: 0.90,
    metalness: 0.05
  });
  const mountainFarMat = new THREE.MeshStandardMaterial({
    color: 0x121A2B,
    roughness: 0.94,
    metalness: 0.04
  });

  // Near Mountain Range Ring (24 sculpted craggy peaks at R = 18..26m)
  for (let m = 0; m < 24; m++) {
    const ang = (m / 24) * Math.PI * 2 + 0.08;
    const dist = 19.5 + (m % 3) * 2.8;
    const rx = 3.8 + (m % 4) * 0.9;
    const ry = 3.2 + (m % 5) * 1.15;
    const rz = 3.4 + (m % 3) * 0.8;
    const mMesh = new THREE.Mesh(createMountainPeak(rx, ry, rz, m * 2.1), mountainNearMat);
    mMesh.position.set(Math.cos(ang) * dist, -0.45, Math.sin(ang) * dist);
    mMesh.rotation.y = -ang + 0.5;
    envExpansionGroup.add(mMesh);

    // Distant Cliffside Watchtowers on 6 mountain shoulders with tiny warm 2700K window pinpricks
    if (m % 4 === 0) {
      const wtGrp = new THREE.Group();
      const wtDist = dist - 1.4;
      const wtY = ry * 0.48;
      wtGrp.position.set(Math.cos(ang) * wtDist, wtY, Math.sin(ang) * wtDist);
      const wtDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 0.85, 10), matArchitecturalConcrete);
      const wtRoof = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.52, 10), matSlateBootcamp);
      wtRoof.position.y = 0.68;
      const wtPinprick = new THREE.Mesh(new THREE.SphereGeometry(0.032, 6, 6), matGoldCanopy);
      wtPinprick.position.set(0, 0.18, 0.16);
      wtGrp.add(wtDrum, wtRoof, wtPinprick);
      wtGrp.lookAt(0, wtY, 0);
      envExpansionGroup.add(wtGrp);
    }
  }

  // Far Horizon Mountain Range Ring (28 towering peaks at R = 32..46m)
  for (let m = 0; m < 28; m++) {
    const ang = (m / 28) * Math.PI * 2;
    const dist = 33.0 + (m % 4) * 3.2;
    const rx = 5.6 + (m % 3) * 1.4;
    const ry = 5.4 + (m % 5) * 1.8;
    const rz = 5.0 + (m % 4) * 1.2;
    const farMesh = new THREE.Mesh(createMountainPeak(rx, ry, rz, m * 3.7 + 1.0), mountainFarMat);
    farMesh.position.set(Math.cos(ang) * dist, -0.55, Math.sin(ang) * dist);
    farMesh.rotation.y = -ang;
    envExpansionGroup.add(farMesh);
  }

  // 1D. Foreground & Perimeter Stone Viaduct Causeway Lanterns (Environmental Storytelling)
  for (let l = 0; l < 12; l++) {
    const la = (l / 12) * Math.PI * 2 + 0.14;
    const lr = 6.45;
    const lanGrp = new THREE.Group();
    lanGrp.position.set(Math.cos(la) * lr, 0.08, Math.sin(la) * lr);
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.072, 0.34, 8), matTravertineCampus);
    pillar.position.y = 0.17;
    pillar.castShadow = true;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.03, 8), matAgedBrass);
    cap.position.y = 0.35;
    const lanternGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.026, 0.075, 6), matGoldCanopy);
    lanternGlass.position.y = 0.40;
    const lanternRoof = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.055, 6), matAgedBrass);
    lanternRoof.position.y = 0.46;
    lanGrp.add(pillar, cap, lanternGlass, lanternRoof);
    envExpansionGroup.add(lanGrp);
  }

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

  // Curved Sunken Sanctuary Root Arch Buttresses around the Well (zero rectangular ribs!)
  for (let b = 0; b < 8; b++) {
    const a = (b / 8) * Math.PI * 2;
    const archRibCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(a) * 1.38, 0.12, Math.sin(a) * 1.38),
      new THREE.Vector3(Math.cos(a) * 1.22, 0.28, Math.sin(a) * 1.22),
      new THREE.Vector3(Math.cos(a) * 1.02, 0.18, Math.sin(a) * 1.02)
    ]);
    worldGroup.add(new THREE.Mesh(new THREE.TubeGeometry(archRibCurve, 12, 0.026, 8, false), matAgedBrass));
  }

  // ==========================================================================
  // v8 CENTERPIECE: AVATAR'S TREE OF SOULS / EYWA (Vitraya Ramunong)
  // (GRP_Station_02_Kage / STN_02_Kage)
  // 1. 8 Thick, Sinuous, Spiral-Braided Helical Trunk Strands twisting from wide
  //    snaking root buttresses up into a sweeping umbrella willow crown.
  // 2. 12 Snaking Bioluminescent Root Buttresses + Pulsing Cyan-Violet Neural Veins.
  // 3. 24 Sweeping Arched Umbrella Willow Boughs + Secondary Drooping Willow Limbs.
  // 4. 440 Long, Cascading Bioluminescent Weeping Willow Tendrils (glowing violet,
  //    lavender-pink, pearl-white & cyan-aqua fiber-optic strands draping nearly to
  //    the sanctuary floor with luminous seed-node droplets).
  // 5. Zero rectangular collars, zero blocky lugs, zero stiff flat leaf triangles!
  // ==========================================================================
  const kageTreeGroup = new THREE.Group();
  kageTreeGroup.name = 'GRP_Station_02_Kage';
  worldGroup.add(kageTreeGroup);

  const stn02KageCore = new THREE.Group();
  stn02KageCore.name = 'STN_02_Kage';
  kageTreeGroup.add(stn02KageCore);

  // Helper: Organic fluted bark strand along a 3D CatmullRomCurve3
  function buildTaperedBarkBranch(curve, rStart, rEnd, radialSegs, tubularSegs, mat, fluteAmp = 0.15) {
    const frames = curve.computeFrenetFrames(tubularSegs, false);
    const pos = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i <= tubularSegs; i++) {
      const u = i / tubularSegs;
      const pt = curve.getPointAt(u);
      const N = frames.normals[i];
      const B = frames.binormals[i];
      const baseR = THREE.MathUtils.lerp(rStart, rEnd, Math.pow(u, 0.80));

      for (let j = 0; j <= radialSegs; j++) {
        const v = j / radialSegs;
        const theta = v * Math.PI * 2;
        const flute = 1.0
          + fluteAmp * Math.sin(theta * 6.0 + u * 10.0)
          + (fluteAmp * 0.52) * Math.cos(theta * 11.0 - u * 7.5);
        const r = baseR * flute;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        const vx = pt.x + r * (cosT * N.x + sinT * B.x);
        const vy = pt.y + r * (cosT * N.y + sinT * B.y);
        const vz = pt.z + r * (cosT * N.z + sinT * B.z);
        pos.push(vx, vy, vz);
        uvs.push(v * 2.0, u * 3.5);
      }
    }

    const stride = radialSegs + 1;
    for (let i = 0; i < tubularSegs; i++) {
      for (let j = 0; j < radialSegs; j++) {
        const a = i * stride + j;
        const b = (i + 1) * stride + j;
        const c = (i + 1) * stride + (j + 1);
        const d = i * stride + (j + 1);
        indices.push(a, b, d, b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // 2A. LEVEL 1, 2 & 3: Massive Flaring Buttress Roots, Mossy Root Hollows &
  //     Fused Multi-Stem Gnarled Trunk with Burls & Subtle Recessed Sap Channels
  //     (Front viewing sector kept open so gnarled woody anatomy is 100% legible!)
  const heartCoreCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.00, 0.10, 0.00),
    new THREE.Vector3(0.04, 0.68, 0.03),
    new THREE.Vector3(-0.03, 1.34, 0.02),
    new THREE.Vector3(0.02, 2.08, 0.00)
  ]);
  stn02KageCore.add(buildTaperedBarkBranch(heartCoreCurve, 0.42, 0.28, 24, 30, matKageGnarledBark, 0.25));

  // 8 Heavy Fused Gnarled Trunk Buttress Ridges merging seamlessly into the massive central trunk
  const braidedStrandCount = 8;
  for (let s = 0; s < braidedStrandCount; s++) {
    const a0 = (s / braidedStrandCount) * Math.PI * 2 + 0.14;
    const braidPts = [];
    const steps = 24;
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const y = 0.08 + t * 2.18;
      const rootSpread = Math.pow(1.0 - t, 2.1) * 0.68;
      const waistR = 0.22 + Math.sin(t * Math.PI * 1.5 + s * 0.9) * 0.035;
      const crownFlare = Math.pow(t, 2.4) * 0.48;
      const rad = rootSpread + waistR + crownFlare;
      // Coherent unidirectional organic twist so ridges fuse into one monumental gnarled trunk without X-crossing
      const theta = a0 + t * 0.52 + Math.sin(t * Math.PI * 2.0 + s * 1.3) * 0.09;
      braidPts.push(new THREE.Vector3(Math.cos(theta) * rad, y, Math.sin(theta) * rad));
    }
    const braidCurve = new THREE.CatmullRomCurve3(braidPts);
    stn02KageCore.add(buildTaperedBarkBranch(braidCurve, 0.195, 0.105, 18, 28, matKageGnarledBark, 0.24));

    // Organic Bark Burls / Callus Knots along the lower & mid trunk
    const burlPt = braidCurve.getPointAt(0.28 + (s % 3) * 0.16);
    const burlMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.068 + (s % 2) * 0.02, 1), matKageGnarledBark);
    burlMesh.scale.set(1.25, 0.82, 1.15);
    burlMesh.position.copy(burlPt);
    burlMesh.castShadow = true;
    burlMesh.receiveShadow = true;
    stn02KageCore.add(burlMesh);

    // Subtle Recessed Cyan Biological Sap Channel nestled deep inside the bark fissure
    const veinPts = braidPts.map((p, idx) => {
      const u = idx / steps;
      const inScale = 0.985 + Math.sin(u * Math.PI * 2.0) * 0.015;
      return new THREE.Vector3(p.x * inScale, p.y + 0.006, p.z * inScale);
    });
    const veinCurve = new THREE.CatmullRomCurve3(veinPts);
    stn02KageCore.add(new THREE.Mesh(new THREE.TubeGeometry(veinCurve, 24, 0.0052, 6, false), matEywaTendrilCyan));
  }

  // 2B. LEVEL 1 & 2: 14 Primary & Secondary Snaking Root Buttresses + Mossy Sanctuary Crags
  for (let r = 0; r < 14; r++) {
    const rAng = (r / 14) * Math.PI * 2 + (r % 2) * 0.07;
    const reach = 1.24 + (r % 3) * 0.22;
    const snakeRootCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(rAng) * 0.30, 0.72, Math.sin(rAng) * 0.30),
      new THREE.Vector3(Math.cos(rAng + 0.09) * 0.62, 0.36, Math.sin(rAng + 0.09) * 0.62),
      new THREE.Vector3(Math.cos(rAng - 0.07) * 0.96, 0.20, Math.sin(rAng - 0.07) * 0.96),
      new THREE.Vector3(Math.cos(rAng + 0.12) * reach, 0.13, Math.sin(rAng + 0.12) * reach)
    ]);
    stn02KageCore.add(buildTaperedBarkBranch(snakeRootCurve, 0.115, 0.026, 12, 18, matKageGnarledBark, 0.18));

    // Forked Secondary Root Tendril gripping the rock floor
    const secOrigin = snakeRootCurve.getPointAt(0.55);
    const secAng = rAng + (r % 2 === 0 ? 0.28 : -0.28);
    const secRootCurve = new THREE.CatmullRomCurve3([
      secOrigin.clone(),
      new THREE.Vector3(Math.cos(secAng) * (reach * 0.85), 0.16, Math.sin(secAng) * (reach * 0.85)),
      new THREE.Vector3(Math.cos(secAng + 0.1) * (reach * 1.08), 0.12, Math.sin(secAng + 0.1) * (reach * 1.08))
    ]);
    stn02KageCore.add(buildTaperedBarkBranch(secRootCurve, 0.052, 0.014, 8, 12, matKageGnarledBark, 0.14));

    // Subtle Cyan Biological Sap Vein in root crevice
    const rootVeinCurve = new THREE.CatmullRomCurve3(
      snakeRootCurve.getPoints(14).map((p, idx) => new THREE.Vector3(p.x, p.y + 0.022 * (1.0 - idx / 16), p.z))
    );
    stn02KageCore.add(new THREE.Mesh(
      new THREE.TubeGeometry(rootVeinCurve, 16, 0.0048, 6, false),
      matEywaTendrilCyan
    ));

    // Lush Moss Cushions & Sanctuary Boulders nestled between root hollows
    const mPt = snakeRootCurve.getPointAt(0.44);
    const mossPad = new THREE.Mesh(new THREE.DodecahedronGeometry(0.085, 1), matKageVelvetMoss);
    mossPad.scale.set(1.45, 0.52, 1.85);
    mossPad.position.set(mPt.x, mPt.y + 0.015, mPt.z);
    mossPad.rotation.y = -rAng;
    mossPad.receiveShadow = true;
    stn02KageCore.add(mossPad);
  }

  // 2C. LEVEL 4, 5 & 6: Heavy Load-Bearing Primary Boughs, Secondary Limbs & Fine Tertiary Twigs
  const tendrilClusters = []; // Distinct botanical cluster anchors on outer/lateral boughs
  const umbrellaBoughCount = 18;

  for (let b = 0; b < umbrellaBoughCount; b++) {
    const isUpperTier = b % 2 === 0;
    const bAngle = (b / umbrellaBoughCount) * Math.PI * 2 + (isUpperTier ? 0.0 : 0.08);
    const maxReach = isUpperTier ? 1.92 + (b % 3) * 0.14 : 1.54 + (b % 4) * 0.12;
    const peakY = isUpperTier ? 2.78 + (b % 3) * 0.09 : 2.44 + (b % 3) * 0.08;
    const tipDropY = isUpperTier ? peakY - 0.30 : peakY - 0.24;

    const boughCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(bAngle) * 0.20, 1.90 + (isUpperTier ? 0.18 : 0.0), Math.sin(bAngle) * 0.20),
      new THREE.Vector3(Math.cos(bAngle + 0.05) * (maxReach * 0.36), peakY - 0.10, Math.sin(bAngle + 0.05) * (maxReach * 0.36)),
      new THREE.Vector3(Math.cos(bAngle + 0.10) * (maxReach * 0.68), peakY, Math.sin(bAngle + 0.10) * (maxReach * 0.68)),
      new THREE.Vector3(Math.cos(bAngle + 0.15) * (maxReach * 0.92), peakY - 0.10, Math.sin(bAngle + 0.15) * (maxReach * 0.92)),
      new THREE.Vector3(Math.cos(bAngle + 0.18) * maxReach, tipDropY, Math.sin(bAngle + 0.18) * maxReach)
    ]);

    const rStart = isUpperTier ? 0.092 : 0.072;
    stn02KageCore.add(buildTaperedBarkBranch(boughCurve, rStart, 0.016, 12, 20, matKageGnarledBark, 0.16));

    // Check if this bough lies directly in the front camera viewing corridor (+Z, x in [-0.55, 0.55])
    // Keep the front viewing window open so the massive gnarled trunk & primary branch forks are never obscured!
    const midPt = boughCurve.getPointAt(0.65);
    const inFrontViewingCorridor = (midPt.z > 0.15 && Math.abs(midPt.x) < 1.15);

    if (!inFrontViewingCorridor) {
      tendrilClusters.push({
        origin: boughCurve.getPointAt(0.64),
        angle: bAngle + 0.10,
        boughIdx: b,
        clusterRadius: 0.14,
        strandCount: 4 + (b % 3),
        isOuter: false
      });
      tendrilClusters.push({
        origin: boughCurve.getPointAt(0.92),
        angle: bAngle + 0.16,
        boughIdx: b,
        clusterRadius: 0.18,
        strandCount: 5 + (b % 3),
        isOuter: true
      });
    }

    // Level 5 & 6: Forked Secondary & Tertiary Organic Branches + Bioluminescent Canopy Leaves
    for (let sub of [-1, 1]) {
      const splitU = 0.44 + (sub > 0 ? 0.16 : 0.0);
      const origin = boughCurve.getPointAt(splitU);
      const subAng = bAngle + 0.10 + sub * 0.30;
      const subReach = maxReach * (0.44 + (b % 2) * 0.08);
      const subCurve = new THREE.CatmullRomCurve3([
        origin.clone(),
        new THREE.Vector3(
          origin.x + Math.cos(subAng) * subReach * 0.54,
          origin.y + 0.08,
          origin.z + Math.sin(subAng) * subReach * 0.54
        ),
        new THREE.Vector3(
          origin.x + Math.cos(subAng + sub * 0.12) * subReach,
          origin.y - 0.18,
          origin.z + Math.sin(subAng + sub * 0.12) * subReach
        )
      ]);
      stn02KageCore.add(buildTaperedBarkBranch(subCurve, 0.042, 0.009, 8, 12, matKageGnarledBark, 0.12));

      // Fine Tertiary Twigs
      const twigOrigin = subCurve.getPointAt(0.62);
      const twigAng = subAng + sub * 0.35;
      const twigCurve = new THREE.CatmullRomCurve3([
        twigOrigin.clone(),
        new THREE.Vector3(twigOrigin.x + Math.cos(twigAng) * 0.24, twigOrigin.y + 0.03, twigOrigin.z + Math.sin(twigAng) * 0.24),
        new THREE.Vector3(twigOrigin.x + Math.cos(twigAng) * 0.42, twigOrigin.y - 0.12, twigOrigin.z + Math.sin(twigAng) * 0.42)
      ]);
      stn02KageCore.add(buildTaperedBarkBranch(twigCurve, 0.018, 0.004, 6, 8, matKageGnarledBark, 0.08));

      const subEnd = subCurve.getPointAt(0.85);
      const subFrontCorridor = (subEnd.z > 0.10 && Math.abs(subEnd.x) < 1.15);
      if (!subFrontCorridor) {
        tendrilClusters.push({
          origin: subEnd,
          angle: subAng,
          boughIdx: b,
          clusterRadius: 0.12,
          strandCount: 3 + (b % 2),
          isOuter: true
        });
      }
    }
  }

  // 2D. LEVEL 7: IRREGULARLY CLUSTERED, CATENARY BIOLUMINESCENT WILLOW TENDRILS
  //     (Replaces v8's uniform vertical wall of neon lines with organic S-curved catenary
  //     botanical clusters, varied thickness/length/luminosity, and clear negative space!)
  const canopyGroup = new THREE.Group();
  canopyGroup.name = 'GRP_Eywa_Weeping_Willow_Tendrils';
  stn02KageCore.add(canopyGroup);

  const tendrilMats = [
    matEywaTendrilViolet,
    matEywaTendrilPink,
    matEywaTendrilPearl,
    matEywaTendrilCyan
  ];

  const blossomBeadGeo = new THREE.SphereGeometry(0.010, 7, 7);
  blossomBeadGeo.scale(0.65, 1.95, 0.65);
  const maxBeads = 520;
  const blossomInstViolet = new THREE.InstancedMesh(blossomBeadGeo, matEywaTendrilPink, maxBeads);
  const blossomInstCyan = new THREE.InstancedMesh(blossomBeadGeo, matEywaTendrilCyan, maxBeads);
  let vIdx = 0;
  let cIdx = 0;
  const _beadDummy = new THREE.Object3D();
  const swayTendrilGroups = [];

  tendrilClusters.forEach((cluster, cIndex) => {
    const clusterGrp = new THREE.Group();
    clusterGrp.position.copy(cluster.origin);
    canopyGroup.add(clusterGrp);
    swayTendrilGroups.push({
      group: clusterGrp,
      phase: cIndex * 0.77,
      freq: 0.85 + (cIndex % 5) * 0.18,
      amp: 0.025 + (cIndex % 3) * 0.010
    });

    for (let s = 0; s < cluster.strandCount; s++) {
      const localAng = cluster.angle + (s - cluster.strandCount * 0.5) * 0.42 + ((cIndex * 7 + s) % 5) * 0.08;
      const offsetR = ((s % 3) * 0.38 + 0.15) * cluster.clusterRadius;
      const ox = Math.cos(localAng) * offsetR;
      const oz = Math.sin(localAng) * offsetR;
      const oy = -((s % 2) * 0.03);

      // Varied natural length: central strand in cluster is longest, outer strands taper shorter
      const centerWeight = 1.0 - Math.abs(s - cluster.strandCount * 0.5) / (cluster.strandCount * 0.65);
      const dropLen = THREE.MathUtils.clamp(
        (cluster.isOuter ? 0.78 : 0.52) + centerWeight * 0.48 + ((cIndex + s) % 4) * 0.09,
        0.42,
        1.38
      );

      // Graceful catenary S-drape curve (sweeping outward along the bough, then draping in an organic weeping arch)
      const driftX = Math.cos(localAng) * (0.22 + (s % 3) * 0.075);
      const driftZ = Math.sin(localAng) * (0.22 + (s % 3) * 0.075);
      const curlX = -Math.sin(localAng) * (0.10 + (s % 2) * 0.05);
      const curlZ = Math.cos(localAng) * (0.10 + (s % 2) * 0.05);

      const tCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(ox, oy, oz),
        new THREE.Vector3(ox + driftX * 0.52, oy - dropLen * 0.22, oz + driftZ * 0.52),
        new THREE.Vector3(ox + driftX * 0.96 + curlX * 0.55, oy - dropLen * 0.62, oz + driftZ * 0.96 + curlZ * 0.55),
        new THREE.Vector3(ox + driftX * 1.18 + curlX, oy - dropLen, oz + driftZ * 1.18 + curlZ)
      ]);

      const tMat = tendrilMats[(cIndex + s) % tendrilMats.length];
      const tubeRadius = s === Math.floor(cluster.strandCount * 0.5) ? 0.0044 : (s % 2 === 0 ? 0.0032 : 0.0024);
      const strandMesh = new THREE.Mesh(new THREE.TubeGeometry(tCurve, 10, tubeRadius, 5, false), tMat);
      clusterGrp.add(strandMesh);

      // 2 delicate blossom seed-droplets near the lower catenary tip (in world space for instanced rendering)
      for (let b = 1; b <= 2; b++) {
        const bu = b === 1 ? 0.68 : 0.96;
        const localPt = tCurve.getPointAt(bu);
        _beadDummy.position.set(
          cluster.origin.x + localPt.x,
          cluster.origin.y + localPt.y,
          cluster.origin.z + localPt.z
        );
        _beadDummy.scale.setScalar(b === 2 ? 1.15 : 0.82);
        _beadDummy.updateMatrix();
        if ((cIndex + s + b) % 4 === 0 && cIdx < maxBeads) {
          blossomInstCyan.setMatrixAt(cIdx++, _beadDummy.matrix);
        } else if (vIdx < maxBeads) {
          blossomInstViolet.setMatrixAt(vIdx++, _beadDummy.matrix);
        }
      }
    }
  });

  blossomInstViolet.count = vIdx;
  blossomInstCyan.count = cIdx;
  blossomInstViolet.instanceMatrix.needsUpdate = true;
  blossomInstCyan.instanceMatrix.needsUpdate = true;
  canopyGroup.add(blossomInstViolet, blossomInstCyan);
  animatedParts.swayTendrilGroups = swayTendrilGroups;

  // 360 Drifting Bioluminescent Eywa Spores & Woodsprite Seeds around the Sanctuary
  const sporeCount = 360;
  const sporeGeo = new THREE.BufferGeometry();
  const sporePos = new Float32Array(sporeCount * 3);
  for (let i = 0; i < sporeCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.35 + Math.random() * 5.8;
    const y = 0.22 + Math.random() * 3.9;
    sporePos[i * 3] = Math.cos(a) * r;
    sporePos[i * 3 + 1] = y;
    sporePos[i * 3 + 2] = Math.sin(a) * r;
  }
  sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePos, 3));
  const sporeMat = new THREE.PointsMaterial({
    color: 0xF2B8FF,
    size: 0.024,
    transparent: true,
    opacity: 0.68,
    blending: THREE.AdditiveBlending
  });
  const sporePoints = new THREE.Points(sporeGeo, sporeMat);
  worldGroup.add(sporePoints);
  animatedParts.spores = sporePoints;

  // 5-Ring Toothed Cardanic Citadel Astrolabe (Crowning Eywa at y = 2.95m — refined & zero boxy blocks)
  const astrolabeRig = new THREE.Group();
  astrolabeRig.position.y = 3.92;
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
    worldGroup.add(new THREE.Mesh(new THREE.TubeGeometry(archCurve, 24, 0.032, 10, false), matAgedBrass));
  }

  const wormPinion = createToothedGearGroup(THREE, {
    radius: 0.22,
    tube: 0.032,
    teeth: 18,
    toothSize: 0.024,
    spokes: 4,
    matRim: matSpecularBrass,
    matTooth: matAgedBrass
  });
  wormPinion.position.set(1.96, 3.92, 0);
  wormPinion.rotation.z = Math.PI / 2;
  worldGroup.add(wormPinion);
  animatedParts.wormPinion = wormPinion;

  const ring1 = createToothedGearGroup(THREE, {
    radius: 1.92,
    tube: 0.042,
    teeth: 120,
    toothSize: 0.024,
    spokes: 0,
    matRim: matSpecularBrass,
    matTooth: matAgedBrass
  });
  for (let c = 0; c < 4; c++) {
    const a = (c / 4) * Math.PI * 2;
    const boss = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.022, 10, 20), matSpecularBrass);
    boss.position.set(Math.cos(a) * 1.92, 0, Math.sin(a) * 1.92);
    boss.rotation.y = -a;
    ring1.add(boss);
  }
  ring1.rotation.x = Math.PI * 0.34;
  astrolabeRig.add(ring1);
  animatedParts.outerRing = ring1;

  const ring2 = createToothedGearGroup(THREE, {
    radius: 1.66,
    tube: 0.034,
    teeth: 84,
    toothSize: 0.022,
    spokes: 0,
    matRim: matAgedBrass,
    matTooth: matSpecularBrass
  });
  for (let s of [-1, 1]) {
    const lensHolder = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16), matSpecularBrass);
    lensHolder.position.set(s * 1.66, 0, 0);
    lensHolder.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), matEywaTendrilCyan));
    ring2.add(lensHolder);
  }
  ring2.rotation.z = Math.PI * 0.22;
  ring2.rotation.x = -Math.PI * 0.18;
  astrolabeRig.add(ring2);
  animatedParts.horizonRing = ring2;

  const ring3 = createToothedGearGroup(THREE, {
    radius: 1.42,
    tube: 0.028,
    teeth: 64,
    toothSize: 0.020,
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
    tube: 0.024,
    teeth: 48,
    toothSize: 0.016,
    spokes: 0,
    matRim: matAgedBrass,
    matTooth: matSpecularBrass
  });
  ring4.rotation.x = Math.PI * 0.48;
  astrolabeRig.add(ring4);
  animatedParts.equatorialRing = ring4;

  const ring5 = createToothedGearGroup(THREE, {
    radius: 0.88,
    tube: 0.024,
    teeth: 36,
    toothSize: 0.016,
    spokes: 6,
    matRim: matSpecularBrass,
    matTooth: matAgedBrass
  });
  ring5.add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), matEywaTendrilPearl));
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
  // 4. STRUCTURE #3: I · NOW · HOGWARTS HIGHLAND CASTLE COMPLEX (MOVEO CREATIVE)
  //    Perched on Craggy Scottish Highland Cliffs above dark mirror water:
  //    - Sculpted Faceted Highland Cliff Promontory
  //    - The Great Hall (Steep Pitched Slate Gable Roof + Gothic Fleche Spire +
  //      7 Pointed Gothic Lancet Windows glowing with Floating-Candle Amber Light +
  //      Crocketed Buttress Pinnacles + Rose Window Gable)
  //    - The Grand Staircase Keep & Astronomy Tower (Smooth Cylindrical & Octagonal
  //      Stone Towers, Corbelled Machicolations, Conical Witch-Hat Slate Spires,
  //      Cantilevered Corner Bartizan Turrets with Needle Finials & Arched Flying Buttresses)
  //    - Multi-Arch Gothic Viaduct Bridges spanning the chasm
  // ============================================================================
  const cityGroup = new THREE.Group();
  cityGroup.name = 'GRP_Station_01_City_Hogwarts';
  cityGroup.position.set(2.35, 0.18, 1.95);
  worldGroup.add(cityGroup);

  const cityFoundationGear = createToothedGearGroup(THREE, {
    radius: 1.52,
    tube: 0.048,
    teeth: 72,
    toothSize: 0.034,
    spokes: 8,
    matRim: matAgedBrass,
    matTooth: matSpecularBrass
  });
  cityFoundationGear.position.y = 0.05;
  cityGroup.add(cityFoundationGear);
  animatedParts.cityFoundationGear = cityFoundationGear;

  // 4A. Sculpted Craggy Scottish Highland Cliff Promontory (organic faceted rock mass)
  function buildCraggyCliffOutcrop(cx, cy, cz, rx, ry, rz, rotY, mat) {
    const geo = new THREE.DodecahedronGeometry(1.0, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      const crag = 1.0 + 0.18 * Math.sin(vx * 4.5 + vz * 3.2) + 0.12 * Math.cos(vy * 5.0 - vx * 2.8);
      pos.setXYZ(i, vx * rx * crag, (vy < 0 ? vy * 0.45 : vy) * ry * crag, vz * rz * crag);
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cx, cy, cz);
    mesh.rotation.y = rotY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  const cliffSpecs = [
    { x: 0.0, y: 0.24, z: 0.0, rx: 1.38, ry: 0.42, rz: 1.32, rot: 0.3 },
    { x: 0.42, y: 0.34, z: 0.38, rx: 0.92, ry: 0.48, rz: 0.86, rot: 1.1 },
    { x: -0.48, y: 0.30, z: 0.32, rx: 0.88, ry: 0.44, rz: 0.82, rot: 2.2 },
    { x: 0.28, y: 0.32, z: -0.45, rx: 0.85, ry: 0.46, rz: 0.88, rot: 0.8 },
    { x: -0.42, y: 0.28, z: -0.42, rx: 0.82, ry: 0.40, rz: 0.78, rot: 1.7 }
  ];
  cliffSpecs.forEach((cs, idx) => {
    cityGroup.add(buildCraggyCliffOutcrop(
      cs.x, cs.y, cs.z, cs.rx, cs.ry, cs.rz, cs.rot,
      idx % 2 === 0 ? matObsidianSolid : matSlateBootcamp
    ));
  });

  // Stepped Cylindrical Highland Fortress Curtain Wall crowning the cliff
  const curtainWall = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.28, 0.32, 24), matArchitecturalConcrete);
  curtainWall.position.y = 0.42;
  curtainWall.castShadow = true;
  curtainWall.receiveShadow = true;
  cityGroup.add(curtainWall);

  const curtainParapet = new THREE.Mesh(new THREE.TorusGeometry(1.19, 0.028, 10, 36), matTravertineCampus);
  curtainParapet.rotation.x = Math.PI / 2;
  curtainParapet.position.y = 0.58;
  cityGroup.add(curtainParapet);

  // Helper: v9 Reconstructed Conical Witch-Hat Slate Spire with REAL 3D Layered & Warped Slate Shingle Courses,
  // Raised Lead/Stone Roll Ribs, Eaves Corbel Ring & Pointed Gothic Gable Dormers (NEVER a smooth cone!)
  function buildWitchHatSpire(baseRadius, spireHeight, radialSegs = 24, hasDormers = true) {
    const spireGrp = new THREE.Group();
    const lathePts = [];
    const steps = 16;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const r = baseRadius * Math.pow(1.0 - t, 1.34) + 0.004;
      const y = t * spireHeight;
      lathePts.push(new THREE.Vector2(r, y));
    }
    const spireGeo = new THREE.LatheGeometry(lathePts, radialSegs);
    // Subtle organic vertex warping so old medieval timber/slate framing feels ancient & hand-built
    const sPos = spireGeo.attributes.position;
    for (let i = 0; i < sPos.count; i++) {
      const vx = sPos.getX(i);
      const vy = sPos.getY(i);
      const vz = sPos.getZ(i);
      const ang = Math.atan2(vz, vx);
      const warp = 1.0 + 0.024 * Math.sin(ang * 5.0 + vy * 8.0) + 0.015 * Math.cos(ang * 9.0 - vy * 12.0);
      sPos.setXYZ(i, vx * warp, vy, vz * warp);
    }
    spireGeo.computeVertexNormals();
    const spireMesh = new THREE.Mesh(spireGeo, matSlateBootcamp);
    spireMesh.castShadow = true;
    spireMesh.receiveShadow = true;
    spireGrp.add(spireMesh);

    // v9 REAL 3D STEPPED SLATE SHINGLE TIER COURSES (Physical overlapping roof shingle ledges & shadow lines!)
    const courseCount = hasDormers ? 11 : 7;
    for (let c = 0; c < courseCount; c++) {
      const ct = (c + 0.4) / (courseCount + 0.6);
      const cr = baseRadius * Math.pow(1.0 - ct, 1.34) + 0.007;
      const cy = ct * spireHeight;
      const courseSegs = Math.max(10, Math.floor(radialSegs * (1.0 - ct * 0.35)));
      const shingleCourseGeo = new THREE.CylinderGeometry(cr * 0.92, cr * 1.045, spireHeight / (courseCount * 1.35), courseSegs, 1, false);
      const cPos = shingleCourseGeo.attributes.position;
      for (let k = 0; k < cPos.count; k++) {
        const kx = cPos.getX(k);
        const ky = cPos.getY(k);
        const kz = cPos.getZ(k);
        const kang = Math.atan2(kz, kx);
        const tooth = 1.0 + 0.032 * Math.sin(kang * courseSegs * 0.5 + c * 1.7);
        cPos.setXYZ(k, kx * tooth, ky + 0.003 * Math.cos(kang * 7.0 + c), kz * tooth);
      }
      shingleCourseGeo.computeVertexNormals();
      const courseMesh = new THREE.Mesh(shingleCourseGeo, matSlateBootcamp);
      courseMesh.position.y = cy;
      courseMesh.rotation.y = c * 0.27;
      courseMesh.castShadow = true;
      courseMesh.receiveShadow = true;
      spireGrp.add(courseMesh);
    }

    // 8 Raised Lead / Stone Hip Roll Ribs running from flared eaves to finial peak
    const ribCount = hasDormers ? 8 : 4;
    for (let rb = 0; rb < ribCount; rb++) {
      const ra = (rb / ribCount) * Math.PI * 2;
      const ribCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.cos(ra) * (baseRadius * 1.02), 0.01, Math.sin(ra) * (baseRadius * 1.02)),
        new THREE.Vector3(Math.cos(ra) * (baseRadius * 0.52), spireHeight * 0.38, Math.sin(ra) * (baseRadius * 0.52)),
        new THREE.Vector3(Math.cos(ra) * (baseRadius * 0.18), spireHeight * 0.74, Math.sin(ra) * (baseRadius * 0.18)),
        new THREE.Vector3(0, spireHeight * 0.98, 0)
      ]);
      const ribMesh = new THREE.Mesh(new THREE.TubeGeometry(ribCurve, 10, 0.0055, 5, false), matTravertineCampus);
      ribMesh.castShadow = true;
      spireGrp.add(ribMesh);
    }

    // Molded Stone Eaves Cornice Ring + Brass Weathervane Finial
    const eavesRing = new THREE.Mesh(new THREE.TorusGeometry(baseRadius * 0.98, 0.018, 8, radialSegs), matTravertineCampus);
    eavesRing.rotation.x = Math.PI / 2;
    spireGrp.add(eavesRing);

    const finialShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.008, 0.18, 8), matSpecularBrass);
    finialShaft.position.y = spireHeight + 0.08;
    const finialOrb = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 10), matSpecularBrass);
    finialOrb.position.y = spireHeight + 0.04;
    spireGrp.add(finialShaft, finialOrb);

    // Pointed Gothic Gable Dormer Windows projecting from the lower witch-hat slope
    if (hasDormers) {
      for (let d = 0; d < 4; d++) {
        const da = (d / 4) * Math.PI * 2 + Math.PI / 4;
        const dGrp = new THREE.Group();
        const dr = baseRadius * 0.64;
        dGrp.position.set(Math.cos(da) * dr, spireHeight * 0.24, Math.sin(da) * dr);
        dGrp.rotation.y = -da + Math.PI / 2;

        const dBody = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.095, 0.085), matArchitecturalConcrete);
        dBody.castShadow = true;
        const dRoof = new THREE.Mesh(new THREE.ConeGeometry(0.054, 0.095, 4), matSlateBootcamp);
        dRoof.rotation.y = Math.PI / 4;
        dRoof.position.y = 0.082;
        dRoof.castShadow = true;
        const dFrame = new THREE.Mesh(new THREE.BoxGeometry(0.074, 0.098, 0.014), matTravertineCampus);
        dFrame.position.z = 0.040;
        const dGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.038, 0.062), matGoldCanopy);
        dGlow.position.set(0, -0.004, 0.048);
        dGrp.add(dBody, dRoof, dFrame, dGlow);
        spireGrp.add(dGrp);
      }
    }

    return spireGrp;
  }

  // Helper: Cantilevered Corbelled Bartizan Corner Turret (Hogwarts signature hanging pepper-pot turret!)
  function buildCorbelledBartizan(radius, bodyHeight, spireHeight) {
    const bGrp = new THREE.Group();

    // Inverted Stepped Conical Stone Corbel Bracket Base tapering to a point below
    const corbelCone = new THREE.Mesh(
      new THREE.ConeGeometry(radius * 1.04, radius * 2.35, 16),
      matTravertineCampus
    );
    corbelCone.rotation.x = Math.PI; // Point downward!
    corbelCone.position.y = -radius * 1.15;
    bGrp.add(corbelCone);

    const corbelRing = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.02, 0.012, 8, 16), matTravertineCampus);
    corbelRing.rotation.x = Math.PI / 2;
    bGrp.add(corbelRing);

    // Cylindrical Stone Turret Drum
    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius * 1.02, bodyHeight, 18),
      matArchitecturalConcrete
    );
    drum.position.y = bodyHeight * 0.5;
    drum.castShadow = true;
    drum.receiveShadow = true;
    bGrp.add(drum);

    // 2 Warm Candlelit Pointed Lancet Windows on the bartizan drum
    for (let w = 0; w < 2; w++) {
      const wa = (w - 0.5) * 1.1;
      const win = createDetailedWindowAssembly(THREE, {
        width: radius * 0.62,
        height: bodyHeight * 0.52,
        matStoneFrame: matTravertineCampus,
        matMullion: matSpecularBrass,
        matGlow: matGoldCanopy
      });
      win.position.set(Math.sin(wa) * (radius + 0.004), bodyHeight * 0.52, Math.cos(wa) * (radius + 0.004));
      win.rotation.y = wa;
      bGrp.add(win);
    }

    // Witch-Hat Conical Slate Roof
    const spire = buildWitchHatSpire(radius * 1.14, spireHeight, 18, false);
    spire.position.y = bodyHeight;
    bGrp.add(spire);

    return bGrp;
  }

  // Helper: Build Cylindrical / Octagonal Hogwarts Tower (Grand Staircase Keep, Astronomy Tower, Bell Towers)
  function buildHogwartsTower({
    x, z, radius, height, spireH, radialSegs = 24,
    isHero = false, bartizanCount = 2
  }) {
    const tGrp = new THREE.Group();
    tGrp.position.set(x, 0.52, z);

    const lowerH = height * 0.58;
    const upperH = height * 0.42;
    const upperR = radius * 0.88;

    // 1. Battered Plinth Base & Lower Cylindrical/Octagonal Stone Drum
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 1.04, radius * 1.14, 0.18, radialSegs),
      matObsidianSolid
    );
    plinth.position.y = 0.09;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    tGrp.add(plinth);

    const lowerDrum = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius * 1.04, lowerH, radialSegs),
      matArchitecturalConcrete
    );
    lowerDrum.position.y = lowerH * 0.5;
    lowerDrum.castShadow = true;
    lowerDrum.receiveShadow = true;
    tGrp.add(lowerDrum);

    // Molded Stone Stringcourse Belt Ring
    const beltRing = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 1.03, 0.022, 10, radialSegs),
      matTravertineCampus
    );
    beltRing.rotation.x = Math.PI / 2;
    beltRing.position.y = lowerH;
    tGrp.add(beltRing);

    // 2. Upper Cylindrical/Octagonal Stone Belfry Drum
    const upperDrum = new THREE.Mesh(
      new THREE.CylinderGeometry(upperR, radius * 0.94, upperH, radialSegs),
      matArchitecturalConcrete
    );
    upperDrum.position.y = lowerH + upperH * 0.5;
    upperDrum.castShadow = true;
    upperDrum.receiveShadow = true;
    tGrp.add(upperDrum);

    // 3. v9 STEPPED GOTHIC STONE BUTTRESSES with Sloped Weathering Drip-Stones & Crocketed Pinnacles
    const ribCount = isHero ? 8 : 6;
    for (let b = 0; b < ribCount; b++) {
      const ba = (b / ribCount) * Math.PI * 2;
      const bGrp = new THREE.Group();
      bGrp.position.set(Math.cos(ba) * (radius * 0.98), 0, Math.sin(ba) * (radius * 0.98));
      bGrp.rotation.y = -ba + Math.PI / 2;

      // 3 Stepped Buttress Stages (wider at base, stepping back with sloped stone weatherings)
      const stage1H = height * 0.36;
      const stage2H = height * 0.34;
      const stage3H = height * 0.26;
      const st1 = new THREE.Mesh(new THREE.BoxGeometry(0.044, stage1H, 0.078), matTravertineCampus);
      st1.position.set(0, stage1H * 0.5, 0.028);
      st1.castShadow = true;
      st1.receiveShadow = true;

      const st2 = new THREE.Mesh(new THREE.BoxGeometry(0.036, stage2H, 0.056), matTravertineCampus);
      st2.position.set(0, stage1H + stage2H * 0.5, 0.018);
      st2.castShadow = true;

      const st3 = new THREE.Mesh(new THREE.BoxGeometry(0.028, stage3H, 0.038), matTravertineCampus);
      st3.position.set(0, stage1H + stage2H + stage3H * 0.5, 0.010);
      st3.castShadow = true;

      const pinnacle = new THREE.Mesh(new THREE.ConeGeometry(0.030, 0.18, 6), matTravertineCampus);
      pinnacle.position.set(0, height + 0.07, 0.010);
      pinnacle.castShadow = true;

      bGrp.add(st1, st2, st3, pinnacle);
      tGrp.add(bGrp);
    }

    // 4. Rhythmically Spaced Pointed Gothic Lancet Windows around the curved facade
    const winTiers = isHero ? 4 : 3;
    const winPerTier = isHero ? 8 : 6;
    for (let r = 0; r < winTiers; r++) {
      const wy = 0.22 + (r / winTiers) * (height - 0.34);
      const curR = wy < lowerH ? radius : upperR;
      for (let c = 0; c < winPerTier; c++) {
        const wa = (c / winPerTier) * Math.PI * 2 + (r % 2) * (Math.PI / winPerTier);
        const winW = isHero ? 0.088 : 0.072;
        const winH = isHero ? 0.175 : 0.140;
        const wAsm = createDetailedWindowAssembly(THREE, {
          width: winW,
          height: winH,
          matStoneFrame: matTravertineCampus,
          matMullion: matSpecularBrass,
          matGlow: matGoldCanopy
        });
        wAsm.position.set(
          Math.sin(wa) * (curR + 0.005),
          wy,
          Math.cos(wa) * (curR + 0.005)
        );
        wAsm.rotation.y = wa;
        tGrp.add(wAsm);
      }
    }

    // 5. Corbelled Machicolation Parapet Ring at top of tower
    const parapetRing = new THREE.Mesh(
      new THREE.CylinderGeometry(upperR * 1.10, upperR * 1.02, 0.08, radialSegs),
      matTravertineCampus
    );
    parapetRing.position.y = height;
    tGrp.add(parapetRing);

    // 6. Protruding Cantilevered Bartizan Corner Turrets (Iconic Hogwarts silhouette!)
    for (let bt = 0; bt < bartizanCount; bt++) {
      const bAng = (bt / bartizanCount) * Math.PI * 2 + 0.55;
      const bTurret = buildCorbelledBartizan(
        isHero ? 0.105 : 0.082,
        isHero ? 0.42 : 0.32,
        isHero ? 0.44 : 0.34
      );
      bTurret.position.set(
        Math.cos(bAng) * (upperR * 1.02),
        height * (0.64 + (bt % 2) * 0.14),
        Math.sin(bAng) * (upperR * 1.02)
      );
      bTurret.rotation.y = -bAng + Math.PI / 2;
      tGrp.add(bTurret);
    }

    // 7. Soaring Conical Witch-Hat Slate Spire
    const mainSpire = buildWitchHatSpire(upperR * 1.12, spireH, radialSegs, isHero || spireH > 0.55);
    mainSpire.position.y = height + 0.04;
    tGrp.add(mainSpire);

    return tGrp;
  }

  // 4B. THE HOGWARTS GREAT HALL (Front-Right Promontory overlooking the Lake/Camera!)
  //     Features: Steep-pitched slate gable roof, 7 tall pointed Gothic lancet bays separated by
  //     pinnacled buttresses, front Gothic Rose Window gable, and slender central Fleche Spire!
  function buildHogwartsGreatHall() {
    const hallGrp = new THREE.Group();
    hallGrp.position.set(0.46, 0.52, 0.54);
    hallGrp.rotation.y = Math.PI * 0.22; // Angled toward the camera & lake for maximum silhouette drama!

    const hallW = 0.52;
    const hallH = 0.68;
    const hallL = 1.08;

    // Chamfered Gothic Stone Nave (8-sided elongated octagonal prism — zero raw 4-sided BoxGeometry!)
    const naveShape = new THREE.Shape();
    const hw = hallW * 0.5;
    const hl = hallL * 0.5;
    const ch = 0.045;
    naveShape.moveTo(-hw + ch, -hl);
    naveShape.lineTo(hw - ch, -hl);
    naveShape.lineTo(hw, -hl + ch);
    naveShape.lineTo(hw, hl - ch);
    naveShape.lineTo(hw - ch, hl);
    naveShape.lineTo(-hw + ch, hl);
    naveShape.lineTo(-hw, hl - ch);
    naveShape.lineTo(-hw, -hl + ch);
    naveShape.closePath();

    const naveGeo = new THREE.ExtrudeGeometry(naveShape, { depth: hallH, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2 });
    naveGeo.rotateX(-Math.PI / 2);
    const naveMesh = new THREE.Mesh(naveGeo, matArchitecturalConcrete);
    naveMesh.castShadow = true;
    naveMesh.receiveShadow = true;
    hallGrp.add(naveMesh);

    // Steep-Pitched Gothic Slate Gable Roof (3-sided triangular prism extruded along hallL)
    const roofPeakH = 0.48;
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-hw * 1.12, 0);
    gableShape.lineTo(hw * 1.12, 0);
    gableShape.quadraticCurveTo(hw * 0.52, roofPeakH * 0.55, 0, roofPeakH);
    gableShape.quadraticCurveTo(-hw * 0.52, roofPeakH * 0.55, -hw * 1.12, 0);
    gableShape.closePath();

    const roofGeo = new THREE.ExtrudeGeometry(gableShape, { depth: hallL + 0.06, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2 });
    const roofMesh = new THREE.Mesh(roofGeo, matSlateBootcamp);
    roofMesh.position.set(0, hallH, -hl - 0.03);
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    hallGrp.add(roofMesh);

    // v9 REAL 3D LAYERED SLATE SHINGLE COURSES, DORMERS & TALL HIGHLAND CHIMNEY STACKS ON GREAT HALL ROOF
    const roofRows = 8;
    for (let rr = 0; rr < roofRows; rr++) {
      const rt = (rr + 0.3) / roofRows;
      const ry = hallH + rt * (roofPeakH * 0.92);
      const rx = THREE.MathUtils.lerp(hw * 1.10, 0.03, Math.pow(rt, 0.88));
      for (let sideX of [-1, 1]) {
        const courseBar = new THREE.Mesh(
          new THREE.BoxGeometry(0.022, 0.024, hallL + 0.07),
          matSlateBootcamp
        );
        courseBar.position.set(sideX * rx, ry, 0);
        courseBar.rotation.z = sideX * 0.58;
        courseBar.castShadow = true;
        courseBar.receiveShadow = true;
        hallGrp.add(courseBar);
      }
    }

    // Raised Stone Crow-Stepped Gable Copings at front (+hl) and rear (-hl) of Great Hall Roof
    for (let endZ of [-hl - 0.035, hl + 0.035]) {
      for (let sideX of [-1, 1]) {
        const copingCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(sideX * hw * 1.14, hallH - 0.01, endZ),
          new THREE.Vector3(sideX * hw * 0.52, hallH + roofPeakH * 0.56, endZ),
          new THREE.Vector3(0, hallH + roofPeakH + 0.03, endZ)
        ]);
        hallGrp.add(new THREE.Mesh(new THREE.TubeGeometry(copingCurve, 10, 0.018, 6, false), matTravertineCampus));
      }
    }

    // 2 Tall Ashlar Stone Chimney Stacks with Clay Chimney Pots on the Great Hall Roof
    for (let cz of [-0.28, 0.26]) {
      const chimGrp = new THREE.Group();
      chimGrp.position.set(-hw * 0.62, hallH + roofPeakH * 0.48, cz);
      const stack = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.28, 0.085), matArchitecturalConcrete);
      stack.castShadow = true;
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.024, 0.098), matTravertineCampus);
      cap.position.y = 0.14;
      for (let potZ of [-0.02, 0.02]) {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.065, 8), matWorkshopCopper);
        pot.position.set(0, 0.18, potZ);
        chimGrp.add(pot);
      }
      chimGrp.add(stack, cap);
      hallGrp.add(chimGrp);
    }

    // Ornate Gothic Ridge Cresting + Soaring Central Fleche Louver Spire on the Great Hall Roof
    const ridgeBar = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, hallL + 0.08, 8), matSpecularBrass);
    ridgeBar.rotation.x = Math.PI / 2;
    ridgeBar.position.set(0, hallH + roofPeakH + 0.01, 0);
    hallGrp.add(ridgeBar);

    const flecheBase = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.062, 0.24, 8), matTravertineCampus);
    flecheBase.position.set(0, hallH + roofPeakH + 0.08, -0.05);
    const flecheSpire = buildWitchHatSpire(0.068, 0.46, 12, false);
    flecheSpire.position.set(0, hallH + roofPeakH + 0.20, -0.05);
    hallGrp.add(flecheBase, flecheSpire);

    // 6 Bays of Tall Pointed Gothic Lancet Windows + Crocketed Stone Buttresses & Pinnacles along both sides
    const bays = 6;
    for (let b = 0; b <= bays; b++) {
      const bz = -hl + 0.08 + (b / bays) * (hallL - 0.16);
      for (let sideX of [-1, 1]) {
        // Stepped Gothic Buttress Pier + Pointed Pinnacle Finial
        const buttressPier = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.034, hallH + 0.06, 6), matTravertineCampus);
        buttressPier.position.set(sideX * (hw + 0.018), (hallH + 0.06) * 0.5, bz);
        const pinnacle = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.18, 6), matTravertineCampus);
        pinnacle.position.set(sideX * (hw + 0.018), hallH + 0.15, bz);
        hallGrp.add(buttressPier, pinnacle);

        // Tall Pointed Great Hall Lancet Window in each bay between buttresses
        if (b < bays) {
          const wz = bz + (hallL - 0.16) / (bays * 2);
          const lancet = createDetailedWindowAssembly(THREE, {
            width: 0.105,
            height: 0.42,
            matStoneFrame: matTravertineCampus,
            matMullion: matSpecularBrass,
            matGlow: matGoldCanopy
          });
          lancet.position.set(sideX * (hw + 0.005), hallH * 0.52, wz);
          lancet.rotation.y = sideX * (Math.PI / 2);
          hallGrp.add(lancet);
        }
      }
    }

    // Grand Front Gable Pointed Window + Glowing Gothic Rose Window + Twin Gable Turrets
    const frontGreatWindow = createDetailedWindowAssembly(THREE, {
      width: 0.24,
      height: 0.48,
      matStoneFrame: matTravertineCampus,
      matMullion: matSpecularBrass,
      matGlow: matGoldCanopy
    });
    frontGreatWindow.position.set(0, hallH * 0.50, hl + 0.016);
    hallGrp.add(frontGreatWindow);

    const roseRim = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.014, 10, 24), matTravertineCampus);
    roseRim.position.set(0, hallH + roofPeakH * 0.42, hl + 0.036);
    const rosePane = new THREE.Mesh(new THREE.CircleGeometry(0.088, 20), matGoldCanopy);
    rosePane.position.set(0, hallH + roofPeakH * 0.42, hl + 0.032);
    hallGrp.add(roseRim, rosePane);

    for (let sideX of [-1, 1]) {
      const gableTurret = buildCorbelledBartizan(0.062, 0.36, 0.34);
      gableTurret.position.set(sideX * (hw + 0.02), hallH * 0.72, hl);
      hallGrp.add(gableTurret);
    }

    return hallGrp;
  }

  cityGroup.add(buildHogwartsGreatHall());

  // 4C. THE GRAND STAIRCASE KEEP & ASTRONOMY TOWER + CLUSTERED HOGWARTS TURRETS
  const grandKeep = buildHogwartsTower({
    x: -0.06,
    z: -0.06,
    radius: 0.36,
    height: 2.18,
    spireH: 0.88,
    radialSegs: 28,
    isHero: true,
    bartizanCount: 4
  });
  cityGroup.add(grandKeep);

  // Subtle Rotating Astrolabe Ring crowning the Astronomy / Grand Keep Spire
  const heliostatGroup = new THREE.Group();
  heliostatGroup.position.set(-0.06, 3.68, -0.06);
  const helioRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.014, 10, 32), matSpecularBrass);
  const helioOrb = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), matGoldCanopy);
  heliostatGroup.add(helioRing, helioOrb);
  cityGroup.add(heliostatGroup);
  animatedParts.cityHeliostat = heliostatGroup;

  // 8 Curved Stone Gothic Flying Buttresses bracing the Grand Keep (CatmullRomCurve3 — zero rectangular bars!)
  for (let fb = 0; fb < 8; fb++) {
    const a = (fb / 8) * Math.PI * 2;
    const fbCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.06 + Math.cos(a) * 0.35, 1.72, -0.06 + Math.sin(a) * 0.35),
      new THREE.Vector3(-0.06 + Math.cos(a) * 0.56, 1.54, -0.06 + Math.sin(a) * 0.56),
      new THREE.Vector3(-0.06 + Math.cos(a) * 0.72, 1.12, -0.06 + Math.sin(a) * 0.72)
    ]);
    cityGroup.add(new THREE.Mesh(new THREE.TubeGeometry(fbCurve, 12, 0.022, 8, false), matTravertineCampus));
  }

  // Clustered Hogwarts Towers (Astronomy Tower, Gryffindor Tower, Ravenclaw Tower, Bell Towers, Clock Tower)
  const hogwartsTowers = [
    { x: -0.58, z: 0.36, radius: 0.22, height: 1.78, spireH: 0.72, radialSegs: 24, bartizanCount: 3, bridge: true },  // Astronomy Tower
    { x: 0.56,  z: -0.44, radius: 0.21, height: 1.66, spireH: 0.68, radialSegs: 24, bartizanCount: 2, bridge: true }, // Gryffindor Tower
    { x: -0.52, z: -0.52, radius: 0.19, height: 1.52, spireH: 0.64, radialSegs: 16, bartizanCount: 2, bridge: true }, // Ravenclaw Octagonal Tower
    { x: -0.14, z: 0.68, radius: 0.17, height: 1.38, spireH: 0.56, radialSegs: 20, bartizanCount: 2, bridge: true },  // Viaduct Gatehouse Tower
    { x: -0.84, z: -0.08, radius: 0.15, height: 1.18, spireH: 0.48, radialSegs: 16, bartizanCount: 1, bridge: false },
    { x: 0.84,  z: 0.06, radius: 0.15, height: 1.22, spireH: 0.50, radialSegs: 16, bartizanCount: 1, bridge: false },
    { x: 0.12,  z: -0.82, radius: 0.16, height: 1.14, spireH: 0.46, radialSegs: 16, bartizanCount: 1, bridge: false }
  ];

  hogwartsTowers.forEach((ht) => {
    cityGroup.add(buildHogwartsTower(ht));
    if (ht.bridge) {
      // Arched Stone Gothic Sky-Bridge connecting tower to Grand Keep
      const bridgeMidX = (ht.x - 0.06) * 0.5;
      const bridgeMidZ = (ht.z - 0.06) * 0.5;
      const bridgeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.06, 1.36, -0.06),
        new THREE.Vector3(bridgeMidX, 1.48, bridgeMidZ),
        new THREE.Vector3(ht.x, 1.32, ht.z)
      ]);
      cityGroup.add(new THREE.Mesh(new THREE.TubeGeometry(bridgeCurve, 12, 0.038, 8, false), matTravertineCampus));
    }
  });

  // 4D. THE ICONIC HOGWARTS MULTI-ARCH VIADUCT BRIDGE (Spanning the Chasm toward the Central Sanctuary!)
  function buildHogwartsViaduct(startVec, endVec, archCount, deckY) {
    const vGrp = new THREE.Group();
    const dir = new THREE.Vector3().subVectors(endVec, startVec);
    const totalLen = dir.length();
    const angle = Math.atan2(dir.x, dir.z);

    // Roadway Deck & Twin Stone Parapet Walls (Cylindrical/Tube mouldings)
    const deckCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(startVec.x, deckY, startVec.z),
      new THREE.Vector3((startVec.x + endVec.x) * 0.5, deckY + 0.02, (startVec.z + endVec.z) * 0.5),
      new THREE.Vector3(endVec.x, deckY, endVec.z)
    ]);
    vGrp.add(new THREE.Mesh(new THREE.TubeGeometry(deckCurve, 20, 0.055, 8, false), matTravertineCampus));

    const spanStep = totalLen / archCount;
    for (let i = 0; i <= archCount; i++) {
      const u = i / archCount;
      const px = THREE.MathUtils.lerp(startVec.x, endVec.x, u);
      const pz = THREE.MathUtils.lerp(startVec.z, endVec.z, u);

      // Tall Tapered Octagonal Stone Viaduct Pier rising from the chasm floor
      const pierH = deckY + 0.06;
      const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.052, pierH, 8), matArchitecturalConcrete);
      pier.position.set(px, pierH * 0.5 - 0.04, pz);
      pier.castShadow = true;
      pier.receiveShadow = true;
      vGrp.add(pier);

      // Pointed Gothic Viaduct Arch spanning between piers
      if (i < archCount) {
        const uNext = (i + 1) / archCount;
        const nx = THREE.MathUtils.lerp(startVec.x, endVec.x, uNext);
        const nz = THREE.MathUtils.lerp(startVec.z, endVec.z, uNext);
        const mx = (px + nx) * 0.5;
        const mz = (pz + nz) * 0.5;
        const archCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(px, deckY - 0.22, pz),
          new THREE.Vector3(mx, deckY - 0.02, mz),
          new THREE.Vector3(nx, deckY - 0.22, nz)
        ]);
        vGrp.add(new THREE.Mesh(new THREE.TubeGeometry(archCurve, 12, 0.024, 8, false), matTravertineCampus));
      }
    }
    return vGrp;
  }

  // Primary Viaduct Bridge spanning from Hogwarts Gatehouse across the gorge toward the Sanctuary
  cityGroup.add(buildHogwartsViaduct(
    new THREE.Vector3(-0.35, 0, -0.35),
    new THREE.Vector3(-1.35, 0, -1.15),
    5,
    0.68
  ));

  // Secondary Viaduct Causeway along the SE Highland Cliff (directly visible in ?view=closeup!)
  cityGroup.add(buildHogwartsViaduct(
    new THREE.Vector3(0.48, 0, 0.62),
    new THREE.Vector3(1.18, 0, 0.96),
    4,
    0.58
  ));

  const escapementBridge = new THREE.Group();
  escapementBridge.position.set(-0.75, 0.62, -0.68);
  escapementBridge.rotation.y = -Math.PI * 0.72;
  const escGear = createToothedGearGroup(THREE, {
    radius: 0.16,
    tube: 0.022,
    teeth: 20,
    toothSize: 0.018,
    spokes: 4,
    matRim: matSpecularBrass,
    matTooth: matAgedBrass
  });
  escGear.rotation.x = Math.PI / 2;
  escapementBridge.add(escGear);
  cityGroup.add(escapementBridge);
  animatedParts.cityEscapement = escapementBridge;

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

  const campusPlinth = new THREE.Mesh(new THREE.CylinderGeometry(1.16, 1.26, 0.22, 12), matTravertineCampus);
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

  // Arched Gothic Lectern & Cloister Colonnade on the Campus Acropolis
  const lecternArch = createDetailedWindowAssembly(THREE, {
    width: 0.42,
    height: 0.48,
    matStoneFrame: matTravertineCampus,
    matMullion: matSpecularBrass,
    matGlow: matCyanRoot
  });
  lecternArch.position.set(0, 0.56, -0.48);
  campusGroup.add(lecternArch);

  for (let c = 0; c < 12; c++) {
    const ca = (c / 12) * Math.PI * 2;
    const cx = Math.cos(ca) * 0.88;
    const cz = Math.sin(ca) * 0.88;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.68, 16), matTravertineCampus);
    col.position.set(cx, 0.65, cz);
    col.castShadow = true;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.048, 0.06, 8), matAgedBrass);
    cap.position.set(cx, 1.00, cz);
    campusGroup.add(col, cap);
  }

  const entablature = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.055, 10, 36), matAgedBrass);
  entablature.rotation.x = Math.PI / 2;
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
  // 7. STRUCTURE #5B: IV · 2021 BOOTCAMP (CRAGGY BASALT CLIFFS, VIADUCT & FRESNEL LIGHTHOUSE)
  // ============================================================================
  const bootcampGroup = new THREE.Group();
  bootcampGroup.position.set(2.75, 0.18, -2.25);
  worldGroup.add(bootcampGroup);

  for (let b = 0; b < 28; b++) {
    const a = (b / 28) * Math.PI * 2;
    const dist = 0.18 + (b % 4) * 0.24;
    const bh = 0.28 + (1.1 - dist) * 0.42 + (b % 3) * 0.09;
    const hexCol = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, bh, 7), matSlateBootcamp);
    hexCol.position.set(Math.cos(a) * dist, bh / 2, Math.sin(a) * dist);
    hexCol.castShadow = true;
    hexCol.receiveShadow = true;
    bootcampGroup.add(hexCol);
  }

  // Arched Gothic Stone Viaduct Causeway leading up to the Cliff Lighthouse
  bootcampGroup.add(buildHogwartsViaduct(
    new THREE.Vector3(-0.95, 0, 0.65),
    new THREE.Vector3(-0.12, 0, 0.05),
    4,
    0.54
  ));

  for (let st = 0; st < 16; st++) {
    const sa = st * 0.18;
    const sr = 0.92 - st * 0.025;
    const sy = 0.08 + st * 0.038;
    const stepMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.032, 8), matTravertineCampus);
    stepMesh.position.set(Math.cos(sa) * sr, sy, Math.sin(sa) * sr);
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


  // ============================================================================
  // 8. LOAD CITADEL_TABLE_V6.GLB & APPLY RAW CONCRETE / STONE MASONRY SHADERS
  // ============================================================================
  try {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '../vendor/citadel_table_v6.glb',
      (gltf) => {
        const glbRoot = gltf.scene;
        if (!glbRoot) return;
        glbRoot.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            const mName = (node.material && node.material.name) || '';
            if (mName.includes('Obsidian') || mName.includes('Slate') || node.name.includes('Tower') || node.name.includes('Keep')) {
              node.material = matArchitecturalConcrete;
            } else if (mName.includes('Travertine') || node.name.includes('Quoin')) {
              node.material = matTravertineCampus;
            }
          }
        });
        // Keep GLB masonry enhancements subtle/aligned with our procedural master world
        glbRoot.visible = false;
        worldGroup.add(glbRoot);
      },
      undefined,
      () => {}
    );
  } catch (e) {
    // Fallback gracefully if offline
  }

  // ============================================================================
  // 9. SAMANA REQUIREMENT #2: VOLUMETRIC LIGHT SHAFTS / GOD RAYS & LIGHTHOUSE BEAM
  // ============================================================================
  const godRaysGroup = new THREE.Group();
  godRaysGroup.name = 'GRP_Volumetric_GodRays';
  worldGroup.add(godRaysGroup);

  function createGodRayShaftTexture() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 512;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, 'rgba(255, 200, 115, 0.42)');
    grad.addColorStop(0.35, 'rgba(255, 184, 77, 0.22)');
    grad.addColorStop(0.75, 'rgba(44, 230, 216, 0.08)');
    grad.addColorStop(1.0, 'rgba(10, 12, 16, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const godRayTex = createGodRayShaftTexture();
  const godRayConfigs = [
    // Subtle 2900K Astrolabe Sun Shafts (75% reduced opacity so geometry behind is never washed out or blurred)
    { x: 0.15, y: 3.1, z: 0.10, rTop: 0.36, rBot: 1.75, h: 6.0, rotZ: -0.26, rotX: 0.18, opacity: 0.028 },
    { x: 2.25, y: 2.8, z: 1.85, rTop: 0.24, rBot: 1.25, h: 5.2, rotZ: -0.28, rotX: 0.20, opacity: 0.032 },
    { x: 1.75, y: 2.5, z: 2.25, rTop: 0.20, rBot: 1.05, h: 4.6, rotZ: -0.25, rotX: 0.16, opacity: 0.025 },
    { x: -2.85, y: 2.4, z: 1.25, rTop: 0.22, rBot: 1.15, h: 4.6, rotZ: -0.24, rotX: 0.15, opacity: 0.024 },
    { x: -2.40, y: 2.3, z: -2.15, rTop: 0.20, rBot: 1.08, h: 4.4, rotZ: -0.22, rotX: 0.14, opacity: 0.022 }
  ];

  const godRayMeshes = [];
  godRayConfigs.forEach((cfg, idx) => {
    const coneGeo = new THREE.CylinderGeometry(cfg.rTop, cfg.rBot, cfg.h, 24, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      map: godRayTex,
      color: idx % 2 === 0 ? 0xFFB84D : 0xFFE2B0,
      transparent: true,
      opacity: cfg.opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const shaft = new THREE.Mesh(coneGeo, coneMat);
    shaft.position.set(cfg.x, cfg.y, cfg.z);
    shaft.rotation.set(cfg.rotX, 0, cfg.rotZ);
    godRaysGroup.add(shaft);
    godRayMeshes.push({ mesh: shaft, baseOpacity: cfg.opacity, phase: idx * 1.3 });
  });

  // Rotating Bootcamp Fresnel Volumetric Lighthouse Beam Cone (crisp subtle shaft, zero glare)
  const lighthouseBeamCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.46, 3.2, 24, 1, true),
    new THREE.MeshBasicMaterial({
      map: godRayTex,
      color: 0xFFB84D,
      transparent: true,
      opacity: 0.018,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );
  lighthouseBeamCone.rotation.z = Math.PI / 2;
  lighthouseBeamCone.position.set(1.82, 0.0, 0.0);
  fresnelGroup.add(lighthouseBeamCone);

  // ============================================================================
  // 10. 3-STRATUM VOLUMETRIC DRIFTING CLOUDS & COASTAL SEA MIST
  // ============================================================================
  const cloudsGroup = new THREE.Group();
  cloudsGroup.name = 'GRP_Volumetric_Clouds_3Strata';
  worldGroup.add(cloudsGroup);

  const cloudTex = createVolumetricCloudTexture(THREE);
  const cloudPuffs = [];

  // Stratum 1: Low Coastal Sea Mist (kept subtle so basalt & harbor details stay razor-sharp)
  const lowMistAnchors = [
    { x: 1.65, y: 0.08, z: -0.85, sx: 1.35, sy: 0.28, opacity: 0.05, tint: 0x8CE8E2, speed: 0.12 },
    { x: 2.55, y: 0.10, z: -1.65, sx: 1.40, sy: 0.30, opacity: 0.05, tint: 0x9ED8E0, speed: 0.10 },
    { x: 3.15, y: 0.12, z: -2.45, sx: 1.35, sy: 0.28, opacity: 0.05, tint: 0xB8D8E8, speed: 0.14 },
    { x: 1.25, y: 0.08, z: 0.95, sx: 1.25, sy: 0.26, opacity: 0.05, tint: 0x7CD8D4, speed: 0.11 },
    { x: -1.45, y: 0.10, z: 0.65, sx: 1.30, sy: 0.28, opacity: 0.05, tint: 0x9EC8D8, speed: 0.09 },
    { x: -2.65, y: 0.12, z: 1.55, sx: 1.35, sy: 0.28, opacity: 0.05, tint: 0xE8B88A, speed: 0.13 }
  ];

  // Stratum 2: Mid Cumulus Cloud Banks (subtle atmospheric wisps that never blur stone bricks or feathers)
  const midCityClouds = [
    { x: 1.92, y: 1.38, z: 1.62, sx: 1.05, sy: 0.38, opacity: 0.05, tint: 0xFFE0B2, speed: 0.16 },
    { x: 2.72, y: 1.68, z: 2.18, sx: 1.10, sy: 0.40, opacity: 0.05, tint: 0xFFD494, speed: 0.14 },
    { x: 2.15, y: 1.95, z: 2.42, sx: 1.00, sy: 0.36, opacity: 0.05, tint: 0xFFF0D4, speed: 0.18 },
    { x: 2.85, y: 1.28, z: 1.42, sx: 1.02, sy: 0.36, opacity: 0.05, tint: 0xE6D2B5, speed: 0.15 },
    { x: 1.52, y: 1.52, z: 2.05, sx: 0.98, sy: 0.34, opacity: 0.05, tint: 0xFFDCA8, speed: 0.17 },
    { x: 0.85, y: 1.75, z: 1.15, sx: 1.00, sy: 0.36, opacity: 0.04, tint: 0xFFE4B8, speed: 0.13 },
    { x: -2.25, y: 1.45, z: -1.85, sx: 1.05, sy: 0.38, opacity: 0.05, tint: 0xD8E2F0, speed: 0.12 },
    { x: 2.45, y: 2.55, z: -2.45, sx: 1.05, sy: 0.36, opacity: 0.04, tint: 0xDCE6F2, speed: 0.15 }
  ];

  // Stratum 3: High Cirrus & Astrolabe Crown Wisps (y = 2.75..3.55)
  const highCirrusClouds = [
    { x: 0.25, y: 3.05, z: -0.35, sx: 1.85, sy: 0.48, opacity: 0.11, tint: 0xFFE2B0, speed: 0.08 },
    { x: 2.10, y: 2.88, z: 1.75, sx: 1.75, sy: 0.46, opacity: 0.12, tint: 0xFFD89A, speed: 0.09 },
    { x: -1.80, y: 3.15, z: 0.90, sx: 1.80, sy: 0.45, opacity: 0.10, tint: 0xE8D8C0, speed: 0.07 }
  ];

  [...lowMistAnchors, ...midCityClouds, ...highCirrusClouds].forEach((cfg, idx) => {
    // Each cloud bank is a 3-plane crossed volumetric billboard cluster that faces camera smoothly
    const bankGrp = new THREE.Group();
    bankGrp.position.set(cfg.x, cfg.y, cfg.z);
    const sprites = [];
    for (let p = 0; p < 3; p++) {
      const mat = new THREE.SpriteMaterial({
        map: cloudTex,
        color: cfg.tint,
        transparent: true,
        opacity: cfg.opacity * (p === 0 ? 1.0 : 0.78),
        depthWrite: false
      });
      const sp = new THREE.Sprite(mat);
      sp.position.set((p - 1) * 0.22, (p % 2) * 0.06, (1 - p) * 0.16);
      sp.scale.set(cfg.sx * (1 - p * 0.12), cfg.sy * (1 - p * 0.10), 1);
      bankGrp.add(sp);
      sprites.push(sp);
    }
    cloudsGroup.add(bankGrp);
    cloudPuffs.push({
      group: bankGrp,
      sprites,
      originX: cfg.x,
      originY: cfg.y,
      originZ: cfg.z,
      speed: cfg.speed,
      phase: idx * 0.85,
      baseOpacity: cfg.opacity
    });
  });

  // ============================================================================
  // 11. 28 ARTICULATED FLAPPING & BANKING BIRDS ACROSS 3 3D SPLINE FLOCKS
  // ============================================================================
  const birdsGroup = new THREE.Group();
  birdsGroup.name = 'GRP_Articulated_Flocks_28';
  worldGroup.add(birdsGroup);

  const matBirdBody = new THREE.MeshStandardMaterial({
    color: 0x6A5846,
    map: featherColorTex,
    bumpMap: featherBumpTex,
    bumpScale: 0.065,
    roughness: 0.68,
    metalness: 0.06,
    emissive: 0x000000,
    emissiveIntensity: 0.0
  });
  const matBirdWing = new THREE.MeshStandardMaterial({
    color: 0xD8C6A8,
    map: featherColorTex,
    bumpMap: featherBumpTex,
    bumpScale: 0.075,
    roughness: 0.64,
    metalness: 0.08,
    emissive: 0x000000,
    emissiveIntensity: 0.0
  });
  const matBirdBurnishedGold = new THREE.MeshStandardMaterial({
    color: 0x9E7838,
    map: featherColorTex,
    bumpMap: featherBumpTex,
    bumpScale: 0.055,
    roughness: 0.58,
    metalness: 0.16,
    emissive: 0x000000,
    emissiveIntensity: 0.0
  });

  // Flock I (11 Citadel Falcons): Figure-8 weaving tightly around The City Keep, brick towers & flying buttresses
  const flock1Curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.55, 1.85, 2.55),
    new THREE.Vector3(2.25, 2.25, 2.75),
    new THREE.Vector3(3.15, 2.05, 2.55),
    new THREE.Vector3(2.85, 1.65, 1.25),
    new THREE.Vector3(2.05, 1.95, 1.55),
    new THREE.Vector3(1.65, 2.45, 1.95),
    new THREE.Vector3(2.45, 2.75, 2.25),
    new THREE.Vector3(2.95, 2.35, 2.65)
  ], true, 'centripetal', 0.5);

  // Flock II (9 Coastal Sea-Swifts): Skimming low over Bootcamp basalt cliffs, harbor ships & Fresnel lighthouse beam
  const flock2Curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.85, 0.95, -1.35),
    new THREE.Vector3(2.65, 1.35, -1.65),
    new THREE.Vector3(3.55, 1.75, -2.25),
    new THREE.Vector3(2.95, 2.25, -2.95),
    new THREE.Vector3(2.05, 1.65, -2.55),
    new THREE.Vector3(1.55, 0.85, -1.85)
  ], true, 'centripetal', 0.5);

  // Flock III (8 Astrolabe Thermal Swifts): Soaring around Kage's golden canopy & toothed brass rings
  const flock3Curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.65, 2.15, 0.95),
    new THREE.Vector3(0.45, 2.45, 1.15),
    new THREE.Vector3(1.15, 2.25, 0.25),
    new THREE.Vector3(0.45, 2.05, -0.95),
    new THREE.Vector3(-0.85, 2.35, -0.75),
    new THREE.Vector3(-1.15, 2.05, 0.25)
  ], true, 'centripetal', 0.5);

  const birdAgents = [];
  const flockDefs = [
    { curve: flock1Curve, count: 11, speed: 0.052, scale: 1.15, radiusOffset: 0.14 },
    { curve: flock2Curve, count: 9,  speed: 0.062, scale: 1.05, radiusOffset: 0.16 },
    { curve: flock3Curve, count: 8,  speed: 0.044, scale: 1.12, radiusOffset: 0.14 }
  ];

  flockDefs.forEach((fDef, fIdx) => {
    for (let i = 0; i < fDef.count; i++) {
      const bird = createArticulatedBird(THREE, {
        matBody: matBirdBody,
        matWing: matBirdWing,
        matFeather: matBirdWing,
        matGoldTip: matBirdBurnishedGold,
        scale: fDef.scale * (0.92 + (i % 3) * 0.08)
      });
      birdsGroup.add(bird.birdGroup);
      birdAgents.push({
        ...bird,
        curve: fDef.curve,
        baseT: i / fDef.count,
        speed: fDef.speed * (0.94 + (i % 4) * 0.03),
        phase: i * 0.73 + fIdx * 2.1,
        lateralOffset: ((i % 3) - 1) * fDef.radiusOffset,
        verticalOffset: ((i % 2) - 0.5) * 0.10
      });
    }
  });

  // ROUND 2 HERO FOREGROUND FALCONS: Positioned in the foreground of ?view=closeup so individual
  // primary/secondary feather blades, central rachis shafts & barb strands are unmistakably legible!
  const heroCityFalcons = [];
  const heroFalconSpecs = [
    { pos: new THREE.Vector3(3.12, 1.98, 2.95), look: new THREE.Vector3(2.25, 2.08, 2.15), roll: -0.34, scale: 1.38, phase: 0.4 },
    { pos: new THREE.Vector3(2.86, 2.14, 2.68), look: new THREE.Vector3(1.95, 2.25, 1.95), roll: 0.28,  scale: 1.24, phase: 1.3 }
  ];
  heroFalconSpecs.forEach((hs) => {
    const hBird = createArticulatedBird(THREE, {
      matBody: matBirdBody,
      matWing: matBirdWing,
      matFeather: matBirdWing,
      matGoldTip: matBirdBurnishedGold,
      scale: hs.scale
    });
    hBird.birdGroup.position.copy(hs.pos);
    hBird.birdGroup.lookAt(hs.look);
    hBird.birdGroup.rotation.z += hs.roll;
    birdsGroup.add(hBird.birdGroup);
    heroCityFalcons.push({ ...hBird, basePos: hs.pos.clone(), baseRoll: hs.roll, phase: hs.phase });
  });

  // ROUND 4 KAGE WORLD-TREE INTERACTING BIRDS & 18 4-WINGED BIOLUMINESCENT DRAGONFLIES
  const kageFaunaGroup = new THREE.Group();
  kageFaunaGroup.name = 'GRP_Kage_Tree_Fauna';
  stn02KageCore.add(kageFaunaGroup);

  const kageTreeBirds = [];
  const kageBirdSpecs = [
    // Perched songbird/falcon on the front mossy primary bough ruffling its feathered wings
    { pos: new THREE.Vector3(0.32, 1.94, 0.52), look: new THREE.Vector3(0.55, 2.02, 1.45), roll: 0.05, scale: 1.18, perched: true, phase: 0.2 },
    // Banking falcon taking flight across the front of the mossy Kage trunk & veined foliage
    { pos: new THREE.Vector3(-0.26, 1.78, 0.78), look: new THREE.Vector3(0.45, 1.92, 0.95), roll: -0.32, scale: 1.22, perched: false, phase: 1.1 },
    // Second canopy swift gliding through the golden-veined leaves on the right bough
    { pos: new THREE.Vector3(0.46, 2.16, 0.68), look: new THREE.Vector3(-0.25, 2.24, 0.92), roll: 0.28, scale: 1.10, perched: false, phase: 2.0 }
  ];
  kageBirdSpecs.forEach((ks) => {
    const kb = createArticulatedBird(THREE, {
      matBody: matBirdBody,
      matWing: matBirdWing,
      matFeather: matBirdWing,
      matGoldTip: matBirdBurnishedGold,
      scale: ks.scale
    });
    kb.birdGroup.position.copy(ks.pos);
    kb.birdGroup.lookAt(ks.look);
    kb.birdGroup.rotation.z += ks.roll;
    kageFaunaGroup.add(kb.birdGroup);
    kageTreeBirds.push({ ...kb, basePos: ks.pos.clone(), perched: ks.perched, phase: ks.phase });
  });

  // 22 Drifting Bioluminescent Pandora Woodsprites (Atokirina') floating around the Tree of Eywa
  const matWoodspriteBell = new THREE.MeshStandardMaterial({
    color: 0xFFF0FF,
    emissive: 0xE882FF,
    emissiveIntensity: 1.55,
    transparent: true,
    opacity: 0.86,
    roughness: 0.18,
    metalness: 0.04,
    side: THREE.DoubleSide
  });

  const kageDragonflies = [];
  for (let d = 0; d < 22; d++) {
    const isCyanSprite = d % 3 === 0;
    const df = createLuminousDragonfly(THREE, {
      matBody: matEywaTendrilPearl,
      matGlow: isCyanSprite ? matEywaTendrilCyan : matEywaTendrilPearl,
      matWing: matWoodspriteBell,
      scale: 0.68 + (d % 4) * 0.14
    });
    const angle = (d / 22) * Math.PI * 2 + 0.25;
    const radius = 0.42 + (d % 5) * 0.28;
    const height = 0.72 + (d % 6) * 0.34;
    df.dfGroup.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
    kageFaunaGroup.add(df.dfGroup);
    kageDragonflies.push({
      ...df,
      baseAngle: angle,
      baseRadius: radius,
      baseY: height,
      speed: 0.28 + (d % 4) * 0.08,
      phase: d * 0.65
    });
  }

  // ============================================================================
  // 12. SAMANA REQUIREMENT #1: CONTINUOUS 3D CATMULL-ROM MASTER CAMERA RAIL
  // ============================================================================
  // Winds physically through the scene:
  // 0.00 Overview -> 0.20 City Keep & Feathered Falcons -> 0.50 Kage World-Tree Centerpiece -> 0.70 Workshop -> 0.90 Bootcamp
  const masterCameraRail = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.45, 4.35, 8.65),   // idx 0 (t=0.00) Grand Astrolabe Overview (Hogwarts + Eywa Tree)
    new THREE.Vector3(2.15, 2.55, 5.15),   // idx 1 (t=0.10) swooping down toward Hogwarts Castle & Viaduct
    new THREE.Vector3(4.05, 1.95, 3.85),   // idx 2 (t=0.20) Hogwarts Great Hall Lancet Windows, Witch-Hat Spires, Viaduct & Falcons
    new THREE.Vector3(2.65, 2.15, 2.35),   // idx 3 (t=0.30) threading beside the Grand Staircase Keep & flying buttresses
    new THREE.Vector3(1.25, 1.98, 2.35),   // idx 4 (t=0.40) approaching the Eywa Sanctuary
    new THREE.Vector3(0.28, 1.86, 3.35),   // idx 5 (t=0.50) Tree of Eywa Close-Up (Braided Trunk, Cascading Weeping Willow Tendrils, Roots & Woodsprites)
    new THREE.Vector3(-1.85, 1.92, 2.45),  // idx 6 (t=0.60) gliding West toward the Copper Foundry
    new THREE.Vector3(-4.15, 1.82, 2.55),  // idx 7 (t=0.70) The Workshop Foundry & 4 Craft Alcoves
    new THREE.Vector3(-1.25, 1.65, -3.45), // idx 8 (t=0.80) The Campus Amphitheater
    new THREE.Vector3(4.15, 2.15, -3.75),  // idx 9 (t=0.90) Bootcamp Basalt Cliffs, Viaduct & Lighthouse
    new THREE.Vector3(3.65, 2.45, 3.85)    // idx 10 (t=1.00) climbing back across the harbor toward Overview
  ], false, 'centripetal', 0.5);

  const masterLookAtRail = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.45, 1.32, 0.35),   // idx 0 (t=0.00) Center of the Astrolabe Table
    new THREE.Vector3(2.05, 1.65, 1.85),   // idx 1 (t=0.10)
    new THREE.Vector3(2.15, 1.68, 1.85),   // idx 2 (t=0.20) Hogwarts Great Hall, Astronomy Tower & Falcons
    new THREE.Vector3(1.65, 1.75, 1.25),   // idx 3 (t=0.30)
    new THREE.Vector3(0.25, 1.65, 0.25),   // idx 4 (t=0.40)
    new THREE.Vector3(0.00, 1.56, 0.00),   // idx 5 (t=0.50) Centerpiece Tree of Eywa Braided Trunk & Weeping Willow Canopy
    new THREE.Vector3(-2.15, 1.15, 1.15),  // idx 6 (t=0.60)
    new THREE.Vector3(-3.10, 0.92, 1.35),  // idx 7 (t=0.70) Workshop Copper Dome & Hearth
    new THREE.Vector3(-2.55, 0.78, -2.35), // idx 8 (t=0.80) Campus Colonnade
    new THREE.Vector3(2.75, 1.32, -2.25),  // idx 9 (t=0.90) Bootcamp Lighthouse & Viaduct
    new THREE.Vector3(0.45, 1.25, 0.35)    // idx 10 (t=1.00)
  ], false, 'centripetal', 0.5);

  // Attach self-contained updateAtmosphere(elapsedTime) so clouds, birds & god-rays animate automatically
  const _birdPos = new THREE.Vector3();
  const _birdNext = new THREE.Vector3();
  const _birdPrev = new THREE.Vector3();
  const _birdTan = new THREE.Vector3();
  const _birdLat = new THREE.Vector3();
  const _upVec = new THREE.Vector3(0, 1, 0);

  animatedParts.birds = birdAgents;
  animatedParts.clouds = cloudPuffs;
  animatedParts.godRays = godRayMeshes;
  animatedParts.updateAtmosphere = (elapsed) => {
    // 1. Animate 28 articulated birds along their 3D spline loops with active 4.2 Hz wing flap bursts + thermal glides + banking roll
    for (let i = 0; i < birdAgents.length; i++) {
      const b = birdAgents[i];
      const u = (b.baseT + elapsed * b.speed) % 1.0;
      const uNext = (u + 0.012) % 1.0;
      const uPrev = (u - 0.012 + 1.0) % 1.0;

      b.curve.getPointAt(u, _birdPos);
      b.curve.getPointAt(uNext, _birdNext);
      b.curve.getPointAt(uPrev, _birdPrev);

      _birdTan.subVectors(_birdNext, _birdPos).normalize();
      _birdLat.crossVectors(_birdTan, _upVec).normalize();

      // Add formation offset + subtle thermal bob
      const thermalBob = Math.sin(elapsed * 2.2 + b.phase) * 0.045;
      b.birdGroup.position.copy(_birdPos)
        .addScaledVector(_birdLat, b.lateralOffset)
        .add(new THREE.Vector3(0, b.verticalOffset + thermalBob, 0));

      b.birdGroup.lookAt(_birdNext.x + _birdLat.x * b.lateralOffset, _birdNext.y + b.verticalOffset, _birdNext.z + _birdLat.z * b.lateralOffset);

      // Compute turn curvature for realistic banking roll (up to 35 deg)
      const heading1 = Math.atan2(_birdPos.x - _birdPrev.x, _birdPos.z - _birdPrev.z);
      const heading2 = Math.atan2(_birdNext.x - _birdPos.x, _birdNext.z - _birdPos.z);
      let dHeading = heading2 - heading1;
      if (dHeading > Math.PI) dHeading -= Math.PI * 2;
      if (dHeading < -Math.PI) dHeading += Math.PI * 2;
      const bankRoll = THREE.MathUtils.clamp(-dHeading * 4.8, -0.62, 0.62);
      b.birdGroup.rotation.z += bankRoll;

      // Active 4.2 Hz flap burst (1.2s) alternating with outstretched thermal glide (1.5s)
      const cycle = (elapsed + b.phase) % 2.7;
      let wingAngle = 0.12; // slight dihedral during thermal glide
      if (cycle < 1.35) {
        const flapEnv = Math.sin((cycle / 1.35) * Math.PI);
        const flapWave = Math.sin((elapsed * 4.2 * Math.PI * 2) + b.phase * 3.0);
        // Asymmetric downstroke/upstroke
        wingAngle = (flapWave > 0 ? flapWave * 0.68 : flapWave * 0.45) * flapEnv;
      } else {
        wingAngle = 0.14 + Math.sin(elapsed * 1.8 + b.phase) * 0.05;
      }
      b.leftWing.rotation.z = -wingAngle;
      b.rightWing.rotation.z = wingAngle;
      b.tailGroup.rotation.x = Math.sin(elapsed * 8.4 + b.phase) * 0.08;
    }

    // 2. Drift 3-stratum volumetric clouds WSW -> ENE
    for (let c = 0; c < cloudPuffs.length; c++) {
      const cp = cloudPuffs[c];
      const drift = ((elapsed * cp.speed + cp.phase) % 2.4) - 1.2;
      cp.group.position.x = cp.originX + drift * 0.55;
      cp.group.position.z = cp.originZ + drift * 0.28;
      cp.group.position.y = cp.originY + Math.sin(elapsed * 0.45 + cp.phase) * 0.04;
    }

    // 3. Subtle volumetric god-ray shimmer
    for (let g = 0; g < godRayMeshes.length; g++) {
      const gr = godRayMeshes[g];
      gr.mesh.material.opacity = gr.baseOpacity * (0.86 + 0.14 * Math.sin(elapsed * 0.9 + gr.phase));
    }

    // 4. Animate Hero Foreground Falcons & Kage World-Tree Interacting Birds
    for (let h = 0; h < heroCityFalcons.length; h++) {
      const hb = heroCityFalcons[h];
      const flapAngle = 0.28 + Math.sin(elapsed * 4.5 + hb.phase) * 0.42;
      hb.leftWing.rotation.z = -flapAngle;
      hb.rightWing.rotation.z = flapAngle;
      hb.tailGroup.rotation.x = Math.sin(elapsed * 6.0 + hb.phase) * 0.07;
      hb.birdGroup.position.y = hb.basePos.y + Math.sin(elapsed * 2.2 + hb.phase) * 0.025;
    }

    for (let k = 0; k < kageTreeBirds.length; k++) {
      const kb = kageTreeBirds[k];
      if (kb.perched) {
        // Perched bird on Kage's mossy bough gently ruffling wings & looking around
        const ruffle = 0.35 + Math.sin(elapsed * 3.2 + kb.phase) * 0.22;
        kb.leftWing.rotation.z = -ruffle;
        kb.rightWing.rotation.z = ruffle;
        if (kb.headGroup) kb.headGroup.rotation.y = Math.sin(elapsed * 1.8) * 0.28;
      } else {
        const wAng = 0.24 + Math.sin(elapsed * 4.8 + kb.phase) * 0.48;
        kb.leftWing.rotation.z = -wAng;
        kb.rightWing.rotation.z = wAng;
        kb.birdGroup.position.y = kb.basePos.y + Math.sin(elapsed * 2.6 + kb.phase) * 0.035;
      }
    }

    // 5. Animate 18 4-Winged Bioluminescent Dragonflies darting around Kage's mossy bark & veined leaves
    for (let d = 0; d < kageDragonflies.length; d++) {
      const df = kageDragonflies[d];
      const ang = df.baseAngle + Math.sin(elapsed * df.speed + df.phase) * 0.38;
      const rad = df.baseRadius + Math.cos(elapsed * df.speed * 1.3 + df.phase) * 0.08;
      const ny = df.baseY + Math.sin(elapsed * 1.9 + df.phase) * 0.06;
      df.dfGroup.position.set(Math.cos(ang) * rad, ny, Math.sin(ang) * rad);
      df.dfGroup.rotation.y = -ang + Math.PI * 0.5;
      const buzz = Math.sin(elapsed * 28.0 + df.phase) * 0.52;
      for (let w = 0; w < df.wings.length; w++) {
        const wg = df.wings[w];
        wg.pivot.rotation.z = wg.side * (wg.pair === 0 ? buzz : -buzz * 0.85);
      }
    }

    // 6. v9 Asynchronous Wind Sway & Biological Rhythm across Clustered Catenary Willow Tendrils
    if (animatedParts.swayTendrilGroups) {
      for (let t = 0; t < animatedParts.swayTendrilGroups.length; t++) {
        const st = animatedParts.swayTendrilGroups[t];
        st.group.rotation.z = Math.sin(elapsed * st.freq + st.phase) * st.amp;
        st.group.rotation.x = Math.cos(elapsed * (st.freq * 0.82) + st.phase * 1.3) * (st.amp * 0.75);
      }
    }
  };

  // Run one initial tick at t=1.25s so immediate static screenshots show birds mid-flap & banked
  animatedParts.updateAtmosphere(1.25);

  // Hook into composer.render so every frame automatically updates birds, clouds & god-rays
  const _origComposerRender = composer.render.bind(composer);
  const _atmosClock = new THREE.Clock();
  composer.render = function (...args) {
    animatedParts.updateAtmosphere(1.25 + _atmosClock.getElapsedTime());
    return _origComposerRender(...args);
  };


  // Sanitize any degenerate/zero-length vertex normals (e.g. ConeGeometry apex) to prevent NaN in HalfFloat UnrealBloomPass
  scene.traverse((obj) => {
    if (obj.isMesh && obj.geometry && obj.geometry.attributes && obj.geometry.attributes.normal) {
      const norm = obj.geometry.attributes.normal;
      const arr = norm.array;
      let fixed = false;
      for (let i = 0; i < arr.length; i += 3) {
        const nx = arr[i], ny = arr[i+1], nz = arr[i+2];
        const len2 = nx*nx + ny*ny + nz*nz;
        if (!Number.isFinite(len2) || len2 < 1e-6) {
          arr[i] = 0.0;
          arr[i+1] = 1.0;
          arr[i+2] = 0.0;
          fixed = true;
        }
      }
      if (fixed) norm.needsUpdate = true;
    }
  });

  return {
    renderer,
    scene,
    camera,
    composer,
    bloomPass,
    worldGroup,
    animatedParts,
    primaryCityCurve,
    masterCameraRail,
    masterLookAtRail,
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

export const initCitadelWorldV5 = initCitadelWorldV6;
