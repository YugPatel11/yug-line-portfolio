// src/scripts/webgl/welcomeScene.ts
// Phase U1: Award-Winning WebGL 3D Metro Showcase for Welcome Splash Screen (Rule 6a)
// Features authentic 2-car electric subway consist (Lead Cab + Passenger Carriage),
// textured with Kenney CC0 subway kit, polished continuous steel rails,
// architectural dark graphite transit plinth, studio 3-point lighting,
// warm glowing forward headlights, and smooth 360° interactive turntable rotation.

import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export class Welcome3DScene {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | null = null;
  private rootGroup: THREE.Group;
  private trainGroup: THREE.Group;
  private plinthGroup: THREE.Group;
  private animId: number = 0;
  private isDestroyed: boolean = false;
  private isDragging: boolean = false;
  private previousMouseX: number = 0;
  private targetRotationY: number = -0.65; // Dynamic 3/4 isometric transit angle (~37°)
  private currentRotationY: number = -0.65;
  private autoRotateSpeed: number = 0.0025;

  constructor(containerId: string, canvasId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    this.rootGroup = new THREE.Group();
    this.trainGroup = new THREE.Group();
    this.plinthGroup = new THREE.Group();

    if (this.canvas && this.container) {
      this.init();
    }
  }

  private init() {
    // Check reduced motion preference
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

      // Camera: Elevated 3/4 isometric transit perspective showing cab and flank
      this.camera.position.set(4.8, 2.5, 4.4);
      this.camera.lookAt(0, 0.55, 0);

      // Studio 3-Point Lighting Setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
      this.scene.add(ambientLight);

      // 1. Studio Key Directional Light (Warm White)
      const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.4);
      keyLight.position.set(5, 8, 6);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      this.scene.add(keyLight);

      // 2. Amber Transit Rim Light (Edge definition on roofline and carriage contours)
      const rimLight = new THREE.DirectionalLight(0xffaa33, 1.6);
      rimLight.position.set(-6, 3, -5);
      this.scene.add(rimLight);

      // 3. Cool Shadow Fill Light (Soft contrast)
      const fillLight = new THREE.DirectionalLight(0x64748b, 0.8);
      fillLight.position.set(0, -2, 4);
      this.scene.add(fillLight);

      // Build Architectural Plinth & Railway Track
      this.buildPlinthAndTrack();

      // Load 2-Car Subway Consist (Car A + Car B)
      this.loadSubwayTrainConsist();

      // Assemble Root Group
      this.rootGroup.add(this.plinthGroup);
      this.rootGroup.add(this.trainGroup);
      this.scene.add(this.rootGroup);

      // Initial rotation
      this.rootGroup.rotation.y = this.currentRotationY;

      // Event listeners for interactive turntable drag
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

      // Start render loop
      this.animate();
    } catch (e) {
      console.warn('WebGL init failed, falling back to 2D SVG:', e);
      if (this.canvas) this.canvas.style.display = 'none';
      const svgFallback = document.getElementById('welcome-train-svg');
      if (svgFallback) svgFallback.style.display = 'block';
    }
  }

  private buildPlinthAndTrack() {
    // 1. Architectural Display Plinth (Dark graphite beveled slab)
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x141822,
      roughness: 0.45,
      metalness: 0.35,
    });
    const plinthGeom = new THREE.BoxGeometry(2.1, 0.12, 6.8);
    const plinth = new THREE.Mesh(plinthGeom, plinthMat);
    plinth.position.set(0, -0.06, 0);
    plinth.receiveShadow = true;
    this.plinthGroup.add(plinth);

    // Subtle Amber Transit Guide Lines along pedestal sides
    const guideMat = new THREE.MeshStandardMaterial({
      color: 0xffb000,
      emissive: 0xffa000,
      emissiveIntensity: 0.3,
      roughness: 0.3,
    });
    const guideGeom = new THREE.BoxGeometry(0.02, 0.02, 6.78);
    
    const guideL = new THREE.Mesh(guideGeom, guideMat);
    guideL.position.set(-1.04, 0.005, 0);
    this.plinthGroup.add(guideL);

    const guideR = new THREE.Mesh(guideGeom, guideMat);
    guideR.position.set(1.04, 0.005, 0);
    this.plinthGroup.add(guideR);

    // 2. Continuous Polished Steel Rails
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.15,
    });
    const railGeom = new THREE.BoxGeometry(0.06, 0.08, 6.6);

    const railL = new THREE.Mesh(railGeom, railMat);
    railL.position.set(-0.48, 0.08, 0);
    this.plinthGroup.add(railL);

    const railR = new THREE.Mesh(railGeom, railMat);
    railR.position.set(0.48, 0.08, 0);
    this.plinthGroup.add(railR);

    // 3. Wooden / Concrete Track Sleepers (Ties)
    const sleeperMat = new THREE.MeshStandardMaterial({
      color: 0x1f242e,
      roughness: 0.85,
      metalness: 0.1,
    });
    const sleeperGeom = new THREE.BoxGeometry(1.4, 0.05, 0.16);
    for (let z = -3.1; z <= 3.1; z += 0.38) {
      const sleeper = new THREE.Mesh(sleeperGeom, sleeperMat);
      sleeper.position.set(0, 0.03, z);
      this.plinthGroup.add(sleeper);
    }
  }

  private loadSubwayTrainConsist() {
    const texLoader = new THREE.TextureLoader();
    const colormap = texLoader.load('/models/colormap.png', () => {
      if (this.renderer) this.renderer.render(this.scene, this.camera);
    });
    colormap.colorSpace = THREE.SRGBColorSpace;
    colormap.magFilter = THREE.NearestFilter;
    colormap.minFilter = THREE.NearestFilter;

    // High-craft materials using authentic palette
    const bodyMaterial = new THREE.MeshStandardMaterial({
      map: colormap,
      roughness: 0.35,
      metalness: 0.25,
    });

    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b313d,
      roughness: 0.2,
      metalness: 0.85,
    });

    const objLoader = new OBJLoader();

    // 1. Load Car A (Front Lead Carriage with Cab & Headlights)
    objLoader.load(
      '/models/train-electric-subway-a.obj',
      (carA) => {
        carA.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = mesh.name.includes('wheel') ? wheelMaterial : bodyMaterial;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        // Car A position: Lead position at front of train
        carA.scale.set(1.05, 1.05, 1.05);
        carA.position.set(0.08, 0.1, 1.35); // Center offset & align
        this.trainGroup.add(carA);

        // Add Realistic Glowing Headlights to front cab
        this.addGlowingHeadlights();
      },
      undefined,
      (err) => {
        console.warn('Could not load Car A OBJ model:', err);
        this.buildProceduralTrain();
      }
    );

    // 2. Load Car B (Passenger Carriage coupled behind Car A)
    objLoader.load(
      '/models/train-electric-subway-b.obj',
      (carB) => {
        carB.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = mesh.name.includes('wheel') ? wheelMaterial : bodyMaterial;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        // Car B position: Coupled directly behind Car A
        carB.scale.set(1.05, 1.05, 1.05);
        carB.position.set(0, 0.1, -1.35);
        this.trainGroup.add(carB);
      },
      undefined,
      (err) => {
        console.warn('Could not load Car B OBJ model:', err);
      }
    );
  }

  private addGlowingHeadlights() {
    // Dual Glowing Headlight Lenses on Car A Front Nose
    const lightGeom = new THREE.SphereGeometry(0.055, 16, 16);
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfff0b3,
      emissiveIntensity: 2.5,
      roughness: 0.1,
    });

    const headL = new THREE.Mesh(lightGeom, lightMat);
    headL.position.set(-0.28, 0.62, 2.68);
    this.trainGroup.add(headL);

    const headR = new THREE.Mesh(lightGeom, lightMat);
    headR.position.set(0.28, 0.62, 2.68);
    this.trainGroup.add(headR);

    // Warm Forward-Casting Spotlights onto Track
    const spotL = new THREE.SpotLight(0xfff5cc, 2.2, 7, Math.PI / 8, 0.4);
    spotL.position.set(-0.28, 0.62, 2.7);
    spotL.target.position.set(-0.28, 0, 6.0);
    this.trainGroup.add(spotL);
    this.trainGroup.add(spotL.target);

    const spotR = new THREE.SpotLight(0xfff5cc, 2.2, 7, Math.PI / 8, 0.4);
    spotR.position.set(0.28, 0.62, 2.7);
    spotR.target.position.set(0.28, 0, 6.0);
    this.trainGroup.add(spotR);
    this.trainGroup.add(spotR.target);
  }

  private buildProceduralTrain() {
    const isDark = document.documentElement.classList.contains('dark');
    const bodyMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1f232c : 0xe4dfd5,
      roughness: 0.3,
      metalness: 0.2,
    });
    const yellowMat = new THREE.MeshStandardMaterial({
      color: 0xffc933,
      emissive: 0xffb000,
      emissiveIntensity: 0.3,
      roughness: 0.25,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x090b0e,
      roughness: 0.1,
      metalness: 0.9,
    });

    const bodyGeom = new THREE.BoxGeometry(1.25, 1.1, 4.8);
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.set(0, 0.72, 0);
    this.trainGroup.add(body);

    const stripeGeom = new THREE.BoxGeometry(1.27, 0.1, 4.82);
    const stripe = new THREE.Mesh(stripeGeom, yellowMat);
    stripe.position.set(0, 0.42, 0);
    this.trainGroup.add(stripe);

    const glassGeom = new THREE.BoxGeometry(1.29, 0.32, 4.2);
    const glass = new THREE.Mesh(glassGeom, glassMat);
    glass.position.set(0, 0.88, 0);
    this.trainGroup.add(glass);

    this.addGlowingHeadlights();
  }

  private onResize = () => {
    this.updateSize();
  };

  private updateSize() {
    if (!this.renderer || !this.container) return;
    const width = this.container.clientWidth;
    const height = Math.min(320, Math.max(220, Math.floor(width * 0.48)));

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  // Interactive Turntable Drag Controls
  private onMouseDown = (e: MouseEvent) => {
    this.isDragging = true;
    this.previousMouseX = e.clientX;
  };

  private onMouseMove = (e: MouseEvent) => {
    if (this.isDragging) {
      const deltaX = e.clientX - this.previousMouseX;
      this.targetRotationY += deltaX * 0.009;
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
      this.targetRotationY += deltaX * 0.009;
      this.previousMouseX = e.touches[0].clientX;
    }
  };

  private onTouchEnd = () => {
    this.isDragging = false;
  };

  private animate = () => {
    if (this.isDestroyed) return;

    // Gentle Auto-Turntable when idle
    if (!this.isDragging) {
      this.targetRotationY += this.autoRotateSpeed;
    }

    // Smooth inertia interpolation
    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.08;
    this.rootGroup.rotation.y = this.currentRotationY;

    // Natural subtle track vibration
    const time = Date.now() * 0.003;
    this.trainGroup.position.y = Math.sin(time) * 0.012;

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
