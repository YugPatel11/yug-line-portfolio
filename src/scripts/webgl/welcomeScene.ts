// src/scripts/webgl/welcomeScene.ts
// Phase U1: Interactive WebGL 3D Metro Scene for Welcome Screen (Rule 6a)
// Features procedural 3D metro train with interactive orbit/parallax,
// warm headlights, physical railway track, and instant 2D fallback.

import * as THREE from 'three';

export class Welcome3DScene {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | null = null;
  private trainGroup: THREE.Group;
  private animId: number = 0;
  private isDestroyed: boolean = false;
  private mouseX: number = 0;
  private targetRotationY: number = -0.35;
  private currentRotationY: number = -0.35;

  constructor(containerId: string, canvasId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    this.trainGroup = new THREE.Group();

    if (this.canvas && this.container) {
      this.init();
    }
  }

  private init() {
    // Check reduced motion preference
    if (document.documentElement.classList.contains('reduce-motion') ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return; // Keep 2D SVG
    }

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.updateSize();

      // Camera position
      this.camera.position.set(0, 2.2, 5.8);
      this.camera.lookAt(0, 0.4, 0);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      this.scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
      dirLight.position.set(4, 8, 4);
      dirLight.castShadow = true;
      this.scene.add(dirLight);

      const warmFill = new THREE.DirectionalLight(0xffc933, 0.6);
      warmFill.position.set(-4, -1, -2);
      this.scene.add(warmFill);

      // Build 3D Metro Model
      this.buildMetroModel();
      this.scene.add(this.trainGroup);

      // Event listeners
      window.addEventListener('resize', this.onResize);
      this.container.addEventListener('mousemove', this.onMouseMove);
      this.container.addEventListener('mouseleave', this.onMouseLeave);

      // Reveal 3D Canvas
      this.canvas.style.display = 'block';
      const svgFallback = document.getElementById('welcome-train-svg');
      if (svgFallback) svgFallback.style.display = 'none';

      // Start render loop
      this.animate();
    } catch (e) {
      console.warn('WebGL init failed, falling back to 2D SVG:', e);
      if (this.canvas) this.canvas.style.display = 'none';
      const svgFallback = document.getElementById('welcome-train-svg');
      if (svgFallback) svgFallback.style.display = 'block';
    }
  }

  private buildMetroModel() {
    const isDark = document.documentElement.classList.contains('dark');
    const bodyColor = isDark ? 0x222630 : 0xebe7df;
    const inkColor = 0x111111;
    const accentYellow = 0xffc933;
    const accentBlue = 0x3b82f6;

    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.3,
      metalness: 0.1,
    });
    const inkMat = new THREE.MeshStandardMaterial({
      color: inkColor,
      roughness: 0.5,
      metalness: 0.2,
    });
    const yellowMat = new THREE.MeshStandardMaterial({
      color: accentYellow,
      roughness: 0.2,
      metalness: 0.1,
    });
    const blueMat = new THREE.MeshStandardMaterial({
      color: accentBlue,
      roughness: 0.2,
      metalness: 0.1,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x08090c,
      roughness: 0.1,
      metalness: 0.9,
    });
    const glowHeadlightMat = new THREE.MeshBasicMaterial({
      color: 0xffe066,
    });

    // 1. Tracks & Sleepers
    const railMat = new THREE.MeshStandardMaterial({ color: 0x8892a0, metalness: 0.8, roughness: 0.3 });
    const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.8 });

    // Left & Right Rails
    const railGeom = new THREE.BoxGeometry(0.08, 0.1, 7.5);
    const railL = new THREE.Mesh(railGeom, railMat);
    railL.position.set(-0.7, -0.05, 0);
    this.trainGroup.add(railL);

    const railR = new THREE.Mesh(railGeom, railMat);
    railR.position.set(0.7, -0.05, 0);
    this.trainGroup.add(railR);

    // Sleepers / Wooden Ties
    const sleeperGeom = new THREE.BoxGeometry(1.8, 0.08, 0.22);
    for (let z = -3.5; z <= 3.5; z += 0.45) {
      const sleeper = new THREE.Mesh(sleeperGeom, sleeperMat);
      sleeper.position.set(0, -0.12, z);
      this.trainGroup.add(sleeper);
    }

    // 2. Metro Carriage Body (Length: 4.2m, Width: 1.5m, Height: 1.4m)
    const bodyGeom = new THREE.BoxGeometry(1.4, 1.25, 4.0);
    const mainBody = new THREE.Mesh(bodyGeom, bodyMat);
    mainBody.position.set(0, 0.8, 0);
    this.trainGroup.add(mainBody);

    // Aerodynamic Nose Cone
    const noseGeom = new THREE.CylinderGeometry(0.7, 0.7, 1.25, 16, 1, false, 0, Math.PI);
    const nose = new THREE.Mesh(noseGeom, bodyMat);
    nose.rotation.y = -Math.PI / 2;
    nose.position.set(0, 0.8, 2.0);
    this.trainGroup.add(nose);

    // Livery Stripes
    const stripeGeom = new THREE.BoxGeometry(1.42, 0.1, 4.1);
    const stripeYellow = new THREE.Mesh(stripeGeom, yellowMat);
    stripeYellow.position.set(0, 0.45, 0);
    this.trainGroup.add(stripeYellow);

    const stripeBlue = new THREE.Mesh(stripeGeom, blueMat);
    stripeBlue.position.set(0, 0.33, 0);
    this.trainGroup.add(stripeBlue);

    // Roof AC Units
    const acGeom = new THREE.BoxGeometry(0.8, 0.15, 0.9);
    const ac1 = new THREE.Mesh(acGeom, inkMat);
    ac1.position.set(0, 1.5, 0.8);
    this.trainGroup.add(ac1);

    const ac2 = new THREE.Mesh(acGeom, inkMat);
    ac2.position.set(0, 1.5, -0.8);
    this.trainGroup.add(ac2);

    // Windows (Side Glass Strips)
    const windowGeom = new THREE.BoxGeometry(1.44, 0.4, 0.8);
    for (const z of [-1.2, 0, 1.0]) {
      const sideWin = new THREE.Mesh(windowGeom, glassMat);
      sideWin.position.set(0, 0.95, z);
      this.trainGroup.add(sideWin);
    }

    // Front Windshield
    const windshieldGeom = new THREE.BoxGeometry(1.0, 0.45, 0.3);
    const windshield = new THREE.Mesh(windshieldGeom, glassMat);
    windshield.position.set(0, 0.95, 2.3);
    windshield.rotation.x = 0.2;
    this.trainGroup.add(windshield);

    // Glowing Dual Headlights
    const lightGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 12);
    lightGeom.rotateX(Math.PI / 2);

    const headL = new THREE.Mesh(lightGeom, glowHeadlightMat);
    headL.position.set(-0.4, 0.45, 2.45);
    this.trainGroup.add(headL);

    const headR = new THREE.Mesh(lightGeom, glowHeadlightMat);
    headR.position.set(0.4, 0.45, 2.45);
    this.trainGroup.add(headR);

    // Headlight Spotlights
    const spotL = new THREE.SpotLight(0xfffae6, 2, 8, Math.PI / 6, 0.3);
    spotL.position.set(-0.4, 0.45, 2.5);
    spotL.target.position.set(-0.4, 0, 6);
    this.trainGroup.add(spotL);
    this.trainGroup.add(spotL.target);

    const spotR = new THREE.SpotLight(0xfffae6, 2, 8, Math.PI / 6, 0.3);
    spotR.position.set(0.4, 0.45, 2.5);
    spotR.target.position.set(0.4, 0, 6);
    this.trainGroup.add(spotR);
    this.trainGroup.add(spotR.target);

    // Wheels / Bogies
    const wheelGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16);
    wheelGeom.rotateZ(Math.PI / 2);

    for (const z of [-1.5, -0.9, 0.9, 1.5]) {
      const wL = new THREE.Mesh(wheelGeom, inkMat);
      wL.position.set(-0.68, 0.12, z);
      this.trainGroup.add(wL);

      const wR = new THREE.Mesh(wheelGeom, inkMat);
      wR.position.set(0.68, 0.12, z);
      this.trainGroup.add(wR);
    }

    // Initial Rotation
    this.trainGroup.rotation.y = this.currentRotationY;
  }

  private onResize = () => {
    this.updateSize();
  };

  private updateSize() {
    if (!this.renderer || !this.container) return;
    const width = this.container.clientWidth;
    const height = Math.min(260, Math.max(160, Math.floor(width * 0.42)));

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private onMouseMove = (e: MouseEvent) => {
    const rect = this.container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    this.mouseX = x;
    this.targetRotationY = -0.35 + x * 0.9;
  };

  private onMouseLeave = () => {
    this.targetRotationY = -0.35;
  };

  private animate = () => {
    if (this.isDestroyed) return;

    // Smooth inertia lerp
    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.05;
    this.trainGroup.rotation.y = this.currentRotationY;

    // Subtle breathing bounce
    const time = Date.now() * 0.002;
    this.trainGroup.position.y = Math.sin(time) * 0.03;

    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }

    this.animId = requestAnimationFrame(this.animate);
  };

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.onResize);
    if (this.container) {
      this.container.removeEventListener('mousemove', this.onMouseMove);
      this.container.removeEventListener('mouseleave', this.onMouseLeave);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
