import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  AmbientParticlesBuild,
  BirthdayCakeBuild,
  KeepsakeEaselBuild,
  buildAmbientParticles,
  buildBirthdayCake,
  buildFairyGarlandArch,
  buildGiftBoxes,
  buildKeepsakeEasel,
  buildPedestalStage,
  buildWaxSealedLetter,
} from "./models";
import {
  createDefaultEaselCardTexture,
  createUploadedImageTexture,
} from "./proceduralTextures";

export type InteractiveTarget = "candles" | "easel" | "letter" | "gifts";

export interface SceneCallbacks {
  onInteract: (target: InteractiveTarget) => void;
  onContextLost?: () => void;
  onContextRestored?: () => void;
}

// Scratch objects allocated once at module scope (zero per-frame GC)
const _dummy = new THREE.Object3D();
const _raycaster = new THREE.Raycaster();
const _pointer = new THREE.Vector2();

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement("canvas");
    const gl = probeCanvas.getContext("webgl2");
    if (!gl) return true;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? "");
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export class BirthdaySceneManager {
  private container: HTMLElement;
  private callbacks: SceneCallbacks;
  private isSoftwareGl: boolean;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private cakeBuild: BirthdayCakeBuild;
  private easelBuild: KeepsakeEaselBuild;
  private particlesBuild: AmbientParticlesBuild;
  private interactiveProxies: THREE.Object3D[] = [];
  private envMap: THREE.Texture | null = null;
  private currentArtTexture: THREE.Texture | null = null;

  private frameId = 0;
  private disposed = false;
  private lastTimestamp = 0;
  private elapsedTime = 0;
  private candlesLit = true;
  private smokeTimer = 0;
  private celebrationBoost = 0;

  // Smooth camera transition targets (cancelled when user drags)
  private desiredCamPos = new THREE.Vector3(0, 3.1, 6.9);
  private desiredCamTarget = new THREE.Vector3(0, 1.35, 0);
  private isTransitioningCamera = false;

  // Pointer interaction tracking
  private pointerDownPos = { x: 0, y: 0 };
  private lastHoverRaycast = 0;

  constructor(container: HTMLElement, callbacks: SceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.isSoftwareGl = detectSoftwareWebGL();

    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    container.appendChild(this.renderer.domElement);

    // Scene with warm pastel-blush horizon & matching exponential fog
    this.scene = new THREE.Scene();
    const horizonHex = 0xfaf2f5;
    this.scene.background = new THREE.Color(horizonHex);
    this.scene.fog = new THREE.FogExp2(horizonHex, 0.042);

    // Studio IBL reflections via procedural RoomEnvironment on all devices
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.envMap = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;
    this.scene.environment = this.envMap;
    pmremGenerator.dispose();

    // Perspective camera
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.camera.position.set(0, 3.8, 9.2);

    // Damped OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = false;
    this.controls.minDistance = 3.2;
    this.controls.maxDistance = 13.5;
    this.controls.minPolarAngle = Math.PI * 0.12;
    this.controls.maxPolarAngle = Math.PI * 0.47;
    this.controls.target.set(0, 1.35, 0);
    this.controls.addEventListener("start", this.handleControlsStart);

    // 3-Point Warm/Cool Studio Lighting Rig
    const hemiFill = new THREE.HemisphereLight(0xf6edff, 0xf2dfd5, 0.92);
    this.scene.add(hemiFill);

    const keyLight = new THREE.DirectionalLight(0xfff1de, 1.75);
    keyLight.position.set(5.5, 9.2, 6.4);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 26;
    const d = 6.2;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    // Soft pastel rim backlight for crisp silhouette separation
    const rimLight = new THREE.DirectionalLight(0xffd3e6, 0.85);
    rimLight.position.set(-5.8, 5.2, -5.5);
    this.scene.add(rimLight);

    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();

    // Assemble procedural 3D diorama
    const { stageGroup, shadowTexture } = buildPedestalStage(maxAnisotropy);
    this.scene.add(stageGroup);

    this.cakeBuild = buildBirthdayCake(maxAnisotropy, shadowTexture);
    this.scene.add(this.cakeBuild.group);

    this.easelBuild = buildKeepsakeEasel(maxAnisotropy, shadowTexture);
    this.currentArtTexture = this.easelBuild.artworkMaterial.map;
    this.scene.add(this.easelBuild.group);

    const giftsBuild = buildGiftBoxes(maxAnisotropy, shadowTexture);
    this.scene.add(giftsBuild.group);

    const letterBuild = buildWaxSealedLetter(shadowTexture);
    this.scene.add(letterBuild.group);

    const fairyArch = buildFairyGarlandArch();
    this.scene.add(fairyArch);

    this.particlesBuild = buildAmbientParticles();
    this.scene.add(
      this.particlesBuild.starsMesh,
      this.particlesBuild.heartsMesh
    );

    this.interactiveProxies = [
      this.cakeBuild.interactiveProxy,
      this.easelBuild.interactiveProxy,
      letterBuild.interactiveProxy,
      giftsBuild.interactiveProxy,
    ];

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    // Bind events
    window.addEventListener("resize", this.handleResize);
    this.renderer.domElement.addEventListener(
      "pointerdown",
      this.handlePointerDown
    );
    this.renderer.domElement.addEventListener(
      "pointerup",
      this.handlePointerUp
    );
    this.renderer.domElement.addEventListener(
      "pointermove",
      this.handlePointerMove
    );
    this.renderer.domElement.addEventListener(
      "webglcontextlost",
      this.handleContextLost
    );
    this.renderer.domElement.addEventListener(
      "webglcontextrestored",
      this.handleContextRestored
    );

    this.lastTimestamp = performance.now();
    this.tick();
  }

  public setCameraPreset(
    position: [number, number, number],
    target: [number, number, number]
  ): void {
    this.desiredCamPos.set(position[0], position[1], position[2]);
    this.desiredCamTarget.set(target[0], target[1], target[2]);
    this.isTransitioningCamera = true;
  }

  public setCandlesLit(lit: boolean): void {
    const wasLit = this.candlesLit;
    this.candlesLit = lit;
    if (wasLit && !lit) {
      this.smokeTimer = 2.8;
    } else if (lit) {
      this.smokeTimer = 0;
    }
  }

  public triggerCelebrationBurst(): void {
    this.celebrationBoost = 2.4;
  }

  public setIllustrationImage(dataUrl: string | null): void {
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    if (!dataUrl) {
      const nextTex = createDefaultEaselCardTexture(maxAnisotropy);
      this.swapArtworkTexture(nextTex);
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (this.disposed) return;
      const nextTex = createUploadedImageTexture(img, maxAnisotropy);
      this.swapArtworkTexture(nextTex);
    };
    img.src = dataUrl;
  }

  private swapArtworkTexture(nextTex: THREE.Texture): void {
    const prev = this.currentArtTexture;
    this.easelBuild.artworkMaterial.map = nextTex;
    this.easelBuild.artworkMaterial.needsUpdate = true;
    this.currentArtTexture = nextTex;
    if (prev && prev !== nextTex) {
      prev.dispose();
    }
  }

  private handleControlsStart = (): void => {
    this.isTransitioningCamera = false;
  };

  private handleResize = (): void => {
    if (this.disposed) return;
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private updatePointerNdc(event: PointerEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    _pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private handlePointerDown = (event: PointerEvent): void => {
    this.pointerDownPos = { x: event.clientX, y: event.clientY };
  };

  private handlePointerUp = (event: PointerEvent): void => {
    const dx = event.clientX - this.pointerDownPos.x;
    const dy = event.clientY - this.pointerDownPos.y;
    if (Math.hypot(dx, dy) > 8) return; // Ignore orbit drags

    this.updatePointerNdc(event);
    _raycaster.setFromCamera(_pointer, this.camera);
    const hits = _raycaster.intersectObjects(this.interactiveProxies, false);
    if (hits.length > 0) {
      const target = hits[0].object.userData
        .interactiveType as InteractiveTarget;
      if (target) {
        this.callbacks.onInteract(target);
      }
    }
  };

  private handlePointerMove = (event: PointerEvent): void => {
    const now = performance.now();
    if (now - this.lastHoverRaycast < 65) return;
    this.lastHoverRaycast = now;

    this.updatePointerNdc(event);
    _raycaster.setFromCamera(_pointer, this.camera);
    const hits = _raycaster.intersectObjects(this.interactiveProxies, false);
    this.renderer.domElement.style.cursor =
      hits.length > 0 ? "pointer" : "grab";
  };

  private handleContextLost = (event: Event): void => {
    event.preventDefault();
    cancelAnimationFrame(this.frameId);
    window.clearTimeout(this.frameId);
    this.callbacks.onContextLost?.();
  };

  private handleContextRestored = (): void => {
    this.callbacks.onContextRestored?.();
    this.lastTimestamp = performance.now();
    this.tick();
  };

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private tick = (): void => {
    if (this.disposed) return;

    const now = performance.now();
    const dt = Math.min((now - this.lastTimestamp) / 1000, 0.1);
    this.lastTimestamp = now;
    this.elapsedTime += dt;

    // 1. Exponential camera preset damping (stops on arrival or user drag)
    if (this.isTransitioningCamera) {
      const alpha = 1 - Math.exp(-4.2 * dt);
      this.camera.position.lerp(this.desiredCamPos, alpha);
      this.controls.target.lerp(this.desiredCamTarget, alpha);
      if (
        this.camera.position.distanceToSquared(this.desiredCamPos) < 0.0004 &&
        this.controls.target.distanceToSquared(this.desiredCamTarget) < 0.0004
      ) {
        this.camera.position.copy(this.desiredCamPos);
        this.controls.target.copy(this.desiredCamTarget);
        this.isTransitioningCamera = false;
      }
    }
    this.controls.update();

    // 2. Candle flame flicker & smooth extinguish / smoke rise
    if (this.smokeTimer > 0) {
      this.smokeTimer = Math.max(0, this.smokeTimer - dt);
    }

    const targetLightIntensity = this.candlesLit
      ? 2.1 + Math.sin(this.elapsedTime * 11.5) * 0.28
      : 0;
    this.cakeBuild.candlePointLight.intensity = THREE.MathUtils.damp(
      this.cakeBuild.candlePointLight.intensity,
      targetLightIntensity,
      8,
      dt
    );

    const flameTargetScale = this.candlesLit ? 1 : 0.0001;
    for (let i = 0; i < this.cakeBuild.candles.length; i++) {
      const c = this.cakeBuild.candles[i];
      const nextScale = THREE.MathUtils.damp(
        c.flameGroup.scale.y,
        flameTargetScale,
        12,
        dt
      );
      if (this.candlesLit) {
        const flickerY =
          1 +
          Math.sin(this.elapsedTime * 14 + c.phase) * 0.12 +
          Math.cos(this.elapsedTime * 23 + c.phase) * 0.06;
        const flickerX = 1 + Math.sin(this.elapsedTime * 11 + c.phase) * 0.07;
        c.flameGroup.scale.set(
          nextScale * flickerX,
          nextScale * flickerY,
          nextScale * flickerX
        );
        c.flameGroup.rotation.z =
          Math.sin(this.elapsedTime * 9 + c.phase) * 0.09;
        c.halo.material.opacity = 0.65 + (flickerY - 1) * 0.8;
        c.flameGroup.visible = true;
      } else {
        c.flameGroup.scale.setScalar(nextScale);
        c.flameGroup.visible = nextScale > 0.02;
      }

      // Gentle rising smoke wisps immediately after blowing candles out
      for (let s = 0; s < c.smokePuffs.length; s++) {
        const puff = c.smokePuffs[s];
        const mat = puff.material as THREE.MeshBasicMaterial;
        if (!this.candlesLit && this.smokeTimer > 0) {
          const progress = 1 - this.smokeTimer / 2.8;
          const localP = (progress + s * 0.24) % 1;
          puff.position.set(
            Math.sin(localP * 6 + c.phase + s) * 0.065,
            c.baseY + localP * 0.62,
            Math.cos(localP * 5 + s) * 0.04
          );
          puff.scale.setScalar(0.55 + localP * 1.45);
          mat.opacity = Math.sin(localP * Math.PI) * 0.42 * (this.smokeTimer / 2.8);
        } else {
          mat.opacity = 0;
        }
      }
    }

    // 3. Ambient instanced stars & hearts gentle orbital float
    if (this.celebrationBoost > 0) {
      this.celebrationBoost = Math.max(0, this.celebrationBoost - dt * 0.85);
    }
    const speedFactor = 1 + this.celebrationBoost * 1.8;

    const { starsMesh, heartsMesh, starSeeds, heartSeeds } =
      this.particlesBuild;

    for (let i = 0; i < starSeeds.length; i++) {
      const s = starSeeds[i];
      const a = s.angle + this.elapsedTime * s.speed * speedFactor;
      const y =
        s.baseY +
        Math.sin(this.elapsedTime * 1.35 + s.phase) * s.bobAmp +
        this.celebrationBoost * 0.14;
      _dummy.position.set(Math.cos(a) * s.radius, y, Math.sin(a) * s.radius);
      _dummy.rotation.set(
        this.elapsedTime * 0.4 + s.phase,
        this.elapsedTime * 0.8 + s.phase,
        0
      );
      const twinkle =
        s.scale * (0.86 + Math.sin(this.elapsedTime * 2.6 + s.phase) * 0.18);
      _dummy.scale.setScalar(twinkle);
      _dummy.updateMatrix();
      starsMesh.setMatrixAt(i, _dummy.matrix);
    }
    starsMesh.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < heartSeeds.length; i++) {
      const h = heartSeeds[i];
      const a = h.angle + this.elapsedTime * h.speed * speedFactor;
      const y =
        h.baseY +
        Math.sin(this.elapsedTime * 1.15 + h.phase) * h.bobAmp +
        this.celebrationBoost * 0.18;
      _dummy.position.set(Math.cos(a) * h.radius, y, Math.sin(a) * h.radius);
      _dummy.rotation.set(
        Math.sin(this.elapsedTime * 0.6 + h.phase) * 0.18,
        this.elapsedTime * 0.55 + h.phase,
        Math.cos(this.elapsedTime * 0.7 + h.phase) * 0.12
      );
      _dummy.scale.setScalar(h.scale);
      _dummy.updateMatrix();
      heartsMesh.setMatrixAt(i, _dummy.matrix);
    }
    heartsMesh.instanceMatrix.needsUpdate = true;

    // Render frame
    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    window.clearTimeout(this.frameId);

    window.removeEventListener("resize", this.handleResize);
    this.controls.removeEventListener("start", this.handleControlsStart);
    this.renderer.domElement.removeEventListener(
      "pointerdown",
      this.handlePointerDown
    );
    this.renderer.domElement.removeEventListener(
      "pointerup",
      this.handlePointerUp
    );
    this.renderer.domElement.removeEventListener(
      "pointermove",
      this.handlePointerMove
    );
    this.renderer.domElement.removeEventListener(
      "webglcontextlost",
      this.handleContextLost
    );
    this.renderer.domElement.removeEventListener(
      "webglcontextrestored",
      this.handleContextRestored
    );

    this.controls.dispose();

    const disposedGeos = new Set<THREE.BufferGeometry>();
    const disposedMats = new Set<THREE.Material>();
    const disposedTex = new Set<THREE.Texture>();

    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Sprite) {
        if (obj instanceof THREE.Mesh && obj.geometry && !disposedGeos.has(obj.geometry)) {
          obj.geometry.dispose();
          disposedGeos.add(obj.geometry);
        }
        const mats = Array.isArray(obj.material)
          ? obj.material
          : [obj.material];
        mats.forEach((m) => {
          if (!m || disposedMats.has(m)) return;
          disposedMats.add(m);
          const anyMat = m as unknown as Record<string, unknown>;
          for (const key of ["map", "bumpMap", "roughnessMap", "normalMap"]) {
            const tex = anyMat[key];
            if (tex instanceof THREE.Texture && !disposedTex.has(tex)) {
              tex.dispose();
              disposedTex.add(tex);
            }
          }
          m.dispose();
        });
      }
    });

    if (this.envMap) {
      this.envMap.dispose();
      this.envMap = null;
    }

    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
