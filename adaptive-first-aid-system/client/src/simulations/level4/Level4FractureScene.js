// Level4FractureScene.js - Realistic Human Anatomical Limb Fracture & Splint Immobilization Simulation

import { BaseSimulation } from '../common/BaseSimulation.js';

export class Level4FractureScene extends BaseSimulation {
  constructor() {
    super('Level4FractureScene', 4);
    this.splintPositioned = false;
    this.bandagesSecured = false;
  }

  create() {
    super.create();
    this.drawAnatomicalFractureLimb();
    this.setupFractureControls();
  }

  drawAnatomicalFractureLimb() {
    const { width, height } = this.scale;
    const px = width * 0.5;
    const py = height * 0.48;

    this.limbContainer = this.add.container(px, py);
    const g = this.add.graphics();

    // 1. Human Arm Contour & Skin Anatomy
    g.fillStyle(0xfbcfe8, 1); // Natural skin tone
    g.fillRoundedRect(-160, -36, 320, 72, 18);
    g.lineStyle(2, 0xe11d48, 0.3);
    g.strokeRoundedRect(-160, -36, 320, 72, 18);

    // Elbow Joint (Proximal)
    g.fillStyle(0xf472b6, 1);
    g.fillCircle(-160, 0, 42);

    // Wrist & Hand (Distal)
    g.fillStyle(0xfbcfe8, 1);
    g.fillCircle(160, 0, 26);

    // 2. Anatomical Bone Structure Overlay (Radius & Ulna Forearm Bones)
    g.lineStyle(4, 0xfffffe, 0.8);
    // Proximal intact Radius/Ulna
    g.lineBetween(-150, -12, 10, -12);
    g.lineBetween(-150, 12, 10, 12);
    // Distal intact bone segment
    g.lineBetween(60, -12, 150, -12);
    g.lineBetween(60, 12, 150, 12);

    // 3. Displaced Mid-Shaft Radius Bone Fracture
    g.lineStyle(4, 0xef4444, 1);
    g.lineBetween(10, -12, 45, -24); // Displaced Upper Bone Fragment
    g.lineBetween(60, -12, 35, 4); // Displaced Lower Bone Fragment

    // Swelling, Hematoma & Deformity Redness Highlight
    g.lineStyle(2, 0xef4444, 0.9);
    g.fillStyle(0xf87171, 0.4);
    g.fillCircle(35, -8, 32);
    g.strokeCircle(35, -8, 32);

    this.limbContainer.add(g);

    // Pain / Muscle Spasm Wave Lines Animation
    this.spasmGraphics = this.add.graphics();
    this.limbContainer.add(this.spasmGraphics);

    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 600,
      repeat: -1,
      onUpdate: (tween) => {
        if (!this.spasmGraphics) return;
        this.spasmGraphics.clear();
        if (!this.bandagesSecured) {
          const val = tween.getValue();
          this.spasmGraphics.lineStyle(2, 0xfacc15, 0.7 - val * 0.5);
          this.spasmGraphics.strokeCircle(35, -8, 32 + val * 20);
        }
      }
    });

    this.drawTargetZone(px + 35, py - 8, 120, 60, true);

    this.statusText = this.add.text(px, py - 120, 'ANATOMY: CLOSED DISPLACED RADIUS FRACTURE', {
      fontFamily: 'sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ef4444'
    }).setOrigin(0.5, 0.5);
  }

  setupFractureControls() {
    const { width, height } = this.scale;
    const btnY = height * 0.86;

    this.createProceduralButton(width * 0.16, btnY, 130, 42, '1. Spot Fracture', () => {
      this.handleActionAttempt('IDENTIFY_FRACTURE', 100, 'Identified focal deformity & crepitus at mid-shaft radius.');
    });

    this.createProceduralButton(width * 0.33, btnY, 130, 42, '2. Immobilize', () => {
      this.handleActionAttempt('IMMOBILIZE_LIMB', 100, 'Victim instructed to manual immobilize limb above and below joint.');
    });

    this.createProceduralButton(width * 0.50, btnY, 130, 42, '3. Select Splint', () => {
      this.handleActionAttempt('SELECT_SPLINT', 100, 'Padded rigid SAM aluminum splint selected.');
    });

    this.createProceduralButton(width * 0.67, btnY, 130, 42, '4. Place Splint', () => {
      this.positionSplintOnLimb();
    });

    this.createProceduralButton(width * 0.84, btnY, 130, 42, '5. Secure & Check', () => {
      const step = this.tracker.getCurrentStep();
      if (step === 'SECURE_BANDAGES') {
        this.secureTriangularBandages();
      } else if (step === 'CHECK_CIRCULATION') {
        this.checkDistalCirculation();
      } else {
        this.handleActionAttempt(step, 60, 'Position splint firmly before securing bandages.');
      }
    });
  }

  positionSplintOnLimb() {
    this.splintPositioned = true;
    const px = this.scale.width * 0.5;
    const py = this.scale.height * 0.48;

    const splintGraphics = this.add.graphics();
    splintGraphics.fillStyle(0x334155, 0.95);
    splintGraphics.fillRoundedRect(px - 150, py + 26, 300, 22, 8);
    splintGraphics.lineStyle(2, 0x94a3b8, 1);
    splintGraphics.strokeRoundedRect(px - 150, py + 26, 300, 22, 8);

    this.handleActionAttempt('POSITION_SPLINT', 95, 'Rigid splint positioned extending from elbow joint past wrist.');
  }

  secureTriangularBandages() {
    this.bandagesSecured = true;
    const px = this.scale.width * 0.5;
    const py = this.scale.height * 0.48;

    const b = this.add.graphics();
    b.fillStyle(0xf8fafc, 0.9);
    // Cravat 1 (Proximal)
    b.fillRoundedRect(px - 100, py - 38, 28, 86, 6);
    // Cravat 2 (Distal)
    b.fillRoundedRect(px + 80, py - 38, 28, 86, 6);

    this.handleActionAttempt('SECURE_BANDAGES', 95, 'Triangular cravat bandages secured above and below fracture site.');
  }

  checkDistalCirculation() {
    const px = this.scale.width * 0.5 + 160;
    const py = this.scale.height * 0.48;

    // Distal Radial Pulse Glowing Indicator
    const pulseGraphics = this.add.graphics();
    pulseGraphics.fillStyle(0x22c55e, 0.9);
    pulseGraphics.fillCircle(px, py, 10);

    this.tweens.add({
      targets: pulseGraphics,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 600,
      repeat: 2
    });

    this.handleActionAttempt('CHECK_CIRCULATION', 100, 'Distal radial pulse strong. Capillary refill < 2s. CSM intact.');
    this.handleActionAttempt('COMPLETE', 100, 'Fracture immobilization protocol successfully completed!');
  }
}
