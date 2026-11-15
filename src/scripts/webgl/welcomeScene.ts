// src/scripts/webgl/welcomeScene.ts
// Ultra-Realistic 3D Metro Train Consist (Fixed 3/4 Elevated Perspective)
// Centered and framed with generous margins: aerodynamic raked front cab, glowing headlights,
// illuminated LED destination display, panoramic windshield with cockpit depth, arched roof crown,
// articulated diamond pantograph, passenger windows, doors, fluted side ribs, underfloor machinery,
// bogies, track bed, and platform safety edge.

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
  private roofTexture: THREE.Texture | null = null;
  private animId: number = 0;
  private isDestroyed: boolean = false;
  private rollInProgress: number = 0;

  constructor(containerId: string, canvasId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.scene = new THREE.Scene();
    // Balanced telephoto FOV (26°) for heroic architectural train proportions
    this.camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
    this.rootGroup = new THREE.Group();
    this.trainGroup = new THREE.Group();
    this.plinthGroup = new THREE.Group();

    if (this.canvas && this.container) {
      this.init();
    }
  }

  private init() {
    const isReduced =
      document.documentElement.classList.contains('reduce-motion') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      this.rollInProgress = 1;
    }

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.updateSize();

      // Camera: Elevated 3/4 perspective looking down at the train from above
      // Framed so the ENTIRE front cab, roof, pantograph, and flank fit with generous margins
      this.camera.position.set(3.35, 2.15, 5.1);
      this.camera.lookAt(-0.25, 0.65, 0.15);

      // Studio Reflection Environment
      this.setupStudioEnvironment();

      // Calibrated Multi-Point Studio Lighting
      this.setupLighting();

      // Generate Procedural High-Resolution Textures
      this.frontTexture = this.generateCabFrontTexture();
      this.flankTexture = this.generateFlankTexture();
      this.roofTexture = this.generateRoofTexture();

      // Build Plinth & Railway Track Bed
      this.buildPlinthAndTrack();

      // Build Ultra-Realistic Metro Train Consist
      this.buildRealisticTrainModel();

      // Assemble Root Group
      this.rootGroup.add(this.plinthGroup);
      this.rootGroup.add(this.trainGroup);
      this.scene.add(this.rootGroup);

      // Hero Framing & Sideways Perspective:
      // Rotation -0.34 rad (~ -19.5°) shows both the front cab and side flank in clear perspective
      // X offset +0.32 centers the train so the front cab has ample breathing room from the left edge
      this.rootGroup.position.set(0.32, 0, -0.2);
      this.rootGroup.rotation.y = -0.34;
      this.rootGroup.rotation.x = 0.02;

      // Event listener for resize
      window.addEventListener('resize', this.onResize);

      // Ensure canvas is visible
      this.canvas.style.display = 'block';

      // Render initial frame
      this.renderer.render(this.scene, this.camera);

      // Start render loop
      this.animate();
    } catch (e) {
      console.error('WebGL init error in Welcome3DScene:', e);
      if (this.canvas) this.canvas.style.display = 'block';
    }
  }

  // =========================================================================
  // SAFE CROSS-BROWSER ROUNDED RECTANGLE HELPER
  // =========================================================================
  private drawSafeRoundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    if (typeof (ctx as any).roundRect === 'function') {
      ctx.beginPath();
      (ctx as any).roundRect(x, y, w, h, r);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
      ctx.fill();
    }
  }

  // =========================================================================
  // PROCEDURAL HIGH-RESOLUTION TEXTURES (2048x2048 & 4096x1024)
  // =========================================================================
  private generateCabFrontTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;

    // 1. Brushed Stainless Steel Base with Metallic Sheen
    const baseGrad = ctx.createLinearGradient(0, 0, 2048, 0);
    baseGrad.addColorStop(0, '#c2c9d6');
    baseGrad.addColorStop(0.15, '#e2e7f2');
    baseGrad.addColorStop(0.5, '#f5f7fc');
    baseGrad.addColorStop(0.85, '#e2e7f2');
    baseGrad.addColorStop(1, '#c2c9d6');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 2048, 2048);

    // Micro-grain metallic striations
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let y = 0; y < 2048; y += 4) {
      ctx.fillRect(0, y, 2048, 1.5);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    for (let y = 2; y < 2048; y += 6) {
      ctx.fillRect(0, y, 2048, 1);
    }

    // 2. Aerodynamic Black Front Mask Surround
    ctx.fillStyle = '#0a0d14';
    this.drawSafeRoundRect(ctx, 110, 100, 1828, 1720, 80);

    ctx.fillStyle = '#141824';
    this.drawSafeRoundRect(ctx, 130, 120, 1788, 1680, 64);

    // 3. Destination LED Matrix Sign
    ctx.fillStyle = '#05070a';
    ctx.fillRect(260, 160, 1528, 230);
    ctx.strokeStyle = '#2b3648';
    ctx.lineWidth = 8;
    ctx.strokeRect(260, 160, 1528, 230);

    // Glowing Amber LED Dot-Matrix Text
    ctx.fillStyle = '#f2b705';
    ctx.font = 'bold 110px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CENTRAL // EXPRESS 01', 1024, 275);

    // Top Red LED Clearance Lights
    ctx.fillStyle = '#e4572e';
    ctx.beginPath();
    ctx.arc(200, 275, 32, 0, Math.PI * 2);
    ctx.arc(1848, 275, 32, 0, Math.PI * 2);
    ctx.fill();

    // 4. Large Aerodynamic Windshield Glass
    const glassGrad = ctx.createLinearGradient(0, 460, 0, 1220);
    glassGrad.addColorStop(0, '#0c111a');
    glassGrad.addColorStop(0.3, '#161e2c');
    glassGrad.addColorStop(0.7, '#1d2638');
    glassGrad.addColorStop(1, '#101520');
    ctx.fillStyle = glassGrad;
    this.drawSafeRoundRect(ctx, 180, 420, 1688, 820, 48);

    // Ceramic Black Frit Dotted Border
    ctx.strokeStyle = '#06080e';
    ctx.lineWidth = 28;
    ctx.stroke();

    // Cockpit Interior Instruments (Visible through tinted glass)
    ctx.fillStyle = '#1a202d';
    this.drawSafeRoundRect(ctx, 910, 780, 228, 240, 28); // Driver Seat

    // Instrument Console & Multifunction Displays
    ctx.fillStyle = '#080b10';
    ctx.fillRect(520, 1080, 1008, 130);

    ctx.fillStyle = '#2fb584';
    ctx.fillRect(580, 1100, 220, 64); // Primary Train Display (Green telemetry)
    ctx.fillStyle = '#f2b705';
    ctx.fillRect(910, 1100, 220, 64); // Speedometer / Traction (Amber)
    ctx.fillStyle = '#1b3a8a';
    ctx.fillRect(1230, 1100, 220, 64); // Line Map (Blue)

    // Glass Reflection Sheen
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.moveTo(280, 1220);
    ctx.lineTo(540, 1220);
    ctx.lineTo(1080, 440);
    ctx.lineTo(820, 440);
    ctx.fill();

    // Windshield Wipers
    ctx.strokeStyle = '#05070a';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(600, 1220);
    ctx.lineTo(920, 960);
    ctx.moveTo(1160, 1220);
    ctx.lineTo(1480, 960);
    ctx.stroke();

    // 5. 4-Line Transit Livery Band (#E4572E, #F2B705, #0B6E4F, #1B3A8A)
    const stripeY = 1290;
    const stripeH = 34;
    ctx.fillStyle = '#e4572e';
    ctx.fillRect(160, stripeY, 1728, stripeH);
    ctx.fillStyle = '#f2b705';
    ctx.fillRect(160, stripeY + stripeH, 1728, stripeH);
    ctx.fillStyle = '#0b6e4f';
    ctx.fillRect(160, stripeY + stripeH * 2, 1728, stripeH);
    ctx.fillStyle = '#1b3a8a';
    ctx.fillRect(160, stripeY + stripeH * 3, 1728, stripeH);

    // Front Authority Roundel / Crest
    ctx.fillStyle = '#121620';
    ctx.beginPath();
    ctx.arc(1024, 1358, 64, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e4572e';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.fillStyle = '#edeae2';
    ctx.font = 'bold 42px monospace';
    ctx.fillText('YR', 1024, 1358);

    // 6. Recessed Projector Headlight Pods
    const drawHeadlightCluster = (cx: number) => {
      // Dark Bezel Recess
      const bezelGrad = ctx.createRadialGradient(cx, 1570, 20, cx, 1570, 150);
      bezelGrad.addColorStop(0, '#10141c');
      bezelGrad.addColorStop(0.8, '#202636');
      bezelGrad.addColorStop(1, '#090b10');
      ctx.fillStyle = bezelGrad;
      ctx.beginPath();
      ctx.arc(cx, 1570, 146, 0, Math.PI * 2);
      ctx.fill();

      // Polished Chrome Reflector Ring
      ctx.strokeStyle = '#d6dfec';
      ctx.lineWidth = 18;
      ctx.stroke();

      // Glowing LED Projector Core
      const coreGrad = ctx.createRadialGradient(cx, 1570, 0, cx, 1570, 108);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.35, '#fffceb');
      coreGrad.addColorStop(0.7, '#f6e4ac');
      coreGrad.addColorStop(1, '#7a6b47');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, 1570, 108, 0, Math.PI * 2);
      ctx.fill();

      // Amber DRL Halo
      ctx.strokeStyle = '#f2b705';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(cx, 1570, 126, 0, Math.PI * 2);
      ctx.stroke();
    };

    drawHeadlightCluster(480);
    drawHeadlightCluster(1568);

    // 7. Lower Anti-Climber Crash Bumper with Steel Ribs
    ctx.fillStyle = '#141720';
    ctx.fillRect(160, 1750, 1728, 180);
    ctx.fillStyle = '#080a0e';
    for (let bx = 200; bx < 1860; bx += 60) {
      ctx.fillRect(bx, 1760, 32, 160);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  private generateFlankTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // 1. Brushed Stainless Steel Flank Gradient
    const baseGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    baseGrad.addColorStop(0, '#c6cbd8');
    baseGrad.addColorStop(0.18, '#e4e9f4');
    baseGrad.addColorStop(0.5, '#f4f7fd');
    baseGrad.addColorStop(0.82, '#d6dbe7');
    baseGrad.addColorStop(1, '#b6bdcc');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 4096, 1024);

    // Horizontal Brushed Steel Striations
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let y = 0; y < 1024; y += 4) {
      ctx.fillRect(0, y, 4096, 1.5);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    for (let y = 2; y < 1024; y += 6) {
      ctx.fillRect(0, y, 4096, 1);
    }

    // Fluted Corrugated Side Ribs (Lower Skirt)
    for (let y = 720; y <= 900; y += 36) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(0, y, 4096, 4);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(0, y + 4, 4096, 4);
    }

    // 2. Continuous Dark Glazing Window Band
    const windowBandY = 180;
    const windowBandH = 430;
    ctx.fillStyle = '#0c1018';
    ctx.fillRect(0, windowBandY, 4096, windowBandH);

    // 3. Sliding Passenger Doors (2 Large Double Doors)
    const drawDoor = (doorCenterX: number) => {
      const doorW = 540;
      const doorL = doorCenterX - doorW / 2;

      // Stainless Steel Door Frame
      ctx.fillStyle = '#dde2ed';
      ctx.fillRect(doorL, windowBandY - 30, doorW, windowBandH + 190);

      // Rubber Sealing Perimeter & Center Split Gasket
      ctx.fillStyle = '#07090c';
      ctx.fillRect(doorL + 4, windowBandY - 26, doorW - 8, windowBandH + 182);

      // Dual Door Panels
      const leafW = (doorW - 20) / 2;
      [doorL + 8, doorL + 12 + leafW].forEach((lx) => {
        ctx.fillStyle = '#c8cedc';
        ctx.fillRect(lx, windowBandY - 22, leafW, windowBandH + 174);

        // Door Window
        ctx.fillStyle = '#0e131d';
        this.drawSafeRoundRect(ctx, lx + 28, windowBandY + 10, leafW - 56, 320, 24);

        // Window Interior Warm Glow
        ctx.fillStyle = 'rgba(255, 235, 195, 0.14)';
        this.drawSafeRoundRect(ctx, lx + 36, windowBandY + 20, leafW - 72, 300, 18);

        // Door Glass Reflection Stripe
        ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.beginPath();
        ctx.moveTo(lx + 40, windowBandY + 320);
        ctx.lineTo(lx + 80, windowBandY + 320);
        ctx.lineTo(lx + 130, windowBandY + 20);
        ctx.lineTo(lx + 90, windowBandY + 20);
        ctx.fill();

        // Chrome Door Handle
        ctx.fillStyle = '#f0f4fa';
        ctx.fillRect(lx + leafW - 14, windowBandY + 360, 8, 48);
      });

      // Exterior Door Warning Indicator LED
      ctx.fillStyle = '#f2b705';
      ctx.beginPath();
      ctx.arc(doorCenterX, windowBandY - 48, 10, 0, Math.PI * 2);
      ctx.fill();
    };

    drawDoor(1150);
    drawDoor(2950);

    // 4. Passenger Windows with Interior Depth
    const drawWindow = (wx: number, ww: number) => {
      // Window Opening
      ctx.fillStyle = '#0b0f17';
      this.drawSafeRoundRect(ctx, wx, windowBandY + 20, ww, windowBandH - 40, 20);

      // Warm Saloon Interior Light
      ctx.fillStyle = 'rgba(255, 238, 204, 0.16)';
      this.drawSafeRoundRect(ctx, wx + 8, windowBandY + 28, ww - 16, windowBandH - 56, 14);

      // High-Back Passenger Seat Silhouettes
      ctx.fillStyle = '#161d2a';
      const seatSpacing = ww / 3;
      for (let s = wx + 20; s < wx + ww - 30; s += seatSpacing) {
        this.drawSafeRoundRect(ctx, s, windowBandY + 160, 56, 110, 12);
        ctx.fillRect(s + 8, windowBandY + 270, 40, 60);
      }

      // Stainless Steel Stanchion Handrail
      ctx.fillStyle = '#d4dbe8';
      ctx.fillRect(wx + ww / 2 - 3, windowBandY + 36, 6, windowBandH - 72);

      // Diagonal Exterior Glass Reflection Glint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(wx + 20, windowBandY + windowBandH - 30);
      ctx.lineTo(wx + 80, windowBandY + windowBandH - 30);
      ctx.lineTo(wx + 160, windowBandY + 30);
      ctx.lineTo(wx + 100, windowBandY + 30);
      ctx.fill();
    };

    // Windows along carriage
    drawWindow(140, 680);
    drawWindow(1520, 1080);
    drawWindow(3320, 640);

    // 5. 4-Line Transit Livery Waistline Band
    const stripeY = 620;
    const stripeH = 18;
    ctx.fillStyle = '#e4572e';
    ctx.fillRect(0, stripeY, 4096, stripeH);
    ctx.fillStyle = '#f2b705';
    ctx.fillRect(0, stripeY + stripeH, 4096, stripeH);
    ctx.fillStyle = '#0b6e4f';
    ctx.fillRect(0, stripeY + stripeH * 2, 4096, stripeH);
    ctx.fillStyle = '#1b3a8a';
    ctx.fillRect(0, stripeY + stripeH * 3, 4096, stripeH);

    // Fleet Branding & Signage
    ctx.fillStyle = '#0e121a';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('THE YUG LINE · METRO TRANSIT AUTHORITY', 280, 712);

    ctx.font = 'bold 24px monospace';
    ctx.fillText('CAR YR-01 // CENTRAL EXPRESS BERTH 01', 280, 750);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  private generateRoofTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Stainless Steel Roof Gradient
    const roofGrad = ctx.createLinearGradient(0, 0, 0, 512);
    roofGrad.addColorStop(0, '#b8beca');
    roofGrad.addColorStop(0.3, '#d8deeb');
    roofGrad.addColorStop(0.5, '#e8edf6');
    roofGrad.addColorStop(0.7, '#d8deeb');
    roofGrad.addColorStop(1, '#b8beca');
    ctx.fillStyle = roofGrad;
    ctx.fillRect(0, 0, 2048, 512);

    // Corrugated Roof Stiffener Ribs
    for (let x = 40; x < 2048; x += 32) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(x, 0, 4, 512);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(x + 4, 0, 4, 512);
    }

    // Anti-Slip Maintenance Walkway
    ctx.fillStyle = '#262d3a';
    ctx.fillRect(0, 210, 2048, 92);
    ctx.fillStyle = '#1c222c';
    for (let x = 0; x < 2048; x += 40) {
      ctx.fillRect(x, 212, 18, 88);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // =========================================================================
  // STUDIO ENVIRONMENT
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

    // Platform yellow floor bounce (#F2B705)
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
  // LIGHTING SETUP (Calibrated Studio Setup with Front Key & Spotlight)
  // =========================================================================
  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
    this.scene.add(ambientLight);

    // Key Light: Overhead angled key light illuminating side flank and roof
    const overheadKeyLight = new THREE.DirectionalLight(0xfffdf6, 2.5);
    overheadKeyLight.position.set(2.8, 5.0, 4.8);
    overheadKeyLight.castShadow = true;
    overheadKeyLight.shadow.mapSize.width = 1024;
    overheadKeyLight.shadow.mapSize.height = 1024;
    overheadKeyLight.shadow.bias = -0.0004;
    this.scene.add(overheadKeyLight);

    // Dedicated Front Cab Key Light (Directly illuminates the front face & windshield)
    const frontCabLight = new THREE.DirectionalLight(0xfffaee, 3.2);
    frontCabLight.position.set(-0.8, 2.6, 5.5);
    frontCabLight.target.position.set(-0.2, 0.8, 2.0);
    this.scene.add(frontCabLight);
    this.scene.add(frontCabLight.target);

    // Concourse Fill Light: Soft cool blue bounce
    const fillLight = new THREE.DirectionalLight(0x8da0bc, 1.4);
    fillLight.position.set(-3.5, 3.0, 2.5);
    this.scene.add(fillLight);

    // Rim Light: Bright crest light catching roof crown and pantograph
    const rimLight = new THREE.DirectionalLight(0xdde6f8, 2.0);
    rimLight.position.set(-1.8, 6.2, -3.8);
    this.scene.add(rimLight);
  }

  // =========================================================================
  // PLINTH & TRACK
  // =========================================================================
  private buildPlinthAndTrack() {
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x10131a,
      roughness: 0.5,
      metalness: 0.35,
    });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.14, 7.8), plinthMat);
    plinth.position.set(0, -0.07, 0);
    plinth.receiveShadow = true;
    this.plinthGroup.add(plinth);

    const ballastMat = new THREE.MeshStandardMaterial({
      color: 0x171b24,
      roughness: 0.95,
      metalness: 0.1,
    });
    const ballast = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.04, 7.74), ballastMat);
    ballast.position.set(0, 0.02, 0);
    ballast.receiveShadow = true;
    this.plinthGroup.add(ballast);

    // Sleepers (Ties)
    const tieMat = new THREE.MeshStandardMaterial({ color: 0x222733, roughness: 0.8, metalness: 0.15 });
    const tiePlateMat = new THREE.MeshStandardMaterial({ color: 0x3e4554, roughness: 0.4, metalness: 0.8 });
    const tieGeom = new THREE.BoxGeometry(1.5, 0.06, 0.15);
    const plateGeom = new THREE.BoxGeometry(0.12, 0.02, 0.14);

    for (let z = -3.7; z <= 3.7; z += 0.36) {
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

    // Running Rails (Polished Steel)
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xb5c2d6,
      metalness: 0.96,
      roughness: 0.1,
    });
    const railGeom = new THREE.BoxGeometry(0.05, 0.08, 7.74);

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

    // Platform Edge with Tactile Yellow Safety Pavers (#F2B705)
    const platformSlab = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.18, 7.74),
      new THREE.MeshStandardMaterial({ color: 0x151822, roughness: 0.6, metalness: 0.25 })
    );
    platformSlab.position.set(1.02, 0.1, 0);
    platformSlab.receiveShadow = true;
    this.plinthGroup.add(platformSlab);

    const yellowSafetyMat = new THREE.MeshStandardMaterial({
      color: 0xf2b705,
      emissive: 0xf2b705,
      emissiveIntensity: 0.28,
      roughness: 0.35,
    });
    const safetyStrip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.015, 7.74), yellowSafetyMat);
    safetyStrip.position.set(0.8, 0.195, 0);
    this.plinthGroup.add(safetyStrip);

    const studGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.01, 8);
    for (let z = -3.6; z <= 3.6; z += 0.2) {
      const stud = new THREE.Mesh(studGeom, yellowSafetyMat);
      stud.position.set(0.8, 0.205, z);
      this.plinthGroup.add(stud);
    }
  }

  // =========================================================================
  // REALISTIC TRAIN MODEL
  // =========================================================================
  private buildRealisticTrainModel() {
    const stainlessSteelMat = new THREE.MeshStandardMaterial({
      color: 0xd8dee8,
      metalness: 0.85,
      roughness: 0.18,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf6f9fd,
      metalness: 0.98,
      roughness: 0.05,
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x12151e,
      metalness: 0.7,
      roughness: 0.35,
    });

    const bogieSteelMat = new THREE.MeshStandardMaterial({ color: 0x1a1e28, metalness: 0.7, roughness: 0.6 });
    const wheelSteelMat = new THREE.MeshStandardMaterial({ color: 0x2e3544, metalness: 0.94, roughness: 0.12 });

    // -----------------------------------------------------------------------
    // BOGIE (TRUCK) HELPER
    // -----------------------------------------------------------------------
    const createBogie = (zCenter: number): THREE.Group => {
      const bogie = new THREE.Group();
      bogie.position.set(0, 0, zCenter);

      // Heavy Cast Steel H-Frame
      const sideBeamGeom = new THREE.BoxGeometry(0.08, 0.09, 0.92);
      const sideBeamL = new THREE.Mesh(sideBeamGeom, bogieSteelMat);
      sideBeamL.position.set(-0.55, 0.25, 0);
      sideBeamL.castShadow = true;
      bogie.add(sideBeamL);

      const sideBeamR = new THREE.Mesh(sideBeamGeom, bogieSteelMat);
      sideBeamR.position.set(0.55, 0.25, 0);
      sideBeamR.castShadow = true;
      bogie.add(sideBeamR);

      const transom = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.08, 0.24), bogieSteelMat);
      transom.position.set(0, 0.25, 0);
      bogie.add(transom);

      // Secondary Air Suspension Bellows
      const airBellowGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.09, 16);
      [-0.45, 0.45].forEach((bx) => {
        const bellow = new THREE.Mesh(airBellowGeom, darkTrimMat);
        bellow.position.set(bx, 0.33, 0);
        bogie.add(bellow);
      });

      // Axles & Flanged Steel Wheels
      const axlePositions = [-0.3, 0.3];
      const axleGeom = new THREE.CylinderGeometry(0.026, 0.026, 1.1, 16);
      axleGeom.rotateZ(Math.PI / 2);

      const wheelGeom = new THREE.CylinderGeometry(0.125, 0.125, 0.05, 24);
      wheelGeom.rotateZ(Math.PI / 2);

      const flangeGeom = new THREE.CylinderGeometry(0.142, 0.142, 0.015, 24);
      flangeGeom.rotateZ(Math.PI / 2);

      const hubGeom = new THREE.CylinderGeometry(0.045, 0.045, 0.07, 16);
      hubGeom.rotateZ(Math.PI / 2);

      const brakeDiscGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.015, 20);
      brakeDiscGeom.rotateZ(Math.PI / 2);

      axlePositions.forEach((az) => {
        const axle = new THREE.Mesh(axleGeom, wheelSteelMat);
        axle.position.set(0, 0.24, az);
        bogie.add(axle);

        // Left Wheel
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

        // Right Wheel
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

        // Ventilated Brake Discs
        const brakeL = new THREE.Mesh(brakeDiscGeom, chromeMat);
        brakeL.position.set(-0.25, 0.24, az);
        bogie.add(brakeL);

        const brakeR = new THREE.Mesh(brakeDiscGeom, chromeMat);
        brakeR.position.set(0.25, 0.24, az);
        bogie.add(brakeR);
      });

      // Third-Rail Emergency Current Collector Shoe
      const shoe = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.03, 0.22),
        new THREE.MeshStandardMaterial({ color: 0xf2b705, metalness: 0.85, roughness: 0.25 })
      );
      shoe.position.set(-0.62, 0.17, 0);
      bogie.add(shoe);

      return bogie;
    };

    // -----------------------------------------------------------------------
    // ARTICULATED DIAMOND PANTOGRAPH HELPER
    // -----------------------------------------------------------------------
    const createArticulatedPantograph = (zCenter: number): THREE.Group => {
      const pantograph = new THREE.Group();
      pantograph.position.set(0, 1.45, zCenter);

      // Terracotta Glazed Porcelain Standoff Insulators with Ring Sheds
      const insulatorMat = new THREE.MeshStandardMaterial({ color: 0xaa4528, roughness: 0.3, metalness: 0.2 });
      const insulatorPostGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.08, 12);
      const insulatorShedGeom = new THREE.CylinderGeometry(0.034, 0.034, 0.012, 12);

      [
        [-0.24, -0.2],
        [0.24, -0.2],
        [-0.24, 0.2],
        [0.24, 0.2],
      ].forEach(([ix, iz]) => {
        const post = new THREE.Mesh(insulatorPostGeom, insulatorMat);
        post.position.set(ix, 0.04, iz);
        pantograph.add(post);

        [-0.015, 0.015].forEach((sy) => {
          const shed = new THREE.Mesh(insulatorShedGeom, insulatorMat);
          shed.position.set(ix, 0.04 + sy, iz);
          pantograph.add(shed);
        });
      });

      // Pantograph Base Frame
      const baseFrame = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.02, 0.46), chromeMat);
      baseFrame.position.set(0, 0.085, 0);
      pantograph.add(baseFrame);

      // Lower Diamond Arms
      const lowerArmGeom = new THREE.CylinderGeometry(0.014, 0.014, 0.46, 10);
      lowerArmGeom.rotateX(Math.PI / 4.2);

      const lowerArmL = new THREE.Mesh(lowerArmGeom, chromeMat);
      lowerArmL.position.set(-0.16, 0.23, -0.06);
      pantograph.add(lowerArmL);

      const lowerArmR = new THREE.Mesh(lowerArmGeom, chromeMat);
      lowerArmR.position.set(0.16, 0.23, -0.06);
      pantograph.add(lowerArmR);

      // Upper Diamond Arms
      const upperArmGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.42, 10);
      upperArmGeom.rotateX(-Math.PI / 5.2);

      const upperArmL = new THREE.Mesh(upperArmGeom, chromeMat);
      upperArmL.position.set(-0.12, 0.52, -0.07);
      pantograph.add(upperArmL);

      const upperArmR = new THREE.Mesh(upperArmGeom, chromeMat);
      upperArmR.position.set(0.12, 0.52, -0.07);
      pantograph.add(upperArmR);

      // Articulation Cross Bar & Springs
      const crossBar = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.34, 10), chromeMat);
      crossBar.rotateZ(Math.PI / 2);
      crossBar.position.set(0, 0.38, 0.12);
      pantograph.add(crossBar);

      // Carbon Collector Panhead
      const collectorBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.74, 0.018, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x1e222a, metalness: 0.92, roughness: 0.18 })
      );
      collectorBar.position.set(0, 0.67, 0.06);
      pantograph.add(collectorBar);

      // Aerodynamic Collector Horns
      const hornGeom = new THREE.CylinderGeometry(0.007, 0.007, 0.09, 8);
      hornGeom.rotateZ(Math.PI / 3);

      const hornL = new THREE.Mesh(hornGeom, chromeMat);
      hornL.position.set(-0.39, 0.64, 0.06);
      pantograph.add(hornL);

      const hornR = new THREE.Mesh(hornGeom, chromeMat);
      hornR.position.set(0.39, 0.64, 0.06);
      hornR.rotation.z = -Math.PI / 3;
      pantograph.add(hornR);

      return pantograph;
    };

    // -----------------------------------------------------------------------
    // CAR A: LEAD CARRIAGE WITH AERODYNAMIC NOSE
    // -----------------------------------------------------------------------
    const carA = new THREE.Group();
    const carALength = 3.0;
    const carAWidth = 1.30;
    const carAHeight = 1.02;
    const bodyBaseY = 0.90;
    const carAZ = 0.30;
    const noseLength = 0.48;

    const flankMaterial = new THREE.MeshStandardMaterial({
      map: this.flankTexture,
      metalness: 0.82,
      roughness: 0.2,
    });

    const roofMaterial = new THREE.MeshStandardMaterial({
      map: this.roofTexture,
      metalness: 0.78,
      roughness: 0.25,
    });

    // Main Carriage Body (Multi-Material: sides textured, top roof material)
    const bodyMaterials = [
      flankMaterial,       // +X Right (Passenger Flank)
      stainlessSteelMat,   // -X Left (Far side)
      roofMaterial,        // +Y Top
      darkTrimMat,         // -Y Bottom
      stainlessSteelMat,   // +Z Front
      darkTrimMat,         // -Z Back
    ];

    const carABody = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth, carAHeight, carALength),
      bodyMaterials
    );
    carABody.position.set(0, bodyBaseY, carAZ);
    carABody.castShadow = true;
    carABody.receiveShadow = true;
    carA.add(carABody);

    // Arched Roof Cap (Smooth curved canopy profile, stops right before cab front plate)
    const roofCurveGeom = new THREE.CylinderGeometry(carAWidth * 0.58, carAWidth * 0.58, carALength + noseLength * 0.7, 32, 1, false, 0, Math.PI);
    roofCurveGeom.rotateZ(Math.PI / 2);
    roofCurveGeom.rotateY(Math.PI / 2);
    roofCurveGeom.scale(1, 0.28, 1);

    const carARoofCurved = new THREE.Mesh(roofCurveGeom, roofMaterial);
    carARoofCurved.position.set(0, bodyBaseY + carAHeight / 2, carAZ + (noseLength * 0.7) / 2 - 0.05);
    carARoofCurved.castShadow = true;
    carA.add(carARoofCurved);

    // Aerodynamic Raked Cab Nose (+Z)
    const cabFrontZ = carAZ + carALength / 2;

    // Sculpted Nose Body
    const cabNose = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.02, carAHeight - 0.02, noseLength),
      stainlessSteelMat
    );
    cabNose.position.set(0, bodyBaseY, cabFrontZ + noseLength / 2 - 0.02);
    cabNose.castShadow = true;
    carA.add(cabNose);

    // Front Textured Plate (Displays Destination Sign, Windshield, Headlight clusters & Livery)
    // Non-metallic dielectric front material ensures saturated transit colors, bright destination sign & clear glass
    const frontPlateMat = new THREE.MeshStandardMaterial({
      map: this.frontTexture,
      metalness: 0.25,
      roughness: 0.35,
    });
    const frontPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(carAWidth, carAHeight),
      frontPlateMat
    );
    frontPlate.position.set(0, bodyBaseY, cabFrontZ + noseLength);
    carA.add(frontPlate);

    // Forward projection spotlights casting warm illumination onto the track ahead
    [-0.32, 0.32].forEach((hx) => {
      const spot = new THREE.SpotLight(0xfffae8, 3.8, 9.5, Math.PI / 7, 0.45);
      spot.position.set(hx, bodyBaseY - 0.22, cabFrontZ + noseLength + 0.05);
      spot.target.position.set(hx, 0.08, cabFrontZ + noseLength + 6.0);
      carA.add(spot);
      carA.add(spot.target);
    });

    // Lower Front Heavy Bumper & Coupler
    const bumper = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.06, 0.15, 0.22),
      darkTrimMat
    );
    bumper.position.set(0, bodyBaseY - 0.45, cabFrontZ + noseLength - 0.02);
    carA.add(bumper);

    const coupler = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.09, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x242932, metalness: 0.95, roughness: 0.25 })
    );
    coupler.position.set(0, 0.35, cabFrontZ + noseLength + 0.12);
    carA.add(coupler);

    // Roof Equipment: Articulated Pantograph & Aerodynamic HVAC Pod
    carA.add(createArticulatedPantograph(carAZ - 0.1));

    const hvacA = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.11, 0.85), darkTrimMat);
    hvacA.position.set(0, 1.45, carAZ + 0.85);
    carA.add(hvacA);

    // Bogies for Car A
    carA.add(createBogie(carAZ - 0.65));
    carA.add(createBogie(carAZ + 0.65));

    // Underfloor Equipment Boxes (Undercarriage depth)
    const inverterBox = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.22, 0.6), darkTrimMat);
    inverterBox.position.set(0, 0.38, carAZ);
    carA.add(inverterBox);

    const airTankGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.55, 16);
    airTankGeom.rotateZ(Math.PI / 2);
    const airTank = new THREE.Mesh(airTankGeom, stainlessSteelMat);
    airTank.position.set(-0.25, 0.34, carAZ - 0.45);
    carA.add(airTank);

    this.trainGroup.add(carA);

    // -----------------------------------------------------------------------
    // GANGWAY BELLOWS & CAR B (TRAILING CARRIAGE)
    // -----------------------------------------------------------------------
    const bellows = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth - 0.1, carAHeight - 0.08, 0.24),
      new THREE.MeshStandardMaterial({ color: 0x12141a, roughness: 0.88, metalness: 0.18 })
    );
    bellows.position.set(0, bodyBaseY, carAZ - carALength / 2 - 0.12);
    this.trainGroup.add(bellows);

    const carB = new THREE.Group();
    const carBLength = 2.4;
    const carBZ = carAZ - carALength / 2 - 0.24 - carBLength / 2;

    const carBBody = new THREE.Mesh(
      new THREE.BoxGeometry(carAWidth, carAHeight, carBLength),
      bodyMaterials
    );
    carBBody.position.set(0, bodyBaseY, carBZ);
    carB.add(carBBody);

    const roofCurveBGeom = new THREE.CylinderGeometry(carAWidth * 0.58, carAWidth * 0.58, carBLength, 32, 1, false, 0, Math.PI);
    roofCurveBGeom.rotateZ(Math.PI / 2);
    roofCurveBGeom.rotateY(Math.PI / 2);
    roofCurveBGeom.scale(1, 0.28, 1);

    const carBRoofCurved = new THREE.Mesh(roofCurveBGeom, roofMaterial);
    carBRoofCurved.position.set(0, bodyBaseY + carAHeight / 2, carBZ);
    carB.add(carBRoofCurved);

    const hvacB = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.11, 0.85), darkTrimMat);
    hvacB.position.set(0, 1.45, carBZ);
    carB.add(hvacB);

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
    const canvasWrap = this.canvas ? this.canvas.parentElement : null;
    const width = (canvasWrap && canvasWrap.clientWidth) || this.container.clientWidth || 580;
    const height = (canvasWrap && canvasWrap.clientHeight) || Math.min(340, Math.max(240, Math.floor(width * 0.48)));

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  // =========================================================================
  // ANIMATION LOOP (Smooth Forward Arrival & Gentle Suspension Breathing)
  // =========================================================================
  private animate = () => {
    if (this.isDestroyed) return;

    if (this.rollInProgress < 1) {
      this.rollInProgress += (1 - this.rollInProgress) * 0.045;
      const rollOffset = (1 - this.rollInProgress) * -3.2;
      this.trainGroup.position.z = rollOffset;
    } else {
      this.trainGroup.position.z = 0;
    }

    const time = Date.now() * 0.0018;
    this.trainGroup.position.y = Math.sin(time) * 0.006;

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
    if (this.roofTexture) {
      this.roofTexture.dispose();
    }
  }
}
