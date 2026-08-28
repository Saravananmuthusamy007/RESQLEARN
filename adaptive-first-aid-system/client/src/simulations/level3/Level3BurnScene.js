// Level3BurnScene.js - Realistic Human Anatomical Burn Cooling & Dressing Simulation

import { BaseSimulation } from '../common/BaseSimulation.js';

export class Level3BurnScene extends BaseSimulation {
  constructor() {
    super('Level3BurnScene', 3);
    this.coolingTimerSec = 0;
    this.requiredCoolingSec = 10;
  }

  create() {
    super.create();
    this.drawAnatomicalBurnLeg();
    this.setupBurnControls();
  }

  drawAnatomicalBurnLeg() {
    const { width, height } = this.scale;
    const px = width * 0.5;
    const py = height * 0.48;

    this.legGroup = this.add.container(px, py);

    const g = this.add.graphics();

    // 1. Human Thigh / Leg Skin Anatomy
    g.fillStyle(0xfbcfe8, 1); // Natural skin tone
    g.fillRoundedRect(-160, -45, 320, 90, 24);
    g.lineStyle(2, 0xe11d48, 0.3);
    g.strokeRoundedRect(-160, -45, 320, 90, 24);

    // Knee Joint (Proximal)
    g.fillStyle(0xf472b6, 1);
    g.fillCircle(-160, 0, 48);

    // 2. Second-Degree Thermal Scald Burn Area
    this.burnAreaGraphics = this.add.graphics();
    this.burnAreaGraphics.fillStyle(0xe11d48, 0.95); // Deep scald red
    this.burnAreaGraphics.fillCircle(0, 0, 36);
    this.burnAreaGraphics.fillStyle(0xf97316, 0.85);
    this.burnAreaGraphics.fillCircle(0, 0, 24);

    // Blistering Scald Dots
    this.burnAreaGraphics.fillStyle(0xfef08a, 0.9);
    this.burnAreaGraphics.fillCircle(-10, -8, 6);
    this.burnAreaGraphics.fillCircle(12, 6, 7);
    this.burnAreaGraphics.fillCircle(-4, 14, 5);

    this.legGroup.add([g, this.burnAreaGraphics]);

    // Thermal Heat Dissipation Steam Animation Particle Stream
    this.steamGraphics = this.add.graphics();
    this.legGroup.add(this.steamGraphics);

    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 800,
      repeat: -1,
      onUpdate: (tween) => {
        if (!this.steamGraphics) return;
        this.steamGraphics.clear();
        if (this.coolingTimerSec < this.requiredCoolingSec) {
          const val = tween.getValue();
          for (let i = 0; i < 3; i++) {
            const steamY = -30 - (val * 30 + i * 8) % 35;
            const steamX = (i - 1) * 12 + Math.sin(val * Math.PI * 2) * 5;
            this.steamGraphics.fillStyle(0xffffff, 0.4 - (Math.abs(steamY) / 70));
            this.steamGraphics.fillCircle(steamX, steamY, 6 + i);
          }
        }
      }
    });

    this.statusText = this.add.text(px, py - 120, 'ANATOMY: THIGH SECOND-DEGREE THERMAL BURN', {
      fontFamily: 'sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#f97316'
    }).setOrigin(0.5, 0.5);

    this.drawTargetZone(px, py, 45, null, true);
  }

  setupBurnControls() {
    const { width, height } = this.scale;
    const btnY = height * 0.86;

    this.createProceduralButton(width * 0.14, btnY, 120, 42, '1. Assess Burn', () => {
      this.handleActionAttempt('IDENTIFY_BURN', 100, 'Partial-thickness dermal burn identified on thigh.');
    });

    this.createProceduralButton(width * 0.30, btnY, 120, 42, '2. Move Hazard', () => {
      this.handleActionAttempt('REMOVE_HAZARD', 100, 'Heat source safely isolated from patient.');
    });

    this.createProceduralButton(width * 0.46, btnY, 120, 42, '3. Cool Water', () => {
      this.handleActionAttempt('COOL_BURN_AREA', 95, 'Cool running tap water stream directed over scald area.');
    });

    this.createProceduralButton(width * 0.62, btnY, 120, 42, '4. Cooling Temp', () => {
      this.handleActionAttempt('SELECT_COOLING_METHOD', 100, 'Clean cool running tap water (10-20°C) confirmed.');
    });

    this.createProceduralButton(width * 0.78, btnY, 120, 42, '5. Hold Cooling', () => {
      const step = this.tracker.getCurrentStep();
      if (step === 'MONITOR_COOLING') {
        this.startCoolingWaterStream();
      } else {
        this.handleActionAttempt(step, 70, 'Complete prior steps.');
      }
    });

    this.createProceduralButton(width * 0.92, btnY, 100, 42, '6. Dressing', () => {
      const step = this.tracker.getCurrentStep();
      if (step === 'APPLY_STERILE_DRESSING') {
        this.applyNonAdherentDressing();
      } else {
        this.handleActionAttempt(step, 60, 'Cool burn thoroughly before applying non-adherent dressing.');
      }
    }, { bgColor: 0x059669, hoverColor: 0x10b981 });

    // Warning buttons for common mistakes
    const mistakeBtnY = height * 0.74;
    this.createProceduralButton(width * 0.3, mistakeBtnY, 110, 32, '❌ Apply Ice', () => {
      this.handleActionAttempt('APPLY_ICE', 0, 'DANGER: Ice induces hypothermia & tissue frostbite! DO NOT USE ICE.');
    }, { bgColor: 0x991b1b, hoverColor: 0xd97706 });

    this.createProceduralButton(width * 0.7, mistakeBtnY, 110, 32, '❌ Apply Butter', () => {
      this.handleActionAttempt('APPLY_BUTTER', 0, 'DANGER: Butter traps thermal energy & causes severe infection! DO NOT USE.');
    }, { bgColor: 0x991b1b, hoverColor: 0xd97706 });
  }

  startCoolingWaterStream() {
    this.coolingTimerSec = 0;

    // Water Spray Blue Stream Animation
    const waterGraphics = this.add.graphics();
    this.legGroup.add(waterGraphics);

    this.time.addEvent({
      delay: 1000,
      repeat: this.requiredCoolingSec - 1,
      callback: () => {
        this.coolingTimerSec++;

        // Cool skin color shift (redness fades)
        this.tweens.add({
          targets: this.burnAreaGraphics,
          alpha: 0.6,
          duration: 500
        });

        this.statusText.setText(`COOLING IN PROGRESS: ${this.coolingTimerSec}s / ${this.requiredCoolingSec}s (TAP WATER)`);

        if (this.coolingTimerSec >= this.requiredCoolingSec) {
          waterGraphics.clear();
          this.handleActionAttempt('MONITOR_COOLING', 100, 'Burn cooled continuously for 10s. Tissue damage halted.');
          this.statusText.setText('COOLING COMPLETE: APPLY STERILE NON-STICK DRESSING');
        }
      }
    });
  }

  applyNonAdherentDressing() {
    const px = this.scale.width * 0.5;
    const py = this.scale.height * 0.48;

    const g = this.add.graphics();
    g.fillStyle(0xf1f5f9, 0.95);
    g.fillCircle(px, py, 45);
    g.lineStyle(2, 0x64748b, 1);
    g.strokeCircle(px, py, 45);

    this.handleActionAttempt('APPLY_STERILE_DRESSING', 100, 'Non-adherent sterile plastic wrap applied loosely over burn.');
    this.handleActionAttempt('COMPLETE', 100, 'Burn first-aid protocol successfully completed!');
  }
}
