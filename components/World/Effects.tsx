/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useMemo } from 'react';
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store';
import * as THREE from 'three';
import { RUN_SPEED_BASE } from '../../types';

export const Effects: React.FC = () => {
  const { speed } = useStore();
  
  // Create a stable vector for the offset to avoid recreating it every frame
  // We pass this to ChromaticAberration and mutate it in useFrame.
  // The effect holds a reference to this Vector2 in its uniform.
  const offsetVector = useMemo(() => new THREE.Vector2(0, 0), []);

  useFrame((state, delta) => {
    // Calculate speed ratio
    const speedRatio = Math.max(0, (speed - RUN_SPEED_BASE) / (RUN_SPEED_BASE * 1.5));
    
    // Target offset based on speed
    const targetX = 0.003 * speedRatio;
    const targetY = 0.003 * speedRatio;
    
    // Lerp the vector directly
    offsetVector.x = THREE.MathUtils.lerp(offsetVector.x, targetX, delta * 5);
    offsetVector.y = THREE.MathUtils.lerp(offsetVector.y, targetY, delta * 5);
  });

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {/* Tighter bloom to avoid fog: High threshold, moderate radius */}
      <Bloom 
        luminanceThreshold={0.75} 
        mipmapBlur={false} 
        intensity={1.0} 
        radius={0.6}
        levels={4}
      />
      <ChromaticAberration 
        blendFunction={BlendFunction.NORMAL} 
        offset={offsetVector} 
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette eskil={false} offset={0.1} darkness={0.5} />
    </EffectComposer>
  );
};
