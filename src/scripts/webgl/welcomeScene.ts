// src/scripts/webgl/welcomeScene.ts
// Ultra-Realistic Fixed-Angle 3D Metro Train Consist (Car A Lead Cab + Gangway + Car B)
// Features accurate transit proportions, brushed stainless steel body with procedural studio reflections,
// articulated diamond roof pantograph, panoramic smoked glass with illuminated passenger interior,
// aerodynamic raked cab with projector LED headlights, windshield wipers, driver console,
// detailed 2-axle bogies with flanged steel wheels, and subtle station arrival & idle suspension breathing.

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

  // Fixed optimal cinematic 3/4 transit hero angle (~ -41°)
  private readonly fixedAngleY: number = -0.72;
  private readonly fixedPitchX: number = 0.04;

  constructor(containerId: string, canvasId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
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

      // Camera: Elevated 3/4 transit hero angle showing cab, flank, pantograph, and track
      this.camera.position.set(4.65, 2.35, 4.3);
      this.camera.lookAt(0, 0.62, 0.15);

      // Generate Procedural Studio Environment for Authentic Metallic Reflections
      this.setupStudioEnvironment();

      // Natural Studio Lighting Setup (Aligned to site palette)
      this.setupLighting();

      // Build Architectural Plinth & Track Bed
      this.buildPlinthAndTrack();

      // Build Ultra-Realistic Metro Train Consist
      this.buildUltraRealisticMetroTrain();

      // Assemble Root Group
      this.rootGroup.add(this.plinthGroup);
      this.rootGroup.add(this.trainGroup);
      this.scene.add(this.rootGroup);

      // Lock to Fixed Cinematic Hero Angle
      this.rootGroup.rotation.y = this.fixedAngleY;
      this.rootGroup.rotation.x = this.fixedPitchX;

      // Event listener for responsive resize
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
    bgGrad.addColorStop(0, '#0c0f16');
    bgGrad.addColorStop(0.35, '#1b2230');
    bgGrad.addColorStop(0.5, '#2c3547');
    bgGrad.addColorStop(0.55, '#161922');
    bgGrad.addColorStop(1, '#090b10');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 256);

    // Overhead linear station LED tube light banks (Crisp specular highlights)
    const tubeGrad = ctx.createRadialGradient(256, 35, 10, 256, 35, 200);
    tubeGrad.addColorStop(0, '#ffffff');
    tubeGrad.addColorStop(0.3, '#f5efe0');
    tubeGrad.addColorStop(0.7, '#8e9eb5');
    tubeGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = tubeGrad;
    ctx.fillRect(60, 0, 392, 90);

    // Side platform ambient warm floor bounce
    const platformGrad = ctx.createLinearGradient(0, 150, 0, 256);
    platformGrad.addColorStop(0, 'rgba(242, 183, 5, 0.12)'); // Site Yellow accent
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
    // 1. Ambient Light for balanced base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    // 2. Primary Key Directional Light (Warm White)
    const keyLight = new THREE.DirectionalLight(0xfffdf6, 2.4);
    keyLight.position.set(5.5, 7.8, 5.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    this.scene.add(keyLight);

    // 3. Cool Slate Secondary Fill Light (Softens contrast on undercarriage)
    const fillLight = new THREE.DirectionalLight(0x788aa3, 1.1);
    fillLight.position.set(-5, 3.5, -4);
    this.scene.add(fillLight);

    // 4. Crisp Roof Rim Light (Edge definition along pantograph and roof curve)
    const rimLight = new THREE.DirectionalLight(0xdde6f5, 1.4);
    rimLight.position.set(-4, 4.5, 4.5);
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
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.14, 7.0), plinthMat);
    plinth.position.set(0, -0.07, 0);
    plinth.receiveShadow = true;
    this.plinthGroup.add(plinth);

    // Ballast gravel top bed
    const ballastMat = new THREE.MeshStandardMaterial({
      color: 0x171b24,
      roughness: 0.95,
      metalness: 0.1,
    });
    const ballast = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.04, 6.94), ballastMat);
    ballast.position.set(0, 0.02, 0);
    ballast.receiveShadow = true;
    this.plinthGroup.add(ballast);

    // 2. Concrete Sleepers (Ties) with Pandrol Spring Baseplates
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

    for (let z = -3.25; z <= 3.25; z += 0.36) {
      const tie = new THREE.Mesh(tieGeom, tieMat);
      tie.position.set(0, 0.06, z);
      tie.castShadow = true;
      tie.receiveShadow = true;
      this.plinthGroup.add(tie);

      // Steel tie baseplates under both rails
      const plateL = new THREE.Mesh(plateGeom, tiePlateMat);
      plateL.position.set(-0.48, 0.095, z);
      this.plinthGroup.add(plateL);

      const plateR = new THREE.Mesh(plateGeom, tiePlateMat);
      plateR.position.set(0.48, 0.095, z);
      this.plinthGroup.add(plateR);
    }

    // 3. Continuous Polished Steel Running Rails
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xa8b4c7,
      metalness: 0.96,
      roughness: 0.1,
    });
    const railGeom = new THREE.BoxGeometry(0.05, 0.08, 6.94);

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
    const platformSlab = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 6.94), platformSlabMat);
    platformSlab.position.set(0.96, 0.1, 0);
    platformSlab.receiveShadow = true;
    this.plinthGroup.add(platformSlab);

    const yellowSafetyMat = new THREE.MeshStandardMaterial({
      color: 0xf2b705,
      emissive: 0xf2b705,
      emissiveIntensity: 0.25,
      roughness: 0.35,
    });
    const safetyStrip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 6.94), yellowSafetyMat);
    safetyStrip.position.set(0.77, 0.195, 0);
    this.plinthGroup.add(safetyStrip);

    // Raised tactile safety studs along warning line
    const studGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.01, 8);
    for (let z = -3.2; z <= 3.2; z += 0.2) {
      const stud = new THREE.Mesh(studGeom, yellowSafetyMat);
      stud.position.set(0.77, 0.205, z);
      this.plinthGroup.add(stud);
    }
  }

  // =========================================================================
  // ULTRA-REALISTIC PROCEDURAL METRO TRAIN
  // =========================================================================
  private buildUltraRealisticMetroTrain() {
    // -------------------------------------------------------------
    // High-Fidelity Materials with Accurate Realism
    // -------------------------------------------------------------
    const brushedStainlessMat = new THREE.MeshStandardMaterial({
      color: 0xd6dae4,
      metalness: 0.82,
      roughness: 0.2,
    });

    const corrugatedFluteMat = new THREE.MeshStandardMaterial({
      color: 0xc4c9d6,
      metalness: 0.88,
      roughness: 0.24,
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x161820,
      metalness: 0.55,
      roughness: 0.45,
    });

    const windowPillarMat = new THREE.MeshStandardMaterial({
      color: 0x10131a,
      metalness: 0.7,
      roughness: 0.35,
    });

    const smokedGlassMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      metalness: 0.92,
      roughness: 0.05,
      transparent: true,
      opacity: 0.88,
    });

    const interiorPassengerMat = new THREE.MeshStandardMaterial({
      color: 0xfff2d8,
      emissive: 0xffe2a4,
      emissiveIntensity: 0.32,
      roughness: 0.5,
    });

    const seatMat = new THREE.MeshStandardMaterial({
      color: 0x1e2738,
      roughness: 0.7,
    });

    const stanchionPoleMat = new THREE.MeshStandardMaterial({
      color: 0xe2e6ef,
      metalness: 0.95,
      roughness: 0.1,
    });

    const wheelSteelMat = new THREE.MeshStandardMaterial({
      color: 0x2b313f,
      metalness: 0.92,
      roughness: 0.14,
    });

    const bogieSteelMat = new THREE.MeshStandardMaterial({
      color: 0x1c202a,
      metalness: 0.65,
      roughness: 0.65,
    });

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

      // Heavy Cast H-Frame Side Beams
      const sideBeamGeom = new THREE.BoxGeometry(0.07, 0.09, 0.9);
      const sideBeamL = new THREE.Mesh(sideBeamGeom, bogieSteelMat);
      sideBeamL.position.set(-0.55, 0.25, 0);
      sideBeamL.castShadow = true;
      bogie.add(sideBeamL);

      const sideBeamR = new THREE.Mesh(sideBeamGeom, bogieSteelMat);
      sideBeamR.position.set(0.55, 0.25, 0);
      sideBeamR.castShadow = true;
      bogie.add(sideBeamR);

      // Center Transom Bolster
      const transom = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.08, 0.22), bogieSteelMat);
      transom.position.set(0, 0.25, 0);
      bogie.add(transom);

      // Coil Suspension Springs on side frames
      const springMat = new THREE.MeshStandardMaterial({ color: 0x485164, metalness: 0.85, roughness: 0.25 });
      const springGeom = new THREE.CylinderGeometry(0.035, 0.035, 0.12, 12);
      [-0.55, 0.55].forEach((sx) => {
        [-0.15, 0.15].forEach((sz) => {
          const spring = new THREE.Mesh(springGeom, springMat);
          spring.position.set(sx, 0.32, sz);
          bogie.add(spring);
        });
      });

      // 2 Axles with 4 Steel Flanged Wheels
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

        // Left Wheel & Disc
        const wheelL = new THREE.Mesh(wheelGeom, wheelSteelMat);
        wheelL.position.set(-0.48, 0.24, az);
        wheelL.castShadow = true;
        bogie.add(wheelL);

        const flangeL = new THREE.Mesh(flangeGeom, wheelSteelMat);
        flangeL.position.set(-0.51, 0.24, az);
        bogie.add(flangeL);

        const hubL = new THREE.Mesh(hubGeom, stanchionPoleMat);
        hubL.position.set(-0.525, 0.24, az);
        bogie.add(hubL);

        // Right Wheel & Disc
        const wheelR = new THREE.Mesh(wheelGeom, wheelSteelMat);
        wheelR.position.set(0.48, 0.24, az);
        wheelR.castShadow = true;
        bogie.add(wheelR);

        const flangeR = new THREE.Mesh(flangeGeom, wheelSteelMat);
        flangeR.position.set(0.51, 0.24, az);
        bogie.add(flangeR);

        const hubR = new THREE.Mesh(hubGeom, stanchionPoleMat);
        hubR.position.set(0.525, 0.24, az);
        bogie.add(hubR);
      });

      // Third Rail Contact Shoe (Yellow Accent Marker)
      const shoe = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.03, 0.22),
        new THREE.MeshStandardMaterial({ color: 0xf2b705, metalness: 0.85, roughness: 0.25 })
      );
      shoe.position.set(-0.62, 0.17, 0);
      bogie.add(shoe);

      return bogie;
    };

    // -------------------------------------------------------------
    // Helper: Build Aerodynamic Rooftop HVAC Pod
    // -------------------------------------------------------------
    const createRoofHVAC = (zCenter: number): THREE.Group => {
      const hvac = new THREE.Group();
      hvac.position.set(0, 1.41, zCenter);

      const podGeom = new THREE.BoxGeometry(0.72, 0.1, 0.8);
      const pod = new THREE.Mesh(podGeom, darkTrimMat);
      pod.castShadow = true;
      hvac.add(pod);

      // Dual circular exhaust fan covers
      const fanMat = new THREE.MeshStandardMaterial({ color: 0x2a313d, roughness: 0.5, metalness: 0.75 });
      const fanGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16);

      const f1 = new THREE.Mesh(fanGeom, fanMat);
      f1.position.set(-0.16, 0.06, 0);
      hvac.add(f1);

      const f2 = new THREE.Mesh(fanGeom, fanMat);
      f2.position.set(0.16, 0.06, 0);
      hvac.add(f2);

      return hvac;
    };

    // -------------------------------------------------------------
    // Helper: Build High-Detail Articulated Diamond Roof Pantograph
    // -------------------------------------------------------------
    const createArticulatedPantograph = (zCenter: number): THREE.Group => {
      const pantograph = new THREE.Group();
      pantograph.position.set(0, 1.42, zCenter);

      const frameMat = new THREE.MeshStandardMaterial({
        color: 0xd8dee9,
        metalness: 0.9,
        roughness: 0.15,
      });
      const insulatorMat = new THREE.MeshStandardMaterial({
        color: 0x9e432b, // Terracotta porcelain insulator color
        roughness: 0.4,
        metalness: 0.3,
      });

      // 1. 4 Porcelain Insulator Footings on Roof Mounting Base
      const insulatorGeom = new THREE.CylinderGeometry(0.024, 0.03, 0.06, 12);
      const postPositions = [
        [-0.24, -0.2],
        [0.24, -0.2],
        [-0.24, 0.2],
        [0.24, 0.2],
      ];
      postPositions.forEach(([ix, iz]) => {
        const post = new THREE.Mesh(insulatorGeom, insulatorMat);
        post.position.set(ix, 0.03, iz);
        pantograph.add(post);
      });

      // 2. Base Tubular Support Frame
      const baseFrame = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.02, 0.44), frameMat);
      baseFrame.position.set(0, 0.07, 0);
      pantograph.add(baseFrame);

      // 3. Lower Articulated Arm (Angled upwards toward rear)
      const lowerArmGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.46, 10);
      lowerArmGeom.rotateX(Math.PI / 4.2); // ~43° angle

      const lowerArmL = new THREE.Mesh(lowerArmGeom, frameMat);
      lowerArmL.position.set(-0.16, 0.22, -0.06);
      pantograph.add(lowerArmL);

      const lowerArmR = new THREE.Mesh(lowerArmGeom, frameMat);
      lowerArmR.position.set(0.16, 0.22, -0.06);
      pantograph.add(lowerArmR);

      // Transverse pivot joint rod
      const pivotRod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.36, 12), frameMat);
      pivotRod.rotateZ(Math.PI / 2);
      pivotRod.position.set(0, 0.37, -0.2);
      pantograph.add(pivotRod);

      // 4. Upper Scissor / Diamond Arms (Angled back forward)
      const upperArmGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.42, 10);
      upperArmGeom.rotateX(-Math.PI / 5.2); // Return forward angle

      const upperArmL = new THREE.Mesh(upperArmGeom, frameMat);
      upperArmL.position.set(-0.12, 0.51, -0.07);
      pantograph.add(upperArmL);

      const upperArmR = new THREE.Mesh(upperArmGeom, frameMat);
      upperArmR.position.set(0.12, 0.51, -0.07);
      pantograph.add(upperArmR);

      // 5. Top Carbon Collector Bow (Contact strip that touches overhead catenary)
      const collectorBarMat = new THREE.MeshStandardMaterial({
        color: 0x222630, // Graphite carbon wear strip
        metalness: 0.9,
        roughness: 0.2,
      });
      const collectorBar = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.018, 0.05), collectorBarMat);
      collectorBar.position.set(0, 0.66, 0.06);
      pantograph.add(collectorBar);

      // Curved Horn Endtips (Aerodynamic safety horn curls)
      const hornGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.08, 8);
      hornGeom.rotateZ(Math.PI / 3);

      const hornL = new THREE.Mesh(hornGeom, frameMat);
      hornL.position.set(-0.36, 0.63, 0.06);
      pantograph.add(hornL);

      const hornR = new THREE.Mesh(hornGeom, frameMat);
      hornR.position.set(0.36, 0.63, 0.06);
      hornR.rotation.z = -Math.PI / 3;
      pantograph.add(hornR);

      return pantograph;
    };

    // -------------------------------------------------------------
    // 1. CAR A: LEAD CARRIAGE (Swept Aerodynamic Cab & Headlights)
    // -------------------------------------------------------------
    const carA = new THREE.Group();
    const carALength = 2.8;
    const carAWidth = 1.24;
    const carAHeight = 0.94;
    const bodyBaseY = 0.88;

    // Main Stainless Steel Carriage Body
    const carABody = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth, carAHeight, carALength),
      brushedStainlessMat
    );
    carABody.position.set(0, bodyBaseY, 1.35);
    carABody.castShadow = true;
    carABody.receiveShadow = true;
    carA.add(carABody);

    // Arched Roof Crown
    const carARoof = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.08, 0.08, carALength),
      brushedStainlessMat
    );
    carARoof.position.set(0, bodyBaseY + carAHeight / 2 + 0.035, 1.35);
    carA.add(carARoof);

    // Dark Structural Window Belt
    const windowBelt = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth + 0.015, 0.38, carALength - 0.15),
      windowPillarMat
    );
    windowBelt.position.set(0, bodyBaseY + 0.08, 1.35);
    carA.add(windowBelt);

    // Warm Interior Cabin Luminescence
    const interiorA = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.16, carAHeight - 0.16, carALength - 0.3),
      interiorPassengerMat
    );
    interiorA.position.set(0, bodyBaseY, 1.35);
    carA.add(interiorA);

    // Visible Passenger Seats & Stainless Grab Stanchions inside Car A
    const seatGeom = new THREE.BoxGeometry(0.24, 0.22, 0.44);
    const stanchionGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.72, 10);
    [0.75, 1.55].forEach((pz) => {
      // Platform side seats
      const seat = new THREE.Mesh(seatGeom, seatMat);
      seat.position.set(carAWidth / 2 - 0.2, bodyBaseY - 0.15, pz);
      carA.add(seat);

      // Grab Stanchion pole
      const pole = new THREE.Mesh(stanchionGeom, stanchionPoleMat);
      pole.position.set(carAWidth / 2 - 0.25, bodyBaseY + 0.08, pz + 0.3);
      carA.add(pole);
    });

    // Panoramic Smoked Glass Side Windows
    const glassPaneGeom = new THREE.BoxGeometry(0.02, 0.32, 0.52);
    const windowZOffsets = [0.45, 1.25, 2.05];
    windowZOffsets.forEach((wz) => {
      const glassL = new THREE.Mesh(glassPaneGeom, smokedGlassMat);
      glassL.position.set(-(carAWidth / 2 + 0.01), bodyBaseY + 0.08, wz);
      carA.add(glassL);

      const glassR = new THREE.Mesh(glassPaneGeom, smokedGlassMat);
      glassR.position.set(carAWidth / 2 + 0.01, bodyBaseY + 0.08, wz);
      carA.add(glassR);
    });

    // Double Sliding Passenger Doors with Center Rubber Gasket & Handles
    const doorFrameGeom = new THREE.BoxGeometry(0.025, 0.72, 0.44);
    const doorGlassGeom = new THREE.BoxGeometry(0.03, 0.28, 0.14);
    const doorGasketGeom = new THREE.BoxGeometry(0.032, 0.72, 0.012);
    const doorHandleGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.14, 8);
    const doorZPositions = [0.85, 1.65];

    doorZPositions.forEach((dz) => {
      // Right (Platform Facing) Door
      const doorFrameR = new THREE.Mesh(doorFrameGeom, darkTrimMat);
      doorFrameR.position.set(carAWidth / 2 + 0.01, bodyBaseY - 0.06, dz);
      carA.add(doorFrameR);

      // Glass inserts in door leaves
      const dGlass1 = new THREE.Mesh(doorGlassGeom, smokedGlassMat);
      dGlass1.position.set(carAWidth / 2 + 0.015, bodyBaseY + 0.08, dz - 0.11);
      carA.add(dGlass1);

      const dGlass2 = new THREE.Mesh(doorGlassGeom, smokedGlassMat);
      dGlass2.position.set(carAWidth / 2 + 0.015, bodyBaseY + 0.08, dz + 0.11);
      carA.add(dGlass2);

      // Center rubber gasket
      const gasket = new THREE.Mesh(
        doorGasketGeom,
        new THREE.MeshStandardMaterial({ color: 0x090b0e, roughness: 0.9 })
      );
      gasket.position.set(carAWidth / 2 + 0.016, bodyBaseY - 0.06, dz);
      carA.add(gasket);

      // Stainless steel door handles
      const handle1 = new THREE.Mesh(doorHandleGeom, stanchionPoleMat);
      handle1.position.set(carAWidth / 2 + 0.025, bodyBaseY - 0.06, dz - 0.03);
      carA.add(handle1);

      const handle2 = new THREE.Mesh(doorHandleGeom, stanchionPoleMat);
      handle2.position.set(carAWidth / 2 + 0.025, bodyBaseY - 0.06, dz + 0.03);
      carA.add(handle2);
    });

    // Fluted Stainless Steel Ribs along lower flanks
    const fluteRibGeom = new THREE.BoxGeometry(carAWidth + 0.02, 0.016, carALength - 0.1);
    [-0.18, -0.23, -0.28].forEach((ry) => {
      const rib = new THREE.Mesh(fluteRibGeom, corrugatedFluteMat);
      rib.position.set(0, bodyBaseY + ry, 1.35);
      carA.add(rib);
    });

    // 4-Line Livery Enamel Pinstripes (Site colors)
    const stripeThickness = 0.022;
    const stripeLiveryGeom = new THREE.BoxGeometry(carAWidth + 0.024, stripeThickness, carALength - 0.08);

    const stripe1 = new THREE.Mesh(stripeLiveryGeom, stripeFrontendMat);
    stripe1.position.set(0, bodyBaseY - 0.33, 1.35);
    carA.add(stripe1);

    const stripe2 = new THREE.Mesh(stripeLiveryGeom, stripeHardwareMat);
    stripe2.position.set(0, bodyBaseY - 0.33 - stripeThickness, 1.35);
    carA.add(stripe2);

    const stripe3 = new THREE.Mesh(stripeLiveryGeom, stripeBackendMat);
    stripe3.position.set(0, bodyBaseY - 0.33 - stripeThickness * 2, 1.35);
    carA.add(stripe3);

    const stripe4 = new THREE.Mesh(stripeLiveryGeom, stripeAIMat);
    stripe4.position.set(0, bodyBaseY - 0.33 - stripeThickness * 3, 1.35);
    carA.add(stripe4);

    // -------------------------------------------------------------
    // AERODYNAMIC SWEPT CAB NOSE & FRONT DRIVER CABIN
    // -------------------------------------------------------------
    const cabFrontZ = 1.35 + carALength / 2; // Z = 2.75
    const noseLength = 0.48;

    // Aerodynamic Beveled Cab Nose Section
    const cabNose = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.04, carAHeight - 0.06, noseLength),
      brushedStainlessMat
    );
    cabNose.position.set(0, bodyBaseY - 0.02, cabFrontZ + noseLength / 2 - 0.04);
    cabNose.castShadow = true;
    carA.add(cabNose);

    // Driver's Cabin Interior Visible Through Windshield
    const driverConsoleMat = new THREE.MeshStandardMaterial({ color: 0x161a22, roughness: 0.6 });
    const consoleBox = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.28, 0.28), driverConsoleMat);
    consoleBox.position.set(0, bodyBaseY - 0.05, cabFrontZ + noseLength * 0.35);
    carA.add(consoleBox);

    // Driver High-Back Seat
    const driverSeat = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.34, 0.22), seatMat);
    driverSeat.position.set(0, bodyBaseY + 0.02, cabFrontZ + noseLength * 0.08);
    carA.add(driverSeat);

    // Raked Panoramic Aerodynamic Front Windshield
    const windshield = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.16, 0.42, 0.06),
      smokedGlassMat
    );
    windshield.position.set(0, bodyBaseY + 0.12, cabFrontZ + noseLength - 0.02);
    windshield.rotation.x = -0.24; // Streamlined raked windshield
    carA.add(windshield);

    // Black Windshield Wiper
    const wiperMat = new THREE.MeshStandardMaterial({ color: 0x090b0e, roughness: 0.8 });
    const wiperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.26, 8), wiperMat);
    wiperArm.rotation.z = Math.PI / 4;
    wiperArm.position.set(-0.06, bodyBaseY + 0.08, cabFrontZ + noseLength + 0.015);
    carA.add(wiperArm);

    // Recessed Amber Destination Matrix LED Display ("CENTRAL // 01")
    const destDisplayMat = new THREE.MeshStandardMaterial({
      color: 0x141005,
      emissive: 0xf2b705,
      emissiveIntensity: 1.5,
      roughness: 0.3,
    });
    const destDisplay = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.09, 0.03), destDisplayMat);
    destDisplay.position.set(0, bodyBaseY + 0.38, cabFrontZ + noseLength - 0.08);
    carA.add(destDisplay);

    // Lower Front Chin Scoop / Cowcatcher
    const chinSpoiler = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.1, 0.14, 0.22),
      darkTrimMat
    );
    chinSpoiler.position.set(0, bodyBaseY - 0.42, cabFrontZ + noseLength - 0.04);
    carA.add(chinSpoiler);

    // Heavy-Duty Knuckle Coupler with Air Hoses
    const coupler = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.09, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x222730, metalness: 0.9, roughness: 0.25 })
    );
    coupler.position.set(0, 0.38, cabFrontZ + noseLength + 0.1);
    carA.add(coupler);

    // Dual Projector LED Headlights with Chrome Reflectors & Glass Domes
    const chromeBezelMat = new THREE.MeshStandardMaterial({
      color: 0xeef2f8,
      metalness: 0.98,
      roughness: 0.08,
    });
    const ledLensMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfffcf2,
      emissiveIntensity: 4.2,
      roughness: 0.04,
    });

    const bezelGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.03, 16);
    bezelGeom.rotateX(Math.PI / 2);
    const lensGeom = new THREE.SphereGeometry(0.05, 16, 16);

    const headlightPositions = [-0.34, 0.34];
    headlightPositions.forEach((hx) => {
      const bezel = new THREE.Mesh(bezelGeom, chromeBezelMat);
      bezel.position.set(hx, bodyBaseY - 0.12, cabFrontZ + noseLength);
      carA.add(bezel);

      const lens = new THREE.Mesh(lensGeom, ledLensMat);
      lens.position.set(hx, bodyBaseY - 0.12, cabFrontZ + noseLength + 0.02);
      carA.add(lens);

      // Forward SpotLight casting soft beam along rails
      const spot = new THREE.SpotLight(0xfffaea, 2.6, 8.0, Math.PI / 7.5, 0.45);
      spot.position.set(hx, bodyBaseY - 0.12, cabFrontZ + noseLength + 0.06);
      spot.target.position.set(hx, 0.1, cabFrontZ + noseLength + 5.0);
      carA.add(spot);
      carA.add(spot.target);
    });

    // Dual Red Upper Clearance / Marker LEDs (#E4572E)
    const markerMat = new THREE.MeshStandardMaterial({
      color: 0xe4572e,
      emissive: 0xe4572e,
      emissiveIntensity: 2.2,
    });
    const markerGeom = new THREE.SphereGeometry(0.025, 12, 12);

    const markerL = new THREE.Mesh(markerGeom, markerMat);
    markerL.position.set(-0.46, bodyBaseY + 0.38, cabFrontZ + noseLength - 0.1);
    carA.add(markerL);

    const markerR = new THREE.Mesh(markerGeom, markerMat);
    markerR.position.set(0.46, bodyBaseY + 0.38, cabFrontZ + noseLength - 0.1);
    carA.add(markerR);

    // Car A Articulated Roof Pantograph & HVAC Unit
    carA.add(createArticulatedPantograph(1.1));
    carA.add(createRoofHVAC(2.2));

    // Car A Underbody Traction Enclosures
    const underbox = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.8), darkTrimMat);
    underbox.position.set(0, 0.32, 1.35);
    carA.add(underbox);

    // Car A Bogies
    carA.add(createBogie(0.6));
    carA.add(createBogie(2.1));

    this.trainGroup.add(carA);

    // -------------------------------------------------------------
    // GANGWAY BELLOWS (Pleated Rubber Articulation Joint)
    // -------------------------------------------------------------
    const bellowsMat = new THREE.MeshStandardMaterial({
      color: 0x12141a,
      roughness: 0.85,
      metalness: 0.2,
    });
    const bellowsGroup = new THREE.Group();
    bellowsGroup.position.set(0, bodyBaseY, -0.05);

    for (let pz = -0.12; pz <= 0.12; pz += 0.08) {
      const pleat = new THREE.Mesh(
        new THREE.BoxGeometry(carAWidth - 0.12, carAHeight - 0.08, 0.04),
        bellowsMat
      );
      pleat.position.set(0, 0, pz);
      bellowsGroup.add(pleat);
    }
    this.trainGroup.add(bellowsGroup);

    // -------------------------------------------------------------
    // 2. CAR B: PASSENGER COACH (Coupled Seamlessly Behind Car A)
    // -------------------------------------------------------------
    const carB = new THREE.Group();
    const carBLength = 2.5;
    const carBZ = -1.45;

    // Body
    const carBBody = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth, carAHeight, carBLength),
      brushedStainlessMat
    );
    carBBody.position.set(0, bodyBaseY, carBZ);
    carBBody.castShadow = true;
    carBBody.receiveShadow = true;
    carB.add(carBBody);

    // Roof
    const carBRoof = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.08, 0.08, carBLength),
      brushedStainlessMat
    );
    carBRoof.position.set(0, bodyBaseY + carAHeight / 2 + 0.035, carBZ);
    carB.add(carBRoof);

    // Dark Window Belt
    const windowBeltB = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth + 0.015, 0.38, carBLength - 0.15),
      windowPillarMat
    );
    windowBeltB.position.set(0, bodyBaseY + 0.08, carBZ);
    carB.add(windowBeltB);

    // Interior Warm Glow
    const interiorB = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.16, carAHeight - 0.16, carBLength - 0.25),
      interiorPassengerMat
    );
    interiorB.position.set(0, bodyBaseY, carBZ);
    carB.add(interiorB);

    // Car B Windows
    const bWindowZOffsets = [carBZ - 0.65, carBZ, carBZ + 0.65];
    bWindowZOffsets.forEach((wz) => {
      const gL = new THREE.Mesh(glassPaneGeom, smokedGlassMat);
      gL.position.set(-(carAWidth / 2 + 0.01), bodyBaseY + 0.08, wz);
      carB.add(gL);

      const gR = new THREE.Mesh(glassPaneGeom, smokedGlassMat);
      gR.position.set(carAWidth / 2 + 0.01, bodyBaseY + 0.08, wz);
      carB.add(gR);
    });

    // Car B Fluted Ribs
    [-0.18, -0.23, -0.28].forEach((ry) => {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(carAWidth + 0.02, 0.016, carBLength - 0.1), corrugatedFluteMat);
      rib.position.set(0, bodyBaseY + ry, carBZ);
      carB.add(rib);
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

    // Car B Roof HVAC & Bogies
    carB.add(createRoofHVAC(carBZ - 0.45));
    carB.add(createRoofHVAC(carBZ + 0.45));
    carB.add(createBogie(carBZ - 0.65));
    carB.add(createBogie(carBZ + 0.65));

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
    const height = Math.min(320, Math.max(220, Math.floor(width * 0.48)));

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  // =========================================================================
  // ANIMATION LOOP (Smooth Arrival Glide & Gentle Idle Suspension Breathing)
  // =========================================================================
  private animate = () => {
    if (this.isDestroyed) return;

    // 1. Smooth Cinematic Arrival Glide into Station Platform (on initial load)
    if (this.rollInProgress < 1) {
      this.rollInProgress += (1 - this.rollInProgress) * 0.042;
      const rollOffset = (1 - this.rollInProgress) * -3.4;
      this.trainGroup.position.z = rollOffset;
    } else {
      this.trainGroup.position.z = 0;
    }

    // 2. Subtle Idle Suspension Breathing (Gentle vertical float, no rotation)
    const time = Date.now() * 0.0018;
    this.trainGroup.position.y = Math.sin(time) * 0.008;

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
