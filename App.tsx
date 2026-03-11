/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import * as THREE from 'three';
import { Environment } from './components/World/Environment';
import { Player } from './components/World/Player';
import { LevelManager } from './components/World/LevelManager';
import { Effects } from './components/World/Effects';
import { SpeedLines } from './components/World/SpeedLines';
import { HUD } from './components/UI/HUD';
import { useStore } from './store';
import { RUN_SPEED_BASE, GameStatus } from './types';

// Dynamic Camera Controller
const CameraController = () => {
  const { camera, size } = useThree();
  const { laneCount, speed, status } = useStore();
  
  useFrame((state, delta) => {
    if (status === GameStatus.PAUSED) return;

    // Determine if screen is narrow (mobile portrait)
    const aspect = size.width / size.height;
    const isMobile = aspect < 1.2; // Threshold for "mobile-like" narrowness or square-ish displays

    // Calculate expansion factors
    const heightFactor = isMobile ? 2.0 : 0.5;
    const distFactor = isMobile ? 4.5 : 1.0;

    // Base (3 lanes): y=5.5, z=8
    const extraLanes = Math.max(0, laneCount - 3);

    const targetY = 5.5 + (extraLanes * heightFactor);
    const targetZ = 8.0 + (extraLanes * distFactor);

    const targetPos = new THREE.Vector3(0, targetY, targetZ);
    
    // Speed effects
    const speedRatio = Math.max(0, (speed - RUN_SPEED_BASE) / RUN_SPEED_BASE);
    
    // FOV expansion
    const baseFov = 60;
    const targetFov = baseFov + (speedRatio * 25); // Up to 85 FOV
    
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, delta * 2.0);
      camera.updateProjectionMatrix();
    }

    // Camera Shake
    if (speedRatio > 0.2) {
      const shakeAmount = (speedRatio - 0.2) * 0.15;
      targetPos.x += (Math.random() - 0.5) * shakeAmount;
      targetPos.y += (Math.random() - 0.5) * shakeAmount;
    }

    // Smoothly interpolate camera position
    camera.position.lerp(targetPos, delta * 2.0);
    
    // Look further down the track to see the end of lanes
    camera.lookAt(0, 0, -30); 
  });
  
  return null;
};

function Scene() {
  return (
    <>
        <Environment />
        <group>
            {/* Attach a userData to identify player group for LevelManager collision logic */}
            <group userData={{ isPlayer: true }} name="PlayerGroup">
                 <Player />
            </group>
            <LevelManager />
            <SpeedLines />
        </group>
        <Effects />
    </>
  );
}

function App() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <HUD />
      <Canvas
        shadows
        dpr={[1, 1.5]} 
        gl={{ antialias: false, stencil: false, depth: true, powerPreference: "high-performance" }}
        // Initial camera, matches the controller base
        camera={{ position: [0, 5.5, 8], fov: 60 }}
      >
        <CameraController />
        <Suspense fallback={null}>
            <Scene />
        </Suspense>
      </Canvas>
      <Loader 
        containerStyles={{ background: '#050011' }}
        innerStyles={{ background: '#00ffff', width: '300px', height: '10px' }}
        barStyles={{ background: '#ff00ff' }}
        dataStyles={{ color: '#00ffff', fontFamily: 'Orbitron, sans-serif', fontSize: '24px' }}
      />
    </div>
  );
}

export default App;
