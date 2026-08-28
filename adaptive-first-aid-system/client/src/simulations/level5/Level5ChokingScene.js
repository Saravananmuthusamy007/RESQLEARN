// Level5ChokingScene.js - Realistic Human Anatomical Choking & Heimlich Maneuver Simulation

import { BaseSimulation } from '../common/BaseSimulation.js';

export class Level5ChokingScene extends BaseSimulation {
  constructor() {
    super('Level5ChokingScene', 5);
    this.backBlowsCount = 0;
    this.requiredBackBlows = 5;
    this.thrustsCount = 0;
    this.requiredThrusts = 5;
  }

  create() {
    super.create();
    this.backBlowsCount = 0;
    this.thrustsCount = 0;
    this.drawAnatomicalChokingHuman();
    this.setupChokingControls();
  }

  drawAnatomicalChokingHuman() {
    const { width, height } = this.scale;
    const px = width * 0.5;
    const py = height * 0.46;

    this.victimContainer = this.add.container(px, py);
    const g = this.add.graphics();

    // 1. Standing Human Head & Neck (Skin Tone)
    g.fillStyle(0xfbcfe8, 1);
    g.fillCircle(0, -90, 30); // Head
    g.fillRoundedRect(-16, -65, 32, 28, 6); // Neck

    // Distress Eyes & Open Mouth
    g.fillStyle(0x0f172a, 1);
    g.fillCircle(-8, -94, 4); // Left Eye
    g.fillCircle(8, -94, 4); // Right Eye
    g.fillCircle(0, -80, 8); // Wide Open Distressed Mouth

    // Hands clutching throat (Universal Choking Sign)
    g.fillStyle(0xf472b6, 1);
    g.fillCircle(-12, -58, 10);
    g.fillCircle(12, -58, 10);

    // 2. Torso & Upper Body
    g.fillStyle(0x0284c7, 1); // Blue medical shirt
    g.fillRoundedRect(-48, -48, 96, 135, 18);

    // 3. Anatomical Trachea & Airway Line (Glowing Tube)
    g.lineStyle(6, 0xef4444, 0.9);
    g.lineBetween(0, -80, 0, -10);

    // Trapped Foreign Food Obstruction Object in Trachea
    this.obstructionGraphics = this.add.graphics();
    this.obstructionGraphics.fillStyle(0xd97706, 1);
    this.obstructionGraphics.fillCircle(0, -45, 9);
    this.victimContainer.add(this.obstructionGraphics);

    // Pulsing Red Airway Obstruction Glow
    this.tweens.add({
      targets: this.obstructionGraphics,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 350,
      yoyo: true,
      repeat: -1
    });

    // 4. Back Blow Target Zone Highlight (Upper back between shoulder blades)
    g.lineStyle(2, 0xf59e0b, 0.9);
    g.fillStyle(0xfbbf24, 0.35);
    g.fillCircle(-32, 0, 26);

    // 5. Abdominal Thrust (Heimlich) Target Zone Highlight (Between navel & ribcage)
    g.lineStyle(2, 0xef4444, 0.9);
    g.fillStyle(0xf87171, 0.35);
    g.fillCircle(0, 36, 26);

    this.victimContainer.add(g);

    this.drawTargetZone(px, py + 36, 32, null, true);

    this.statusText = this.add.text(px, py - 135, 'ANATOMY: COMPLETE TRACHEAL AIRWAY OBSTRUCTION', {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ef4444'
    }).setOrigin(0.5, 0.5);

    // Interactive target zones for back blows & abdominal thrusts
    const backZone = this.add.zone(px - 32, py, 60, 60).setInteractive({ useHandCursor: true });
    backZone.on('pointerdown', () => {
      if (this.tracker.getCurrentStep() === 'PERFORM_BACK_BLOWS') {
        this.performBackBlow();
      }
    });

    const abdoZone = this.add.zone(px, py + 36, 60, 60).setInteractive({ useHandCursor: true });
    abdoZone.on('pointerdown', () => {
      if (this.tracker.getCurrentStep() === 'PERFORM_ABDOMINAL_THRUSTS') {
        this.performAbdominalThrust();
      }
    });
  }

  setupChokingControls() {
    const { width, height } = this.scale;
    const btnY = height * 0.86;

    this.createProceduralButton(width * 0.16, btnY, 130, 42, '1. Spot Choking', () => {
      this.handleActionAttempt('IDENTIFY_CHOKING', 100, 'Universal choking sign observed. Clutching throat, silent cough.');
    });

    this.createProceduralButton(width * 0.33, btnY, 130, 42, '2. Check Severity', () => {
      this.handleActionAttempt('ASSESS_SEVERITY', 100, 'Severe airway obstruction confirmed (cannot speak, cough, or breathe).');
    });

    this.createProceduralButton(width * 0.50, btnY, 130, 42, '3. Ask "Choking?"', () => {
      this.handleActionAttempt('ENCOURAGE_COUGH', 90, 'Asked victim: Victim nods yes silently. Prepare physical maneuvers.');
    });

    this.createProceduralButton(width * 0.67, btnY, 130, 42, '4. Back Blows', () => {
      const step = this.tracker.getCurrentStep();
      if (step === 'PERFORM_BACK_BLOWS') {
        this.performBackBlow();
      } else {
        this.handleActionAttempt(step, 70, 'Follow procedure steps.');
      }
    });

    this.createProceduralButton(width * 0.84, btnY, 130, 42, '5. Heimlich Thrusts', () => {
      const step = this.tracker.getCurrentStep();
      if (step === 'PERFORM_ABDOMINAL_THRUSTS') {
        this.performAbdominalThrust();
      } else {
        this.handleActionAttempt(step, 60, 'Perform 5 back blows before Heimlich abdominal thrusts.');
      }
    });

    this.actionProgressText = this.add.text(width / 2, height * 0.74, '', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#facc15'
    }).setOrigin(0.5, 0.5);
  }

  performBackBlow() {
    this.backBlowsCount++;

    // Back Slap Shockwave Animation
    const shockwave = this.add.graphics();
    const px = this.scale.width * 0.5 - 32;
    const py = this.scale.height * 0.46;
    shockwave.lineStyle(3, 0xf59e0b, 0.9);
    shockwave.strokeCircle(px, py, 15);

    this.tweens.add({
      targets: shockwave,
      scaleX: 2.2,
      scaleY: 2.2,
      alpha: 0,
      duration: 350,
      onComplete: () => shockwave.destroy()
    });

    this.tweens.add({
      targets: this.victimContainer,
      x: this.scale.width * 0.5 + 10,
      duration: 70,
      yoyo: true
    });

    this.actionProgressText.setText(`BACK BLOWS (INTERSCAPULAR): ${this.backBlowsCount} / ${this.requiredBackBlows}`);

    if (this.backBlowsCount >= this.requiredBackBlows) {
      this.handleActionAttempt('PERFORM_BACK_BLOWS', 100, '5 firm back blows delivered between shoulder blades.');
      this.actionProgressText.setText('BACK BLOWS COMPLETE: PROCEED TO ABDOMINAL THRUSTS');
    } else {
      this.showFeedbackToast(`Back Blow ${this.backBlowsCount}/5 delivered!`, true);
    }
  }

  performAbdominalThrust() {
    this.thrustsCount++;

    // Heimlich Abdominal Contraction Animation
    this.tweens.add({
      targets: this.victimContainer,
      scaleY: 0.92,
      y: this.scale.height * 0.46 - 12,
      duration: 80,
      yoyo: true
    });

    // Object shift upward in trachea
    this.tweens.add({
      targets: this.obstructionGraphics,
      y: -45 - (this.thrustsCount * 7),
      duration: 100
    });

    this.actionProgressText.setText(`ABDOMINAL THRUSTS (HEIMLICH): ${this.thrustsCount} / ${this.requiredThrusts}`);

    if (this.thrustsCount >= this.requiredThrusts) {
      this.ejectObstructionObject();
      this.handleActionAttempt('PERFORM_ABDOMINAL_THRUSTS', 100, '5 rapid inward & upward Heimlich thrusts completed!');
      this.handleActionAttempt('COMPLETE', 100, 'Foreign object dislodged! Airway cleared & breathing restored.');
    } else {
      this.showFeedbackToast(`Abdominal Thrust ${this.thrustsCount}/5 performed!`, true);
    }
  }

  ejectObstructionObject() {
    const px = this.scale.width * 0.5;
    const py = this.scale.height * 0.46 - 80;

    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xd97706, 1);
    objectGraphics.fillCircle(px, py, 9);

    // Ejection Particle Velocity Animation
    this.tweens.add({
      targets: objectGraphics,
      x: -140,
      y: -70,
      alpha: 0,
      duration: 600,
      ease: 'Quad.out',
      onComplete: () => objectGraphics.destroy()
    });

    if (this.obstructionGraphics) {
      this.obstructionGraphics.destroy();
    }

    this.statusText.setText('TRACHEA AIRWAY CLEARED! VICTIM BREATHING NORMALLY');
    this.statusText.setColor('#22c55e');
  }
}
