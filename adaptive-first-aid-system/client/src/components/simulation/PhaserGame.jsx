// PhaserGame.jsx - React wrapper for embedding Phaser 3 simulation canvas with clean lifecycle management and anti-flicker fixes

import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { Level1CPRScene } from '../../simulations/level1/Level1CPRScene.js';
import { Level2BleedingScene } from '../../simulations/level2/Level2BleedingScene.js';
import { Level3BurnScene } from '../../simulations/level3/Level3BurnScene.js';
import { Level4FractureScene } from '../../simulations/level4/Level4FractureScene.js';
import { Level5ChokingScene } from '../../simulations/level5/Level5ChokingScene.js';

const SCENE_MAP = {
  1: Level1CPRScene,
  2: Level2BleedingScene,
  3: Level3BurnScene,
  4: Level4FractureScene,
  5: Level5ChokingScene
};

const PhaserGame = ({ levelId = 1, eventBridge = {} }) => {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const eventBridgeRef = useRef(eventBridge);

  // Keep eventBridge ref updated without re-triggering Phaser game recreation
  useEffect(() => {
    eventBridgeRef.current = eventBridge;
  }, [eventBridge]);

  useEffect(() => {
    if (!containerRef.current) return;

    const levelNum = typeof levelId === 'number' ? levelId : (parseInt(levelId, 10) || 1);
    const SceneClass = SCENE_MAP[levelNum] || Level1CPRScene;

    // Enhanced Anti-Flicker Canvas & Renderer Configuration
    const config = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 900,
      height: 520,
      backgroundColor: '#0f172a',
      render: {
        antialias: true,
        pixelArt: false,
        clearBeforeRender: true,
        preserveDrawingBuffer: true, // Prevents canvas flickering between frames
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: 'arcade',
        arcade: { debug: false }
      },
      scene: [SceneClass]
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Start scene with event bridge proxy
    game.events.once('ready', () => {
      // Create proxy object that routes to current eventBridge ref
      const proxyBridge = new Proxy({}, {
        get: (target, prop) => {
          if (eventBridgeRef.current && typeof eventBridgeRef.current[prop] === 'function') {
            return (...args) => eventBridgeRef.current[prop](...args);
          }
          return () => {};
        }
      });
      game.scene.start(game.scene.scenes[0].scene.key, { eventBridge: proxyBridge });
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [levelId]); // Depend only on levelId to avoid unnecessary re-mounting flickering

  return (
    <div className="w-full flex justify-center items-center bg-slate-950 p-2 sm:p-4 rounded-xl shadow-2xl border border-slate-800 overflow-hidden">
      <div
        ref={containerRef}
        className="w-full aspect-[16/9] max-w-[900px] max-h-[520px] rounded-lg overflow-hidden flex justify-center items-center select-none"
        style={{
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      />
    </div>
  );
};

export default PhaserGame;

