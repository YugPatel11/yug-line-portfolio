// src/scripts/webgl/welcomeScene.ts
// Architectural Procedural 3D Metro Train Consist (Lead Cab + Passenger Carriage)
// Built with authentic transit proportions, brushed stainless steel body,
// 4-line transit livery (#E4572E, #F2B705, #0B6E4F, #1B3A8A), panoramic smoked glass,
// illuminated passenger interior, aerodynamic cab with projector LED headlights,
// roof HVAC pods, undercarriage bogies with flanged steel wheels, and smooth 360° turntable.

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
  private animId: number = 0;
  private isDestroyed: boolean = false;
  private isDragging: boolean = false;
  private previousMouseX: number = 0;
  private targetRotationY: number = -0.68; // 3/4 isometric transit angle (~39°)
  private currentRotationY: number = -0.68;
  private autoRotateSpeed: number = 0.002;
  private rollInProgress: number = 0;
  private mouseParallaxX: number = 0;
  private mouseParallaxY: number = 0;
  private targetMouseParallaxX: number = 0;
  private targetMouseParallaxY: number = 0;

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
    // Check reduced motion preference
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

      // Camera: Elevated 3/4 transit perspective showing cab, flank, and roof
      this.camera.position.set(4.8, 2.4, 4.4);
      this.camera.lookAt(0, 0.62, 0);

      // Natural Studio 3-Point Lighting Setup (Calibrated to site palette)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      this.scene.add(ambientLight);

      // 1. Studio Key Directional Light (Warm White)
      const keyLight = new THREE.DirectionalLight(0xfffdfa, 2.2);
      keyLight.position.set(5.5, 7.5, 6);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      this.scene.add(keyLight);

      // 2. Cool Slate Fill Light (Soft architectural shadow tone)
      const fillLight = new THREE.DirectionalLight(0x6b7c96, 0.95);
      fillLight.position.set(-5, 3.5, -4);
      this.scene.add(fillLight);

      // 3. Crisp Rim Light (Roof edge and contour definition)
      const rimLight = new THREE.DirectionalLight(0xdde5f4, 1.3);
      rimLight.position.set(-4, 4, 5);
      this.scene.add(rimLight);

      // Build Plinth & Railway Track
      this.buildPlinthAndTrack();

      // Build High-Detail Realistic Procedural Metro Train (Car A + Gangway + Car B)
      this.buildDetailedMetroTrain();

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

  // =========================================================================
  // ARCHITECTURAL TRACK BED & DISPLAY PLINTH
  // =========================================================================
  private buildPlinthAndTrack() {
    // 1. Dark Graphite Foundation Plinth
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x11141c,
      roughness: 0.5,
      metalness: 0.3,
    });
    const plinthGeom = new THREE.BoxGeometry(2.2, 0.12, 6.8);
    const plinth = new THREE.Mesh(plinthGeom, plinthMat);
    plinth.position.set(0, -0.06, 0);
    plinth.receiveShadow = true;
    this.plinthGroup.add(plinth);

    // Ballast gravel top bed
    const ballastMat = new THREE.MeshStandardMaterial({
      color: 0x181c26,
      roughness: 0.95,
      metalness: 0.1,
    });
    const ballastGeom = new THREE.BoxGeometry(2.14, 0.04, 6.74);
    const ballast = new THREE.Mesh(ballastGeom, ballastMat);
    ballast.position.set(0, 0.02, 0);
    ballast.receiveShadow = true;
    this.plinthGroup.add(ballast);

    // 2. Concrete Track Sleepers (Ties) with Pandrol Spring Baseplates
    const tieMat = new THREE.MeshStandardMaterial({
      color: 0x222733,
      roughness: 0.8,
      metalness: 0.15,
    });
    const tiePlateMat = new THREE.MeshStandardMaterial({
      color: 0x3d4454,
      roughness: 0.4,
      metalness: 0.8,
    });
    const tieGeom = new THREE.BoxGeometry(1.5, 0.06, 0.15);
    const plateGeom = new THREE.BoxGeometry(0.12, 0.02, 0.14);

    for (let z = -3.15; z <= 3.15; z += 0.35) {
      const tie = new THREE.Mesh(tieGeom, tieMat);
      tie.position.set(0, 0.06, z);
      tie.castShadow = true;
      tie.receiveShadow = true;
      this.plinthGroup.add(tie);

      // Steel tie plates under rails
      const plateL = new THREE.Mesh(plateGeom, tiePlateMat);
      plateL.position.set(-0.48, 0.095, z);
      this.plinthGroup.add(plateL);

      const plateR = new THREE.Mesh(plateGeom, tiePlateMat);
      plateR.position.set(0.48, 0.095, z);
      this.plinthGroup.add(plateR);
    }

    // 3. Continuous Polished Steel Rails
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xa8b4c7,
      metalness: 0.95,
      roughness: 0.12,
    });
    const railGeom = new THREE.BoxGeometry(0.05, 0.08, 6.74);

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

    // 4. Station Platform Edge with Tactile Yellow Safety Band (Site Yellow #F2B705)
    const platformSlabMat = new THREE.MeshStandardMaterial({
      color: 0x161a24,
      roughness: 0.6,
      metalness: 0.2,
    });
    const platformSlab = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 6.74), platformSlabMat);
    platformSlab.position.set(0.95, 0.1, 0);
    platformSlab.receiveShadow = true;
    this.plinthGroup.add(platformSlab);

    const yellowSafetyMat = new THREE.MeshStandardMaterial({
      color: 0xf2b705,
      emissive: 0xf2b705,
      emissiveIntensity: 0.25,
      roughness: 0.35,
    });
    const safetyStrip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 6.74), yellowSafetyMat);
    safetyStrip.position.set(0.77, 0.195, 0);
    this.plinthGroup.add(safetyStrip);

    // Tactile studs along yellow line
    const studGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.01, 8);
    for (let z = -3.1; z <= 3.1; z += 0.2) {
      const stud = new THREE.Mesh(studGeom, yellowSafetyMat);
      stud.position.set(0.77, 0.205, z);
      this.plinthGroup.add(stud);
    }
  }

  // =========================================================================
  // HIGH-DETAIL REALISTIC PROCEDURAL METRO TRAIN
  // =========================================================================
  private buildDetailedMetroTrain() {
    // -------------------------------------------------------------
    // Shared High-Fidelity Materials (Pure Site Palette Alignment)
    // -------------------------------------------------------------
    const stainlessSteelMat = new THREE.MeshStandardMaterial({
      color: 0xd6dae4,
      metalness: 0.72,
      roughness: 0.22,
    });

    const brushedFluteMat = new THREE.MeshStandardMaterial({
      color: 0xc8cdd8,
      metalness: 0.8,
      roughness: 0.26,
    });

    const darkCharcoalMat = new THREE.MeshStandardMaterial({
      color: 0x181b22,
      metalness: 0.5,
      roughness: 0.45,
    });

    const darkWindowFrameMat = new THREE.MeshStandardMaterial({
      color: 0x12151c,
      metalness: 0.6,
      roughness: 0.4,
    });

    const smokedGlassMat = new THREE.MeshStandardMaterial({
      color: 0x101622,
      metalness: 0.9,
      roughness: 0.04,
      transparent: true,
      opacity: 0.88,
    });

    const interiorGlowMat = new THREE.MeshStandardMaterial({
      color: 0xfff3d6,
      emissive: 0xffe6b0,
      emissiveIntensity: 0.28,
      roughness: 0.6,
    });

    const wheelSteelMat = new THREE.MeshStandardMaterial({
      color: 0x2e3442,
      metalness: 0.9,
      roughness: 0.15,
    });

    const bogieFrameMat = new THREE.MeshStandardMaterial({
      color: 0x1f242e,
      metalness: 0.6,
      roughness: 0.7,
    });

    // Site 4-Line Livery Materials
    const stripeFrontendMat = new THREE.MeshStandardMaterial({
      color: 0xe4572e,
      roughness: 0.35,
    });
    const stripeHardwareMat = new THREE.MeshStandardMaterial({
      color: 0xf2b705,
      roughness: 0.35,
    });
    const stripeBackendMat = new THREE.MeshStandardMaterial({
      color: 0x0b6e4f,
      roughness: 0.35,
    });
    const stripeAIMat = new THREE.MeshStandardMaterial({
      color: 0x1b3a8a,
      roughness: 0.35,
    });

    // -------------------------------------------------------------
    // Helper: Build a 2-Axle Bogie (Truck) with Wheels & Suspension
    // -------------------------------------------------------------
    const createBogie = (zCenter: number): THREE.Group => {
      const bogie = new THREE.Group();
      bogie.position.set(0, 0, zCenter);

      // Bogie H-Frame
      const sideBeamGeom = new THREE.BoxGeometry(0.06, 0.08, 0.85);
      const sideBeamL = new THREE.Mesh(sideBeamGeom, bogieFrameMat);
      sideBeamL.position.set(-0.55, 0.25, 0);
      sideBeamL.castShadow = true;
      bogie.add(sideBeamL);

      const sideBeamR = new THREE.Mesh(sideBeamGeom, bogieFrameMat);
      sideBeamR.position.set(0.55, 0.25, 0);
      sideBeamR.castShadow = true;
      bogie.add(sideBeamR);

      const centerTransom = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.07, 0.2), bogieFrameMat);
      centerTransom.position.set(0, 0.25, 0);
      bogie.add(centerTransom);

      // 2 Axles with 4 Flanged Steel Wheels
      const axlePositions = [-0.3, 0.3];
      const axleGeom = new THREE.CylinderGeometry(0.025, 0.025, 1.1, 16);
      axleGeom.rotateZ(Math.PI / 2);

      const wheelGeom = new THREE.CylinderGeometry(0.125, 0.125, 0.05, 24);
      wheelGeom.rotateZ(Math.PI / 2);

      const flangeGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.015, 24);
      flangeGeom.rotateZ(Math.PI / 2);

      axlePositions.forEach((az) => {
        // Axle rod
        const axle = new THREE.Mesh(axleGeom, wheelSteelMat);
        axle.position.set(0, 0.24, az);
        bogie.add(axle);

        // Left Wheel & Flange
        const wheelL = new THREE.Mesh(wheelGeom, wheelSteelMat);
        wheelL.position.set(-0.48, 0.24, az);
        wheelL.castShadow = true;
        bogie.add(wheelL);

        const flangeL = new THREE.Mesh(flangeGeom, wheelSteelMat);
        flangeL.position.set(-0.51, 0.24, az);
        bogie.add(flangeL);

        // Right Wheel & Flange
        const wheelR = new THREE.Mesh(wheelGeom, wheelSteelMat);
        wheelR.position.set(0.48, 0.24, az);
        wheelR.castShadow = true;
        bogie.add(wheelR);

        const flangeR = new THREE.Mesh(flangeGeom, wheelSteelMat);
        flangeR.position.set(0.51, 0.24, az);
        bogie.add(flangeR);
      });

      // Third Rail Pick-Up Shoe (Yellow accent marker)
      const shoeMat = new THREE.MeshStandardMaterial({ color: 0xf2b705, metalness: 0.8, roughness: 0.2 });
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.2), shoeMat);
      shoe.position.set(-0.62, 0.18, 0);
      bogie.add(shoe);

      return bogie;
    };

    // -------------------------------------------------------------
    // Helper: Build Rooftop Aerodynamic HVAC Pods
    // -------------------------------------------------------------
    const createRoofHVAC = (zCenter: number): THREE.Group => {
      const hvac = new THREE.Group();
      hvac.position.set(0, 1.4, zCenter);

      // Main aerodynamic casing
      const casing = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.1, 0.78), darkCharcoalMat);
      casing.castShadow = true;
      hvac.add(casing);

      // Exhaust fan grilles (circular louvers)
      const fanMat = new THREE.MeshStandardMaterial({ color: 0x2a313d, roughness: 0.5, metalness: 0.7 });
      const fanGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16);

      const fan1 = new THREE.Mesh(fanGeom, fanMat);
      fan1.position.set(-0.16, 0.06, 0);
      hvac.add(fan1);

      const fan2 = new THREE.Mesh(fanGeom, fanMat);
      fan2.position.set(0.16, 0.06, 0);
      hvac.add(fan2);

      return hvac;
    };

    // -------------------------------------------------------------
    // 1. CAR A: LEAD CARRIAGE (Swept Driver Cab, Windshield & Headlights)
    // -------------------------------------------------------------
    const carA = new THREE.Group();
    const carALength = 2.75;
    const carAWidth = 1.24;
    const carAHeight = 0.94;
    const bodyBaseY = 0.88;

    // Main Stainless Steel Body Box
    const carABody = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth, carAHeight, carALength),
      stainlessSteelMat
    );
    carABody.position.set(0, bodyBaseY, 1.35);
    carABody.castShadow = true;
    carABody.receiveShadow = true;
    carA.add(carABody);

    // Arched Roof Crown
    const roofGeom = new THREE.BoxGeometry(carAWidth - 0.08, 0.08, carALength);
    const carARoof = new THREE.Mesh(roofGeom, stainlessSteelMat);
    carARoof.position.set(0, bodyBaseY + carAHeight / 2 + 0.035, 1.35);
    carA.add(carARoof);

    // Continuous Dark Window Belt Band
    const windowBelt = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth + 0.015, 0.38, carALength - 0.2),
      darkWindowFrameMat
    );
    windowBelt.position.set(0, bodyBaseY + 0.08, 1.35);
    carA.add(windowBelt);

    // Warm Interior Cabin Luminescence (Visible through glass)
    const interiorA = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.14, carAHeight - 0.16, carALength - 0.3),
      interiorGlowMat
    );
    interiorA.position.set(0, bodyBaseY, 1.35);
    carA.add(interiorA);

    // Left & Right Panoramic Smoked Windows
    const glassPaneGeom = new THREE.BoxGeometry(0.02, 0.32, 0.52);
    const windowZOffsets = [0.45, 1.25, 2.05];

    windowZOffsets.forEach((wz) => {
      // Flank Left Glass
      const glassL = new THREE.Mesh(glassPaneGeom, smokedGlassMat);
      glassL.position.set(-(carAWidth / 2 + 0.01), bodyBaseY + 0.08, wz);
      carA.add(glassL);

      // Flank Right Glass
      const glassR = new THREE.Mesh(glassPaneGeom, smokedGlassMat);
      glassR.position.set(carAWidth / 2 + 0.01, bodyBaseY + 0.08, wz);
      carA.add(glassR);
    });

    // Passenger Double Sliding Doors (Recessed with Center Rubber Gasket)
    const doorFrameGeom = new THREE.BoxGeometry(0.025, 0.72, 0.44);
    const doorGlassGeom = new THREE.BoxGeometry(0.03, 0.28, 0.14);
    const doorGasketGeom = new THREE.BoxGeometry(0.032, 0.72, 0.012);
    const doorZPositions = [0.85, 1.65];

    doorZPositions.forEach((dz) => {
      // Right Side Doors (Platform Facing)
      const doorFrameR = new THREE.Mesh(doorFrameGeom, darkWindowFrameMat);
      doorFrameR.position.set(carAWidth / 2 + 0.01, bodyBaseY - 0.06, dz);
      carA.add(doorFrameR);

      // Glass inserts in both leaves
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
    });

    // Fluted Longitudinal Ribs along lower stainless steel flanks
    const fluteRibGeom = new THREE.BoxGeometry(carAWidth + 0.02, 0.016, carALength - 0.1);
    [-0.18, -0.23, -0.28].forEach((ry) => {
      const rib = new THREE.Mesh(fluteRibGeom, brushedFluteMat);
      rib.position.set(0, bodyBaseY + ry, 1.35);
      carA.add(rib);
    });

    // 4-Line Transit Livery Strip (Frontend, Hardware, Backend, AI)
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
    // AERODYNAMIC SWEPT DRIVER CAB & NOSE (FRONT OF CAR A)
    // -------------------------------------------------------------
    const cabFrontZ = 1.35 + carALength / 2; // Z = 2.725
    const noseLength = 0.45;

    // Aerodynamic Beveled Cab Nose Housing
    const cabNose = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.04, carAHeight - 0.06, noseLength),
      stainlessSteelMat
    );
    cabNose.position.set(0, bodyBaseY - 0.02, cabFrontZ + noseLength / 2 - 0.04);
    cabNose.castShadow = true;
    carA.add(cabNose);

    // Raked Front Windshield (Angled aerodynamic dark glass)
    const windshield = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.18, 0.42, 0.06),
      smokedGlassMat
    );
    windshield.position.set(0, bodyBaseY + 0.12, cabFrontZ + noseLength - 0.02);
    windshield.rotation.x = -0.22; // Raked back angle
    carA.add(windshield);

    // Destination LED Matrix Display (Amber Matrix Text Sign)
    const destDisplayMat = new THREE.MeshStandardMaterial({
      color: 0x141005,
      emissive: 0xf2b705,
      emissiveIntensity: 1.4,
      roughness: 0.3,
    });
    const destDisplay = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.09, 0.03), destDisplayMat);
    destDisplay.position.set(0, bodyBaseY + 0.37, cabFrontZ + noseLength - 0.08);
    carA.add(destDisplay);

    // Front Aerodynamic Lower Chin Spoiler / Cowcatcher
    const chinSpoiler = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.1, 0.14, 0.2),
      darkCharcoalMat
    );
    chinSpoiler.position.set(0, bodyBaseY - 0.42, cabFrontZ + noseLength - 0.04);
    carA.add(chinSpoiler);

    // Knuckle Coupler & Air Hoses at Front Bumper
    const coupler = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.09, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x222730, metalness: 0.9, roughness: 0.3 })
    );
    coupler.position.set(0, 0.38, cabFrontZ + noseLength + 0.1);
    carA.add(coupler);

    // Dual Projector LED Headlights with Chrome Bezels
    const headlightBezelMat = new THREE.MeshStandardMaterial({
      color: 0xe8ecf2,
      metalness: 0.95,
      roughness: 0.1,
    });
    const headlightLensMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfffcf0,
      emissiveIntensity: 3.8,
      roughness: 0.05,
    });

    const bezelGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.03, 16);
    bezelGeom.rotateX(Math.PI / 2);
    const lensGeom = new THREE.SphereGeometry(0.05, 16, 16);

    const headlightPositions = [-0.34, 0.34];
    headlightPositions.forEach((hx) => {
      // Chrome surround bezel
      const bezel = new THREE.Mesh(bezelGeom, headlightBezelMat);
      bezel.position.set(hx, bodyBaseY - 0.12, cabFrontZ + noseLength);
      carA.add(bezel);

      // Glowing LED projector bulb
      const lens = new THREE.Mesh(lensGeom, headlightLensMat);
      lens.position.set(hx, bodyBaseY - 0.12, cabFrontZ + noseLength + 0.02);
      carA.add(lens);

      // Forward SpotLight casting warm glow on tracks
      const spot = new THREE.SpotLight(0xfffae8, 2.5, 7.5, Math.PI / 8, 0.45);
      spot.position.set(hx, bodyBaseY - 0.12, cabFrontZ + noseLength + 0.05);
      spot.target.position.set(hx, 0.1, cabFrontZ + noseLength + 4.5);
      carA.add(spot);
      carA.add(spot.target);
    });

    // Dual Red Upper Marker Lights (Site Red #E4572E)
    const markerMat = new THREE.MeshStandardMaterial({
      color: 0xe4572e,
      emissive: 0xe4572e,
      emissiveIntensity: 2.2,
      roughness: 0.2,
    });
    const markerGeom = new THREE.SphereGeometry(0.025, 12, 12);

    const markerL = new THREE.Mesh(markerGeom, markerMat);
    markerL.position.set(-0.46, bodyBaseY + 0.38, cabFrontZ + noseLength - 0.1);
    carA.add(markerL);

    const markerR = new THREE.Mesh(markerGeom, markerMat);
    markerR.position.set(0.46, bodyBaseY + 0.38, cabFrontZ + noseLength - 0.1);
    carA.add(markerR);

    // Car A Rooftop HVAC Pods
    carA.add(createRoofHVAC(0.7));
    carA.add(createRoofHVAC(2.0));

    // Car A Underbody Equipment Enclosures
    const underbox1 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.7), darkCharcoalMat);
    underbox1.position.set(0, 0.32, 1.35);
    carA.add(underbox1);

    // Car A Bogies
    carA.add(createBogie(0.6));
    carA.add(createBogie(2.1));

    this.trainGroup.add(carA);

    // -------------------------------------------------------------
    // GANGWAY BELLOWS (Flexible Pleated Accordion Joint)
    // -------------------------------------------------------------
    const bellowsMat = new THREE.MeshStandardMaterial({
      color: 0x12151c,
      roughness: 0.85,
      metalness: 0.2,
    });
    const bellowsGroup = new THREE.Group();
    bellowsGroup.position.set(0, bodyBaseY, -0.05);

    // 4 accordion pleat rings
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
      stainlessSteelMat
    );
    carBBody.position.set(0, bodyBaseY, carBZ);
    carBBody.castShadow = true;
    carBBody.receiveShadow = true;
    carB.add(carBBody);

    // Roof
    const carBRoof = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.08, 0.08, carBLength),
      stainlessSteelMat
    );
    carBRoof.position.set(0, bodyBaseY + carAHeight / 2 + 0.035, carBZ);
    carB.add(carBRoof);

    // Dark Window Belt
    const windowBeltB = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth + 0.015, 0.38, carBLength - 0.15),
      darkWindowFrameMat
    );
    windowBeltB.position.set(0, bodyBaseY + 0.08, carBZ);
    carB.add(windowBeltB);

    // Interior Warm Glow
    const interiorB = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.14, carAHeight - 0.16, carBLength - 0.25),
      interiorGlowMat
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
    const bFluteRibGeom = new THREE.BoxGeometry(carAWidth + 0.02, 0.016, carBLength - 0.1);
    [-0.18, -0.23, -0.28].forEach((ry) => {
      const rib = new THREE.Mesh(bFluteRibGeom, brushedFluteMat);
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

    // Car B HVAC & Bogies
    carB.add(createRoofHVAC(carBZ - 0.5));
    carB.add(createRoofHVAC(carBZ + 0.5));
    carB.add(createBogie(carBZ - 0.65));
    carB.add(createBogie(carBZ + 0.65));

    this.trainGroup.add(carB);
  }

  // =========================================================================
  // VIEWPORT & RESIZE
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
  // INTERACTIVE 360° TURNTABLE DRAG & PARALLAX
  // =========================================================================
  private onMouseDown = (e: MouseEvent) => {
    this.isDragging = true;
    this.previousMouseX = e.clientX;
  };

  private onMouseMove = (e: MouseEvent) => {
    if (this.isDragging) {
      const deltaX = e.clientX - this.previousMouseX;
      this.targetRotationY += deltaX * 0.009;
      this.previousMouseX = e.clientX;
    } else {
      // Subtle cursor parallax depth
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      this.targetMouseParallaxX = nx * 0.16;
      this.targetMouseParallaxY = ny * 0.07;
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

  // =========================================================================
  // ANIMATION LOOP
  // =========================================================================
  private animate = () => {
    if (this.isDestroyed) return;

    // 1. Entrance Roll-In Glide along track into station
    if (this.rollInProgress < 1) {
      this.rollInProgress += (1 - this.rollInProgress) * 0.045;
      const rollOffset = (1 - this.rollInProgress) * -3.6;
      this.trainGroup.position.z = rollOffset;
    } else {
      this.trainGroup.position.z = 0;
    }

    // 2. Gentle Auto-Turntable when idle
    if (!this.isDragging) {
      this.targetRotationY += this.autoRotateSpeed;
    }

    // 3. Smooth inertia & cursor parallax interpolation
    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.08;
    this.mouseParallaxX += (this.targetMouseParallaxX - this.mouseParallaxX) * 0.05;
    this.mouseParallaxY += (this.targetMouseParallaxY - this.mouseParallaxY) * 0.05;

    this.rootGroup.rotation.y = this.currentRotationY + this.mouseParallaxX;
    this.rootGroup.rotation.x = this.mouseParallaxY;

    // 4. Subtle suspension breathing idle motion
    const time = Date.now() * 0.0022;
    this.trainGroup.position.y = Math.sin(time) * 0.014;
    this.trainGroup.rotation.z = Math.cos(time * 0.7) * 0.005;

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
