import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { RUN_SPEED_BASE, GameStatus } from '../../types';

export const SpeedLines: React.FC = () => {
  const { speed, status } = useStore();
  const linesRef = useRef<THREE.LineSegments>(null);

  // Create geometry for speed lines
  const { geometry, material } = useMemo(() => {
    const lineCount = 100;
    const positions = new Float32Array(lineCount * 2 * 3); // 2 points per line, 3 coords per point
    const opacities = new Float32Array(lineCount * 2);

    for (let i = 0; i < lineCount; i++) {
      // Random position in a cylinder around the player
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 10; // Between 3 and 13 units away from center
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius + 5; // Offset height
      const z = -50 - Math.random() * 100; // Start far away
      const length = 5 + Math.random() * 15;

      // Start point
      positions[i * 6] = x;
      positions[i * 6 + 1] = y;
      positions[i * 6 + 2] = z;
      opacities[i * 2] = 0; // Fade in

      // End point
      positions[i * 6 + 3] = x;
      positions[i * 6 + 4] = y;
      positions[i * 6 + 5] = z + length;
      opacities[i * 2 + 1] = 1; // Fade out
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color('#00ffff') },
        speedRatio: { value: 0.0 }
      },
      vertexShader: `
        attribute float aOpacity;
        varying float vOpacity;
        void main() {
          vOpacity = aOpacity;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float speedRatio;
        varying float vOpacity;
        void main() {
          gl_FragColor = vec4(color, vOpacity * speedRatio * 0.5);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    return { geometry: geo, material: mat };
  }, []);

  useFrame((state, delta) => {
    if (!linesRef.current) return;
    if (status === GameStatus.PAUSED) return;

    const speedRatio = Math.max(0, (speed - RUN_SPEED_BASE) / RUN_SPEED_BASE);
    
    // Update material uniform
    (linesRef.current.material as THREE.ShaderMaterial).uniforms.speedRatio.value = speedRatio;

    // Only move lines if we are speeding
    if (speedRatio > 0.1) {
      const positions = linesRef.current.geometry.attributes.position.array as Float32Array;
      const moveSpeed = speed * 2 * delta;

      for (let i = 0; i < 100; i++) {
        // Move Z
        positions[i * 6 + 2] += moveSpeed;
        positions[i * 6 + 5] += moveSpeed;

        // Reset if passed camera
        if (positions[i * 6 + 2] > 10) {
          const length = positions[i * 6 + 5] - positions[i * 6 + 2];
          positions[i * 6 + 2] = -100 - Math.random() * 50;
          positions[i * 6 + 5] = positions[i * 6 + 2] + length;
        }
      }
      linesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry} material={material} />
  );
};
