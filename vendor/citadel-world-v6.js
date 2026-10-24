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

  // 1. Pointed Gothic Lancet Pane (ShapeGeometry with curved pointed arch top)
  const paneShape = new THREE.Shape();
  paneShape.moveTo(-hw * 0.84, baseY);
  paneShape.lineTo(hw * 0.84, baseY);
  paneShape.lineTo(hw * 0.84, springY);
  paneShape.quadraticCurveTo(hw * 0.78, (springY + apexY) * 0.55, 0, apexY);
  paneShape.quadraticCurveTo(-hw * 0.78, (springY + apexY) * 0.55, -hw * 0.84, springY);
  paneShape.closePath();

  const paneGeo = new THREE.ShapeGeometry(paneShape, 12);
  const pane = new THREE.Mesh(paneGeo, matGlow);
  pane.position.z = -0.004;
  winGrp.add(pane);

  // 2. Curved Pointed Gothic Stone Hood Moulding & Jambs (CatmullRomCurve3 TubeGeometry)
  const archFrameCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-hw, baseY, 0.003),
    new THREE.Vector3(-hw, springY, 0.003),
    new THREE.Vector3(-hw * 0.58, (springY + apexY) * 0.56, 0.004),
    new THREE.Vector3(0, apexY + 0.012, 0.005),
    new THREE.Vector3(hw * 0.58, (springY + apexY) * 0.56, 0.004),
    new THREE.Vector3(hw, springY, 0.003),
    new THREE.Vector3(hw, baseY, 0.003)
  ]);
  const archFrame = new THREE.Mesh(
    new THREE.TubeGeometry(archFrameCurve, 24, 0.010, 8, false),
    matStoneFrame
  );
  winGrp.add(archFrame);

  // Gothic Finial / Dripstone Boss at the Pointed Apex
  const apexFinial = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.036, 8), matStoneFrame);
  apexFinial.position.set(0, apexY + 0.026, 0.005);
  winGrp.add(apexFinial);

  // Weathered Sloped Stone Sill (chamfered prism)
  const sill = new THREE.Mesh(new THREE.CylinderGeometry(width * 0.62, width * 0.70, 0.018, 6), matStoneFrame);
  sill.scale.set(1.0, 1.0, 0.35);
  sill.position.set(0, baseY - 0.006, 0.006);
  winGrp.add(sill);

  // 3. Slender Gothic Y-Tracery Mullion & Quatrefoil Ocular Ring
  const centerMullion = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0035, 0.004, (springY - baseY) * 1.02, 8),
    matMullion
  );
  centerMullion.position.set(0, (springY + baseY) * 0.5, 0.002);
  winGrp.add(centerMullion);

  for (let side of [-1, 1]) {
    const traceryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, springY - 0.01, 0.002),
      new THREE.Vector3(side * hw * 0.38, (springY + apexY) * 0.45, 0.002),
      new THREE.Vector3(side * hw * 0.72, springY + 0.02, 0.002)
    ]);
    winGrp.add(new THREE.Mesh(new THREE.TubeGeometry(traceryCurve, 8, 0.003, 6, false), matMullion));
  }

  const rosette = new THREE.Mesh(new THREE.TorusGeometry(width * 0.16, 0.003, 6, 16), matMullion);
  rosette.position.set(0, (springY + apexY) * 0.48, 0.002);
  winGrp.add(rosette);

  return winGrp;
}
export function initCitadelWorldV6(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance'
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
  scene.fog = new THREE.FogExp2(0x0B1222, 0.019); // Deep Scottish Highland midnight-indigo mist

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
    new THREE.SphereGeometry(42, 32, 20),
    new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })
  );
  skyDome.name = 'GRP_Atmospheric_SkyDome';
  scene.add(skyDome);

  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);

  // Post-processing with explicit 4x-MSAA HalfFloat RenderTarget + matched 2x pixelRatio
  const msaaRenderTarget = new THREE.WebGLRenderTarget(
    Math.floor(window.innerWidth * pixelRatio),
    Math.floor(window.innerHeight * pixelRatio),
    {
      samples: 4,
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
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio),
    0.20, // strength = 0.20 (crisp cinema glow without white-out)
    0.26, // radius = 0.26 (tight soft halo around individual willow tendrils & lancet windows)
    0.92  // threshold = 0.92 (stone masonry, cliff rock, bark & feathers stay 100% sharp)
  );
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
  astrolabeKeyLight.shadow.mapSize.width = 2048;
  astrolabeKeyLight.shadow.mapSize.height = 2048;
  astrolabeKeyLight.shadow.camera.near = 1.0;
  astrolabeKeyLight.shadow.camera.far = 24.0;
  const d = 7.2;
  astrolabeKeyLight.shadow.camera.left = -d;
  astrolabeKeyLight.shadow.camera.right = d;
  astrolabeKeyLight.shadow.camera.top = d;
  astrolabeKeyLight.shadow.camera.bottom = -d;
  astrolabeKeyLight.shadow.bias = -0.0004;
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
    color: 0x3E485C,
    map: masonryColorTex,
    bumpMap: masonryBumpTex,
    bumpScale: 0.11,
    roughnessMap: masonryRoughTex,
    roughness: 0.80,
    metalness: 0.08
  });

  const matMilledTrench = new THREE.MeshStandardMaterial({
    color: 0x080C14,
    roughness: 0.88,
    metalness: 0.06
  });

  // Hogwarts Turret Slate Roof Material (dark blue-grey Highland slate shingles)
  const matSlateBootcamp = new THREE.MeshStandardMaterial({
    color: 0x3B475E,
    map: masonryColorTex,
    bumpMap: masonryBumpTex,
    bumpScale: 0.095,
    roughnessMap: masonryRoughTex,
    roughness: 0.64,
    metalness: 0.16
  });

  // Hogwarts Weathered Highland Sandstone / Limestone Ashlar Masonry
  const matArchitecturalConcrete = new THREE.MeshStandardMaterial({
    color: 0x9A8E7E,
    map: masonryColorTex,
    bumpMap: masonryBumpTex,
    bumpScale: 0.115,
    roughnessMap: masonryRoughTex,
    roughness: 0.74,
    metalness: 0.06
  });

  // Warm Buff Cotswold / Highland Dressed Stone Trim & Buttresses
  const matTravertineCampus = new THREE.MeshStandardMaterial({
    color: 0xD8C8B0,
    map: masonryColorTex,
    bumpMap: masonryBumpTex,
    bumpScale: 0.078,
    roughness: 0.66,
    metalness: 0.05
  });

  // Eywa Ancient Braided Bioluminescent Bark (deep gnarled Pandora wood with subtle bioluminescent neural crevices)
  const matKageGnarledBark = new THREE.MeshStandardMaterial({
    color: 0x7A687F,
    map: barkColorTex,
    bumpMap: barkBumpTex,
    bumpScale: 0.185,
    roughnessMap: barkRoughTex,
    roughness: 0.78,
    metalness: 0.06,
    emissive: 0x3A1E54,
    emissiveMap: barkEmissiveTex,
    emissiveIntensity: 0.35
  });

  // Bioluminescent Pandora Sanctuary Moss (lush cyan-emerald velvet moss cushions)
  const matKageVelvetMoss = new THREE.MeshStandardMaterial({
    color: 0x2B8C7E,
    bumpMap: barkBumpTex,
    bumpScale: 0.090,
    roughness: 0.82,
    metalness: 0.04,
    emissive: 0x145E58,
    emissiveIntensity: 0.32
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

  // 2A. Inner Bioluminescent Heartwood Core & 8 Spiral-Braided Helical Trunk Strands
  //     (Recreates Eywa's signature twisted, braided multi-trunk lattice with hollow glowing clefts)
  const heartCoreCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.00, 0.14, 0.00),
    new THREE.Vector3(0.02, 0.72, 0.02),
    new THREE.Vector3(-0.02, 1.38, -0.01),
    new THREE.Vector3(0.01, 2.05, 0.01)
  ]);
  stn02KageCore.add(buildTaperedBarkBranch(heartCoreCurve, 0.19, 0.11, 18, 24, matKageGnarledBark, 0.18));

  const braidedStrandCount = 8;
  for (let s = 0; s < braidedStrandCount; s++) {
    const a0 = (s / braidedStrandCount) * Math.PI * 2;
    const braidDir = s % 2 === 0 ? 1.0 : -0.65; // Counter-twisting helical braid!
    const braidPts = [];
    const steps = 20;
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const y = 0.12 + t * 2.18;
      // Wide root flare -> muscular braided waist -> flaring upper crown
      const rootSpread = Math.pow(1.0 - t, 2.4) * 0.68;
      const waistR = 0.16 + Math.sin(t * Math.PI * 2.0 + s) * 0.035;
      const crownFlare = Math.pow(t, 2.8) * 0.42;
      const rad = rootSpread + waistR + crownFlare;
      const theta = a0 + braidDir * t * Math.PI * 1.35 + Math.sin(t * Math.PI * 3.0 + s) * 0.14;
      braidPts.push(new THREE.Vector3(Math.cos(theta) * rad, y, Math.sin(theta) * rad));
    }
    const braidCurve = new THREE.CatmullRomCurve3(braidPts);
    stn02KageCore.add(buildTaperedBarkBranch(braidCurve, 0.135, 0.068, 14, 28, matKageGnarledBark, 0.16));

    // Glowing Bioluminescent Neural Vein coursing along the braided trunk groove
    const veinPts = braidPts.map((p, idx) => {
      const u = idx / steps;
      const outScale = 1.04 + Math.sin(u * Math.PI) * 0.02;
      return new THREE.Vector3(p.x * outScale, p.y + 0.01, p.z * outScale);
    });
    const veinCurve = new THREE.CatmullRomCurve3(veinPts);
    const veinMat = s % 2 === 0 ? matEywaTendrilCyan : matEywaTendrilViolet;
    stn02KageCore.add(new THREE.Mesh(new THREE.TubeGeometry(veinCurve, 26, 0.0075, 6, false), veinMat));
  }

  // 2B. 12 Long Snaking Bioluminescent Root Buttresses radiating across the Sanctuary Floor
  for (let r = 0; r < 12; r++) {
    const rAng = (r / 12) * Math.PI * 2 + (r % 2) * 0.08;
    const reach = 1.18 + (r % 3) * 0.18;
    const snakeRootCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(rAng) * 0.28, 0.68, Math.sin(rAng) * 0.28),
      new THREE.Vector3(Math.cos(rAng + 0.10) * 0.56, 0.34, Math.sin(rAng + 0.10) * 0.56),
      new THREE.Vector3(Math.cos(rAng - 0.08) * 0.88, 0.19, Math.sin(rAng - 0.08) * 0.88),
      new THREE.Vector3(Math.cos(rAng + 0.14) * reach, 0.14, Math.sin(rAng + 0.14) * reach)
    ]);
    stn02KageCore.add(buildTaperedBarkBranch(snakeRootCurve, 0.095, 0.024, 12, 18, matKageGnarledBark, 0.15));

    // Glowing Cyan-Violet Neural Root Filament riding the crest of each snaking root
    const rootVeinCurve = new THREE.CatmullRomCurve3(
      snakeRootCurve.getPoints(16).map((p, idx) => new THREE.Vector3(p.x, p.y + 0.028 * (1.0 - idx / 18), p.z))
    );
    stn02KageCore.add(new THREE.Mesh(
      new THREE.TubeGeometry(rootVeinCurve, 18, 0.0065, 6, false),
      r % 3 === 0 ? matEywaTendrilViolet : matCyanCore
    ));

    // Lush Bioluminescent Moss Cushions nestled between root hollows
    if (r % 2 === 0) {
      const mPt = snakeRootCurve.getPointAt(0.42);
      const mossPad = new THREE.Mesh(new THREE.SphereGeometry(0.062, 10, 8), matKageVelvetMoss);
      mossPad.scale.set(1.4, 0.48, 1.9);
      mossPad.position.set(mPt.x, mPt.y + 0.018, mPt.z);
      mossPad.rotation.y = -rAng;
      stn02KageCore.add(mossPad);
    }
  }

  // 2C. 24 Sweeping Arched Umbrella Willow Boughs (The Eywa Canopy Crown)
  //     Each bough arches gracefully upward from y=1.95 to y=2.82, sweeps outward to R=1.65..2.05,
  //     and droops at its outer willow tips!
  const tendrilAttachNodes = []; // Stores { pos, radialDist, boughIdx } for hanging weeping tendrils
  const umbrellaBoughCount = 24;

  for (let b = 0; b < umbrellaBoughCount; b++) {
    const isUpperTier = b % 2 === 0;
    const bAngle = (b / umbrellaBoughCount) * Math.PI * 2 + (isUpperTier ? 0.0 : 0.06);
    const maxReach = isUpperTier ? 1.88 + (b % 3) * 0.12 : 1.48 + (b % 4) * 0.10;
    const peakY = isUpperTier ? 2.74 + (b % 3) * 0.08 : 2.42 + (b % 3) * 0.07;
    const tipDropY = isUpperTier ? peakY - 0.34 : peakY - 0.28;

    const boughCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(bAngle) * 0.22, 1.92 + (isUpperTier ? 0.16 : 0.0), Math.sin(bAngle) * 0.22),
      new THREE.Vector3(Math.cos(bAngle + 0.06) * (maxReach * 0.36), peakY - 0.14, Math.sin(bAngle + 0.06) * (maxReach * 0.36)),
      new THREE.Vector3(Math.cos(bAngle + 0.12) * (maxReach * 0.68), peakY, Math.sin(bAngle + 0.12) * (maxReach * 0.68)),
      new THREE.Vector3(Math.cos(bAngle + 0.16) * (maxReach * 0.92), peakY - 0.12, Math.sin(bAngle + 0.16) * (maxReach * 0.92)),
      new THREE.Vector3(Math.cos(bAngle + 0.20) * maxReach, tipDropY, Math.sin(bAngle + 0.20) * maxReach)
    ]);

    const rStart = isUpperTier ? 0.076 : 0.058;
    stn02KageCore.add(buildTaperedBarkBranch(boughCurve, rStart, 0.012, 10, 20, matKageGnarledBark, 0.12));

    // Collect tendril drape points along the outer umbrella bough (draping longest around the outer perimeter so the braided trunk core remains visible inside the glowing willow curtain)
    for (let tp = 5; tp <= 14; tp += 2) {
      const u = tp / 14;
      const pt = boughCurve.getPointAt(u);
      tendrilAttachNodes.push({
        pos: pt,
        u,
        boughIdx: b,
        angle: bAngle + 0.14 * u
      });
    }

    // Forked Secondary Arching Willow Sub-Branches for dense umbrella crown volume
    for (let sub of [-1, 1]) {
      const splitU = 0.45 + (sub > 0 ? 0.12 : 0.0);
      const origin = boughCurve.getPointAt(splitU);
      const subAng = bAngle + 0.12 + sub * 0.26;
      const subReach = maxReach * (0.42 + (b % 2) * 0.08);
      const subCurve = new THREE.CatmullRomCurve3([
        origin.clone(),
        new THREE.Vector3(
          origin.x + Math.cos(subAng) * subReach * 0.52,
          origin.y + 0.06,
          origin.z + Math.sin(subAng) * subReach * 0.52
        ),
        new THREE.Vector3(
          origin.x + Math.cos(subAng + sub * 0.10) * subReach,
          origin.y - 0.22,
          origin.z + Math.sin(subAng + sub * 0.10) * subReach
        )
      ]);
      stn02KageCore.add(buildTaperedBarkBranch(subCurve, 0.032, 0.006, 8, 12, matKageGnarledBark, 0.08));

      for (let sp = 2; sp <= 6; sp += 2) {
        const su = sp / 6;
        tendrilAttachNodes.push({
          pos: subCurve.getPointAt(su),
          u: 0.5 + su * 0.5,
          boughIdx: b,
          angle: subAng
        });
      }
    }
  }

  // 2D. THE SIGNATURE EYWA CANOPY: Hundreds of Cascading Bioluminescent Weeping Willow Tendrils!
  //     Long, flowing, gently swaying fiber-optic curtains in Violet-Magenta, Soft Pink, Pearl-White & Cyan-Aqua
  //     draping all the way down from the umbrella canopy toward the ground, studded with glowing blossom nodes!
  const canopyGroup = new THREE.Group();
  canopyGroup.name = 'GRP_Eywa_Weeping_Willow_Tendrils';
  stn02KageCore.add(canopyGroup);

  const tendrilMats = [
    matEywaTendrilViolet,
    matEywaTendrilPink,
    matEywaTendrilPearl,
    matEywaTendrilCyan
  ];

  // Shared geometry for glowing bioluminescent seed-node droplets along the weeping strands
  const blossomBeadGeo = new THREE.SphereGeometry(0.011, 7, 7);
  blossomBeadGeo.scale(0.68, 1.85, 0.68);
  const blossomBeadCount = tendrilAttachNodes.length * 3;
  const blossomInstViolet = new THREE.InstancedMesh(blossomBeadGeo, matEywaTendrilPink, Math.ceil(blossomBeadCount * 0.65));
  const blossomInstCyan = new THREE.InstancedMesh(blossomBeadGeo, matEywaTendrilCyan, Math.ceil(blossomBeadCount * 0.35));
  let vIdx = 0;
  let cIdx = 0;
  const _beadDummy = new THREE.Object3D();

  // Also build a dense curtain of fine glowing fiber-optic willow filaments (LineSegments with vertex colors)
  const fineFilamentPositions = [];
  const fineFilamentColors = [];
  const cViolet = new THREE.Color(0xE070FF);
  const cPink = new THREE.Color(0xFFA8F6);
  const cPearl = new THREE.Color(0xFFF2FF);
  const cCyan = new THREE.Color(0x48FFF2);

  tendrilAttachNodes.forEach((node, idx) => {
    const p0 = node.pos;
    // Outer tendrils hang longer (down to y = 0.55..1.15), inner tendrils frame the trunk (down to y = 1.25..1.65)
    const radialDist = Math.hypot(p0.x, p0.z);
    const baseDrop = THREE.MathUtils.clamp(0.62 + radialDist * 0.46 + ((idx * 17) % 7) * 0.09, 0.68, 1.72);
    const swayX = Math.cos(node.angle + 0.4) * (0.04 + (idx % 3) * 0.018);
    const swayZ = Math.sin(node.angle + 0.4) * (0.04 + (idx % 3) * 0.018);

    // 1. Primary Sculpted 3D Bioluminescent Weeping Tendril Tube (every attach node gets a graceful hanging strand)
    const tCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(p0.x, p0.y, p0.z),
      new THREE.Vector3(p0.x + swayX * 0.35, p0.y - baseDrop * 0.32, p0.z + swayZ * 0.35),
      new THREE.Vector3(p0.x + swayX * 0.78, p0.y - baseDrop * 0.68, p0.z + swayZ * 0.78),
      new THREE.Vector3(p0.x + swayX, p0.y - baseDrop, p0.z + swayZ)
    ]);

    const tMat = tendrilMats[idx % tendrilMats.length];
    const tubeRadius = (idx % 4 === 2) ? 0.0042 : 0.0032;
    const strandMesh = new THREE.Mesh(new THREE.TubeGeometry(tCurve, 10, tubeRadius, 5, false), tMat);
    canopyGroup.add(strandMesh);

    // Place 3 glowing seed-blossom droplets along this weeping willow strand
    for (let b = 1; b <= 3; b++) {
      const bu = b / 3.1;
      const bPt = tCurve.getPointAt(bu);
      _beadDummy.position.copy(bPt);
      const s = 0.75 + (b === 3 ? 0.55 : 0.15 * b);
      _beadDummy.scale.setScalar(s);
      _beadDummy.updateMatrix();
      if ((idx + b) % 3 === 0 && cIdx < blossomInstCyan.count) {
        blossomInstCyan.setMatrixAt(cIdx++, _beadDummy.matrix);
      } else if (vIdx < blossomInstViolet.count) {
        blossomInstViolet.setMatrixAt(vIdx++, _beadDummy.matrix);
      }
    }

    // 2. Surround each primary tendril with 3 ultra-fine glowing fiber-optic willow hairs for lush curtain density
    for (let f = 0; f < 3; f++) {
      const fAng = node.angle + (f - 1) * 0.45;
      const ox = Math.cos(fAng) * 0.032;
      const oz = Math.sin(fAng) * 0.032;
      const fDrop = baseDrop * (0.82 + f * 0.11);
      const segs = 6;
      for (let s = 0; s < segs; s++) {
        const u0 = s / segs;
        const u1 = (s + 1) / segs;
        const x0 = p0.x + ox * (1 + u0 * 0.5) + swayX * u0 * u0;
        const y0 = p0.y - fDrop * u0;
        const z0 = p0.z + oz * (1 + u0 * 0.5) + swayZ * u0 * u0;

        const x1 = p0.x + ox * (1 + u1 * 0.5) + swayX * u1 * u1;
        const y1 = p0.y - fDrop * u1;
        const z1 = p0.z + oz * (1 + u1 * 0.5) + swayZ * u1 * u1;

        fineFilamentPositions.push(x0, y0, z0, x1, y1, z1);
        const colTop = (idx + f) % 4 === 0 ? cCyan : ((idx + f) % 2 === 0 ? cViolet : cPink);
        const colBot = cPearl;
        const c0 = colTop.clone().lerp(colBot, u0 * 0.75);
        const c1 = colTop.clone().lerp(colBot, u1 * 0.75);
        fineFilamentColors.push(c0.r, c0.g, c0.b, c1.r, c1.g, c1.b);
      }
    }
  });

  blossomInstViolet.instanceMatrix.needsUpdate = true;
  blossomInstCyan.instanceMatrix.needsUpdate = true;
  canopyGroup.add(blossomInstViolet, blossomInstCyan);

  const filamentGeo = new THREE.BufferGeometry();
  filamentGeo.setAttribute('position', new THREE.Float32BufferAttribute(fineFilamentPositions, 3));
  filamentGeo.setAttribute('color', new THREE.Float32BufferAttribute(fineFilamentColors, 3));
  const filamentMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.34,
    blending: THREE.AdditiveBlending
  });
  const filamentCurtain = new THREE.LineSegments(filamentGeo, filamentMat);
  canopyGroup.add(filamentCurtain);

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
  wormPinion.position.set(1.96, 2.95, 0);
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

  // Helper: Conical Witch-Hat Slate Spire (concave flared eaves -> steep needle peak + finial)
  function buildWitchHatSpire(baseRadius, spireHeight, radialSegs = 24, hasDormers = true) {
    const spireGrp = new THREE.Group();
    const lathePts = [];
    const steps = 14;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Concave witch-hat curve: flared eaves at base, slender needle taper toward apex
      const r = baseRadius * Math.pow(1.0 - t, 1.38) + 0.004;
      const y = t * spireHeight;
      lathePts.push(new THREE.Vector2(r, y));
    }
    const spireGeo = new THREE.LatheGeometry(lathePts, radialSegs);
    const spireMesh = new THREE.Mesh(spireGeo, matSlateBootcamp);
    spireMesh.castShadow = true;
    spireMesh.receiveShadow = true;
    spireGrp.add(spireMesh);

    // Molded Stone Eaves Cornice Ring + Brass Weathervane Finial
    const eavesRing = new THREE.Mesh(new THREE.TorusGeometry(baseRadius * 0.96, 0.016, 8, radialSegs), matTravertineCampus);
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
        const dr = baseRadius * 0.62;
        dGrp.position.set(Math.cos(da) * dr, spireHeight * 0.24, Math.sin(da) * dr);
        dGrp.rotation.y = -da + Math.PI / 2;

        const dBody = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.09, 6), matArchitecturalConcrete);
        const dRoof = new THREE.Mesh(new THREE.ConeGeometry(0.044, 0.085, 6), matSlateBootcamp);
        dRoof.position.y = 0.075;
        const dGlow = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), matGoldCanopy);
        dGlow.scale.set(0.7, 1.4, 0.5);
        dGlow.position.set(0, 0, 0.026);
        dGrp.add(dBody, dRoof, dGlow);
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

    // 3. Slender Vertical Gothic Pilaster Buttress Ribs with Pointed Pinnacles around the drum
    const ribCount = isHero ? 8 : 6;
    for (let b = 0; b < ribCount; b++) {
      const ba = (b / ribCount) * Math.PI * 2;
      const rib = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.024, height * 0.94, 8),
        matTravertineCampus
      );
      rib.position.set(Math.cos(ba) * (radius * 0.98), height * 0.47, Math.sin(ba) * (radius * 0.98));
      tGrp.add(rib);

      const pinnacle = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.16, 8), matTravertineCampus);
      pinnacle.position.set(Math.cos(ba) * (radius * 0.98), height + 0.06, Math.sin(ba) * (radius * 0.98));
      tGrp.add(pinnacle);
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

  return {
    renderer,
    scene,
    camera,
    composer,
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
