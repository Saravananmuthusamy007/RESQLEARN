// Level1CPRScene.js - Realistic Human Anatomical CPR Simulation

import { BaseSimulation } from '../common/BaseSimulation.js';

export class Level1CPRScene extends BaseSimulation {
  constructor() {
    super('Level1CPRScene', 1);
    this.compressionsCount = 0;
    this.requiredCompressions = 30;
    this.lastCompressionTime = 0;
  }

  create() {
    super.create();
    this.compressionsCount = 0;
    this.drawAnatomicalHumanTorso();
    this.setupCPRControls();
  }

  drawAnatomicalHumanTorso() {
    const { width, height } = this.scale;
    const px = width * 0.5;
    const py = height * 0.48;

    this.patientGroup = this.add.container(px, py);

    // Anatomical Graphics Object
    const g = this.add.graphics();

    // 1. Clinical Resuscitation Mat
    g.fillStyle(0x0f172a, 1);
    g.fillRoundedRect(-200, -120, 400, 240, 20);
    g.lineStyle(2, 0x334155, 1);
    g.strokeRoundedRect(-200, -120, 400, 240, 20);

    // 2. Human Head & Neck (Anatomical Profile)
    g.fillStyle(0xfbcfe8, 1); // Natural skin tone
    g.fillCircle(-190, 0, 36); // Head
    g.fillRoundedRect(-160, -18, 40, 36, 8); // Neck

    // Unconscious Face Features
    g.lineStyle(2, 0x881337, 0.8);
    g.lineBetween(-202, -10, -188, -10); // Closed Left Eye
    g.lineBetween(-202, 10, -188, 10); // Closed Right Eye
    g.lineBetween(-180, -2, -170, -2); // Mouth

    // 3. Human Upper Torso & Chest Contour
    g.fillStyle(0xf472b6, 1); // Chest skin
    g.fillRoundedRect(-130, -75, 260, 150, 30);

    // 4. Ribcage & Sternum Bone Structure (Anatomical Overlay)
    g.lineStyle(3, 0xffffff, 0.6);
    // Sternum (Center Breastbone)
    g.strokeRoundedRect(-15, -45, 30, 90, 6);
    // Left & Right Rib Lines
    for (let i = -35; i <= 35; i += 18) {
      g.lineBetween(-15, i, -70, i - 10); // Left Ribs
      g.lineBetween(15, i, 70, i - 10); // Right Ribs
    }

    // 5. Pulsing Heart Anatomical Icon
    this.heartGraphics = this.add.graphics();
    this.drawHeartShape(this.heartGraphics, -25, -10, 0xef4444);
    this.patientGroup.add(this.heartGraphics);

    // Heart Beat Pulsing Animation Tween (100 bpm)
    this.tweens.add({
      targets: this.heartGraphics,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      repeat: -1
    });

    // 6. Expanding Lungs Breathing Animation Overlay
    this.lungGraphics = this.add.graphics();
    this.drawLungShape(this.lungGraphics, 0x38bdf8, 0.25);
    this.patientGroup.add(this.lungGraphics);

    this.tweens.add({
      targets: this.lungGraphics,
      alpha: 0.5,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1500,
      yoyo: true,
      repeat: -1
    });

    // 7. Sternum Hand Alignment Target Zone Highlight
    g.lineStyle(3, 0xef4444, 0.9);
    g.fillStyle(0xf87171, 0.35);
    g.fillCircle(0, 10, 36);
    g.strokeCircle(0, 10, 36);

    // Center Crosshair Target
    g.lineStyle(2, 0xfacc15, 1);
    g.lineBetween(-14, 10, 14, 10);
    g.lineBetween(0, -4, 0, 24);

    this.patientGroup.add(g);

    // Victim Status Badge
    this.statusText = this.add.text(px, py - 140, 'HUMAN ANATOMY: UNRESPONSIVE PATIENT', {
      fontFamily: 'sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#f87171'
    }).setOrigin(0.5, 0.5);

    // Interactive Sternum Chest Hit Zone
    const chestZone = this.add.zone(px, py + 10, 110, 110).setInteractive({ useHandCursor: true });
    chestZone.on('pointerdown', (pointer) => {
      const step = this.tracker.getCurrentStep();
      if (step === 'CHECK_RESPONSIVENESS') {
        this.handleActionAttempt('CHECK_RESPONSIVENESS', 100, 'Tapped shoulder: No response from patient.');
        this.statusText.setText('PATIENT STATUS: UNRESPONSIVE (NO VERBAL/MOTOR RESPONSE)');
      } else if (step === 'CHECK_BREATHING') {
        this.handleActionAttempt('CHECK_BREATHING', 100, 'Observed chest rise & fall: No normal breathing.');
        this.statusText.setText('RESPIRATORY STATUS: RESPIRATORY ARREST (NO BREATHING)');
      } else if (step === 'POSITION_HANDS') {
        this.handleActionAttempt('POSITION_HANDS', 95, 'Heel of hand placed on lower half of sternum.');
      } else if (step === 'CHEST_COMPRESSIONS') {
        this.performAnatomicalCompression(pointer);
      } else {
        this.handleActionAttempt(step, 60, 'Click the procedure action buttons below.');
      }
    });

    this.drawTargetZone(px, py + 10, 40, null, true);
  }

  drawHeartShape(g, x, y, color) {
    g.fillStyle(color, 0.9);
    g.beginPath();
    g.fillCircle(x - 6, y - 6, 8);
    g.fillCircle(x + 6, y - 6, 8);
    g.fillTriangle(x - 14, y - 2, x + 14, y - 2, x, y + 14);
  }

  drawLungShape(g, color, alpha) {
    g.fillStyle(color, alpha);
    g.fillRoundedRect(-60, -35, 45, 70, 14);
    g.fillRoundedRect(15, -35, 45, 70, 14);
  }

  setupCPRControls() {
    const { width, height } = this.scale;
    const btnY = height * 0.86;

    this.createProceduralButton(width * 0.16, btnY, 130, 42, '1. Check Scene', () => {
      this.handleActionAttempt('OBSERVE_VICTIM', 100, 'Observed scene: Environment safe for responder.');
    });

    this.createProceduralButton(width * 0.33, btnY, 130, 42, '2. Check Response', () => {
      this.handleActionAttempt('CHECK_RESPONSIVENESS', 95, 'Checked responsiveness: Victim unresponsive.');
    });

    this.createProceduralButton(width * 0.50, btnY, 130, 42, '3. Check Breathing', () => {
      this.handleActionAttempt('CHECK_BREATHING', 95, 'Checked breathing: Absence of normal breathing.');
    });

    this.createProceduralButton(width * 0.67, btnY, 130, 42, '4. Call 911 / AED', () => {
      this.handleActionAttempt('CALL_EMERGENCY', 100, 'Emergency EMS dispatched & AED requested.');
    });

    this.createProceduralButton(width * 0.84, btnY, 130, 42, '5. Align Hands', () => {
      this.handleActionAttempt('POSITION_HANDS', 95, 'Hands aligned over lower half of sternum.');
    });

    this.compressionText = this.add.text(width / 2, height * 0.74, '', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#facc15'
    }).setOrigin(0.5, 0.5);
  }

  performAnatomicalCompression(pointer) {
    this.compressionsCount++;

    // Realistic chest compression depth animation (2 inches / 5 cm)
    this.tweens.add({
      targets: this.patientGroup,
      scaleY: 0.90,
      scaleX: 1.03,
      duration: 80,
      yoyo: true
    });

    // Heart squeeze effect
    this.tweens.add({
      targets: this.heartGraphics,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 80,
      yoyo: true
    });

    this.compressionText.setText(`CHEST COMPRESSIONS: ${this.compressionsCount} / ${this.requiredCompressions} (5 cm Depth)`);

    if (this.compressionsCount >= this.requiredCompressions) {
      this.handleActionAttempt('CHEST_COMPRESSIONS', 100, '30 high-quality chest compressions completed (100-120 bpm rhythm)!');
      this.handleActionAttempt('COMPLETE', 100, 'CPR protocol successfully administered to patient!');
    } else {
      this.showFeedbackToast(`Compression ${this.compressionsCount}/30 (5cm Depth - Rhythm Good)`, true);
    }
  }
}
