// src/scripts/webgl/welcomeScene.ts
// Ultra-Realistic Front-Facing 3D Metro Train Consist (Screen-Facing Hero Perspective)
// Features screen-facing aerodynamic cab, dual projector LED headlights with chrome reflectors,
// raked panoramic windshield with wipers and illuminated driver console, amber destination matrix sign,
// articulated diamond roof pantograph, brushed stainless steel body with procedural studio reflections,
// 4-line transit livery, 2-axle bogies with flanged steel wheels, and subtle station arrival & idle suspension breathing.

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
  private animId: number = 0;
  private isDestroyed: boolean = false;
  private rollInProgress: number = 0;

  constructor(containerId: string, canvasId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
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

      // Camera: Cinematic front-3/4 angle where train directly faces the screen
      // Slanted ~15° so front cab, windshield, headlights, and right flank are all prominent
      this.camera.position.set(1.15, 1.25, 4.2);
      this.camera.lookAt(0.05, 0.68, 0.95);

      // Setup Studio Reflection Environment
      this.setupStudioEnvironment();

      // Natural Calibrated Lighting Setup
      this.setupLighting();

      // Build Plinth & Railway Track Bed
      this.buildPlinthAndTrack();

      // Build Ultra-Realistic Metro Train Facing the Screen
      this.buildRealisticFrontFacingTrain();

      // Assemble Root Group
      this.rootGroup.add(this.plinthGroup);
      this.rootGroup.add(this.trainGroup);
      this.scene.add(this.rootGroup);

      // Keep fixed orientation (No rotation away from screen)
      this.rootGroup.rotation.y = 0.08; // Subtle natural track skew
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
  // PROCEDURAL STUDIO ENVIRONMENT FOR AUTHENTIC METALLIC REFLECTIONS
  // =========================================================================
  private setupStudioEnvironment() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Background gradient: dark concourse tunnel environment
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 256);
    bgGrad.addColorStop(0, '#0d1017');
    bgGrad.addColorStop(0.35, '#1a2230');
    bgGrad.addColorStop(0.5, '#2e384b');
    bgGrad.addColorStop(0.55, '#151922');
    bgGrad.addColorStop(1, '#090b10');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 256);

    // Overhead linear station LED tube light banks (Crisp specular highlights)
    const tubeGrad = ctx.createRadialGradient(256, 35, 10, 256, 35, 200);
    tubeGrad.addColorStop(0, '#ffffff');
    tubeGrad.addColorStop(0.35, '#f5efe0');
    tubeGrad.addColorStop(0.7, '#8e9eb5');
    tubeGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = tubeGrad;
    ctx.fillRect(40, 0, 432, 95);

    // Side platform ambient floor bounce (Site yellow accent #F2B705)
    const platformGrad = ctx.createLinearGradient(0, 150, 0, 256);
    platformGrad.addColorStop(0, 'rgba(242, 183, 5, 0.14)');
    platformGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = platformGrad;
    ctx.fillRect(0, 150, 512, 106);

    this.envTexture = new THREE.CanvasTexture(canvas);
    this.envTexture.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.environment = this.envTexture;
  }

  // =========================================================================
  // NATURAL CALIBRATED LIGHTING SETUP
  // =========================================================================
  private setupLighting() {
    // 1. Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    // 2. Primary Key Light (Warm White from upper right)
    const keyLight = new THREE.DirectionalLight(0xfffdf6, 2.5);
    keyLight.position.set(4.5, 6.8, 5.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    this.scene.add(keyLight);

    // 3. Cool Slate Fill Light (Softens front cab shadow)
    const fillLight = new THREE.DirectionalLight(0x7587a1, 1.2);
    fillLight.position.set(-4.5, 3.2, 4.0);
    this.scene.add(fillLight);

    // 4. Roof & Pantograph Rim Light
    const rimLight = new THREE.DirectionalLight(0xdde6f5, 1.5);
    rimLight.position.set(-2, 5.5, -4);
    this.scene.add(rimLight);
  }

  // =========================================================================
  // ARCHITECTURAL TRACK BED & PLATFORM PLINTH
  // =========================================================================
  private buildPlinthAndTrack() {
    // 1. Dark Graphite Foundation Slab
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x10131a,
      roughness: 0.5,
      metalness: 0.35,
    });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 7.2), plinthMat);
    plinth.position.set(0, -0.07, 0);
    plinth.receiveShadow = true;
    this.plinthGroup.add(plinth);

    // Ballast gravel top bed
    const ballastMat = new THREE.MeshStandardMaterial({
      color: 0x171b24,
      roughness: 0.95,
      metalness: 0.1,
    });
    const ballast = new THREE.Mesh(new THREE.BoxGeometry(2.34, 0.04, 7.14), ballastMat);
    ballast.position.set(0, 0.02, 0);
    ballast.receiveShadow = true;
    this.plinthGroup.add(ballast);

    // 2. Concrete Sleepers (Ties) with Steel Baseplates
    const tieMat = new THREE.MeshStandardMaterial({
      color: 0x222733,
      roughness: 0.8,
      metalness: 0.15,
    });
    const tiePlateMat = new THREE.MeshStandardMaterial({
      color: 0x3e4554,
      roughness: 0.4,
      metalness: 0.8,
    });
    const tieGeom = new THREE.BoxGeometry(1.5, 0.06, 0.15);
    const plateGeom = new THREE.BoxGeometry(0.12, 0.02, 0.14);

    for (let z = -3.4; z <= 3.4; z += 0.36) {
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

    // 3. Continuous Polished Steel Running Rails (Running directly towards viewer)
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xa8b4c7,
      metalness: 0.96,
      roughness: 0.1,
    });
    const railGeom = new THREE.BoxGeometry(0.05, 0.08, 7.14);

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

    // 4. Station Platform Edge with Tactile Yellow Safety Pavers (#F2B705)
    const platformSlabMat = new THREE.MeshStandardMaterial({
      color: 0x151822,
      roughness: 0.6,
      metalness: 0.25,
    });
    const platformSlab = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.18, 7.14), platformSlabMat);
    platformSlab.position.set(0.97, 0.1, 0);
    platformSlab.receiveShadow = true;
    this.plinthGroup.add(platformSlab);

    const yellowSafetyMat = new THREE.MeshStandardMaterial({
      color: 0xf2b705,
      emissive: 0xf2b705,
      emissiveIntensity: 0.25,
      roughness: 0.35,
    });
    const safetyStrip = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.015, 7.14), yellowSafetyMat);
    safetyStrip.position.set(0.77, 0.195, 0);
    this.plinthGroup.add(safetyStrip);

    // Raised tactile warning studs
    const studGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.01, 8);
    for (let z = -3.3; z <= 3.3; z += 0.2) {
      const stud = new THREE.Mesh(studGeom, yellowSafetyMat);
      stud.position.set(0.77, 0.205, z);
      this.plinthGroup.add(stud);
    }
  }

  // =========================================================================
  // ULTRA-REALISTIC FRONT-FACING METRO TRAIN
  // =========================================================================
  private buildRealisticFrontFacingTrain() {
    // -------------------------------------------------------------
    // High-Fidelity Materials with Accurate Realism
    // -------------------------------------------------------------
    const brushedStainlessMat = new THREE.MeshStandardMaterial({
      color: 0xd8dce6,
      metalness: 0.85,
      roughness: 0.18,
    });

    const darkAeroMaskMat = new THREE.MeshStandardMaterial({
      color: 0x141720,
      metalness: 0.65,
      roughness: 0.35,
    });

    const corrugatedFluteMat = new THREE.MeshStandardMaterial({
      color: 0xc4c9d6,
      metalness: 0.9,
      roughness: 0.22,
    });

    const windowPillarMat = new THREE.MeshStandardMaterial({
      color: 0x0f1218,
      metalness: 0.7,
      roughness: 0.3,
    });

    const smokedGlassMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      metalness: 0.92,
      roughness: 0.04,
      transparent: true,
      opacity: 0.88,
    });

    const interiorPassengerMat = new THREE.MeshStandardMaterial({
      color: 0xfff2d8,
      emissive: 0xffe2a4,
      emissiveIntensity: 0.35,
      roughness: 0.5,
    });

    const seatMat = new THREE.MeshStandardMaterial({ color: 0x1e2738, roughness: 0.7 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf0f4fa, metalness: 0.98, roughness: 0.06 });
    const wheelSteelMat = new THREE.MeshStandardMaterial({ color: 0x2b313f, metalness: 0.92, roughness: 0.14 });
    const bogieSteelMat = new THREE.MeshStandardMaterial({ color: 0x1c202a, metalness: 0.65, roughness: 0.65 });

    // Site 4-Line Enamel Livery Materials
    const stripeFrontendMat = new THREE.MeshStandardMaterial({ color: 0xe4572e, roughness: 0.35 });
    const stripeHardwareMat = new THREE.MeshStandardMaterial({ color: 0xf2b705, roughness: 0.35 });
    const stripeBackendMat = new THREE.MeshStandardMaterial({ color: 0x0b6e4f, roughness: 0.35 });
    const stripeAIMat = new THREE.MeshStandardMaterial({ color: 0x1b3a8a, roughness: 0.35 });

    // -------------------------------------------------------------
    // Helper: Build High-Detail 2-Axle Bogie Truck
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

      // Springs
      const springMat = new THREE.MeshStandardMaterial({ color: 0x485164, metalness: 0.85, roughness: 0.25 });
      const springGeom = new THREE.CylinderGeometry(0.035, 0.035, 0.12, 12);
      [-0.55, 0.55].forEach((sx) => {
        [-0.15, 0.15].forEach((sz) => {
          const spring = new THREE.Mesh(springGeom, springMat);
          spring.position.set(sx, 0.32, sz);
          bogie.add(spring);
        });
      });

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
    // Helper: Build High-Detail Articulated Diamond Roof Pantograph
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

      // Base Support Frame
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

      // Curved Horn Endtips
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
    // 1. CAR A: LEAD CARRIAGE FACING DIRECTLY FORWARD TOWARDS SCREEN
    // -------------------------------------------------------------
    const carA = new THREE.Group();
    const carALength = 3.0;
    const carAWidth = 1.26;
    const carAHeight = 0.96;
    const bodyBaseY = 0.88;
    const carAZ = 0.3; // Center position

    // Main Stainless Steel Carriage Body
    const carABody = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth, carAHeight, carALength),
      brushedStainlessMat
    );
    carABody.position.set(0, bodyBaseY, carAZ);
    carABody.castShadow = true;
    carABody.receiveShadow = true;
    carA.add(carABody);

    // Arched Roof Crown
    const carARoof = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.08, 0.08, carALength),
      brushedStainlessMat
    );
    carARoof.position.set(0, bodyBaseY + carAHeight / 2 + 0.035, carAZ);
    carA.add(carARoof);

    // Dark Structural Window Belt on Side Flanks
    const windowBelt = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth + 0.015, 0.38, carALength - 0.2),
      windowPillarMat
    );
    windowBelt.position.set(0, bodyBaseY + 0.08, carAZ);
    carA.add(windowBelt);

    // Warm Interior Cabin Luminescence
    const interiorA = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.16, carAHeight - 0.16, carALength - 0.3),
      interiorPassengerMat
    );
    interiorA.position.set(0, bodyBaseY, carAZ);
    carA.add(interiorA);

    // Passenger Panoramic Smoked Glass Side Windows
    const glassPaneGeom = new THREE.BoxGeometry(0.02, 0.32, 0.54);
    [-0.5, 0.3, 1.1].forEach((wz) => {
      const glassR = new THREE.Mesh(glassPaneGeom, smokedGlassMat);
      glassR.position.set(carAWidth / 2 + 0.01, bodyBaseY + 0.08, carAZ + wz);
      carA.add(glassR);

      const glassL = new THREE.Mesh(glassPaneGeom, smokedGlassMat);
      glassL.position.set(-(carAWidth / 2 + 0.01), bodyBaseY + 0.08, carAZ + wz);
      carA.add(glassL);
    });

    // Sliding Passenger Doors (Platform Facing)
    const doorFrameR = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.72, 0.44), darkAeroMaskMat);
    doorFrameR.position.set(carAWidth / 2 + 0.01, bodyBaseY - 0.06, carAZ - 0.1);
    carA.add(doorFrameR);

    // Fluted Stainless Steel Ribs along lower flank
    const fluteRibGeom = new THREE.BoxGeometry(carAWidth + 0.02, 0.016, carALength - 0.1);
    [-0.18, -0.23, -0.28].forEach((ry) => {
      const rib = new THREE.Mesh(fluteRibGeom, corrugatedFluteMat);
      rib.position.set(0, bodyBaseY + ry, carAZ);
      carA.add(rib);
    });

    // 4-Line Livery Enamel Pinstripes
    const stripeThickness = 0.022;
    const stripeLiveryGeom = new THREE.BoxGeometry(carAWidth + 0.024, stripeThickness, carALength - 0.08);

    const stripe1 = new THREE.Mesh(stripeLiveryGeom, stripeFrontendMat);
    stripe1.position.set(0, bodyBaseY - 0.33, carAZ);
    carA.add(stripe1);

    const stripe2 = new THREE.Mesh(stripeLiveryGeom, stripeHardwareMat);
    stripe2.position.set(0, bodyBaseY - 0.33 - stripeThickness, carAZ);
    carA.add(stripe2);

    const stripe3 = new THREE.Mesh(stripeLiveryGeom, stripeBackendMat);
    stripe3.position.set(0, bodyBaseY - 0.33 - stripeThickness * 2, carAZ);
    carA.add(stripe3);

    const stripe4 = new THREE.Mesh(stripeLiveryGeom, stripeAIMat);
    stripe4.position.set(0, bodyBaseY - 0.33 - stripeThickness * 3, carAZ);
    carA.add(stripe4);

    // -------------------------------------------------------------
    // SCREEN-FACING AERODYNAMIC DRIVER CAB & HEADLIGHTS (+Z FRONT)
    // -------------------------------------------------------------
    const cabFrontZ = carAZ + carALength / 2; // Z = 1.8
    const noseLength = 0.52;

    // Aerodynamic Beveled Cab Nose Section
    const cabNose = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.04, carAHeight - 0.04, noseLength),
      brushedStainlessMat
    );
    cabNose.position.set(0, bodyBaseY - 0.01, cabFrontZ + noseLength / 2 - 0.05);
    cabNose.castShadow = true;
    carA.add(cabNose);

    // Front Aerodynamic Dark Mask (Black Surround around windshield & headlights)
    const frontMask = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.06, carAHeight - 0.14, 0.04),
      darkAeroMaskMat
    );
    frontMask.position.set(0, bodyBaseY + 0.04, cabFrontZ + noseLength - 0.02);
    carA.add(frontMask);

    // Driver's Cabin Interior with Illuminated Console & Seat (Visible through windshield)
    const consoleBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.74, 0.28, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x161a22, roughness: 0.6 })
    );
    consoleBox.position.set(0, bodyBaseY - 0.05, cabFrontZ + noseLength * 0.35);
    carA.add(consoleBox);

    // Illuminated Console Gauges (Soft Green / Amber telemetry glow)
    const gaugeGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.08, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x2fb584, emissive: 0x2fb584, emissiveIntensity: 2.0 })
    );
    gaugeGlow.position.set(0, bodyBaseY + 0.08, cabFrontZ + noseLength * 0.45);
    carA.add(gaugeGlow);

    // Driver High-Back Seat
    const driverSeat = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.36, 0.22), seatMat);
    driverSeat.position.set(0, bodyBaseY + 0.04, cabFrontZ + noseLength * 0.08);
    carA.add(driverSeat);

    // Raked Panoramic Aerodynamic Front Windshield (Facing Directly Towards Screen)
    const windshield = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.16, 0.44, 0.06),
      smokedGlassMat
    );
    windshield.position.set(0, bodyBaseY + 0.13, cabFrontZ + noseLength);
    windshield.rotation.x = -0.24; // Streamlined raked windshield
    carA.add(windshield);

    // Dual Black Windshield Wipers
    const wiperMat = new THREE.MeshStandardMaterial({ color: 0x090b0e, roughness: 0.8 });
    [-0.22, 0.12].forEach((wx) => {
      const wiper = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.28, 8), wiperMat);
      wiper.rotation.z = Math.PI / 4.2;
      wiper.position.set(wx, bodyBaseY + 0.09, cabFrontZ + noseLength + 0.035);
      carA.add(wiper);
    });

    // Amber Destination Matrix LED Sign ("CENTRAL // EXP 01")
    const destDisplayMat = new THREE.MeshStandardMaterial({
      color: 0x141005,
      emissive: 0xf2b705,
      emissiveIntensity: 1.8,
      roughness: 0.25,
    });
    const destDisplay = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.1, 0.04), destDisplayMat);
    destDisplay.position.set(0, bodyBaseY + 0.39, cabFrontZ + noseLength - 0.04);
    carA.add(destDisplay);

    // Lower Front Chin Scoop / Cowcatcher
    const chinSpoiler = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.1, 0.16, 0.24),
      darkAeroMaskMat
    );
    chinSpoiler.position.set(0, bodyBaseY - 0.42, cabFrontZ + noseLength - 0.02);
    carA.add(chinSpoiler);

    // Heavy-Duty Knuckle Coupler at Front Bumper (Protruding forward towards camera)
    const coupler = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.1, 0.32),
      new THREE.MeshStandardMaterial({ color: 0x242932, metalness: 0.95, roughness: 0.25 })
    );
    coupler.position.set(0, 0.38, cabFrontZ + noseLength + 0.12);
    carA.add(coupler);

    // Dual Air Brake Hoses
    const hoseMat = new THREE.MeshStandardMaterial({ color: 0x101318, roughness: 0.9 });
    const hoseGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8);
    hoseGeom.rotateX(Math.PI / 6);
    const hoseL = new THREE.Mesh(hoseGeom, hoseMat);
    hoseL.position.set(-0.16, 0.32, cabFrontZ + noseLength + 0.12);
    carA.add(hoseL);
    const hoseR = new THREE.Mesh(hoseGeom, hoseMat);
    hoseR.position.set(0.16, 0.32, cabFrontZ + noseLength + 0.12);
    carA.add(hoseR);

    // DUAL PROJECTOR LED HEADLIGHTS (Facing directly forward into camera!)
    const headlightBezelMat = new THREE.MeshStandardMaterial({
      color: 0xf4f7fc,
      metalness: 0.98,
      roughness: 0.05,
    });
    const ledLensMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfffaea,
      emissiveIntensity: 4.5,
      roughness: 0.04,
    });

    const bezelGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.04, 20);
    bezelGeom.rotateX(Math.PI / 2);
    const lensGeom = new THREE.SphereGeometry(0.054, 16, 16);

    const headlightPositions = [-0.36, 0.36];
    headlightPositions.forEach((hx) => {
      // Chrome surround ring
      const bezel = new THREE.Mesh(bezelGeom, headlightBezelMat);
      bezel.position.set(hx, bodyBaseY - 0.12, cabFrontZ + noseLength + 0.01);
      carA.add(bezel);

      // Glowing Projector LED lens bulb
      const lens = new THREE.Mesh(lensGeom, ledLensMat);
      lens.position.set(hx, bodyBaseY - 0.12, cabFrontZ + noseLength + 0.035);
      carA.add(lens);

      // Forward SpotLight projecting soft warm beam along tracks towards camera
      const spot = new THREE.SpotLight(0xfffae8, 3.2, 9.0, Math.PI / 7, 0.45);
      spot.position.set(hx, bodyBaseY - 0.12, cabFrontZ + noseLength + 0.08);
      spot.target.position.set(hx, 0.08, cabFrontZ + noseLength + 5.5);
      carA.add(spot);
      carA.add(spot.target);
    });

    // Dual Ruby Red Upper Marker LEDs (#E4572E)
    const markerMat = new THREE.MeshStandardMaterial({
      color: 0xe4572e,
      emissive: 0xe4572e,
      emissiveIntensity: 2.4,
    });
    const markerGeom = new THREE.SphereGeometry(0.026, 12, 12);

    const markerL = new THREE.Mesh(markerGeom, markerMat);
    markerL.position.set(-0.48, bodyBaseY + 0.38, cabFrontZ + noseLength - 0.06);
    carA.add(markerL);

    const markerR = new THREE.Mesh(markerGeom, markerMat);
    markerR.position.set(0.48, bodyBaseY + 0.38, cabFrontZ + noseLength - 0.06);
    carA.add(markerR);

    // Car A Articulated Roof Pantograph & Roof HVAC
    carA.add(createArticulatedPantograph(carAZ - 0.1));

    const hvacA = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.1, 0.8), darkAeroMaskMat);
    hvacA.position.set(0, 1.41, carAZ + 0.85);
    carA.add(hvacA);

    // Car A Bogies
    carA.add(createBogie(carAZ - 0.65));
    carA.add(createBogie(carAZ + 0.65));

    this.trainGroup.add(carA);

    // -------------------------------------------------------------
    // GANGWAY BELLOWS & CAR B (REAR COACH RECEDING IN PERSPECTIVE)
    // -------------------------------------------------------------
    const bellowsMat = new THREE.MeshStandardMaterial({ color: 0x12141a, roughness: 0.85, metalness: 0.2 });
    const bellows = new THREE.Mesh(new THREE.BoxGeometry(carAWidth - 0.1, carAHeight - 0.08, 0.22), bellowsMat);
    bellows.position.set(0, bodyBaseY, carAZ - carALength / 2 - 0.11);
    this.trainGroup.add(bellows);

    const carB = new THREE.Group();
    const carBLength = 2.4;
    const carBZ = carAZ - carALength / 2 - 0.22 - carBLength / 2;

    const carBBody = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth, carAHeight, carBLength),
      brushedStainlessMat
    );
    carBBody.position.set(0, bodyBaseY, carBZ);
    carB.add(carBBody);

    // Car B Window Belt & Warm Interior
    const windowBeltB = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth + 0.015, 0.38, carBLength - 0.15),
      windowPillarMat
    );
    windowBeltB.position.set(0, bodyBaseY + 0.08, carBZ);
    carB.add(windowBeltB);

    const interiorB = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.16, carAHeight - 0.16, carBLength - 0.25),
      interiorPassengerMat
    );
    interiorB.position.set(0, bodyBaseY, carBZ);
    carB.add(interiorB);

    // Car B Windows
    [-0.5, 0.5].forEach((wz) => {
      const gR = new THREE.Mesh(glassPaneGeom, smokedGlassMat);
      gR.position.set(carAWidth / 2 + 0.01, bodyBaseY + 0.08, carBZ + wz);
      carB.add(gR);
    });

    // Car B 4-Line Livery
    const bLiveryGeom = new THREE.BoxGeometry(carAWidth + 0.024, stripeThickness, carBLength - 0.05);
    const bStripe1 = new THREE.Mesh(bLiveryGeom, stripeFrontendMat);
    bStripe1.position.set(0, bodyBaseY - 0.33, carBZ);
    carB.add(bStripe1);
    const bStripe2 = new THREE.Mesh(bLiveryGeom, stripeHardwareMat);
    bStripe2.position.set(0, bodyBaseY - 0.33 - stripeThickness, carBZ);
    carB.add(bStripe2);
    const bStripe3 = new THREE.Mesh(bLiveryGeom, stripeBackendMat);
    bStripe3.position.set(0, bodyBaseY - 0.33 - stripeThickness * 2, carBZ);
    carB.add(bStripe3);
    const bStripe4 = new THREE.Mesh(bLiveryGeom, stripeAIMat);
    bStripe4.position.set(0, bodyBaseY - 0.33 - stripeThickness * 3, carBZ);
    carB.add(bStripe4);

    // Car B Bogies
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
  }
}
