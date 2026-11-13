// src/scripts/webgl/welcomeScene.ts
// Phase U1: High-Craft WebGL 3D Metro Showcase for Welcome Screen (Rule 6a)
// Features textured 3D electric subway carriage from Kenney Train Kit (CC0),
// studio 3-point lighting, glowing front headlights, steel track bed,
// illuminated transit pedestal, and smooth interactive turntable rotation.

import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export class Welcome3DScene {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | null = null;
  private trainGroup: THREE.Group;
  private trackGroup: THREE.Group;
  private animId: number = 0;
  private isDestroyed: boolean = false;
  private isDragging: boolean = false;
  private previousMouseX: number = 0;
  private targetRotationY: number = -0.45;
  private currentRotationY: number = -0.45;
  private autoRotateSpeed: number = 0.003;

  constructor(containerId: string, canvasId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    this.trainGroup = new THREE.Group();
    this.trackGroup = new THREE.Group();

    if (this.canvas && this.container) {
      this.init();
    }
  }

  private init() {
    // Respect reduced motion
    if (document.documentElement.classList.contains('reduce-motion') ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.updateSize();

      // Camera: Elevated 3/4 isometric perspective
      this.camera.position.set(2.8, 2.0, 4.6);
      this.camera.lookAt(0, 0.5, 0);

      // Studio Lighting Setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
      this.scene.add(ambientLight);

      // Key Directional Light (Warm White)
      const keyLight = new THREE.DirectionalLight(0xfff7ea, 2.2);
      keyLight.position.set(5, 7, 5);
      keyLight.castShadow = true;
      this.scene.add(keyLight);

      // Amber Rim Light (Highlights transit livery and roof contours)
      const rimLight = new THREE.DirectionalLight(0xffc933, 1.8);
      rimLight.position.set(-6, 3, -4);
      this.scene.add(rimLight);

      // Cool Cyan Fill Light (Soft contrast)
      const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.9);
      fillLight.position.set(0, -3, 4);
      this.scene.add(fillLight);

      // Build Pedestal & Environment
      this.buildStageEnvironment();

      // Load High-Res Kenney Electric Subway Carriage
      this.loadSubwayModel();

      // Add to scene
      this.scene.add(this.trackGroup);
      this.scene.add(this.trainGroup);

      // Event Listeners for Interactive Turntable Drag
      window.addEventListener('resize', this.onResize);
      this.container.addEventListener('mousedown', this.onMouseDown);
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('mouseup', this.onMouseUp);

      this.container.addEventListener('touchstart', this.onTouchStart, { passive: true });
      window.addEventListener('touchmove', this.onTouchMove, { passive: true });
      window.addEventListener('touchend', this.onTouchEnd);

      // Reveal 3D Canvas
      this.canvas.style.display = 'block';
      const svgFallback = document.getElementById('welcome-train-svg');
      if (svgFallback) svgFallback.style.display = 'none';

      // Start Animation Loop
      this.animate();
    } catch (e) {
      console.warn('WebGL init failed, keeping 2D SVG:', e);
      if (this.canvas) this.canvas.style.display = 'none';
      const svgFallback = document.getElementById('welcome-train-svg');
      if (svgFallback) svgFallback.style.display = 'block';
    }
  }

  private buildStageEnvironment() {
    // 1. Sleek Transit Showcase Pedestal Disk
    const pedestalGeom = new THREE.CylinderGeometry(2.4, 2.6, 0.18, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x11141a,
      roughness: 0.3,
      metalness: 0.6,
    });
    const pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
    pedestal.position.set(0, -0.09, 0);
    pedestal.receiveShadow = true;
    this.trackGroup.add(pedestal);

    // Glowing Yellow Perimeter Ring
    const ringGeom = new THREE.TorusGeometry(2.45, 0.035, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffc933,
      emissive: 0xffb000,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, -0.01, 0);
    this.trackGroup.add(ring);

    // 2. Railway Track Rails (Left & Right Steel Bars)
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xa0a8b8,
      metalness: 0.9,
      roughness: 0.2,
    });
    const railGeom = new THREE.BoxGeometry(0.08, 0.1, 4.4);

    const railL = new THREE.Mesh(railGeom, railMat);
    railL.position.set(-0.62, 0.08, 0);
    this.trackGroup.add(railL);

    const railR = new THREE.Mesh(railGeom, railMat);
    railR.position.set(0.62, 0.08, 0);
    this.trackGroup.add(railR);

    // 3. Wooden Railway Sleepers / Ties
    const sleeperMat = new THREE.MeshStandardMaterial({
      color: 0x1f232b,
      roughness: 0.9,
    });
    const sleeperGeom = new THREE.BoxGeometry(1.6, 0.06, 0.18);
    for (let z = -1.9; z <= 1.9; z += 0.38) {
      const sleeper = new THREE.Mesh(sleeperGeom, sleeperMat);
      sleeper.position.set(0, 0.03, z);
      this.trackGroup.add(sleeper);
    }
  }

  private loadSubwayModel() {
    const texLoader = new THREE.TextureLoader();
    const colormap = texLoader.load('/models/colormap.png', () => {
      if (this.renderer) this.renderer.render(this.scene, this.camera);
    });
    colormap.colorSpace = THREE.SRGBColorSpace;
    colormap.magFilter = THREE.NearestFilter;
    colormap.minFilter = THREE.NearestFilter;

    const subwayMaterial = new THREE.MeshStandardMaterial({
      map: colormap,
      roughness: 0.35,
      metalness: 0.3,
    });

    const objLoader = new OBJLoader();
    objLoader.load(
      '/models/train-electric-subway-a.obj',
      (obj) => {
        obj.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = subwayMaterial;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        // Perfect scale and centering
        obj.scale.set(1.4, 1.4, 1.4);
        obj.position.set(0.12, 0.12, 0); // Correct Kenney pivot offset

        this.trainGroup.add(obj);

        // Add Glowing Front Headlights
        this.addGlowingHeadlights();
      },
      undefined,
      (err) => {
        console.warn('Could not load OBJ model, using procedural model:', err);
        this.buildProceduralTrain();
      }
    );
  }

  private addGlowingHeadlights() {
    // Dual Glowing Headlight Orbs
    const lightGeom = new THREE.SphereGeometry(0.08, 16, 16);
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffeb80,
      emissiveIntensity: 2.0,
      roughness: 0.1,
    });

    const headL = new THREE.Mesh(lightGeom, lightMat);
    headL.position.set(-0.35, 0.65, 1.85);
    this.trainGroup.add(headL);

    const headR = new THREE.Mesh(lightGeom, lightMat);
    headR.position.set(0.35, 0.65, 1.85);
    this.trainGroup.add(headR);

    // Warm Forward Spotlights
    const spotL = new THREE.SpotLight(0xfff0b3, 3.0, 9, Math.PI / 7, 0.35);
    spotL.position.set(-0.35, 0.65, 1.9);
    spotL.target.position.set(-0.35, 0, 6);
    this.trainGroup.add(spotL);
    this.trainGroup.add(spotL.target);

    const spotR = new THREE.SpotLight(0xfff0b3, 3.0, 9, Math.PI / 7, 0.35);
    spotR.position.set(0.35, 0.65, 1.9);
    spotR.target.position.set(0.35, 0, 6);
    this.trainGroup.add(spotR);
    this.trainGroup.add(spotR.target);
  }

  private buildProceduralTrain() {
    const isDark = document.documentElement.classList.contains('dark');
    const bodyMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x222630 : 0xebe7df,
      roughness: 0.3,
      metalness: 0.2,
    });
    const yellowMat = new THREE.MeshStandardMaterial({
      color: 0xffc933,
      emissive: 0xffb000,
      emissiveIntensity: 0.3,
      roughness: 0.3,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c10,
      roughness: 0.1,
      metalness: 0.9,
    });

    const bodyGeom = new THREE.BoxGeometry(1.3, 1.15, 3.2);
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.set(0, 0.75, 0);
    this.trainGroup.add(body);

    const stripeGeom = new THREE.BoxGeometry(1.32, 0.12, 3.22);
    const stripe = new THREE.Mesh(stripeGeom, yellowMat);
    stripe.position.set(0, 0.45, 0);
    this.trainGroup.add(stripe);

    const glassGeom = new THREE.BoxGeometry(1.34, 0.35, 2.6);
    const glass = new THREE.Mesh(glassGeom, glassMat);
    glass.position.set(0, 0.92, 0);
    this.trainGroup.add(glass);

    this.addGlowingHeadlights();
  }

  private onResize = () => {
    this.updateSize();
  };

  private updateSize() {
    if (!this.renderer || !this.container) return;
    const width = this.container.clientWidth;
    const height = Math.min(320, Math.max(200, Math.floor(width * 0.48)));

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  // Interactive Drag Controls
  private onMouseDown = (e: MouseEvent) => {
    this.isDragging = true;
    this.previousMouseX = e.clientX;
  };

  private onMouseMove = (e: MouseEvent) => {
    if (this.isDragging) {
      const deltaX = e.clientX - this.previousMouseX;
      this.targetRotationY += deltaX * 0.008;
      this.previousMouseX = e.clientX;
    }
  };

  private onMouseUp = () => {
    this.isDragging = false;
  };

  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      this.isDragging = true;
      this.previousMouseX = e.touches[0].clientX;
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    if (this.isDragging && e.touches.length > 0) {
      const deltaX = e.touches[0].clientX - this.previousMouseX;
      this.targetRotationY += deltaX * 0.008;
      this.previousMouseX = e.touches[0].clientX;
    }
  };

  private onTouchEnd = () => {
    this.isDragging = false;
  };

  private animate = () => {
    if (this.isDestroyed) return;

    // Gentle Auto-Turntable when not actively dragging
    if (!this.isDragging) {
      this.targetRotationY += this.autoRotateSpeed;
    }

    // Smooth inertia interpolation
    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.08;
    this.trainGroup.rotation.y = this.currentRotationY;
    this.trackGroup.rotation.y = this.currentRotationY;

    // Subtle natural suspension bounce
    const time = Date.now() * 0.0025;
    this.trainGroup.position.y = Math.sin(time) * 0.02;

    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }

    this.animId = requestAnimationFrame(this.animate);
  };

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
