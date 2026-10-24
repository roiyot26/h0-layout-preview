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

  // Base slate-bronze feather vane gradient with burnished gold/amber terminal tip (top of UV)
  const vaneGrad = ctx.createLinearGradient(0, 0, 0, h);
  vaneGrad.addColorStop(0.00, '#FFE08A'); // Bright burnished gold tip
  vaneGrad.addColorStop(0.16, '#E89E38'); // Amber-gold sub-terminal band
  vaneGrad.addColorStop(0.30, '#2CE6D8'); // Thin iridescent kingfisher-cyan spec band
  vaneGrad.addColorStop(0.42, '#5E4B38'); // Warm bronze mid-vane
  vaneGrad.addColorStop(0.75, '#364052'); // Slate-indigo inner vane
  vaneGrad.addColorStop(1.00, '#242B38'); // Basal downy covert base
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
    const isGoldTipZone = t < 0.25;
    ctx.strokeStyle = isGoldTipZone
      ? (isHighlightBarb ? 'rgba(255, 244, 198, 0.85)' : 'rgba(184, 118, 28, 0.75)')
      : (isHighlightBarb ? 'rgba(216, 188, 136, 0.62)' : 'rgba(22, 28, 38, 0.72)');
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
  ctx.fillStyle = '#F6EAD2';
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
    const sapColor = isCyanSap ? 'rgba(44, 230, 216, 0.85)' : 'rgba(255, 184, 77, 0.85)';

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
    laminaGrad.addColorStop(0.0, 'rgba(255, 210, 112, 0.98)');
    laminaGrad.addColorStop(0.45, 'rgba(196, 152, 58, 0.95)');
    laminaGrad.addColorStop(0.82, 'rgba(68, 128, 66, 0.94)');
    laminaGrad.addColorStop(1.0, 'rgba(42, 92, 48, 0.92)');
  } else {
    laminaGrad.addColorStop(0.0, 'rgba(168, 255, 244, 0.98)');
    laminaGrad.addColorStop(0.45, 'rgba(44, 214, 198, 0.95)');
    laminaGrad.addColorStop(0.82, 'rgba(38, 136, 118, 0.94)');
    laminaGrad.addColorStop(1.0, 'rgba(28, 88, 76, 0.92)');
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
      ctx.strokeStyle = palette === 'gold' ? '#FFF1BA' : '#D8FFF9';
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
    c.fillStyle = idx === 2 ? '#FFFFFF' : (palette === 'gold' ? '#FFF6CE' : '#E6FFFC');
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

  // 1. Sculpted aerodynamic torso & breast along +Z
  const torsoGeo = new THREE.CylinderGeometry(0.018, 0.036, 0.16, 12);
  torsoGeo.rotateX(Math.PI / 2);
  torsoGeo.scale(1.05, 0.88, 1.0);
  const torsoMesh = new THREE.Mesh(torsoGeo, matBody);
  birdGroup.add(torsoMesh);

  const breastGeo = new THREE.SphereGeometry(0.035, 12, 10);
  breastGeo.scale(0.95, 0.82, 1.35);
  const breastMesh = new THREE.Mesh(breastGeo, featherMat);
  breastMesh.position.set(0, -0.004, 0.035);
  birdGroup.add(breastMesh);

  // Dorsal mantle covert cape
  const mantleGeo = new THREE.SphereGeometry(0.034, 12, 10);
  mantleGeo.scale(1.05, 0.55, 1.45);
  const mantleMesh = new THREE.Mesh(mantleGeo, featherMat);
  mantleMesh.position.set(0, 0.016, 0.02);
  birdGroup.add(mantleMesh);

  // 2. Sculpted Falcon Head, Brow Ridge, Eyes & Hooked Golden Beak at +Z
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.014, 0.092);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 10), matBody);
  skull.scale.set(0.92, 0.88, 1.18);
  headGroup.add(skull);

  for (let side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 8, 8), matGoldTip);
    eye.position.set(side * 0.018, 0.004, 0.012);
    headGroup.add(eye);
  }

  const beakGeo = new THREE.ConeGeometry(0.011, 0.044, 8);
  beakGeo.rotateX(Math.PI * 0.55);
  const beakMesh = new THREE.Mesh(beakGeo, matGoldTip);
  beakMesh.position.set(0, -0.002, 0.036);
  headGroup.add(beakMesh);
  birdGroup.add(headGroup);

  // 3. Tucked Golden Talons underneath torso
  for (let side of [-1, 1]) {
    const talon = new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.032, 6), matGoldTip);
    talon.rotation.x = -Math.PI * 0.38;
    talon.position.set(side * 0.016, -0.028, -0.025);
    birdGroup.add(talon);
  }

  // 4. Fanned 9-Feather Tail (Rectrices) at -Z rear
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 0.006, -0.078);
  const tailBladeGeo = new THREE.BoxGeometry(0.018, 0.0028, 0.095);
  for (let t = -4; t <= 4; t++) {
    const absT = Math.abs(t);
    const fLen = 1.0 - absT * 0.045;
    const tailFeather = new THREE.Mesh(
      tailBladeGeo,
      absT >= 3 ? matGoldTip : featherMat
    );
    tailFeather.scale.set(1.0, 1.0, fLen);
    tailFeather.position.set(t * 0.0085, absT * 0.001, -0.038 * fLen);
    tailFeather.rotation.y = t * 0.105;
    tailFeather.rotation.z = t * -0.03;
    tailGroup.add(tailFeather);
  }
  birdGroup.add(tailGroup);

  // 5. Multi-Layered Articulated Wings (15 Individual Sculpted Feather Blades per Wing!)
  const primaryBladeGeo = new THREE.BoxGeometry(0.024, 0.0026, 0.145);
  const secondaryBladeGeo = new THREE.BoxGeometry(0.026, 0.0030, 0.105);
  const covertBladeGeo = new THREE.BoxGeometry(0.028, 0.0034, 0.058);

  function buildFeatheredWing(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.022, 0.012, 0.018);

    // Leading-edge muscular wing spar (radius/ulna + carpometacarpus)
    const innerSpar = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.010, 0.13, 8), matBody);
    innerSpar.rotation.z = side * -Math.PI / 2;
    innerSpar.position.set(side * 0.062, 0.005, 0.018);
    pivot.add(innerSpar);

    const outerSpar = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.007, 0.14, 8), matGoldTip);
    outerSpar.rotation.z = side * -Math.PI / 2;
    outerSpar.rotation.y = side * -0.24;
    outerSpar.position.set(side * 0.185, 0.006, 0.002);
    pivot.add(outerSpar);

    // Layer A: 7 Overlapping Secondary Flight Feathers along inner forearm (ulna)
    for (let s = 0; s < 7; s++) {
      const u = s / 6;
      const spanX = side * (0.024 + u * 0.095);
      const chordLen = 0.92 + Math.sin(u * Math.PI) * 0.14;
      const secFeather = new THREE.Mesh(secondaryBladeGeo, featherMat);
      secFeather.scale.set(1.0, 1.0, chordLen);
      secFeather.position.set(spanX, 0.002 + (s % 2) * 0.0008, -0.026 * chordLen);
      secFeather.rotation.y = side * (-0.06 - u * 0.12);
      secFeather.rotation.x = 0.06; // subtle aerodynamic camber
      pivot.add(secFeather);

      // Upper Greater Wing Covert shingle overlapping the base of each secondary feather
      const covFeather = new THREE.Mesh(covertBladeGeo, s % 2 === 0 ? matBody : matGoldTip);
      covFeather.position.set(spanX, 0.0065, -0.002);
      covFeather.rotation.y = side * (-0.05 - u * 0.10);
      covFeather.rotation.x = 0.10;
      pivot.add(covFeather);
    }

    // Layer B: 8 Long Swept Primary Flight Feathers (Remiges) fanned at the outer hand wing
    for (let p = 0; p < 8; p++) {
      const v = p / 7;
      const spanX = side * (0.122 + v * 0.145);
      const lenScale = 0.88 + Math.sin(v * Math.PI * 0.85) * 0.28;
      // Outer primaries have slotted emarginated tips catching the wind & golden light
      const isOuterGoldPrimary = p >= 4;
      const primFeather = new THREE.Mesh(
        primaryBladeGeo,
        isOuterGoldPrimary ? featherMat : featherMat
      );
      primFeather.scale.set(0.92 - v * 0.22, 1.0, lenScale);
      primFeather.position.set(
        spanX,
        0.004 + v * 0.008,
        -0.028 - v * 0.024
      );
      // Fan the primaries outward from wrist like a real soaring falcon/eagle
      primFeather.rotation.y = side * (-0.22 - v * 0.58);
      primFeather.rotation.z = side * (v * 0.09);
      primFeather.rotation.x = 0.04 - v * 0.05;
      pivot.add(primFeather);

      // Golden rachis quill highlight along each primary feather
      const rachis = new THREE.Mesh(
        new THREE.BoxGeometry(0.0032, 0.0038, 0.135 * lenScale),
        matGoldTip
      );
      rachis.position.copy(primFeather.position);
      rachis.position.y += 0.0012;
      rachis.rotation.copy(primFeather.rotation);
      pivot.add(rachis);
    }

    return pivot;
  }

  const leftWing = buildFeatheredWing(-1);
  const rightWing = buildFeatheredWing(1);
  birdGroup.add(leftWing, rightWing);

  return { birdGroup, leftWing, rightWing, tailGroup, headGroup };
}

/**
 * ROUND 4 HYPERREALISM (THE KAGE WORLD-TREE):
 * Builds a delicate 4-Winged Bioluminescent Dragonfly / Forest Insect with
 * translucent veined forewings & hindwings and a glowing cyan/gold lantern abdomen.
 */
function createLuminousDragonfly(THREE, { matBody, matGlow, matWing, scale = 1.0 }) {
  const dfGroup = new THREE.Group();
  dfGroup.scale.setScalar(scale);

  // Thorax + slender segmented bioluminescent abdomen
  const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), matBody);
  thorax.scale.set(0.8, 0.8, 1.4);
  dfGroup.add(thorax);

  const abdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.002, 0.075, 6), matGlow);
  abdomen.rotation.x = Math.PI / 2;
  abdomen.position.set(0, 0, -0.042);
  dfGroup.add(abdomen);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), matGlow);
  head.position.set(0, 0.002, 0.016);
  dfGroup.add(head);

  // 4 Iridescent Veined Wings (Forewings + Hindwings)
  const wingGeo = new THREE.PlaneGeometry(0.085, 0.018);
  const wings = [];
  for (let side of [-1, 1]) {
    for (let pair of [0, 1]) {
      const wPivot = new THREE.Group();
      wPivot.position.set(side * 0.006, 0.005, 0.006 - pair * 0.012);
      const wMesh = new THREE.Mesh(wingGeo, matWing);
      wMesh.position.set(side * 0.042, 0, 0);
      wMesh.rotation.x = Math.PI / 2;
      wMesh.rotation.z = side * (pair === 0 ? -0.18 : 0.16);
      wPivot.add(wMesh);
      dfGroup.add(wPivot);
      wings.push({ pivot: wPivot, side, pair });
    }
  }

  return { dfGroup, wings };
}

/**
 * Builds a recessed 4-layer 3D Gothic/Arch Window Assembly + Round 3 Damp Sill Weathering:
 * 1. Stone voussoir arch hood + sill + side jambs
 * 2. Deep recessed glowing interior pocket
 * 3. Vertical stone/brass mullions + horizontal transoms + diamond leaded cames
 * 4. Angled hinged shutters
 */
function createDetailedWindowAssembly(THREE, {
  width = 0.095,
  height = 0.19,
  matStoneFrame,
  matMullion,
  matGlow
}) {
  const winGrp = new THREE.Group();

  // 1. Outer chiseled stone surround jambs + sill + arch lintel
  const frameDepth = 0.030;
  const jambGeo = new THREE.BoxGeometry(0.017, height, frameDepth);
  const leftJamb = new THREE.Mesh(jambGeo, matStoneFrame);
  leftJamb.position.set(-width * 0.5, 0, 0);
  const rightJamb = new THREE.Mesh(jambGeo, matStoneFrame);
  rightJamb.position.set(width * 0.5, 0, 0);

  const sill = new THREE.Mesh(new THREE.BoxGeometry(width + 0.040, 0.020, frameDepth + 0.014), matStoneFrame);
  sill.position.set(0, -height * 0.5 - 0.006, 0.005);

  // Pointed gothic arch voussoir hood + keystone
  const archHood = new THREE.Mesh(
    new THREE.TorusGeometry(width * 0.52, 0.014, 8, 14, Math.PI),
    matStoneFrame
  );
  archHood.position.set(0, height * 0.5, 0.003);

  const keystone = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.028, frameDepth + 0.010), matMullion);
  keystone.position.set(0, height * 0.5 + width * 0.52, 0.005);

  // 2. Recessed glowing interior lancet pane
  const pane = new THREE.Mesh(new THREE.BoxGeometry(width * 0.86, height * 0.92, 0.010), matGlow);
  pane.position.set(0, 0, -0.004);

  // 3. Center vertical mullion + two horizontal transoms
  const centerMullion = new THREE.Mesh(new THREE.BoxGeometry(0.008, height * 0.94, 0.019), matMullion);
  centerMullion.position.set(0, 0, 0.004);

  const transom1 = new THREE.Mesh(new THREE.BoxGeometry(width * 0.88, 0.008, 0.019), matMullion);
  transom1.position.set(0, height * 0.16, 0.004);
  const transom2 = new THREE.Mesh(new THREE.BoxGeometry(width * 0.88, 0.008, 0.019), matMullion);
  transom2.position.set(0, -height * 0.18, 0.004);

  // 4. Hinged side shutters angled slightly open
  const shutterGeo = new THREE.BoxGeometry(width * 0.36, height * 0.82, 0.007);
  const leftShutter = new THREE.Mesh(shutterGeo, matMullion);
  leftShutter.position.set(-width * 0.62, -0.01, 0.013);
  leftShutter.rotation.y = -0.38;
  const rightShutter = new THREE.Mesh(shutterGeo, matMullion);
  rightShutter.position.set(width * 0.62, -0.01, 0.013);
  rightShutter.rotation.y = 0.38;

  winGrp.add(leftJamb, rightJamb, sill, archHood, keystone, pane, centerMullion, transom1, transom2, leftShutter, rightShutter);
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
  renderer.toneMappingExposure = 1.66; // Lifted exposure so every brick, feather barb, bark groove & leaf vein shines
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const maxAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy() || 16, 16);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x131B29);
  scene.fog = new THREE.FogExp2(0x151E2E, 0.021); // Luminous twilight-blue atmospheric fog

  // Lifted PMREM Study Environment (brightens stone midtones & makes brass/copper gleam)
  scene.environment = createDarkStudyEnvironment(THREE, renderer);
  scene.environmentIntensity = 1.18;

  // Twilight-Gold & Cerulean Atmospheric Horizon Sky Dome so silhouettes pop crisply
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 512;
  skyCanvas.height = 256;
  const sctx = skyCanvas.getContext('2d');
  const skyGrad = sctx.createLinearGradient(0, 0, 0, 256);
  skyGrad.addColorStop(0.00, '#0D1320');
  skyGrad.addColorStop(0.45, '#1A263B');
  skyGrad.addColorStop(0.76, '#2B3B54');
  skyGrad.addColorStop(0.92, '#4A423C');
  skyGrad.addColorStop(1.00, '#18202E');
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

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio),
    0.14, // crisp controlled bloom so individual leaf veins, feather barbs & gear teeth stay razor-sharp
    0.28,
    0.90
  );
  composer.addPass(bloomPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  // --- ROUND 1: BRIGHTENED MULTI-DIRECTIONAL ARCHITECTURAL & BOTANICAL LIGHTING ---
  const ambientLight = new THREE.HemisphereLight(0x5A729A, 0x242C3A, 1.58);
  scene.add(ambientLight);

  // 2900K Overhead Citadel Astrolabe Key Light with 2048x2048 high-res shadow map
  const astrolabeKeyLight = new THREE.DirectionalLight(0xFFC870, 3.45);
  astrolabeKeyLight.position.set(4.2, 10.5, 5.2);
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

  // Dedicated Raking/Grazing Directional Fill Light so brick courses, chisel marks, bark grooves & feathers pop
  const grazingFillLight = new THREE.DirectionalLight(0xFFE0A8, 1.85);
  grazingFillLight.position.set(5.5, 3.8, 6.2);
  scene.add(grazingFillLight);

  // Cool Cerulean Rim Counter-Light from NNW for sculptural separation
  const ceruleanRimLight = new THREE.DirectionalLight(0x68C8FF, 1.25);
  ceruleanRimLight.position.set(-5.0, 5.5, -6.0);
  scene.add(ceruleanRimLight);

  // 2900K Canopy Synaptic Point Light
  const canopyGoldLight = new THREE.PointLight(0xFFC45C, 3.85, 13.0, 1.35);
  canopyGoldLight.position.set(0, 3.15, 0.25);
  scene.add(canopyGoldLight);

  // Dedicated Kage World-Tree Trunk & Moss Front/Side Uplights (for ?view=kage hyperreal bark & veined leaves)
  const kageBarkKeyLight = new THREE.PointLight(0xFFE29E, 3.45, 7.5, 1.35);
  kageBarkKeyLight.position.set(0.65, 1.85, 1.65);
  scene.add(kageBarkKeyLight);

  // 4800K Milled Groove Cyan Bounce Lights
  const rootCyanLight = new THREE.PointLight(0x2CE6D8, 4.1, 11.0, 1.35);
  rootCyanLight.position.set(0.65, 0.75, 0.75);
  scene.add(rootCyanLight);

  // Dedicated City Citadel Uplight + Grazing Fill Light (for ?view=closeup bricks, windows & falcons)
  const cityCyanLight = new THREE.PointLight(0x3CF2E4, 3.4, 8.0, 1.4);
  cityCyanLight.position.set(2.35, 1.45, 1.95);
  scene.add(cityCyanLight);

  const cityWarmUplight = new THREE.PointLight(0xFFD084, 3.5, 8.5, 1.35);
  cityWarmUplight.position.set(3.25, 2.05, 3.15);
  scene.add(cityWarmUplight);

  // Dedicated Bootcamp Basalt Cliffs & Lighthouse Fill Light (for ?view=bootcamp)
  const bootcampWarmLight = new THREE.PointLight(0xFFD288, 3.3, 9.0, 1.35);
  bootcampWarmLight.position.set(2.15, 1.75, -1.45);
  scene.add(bootcampWarmLight);

  // 2100K Workshop Furnace Hearth Light
  const furnaceEmberLight = new THREE.PointLight(0xFF7B3B, 3.6, 9.0, 1.45);
  furnaceEmberLight.position.set(-3.1, 1.15, 1.35);
  scene.add(furnaceEmberLight);

  // --- 60 / 30 / 10 PHYSICAL MATERIALS (WITH 16x ANISOTROPY & LIFTED ALBEDOS) ---
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

  // 60% Base: Matte Volcanic Obsidian Table & Brightened Chiseled Limestone/Granite/Concrete
  const matObsidianCarved = new THREE.MeshStandardMaterial({
    color: 0xD8DFEA,
    map: tableColorTex,
    bumpMap: tableBumpTex,
    bumpScale: 0.045,
    roughness: 0.78,
    metalness: 0.06
  });

  const matObsidianSolid = new THREE.MeshStandardMaterial({
    color: 0x465062,
    map: masonryColorTex,
    bumpMap: masonryBumpTex,
    bumpScale: 0.105,
    roughnessMap: masonryRoughTex,
    roughness: 0.78,
    metalness: 0.08
  });

  const matMilledTrench = new THREE.MeshStandardMaterial({
    color: 0x0D1118,
    roughness: 0.90,
    metalness: 0.04
  });

  const matSlateBootcamp = new THREE.MeshStandardMaterial({
    color: 0x5B677C,
    map: masonryColorTex,
    bumpMap: masonryBumpTex,
    bumpScale: 0.095,
    roughnessMap: masonryRoughTex,
    roughness: 0.72,
    metalness: 0.10
  });

  const matArchitecturalConcrete = new THREE.MeshStandardMaterial({
    color: 0x7A8599,
    map: masonryColorTex,
    bumpMap: masonryBumpTex,
    bumpScale: 0.105,
    roughnessMap: masonryRoughTex,
    roughness: 0.76,
    metalness: 0.06
  });

  const matTravertineCampus = new THREE.MeshStandardMaterial({
    color: 0xEFE7D8,
    map: masonryColorTex,
    bumpMap: masonryBumpTex,
    bumpScale: 0.068,
    roughness: 0.64,
    metalness: 0.04
  });

  // ROUND 4 MATERIALS: Deep-Grooved Mossy Kage Bark, Cushioned Emerald Moss & Translucent Veined Leaves
  const matKageGnarledBark = new THREE.MeshStandardMaterial({
    color: 0xC8B8A6,
    map: barkColorTex,
    bumpMap: barkBumpTex,
    bumpScale: 0.145,
    roughnessMap: barkRoughTex,
    roughness: 0.84,
    metalness: 0.05,
    emissive: 0xFFFFFF,
    emissiveMap: barkEmissiveTex,
    emissiveIntensity: 0.55
  });

  const matKageVelvetMoss = new THREE.MeshStandardMaterial({
    color: 0x3D8549,
    bumpMap: barkBumpTex,
    bumpScale: 0.085,
    roughness: 0.92,
    metalness: 0.02,
    emissive: 0x16381E,
    emissiveIntensity: 0.25
  });

  const matTranslucentLeafGold = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    map: leafGoldColorTex,
    emissive: 0xFFFFFF,
    emissiveMap: leafGoldEmissiveTex,
    emissiveIntensity: 0.78,
    bumpMap: leafGoldBumpTex,
    bumpScale: 0.035,
    roughness: 0.36,
    metalness: 0.04,
    alphaTest: 0.20,
    transparent: true,
    side: THREE.DoubleSide
  });

  const matTranslucentLeafCyan = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    map: leafCyanColorTex,
    emissive: 0xFFFFFF,
    emissiveMap: leafCyanEmissiveTex,
    emissiveIntensity: 0.82,
    bumpMap: leafCyanBumpTex,
    bumpScale: 0.035,
    roughness: 0.34,
    metalness: 0.04,
    alphaTest: 0.20,
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

  // ==========================================================================
  // ROUND 4 HYPERREALISM: THE CENTERPIECE KAGE WORLD-TREE (GRP_Station_02_Kage / STN_02_Kage)
  // 1. Deep-Grooved Gnarled Bark Central Trunk + 8 Flaring Root Buttresses + Velvet Moss
  // 2. Realistic Multi-Order Branch Tapering (Primary Boughs -> Secondary Limbs -> Tertiary Twigs)
  // 3. 1,680 Individual Translucent Leaves with Glowing Midrib & Lateral Vein Structure
  // 4. Interacting Tree Songbirds/Falcons & 18 4-Winged Bioluminescent Dragonflies
  // ==========================================================================
  const kageTreeGroup = new THREE.Group();
  kageTreeGroup.name = 'GRP_Station_02_Kage';
  worldGroup.add(kageTreeGroup);

  const stn02KageCore = new THREE.Group();
  stn02KageCore.name = 'STN_02_Kage';
  kageTreeGroup.add(stn02KageCore);

  // Helper to build a tapered, gnarled botanical trunk/branch mesh along a 3D CatmullRomCurve3
  function buildTaperedBarkBranch(curve, rStart, rEnd, radialSegs, tubularSegs, mat, fluteAmp = 0.14) {
    const frames = curve.computeFrenetFrames(tubularSegs, false);
    const pos = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i <= tubularSegs; i++) {
      const u = i / tubularSegs;
      const pt = curve.getPointAt(u);
      const N = frames.normals[i];
      const B = frames.binormals[i];
      const baseR = THREE.MathUtils.lerp(rStart, rEnd, Math.pow(u, 0.82));

      for (let j = 0; j <= radialSegs; j++) {
        const v = j / radialSegs;
        const theta = v * Math.PI * 2;
        // Deep organic longitudinal bark flutes & twisting root-flare ridges
        const flute = 1.0
          + fluteAmp * Math.sin(theta * 7.0 + u * 8.5)
          + (fluteAmp * 0.55) * Math.cos(theta * 13.0 - u * 6.0);
        const r = baseR * flute;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        const vx = pt.x + r * (cosT * N.x + sinT * B.x);
        const vy = pt.y + r * (cosT * N.y + sinT * B.y);
        const vz = pt.z + r * (cosT * N.z + sinT * B.z);
        pos.push(vx, vy, vz);
        uvs.push(v * 2.0, u * 3.0);
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

  // 4A. Sculpted Deep-Grooved Central Gnarled Trunk Core (y = 0.14 -> 2.18)
  const centralTrunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.00, 0.12, 0.00),
    new THREE.Vector3(0.03, 0.55, 0.04),
    new THREE.Vector3(-0.04, 1.08, 0.02),
    new THREE.Vector3(0.02, 1.58, -0.02),
    new THREE.Vector3(0.00, 2.12, 0.02)
  ]);
  const centralTrunkMesh = buildTaperedBarkBranch(
    centralTrunkCurve,
    0.42, // thick fluted root base
    0.22, // muscular upper crown bole
    28,
    32,
    matKageGnarledBark,
    0.18
  );
  stn02KageCore.add(centralTrunkMesh);

  // 4B. 8 Thick Gnarled Buttress Roots + Primary -> Secondary -> Tertiary Tapering Branches
  const leafAnchorPoints = []; // Stores { pos, dir } along secondary/tertiary twigs for 1,680 veined leaves!

  const primaryBoughCount = 8;
  for (let b = 0; b < primaryBoughCount; b++) {
    const baseAngle = (b / primaryBoughCount) * Math.PI * 2 + 0.18;

    // Gnarled Flaring Buttress Root anchoring into the sunken Astrolabe well (y = 0.14 -> 1.35)
    const rootCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(baseAngle) * 1.05, 0.14, Math.sin(baseAngle) * 1.05),
      new THREE.Vector3(Math.cos(baseAngle + 0.14) * 0.64, 0.42, Math.sin(baseAngle + 0.14) * 0.64),
      new THREE.Vector3(Math.cos(baseAngle + 0.28) * 0.34, 0.86, Math.sin(baseAngle + 0.28) * 0.34),
      new THREE.Vector3(Math.cos(baseAngle + 0.42) * 0.24, 1.38, Math.sin(baseAngle + 0.42) * 0.24)
    ]);
    stn02KageCore.add(
      buildTaperedBarkBranch(rootCurve, 0.135, 0.058, 14, 18, matKageGnarledBark, 0.16)
    );

    // Velvety Emerald Moss Cushions nestled in the root-flare hollows & bark crevices
    for (let m = 0; m < 3; m++) {
      const mPt = rootCurve.getPointAt(0.18 + m * 0.28);
      const mossPad = new THREE.Mesh(new THREE.SphereGeometry(0.068 - m * 0.012, 10, 8), matKageVelvetMoss);
      mossPad.scale.set(1.35, 0.58, 1.85);
      mossPad.position.set(mPt.x * 1.04, mPt.y + 0.032, mPt.z * 1.04);
      mossPad.rotation.y = -baseAngle;
      stn02KageCore.add(mossPad);
    }

    // Order-1 Primary Bough arching from upper trunk crown (y = 1.48 -> 2.68, radius tapering 0.115 -> 0.052)
    const pAngle = baseAngle + 0.35;
    const primaryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(pAngle) * 0.18, 1.46, Math.sin(pAngle) * 0.18),
      new THREE.Vector3(Math.cos(pAngle + 0.12) * 0.38, 1.88, Math.sin(pAngle + 0.12) * 0.38),
      new THREE.Vector3(Math.cos(pAngle + 0.20) * 0.78, 2.34, Math.sin(pAngle + 0.20) * 0.78),
      new THREE.Vector3(Math.cos(pAngle + 0.26) * 1.28, 2.64, Math.sin(pAngle + 0.26) * 1.28),
      new THREE.Vector3(Math.cos(pAngle + 0.30) * 1.68, 2.58, Math.sin(pAngle + 0.30) * 1.68)
    ]);
    stn02KageCore.add(
      buildTaperedBarkBranch(primaryCurve, 0.115, 0.048, 14, 20, matKageGnarledBark, 0.14)
    );

    // Moss cushion on top of the primary bough crotch
    const crotchPt = primaryCurve.getPointAt(0.32);
    const boughMoss = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), matKageVelvetMoss);
    boughMoss.scale.set(1.2, 0.52, 2.1);
    boughMoss.position.set(crotchPt.x, crotchPt.y + 0.045, crotchPt.z);
    boughMoss.rotation.y = -pAngle;
    stn02KageCore.add(boughMoss);

    // Order-2 Secondary Limbs (3 forked secondary limbs per primary bough, radius tapering 0.048 -> 0.020)
    for (let s = 0; s < 3; s++) {
      const uStart = 0.34 + s * 0.24;
      const startPt = primaryCurve.getPointAt(uStart);
      const sideSign = s % 2 === 0 ? 1 : -1;
      const secAngle = pAngle + 0.22 + sideSign * (0.34 + s * 0.12);
      const secReach = 0.52 + s * 0.16;

      const secCurve = new THREE.CatmullRomCurve3([
        startPt.clone(),
        new THREE.Vector3(
          startPt.x + Math.cos(secAngle) * secReach * 0.48,
          startPt.y + 0.18 - s * 0.04,
          startPt.z + Math.sin(secAngle) * secReach * 0.48
        ),
        new THREE.Vector3(
          startPt.x + Math.cos(secAngle + sideSign * 0.15) * secReach,
          startPt.y + 0.22 - s * 0.09,
          startPt.z + Math.sin(secAngle + sideSign * 0.15) * secReach
        )
      ]);
      stn02KageCore.add(
        buildTaperedBarkBranch(secCurve, 0.046, 0.018, 10, 12, matKageGnarledBark, 0.10)
      );

      for (let lp = 1; lp <= 5; lp++) {
        const lu = lp / 5;
        leafAnchorPoints.push({
          pos: secCurve.getPointAt(lu),
          dir: secCurve.getTangentAt(lu)
        });
      }

      // Order-3 Tertiary Branches & Fine Twigs (3 fine twigs per secondary limb, radius tapering 0.018 -> 0.005)
      for (let tw = 0; tw < 3; tw++) {
        const twU = 0.38 + tw * 0.28;
        const twStart = secCurve.getPointAt(twU);
        const twSign = tw % 2 === 0 ? -1 : 1;
        const twAngle = secAngle + twSign * (0.42 + tw * 0.15);
        const twLen = 0.28 + (tw % 2) * 0.12;

        const twigCurve = new THREE.CatmullRomCurve3([
          twStart.clone(),
          new THREE.Vector3(
            twStart.x + Math.cos(twAngle) * twLen * 0.55,
            twStart.y + 0.06 - tw * 0.04,
            twStart.z + Math.sin(twAngle) * twLen * 0.55
          ),
          new THREE.Vector3(
            twStart.x + Math.cos(twAngle + twSign * 0.2) * twLen,
            twStart.y - 0.04 - tw * 0.06,
            twStart.z + Math.sin(twAngle + twSign * 0.2) * twLen
          )
        ]);
        stn02KageCore.add(
          buildTaperedBarkBranch(twigCurve, 0.017, 0.0045, 7, 8, matKageGnarledBark, 0.06)
        );

        for (let tp = 1; tp <= 4; tp++) {
          const tu = tp / 4;
          leafAnchorPoints.push({
            pos: twigCurve.getPointAt(tu),
            dir: twigCurve.getTangentAt(tu)
          });
        }
      }
    }
  }

  // Interwoven Bioluminescent Optical Root Veins & Golden Capillaries hugging the gnarled mossy bark
  const totalStrands = 36;
  for (let i = 0; i < totalStrands; i++) {
    const angle0 = (i / totalStrands) * Math.PI * 2;
    const isStructuralArmature = i % 3 === 0;
    const isCyanVein = i % 3 === 1;
    const boughCluster = i % 8;
    const boughAngle = (boughCluster / 8) * Math.PI * 2 + 0.18;

    const pts = [];
    const steps = 16;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const y = 0.14 + t * 2.75;
      const rootFlare = Math.pow(1.0 - t, 2.8) * 0.78;
      const waist = 0.23 + Math.sin(t * Math.PI) * 0.08;
      const canopySpread = Math.pow(t, 2.5) * 1.62;
      const r = rootFlare + waist * (1.0 - t * 0.55) + canopySpread;

      const twist = angle0 + t * Math.PI * 1.25 + Math.sin(t * 4.5 + i) * 0.12;
      const finalAngle = THREE.MathUtils.lerp(twist, boughAngle + ((i % 6 - 2.5) * 0.055), Math.pow(t, 1.6));
      const archDrop = t > 0.78 ? Math.pow((t - 0.78) / 0.22, 2.0) * 0.24 : 0;

      pts.push(new THREE.Vector3(
        Math.cos(finalAngle) * r,
        y - archDrop,
        Math.sin(finalAngle) * r
      ));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const radius = isStructuralArmature ? 0.022 : (isCyanVein ? 0.012 : 0.009);
    const tubeGeo = new THREE.TubeGeometry(curve, 20, radius, 6, false);
    const mat = isStructuralArmature
      ? matSpecularBrass
      : (isCyanVein ? matCyanRoot : matGoldCanopy);
    stn02KageCore.add(new THREE.Mesh(tubeGeo, mat));
  }

  // 5 Machined Brass Ferrule Ligature Collars with Hex Bolts Binding the Mossy Trunk
  const collarSpecs = [
    { y: 0.56, r: 0.52 },
    { y: 1.02, r: 0.36 },
    { y: 1.48, r: 0.30 },
    { y: 1.94, r: 0.38 },
    { y: 2.40, r: 0.62 }
  ];
  collarSpecs.forEach((cs) => {
    const collar = new THREE.Mesh(new THREE.TorusGeometry(cs.r, 0.030, 10, 32), matSpecularBrass);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = cs.y;
    stn02KageCore.add(collar);

    for (let k = 0; k < 6; k++) {
      const ka = (k / 6) * Math.PI * 2;
      const lug = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.062, 0.082), matAgedBrass);
      lug.position.set(Math.cos(ka) * cs.r, cs.y, Math.sin(ka) * cs.r);
      lug.rotation.y = -ka;
      stn02KageCore.add(lug);
    }
  });

  // 4C. 1,680 Individual 3D Cambered Translucent Leaves with Glowing Midrib & Lateral Veins!
  const leafGeo = new THREE.PlaneGeometry(0.115, 0.175, 3, 4);
  const lPosAttr = leafGeo.attributes.position;
  for (let vi = 0; vi < lPosAttr.count; vi++) {
    const lx = lPosAttr.getX(vi);
    const ly = lPosAttr.getY(vi);
    // Shift pivot to petiole base and add natural botanical V-fold + graceful tip droop
    const normY = (ly / 0.175) + 0.5;
    const archZ = Math.sin(normY * Math.PI) * 0.022 + Math.abs(lx) * 0.18;
    lPosAttr.setY(vi, normY * 0.175);
    lPosAttr.setZ(vi, archZ);
  }
  leafGeo.computeVertexNormals();

  const goldLeafCount = 1160;
  const cyanLeafCount = 520;
  const goldLeavesInst = new THREE.InstancedMesh(leafGeo, matTranslucentLeafGold, goldLeafCount);
  const cyanLeavesInst = new THREE.InstancedMesh(leafGeo, matTranslucentLeafCyan, cyanLeafCount);
  goldLeavesInst.name = 'INST_Kage_Translucent_Gold_Veined_Leaves';
  cyanLeavesInst.name = 'INST_Kage_Translucent_Cyan_Veined_Leaves';

  const _leafDummy = new THREE.Object3D();
  let lSeed = 9001;
  const lRand = () => {
    lSeed = (lSeed * 16807) % 2147483647;
    return (lSeed - 1) / 2147483646;
  };

  function populateLeafInstances(instMesh, count) {
    for (let i = 0; i < count; i++) {
      const anchor = leafAnchorPoints[i % leafAnchorPoints.length];
      // Arrange in phyllotaxis rosettes around the tapering branches and lower weeping crown
      const rosetteAngle = i * 2.39996; // Golden angle 137.5 deg
      const radialSpread = 0.025 + lRand() * 0.18;
      const verticalSpread = (lRand() - 0.42) * 0.22;

      _leafDummy.position.set(
        anchor.pos.x + Math.cos(rosetteAngle) * radialSpread,
        anchor.pos.y + verticalSpread,
        anchor.pos.z + Math.sin(rosetteAngle) * radialSpread
      );

      _leafDummy.rotation.set(
        0.38 + (lRand() - 0.5) * 0.85,
        rosetteAngle + (lRand() - 0.5) * 0.6,
        (lRand() - 0.5) * 0.65
      );

      const s = 0.68 + lRand() * 0.72;
      _leafDummy.scale.set(s, s * (0.9 + lRand() * 0.3), s);
      _leafDummy.updateMatrix();
      instMesh.setMatrixAt(i, _leafDummy.matrix);
    }
    instMesh.instanceMatrix.needsUpdate = true;
  }

  populateLeafInstances(goldLeavesInst, goldLeafCount);
  populateLeafInstances(cyanLeavesInst, cyanLeafCount);
  stn02KageCore.add(goldLeavesInst, cyanLeavesInst);

  // 56 Weeping-Willow Catenary Fiber Curtains + Faceted Teardrop Optical Condensers
  const canopyGroup = new THREE.Group();
  stn02KageCore.add(canopyGroup);

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
    // Lower battered stone & board-formed concrete keep body
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(w, lowerH, w), isHero ? matArchitecturalConcrete : matObsidianSolid);
    lowerBody.position.y = lowerH / 2;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    tGrp.add(lowerBody);

    // Chiseled limestone & brass belt course
    const waistCornice = new THREE.Mesh(new THREE.BoxGeometry(w + 0.09, 0.065, w + 0.09), matTravertineCampus);
    waistCornice.position.y = lowerH;
    tGrp.add(waistCornice);

    const upperW = w * 0.85;
    const upperBody = new THREE.Mesh(new THREE.BoxGeometry(upperW, upperH, upperW), matSlateBootcamp);
    upperBody.position.y = lowerH + upperH / 2;
    upperBody.castShadow = true;
    upperBody.receiveShadow = true;
    tGrp.add(upperBody);

    // Alternating protruding corner Quoin Stones (rusticated ashlar corner blocks)
    const quoinCourses = isHero ? 14 : 9;
    for (let q = 0; q < quoinCourses; q++) {
      const qy = 0.07 + (q / quoinCourses) * (h - 0.12);
      const isUpper = qy > lowerH;
      const curW = isUpper ? upperW : w;
      const qLong = (q % 2 === 0) ? 0.095 : 0.062;
      const qShort = (q % 2 === 0) ? 0.062 : 0.095;
      const qHeight = (h / quoinCourses) * 0.76;
      const quoinMat = q % 3 === 0 ? matTravertineCampus : matArchitecturalConcrete;

      for (let cx of [-1, 1]) {
        for (let cz of [-1, 1]) {
          const quoin = new THREE.Mesh(new THREE.BoxGeometry(qLong, qHeight, qShort), quoinMat);
          quoin.position.set(cx * (curW * 0.5 + 0.008), qy, cz * (curW * 0.5 + 0.008));
          quoin.castShadow = true;
          tGrp.add(quoin);
        }
      }
    }

    // 4-Layer 3D Mullioned Gothic Window Assemblies on all 4 facades
    const cols = isHero ? 3 : 2;
    const rows = isHero ? 4 : 3;
    for (let r = 0; r < rows; r++) {
      const wy = 0.22 + (r / rows) * (h - 0.36);
      const curW = wy < lowerH ? w : upperW;
      for (let c = 0; c < cols; c++) {
        const offset = (c - (cols - 1) / 2) * (curW * 0.31);
        const winMat = (r + c) % 3 === 0 ? matCyanRoot : matGoldCanopy;
        const winW = isHero ? 0.092 : 0.076;
        const winH = isHero ? 0.165 : 0.135;

        // +Z and -Z facades
        for (let sideZ of [-1, 1]) {
          const wAsm = createDetailedWindowAssembly(THREE, {
            width: winW,
            height: winH,
            matStoneFrame: matTravertineCampus,
            matMullion: matSpecularBrass,
            matGlow: winMat
          });
          wAsm.position.set(offset, wy, sideZ * (curW * 0.5 + 0.006));
          if (sideZ < 0) wAsm.rotation.y = Math.PI;
          tGrp.add(wAsm);
        }
        // +X and -X facades
        for (let sideX of [-1, 1]) {
          const wAsm = createDetailedWindowAssembly(THREE, {
            width: winW,
            height: winH,
            matStoneFrame: matTravertineCampus,
            matMullion: matSpecularBrass,
            matGlow: winMat
          });
          wAsm.position.set(sideX * (curW * 0.5 + 0.006), wy, offset);
          wAsm.rotation.y = sideX * (Math.PI / 2);
          tGrp.add(wAsm);
        }
      }
    }

    // Machicolation Corbel Brackets + Crenellated Battlement Parapet (individual Merlons & Crenels)
    const crown = new THREE.Mesh(new THREE.BoxGeometry(upperW + 0.11, 0.065, upperW + 0.11), matArchitecturalConcrete);
    crown.position.y = h;
    tGrp.add(crown);

    const merlonCount = isHero ? 5 : 4;
    const pSpan = upperW + 0.10;
    for (let m = 0; m < merlonCount; m++) {
      const mOff = (m / (merlonCount - 1) - 0.5) * (pSpan - 0.07);
      for (let side of [-1, 1]) {
        // Z-side merlons + corbels
        const merlonZ = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.085, 0.038), matTravertineCampus);
        merlonZ.position.set(mOff, h + 0.072, side * (pSpan * 0.5));
        const corbelZ = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.055, 0.042), matAgedBrass);
        corbelZ.position.set(mOff, h - 0.045, side * (pSpan * 0.5 + 0.01));
        // X-side merlons + corbels
        const merlonX = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.085, 0.062), matTravertineCampus);
        merlonX.position.set(side * (pSpan * 0.5), h + 0.072, mOff);
        const corbelX = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.055, 0.036), matAgedBrass);
        corbelX.position.set(side * (pSpan * 0.5 + 0.01), h - 0.045, mOff);
        tGrp.add(merlonZ, corbelZ, merlonX, corbelX);
      }
    }

    // 12-Course Shingled Conical Spire (tiered overlapping slate, copper & brass roof courses)
    const shingleCourses = 12;
    const baseConeR = upperW * 0.55;
    for (let sc = 0; sc < shingleCourses; sc++) {
      const t0 = sc / shingleCourses;
      const t1 = (sc + 1) / shingleCourses;
      const rBot = baseConeR * (1.0 - t0 * 0.92);
      const rTop = baseConeR * (1.0 - t1 * 0.92);
      const cH = (spireH / shingleCourses) * 1.18;
      const cY = h + 0.04 + t0 * spireH + cH * 0.5;
      const courseMat = sc % 3 === 0
        ? matSpecularBrass
        : (sc % 2 === 0 ? matSlateBootcamp : matWorkshopCopper);
      const courseCone = new THREE.Mesh(
        new THREE.CylinderGeometry(rTop, rBot, cH, 8 + (sc % 2) * 4),
        courseMat
      );
      courseCone.position.y = cY;
      courseCone.rotation.y = sc * 0.39;
      courseCone.castShadow = true;
      tGrp.add(courseCone);
    }

    for (let px of [-1, 1]) {
      for (let pz of [-1, 1]) {
        const pin = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.25, 4), matSpecularBrass);
        pin.position.set(px * (upperW * 0.48), h + 0.14, pz * (upperW * 0.48));
        tGrp.add(pin);

        // ROUND 3 MICRO-PROP: Carved Stone Gargoyle Waterspout projecting from each upper parapet corner
        const gargoyleSpout = new THREE.Mesh(
          new THREE.ConeGeometry(0.022, 0.125, 5),
          matTravertineCampus
        );
        gargoyleSpout.rotation.z = -px * Math.PI * 0.42;
        gargoyleSpout.rotation.y = pz > 0 ? 0.35 : -0.35;
        gargoyleSpout.position.set(px * (upperW * 0.56), h - 0.02, pz * (upperW * 0.56));
        tGrp.add(gargoyleSpout);
      }
    }

    // ROUND 3 MICRO-PROP: Wrought-Iron & Brass Wall Sconces with Glowing Warm Lanterns on Hero Keep & Major Towers
    if (isHero || h > 1.35) {
      for (let sideZ of [-1, 1]) {
        for (let sx of [-1, 1]) {
          const sconceGrp = new THREE.Group();
          sconceGrp.position.set(sx * (w * 0.36), lowerH * 0.62, sideZ * (w * 0.5 + 0.022));
          const arm = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.055), matAgedBrass);
          const lanternCage = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.014, 0.042, 6), matGoldCanopy);
          lanternCage.position.set(0, -0.022, sideZ * 0.020);
          sconceGrp.add(arm, lanternCage);
          tGrp.add(sconceGrp);
        }
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
    // Primary 2900K Astrolabe Sun Shafts slicing through Kage & The City's brick towers
    { x: 0.15, y: 3.1, z: 0.10, rTop: 0.42, rBot: 2.05, h: 6.2, rotZ: -0.26, rotX: 0.18, opacity: 0.14 },
    { x: 2.25, y: 2.8, z: 1.85, rTop: 0.28, rBot: 1.48, h: 5.4, rotZ: -0.28, rotX: 0.20, opacity: 0.16 },
    { x: 1.75, y: 2.5, z: 2.25, rTop: 0.22, rBot: 1.15, h: 4.8, rotZ: -0.25, rotX: 0.16, opacity: 0.13 },
    { x: -2.85, y: 2.4, z: 1.25, rTop: 0.24, rBot: 1.25, h: 4.8, rotZ: -0.24, rotX: 0.15, opacity: 0.11 },
    { x: -2.40, y: 2.3, z: -2.15, rTop: 0.22, rBot: 1.18, h: 4.6, rotZ: -0.22, rotX: 0.14, opacity: 0.10 }
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

  // Rotating Bootcamp Fresnel Volumetric Lighthouse Beam Cone
  const lighthouseBeamCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.68, 3.6, 24, 1, true),
    new THREE.MeshBasicMaterial({
      map: godRayTex,
      color: 0xFFB84D,
      transparent: true,
      opacity: 0.22,
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

  // Stratum 1: Low Coastal Sea Mist (y = 0.08..0.46) around Harbor, Bootcamp cliffs & Kage trenches
  const lowMistAnchors = [
    { x: 1.65, y: 0.16, z: -0.85, sx: 1.85, sy: 0.55, opacity: 0.34, tint: 0x8CE8E2, speed: 0.12 },
    { x: 2.55, y: 0.22, z: -1.65, sx: 1.95, sy: 0.62, opacity: 0.38, tint: 0x9ED8E0, speed: 0.10 },
    { x: 3.15, y: 0.28, z: -2.45, sx: 1.75, sy: 0.58, opacity: 0.36, tint: 0xB8D8E8, speed: 0.14 },
    { x: 1.25, y: 0.14, z: 0.95, sx: 1.65, sy: 0.48, opacity: 0.30, tint: 0x7CD8D4, speed: 0.11 },
    { x: -1.45, y: 0.18, z: 0.65, sx: 1.70, sy: 0.52, opacity: 0.28, tint: 0x9EC8D8, speed: 0.09 },
    { x: -2.65, y: 0.24, z: 1.55, sx: 1.80, sy: 0.56, opacity: 0.32, tint: 0xE8B88A, speed: 0.13 }
  ];

  // Stratum 2: Mid Cumulus Cloud Banks (y = 1.15..2.35) weaving directly between The City's brick towers & flying buttresses
  const midCityClouds = [
    { x: 1.92, y: 1.38, z: 1.62, sx: 1.45, sy: 0.68, opacity: 0.46, tint: 0xFFE0B2, speed: 0.16 },
    { x: 2.72, y: 1.68, z: 2.18, sx: 1.55, sy: 0.72, opacity: 0.48, tint: 0xFFD494, speed: 0.14 },
    { x: 2.15, y: 1.95, z: 2.42, sx: 1.35, sy: 0.64, opacity: 0.44, tint: 0xFFF0D4, speed: 0.18 },
    { x: 2.85, y: 1.28, z: 1.42, sx: 1.38, sy: 0.60, opacity: 0.42, tint: 0xE6D2B5, speed: 0.15 },
    { x: 1.52, y: 1.52, z: 2.05, sx: 1.28, sy: 0.58, opacity: 0.40, tint: 0xFFDCA8, speed: 0.17 },
    { x: 0.65, y: 1.75, z: 0.85, sx: 1.50, sy: 0.66, opacity: 0.36, tint: 0xFFE4B8, speed: 0.13 },
    { x: -2.25, y: 1.45, z: -1.85, sx: 1.48, sy: 0.64, opacity: 0.35, tint: 0xD8E2F0, speed: 0.12 },
    { x: 2.45, y: 1.42, z: -1.95, sx: 1.42, sy: 0.62, opacity: 0.38, tint: 0xDCE6F2, speed: 0.15 }
  ];

  // Stratum 3: High Cirrus & Astrolabe Crown Wisps (y = 2.75..3.55)
  const highCirrusClouds = [
    { x: 0.25, y: 3.05, z: -0.35, sx: 2.15, sy: 0.58, opacity: 0.32, tint: 0xFFE2B0, speed: 0.08 },
    { x: 2.10, y: 2.88, z: 1.75, sx: 1.95, sy: 0.54, opacity: 0.36, tint: 0xFFD89A, speed: 0.09 },
    { x: -1.80, y: 3.15, z: 0.90, sx: 2.05, sy: 0.52, opacity: 0.28, tint: 0xE8D8C0, speed: 0.07 }
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
    color: 0x3D4A5E,
    map: featherColorTex,
    bumpMap: featherBumpTex,
    bumpScale: 0.035,
    roughness: 0.36,
    metalness: 0.38
  });
  const matBirdWing = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    map: featherColorTex,
    bumpMap: featherBumpTex,
    bumpScale: 0.048,
    roughness: 0.30,
    metalness: 0.45
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
        matGoldTip: matGoldCanopy,
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
      matGoldTip: matGoldCanopy,
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
      matGoldTip: matGoldCanopy,
      scale: ks.scale
    });
    kb.birdGroup.position.copy(ks.pos);
    kb.birdGroup.lookAt(ks.look);
    kb.birdGroup.rotation.z += ks.roll;
    kageFaunaGroup.add(kb.birdGroup);
    kageTreeBirds.push({ ...kb, basePos: ks.pos.clone(), perched: ks.perched, phase: ks.phase });
  });

  // 18 Delicate 4-Winged Bioluminescent Dragonflies darting among the Kage World-Tree's mossy bark & veined leaves
  const matDragonflyWing = new THREE.MeshStandardMaterial({
    color: 0xE6FFFC,
    emissive: 0x2CE6D8,
    emissiveIntensity: 0.85,
    transparent: true,
    opacity: 0.78,
    roughness: 0.15,
    side: THREE.DoubleSide
  });

  const kageDragonflies = [];
  for (let d = 0; d < 18; d++) {
    const isGoldInsect = d % 2 === 0;
    const df = createLuminousDragonfly(THREE, {
      matBody: matSpecularBrass,
      matGlow: isGoldInsect ? matGoldCanopy : matCyanCore,
      matWing: matDragonflyWing,
      scale: 0.95 + (d % 3) * 0.22
    });
    const angle = (d / 18) * Math.PI * 2 + 0.3;
    const radius = 0.36 + (d % 4) * 0.22;
    const height = 1.15 + (d % 6) * 0.22;
    df.dfGroup.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
    kageFaunaGroup.add(df.dfGroup);
    kageDragonflies.push({
      ...df,
      baseAngle: angle,
      baseRadius: radius,
      baseY: height,
      speed: 0.45 + (d % 4) * 0.15,
      phase: d * 0.85
    });
  }

  // ============================================================================
  // 12. SAMANA REQUIREMENT #1: CONTINUOUS 3D CATMULL-ROM MASTER CAMERA RAIL
  // ============================================================================
  // Winds physically through the scene:
  // 0.00 Overview -> 0.20 City Keep & Feathered Falcons -> 0.50 Kage World-Tree Centerpiece -> 0.70 Workshop -> 0.90 Bootcamp
  const masterCameraRail = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.15, 4.55, 8.85),   // idx 0 (t=0.00) Grand Astrolabe Overview
    new THREE.Vector3(1.85, 2.75, 5.25),   // idx 1 (t=0.10) swooping down toward The City approach
    new THREE.Vector3(3.68, 2.12, 3.62),   // idx 2 (t=0.20) City Bricks, Windows, Sconces & Hero Feathered Falcons Close-Up
    new THREE.Vector3(2.55, 2.18, 2.25),   // idx 3 (t=0.30) threading beside the Keep & flying buttresses
    new THREE.Vector3(1.15, 2.02, 2.15),   // idx 4 (t=0.40) approaching the Kage Sanctuary
    new THREE.Vector3(0.18, 1.88, 1.92),   // idx 5 (t=0.50) Kage World-Tree Centerpiece Close-Up (Mossy Bark, Tapering Branches, Veined Leaves & Fauna)
    new THREE.Vector3(-1.85, 1.92, 2.45),  // idx 6 (t=0.60) gliding West toward the Copper Foundry
    new THREE.Vector3(-4.15, 1.82, 2.55),  // idx 7 (t=0.70) The Workshop Foundry & 4 Craft Alcoves
    new THREE.Vector3(-1.25, 1.65, -3.45), // idx 8 (t=0.80) The Campus Amphitheater
    new THREE.Vector3(1.45, 1.68, -0.75),  // idx 9 (t=0.90) Bootcamp Basalt Cliffs, Mist & Lighthouse
    new THREE.Vector3(3.65, 2.45, 3.85)    // idx 10 (t=1.00) climbing back across the harbor toward Overview
  ], false, 'centripetal', 0.5);

  const masterLookAtRail = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.20, 1.15, 0.15),   // idx 0 (t=0.00) Center of the Astrolabe Table
    new THREE.Vector3(2.15, 1.65, 1.95),   // idx 1 (t=0.10)
    new THREE.Vector3(2.38, 1.82, 2.02),   // idx 2 (t=0.20) City Keep Bricks, Windows & Hero Falcons
    new THREE.Vector3(1.65, 1.75, 1.25),   // idx 3 (t=0.30)
    new THREE.Vector3(0.25, 1.72, 0.25),   // idx 4 (t=0.40)
    new THREE.Vector3(0.00, 1.72, 0.00),   // idx 5 (t=0.50) Centerpiece Kage World-Tree Trunk, Moss, Branches & Leaves
    new THREE.Vector3(-2.15, 1.15, 1.15),  // idx 6 (t=0.60)
    new THREE.Vector3(-3.10, 0.92, 1.35),  // idx 7 (t=0.70) Workshop Copper Dome & Hearth
    new THREE.Vector3(-2.55, 0.78, -2.35), // idx 8 (t=0.80) Campus Colonnade
    new THREE.Vector3(2.75, 1.32, -2.25),  // idx 9 (t=0.90) Bootcamp Lighthouse & Flock II
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
