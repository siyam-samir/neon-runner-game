/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect } from 'react';
import { Heart, Zap, Trophy, MapPin, Diamond, Rocket, ArrowUpCircle, Shield, Activity, PlusCircle, Play, Pause, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, getTargetWord, getTargetColor } from '../../store';
import { GameStatus, TARGET_COLORS, ShopItem, RUN_SPEED_BASE, Difficulty } from '../../types';
import { audio } from '../System/Audio';
import { MobileControls } from './MobileControls';

// Available Shop Items
const SHOP_ITEMS: ShopItem[] = [
    {
        id: 'DOUBLE_JUMP',
        name: 'DOUBLE JUMP',
        description: 'Jump again in mid-air. Essential for high obstacles.',
        cost: 1000,
        icon: ArrowUpCircle,
        oneTime: true
    },
    {
        id: 'MAX_LIFE',
        name: 'MAX LIFE UP',
        description: 'Permanently adds a heart slot and heals you.',
        cost: 1500,
        icon: Activity
    },
    {
        id: 'HEAL',
        name: 'REPAIR KIT',
        description: 'Restores 1 Life point instantly.',
        cost: 1000,
        icon: PlusCircle
    },
    {
        id: 'IMMORTAL',
        name: 'IMMORTALITY',
        description: 'Unlock Ability: Press Space/Tap to be invincible for 5s.',
        cost: 3000,
        icon: Shield,
        oneTime: true
    }
];

const ShopScreen: React.FC = () => {
    const { score, buyItem, closeShop, hasDoubleJump, hasImmortality } = useStore();
    const [items, setItems] = useState<ShopItem[]>([]);

    useEffect(() => {
        // Select 3 random items, filtering out one-time items already bought
        let pool = SHOP_ITEMS.filter(item => {
            if (item.id === 'DOUBLE_JUMP' && hasDoubleJump) return false;
            if (item.id === 'IMMORTAL' && hasImmortality) return false;
            return true;
        });

        // Shuffle and pick 3
        pool = pool.sort(() => 0.5 - Math.random());
        setItems(pool.slice(0, 3));
    }, []);

    return (
        <div className="absolute inset-0 bg-black/90 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto">
             <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                 <h2 className="text-3xl md:text-4xl font-black text-cyan-400 mb-2 font-cyber tracking-widest text-center">CYBER SHOP</h2>
                 <div className="flex items-center text-yellow-400 mb-6 md:mb-8">
                     <span className="text-base md:text-lg mr-2">AVAILABLE CREDITS:</span>
                     <span className="text-xl md:text-2xl font-bold">{score.toLocaleString()}</span>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl w-full mb-8">
                     {items.map(item => {
                         const Icon = item.icon;
                         const canAfford = score >= item.cost;
                         return (
                             <div key={item.id} className="bg-gray-900/80 border border-gray-700 p-4 md:p-6 rounded-xl flex flex-col items-center text-center hover:border-cyan-500 transition-colors">
                                 <div className="bg-gray-800 p-3 md:p-4 rounded-full mb-3 md:mb-4">
                                     <Icon className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
                                 </div>
                                 <h3 className="text-lg md:text-xl font-bold mb-2">{item.name}</h3>
                                 <p className="text-gray-400 text-xs md:text-sm mb-4 h-10 md:h-12 flex items-center justify-center">{item.description}</p>
                                 <button 
                                    onClick={() => buyItem(item.id as any, item.cost)}
                                    disabled={!canAfford}
                                    className={`px-4 md:px-6 py-2 rounded font-bold w-full text-sm md:text-base ${canAfford ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110' : 'bg-gray-700 cursor-not-allowed opacity-50'}`}
                                 >
                                     {item.cost} GEMS
                                 </button>
                             </div>
                         );
                     })}
                 </div>

                 <button 
                    onClick={() => { audio.playClick(); closeShop(); }}
                    className="flex items-center px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg md:text-xl rounded hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,0,255,0.4)]"
                 >
                     RESUME MISSION <Play className="ml-2 w-5 h-5" fill="white" />
                 </button>
             </div>
        </div>
    );
};

const IntroScreen: React.FC = () => {
    const { setStatus } = useStore();
    const [timeLeft, setTimeLeft] = useState(20);
    const [showPlay, setShowPlay] = useState(false);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setShowPlay(true);
        }
    }, [timeLeft]);

    return (
        <div className="absolute inset-0 bg-black z-[200] flex flex-col items-center justify-center p-4 overflow-hidden pointer-events-auto">
            <AnimatePresence mode="wait">
                {!showPlay ? (
                    <motion.div 
                        key="intro-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                        transition={{ duration: 1 }}
                        className="relative w-full max-w-6xl flex flex-col items-center"
                    >
                        {/* Massive Typography - Editorial Style */}
                        <div className="relative mb-12 select-none">
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-[12vw] md:text-[8vw] font-black text-white leading-[0.85] tracking-tighter uppercase italic"
                            >
                                THE GAME
                            </motion.div>
                            
                            <motion.div
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="text-[12vw] md:text-[8vw] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 leading-[0.85] tracking-tighter uppercase italic ml-[4vw]"
                            >
                                DEPLOYMENT
                            </motion.div>

                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                                className="text-[4vw] md:text-[3vw] font-light text-white/40 tracking-[0.5em] uppercase mt-4 text-right"
                            >
                                BY SIYAM
                            </motion.div>
                        </div>
                        
                        {/* Progress Indicator */}
                        <div className="w-full max-w-md flex flex-col items-center">
                            <div className="w-full h-[2px] bg-white/10 relative overflow-hidden">
                                <motion.div 
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 20, ease: "linear" }}
                                    className="absolute inset-0 bg-cyan-500 shadow-[0_0_15px_#00ffff]"
                                />
                            </div>
                            <div className="flex justify-between w-full mt-4 font-mono text-[10px] tracking-widest uppercase text-white/30">
                                <span>Initializing Core</span>
                                <span>{Math.round(((20 - timeLeft) / 20) * 100)}%</span>
                            </div>
                        </div>

                        {/* Background Large Text Accent */}
                        <div className="absolute -z-10 opacity-5 pointer-events-none select-none">
                            <h1 className="text-[40vw] font-black text-white whitespace-nowrap leading-none">
                                SIYAM SIYAM SIYAM
                            </h1>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="play-button"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <button 
                                onClick={() => { audio.init(); audio.playClick(); setStatus(GameStatus.MENU); }}
                                className="group relative px-16 py-8 bg-white text-black font-black text-3xl rounded-none hover:bg-cyan-400 transition-colors flex items-center tracking-[0.3em] overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-2 h-full bg-black"></div>
                                <Play className="mr-4 w-10 h-10 fill-black" />
                                ENTER GRID
                            </button>
                        </motion.div>
                        <p className="mt-12 text-white/20 font-mono text-xs tracking-[1em] uppercase animate-pulse">
                            System Ready. Awaiting Input.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Grid Effect */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px]"></div>
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-black"></div>
            </div>
        </div>
    );
};

const DifficultySelectScreen: React.FC = () => {
    const { setDifficulty, startGame, setStatus } = useStore();

    const difficulties = [
        { 
            id: Difficulty.EASY, 
            name: 'EASY', 
            desc: 'Slower speed, more lives (5), fewer obstacles.',
            color: 'text-green-400',
            borderColor: 'border-green-500/30',
            hoverColor: 'hover:border-green-400'
        },
        { 
            id: Difficulty.MEDIUM, 
            name: 'MEDIUM', 
            desc: 'Standard challenge. 3 lives.',
            color: 'text-cyan-400',
            borderColor: 'border-cyan-500/30',
            hoverColor: 'hover:border-cyan-400'
        },
        { 
            id: Difficulty.HARD, 
            name: 'HARD', 
            desc: 'Extreme speed, 1 life, dense obstacles.',
            color: 'text-red-400',
            borderColor: 'border-red-500/30',
            hoverColor: 'hover:border-red-400'
        }
    ];

    return (
        <div className="absolute inset-0 bg-black/95 z-[110] flex items-center justify-center p-4 backdrop-blur-md pointer-events-auto">
            <div className="w-full max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-8 text-center tracking-tighter font-cyber">SELECT DIFFICULTY</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {difficulties.map(d => (
                        <button
                            key={d.id}
                            onClick={() => {
                                audio.playClick();
                                setDifficulty(d.id);
                                startGame();
                            }}
                            className={`group bg-gray-900/50 border ${d.borderColor} ${d.hoverColor} p-6 rounded-2xl transition-all hover:scale-105 text-left flex flex-col justify-between h-full`}
                        >
                            <div>
                                <h3 className={`text-2xl font-black mb-2 ${d.color}`}>{d.name}</h3>
                                <p className="text-gray-400 text-sm font-mono leading-relaxed">{d.desc}</p>
                            </div>
                            <div className="mt-6 flex items-center text-white/40 text-xs font-bold tracking-widest group-hover:text-white transition-colors">
                                SELECT MODULE <Play className="ml-2 w-3 h-3 fill-current" />
                            </div>
                        </button>
                    ))}
                </div>

                <button 
                    onClick={() => { audio.playClick(); setStatus(GameStatus.MENU); }}
                    className="mt-12 w-full text-gray-500 hover:text-white font-bold text-sm tracking-widest transition-colors"
                >
                    RETURN TO MAIN MENU
                </button>
            </div>
        </div>
    );
};

const PauseScreen: React.FC = () => {
    const { resumeGame, setStatus } = useStore();

    return (
        <div className="absolute inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-md pointer-events-auto">
            <div className="w-full max-w-sm bg-gray-900/90 border border-cyan-500/30 p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(0,255,255,0.1)]">
                <h2 className="text-4xl font-black text-white mb-8 tracking-widest font-cyber">PAUSED</h2>
                
                <div className="flex flex-col space-y-4">
                    <button 
                        onClick={() => { audio.playClick(); resumeGame(); }}
                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xl rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                    >
                        RESUME
                    </button>
                    
                    <button 
                        onClick={() => { audio.playClick(); setStatus(GameStatus.MENU); }}
                        className="w-full py-4 bg-gray-800 text-white font-bold text-xl rounded-xl hover:bg-gray-700 transition-colors border border-gray-600"
                    >
                        MAIN MENU
                    </button>
                </div>
            </div>
        </div>
    );
};

export const HUD: React.FC = () => {
  const { score, highScore, lives, maxLives, collectedLetters, status, level, restartGame, startGame, gemsCollected, distance, isImmortalityActive, speed, setStatus, pauseGame } = useStore();
  const target = getTargetWord(level);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
              const currentStatus = useStore.getState().status;
              if (currentStatus === GameStatus.PLAYING) {
                  useStore.getState().pauseGame();
              } else if (currentStatus === GameStatus.PAUSED) {
                  useStore.getState().resumeGame();
              }
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Common container style
  const containerClass = "absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 z-50";

  if (status === GameStatus.INTRO) {
      return <IntroScreen />;
  }

  if (status === GameStatus.SHOP) {
      return <ShopScreen />;
  }

  if (status === GameStatus.DIFFICULTY_SELECT) {
      return <DifficultySelectScreen />;
  }

  if (status === GameStatus.PAUSED) {
      return <PauseScreen />;
  }

  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-black/80 backdrop-blur-sm p-4 pointer-events-auto">
              {/* Card Container */}
              <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,255,255,0.2)] border border-white/10 animate-in zoom-in-95 duration-500">
                
                {/* Image Container - Auto height to fit full image without cropping */}
                <div className="relative w-full bg-gray-900">
                     <img 
                      src="https://picsum.photos/seed/cyberpunk/800/600" 
                      alt="Neon Runner Cover" 
                      className="w-full h-auto block"
                     />
                     
                     {/* Gradient Overlay for text readability */}
                     <div className="absolute inset-0 bg-gradient-to-t from-[#050011] via-black/30 to-transparent"></div>
                     
                     {/* Content positioned at the bottom of the card */}
                     <div className="absolute inset-0 flex flex-col justify-end items-center p-6 pb-8 text-center z-10">
                        {highScore > 0 && (
                            <div className="mb-4 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-500/30">
                                <span className="text-yellow-400 text-xs font-bold tracking-[0.2em] uppercase">HIGH SCORE: {highScore.toLocaleString()}</span>
                            </div>
                        )}
                        <button 
                          onClick={() => { audio.init(); audio.playClick(); setStatus(GameStatus.DIFFICULTY_SELECT); }}
                          className="w-full group relative px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-xl rounded-xl hover:bg-white/20 transition-all shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] hover:border-cyan-400 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/40 via-purple-500/40 to-pink-500/40 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            <span className="relative z-10 tracking-widest flex items-center justify-center">
                                INITIALIZE RUN <Play className="ml-2 w-5 h-5 fill-white" />
                            </span>
                        </button>

                        <p className="text-cyan-400/60 text-[10px] md:text-xs font-mono mt-3 tracking-wider">
                            [ ARROWS / SWIPE TO MOVE ]
                        </p>
                     </div>
                </div>
              </div>
          </div>
      );
  }

  if (status === GameStatus.GAME_OVER) {
      const isNewHighScore = score > 0 && score >= highScore;

      return (
          <div className="absolute inset-0 bg-black/90 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto flex flex-col items-center justify-center">
              <div className="flex flex-col items-center justify-center w-full max-w-lg py-8 px-4">
                
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 mb-2 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] font-cyber text-center tracking-widest">
                    SYSTEM FAILURE
                </h1>
                <p className="text-red-400/80 font-mono text-sm md:text-base mb-8 tracking-[0.2em] uppercase">
                    Run Terminated
                </p>
                
                <div className="w-full bg-gray-900/60 backdrop-blur-sm border border-red-900/50 rounded-2xl p-6 md:p-8 shadow-[0_0_30px_rgba(255,0,0,0.1)] mb-8 relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
                    
                    <div className="grid grid-cols-1 gap-4 text-center w-full">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                            <div className="flex items-center text-gray-400 text-sm md:text-base font-mono"><Trophy className="mr-3 w-4 h-4 md:w-5 md:h-5 text-yellow-500"/> SECTOR REACHED</div>
                            <div className="text-xl font-bold text-white">{level}</div>
                        </div>
                        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                            <div className="flex items-center text-gray-400 text-sm md:text-base font-mono"><Diamond className="mr-3 w-4 h-4 md:w-5 md:h-5 text-cyan-400"/> DATA GEMS</div>
                            <div className="text-xl font-bold text-cyan-400">{gemsCollected}</div>
                        </div>
                        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                            <div className="flex items-center text-gray-400 text-sm md:text-base font-mono"><MapPin className="mr-3 w-4 h-4 md:w-5 md:h-5 text-purple-400"/> DISTANCE</div>
                            <div className="text-xl font-bold text-purple-400">{Math.floor(distance)} LY</div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col items-center justify-center relative">
                            {isNewHighScore && (
                                <div className="absolute -top-3 bg-yellow-500 text-black text-[10px] font-black px-3 py-1 rounded-full animate-pulse tracking-widest uppercase">
                                    New Record!
                                </div>
                            )}
                            <div className="text-gray-400 text-sm font-mono tracking-widest mb-1">FINAL SCORE</div>
                            <div className={`text-4xl md:text-5xl font-black font-cyber tracking-wider ${isNewHighScore ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-500 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 'text-white'}`}>
                                {score.toLocaleString()}
                            </div>
                            
                            {!isNewHighScore && (
                                <div className="mt-2 text-xs md:text-sm text-gray-500 font-mono flex items-center">
                                    <Trophy className="w-3 h-3 mr-1 opacity-50" /> 
                                    BEST: <span className="text-gray-300 ml-1">{highScore.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <button 
                      onClick={() => { audio.init(); audio.playClick(); setStatus(GameStatus.DIFFICULTY_SELECT); }}
                      className="flex-1 group relative px-6 py-4 bg-red-950/40 border border-red-500/50 text-white font-black text-lg rounded-xl hover:bg-red-900/60 transition-all shadow-[0_0_15px_rgba(255,0,0,0.2)] hover:shadow-[0_0_25px_rgba(255,0,0,0.4)] hover:border-red-400 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-orange-500/20 to-red-600/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <span className="relative z-10 tracking-widest flex items-center justify-center">
                            <RotateCcw className="mr-2 w-5 h-5" /> REBOOT
                        </span>
                    </button>
                    
                    <button 
                      onClick={() => { audio.playClick(); setStatus(GameStatus.MENU); }}
                      className="flex-1 px-6 py-4 bg-gray-900/60 border border-gray-700 text-gray-300 font-bold text-lg rounded-xl hover:bg-gray-800 hover:text-white transition-all"
                    >
                        MAIN MENU
                    </button>
                </div>
              </div>
          </div>
      );
  }

  if (status === GameStatus.VICTORY) {
    return (
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/90 to-black/95 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto">
            <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                <Rocket className="w-16 h-16 md:w-24 md:h-24 text-yellow-400 mb-4 animate-bounce drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" />
                <h1 className="text-3xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-500 to-pink-500 mb-2 drop-shadow-[0_0_20px_rgba(255,165,0,0.6)] font-cyber text-center leading-tight">
                    MISSION COMPLETE
                </h1>
                <p className="text-cyan-300 text-sm md:text-2xl font-mono mb-8 tracking-widest text-center">
                    THE ANSWER TO THE UNIVERSE HAS BEEN FOUND
                </p>
                
                <div className="grid grid-cols-1 gap-4 text-center mb-8 w-full max-w-md">
                    <div className="bg-black/60 p-6 rounded-xl border border-yellow-500/30 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
                        <div className="text-xs md:text-sm text-gray-400 mb-1 tracking-wider uppercase">FINAL SCORE</div>
                        <div className="text-3xl md:text-4xl font-bold font-cyber text-yellow-400">{score.toLocaleString()}</div>
                        <div className="text-[10px] text-yellow-500/40 font-mono tracking-[0.3em] mt-2">NEW HIGH SCORE: {highScore.toLocaleString()}</div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                            <div className="text-xs text-gray-400">GEMS</div>
                            <div className="text-xl md:text-2xl font-bold text-cyan-400">{gemsCollected}</div>
                        </div>
                        <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                             <div className="text-xs text-gray-400">DISTANCE</div>
                            <div className="text-xl md:text-2xl font-bold text-purple-400">{Math.floor(distance)} LY</div>
                        </div>
                     </div>
                </div>

                <button 
                  onClick={() => { audio.init(); audio.playClick(); setStatus(GameStatus.DIFFICULTY_SELECT); }}
                  className="px-8 md:px-12 py-4 md:py-5 bg-white text-black font-black text-lg md:text-xl rounded hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] tracking-widest"
                >
                    RESTART MISSION
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className={containerClass}>
        {/* Top Bar */}
        <div className="flex justify-between items-start w-full">
            <div className="flex flex-col">
                <div className="text-3xl md:text-5xl font-bold text-cyan-400 drop-shadow-[0_0_10px_#00ffff] font-cyber">
                    {score.toLocaleString()}
                </div>
                <div className="text-[10px] md:text-xs text-yellow-500/80 font-mono tracking-widest mt-1">
                    HI: {highScore.toLocaleString()}
                </div>
            </div>
            
            <div className="flex space-x-1 md:space-x-2 items-center">
                {[...Array(maxLives)].map((_, i) => (
                    <Heart 
                        key={i} 
                        className={`w-6 h-6 md:w-8 md:h-8 ${i < lives ? 'text-pink-500 fill-pink-500' : 'text-gray-800 fill-gray-800'} drop-shadow-[0_0_5px_#ff0054]`} 
                    />
                ))}
                <button 
                    onClick={() => { audio.playClick(); pauseGame(); }}
                    className="ml-4 p-2 bg-gray-900/80 border border-gray-700 rounded-full hover:bg-gray-800 hover:border-cyan-500 transition-colors pointer-events-auto"
                >
                    <Pause className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </button>
            </div>
        </div>
        
        {/* Level Indicator - Moved to Top Center aligned with Score/Hearts */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 text-sm md:text-lg text-purple-300 font-bold tracking-wider font-mono bg-black/50 px-3 py-1 rounded-full border border-purple-500/30 backdrop-blur-sm z-50">
            LEVEL {level} <span className="text-gray-500 text-xs md:text-sm">/ 50</span>
        </div>

        {/* Active Skill Indicator */}
        {isImmortalityActive && (
             <div className="absolute top-24 left-1/2 transform -translate-x-1/2 text-yellow-400 font-bold text-xl md:text-2xl animate-pulse flex items-center drop-shadow-[0_0_10px_gold]">
                 <Shield className="mr-2 fill-yellow-400" /> IMMORTAL
             </div>
        )}

        {/* Word Collection Status - Just below Top Bar */}
        <div className="absolute top-16 md:top-24 left-1/2 transform -translate-x-1/2 flex space-x-2 md:space-x-3">
            {target.map((char, idx) => {
                const isCollected = collectedLetters.includes(idx);
                const color = getTargetColor(idx);

                return (
                    <div 
                        key={idx}
                        style={{
                            borderColor: isCollected ? color : 'rgba(55, 65, 81, 1)',
                            // Use dark text (almost black) when collected to contrast with neon background
                            color: isCollected ? 'rgba(0, 0, 0, 0.8)' : 'rgba(55, 65, 81, 1)',
                            boxShadow: isCollected ? `0 0 20px ${color}` : 'none',
                            backgroundColor: isCollected ? color : 'rgba(0, 0, 0, 0.9)'
                        }}
                        className={`w-8 h-10 md:w-10 md:h-12 flex items-center justify-center border-2 font-black text-lg md:text-xl font-cyber rounded-lg transform transition-all duration-300`}
                    >
                        {char}
                    </div>
                );
            })}
        </div>

        {/* Bottom Overlay */}
        <div className="w-full flex justify-end items-end">
             <div className="flex items-center space-x-2 text-cyan-500 opacity-70">
                 <Zap className="w-4 h-4 md:w-6 md:h-6 animate-pulse" />
                 <span className="font-mono text-base md:text-xl">SPEED {Math.round((speed / RUN_SPEED_BASE) * 100)}%</span>
             </div>
        </div>

        {/* Mobile Controls */}
        <MobileControls />
    </div>
  );
};
