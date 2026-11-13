// src/scripts/webgl/welcomeScene.ts
// Ultra-Realistic Front-Facing 3D Metro Train Consist (Screen-Facing Hero Perspective)
// High-fidelity procedural textures: brushed stainless steel, aerodynamic cab,
// illuminated driver console, dual projector LED headlights with chrome reflectors,
// destination matrix LED sign, articulated diamond roof pantograph, and 4-line transit livery.

import * as THREE from 'three';

export class Welcome3DScene {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | null = null;
  private rootGroup: THREE.Group;
  private trainGroup: THREE.Group;
  private plinthGroup: THREE.Group;
  private envTexture: THREE.Texture | null = null;
  private frontTexture: THREE.Texture | null = null;
  private flankTexture: THREE.Texture | null = null;
  private animId: number = 0;
  private isDestroyed: boolean = false;
  private rollInProgress: number = 0;

  constructor(containerId: string, canvasId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    this.rootGroup = new THREE.Group();
    this.trainGroup = new THREE.Group();
    this.plinthGroup = new THREE.Group();

    if (this.canvas && this.container) {
      this.init();
    }
  }

  private init() {
    if (
      document.documentElement.classList.contains('reduce-motion') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
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

      // Camera: Elevated front-3/4 angle where the train directly faces the user
      // Front cab, windshield, headlights, destination sign, and side flank are all clearly visible
      this.camera.position.set(1.45, 1.25, 3.85);
      this.camera.lookAt(0.1, 0.65, 0.85);

      // Studio Reflection Environment
      this.setupStudioEnvironment();

      // Natural Calibrated Lighting Setup (Front-facing key light)
      this.setupLighting();

      // Generate Procedural High-Resolution Textures
      this.frontTexture = this.generateCabFrontTexture();
      this.flankTexture = this.generateFlankTexture();

      // Build Plinth & Railway Track Bed
      this.buildPlinthAndTrack();

      // Build Ultra-Realistic Metro Train Facing Screen
      this.buildRealisticFrontFacingTrain();

      // Assemble Root Group
      this.rootGroup.add(this.plinthGroup);
      this.rootGroup.add(this.trainGroup);
      this.scene.add(this.rootGroup);

      // Lock to screen-facing hero angle
      this.rootGroup.rotation.y = 0.05;
      this.rootGroup.rotation.x = 0.02;

      // Event listener for resize
      window.addEventListener('resize', this.onResize);

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

  // =========================================================================
  // HIGH-RESOLUTION PROCEDURAL TEXTURES (THE SECRET TO REALISTIC URBAN RAIL)
  // =========================================================================
  private generateCabFrontTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // 1. Brushed Stainless Steel Base Gradient with subtle horizontal grain
    const baseGrad = ctx.createLinearGradient(0, 0, 1024, 0);
    baseGrad.addColorStop(0, '#c2c7d4');
    baseGrad.addColorStop(0.2, '#dde2ed');
    baseGrad.addColorStop(0.5, '#eef2fa');
    baseGrad.addColorStop(0.8, '#dde2ed');
    baseGrad.addColorStop(1, '#c2c7d4');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Micro-grain metallic striations
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let y = 0; y < 1024; y += 4) {
      ctx.fillRect(0, y, 1024, 1.5);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
    for (let y = 2; y < 1024; y += 6) {
      ctx.fillRect(0, y, 1024, 1);
    }

    // 2. Aerodynamic Black Front Mask Surround
    ctx.fillStyle = '#12151c';
    ctx.beginPath();
    ctx.roundRect(110, 140, 804, 720, [40, 40, 20, 20]);
    ctx.fill();

    // Subtle carbon/graphite texture inside mask
    ctx.fillStyle = '#181c26';
    ctx.beginPath();
    ctx.roundRect(120, 150, 784, 700, [32, 32, 16, 16]);
    ctx.fill();

    // 3. Destination LED Matrix Sign (Amber matrix reading "CENTRAL // EXP 01")
    ctx.fillStyle = '#080a0e';
    ctx.fillRect(220, 180, 584, 76);
    ctx.strokeStyle = '#283244';
    ctx.lineWidth = 3;
    ctx.strokeRect(220, 180, 584, 76);

    ctx.fillStyle = '#f2b705';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CENTRAL // EXPRESS 01', 512, 218);

    // Top Red Clearance Marker Lights
    ctx.fillStyle = '#e4572e';
    ctx.beginPath();
    ctx.arc(170, 218, 14, 0, Math.PI * 2);
    ctx.arc(854, 218, 14, 0, Math.PI * 2);
    ctx.fill();

    // 4. Large Aerodynamic Windshield Glass
    const glassGrad = ctx.createLinearGradient(0, 270, 0, 580);
    glassGrad.addColorStop(0, '#0c1018');
    glassGrad.addColorStop(0.5, '#161d2b');
    glassGrad.addColorStop(1, '#0e121a');
    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.roundRect(150, 270, 724, 310, [18, 18, 12, 12]);
    ctx.fill();

    // Ceramic black frit dots border around glass
    ctx.strokeStyle = '#080a0f';
    ctx.lineWidth = 14;
    ctx.stroke();

    // Cockpit Interior: Illuminated instrument dials & driver console
    ctx.fillStyle = '#2fb584';
    ctx.fillRect(400, 520, 90, 20);
    ctx.fillStyle = '#f2b705';
    ctx.fillRect(520, 520, 80, 20);

    // Driver Seat Silhouette
    ctx.fillStyle = '#1c2230';
    ctx.beginPath();
    ctx.roundRect(460, 420, 104, 110, [16, 16, 4, 4]);
    ctx.fill();

    // Dual Black Windshield Wipers
    ctx.strokeStyle = '#06080b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(340, 570);
    ctx.lineTo(460, 470);
    ctx.moveTo(600, 570);
    ctx.lineTo(720, 470);
    ctx.stroke();

    // 5. 4-Line Transit Livery Strip across the Nose (#E4572E, #F2B705, #0B6E4F, #1B3A8A)
    const stripeY = 620;
    const stripeH = 14;
    ctx.fillStyle = '#e4572e';
    ctx.fillRect(140, stripeY, 744, stripeH);
    ctx.fillStyle = '#f2b705';
    ctx.fillRect(140, stripeY + stripeH, 744, stripeH);
    ctx.fillStyle = '#0b6e4f';
    ctx.fillRect(140, stripeY + stripeH * 2, 744, stripeH);
    ctx.fillStyle = '#1b3a8a';
    ctx.fillRect(140, stripeY + stripeH * 3, 744, stripeH);

    // 6. Dual Projector LED Headlight Clusters
    const drawHeadlight = (cx: number) => {
      // Outer Chrome Bezel
      const chromeGrad = ctx.createRadialGradient(cx, 745, 10, cx, 745, 60);
      chromeGrad.addColorStop(0, '#ffffff');
      chromeGrad.addColorStop(0.7, '#c8d1e0');
      chromeGrad.addColorStop(1, '#6c7a91');
      ctx.fillStyle = chromeGrad;
      ctx.beginPath();
      ctx.arc(cx, 745, 58, 0, Math.PI * 2);
      ctx.fill();

      // Deep Reflector Dish
      ctx.fillStyle = '#10141c';
      ctx.beginPath();
      ctx.arc(cx, 745, 48, 0, Math.PI * 2);
      ctx.fill();

      // Glowing LED Projector Lens
      const lensGrad = ctx.createRadialGradient(cx, 745, 0, cx, 745, 42);
      lensGrad.addColorStop(0, '#ffffff');
      lensGrad.addColorStop(0.3, '#fffbe8');
      lensGrad.addColorStop(0.7, '#f5deb3');
      lensGrad.addColorStop(1, '#8a7b60');
      ctx.fillStyle = lensGrad;
      ctx.beginPath();
      ctx.arc(cx, 745, 42, 0, Math.PI * 2);
      ctx.fill();

      // Amber Halo Marker Ring
      ctx.strokeStyle = '#f2b705';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, 745, 48, 0, Math.PI * 2);
      ctx.stroke();
    };

    drawHeadlight(280);
    drawHeadlight(744);

    // 7. Lower Anti-Climber Impact Bumper with Ribbed Slats
    ctx.fillStyle = '#181b22';
    ctx.fillRect(140, 830, 744, 95);
    ctx.fillStyle = '#0d0f14';
    for (let bx = 160; bx < 860; bx += 28) {
      ctx.fillRect(bx, 835, 14, 85);
    }

    // Coupler Pocket Notch
    ctx.fillStyle = '#080a0d';
    ctx.fillRect(452, 850, 120, 95);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  private generateFlankTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // 1. Brushed Stainless Steel Flank Gradient
    const baseGrad = ctx.createLinearGradient(0, 0, 0, 512);
    baseGrad.addColorStop(0, '#d2d7e4');
    baseGrad.addColorStop(0.4, '#eef2fa');
    baseGrad.addColorStop(0.8, '#d8dde8');
    baseGrad.addColorStop(1, '#c2c7d4');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 2048, 512);

    // Micro-grain horizontal brushed striations
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let y = 0; y < 512; y += 3) {
      ctx.fillRect(0, y, 2048, 1.2);
    }

    // 2. Dark Continuous Window Belt Band
    ctx.fillStyle = '#12151d';
    ctx.fillRect(0, 90, 2048, 175);

    // Smoked Glass Windows with Interior Warm Light & Passenger Seats
    const drawWindow = (x: number, w: number) => {
      const winGrad = ctx.createLinearGradient(x, 105, x, 245);
      winGrad.addColorStop(0, '#101520');
      winGrad.addColorStop(0.5, '#1e2638');
      winGrad.addColorStop(1, '#141a24');
      ctx.fillStyle = winGrad;
      ctx.beginPath();
      ctx.roundRect(x, 105, w, 140, 8);
      ctx.fill();

      // Interior warm ceiling illumination glow
      const glowGrad = ctx.createLinearGradient(x, 105, x, 160);
      glowGrad.addColorStop(0, 'rgba(255, 242, 216, 0.45)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(x + 4, 105, w - 8, 55);

      // Passenger seat outline
      ctx.fillStyle = '#1a2233';
      ctx.beginPath();
      ctx.roundRect(x + 20, 180, 45, 60, 6);
      ctx.fill();
    };

    [120, 360, 600, 980, 1220, 1460, 1700].forEach((wx) => drawWindow(wx, 180));

    // 3. Double Sliding Passenger Doors with Rubber Gaskets & Stainless Handles
    const drawDoors = (dx: number) => {
      ctx.fillStyle = '#222733';
      ctx.fillRect(dx, 80, 140, 270);
      ctx.fillStyle = '#c8ceda';
      ctx.fillRect(dx + 4, 84, 63, 262);
      ctx.fillRect(dx + 73, 84, 63, 262);

      // Door glass inserts
      ctx.fillStyle = '#101520';
      ctx.fillRect(dx + 12, 105, 47, 120);
      ctx.fillRect(dx + 81, 105, 47, 120);

      // Center rubber gasket
      ctx.fillStyle = '#080a0e';
      ctx.fillRect(dx + 68, 80, 4, 270);

      // Handles
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(dx + 58, 200, 4, 40);
      ctx.fillRect(dx + 78, 200, 4, 40);
    };

    drawDoors(800);
    drawDoors(1900);

    // 4. Horizontal Fluted Corrugated Ribs
    ctx.fillStyle = '#b4bac8';
    [290, 315, 340].forEach((fy) => {
      ctx.fillRect(0, fy, 2048, 6);
    });

    // 5. 4-Line Livery Enamel Pinstripes (#E4572E, #F2B705, #0B6E4F, #1B3A8A)
    const stripeY = 380;
    const stripeH = 14;
    ctx.fillStyle = '#e4572e';
    ctx.fillRect(0, stripeY, 2048, stripeH);
    ctx.fillStyle = '#f2b705';
    ctx.fillRect(0, stripeY + stripeH, 2048, stripeH);
    ctx.fillStyle = '#0b6e4f';
    ctx.fillRect(0, stripeY + stripeH * 2, 2048, stripeH);
    ctx.fillStyle = '#1b3a8a';
    ctx.fillRect(0, stripeY + stripeH * 3, 2048, stripeH);

    // Unit Numbering Monogram
    ctx.fillStyle = '#0a0d13';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('CAR YR-01 // CENTRAL TERMINAL TRANSIT', 140, 480);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // =========================================================================
  // PROCEDURAL STUDIO ENVIRONMENT FOR AUTHENTIC METALLIC REFLECTIONS
  // =========================================================================
  private setupStudioEnvironment() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const bgGrad = ctx.createLinearGradient(0, 0, 0, 256);
    bgGrad.addColorStop(0, '#0c1017');
    bgGrad.addColorStop(0.35, '#1b2230');
    bgGrad.addColorStop(0.5, '#2f394c');
    bgGrad.addColorStop(0.55, '#151922');
    bgGrad.addColorStop(1, '#090b10');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 256);

    // Overhead linear station LED tube light banks
    const tubeGrad = ctx.createRadialGradient(256, 35, 10, 256, 35, 200);
    tubeGrad.addColorStop(0, '#ffffff');
    tubeGrad.addColorStop(0.35, '#f5efe0');
    tubeGrad.addColorStop(0.7, '#8e9eb5');
    tubeGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = tubeGrad;
    ctx.fillRect(40, 0, 432, 95);

    // Side platform ambient floor bounce (#F2B705)
    const platformGrad = ctx.createLinearGradient(0, 150, 0, 256);
    platformGrad.addColorStop(0, 'rgba(242, 183, 5, 0.16)');
    platformGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = platformGrad;
    ctx.fillRect(0, 150, 512, 106);

    this.envTexture = new THREE.CanvasTexture(canvas);
    this.envTexture.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.environment = this.envTexture;
  }

  // =========================================================================
  // NATURAL CALIBRATED LIGHTING SETUP (Front Face High-Contrast Illumination)
  // =========================================================================
  private setupLighting() {
    // 1. Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    this.scene.add(ambientLight);

    // 2. Direct Front-Facing Key Light (Directly illuminates the front cab)
    const frontKeyLight = new THREE.DirectionalLight(0xfffdf6, 2.6);
    frontKeyLight.position.set(2.5, 4.5, 5.5);
    frontKeyLight.castShadow = true;
    frontKeyLight.shadow.mapSize.width = 1024;
    frontKeyLight.shadow.mapSize.height = 1024;
    frontKeyLight.shadow.bias = -0.0004;
    this.scene.add(frontKeyLight);

    // 3. Cool Slate Left Fill Light (Prevents dark unlit shadow on left cab)
    const fillLight = new THREE.DirectionalLight(0x8295b0, 1.4);
    fillLight.position.set(-3.5, 3.2, 4.2);
    this.scene.add(fillLight);

    // 4. Roof & Pantograph Rim Light
    const rimLight = new THREE.DirectionalLight(0xdde6f5, 1.6);
    rimLight.position.set(-1.5, 6.0, -3.5);
    this.scene.add(rimLight);
  }

  // =========================================================================
  // ARCHITECTURAL TRACK BED & PLATFORM PLINTH
  // =========================================================================
  private buildPlinthAndTrack() {
    // 1. Foundation Slab
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x10131a,
      roughness: 0.5,
      metalness: 0.35,
    });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.14, 7.4), plinthMat);
    plinth.position.set(0, -0.07, 0);
    plinth.receiveShadow = true;
    this.plinthGroup.add(plinth);

    // Ballast gravel top bed
    const ballastMat = new THREE.MeshStandardMaterial({
      color: 0x171b24,
      roughness: 0.95,
      metalness: 0.1,
    });
    const ballast = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.04, 7.34), ballastMat);
    ballast.position.set(0, 0.02, 0);
    ballast.receiveShadow = true;
    this.plinthGroup.add(ballast);

    // 2. Sleepers (Ties) with Steel Plates
    const tieMat = new THREE.MeshStandardMaterial({ color: 0x222733, roughness: 0.8, metalness: 0.15 });
    const tiePlateMat = new THREE.MeshStandardMaterial({ color: 0x3e4554, roughness: 0.4, metalness: 0.8 });
    const tieGeom = new THREE.BoxGeometry(1.5, 0.06, 0.15);
    const plateGeom = new THREE.BoxGeometry(0.12, 0.02, 0.14);

    for (let z = -3.5; z <= 3.5; z += 0.36) {
      const tie = new THREE.Mesh(tieGeom, tieMat);
      tie.position.set(0, 0.06, z);
      tie.castShadow = true;
      tie.receiveShadow = true;
      this.plinthGroup.add(tie);

      const plateL = new THREE.Mesh(plateGeom, tiePlateMat);
      plateL.position.set(-0.48, 0.095, z);
      this.plinthGroup.add(plateL);

      const plateR = new THREE.Mesh(plateGeom, tiePlateMat);
      plateR.position.set(0.48, 0.095, z);
      this.plinthGroup.add(plateR);
    }

    // 3. Polished Steel Running Rails (Running directly forward toward camera)
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xa8b4c7,
      metalness: 0.96,
      roughness: 0.1,
    });
    const railGeom = new THREE.BoxGeometry(0.05, 0.08, 7.34);

    const railL = new THREE.Mesh(railGeom, railMat);
    railL.position.set(-0.48, 0.13, 0);
    railL.castShadow = true;
    railL.receiveShadow = true;
    this.plinthGroup.add(railL);

    const railR = new THREE.Mesh(railGeom, railMat);
    railR.position.set(0.48, 0.13, 0);
    railR.castShadow = true;
    railR.receiveShadow = true;
    this.plinthGroup.add(railR);

    // 4. Platform Edge with Tactile Yellow Safety Pavers (#F2B705)
    const platformSlab = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.18, 7.34),
      new THREE.MeshStandardMaterial({ color: 0x151822, roughness: 0.6, metalness: 0.25 })
    );
    platformSlab.position.set(0.98, 0.1, 0);
    platformSlab.receiveShadow = true;
    this.plinthGroup.add(platformSlab);

    const yellowSafetyMat = new THREE.MeshStandardMaterial({
      color: 0xf2b705,
      emissive: 0xf2b705,
      emissiveIntensity: 0.25,
      roughness: 0.35,
    });
    const safetyStrip = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.015, 7.34), yellowSafetyMat);
    safetyStrip.position.set(0.77, 0.195, 0);
    this.plinthGroup.add(safetyStrip);

    const studGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.01, 8);
    for (let z = -3.4; z <= 3.4; z += 0.2) {
      const stud = new THREE.Mesh(studGeom, yellowSafetyMat);
      stud.position.set(0.77, 0.205, z);
      this.plinthGroup.add(stud);
    }
  }

  // =========================================================================
  // ULTRA-REALISTIC FRONT-FACING METRO TRAIN
  // =========================================================================
  private buildRealisticFrontFacingTrain() {
    const stainlessSteelMat = new THREE.MeshStandardMaterial({
      color: 0xd6dae4,
      metalness: 0.82,
      roughness: 0.2,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf2f6fc,
      metalness: 0.98,
      roughness: 0.06,
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x141720,
      metalness: 0.6,
      roughness: 0.4,
    });

    const bogieSteelMat = new THREE.MeshStandardMaterial({ color: 0x1c202a, metalness: 0.65, roughness: 0.65 });
    const wheelSteelMat = new THREE.MeshStandardMaterial({ color: 0x2b313f, metalness: 0.92, roughness: 0.14 });

    // -------------------------------------------------------------
    // Helper: 2-Axle Bogie Truck
    // -------------------------------------------------------------
    const createBogie = (zCenter: number): THREE.Group => {
      const bogie = new THREE.Group();
      bogie.position.set(0, 0, zCenter);

      const sideBeamGeom = new THREE.BoxGeometry(0.07, 0.09, 0.9);
      const sideBeamL = new THREE.Mesh(sideBeamGeom, bogieSteelMat);
      sideBeamL.position.set(-0.55, 0.25, 0);
      sideBeamL.castShadow = true;
      bogie.add(sideBeamL);

      const sideBeamR = new THREE.Mesh(sideBeamGeom, bogieSteelMat);
      sideBeamR.position.set(0.55, 0.25, 0);
      sideBeamR.castShadow = true;
      bogie.add(sideBeamR);

      const transom = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.08, 0.22), bogieSteelMat);
      transom.position.set(0, 0.25, 0);
      bogie.add(transom);

      // Axles & Wheels
      const axlePositions = [-0.3, 0.3];
      const axleGeom = new THREE.CylinderGeometry(0.025, 0.025, 1.1, 16);
      axleGeom.rotateZ(Math.PI / 2);

      const wheelGeom = new THREE.CylinderGeometry(0.125, 0.125, 0.05, 24);
      wheelGeom.rotateZ(Math.PI / 2);

      const flangeGeom = new THREE.CylinderGeometry(0.142, 0.142, 0.015, 24);
      flangeGeom.rotateZ(Math.PI / 2);

      const hubGeom = new THREE.CylinderGeometry(0.045, 0.045, 0.07, 16);
      hubGeom.rotateZ(Math.PI / 2);

      axlePositions.forEach((az) => {
        const axle = new THREE.Mesh(axleGeom, wheelSteelMat);
        axle.position.set(0, 0.24, az);
        bogie.add(axle);

        const wheelL = new THREE.Mesh(wheelGeom, wheelSteelMat);
        wheelL.position.set(-0.48, 0.24, az);
        wheelL.castShadow = true;
        bogie.add(wheelL);

        const flangeL = new THREE.Mesh(flangeGeom, wheelSteelMat);
        flangeL.position.set(-0.51, 0.24, az);
        bogie.add(flangeL);

        const hubL = new THREE.Mesh(hubGeom, chromeMat);
        hubL.position.set(-0.525, 0.24, az);
        bogie.add(hubL);

        const wheelR = new THREE.Mesh(wheelGeom, wheelSteelMat);
        wheelR.position.set(0.48, 0.24, az);
        wheelR.castShadow = true;
        bogie.add(wheelR);

        const flangeR = new THREE.Mesh(flangeGeom, wheelSteelMat);
        flangeR.position.set(0.51, 0.24, az);
        bogie.add(flangeR);

        const hubR = new THREE.Mesh(hubGeom, chromeMat);
        hubR.position.set(0.525, 0.24, az);
        bogie.add(hubR);
      });

      // Third Rail Contact Shoe
      const shoe = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.03, 0.22),
        new THREE.MeshStandardMaterial({ color: 0xf2b705, metalness: 0.85, roughness: 0.25 })
      );
      shoe.position.set(-0.62, 0.17, 0);
      bogie.add(shoe);

      return bogie;
    };

    // -------------------------------------------------------------
    // Helper: Articulated Diamond Roof Pantograph
    // -------------------------------------------------------------
    const createArticulatedPantograph = (zCenter: number): THREE.Group => {
      const pantograph = new THREE.Group();
      pantograph.position.set(0, 1.42, zCenter);

      const insulatorMat = new THREE.MeshStandardMaterial({ color: 0x9e432b, roughness: 0.4, metalness: 0.3 });

      // 4 Insulator Footings
      const insulatorGeom = new THREE.CylinderGeometry(0.024, 0.03, 0.06, 12);
      [
        [-0.24, -0.2],
        [0.24, -0.2],
        [-0.24, 0.2],
        [0.24, 0.2],
      ].forEach(([ix, iz]) => {
        const post = new THREE.Mesh(insulatorGeom, insulatorMat);
        post.position.set(ix, 0.03, iz);
        pantograph.add(post);
      });

      // Base Frame
      const baseFrame = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.02, 0.44), chromeMat);
      baseFrame.position.set(0, 0.07, 0);
      pantograph.add(baseFrame);

      // Lower Arm
      const lowerArmGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.46, 10);
      lowerArmGeom.rotateX(Math.PI / 4.2);

      const lowerArmL = new THREE.Mesh(lowerArmGeom, chromeMat);
      lowerArmL.position.set(-0.16, 0.22, -0.06);
      pantograph.add(lowerArmL);

      const lowerArmR = new THREE.Mesh(lowerArmGeom, chromeMat);
      lowerArmR.position.set(0.16, 0.22, -0.06);
      pantograph.add(lowerArmR);

      // Upper Diamond Arms
      const upperArmGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.42, 10);
      upperArmGeom.rotateX(-Math.PI / 5.2);

      const upperArmL = new THREE.Mesh(upperArmGeom, chromeMat);
      upperArmL.position.set(-0.12, 0.51, -0.07);
      pantograph.add(upperArmL);

      const upperArmR = new THREE.Mesh(upperArmGeom, chromeMat);
      upperArmR.position.set(0.12, 0.51, -0.07);
      pantograph.add(upperArmR);

      // Top Carbon Collector Bow
      const collectorBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 0.02, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x222630, metalness: 0.9, roughness: 0.2 })
      );
      collectorBar.position.set(0, 0.66, 0.06);
      pantograph.add(collectorBar);

      // Horn Endtips
      const hornGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.08, 8);
      hornGeom.rotateZ(Math.PI / 3);

      const hornL = new THREE.Mesh(hornGeom, chromeMat);
      hornL.position.set(-0.38, 0.63, 0.06);
      pantograph.add(hornL);

      const hornR = new THREE.Mesh(hornGeom, chromeMat);
      hornR.position.set(0.38, 0.63, 0.06);
      hornR.rotation.z = -Math.PI / 3;
      pantograph.add(hornR);

      return pantograph;
    };

    // -------------------------------------------------------------
    // CAR A: LEAD CARRIAGE (Facing Screen Forward at +Z)
    // -------------------------------------------------------------
    const carA = new THREE.Group();
    const carALength = 3.2;
    const carAWidth = 1.28;
    const carAHeight = 0.98;
    const bodyBaseY = 0.88;
    const carAZ = 0.4;

    // 1. Main Carriage Body with Textured Flank
    const flankMaterial = new THREE.MeshStandardMaterial({
      map: this.flankTexture,
      metalness: 0.8,
      roughness: 0.22,
    });

    const carABody = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth, carAHeight, carALength),
      flankMaterial
    );
    carABody.position.set(0, bodyBaseY, carAZ);
    carABody.castShadow = true;
    carABody.receiveShadow = true;
    carA.add(carABody);

    // 2. Arched Stainless Steel Roof Crown
    const carARoof = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.08, 0.08, carALength),
      stainlessSteelMat
    );
    carARoof.position.set(0, bodyBaseY + carAHeight / 2 + 0.035, carAZ);
    carA.add(carARoof);

    // -------------------------------------------------------------
    // SCREEN-FACING AERODYNAMIC FRONT CAB (+Z)
    // -------------------------------------------------------------
    const cabFrontZ = carAZ + carALength / 2; // Z = 2.0
    const noseLength = 0.55;

    // Aerodynamic Nose Base
    const cabNose = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.02, carAHeight - 0.02, noseLength),
      stainlessSteelMat
    );
    cabNose.position.set(0, bodyBaseY, cabFrontZ + noseLength / 2 - 0.05);
    cabNose.castShadow = true;
    carA.add(cabNose);

    // High-Resolution Textured Front Face Plate (Displays Windshield, LED Lights & Matrix Sign)
    const frontPlateMat = new THREE.MeshStandardMaterial({
      map: this.frontTexture,
      metalness: 0.75,
      roughness: 0.25,
    });
    const frontPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(carAWidth - 0.04, carAHeight - 0.04),
      frontPlateMat
    );
    frontPlate.position.set(0, bodyBaseY, cabFrontZ + noseLength);
    carA.add(frontPlate);

    // 3D Physical Chrome Headlight Bezels with Glowing LED Lens Bulbs
    const bezelGeom = new THREE.CylinderGeometry(0.075, 0.075, 0.04, 20);
    bezelGeom.rotateX(Math.PI / 2);
    const lensGeom = new THREE.SphereGeometry(0.055, 16, 16);
    const ledLensMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfffaea,
      emissiveIntensity: 4.8,
      roughness: 0.04,
    });

    [-0.34, 0.34].forEach((hx) => {
      // Chrome surround bezel
      const bezel = new THREE.Mesh(bezelGeom, chromeMat);
      bezel.position.set(hx, bodyBaseY - 0.22, cabFrontZ + noseLength + 0.015);
      carA.add(bezel);

      // Projector Lens Bulb
      const lens = new THREE.Mesh(lensGeom, ledLensMat);
      lens.position.set(hx, bodyBaseY - 0.22, cabFrontZ + noseLength + 0.035);
      carA.add(lens);

      // Forward SpotLight projecting soft warm beam along rails toward viewer
      const spot = new THREE.SpotLight(0xfffae8, 3.5, 9.5, Math.PI / 7, 0.45);
      spot.position.set(hx, bodyBaseY - 0.22, cabFrontZ + noseLength + 0.08);
      spot.target.position.set(hx, 0.08, cabFrontZ + noseLength + 6.0);
      carA.add(spot);
      carA.add(spot.target);
    });

    // Lower Front Chin Scoop & Knuckle Coupler Protruding Forward
    const chinSpoiler = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.08, 0.16, 0.24),
      darkTrimMat
    );
    chinSpoiler.position.set(0, bodyBaseY - 0.44, cabFrontZ + noseLength - 0.02);
    carA.add(chinSpoiler);

    const coupler = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.1, 0.32),
      new THREE.MeshStandardMaterial({ color: 0x242932, metalness: 0.95, roughness: 0.25 })
    );
    coupler.position.set(0, 0.36, cabFrontZ + noseLength + 0.14);
    carA.add(coupler);

    // Car A Articulated Roof Pantograph & Roof HVAC
    carA.add(createArticulatedPantograph(carAZ - 0.1));

    const hvacA = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.1, 0.8), darkTrimMat);
    hvacA.position.set(0, 1.41, carAZ + 0.9);
    carA.add(hvacA);

    // Car A Bogies
    carA.add(createBogie(carAZ - 0.7));
    carA.add(createBogie(carAZ + 0.7));

    this.trainGroup.add(carA);

    // -------------------------------------------------------------
    // GANGWAY BELLOWS & CAR B (REAR COACH RECEDING IN PERSPECTIVE)
    // -------------------------------------------------------------
    const bellows = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.1, carAHeight - 0.08, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x12141a, roughness: 0.85, metalness: 0.2 })
    );
    bellows.position.set(0, bodyBaseY, carAZ - carALength / 2 - 0.11);
    this.trainGroup.add(bellows);

    const carB = new THREE.Group();
    const carBLength = 2.4;
    const carBZ = carAZ - carALength / 2 - 0.22 - carBLength / 2;

    const carBBody = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth, carAHeight, carBLength),
      flankMaterial
    );
    carBBody.position.set(0, bodyBaseY, carBZ);
    carB.add(carBBody);

    const carBRoof = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.08, 0.08, carBLength),
      stainlessSteelMat
    );
    carBRoof.position.set(0, bodyBaseY + carAHeight / 2 + 0.035, carBZ);
    carB.add(carBRoof);

    carB.add(createBogie(carBZ - 0.55));
    carB.add(createBogie(carBZ + 0.55));

    this.trainGroup.add(carB);
  }

  // =========================================================================
  // VIEWPORT RESIZE
  // =========================================================================
  private onResize = () => {
    this.updateSize();
  };

  private updateSize() {
    if (!this.renderer || !this.container) return;
    const width = this.container.clientWidth;
    const height = Math.min(330, Math.max(230, Math.floor(width * 0.48)));

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  // =========================================================================
  // ANIMATION LOOP (Smooth Forward Arrival & Gentle Suspension Breathing)
  // =========================================================================
  private animate = () => {
    if (this.isDestroyed) return;

    // 1. Smooth Cinematic Arrival Glide forward along rails into platform berth
    if (this.rollInProgress < 1) {
      this.rollInProgress += (1 - this.rollInProgress) * 0.045;
      const rollOffset = (1 - this.rollInProgress) * -3.2;
      this.trainGroup.position.z = rollOffset;
    } else {
      this.trainGroup.position.z = 0;
    }

    // 2. Subtle Idle Suspension Breathing (Gentle vertical float, strictly facing screen)
    const time = Date.now() * 0.0018;
    this.trainGroup.position.y = Math.sin(time) * 0.007;

    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }

    this.animId = requestAnimationFrame(this.animate);
  };

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.onResize);
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.envTexture) {
      this.envTexture.dispose();
    }
    if (this.frontTexture) {
      this.frontTexture.dispose();
    }
    if (this.flankTexture) {
      this.flankTexture.dispose();
    }
  }
}
