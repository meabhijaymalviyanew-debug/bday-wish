import * as THREE from "three";

function configureColorTexture(
  texture: THREE.CanvasTexture,
  maxAnisotropy: number
): THREE.CanvasTexture {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.max(1, Math.min(maxAnisotropy, 16));
  texture.needsUpdate = true;
  return texture;
}

export function createFrostingTextures(
  baseHex: string,
  highlightHex: string,
  maxAnisotropy: number
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const size = 512;
  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext("2d")!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  // Soft horizontal spatula frosting bands
  for (let y = 0; y < size; y += 6) {
    const alpha = 0.04 + (Math.sin(y * 0.18) * 0.5 + 0.5) * 0.05;
    ctx.fillStyle = highlightHex;
    ctx.globalAlpha = alpha;
    ctx.fillRect(0, y, size, 3);
  }

  // Fine artisanal buttercream micro-grain
  ctx.globalAlpha = 0.07;
  for (let i = 0; i < 1800; i++) {
    const x = (i * 197) % size;
    const y = (i * 353) % size;
    const r = 1 + (i % 3) * 0.7;
    ctx.fillStyle = i % 2 === 0 ? "#FFFFFF" : highlightHex;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const map = new THREE.CanvasTexture(colorCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 1);
  configureColorTexture(map, maxAnisotropy);

  // Linear bump map for gentle frosting ridges
  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext("2d")!;
  bCtx.fillStyle = "#808080";
  bCtx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 8) {
    const shade = Math.round(128 + Math.sin(y * 0.25) * 28);
    bCtx.fillStyle = `rgb(${shade},${shade},${shade})`;
    bCtx.fillRect(0, y, size, 4);
  }
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 1);
  bumpMap.needsUpdate = true;

  return { map, bumpMap };
}

export function createCandleStripeTexture(
  baseHex: string,
  stripeHex: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = stripeHex;
  ctx.lineWidth = 22;
  for (let offset = -size; offset < size * 2; offset += 56) {
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset + size, size);
    ctx.stroke();
  }

  // Thin metallic gold accent hairline along stripes
  ctx.strokeStyle = "#E8C98A";
  ctx.lineWidth = 3;
  for (let offset = -size; offset < size * 2; offset += 56) {
    ctx.beginPath();
    ctx.moveTo(offset + 12, 0);
    ctx.lineTo(offset + size + 12, size);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return configureColorTexture(texture, maxAnisotropy);
}

export function createTerrazzoTexture(maxAnisotropy: number): {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Warm cream porcelain base
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    20,
    size / 2,
    size / 2,
    size * 0.65
  );
  grad.addColorStop(0, "#FFFDF9");
  grad.addColorStop(1, "#F7EEE5");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Subtle pastel & gold terrazzo stone chips
  const chipColors = ["#F4C7D8", "#DFD3F7", "#E9D2A2", "#EFE3D5", "#F9DCE6"];
  let seed = 42;
  const nextRand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < 240; i++) {
    const x = nextRand() * size;
    const y = nextRand() * size;
    const w = 3 + nextRand() * 9;
    const h = 3 + nextRand() * 8;
    const rot = nextRand() * Math.PI;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = chipColors[i % chipColors.length];
    ctx.globalAlpha = 0.45 + nextRand() * 0.35;
    ctx.beginPath();
    ctx.moveTo(-w * 0.5, -h * 0.35);
    ctx.lineTo(w * 0.45, -h * 0.5);
    ctx.lineTo(w * 0.5, h * 0.4);
    ctx.lineTo(-w * 0.35, h * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);
  configureColorTexture(map, maxAnisotropy);

  // Linear roughness variation map
  const roughCanvas = document.createElement("canvas");
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext("2d")!;
  rCtx.fillStyle = "#5A5A5A";
  rCtx.fillRect(0, 0, size, size);
  for (let i = 0; i < 200; i++) {
    const x = nextRand() * size;
    const y = nextRand() * size;
    const r = 4 + nextRand() * 14;
    rCtx.fillStyle = i % 2 === 0 ? "#464646" : "#6E6E6E";
    rCtx.beginPath();
    rCtx.arc(x, y, r, 0, Math.PI * 2);
    rCtx.fill();
  }
  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 2);
  roughnessMap.needsUpdate = true;

  return { map, roughnessMap };
}

export function createGiftWrapTexture(
  bgHex: string,
  dotHex: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, size, size);

  // Soft linen crosshatch weave
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1;
  for (let i = 0; i < size; i += 8) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  // Delicate polka-dot / star accents
  ctx.fillStyle = dotHex;
  for (let y = 16; y < size; y += 32) {
    for (let x = 16; x < size; x += 32) {
      const offsetX = (y / 32) % 2 === 0 ? 0 : 16;
      ctx.beginPath();
      ctx.arc((x + offsetX) % size, y, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return configureColorTexture(texture, maxAnisotropy);
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.06,
    size / 2,
    size / 2,
    size * 0.5
  );
  grad.addColorStop(0, "rgba(88, 56, 74, 0.52)");
  grad.addColorStop(0.55, "rgba(88, 56, 74, 0.22)");
  grad.addColorStop(1, "rgba(88, 56, 74, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createSoftGlowTexture(
  innerColor = "rgba(255, 240, 190, 0.95)",
  midColor = "rgba(255, 190, 110, 0.42)"
): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    2,
    size / 2,
    size / 2,
    size / 2
  );
  grad.addColorStop(0, innerColor);
  grad.addColorStop(0.45, midColor);
  grad.addColorStop(1, "rgba(255, 190, 110, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createDefaultEaselCardTexture(
  maxAnisotropy: number
): THREE.CanvasTexture {
  const w = 768;
  const h = 960;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Cream archival mat background
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, "#FFF9FB");
  bgGrad.addColorStop(0.5, "#FFFDF7");
  bgGrad.addColorStop(1, "#F5EFFD");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle double gold hairline frame
  ctx.strokeStyle = "#DFBE7B";
  ctx.lineWidth = 4;
  ctx.strokeRect(42, 42, w - 84, h - 84);

  ctx.strokeStyle = "rgba(223, 190, 123, 0.45)";
  ctx.lineWidth = 2;
  ctx.strokeRect(58, 58, w - 116, h - 116);

  // Subtle decorative four-point star emblem in upper center
  const cx = w / 2;
  const cy = 285;
  ctx.fillStyle = "#E4B3C8";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 38);
  ctx.quadraticCurveTo(cx + 6, cy - 6, cx + 38, cy);
  ctx.quadraticCurveTo(cx + 6, cy + 6, cx, cy + 38);
  ctx.quadraticCurveTo(cx - 6, cy + 6, cx - 38, cy);
  ctx.quadraticCurveTo(cx - 6, cy - 6, cx, cy - 38);
  ctx.fill();

  ctx.fillStyle = "#3F303B";
  ctx.textAlign = "center";
  ctx.font = '600 54px "Cormorant Garamond", Georgia, serif';
  ctx.fillText("For Riya Didi", cx, 430);

  ctx.fillStyle = "#8A6D7E";
  ctx.font = 'italic 34px "Cormorant Garamond", Georgia, serif';
  ctx.fillText("A little memory,", cx, 520);
  ctx.fillText("a lot of happiness.", cx, 568);

  // Divider line
  ctx.strokeStyle = "#E4C585";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 90, 640);
  ctx.lineTo(cx + 90, 640);
  ctx.stroke();

  ctx.fillStyle = "#9D8494";
  ctx.font = '500 24px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText("Click Memory to place", cx, 720);
  ctx.fillText("your custom illustration", cx, 756);

  const texture = new THREE.CanvasTexture(canvas);
  return configureColorTexture(texture, maxAnisotropy);
}

export function createUploadedImageTexture(
  image: HTMLImageElement,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const w = 1024;
  const h = 1280;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Warm cream archival mat backdrop so any aspect ratio looks gallery-mounted
  ctx.fillStyle = "#FFFDF8";
  ctx.fillRect(0, 0, w, h);

  const pad = 44;
  const availW = w - pad * 2;
  const availH = h - pad * 2;
  const imgRatio = image.width / Math.max(1, image.height);
  const boxRatio = availW / availH;

  let drawW = availW;
  let drawH = availH;
  if (imgRatio > boxRatio) {
    drawH = availW / imgRatio;
  } else {
    drawW = availH * imgRatio;
  }

  const dx = (w - drawW) / 2;
  const dy = (h - drawH) / 2;
  ctx.drawImage(image, dx, dy, drawW, drawH);

  // Fine gold inner bevel around the artwork
  ctx.strokeStyle = "rgba(218, 182, 108, 0.7)";
  ctx.lineWidth = 3;
  ctx.strokeRect(dx - 2, dy - 2, drawW + 4, drawH + 4);

  const texture = new THREE.CanvasTexture(canvas);
  return configureColorTexture(texture, maxAnisotropy);
}
