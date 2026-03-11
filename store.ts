/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { create } from 'zustand';
import { GameStatus, RUN_SPEED_BASE, Difficulty, TARGET_COLORS } from './types';
import { audio } from './components/System/Audio';

interface GameState {
  status: GameStatus;
  difficulty: Difficulty;
  score: number;
  highScore: number;
  lives: number;
  maxLives: number;
  speed: number;
  collectedLetters: number[]; 
  level: number;
  laneCount: number;
  gemsCollected: number;
  distance: number;
  
  // Inventory / Abilities
  hasDoubleJump: boolean;
  hasImmortality: boolean;
  isImmortalityActive: boolean;

  // Actions
  setDifficulty: (difficulty: Difficulty) => void;
  startGame: () => void;
  restartGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  takeDamage: () => void;
  addScore: (amount: number) => void;
  collectGem: (value: number) => void;
  collectLetter: (index: number) => void;
  setStatus: (status: GameStatus) => void;
  setDistance: (dist: number) => void;
  
  // Shop / Abilities
  buyItem: (type: 'DOUBLE_JUMP' | 'MAX_LIFE' | 'HEAL' | 'IMMORTAL', cost: number) => boolean;
  advanceLevel: () => void;
  openShop: () => void;
  closeShop: () => void;
  activateImmortality: () => void;
}

export const LEVEL_WORDS = [
  "RUNNER", "CYBER", "NEON", "GRID", "SPEED", "PULSE", "DATA", "GLITCH", "SYSTEM", "VECTOR",
  "MATRIX", "HACKER", "CHROME", "SYNTH", "LASER", "PLASMA", "ORBIT", "VOID", "ZENITH", "APEX",
  "PHANTOM", "GHOST", "SHADOW", "BLADE", "EDGE", "DRIFT", "SHIFT", "WARP", "CORE", "NODE",
  "LINK", "FLOW", "WAVE", "BEAM", "RAY", "FLASH", "BOLT", "SPARK", "FIRE", "ICE",
  "STORM", "TITAN", "ROGUE", "ELITE", "PRIME", "ALPHA", "OMEGA", "LEGEND", "MYTH", "SIYAM"
];

const MAX_LEVEL = 50;

const getSavedHighScore = () => {
  try {
    const saved = localStorage.getItem('cyber_runner_high_score');
    return saved ? parseInt(saved, 10) : 0;
  } catch (e) {
    return 0;
  }
};

const saveHighScore = (score: number) => {
  try {
    localStorage.setItem('cyber_runner_high_score', score.toString());
  } catch (e) {
    // Ignore
  }
};

export const getTargetWord = (level: number) => {
  const word = LEVEL_WORDS[(level - 1) % LEVEL_WORDS.length];
  return word.split('');
};

export const getTargetColor = (index: number) => {
  return TARGET_COLORS[index % TARGET_COLORS.length];
};

export const useStore = create<GameState>((set, get) => ({
  status: GameStatus.INTRO,
  difficulty: Difficulty.MEDIUM,
  score: 0,
  highScore: getSavedHighScore(),
  lives: 3,
  maxLives: 3,
  speed: 0,
  collectedLetters: [],
  level: 1,
  laneCount: 3,
  gemsCollected: 0,
  distance: 0,
  
  hasDoubleJump: false,
  hasImmortality: false,
  isImmortalityActive: false,

  setDifficulty: (difficulty) => set({ difficulty }),

  startGame: () => {
    const { difficulty } = get();
    let baseSpeed = RUN_SPEED_BASE;
    let initialLives = 3;

    audio.startMusic();

    if (difficulty === Difficulty.EASY) {
        baseSpeed *= 0.8;
        initialLives = 5;
    } else if (difficulty === Difficulty.HARD) {
        baseSpeed *= 1.2;
        initialLives = 1;
    }

    set({ 
      status: GameStatus.PLAYING, 
      score: 0, 
      lives: initialLives, 
      maxLives: initialLives,
      speed: baseSpeed,
      collectedLetters: [],
      level: 1,
      laneCount: 3,
      gemsCollected: 0,
      distance: 0,
      hasDoubleJump: false,
      hasImmortality: false,
      isImmortalityActive: false
    });
  },

  restartGame: () => {
    const { difficulty } = get();
    let baseSpeed = RUN_SPEED_BASE;
    let initialLives = 3;

    audio.startMusic();

    if (difficulty === Difficulty.EASY) {
        baseSpeed *= 0.8;
        initialLives = 5;
    } else if (difficulty === Difficulty.HARD) {
        baseSpeed *= 1.2;
        initialLives = 1;
    }

    set({ 
      status: GameStatus.PLAYING, 
      score: 0, 
      lives: initialLives, 
      maxLives: initialLives,
      speed: baseSpeed,
      collectedLetters: [],
      level: 1,
      laneCount: 3,
      gemsCollected: 0,
      distance: 0,
      hasDoubleJump: false,
      hasImmortality: false,
      isImmortalityActive: false
    });
  },

  pauseGame: () => {
    const { status } = get();
    if (status === GameStatus.PLAYING) {
      audio.stopMusic();
      set({ status: GameStatus.PAUSED });
    }
  },

  resumeGame: () => {
    const { status } = get();
    if (status === GameStatus.PAUSED) {
      audio.startMusic();
      set({ status: GameStatus.PLAYING });
    }
  },

  takeDamage: () => {
    const { lives, isImmortalityActive } = get();
    if (isImmortalityActive) return; // No damage if skill is active

    if (lives > 1) {
      set({ lives: lives - 1 });
    } else {
      audio.playGameOver();
      audio.stopMusic();
      set({ lives: 0, status: GameStatus.GAME_OVER, speed: 0 });
    }
  },

  addScore: (amount) => set((state) => {
    const newScore = state.score + amount;
    const newHighScore = Math.max(state.highScore, newScore);
    if (newHighScore > state.highScore) {
      saveHighScore(newHighScore);
    }
    return { score: newScore, highScore: newHighScore };
  }),
  
  collectGem: (value) => set((state) => {
    const newScore = state.score + value;
    const newHighScore = Math.max(state.highScore, newScore);
    if (newHighScore > state.highScore) {
      saveHighScore(newHighScore);
    }
    return { 
      score: newScore, 
      highScore: newHighScore,
      gemsCollected: state.gemsCollected + 1 
    };
  }),

  setDistance: (dist) => set({ distance: dist }),

  collectLetter: (index) => {
    const { collectedLetters, level, speed, difficulty, score, highScore } = get();
    const wordTarget = getTargetWord(level);
    
    if (!collectedLetters.includes(index)) {
      const newLetters = [...collectedLetters, index];
      
      // Speed increase multiplier based on difficulty
      let multiplier = 0.10;
      if (difficulty === Difficulty.EASY) multiplier = 0.05;
      else if (difficulty === Difficulty.HARD) multiplier = 0.15;

      const speedIncrease = RUN_SPEED_BASE * multiplier;
      const nextSpeed = speed + speedIncrease;

      set({ 
        collectedLetters: newLetters,
        speed: nextSpeed
      });

      // Check if full word collected
      if (newLetters.length === wordTarget.length) {
        if (level < MAX_LEVEL) {
            // Immediately advance level
            // The Shop Portal will be spawned by LevelManager at the start of the new level
            get().advanceLevel();
        } else {
            // Victory Condition
            audio.playVictory();
            audio.stopMusic();
            const finalScore = score + 5000;
            const newHighScore = Math.max(highScore, finalScore);
            if (newHighScore > highScore) {
              saveHighScore(newHighScore);
            }
            set({
                status: GameStatus.VICTORY,
                score: finalScore,
                highScore: newHighScore
            });
        }
      }
    }
  },

  advanceLevel: () => {
      const { level, laneCount, speed, difficulty } = get();
      const nextLevel = level + 1;
      
      audio.playLevelUp();

      // Speed increase multiplier based on difficulty
      let multiplier = 0.40;
      if (difficulty === Difficulty.EASY) multiplier = 0.20;
      else if (difficulty === Difficulty.HARD) multiplier = 0.60;

      const speedIncrease = RUN_SPEED_BASE * multiplier;
      const newSpeed = speed + speedIncrease;

      set({
          level: nextLevel,
          laneCount: Math.min(laneCount + 2, 9), // Expand lanes
          status: GameStatus.PLAYING, // Keep playing, user runs into shop
          speed: newSpeed,
          collectedLetters: [] // Reset letters
      });
  },

  openShop: () => {
      audio.playShopOpen();
      set({ status: GameStatus.SHOP });
  },
  
  closeShop: () => set({ status: GameStatus.PLAYING }),

  buyItem: (type, cost) => {
      const { score, maxLives, lives } = get();
      
      if (score >= cost) {
          audio.playClick();
          set({ score: score - cost });
          
          switch (type) {
              case 'DOUBLE_JUMP':
                  set({ hasDoubleJump: true });
                  break;
              case 'MAX_LIFE':
                  set({ maxLives: maxLives + 1, lives: lives + 1 });
                  break;
              case 'HEAL':
                  set({ lives: Math.min(lives + 1, maxLives) });
                  break;
              case 'IMMORTAL':
                  set({ hasImmortality: true });
                  break;
          }
          return true;
      }
      return false;
  },

  activateImmortality: () => {
      const { hasImmortality, isImmortalityActive } = get();
      if (hasImmortality && !isImmortalityActive) {
          audio.playPowerUp();
          set({ isImmortalityActive: true });
          
          // Lasts 5 seconds
          setTimeout(() => {
              set({ isImmortalityActive: false });
          }, 5000);
      }
  },

  setStatus: (status) => {
    if (status !== GameStatus.PLAYING && status !== GameStatus.SHOP) {
        audio.stopMusic();
    }
    set({ status });
  },
  increaseLevel: () => set((state) => ({ level: state.level + 1 })),
}));
