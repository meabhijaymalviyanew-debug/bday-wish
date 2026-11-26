import * as THREE from "three";
import {
  createCandleStripeTexture,
  createContactShadowTexture,
  createDefaultEaselCardTexture,
  createFrostingTextures,
  createGiftWrapTexture,
  createSoftGlowTexture,
  createTerrazzoTexture,
} from "./proceduralTextures";

export interface CandleRig {
  flameGroup: THREE.Group;
  outerFlame: THREE.Mesh;
  innerFlame: THREE.Mesh;
  halo: THREE.Sprite;
  smokePuffs: THREE.Mesh[];
  phase: number;
  baseY: number;
}

export interface BirthdayCakeBuild {
  group: THREE.Group;
  candles: CandleRig[];
  candlePointLight: THREE.PointLight;
  interactiveProxy: THREE.Mesh;
}

export interface KeepsakeEaselBuild {
  group: THREE.Group;
  artworkMaterial: THREE.MeshStandardMaterial;
  interactiveProxy: THREE.Mesh;
}

export interface AmbientParticlesBuild {
  starsMesh: THREE.InstancedMesh;
  heartsMesh: THREE.InstancedMesh;
  starSeeds: Array<{
    angle: number;
    radius: number;
    baseY: number;
    speed: number;
    bobAmp: number;
    scale: number;
    phase: number;
  }>;
  heartSeeds: Array<{
    angle: number;
    radius: number;
    baseY: number;
    speed: number;
    bobAmp: number;
    scale: number;
    phase: number;
  }>;
}

function createContactShadowPlane(
  radiusX: number,
  radiusZ: number,
  shadowTexture: THREE.Texture,
  opacity = 0.42
): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(radiusX * 2, radiusZ * 2);
  const mat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.008;
  return mesh;
}

export function buildPedestalStage(maxAnisotropy: number): {
  stageGroup: THREE.Group;
  shadowTexture: THREE.CanvasTexture;
} {
  const stageGroup = new THREE.Group();
  const { map: terrazzoMap, roughnessMap: terrazzoRough } =
    createTerrazzoTexture(maxAnisotropy);
  const shadowTexture = createContactShadowTexture();

  // Wide pastel-cream floor plane fading naturally into horizon fog
  const floorGeo = new THREE.CircleGeometry(38, 64);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xfaf2f5,
    roughness: 0.92,
    metalness: 0.0,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.34;
  floor.receiveShadow = true;
  stageGroup.add(floor);

  // Sculpted circular porcelain-terrazzo tabletop (top sits cleanly at y = 0)
  const tableProfile = [
    new THREE.Vector2(0, -0.34),
    new THREE.Vector2(1.45, -0.34),
    new THREE.Vector2(1.55, -0.26),
    new THREE.Vector2(1.18, -0.2),
    new THREE.Vector2(1.15, -0.1),
    new THREE.Vector2(3.65, -0.1),
    new THREE.Vector2(3.85, -0.05),
    new THREE.Vector2(3.88, 0.0),
    new THREE.Vector2(0, 0.0),
  ];
  const tableGeo = new THREE.LatheGeometry(tableProfile, 72);
  const tableMat = new THREE.MeshStandardMaterial({
    map: terrazzoMap,
    roughnessMap: terrazzoRough,
    roughness: 0.58,
    metalness: 0.04,
  });
  const tableMesh = new THREE.Mesh(tableGeo, tableMat);
  tableMesh.receiveShadow = true;
  tableMesh.castShadow = true;
  stageGroup.add(tableMesh);

  // Brushed gold metallic trim rim encircling the table edge
  const goldTrimGeo = new THREE.TorusGeometry(3.87, 0.032, 16, 84);
  const goldTrimMat = new THREE.MeshPhysicalMaterial({
    color: 0xe2c07a,
    metalness: 0.9,
    roughness: 0.2,
    clearcoat: 0.4,
  });
  const goldTrim = new THREE.Mesh(goldTrimGeo, goldTrimMat);
  goldTrim.rotation.x = Math.PI / 2;
  goldTrim.position.y = -0.025;
  stageGroup.add(goldTrim);

  // Soft pastel inlay ring on the table surface (offset +0.004 with polygonOffset to avoid Z-fighting)
  const inlayGeo = new THREE.RingGeometry(3.48, 3.55, 72);
  const inlayMat = new THREE.MeshStandardMaterial({
    color: 0xe6c888,
    metalness: 0.85,
    roughness: 0.24,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const inlay = new THREE.Mesh(inlayGeo, inlayMat);
  inlay.rotation.x = -Math.PI / 2;
  inlay.position.y = 0.004;
  stageGroup.add(inlay);

  return { stageGroup, shadowTexture };
}

export function buildBirthdayCake(
  maxAnisotropy: number,
  shadowTexture: THREE.Texture
): BirthdayCakeBuild {
  const group = new THREE.Group();
  group.position.set(0, 0, 0);

  // Grounding contact shadow directly beneath cake stand
  group.add(createContactShadowPlane(1.45, 1.45, shadowTexture, 0.48));

  // 1. Fluted porcelain cake stand (LatheGeometry, glossy glaze roughness 0.22)
  const standProfile = [
    new THREE.Vector2(0, 0.0),
    new THREE.Vector2(0.68, 0.0),
    new THREE.Vector2(0.7, 0.045),
    new THREE.Vector2(0.54, 0.09),
    new THREE.Vector2(0.24, 0.16),
    new THREE.Vector2(0.2, 0.34),
    new THREE.Vector2(0.32, 0.42),
    new THREE.Vector2(1.26, 0.45),
    new THREE.Vector2(1.34, 0.5),
    new THREE.Vector2(1.32, 0.54),
    new THREE.Vector2(1.22, 0.51),
    new THREE.Vector2(0, 0.51),
  ];
  const standGeo = new THREE.LatheGeometry(standProfile, 64);
  const porcelainMat = new THREE.MeshPhysicalMaterial({
    color: 0xfffcf8,
    roughness: 0.2,
    metalness: 0.04,
    clearcoat: 0.75,
    clearcoatRoughness: 0.14,
  });
  const standMesh = new THREE.Mesh(standGeo, porcelainMat);
  standMesh.castShadow = true;
  standMesh.receiveShadow = true;
  group.add(standMesh);

  // 2. Brushed gold accent rings on the porcelain stand foot & rim
  const goldMat = new THREE.MeshPhysicalMaterial({
    color: 0xe3be72,
    metalness: 0.92,
    roughness: 0.18,
    clearcoat: 0.35,
  });
  const standRim = new THREE.Mesh(
    new THREE.TorusGeometry(1.32, 0.018, 12, 64),
    goldMat
  );
  standRim.rotation.x = Math.PI / 2;
  standRim.position.y = 0.525;
  group.add(standRim);

  const standFootRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.69, 0.016, 12, 48),
    goldMat
  );
  standFootRing.rotation.x = Math.PI / 2;
  standFootRing.position.y = 0.025;
  group.add(standFootRing);

  // 3. Bottom lavender cake tier (soft matte buttercream roughness 0.78)
  const lavenderFrost = createFrostingTextures(
    "#EAE1FC",
    "#FFFFFF",
    maxAnisotropy
  );
  const bottomTierGeo = new THREE.CylinderGeometry(1.06, 1.09, 0.72, 56);
  const bottomTierMat = new THREE.MeshStandardMaterial({
    map: lavenderFrost.map,
    bumpMap: lavenderFrost.bumpMap,
    bumpScale: 0.015,
    roughness: 0.78,
    metalness: 0.0,
  });
  const bottomTier = new THREE.Mesh(bottomTierGeo, bottomTierMat);
  bottomTier.position.y = 0.51 + 0.36;
  bottomTier.castShadow = true;
  bottomTier.receiveShadow = true;
  group.add(bottomTier);

  // 4. Scalloped cream buttercream pearls around bottom tier base & top (InstancedMesh)
  const pearlGeo = new THREE.SphereGeometry(0.068, 14, 12);
  const creamPipingMat = new THREE.MeshStandardMaterial({
    color: 0xfffaf2,
    roughness: 0.52,
    metalness: 0.0,
  });
  const basePearlCount = 32;
  const midPearlCount = 24;
  const totalPearls = basePearlCount + midPearlCount;
  const pearlsInstanced = new THREE.InstancedMesh(
    pearlGeo,
    creamPipingMat,
    totalPearls
  );
  const dummy = new THREE.Object3D();
  for (let i = 0; i < basePearlCount; i++) {
    const a = (i / basePearlCount) * Math.PI * 2;
    dummy.position.set(Math.cos(a) * 1.1, 0.555, Math.sin(a) * 1.1);
    dummy.scale.set(1.05, 0.82, 1.05);
    dummy.updateMatrix();
    pearlsInstanced.setMatrixAt(i, dummy.matrix);
  }
  for (let i = 0; i < midPearlCount; i++) {
    const a = (i / midPearlCount) * Math.PI * 2;
    dummy.position.set(Math.cos(a) * 0.76, 1.255, Math.sin(a) * 0.76);
    dummy.scale.set(0.88, 0.76, 0.88);
    dummy.updateMatrix();
    pearlsInstanced.setMatrixAt(basePearlCount + i, dummy.matrix);
  }
  pearlsInstanced.instanceMatrix.needsUpdate = true;
  pearlsInstanced.computeBoundingSphere();
  group.add(pearlsInstanced);

  // 5. Top blush-pink cake tier (matte buttercream roughness 0.76)
  const blushFrost = createFrostingTextures(
    "#FFD7E6",
    "#FFF5F9",
    maxAnisotropy
  );
  const topTierGeo = new THREE.CylinderGeometry(0.73, 0.75, 0.62, 56);
  const topTierMat = new THREE.MeshStandardMaterial({
    map: blushFrost.map,
    bumpMap: blushFrost.bumpMap,
    bumpScale: 0.014,
    roughness: 0.76,
    metalness: 0.0,
  });
  const topTier = new THREE.Mesh(topTierGeo, topTierMat);
  topTier.position.y = 1.23 + 0.31;
  topTier.castShadow = true;
  topTier.receiveShadow = true;
  group.add(topTier);

  // 6. Glossy strawberry-cream glaze ganache top cap & sculpted drips (roughness 0.18, clearcoat 0.7)
  const glazeMat = new THREE.MeshPhysicalMaterial({
    color: 0xf7a4c2,
    roughness: 0.18,
    metalness: 0.02,
    clearcoat: 0.72,
    clearcoatRoughness: 0.12,
  });
  const glazeCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.745, 0.745, 0.055, 48),
    glazeMat
  );
  glazeCap.position.y = 1.845;
  glazeCap.receiveShadow = true;
  group.add(glazeCap);

  // Sculpted drip teardrops hanging along top rim
  const dripCount = 18;
  const dripStickGeo = new THREE.CapsuleGeometry(0.036, 0.12, 8, 12);
  const dripsInstanced = new THREE.InstancedMesh(
    dripStickGeo,
    glazeMat,
    dripCount
  );
  for (let i = 0; i < dripCount; i++) {
    const a = (i / dripCount) * Math.PI * 2;
    const lenScale = 0.65 + ((i * 7) % 5) * 0.22;
    dummy.position.set(
      Math.cos(a) * 0.742,
      1.82 - 0.065 * lenScale,
      Math.sin(a) * 0.742
    );
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(0.95, lenScale, 0.95);
    dummy.updateMatrix();
    dripsInstanced.setMatrixAt(i, dummy.matrix);
  }
  dripsInstanced.instanceMatrix.needsUpdate = true;
  dripsInstanced.computeBoundingSphere();
  group.add(dripsInstanced);

  // 7. Golden metallic dragee pearl belt around bottom tier (high-contrast metallic accent)
  const drageeGeo = new THREE.SphereGeometry(0.028, 10, 10);
  const drageeCount = 28;
  const dragees = new THREE.InstancedMesh(drageeGeo, goldMat, drageeCount);
  for (let i = 0; i < drageeCount; i++) {
    const a = (i / drageeCount) * Math.PI * 2;
    const waveY = 0.88 + Math.sin(a * 7) * 0.11;
    dummy.position.set(Math.cos(a) * 1.09, waveY, Math.sin(a) * 1.09);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    dragees.setMatrixAt(i, dummy.matrix);
  }
  dragees.instanceMatrix.needsUpdate = true;
  dragees.computeBoundingSphere();
  group.add(dragees);

  // 8. Delicate curled satin-sugar ribbon bow on front of bottom tier (TubeGeometry)
  const ribbonMat = new THREE.MeshPhysicalMaterial({
    color: 0xe38aad,
    roughness: 0.34,
    metalness: 0.05,
    sheen: 0.7,
    sheenColor: new THREE.Color(0xffe4ef),
  });
  const createRibbonLoop = (sign: number) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(sign * 0.14, 0.09, 0.05),
      new THREE.Vector3(sign * 0.24, 0.02, 0.03),
      new THREE.Vector3(sign * 0.13, -0.07, 0.04),
      new THREE.Vector3(0, 0, 0),
    ]);
    return new THREE.Mesh(
      new THREE.TubeGeometry(curve, 24, 0.024, 8, true),
      ribbonMat
    );
  };
  const bowGroup = new THREE.Group();
  bowGroup.position.set(0, 1.24, 0.78);
  bowGroup.add(createRibbonLoop(1), createRibbonLoop(-1));
  const bowKnot = new THREE.Mesh(
    new THREE.SphereGeometry(0.042, 14, 12),
    ribbonMat
  );
  bowKnot.scale.set(1.1, 0.85, 0.9);
  bowGroup.add(bowKnot);
  group.add(bowGroup);

  // 9. Five interactive striped birthday candles with holders, wicks, animated flames & smoke
  const candleColors = [
    ["#FFFDF9", "#F598B9"],
    ["#FFFDF9", "#C5B0F4"],
    ["#FFFDF9", "#F2A8C2"],
    ["#FFFDF9", "#C5B0F4"],
    ["#FFFDF9", "#F598B9"],
  ];
  const candleOffsets: Array<[number, number]> = [
    [0, 0],
    [-0.36, 0.16],
    [0.36, 0.16],
    [-0.24, -0.32],
    [0.24, -0.32],
  ];

  const glowSpriteTex = createSoftGlowTexture();
  const outerFlameGeo = new THREE.ConeGeometry(0.044, 0.16, 14);
  outerFlameGeo.translate(0, 0.08, 0);
  const innerFlameGeo = new THREE.ConeGeometry(0.022, 0.095, 12);
  innerFlameGeo.translate(0, 0.05, 0);
  const smokeGeo = new THREE.SphereGeometry(0.032, 10, 10);

  const outerFlameMat = new THREE.MeshBasicMaterial({
    color: 0xffa73b,
    transparent: true,
    opacity: 0.94,
  });
  const innerFlameMat = new THREE.MeshBasicMaterial({
    color: 0xfff8cf,
    transparent: true,
    opacity: 0.98,
  });

  const candles: CandleRig[] = [];

  candleOffsets.forEach(([cx, cz], idx) => {
    const candleGroup = new THREE.Group();
    const height = idx === 0 ? 0.56 : 0.48;
    const baseY = 1.87;
    candleGroup.position.set(cx, baseY, cz);

    // Brass candle holder cup
    const holder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.052, 0.038, 0.055, 16),
      goldMat
    );
    holder.position.y = 0.025;
    candleGroup.add(holder);

    // Striped wax stick
    const [baseHex, stripeHex] = candleColors[idx];
    const stripeTex = createCandleStripeTexture(
      baseHex,
      stripeHex,
      maxAnisotropy
    );
    const waxMat = new THREE.MeshStandardMaterial({
      map: stripeTex,
      roughness: 0.45,
      metalness: 0.0,
    });
    const waxMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.038, height, 18),
      waxMat
    );
    waxMesh.position.y = 0.04 + height / 2;
    waxMesh.castShadow = true;
    candleGroup.add(waxMesh);

    // Dark charred wick
    const wick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.006, 0.045, 8),
      new THREE.MeshStandardMaterial({ color: 0x3b2c32, roughness: 0.9 })
    );
    wick.position.y = 0.04 + height + 0.02;
    candleGroup.add(wick);

    // Flame assembly
    const flameGroup = new THREE.Group();
    const flameBaseY = 0.04 + height + 0.04;
    flameGroup.position.y = flameBaseY;

    const outerFlame = new THREE.Mesh(outerFlameGeo, outerFlameMat);
    const innerFlame = new THREE.Mesh(innerFlameGeo, innerFlameMat);
    const haloMat = new THREE.SpriteMaterial({
      map: glowSpriteTex,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.set(0.42, 0.42, 1);
    halo.position.y = 0.08;

    flameGroup.add(outerFlame, innerFlame, halo);
    candleGroup.add(flameGroup);

    // Rising smoke puffs (visible briefly after blowing candles out)
    const smokePuffs: THREE.Mesh[] = [];
    for (let s = 0; s < 3; s++) {
      const smokeMat = new THREE.MeshBasicMaterial({
        color: 0xd9ced8,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const puff = new THREE.Mesh(smokeGeo, smokeMat);
      puff.position.set(0, flameBaseY, 0);
      candleGroup.add(puff);
      smokePuffs.push(puff);
    }

    group.add(candleGroup);
    candles.push({
      flameGroup,
      outerFlame,
      innerFlame,
      halo,
      smokePuffs,
      phase: idx * 1.4,
      baseY: flameBaseY,
    });
  });

  // Warm flickering candlelight PointLight right above the crown
  const candlePointLight = new THREE.PointLight(0xffcb82, 2.2, 6.5, 1.8);
  candlePointLight.position.set(0, 2.65, 0.15);
  group.add(candlePointLight);

  // Invisible raycasting proxy over the candles & cake top
  const interactiveProxy = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 1.15, 2.35, 16),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  interactiveProxy.position.y = 1.45;
  interactiveProxy.userData.interactiveType = "candles";
  group.add(interactiveProxy);

  return { group, candles, candlePointLight, interactiveProxy };
}

export function buildKeepsakeEasel(
  maxAnisotropy: number,
  shadowTexture: THREE.Texture
): KeepsakeEaselBuild {
  const group = new THREE.Group();
  group.position.set(-2.15, 0, -0.35);
  group.rotation.y = 0.48;

  group.add(createContactShadowPlane(0.95, 0.72, shadowTexture, 0.4));

  const ivoryWoodMat = new THREE.MeshStandardMaterial({
    color: 0xf9f1e7,
    roughness: 0.62,
    metalness: 0.04,
  });
  const brushedGoldMat = new THREE.MeshPhysicalMaterial({
    color: 0xdfba72,
    metalness: 0.9,
    roughness: 0.2,
    clearcoat: 0.35,
  });

  // 1. Two angled front easel legs
  const legGeo = new THREE.BoxGeometry(0.085, 2.05, 0.075);
  const leftLeg = new THREE.Mesh(legGeo, ivoryWoodMat);
  leftLeg.position.set(-0.46, 0.98, 0.1);
  leftLeg.rotation.z = -0.11;
  leftLeg.rotation.x = -0.15;
  leftLeg.castShadow = true;

  const rightLeg = new THREE.Mesh(legGeo, ivoryWoodMat);
  rightLeg.position.set(0.46, 0.98, 0.1);
  rightLeg.rotation.z = 0.11;
  rightLeg.rotation.x = -0.15;
  rightLeg.castShadow = true;

  // 2. Back support easel strut + brass hinge collar
  const backLeg = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 1.95, 0.07),
    ivoryWoodMat
  );
  backLeg.position.set(0, 0.92, -0.36);
  backLeg.rotation.x = 0.28;
  backLeg.castShadow = true;

  const topCrest = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.095, 0.14, 16),
    brushedGoldMat
  );
  topCrest.position.set(0, 1.95, -0.05);

  // 3. Horizontal shelf ledge holding the frame
  const ledge = new THREE.Mesh(
    new THREE.BoxGeometry(1.38, 0.075, 0.18),
    ivoryWoodMat
  );
  ledge.position.set(0, 0.62, 0.22);
  ledge.rotation.x = -0.15;
  ledge.castShadow = true;

  group.add(leftLeg, rightLeg, backLeg, topCrest, ledge);

  // 4. Tilted gilded picture frame resting on the ledge
  const frameHolder = new THREE.Group();
  frameHolder.position.set(0, 1.38, 0.08);
  frameHolder.rotation.x = -0.15;

  const frameOuterW = 1.24;
  const frameOuterH = 1.5;
  const border = 0.085;

  // Extruded beveled gold frame perimeter with cutout window
  const frameShape = new THREE.Shape();
  frameShape.moveTo(-frameOuterW / 2, -frameOuterH / 2);
  frameShape.lineTo(frameOuterW / 2, -frameOuterH / 2);
  frameShape.lineTo(frameOuterW / 2, frameOuterH / 2);
  frameShape.lineTo(-frameOuterW / 2, frameOuterH / 2);
  frameShape.closePath();

  const holePath = new THREE.Path();
  const innerW = frameOuterW - border * 2;
  const innerH = frameOuterH - border * 2;
  holePath.moveTo(-innerW / 2, -innerH / 2);
  holePath.lineTo(innerW / 2, -innerH / 2);
  holePath.lineTo(innerW / 2, innerH / 2);
  holePath.lineTo(-innerW / 2, innerH / 2);
  holePath.closePath();
  frameShape.holes.push(holePath);

  const frameGeo = new THREE.ExtrudeGeometry(frameShape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.015,
    bevelSegments: 3,
  });
  frameGeo.center();
  const frameMesh = new THREE.Mesh(frameGeo, brushedGoldMat);
  frameMesh.castShadow = true;
  frameMesh.receiveShadow = true;
  frameHolder.add(frameMesh);

  // Backing board
  const backing = new THREE.Mesh(
    new THREE.BoxGeometry(frameOuterW - 0.04, frameOuterH - 0.04, 0.03),
    ivoryWoodMat
  );
  backing.position.z = -0.025;
  frameHolder.add(backing);

  // Artwork canvas plane inside the gilded frame
  const defaultTex = createDefaultEaselCardTexture(maxAnisotropy);
  const artworkMaterial = new THREE.MeshStandardMaterial({
    map: defaultTex,
    roughness: 0.42,
    metalness: 0.0,
  });
  const artworkPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(innerW + 0.01, innerH + 0.01),
    artworkMaterial
  );
  artworkPlane.position.z = 0.008;
  frameHolder.add(artworkPlane);

  group.add(frameHolder);

  // Clickable proxy for opening the Memory illustration panel
  const interactiveProxy = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 2.05, 0.85),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  interactiveProxy.position.set(0, 1.05, 0.05);
  interactiveProxy.userData.interactiveType = "easel";
  group.add(interactiveProxy);

  return { group, artworkMaterial, interactiveProxy };
}

function buildSingleGiftBox(
  w: number,
  h: number,
  d: number,
  boxHex: string,
  dotHex: string,
  ribbonHex: string,
  maxAnisotropy: number,
  shadowTexture: THREE.Texture
): THREE.Group {
  const gift = new THREE.Group();
  gift.add(
    createContactShadowPlane(w * 0.72, d * 0.72, shadowTexture, 0.36)
  );

  const wrapTex = createGiftWrapTexture(boxHex, dotHex, maxAnisotropy);
  const boxMat = new THREE.MeshStandardMaterial({
    map: wrapTex,
    roughness: 0.8,
    metalness: 0.0,
  });
  const ribbonMat = new THREE.MeshPhysicalMaterial({
    color: ribbonHex,
    roughness: 0.28,
    metalness: 0.14,
    sheen: 0.65,
    sheenColor: new THREE.Color(0xffffff),
  });

  // 1. Box body
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.78, d), boxMat);
  body.position.y = (h * 0.78) / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  gift.add(body);

  // 2. Overhanging lid
  const lidH = h * 0.24;
  const lid = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.055, lidH, d + 0.055),
    boxMat
  );
  lid.position.y = h * 0.78 + lidH / 2 - 0.02;
  lid.castShadow = true;
  lid.receiveShadow = true;
  gift.add(lid);

  // 3. Criss-cross satin ribbon bands
  const bandW = Math.min(w, d) * 0.17;
  const band1 = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.068, h + 0.01, bandW),
    ribbonMat
  );
  band1.position.y = h / 2;
  const band2 = new THREE.Mesh(
    new THREE.BoxGeometry(bandW, h + 0.01, d + 0.068),
    ribbonMat
  );
  band2.position.y = h / 2;
  gift.add(band1, band2);

  // 4. Sculpted 4-loop satin bow on lid top (TubeGeometry)
  const bowTop = new THREE.Group();
  bowTop.position.y = h + 0.01;
  const loopScale = Math.min(w, d) * 0.25;
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(
        Math.cos(angle) * loopScale * 0.85,
        loopScale * 0.9,
        Math.sin(angle) * loopScale * 0.85
      ),
      new THREE.Vector3(
        Math.cos(angle) * loopScale * 1.35,
        loopScale * 0.35,
        Math.sin(angle) * loopScale * 1.35
      ),
      new THREE.Vector3(0, 0, 0),
    ]);
    const loop = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 18, bandW * 0.22, 8, true),
      ribbonMat
    );
    loop.castShadow = true;
    bowTop.add(loop);
  }
  const knot = new THREE.Mesh(
    new THREE.SphereGeometry(bandW * 0.42, 12, 10),
    ribbonMat
  );
  knot.position.y = 0.02;
  bowTop.add(knot);
  gift.add(bowTop);

  return gift;
}

export function buildGiftBoxes(
  maxAnisotropy: number,
  shadowTexture: THREE.Texture
): { group: THREE.Group; interactiveProxy: THREE.Mesh } {
  const group = new THREE.Group();
  group.position.set(2.1, 0, -1.05);

  const gift1 = buildSingleGiftBox(
    0.88,
    0.72,
    0.88,
    "#FFE3EE",
    "#E7C989",
    "#DC6D96",
    maxAnisotropy,
    shadowTexture
  );
  gift1.rotation.y = -0.35;
  group.add(gift1);

  const gift2 = buildSingleGiftBox(
    0.66,
    0.54,
    0.66,
    "#ECE5FF",
    "#FFFFFF",
    "#D9B468",
    maxAnisotropy,
    shadowTexture
  );
  gift2.position.set(0.68, 0, 0.56);
  gift2.rotation.y = 0.42;
  group.add(gift2);

  const gift3 = buildSingleGiftBox(
    0.56,
    0.44,
    0.56,
    "#FDF6E7",
    "#F2B6CD",
    "#B69BE8",
    maxAnisotropy,
    shadowTexture
  );
  gift3.position.set(-0.22, 0.72, -0.05);
  gift3.rotation.y = 0.25;
  group.add(gift3);

  const interactiveProxy = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 1.45, 1.8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  interactiveProxy.position.set(0.28, 0.72, 0.22);
  interactiveProxy.userData.interactiveType = "gifts";
  group.add(interactiveProxy);

  return { group, interactiveProxy };
}

export function buildWaxSealedLetter(
  shadowTexture: THREE.Texture
): { group: THREE.Group; interactiveProxy: THREE.Mesh } {
  const group = new THREE.Group();
  group.position.set(1.92, 0, 1.05);
  group.rotation.y = -0.52;

  group.add(createContactShadowPlane(0.82, 0.56, shadowTexture, 0.35));

  const paperMat = new THREE.MeshStandardMaterial({
    color: 0xfffaf0,
    roughness: 0.84,
    metalness: 0.0,
  });
  const flapMat = new THREE.MeshStandardMaterial({
    color: 0xf7eee0,
    roughness: 0.8,
    metalness: 0.0,
  });
  const waxMat = new THREE.MeshPhysicalMaterial({
    color: 0xd9638d,
    roughness: 0.28,
    metalness: 0.08,
    clearcoat: 0.55,
    clearcoatRoughness: 0.25,
  });
  const goldMat = new THREE.MeshPhysicalMaterial({
    color: 0xe3bf72,
    metalness: 0.92,
    roughness: 0.18,
  });

  // 1. Beveled cream stationery envelope body
  const envShape = new THREE.Shape();
  envShape.moveTo(-0.54, -0.34);
  envShape.lineTo(0.54, -0.34);
  envShape.lineTo(0.54, 0.34);
  envShape.lineTo(-0.54, 0.34);
  envShape.closePath();
  const envGeo = new THREE.ExtrudeGeometry(envShape, {
    depth: 0.045,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
  });
  envGeo.rotateX(-Math.PI / 2);
  const envMesh = new THREE.Mesh(envGeo, paperMat);
  envMesh.position.y = 0.015;
  envMesh.castShadow = true;
  envMesh.receiveShadow = true;
  group.add(envMesh);

  // 2. Folded triangular envelope flap on top
  const flapShape = new THREE.Shape();
  flapShape.moveTo(-0.52, 0.32);
  flapShape.lineTo(0.52, 0.32);
  flapShape.lineTo(0, -0.05);
  flapShape.closePath();
  const flapGeo = new THREE.ExtrudeGeometry(flapShape, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 2,
  });
  flapGeo.rotateX(-Math.PI / 2);
  const flapMesh = new THREE.Mesh(flapGeo, flapMat);
  flapMesh.position.y = 0.072;
  group.add(flapMesh);

  // 3. Glossy blush wax seal medallion with gold heart emblem
  const seal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.125, 0.032, 24),
    waxMat
  );
  seal.position.set(0, 0.095, 0.03);
  seal.castShadow = true;
  group.add(seal);

  const sealRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.088, 0.014, 10, 24),
    waxMat
  );
  sealRim.rotation.x = Math.PI / 2;
  sealRim.position.set(0, 0.112, 0.03);
  group.add(sealRim);

  // 4. Pearl-and-gold fountain pen resting beside the envelope
  const penGroup = new THREE.Group();
  penGroup.position.set(0.12, 0.045, 0.44);
  penGroup.rotation.y = 0.18;

  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.02, 0.72, 16),
    new THREE.MeshPhysicalMaterial({
      color: 0xfdebf2,
      roughness: 0.22,
      clearcoat: 0.8,
    })
  );
  barrel.rotation.z = Math.PI / 2;
  barrel.castShadow = true;

  const goldRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.029, 0.029, 0.045, 16),
    goldMat
  );
  goldRing.rotation.z = Math.PI / 2;
  goldRing.position.x = -0.14;

  const nib = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.12, 12), goldMat);
  nib.rotation.z = Math.PI / 2;
  nib.position.x = -0.42;

  penGroup.add(barrel, goldRing, nib);
  group.add(penGroup);

  const interactiveProxy = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.55, 1.25),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  interactiveProxy.position.set(0, 0.25, 0.12);
  interactiveProxy.userData.interactiveType = "letter";
  group.add(interactiveProxy);

  return { group, interactiveProxy };
}

export function buildFairyGarlandArch(): THREE.Group {
  const archGroup = new THREE.Group();

  // Graceful curved brass wire arch rising behind the circular table
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.35, -0.02, -1.6),
    new THREE.Vector3(-2.7, 2.35, -2.3),
    new THREE.Vector3(0, 3.65, -2.65),
    new THREE.Vector3(2.7, 2.35, -2.3),
    new THREE.Vector3(3.35, -0.02, -1.6),
  ]);

  const archMat = new THREE.MeshPhysicalMaterial({
    color: 0xdfbd77,
    metalness: 0.88,
    roughness: 0.24,
  });
  const archWire = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 64, 0.028, 10, false),
    archMat
  );
  archGroup.add(archWire);

  // Warm fairy-light bulbs arranged along the arch (InstancedMesh)
  const bulbCount = 19;
  const bulbGeo = new THREE.SphereGeometry(0.068, 14, 12);
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfff5d6,
    emissive: 0xffca7a,
    emissiveIntensity: 1.55,
    roughness: 0.2,
  });
  const bulbs = new THREE.InstancedMesh(bulbGeo, bulbMat, bulbCount);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < bulbCount; i++) {
    const t = 0.06 + (i / (bulbCount - 1)) * 0.88;
    const pt = curve.getPoint(t);
    dummy.position.set(pt.x, pt.y - 0.06, pt.z);
    dummy.scale.setScalar(0.85 + (i % 3) * 0.12);
    dummy.updateMatrix();
    bulbs.setMatrixAt(i, dummy.matrix);
  }
  bulbs.instanceMatrix.needsUpdate = true;
  bulbs.computeBoundingSphere();
  archGroup.add(bulbs);

  return archGroup;
}

export function buildAmbientParticles(): AmbientParticlesBuild {
  // 1. Extruded 5-point golden star geometry
  const starShape = new THREE.Shape();
  const outerR = 0.095;
  const innerR = 0.044;
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) starShape.moveTo(x, y);
    else starShape.lineTo(x, y);
  }
  starShape.closePath();

  const starGeo = new THREE.ExtrudeGeometry(starShape, {
    depth: 0.024,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.008,
    bevelSegments: 2,
  });
  starGeo.center();

  const starMat = new THREE.MeshPhysicalMaterial({
    color: 0xf4d282,
    emissive: 0xd9a84e,
    emissiveIntensity: 0.35,
    metalness: 0.85,
    roughness: 0.2,
  });

  const starCount = 42;
  const starsMesh = new THREE.InstancedMesh(starGeo, starMat, starCount);
  starsMesh.frustumCulled = false;

  const starSeeds: AmbientParticlesBuild["starSeeds"] = [];
  for (let i = 0; i < starCount; i++) {
    starSeeds.push({
      angle: (i / starCount) * Math.PI * 2 + (i % 5) * 0.23,
      radius: 2.3 + ((i * 19) % 45) * 0.12,
      baseY: 0.8 + ((i * 13) % 34) * 0.11,
      speed: 0.06 + (i % 7) * 0.015,
      bobAmp: 0.14 + (i % 4) * 0.05,
      scale: 0.55 + (i % 5) * 0.18,
      phase: i * 0.77,
    });
  }

  // 2. Extruded soft pastel heart geometry
  const heartShape = new THREE.Shape();
  heartShape.moveTo(0, -0.07);
  heartShape.bezierCurveTo(0.09, 0.0, 0.11, 0.09, 0.045, 0.11);
  heartShape.bezierCurveTo(0.01, 0.12, 0, 0.08, 0, 0.065);
  heartShape.bezierCurveTo(0, 0.08, -0.01, 0.12, -0.045, 0.11);
  heartShape.bezierCurveTo(-0.11, 0.09, -0.09, 0.0, 0, -0.07);

  const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
    depth: 0.028,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.01,
    bevelSegments: 2,
  });
  heartGeo.center();

  const heartMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.34,
    metalness: 0.06,
    clearcoat: 0.45,
  });

  const heartCount = 30;
  const heartsMesh = new THREE.InstancedMesh(heartGeo, heartMat, heartCount);
  heartsMesh.frustumCulled = false;

  const tintPalette = [
    new THREE.Color(0xf493b7),
    new THREE.Color(0xffc7dc),
    new THREE.Color(0xcab6f7),
    new THREE.Color(0xf6b8cc),
  ];
  const heartSeeds: AmbientParticlesBuild["heartSeeds"] = [];
  for (let i = 0; i < heartCount; i++) {
    heartsMesh.setColorAt(i, tintPalette[i % tintPalette.length]);
    heartSeeds.push({
      angle: (i / heartCount) * Math.PI * 2 + 0.4,
      radius: 2.7 + ((i * 23) % 38) * 0.13,
      baseY: 1.0 + ((i * 17) % 28) * 0.12,
      speed: -0.05 - (i % 5) * 0.014,
      bobAmp: 0.18 + (i % 3) * 0.07,
      scale: 0.65 + (i % 4) * 0.18,
      phase: i * 1.13,
    });
  }
  if (heartsMesh.instanceColor) {
    heartsMesh.instanceColor.needsUpdate = true;
  }

  return { starsMesh, heartsMesh, starSeeds, heartSeeds };
}
