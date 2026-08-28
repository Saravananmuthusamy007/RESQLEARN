// Level2BleedingScene.js - Realistic Human Anatomical Bleeding Control Simulation

import { BaseSimulation } from '../common/BaseSimulation.js';

export class Level2BleedingScene extends BaseSimulation {
  constructor() {
    super('Level2BleedingScene', 2);
    this.pressureDurationSec = 0;
    this.requiredPressureSec = 10;
    this.isPressingWound = false;
  }

  create() {
    super.create();
    this.drawAnatomicalBleedingArm();
    this.setupBleedingControls();
  }

  drawAnatomicalBleedingArm() {
    const { width, height } = this.scale;
    const px = width * 0.5;
    const py = height * 0.48;

    this.armGroup = this.add.container(px, py);

    const g = this.add.graphics();

    // 1. Arm Outline & Skin Anatomy
    g.fillStyle(0xfbcfe8, 1); // Human skin tone
    g.fillRoundedRect(-160, -40, 320, 80, 20); // Forearm
    g.lineStyle(2, 0xe11d48, 0.4);
    g.strokeRoundedRect(-160, -40, 320, 80, 20);

    // Bicep / Elbow Joint (Proximal)
    g.fillStyle(0xf472b6, 1);
    g.fillCircle(-160, 0, 42);

    // Hand & Fingers (Distal)
    g.fillStyle(0xfbcfe8, 1);
    g.fillCircle(160, 0, 28);
    for (let f = -18; f <= 18; f += 9) {
      g.fillRoundedRect(175, f - 3, 25, 6, 3);
    }

    // 2. Subcutaneous Muscle Fiber Layer (Under Skin Laceration)
    g.fillStyle(0x9f1239, 1); // Muscle deep red
    g.fillRoundedRect(0, -15, 60, 30, 8);

    // Brachial / Radial Artery Line
    g.lineStyle(3, 0xd97706, 0.8);
    g.lineBetween(-150, 0, 150, 0);

    // 3. Deep Laceration Wound
    g.fillStyle(0xd97706, 1); // Active blood red
    g.fillEllipse(30, 0, 40, 16);

    this.bloodDropGraphics = this.add.graphics();
    this.armGroup.add([g, this.bloodDropGraphics]);

    // Arterial Blood Pulsing Particle Stream Animation
    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 500,
      repeat: -1,
      onUpdate: (tween) => {
        if (!this.bloodDropGraphics) return;
        this.bloodDropGraphics.clear();
        if (this.tracker.getCurrentStep() !== 'COMPLETE' && !this.bandageApplied) {
          const val = tween.getValue();
          for (let i = 0; i < 4; i++) {
            const dropY = (val * 35 + i * 10) % 40;
            const dropX = 30 + Math.sin(val * Math.PI * 2 + i) * 8;
            this.bloodDropGraphics.fillStyle(0xd97706, 0.85);
            this.bloodDropGraphics.fillCircle(dropX, dropY, 5 - i * 0.8);
          }
        }
      }
    });

    this.statusText = this.add.text(px, py - 120, 'ANATOMY: FOREARM ARTERIAL BLEEDING WOUND', {
      fontFamily: 'sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#d97706'
    }).setOrigin(0.5, 0.5);

    this.drawTargetZone(px + 30, py, 40, null, true);
  }

  setupBleedingControls() {
    const { width, height } = this.scale;
    const btnY = height * 0.86;

    this.createProceduralButton(width * 0.16, btnY, 130, 42, '1. Spot Bleeding', () => {
      this.handleActionAttempt('IDENTIFY_BLEEDING', 100, 'Identified severe arterial spurt from radial artery.');
    });

    this.createProceduralButton(width * 0.33, btnY, 130, 42, '2. Wear Gloves', () => {
      this.handleActionAttempt('WEAR_PPE', 100, 'Medical nitrile gloves equipped.');
    });

    this.createProceduralButton(width * 0.50, btnY, 130, 42, '3. Sterile Gauze', () => {
      this.handleActionAttempt('SELECT_DRESSING', 100, 'Absorbent sterile gauze pad selected.');
    });

    this.createProceduralButton(width * 0.67, btnY, 130, 42, '4. Apply Pressure', () => {
      this.handleActionAttempt('APPLY_DIRECT_PRESSURE', 95, 'Firm direct pressure applied over laceration.');
    });

    this.createProceduralButton(width * 0.84, btnY, 130, 42, '5. Hold & Bandage', () => {
      const step = this.tracker.getCurrentStep();
      if (step === 'MAINTAIN_PRESSURE') {
        this.startPressureTimer();
      } else if (step === 'ADD_BANDAGE') {
        this.applyRollerBandage();
      } else {
        this.handleActionAttempt(step, 60, 'Complete prior steps.');
      }
    });

    this.pressureText = this.add.text(width / 2, height * 0.74, '', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#38bdf8'
    }).setOrigin(0.5, 0.5);
  }

  startPressureTimer() {
    if (this.isPressingWound) return;
    this.isPressingWound = true;
    this.pressureDurationSec = 0;

    this.time.addEvent({
      delay: 1000,
      repeat: this.requiredPressureSec - 1,
      callback: () => {
        this.pressureDurationSec++;
        this.pressureText.setText(`HOLDING DIRECT PRESSURE: ${this.pressureDurationSec}s / ${this.requiredPressureSec}s`);
        if (this.pressureDurationSec >= this.requiredPressureSec) {
          this.isPressingWound = false;
          this.handleActionAttempt('MAINTAIN_PRESSURE', 100, 'Direct pressure maintained 10s. Hemorrhage controlled.');
          this.pressureText.setText('BLEEDING CONTROLLED: READY FOR PRESSURE BANDAGE');
        }
      }
    });
  }

  applyRollerBandage() {
    this.bandageApplied = true;
    const px = this.scale.width * 0.5;
    const py = this.scale.height * 0.48;

    const b = this.add.graphics();
    b.fillStyle(0xf8fafc, 0.95);
    b.fillRoundedRect(px - 10, py - 45, 80, 90, 12);
    b.lineStyle(2, 0x94a3b8, 1);
    b.strokeRoundedRect(px - 10, py - 45, 80, 90, 12);

    // Cross pattern bandage wrapping lines
    b.lineStyle(2, 0xc084fc, 0.7);
    b.lineBetween(px - 10, py - 35, px + 70, py + 35);
    b.lineBetween(px - 10, py + 35, px + 70, py - 35);

    this.handleActionAttempt('ADD_BANDAGE', 95, 'Pressure roller bandage wrapped securely over gauze.');
    this.handleActionAttempt('COMPLETE', 100, 'Bleeding control procedure completed successfully!');
  }
}
