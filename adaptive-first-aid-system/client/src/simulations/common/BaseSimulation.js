// BaseSimulation.js - Abstract Phaser 3 Scene with responsive scaling & procedural graphics

import Phaser from 'phaser';
import { SimulationTimer } from './SimulationTimer.js';
import { ActionTracker } from './ActionTracker.js';
import { ScoreManager } from './ScoreManager.js';
import { LEVEL_SIMULATION_CONFIGS } from './SimulationConfig.js';

export class BaseSimulation extends Phaser.Scene {
  constructor(sceneKey, levelId) {
    super({ key: sceneKey });
    this.levelId = levelId;
    this.config = LEVEL_SIMULATION_CONFIGS[levelId] || LEVEL_SIMULATION_CONFIGS[1];
    
    this.timer = new SimulationTimer();
    this.tracker = new ActionTracker(this.config.expectedSequence);
    
    this.eventBridge = null; // Passed from React component wrapper
    this.actionButtons = [];
    this.targetZoneGraphics = null;
    this.feedbackText = null;
  }

  init(data) {
    if (data && data.eventBridge) {
      this.eventBridge = data.eventBridge;
    }
  }

  create() {
    this.timer.start();
    this.setupBackground();
    this.setupHeaderHUD();
    this.setupTargetZones();
    this.setupActionButtons();

    // Scale resize event listener
    this.scale.on('resize', this.handleResize, this);

    this.emitEvent('onStepChange', {
      currentStep: this.tracker.getCurrentStep(),
      stepIndex: this.tracker.currentStepIndex,
      totalSteps: this.config.expectedSequence.length - 1,
      procedureName: this.config.procedureName
    });
  }

  setupBackground() {
    const { width, height } = this.scale;
    const graphics = this.add.graphics();

    // Soft medical clinical room background gradient simulation
    graphics.fillGradientStyle(0x1e293b, 0x1e293b, 0x0f172a, 0x0f172a, 1);
    graphics.fillRect(0, 0, width, height);

    // Floor platform
    graphics.fillStyle(0x334155, 1);
    graphics.fillRoundedRect(width * 0.05, height * 0.2, width * 0.9, height * 0.65, 16);

    // Subtle grid lines
    graphics.lineStyle(1, 0x475569, 0.25);
    for (let x = 0; x < width; x += 40) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 40) {
      graphics.lineBetween(0, y, width, y);
    }
  }

  setupHeaderHUD() {
    const { width } = this.scale;
    this.titleText = this.add.text(width / 2, 24, this.config.title, {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#38bdf8'
    }).setOrigin(0.5, 0.5);
  }

  setupTargetZones() {
    this.targetZoneGraphics = this.add.graphics();
  }

  setupActionButtons() {
    // Overridden by specific level scenes
  }

  createProceduralButton(x, y, width, height, label, callback, options = {}) {
    const {
      bgColor = 0x2563eb,
      hoverColor = 0x3b82f6,
      textColor = '#ffffff',
      fontSize = '14px'
    } = options;

    const container = this.add.container(x, y);
    const bgGraphics = this.add.graphics();

    const drawBg = (color) => {
      bgGraphics.clear();
      bgGraphics.fillStyle(color, 1);
      bgGraphics.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
      bgGraphics.lineStyle(2, 0x60a5fa, 0.8);
      bgGraphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    };

    drawBg(bgColor);

    const btnText = this.add.text(0, 0, label, {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: fontSize,
      fontStyle: 'bold',
      color: textColor
    }).setOrigin(0.5, 0.5);

    container.add([bgGraphics, btnText]);
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      drawBg(hoverColor);
      this.tweens.add({ targets: container, scaleX: 1.04, scaleY: 1.04, duration: 100 });
    });

    container.on('pointerout', () => {
      drawBg(bgColor);
      this.tweens.add({ targets: container, scaleX: 1.0, scaleY: 1.0, duration: 100 });
    });

    container.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 80,
        yoyo: true,
        onComplete: () => callback && callback()
      });
    });

    this.actionButtons.push(container);
    return container;
  }

  drawTargetZone(x, y, radiusOrWidth, height = null, isHighlighted = true) {
    this.targetZoneGraphics.clear();
    const color = isHighlighted ? 0x22c55e : 0xef4444;

    this.targetZoneGraphics.lineStyle(3, color, 0.9);
    this.targetZoneGraphics.fillStyle(color, 0.2);

    if (height === null) {
      this.targetZoneGraphics.fillCircle(x, y, radiusOrWidth);
      this.targetZoneGraphics.strokeCircle(x, y, radiusOrWidth);
    } else {
      this.targetZoneGraphics.fillRoundedRect(x - radiusOrWidth / 2, y - height / 2, radiusOrWidth, height, 8);
      this.targetZoneGraphics.strokeRoundedRect(x - radiusOrWidth / 2, y - height / 2, radiusOrWidth, height, 8);
    }

    // Pulse tween effect
    if (!this.targetPulseTween) {
      this.targetPulseTween = this.tweens.addCounter({
        from: 0.2,
        to: 0.5,
        duration: 800,
        yoyo: true,
        repeat: -1,
        onUpdate: (tween) => {
          if (this.targetZoneGraphics) {
            this.targetZoneGraphics.setAlpha(tween.getValue());
          }
        }
      });
    }
  }

  showFeedbackToast(message, isCorrect = true) {
    const { width, height } = this.scale;
    const toastBg = this.add.graphics();
    const bgColor = isCorrect ? 0x166534 : 0x991b1b;
    const strokeColor = isCorrect ? 0x22c55e : 0xef4444;

    toastBg.fillStyle(bgColor, 0.95);
    toastBg.fillRoundedRect(width * 0.2, height * 0.12, width * 0.6, 44, 10);
    toastBg.lineStyle(2, strokeColor, 1);
    toastBg.strokeRoundedRect(width * 0.2, height * 0.12, width * 0.6, 44, 10);

    const toastText = this.add.text(width / 2, height * 0.12 + 22, message, {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
      wordWrap: { width: width * 0.55 }
    }).setOrigin(0.5, 0.5);

    const toastGroup = this.add.container(0, -20, [toastBg, toastText]);
    this.tweens.add({
      targets: toastGroup,
      y: 0,
      alpha: 1,
      duration: 250,
      ease: 'Back.out'
    });

    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: toastGroup,
        alpha: 0,
        y: -20,
        duration: 300,
        onComplete: () => toastGroup.destroy()
      });
    });

    this.emitEvent('onFeedback', { message, isCorrect });
  }

  handleActionAttempt(actionName, targetAccuracy = 100, customFeedback = '') {
    this.timer.recordStepLatency();
    const expectedStep = this.tracker.getCurrentStep();
    const isCorrectSequence = actionName === expectedStep;

    const actionRecord = this.tracker.recordAction({
      action: actionName,
      targetAccuracy,
      isCorrect: isCorrectSequence,
      feedback: customFeedback
    });

    if (isCorrectSequence) {
      const feedbackMsg = customFeedback || `Correct! ${actionName.replace(/_/g, ' ')} completed.`;
      this.showFeedbackToast(feedbackMsg, true);
    } else {
      const feedbackMsg = customFeedback || `Incorrect step. Expected ${expectedStep.replace(/_/g, ' ')}.`;
      this.showFeedbackToast(feedbackMsg, false);
      this.emitEvent('onMistake', {
        action: actionName,
        expectedStep,
        mistakesCount: this.tracker.mistakesCount
      });
    }

    this.emitEvent('onAction', {
      actionRecord,
      currentStep: this.tracker.getCurrentStep(),
      stepIndex: this.tracker.currentStepIndex,
      totalSteps: this.config.expectedSequence.length - 1,
      mistakesCount: this.tracker.mistakesCount,
      elapsedMs: this.timer.getElapsedMs()
    });

    this.emitEvent('onStepChange', {
      currentStep: this.tracker.getCurrentStep(),
      stepIndex: this.tracker.currentStepIndex,
      totalSteps: this.config.expectedSequence.length - 1
    });

    if (this.tracker.isCompleted()) {
      this.finishSimulation();
    }
  }

  finishSimulation() {
    this.timer.pause();
    const scoringResult = ScoreManager.calculateFinalScore({
      actionCorrectness: this.tracker.getActionCorrectness(),
      targetAccuracy: this.tracker.getAverageTargetAccuracy(),
      sequenceAccuracy: this.tracker.getSequenceAccuracy(),
      elapsedMs: this.timer.getElapsedMs(),
      attemptsCount: this.tracker.attemptsCount
    });

    const completionPayload = {
      levelId: this.levelId,
      actions: this.tracker.actionsHistory,
      actionCorrectness: scoringResult.actionCorrectness,
      targetAccuracy: scoringResult.targetAccuracy,
      sequenceAccuracy: scoringResult.sequenceAccuracy,
      responseTimeMs: this.timer.getElapsedMs(),
      mistakes: this.tracker.mistakesCount,
      attempts: this.tracker.attemptsCount,
      finalScore: scoringResult.finalScore,
      passed: scoringResult.passed,
      weakAreas: scoringResult.weakAreas,
      practicalThreshold: scoringResult.practicalThreshold
    };

    this.emitEvent('onComplete', completionPayload);
  }

  emitEvent(eventName, payload) {
    if (this.eventBridge && typeof this.eventBridge[eventName] === 'function') {
      this.eventBridge[eventName](payload);
    }
  }

  handleResize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;
    if (this.titleText) {
      this.titleText.setPosition(width / 2, 24);
    }
  }

  update() {
    // Render loop
  }
}
