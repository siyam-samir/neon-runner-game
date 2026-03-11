import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { usePlayerControls } from '../../hooks/usePlayerControls';

export const ActionPlayer: React.FC = () => {
  const { camera } = useThree();
  const controls = usePlayerControls();
  const playerRef = useRef<THREE.Group>(null);
  
  // Physics variables
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const isGrounded = useRef(true);

  const speed = controls.sprint ? 15 : controls.walk ? 3 : 8;
  const jumpForce = 10;
  const gravity = 30;

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    // Apply gravity
    if (!isGrounded.current) {
      velocity.current.y -= gravity * delta;
    }

    // Jumping
    if (controls.jump && isGrounded.current) {
      velocity.current.y = jumpForce;
      isGrounded.current = false;
    }

    // Movement direction based on camera rotation
    direction.current.set(0, 0, 0);
    if (controls.forward) direction.current.z -= 1;
    if (controls.backward) direction.current.z += 1;
    if (controls.left) direction.current.x -= 1;
    if (controls.right) direction.current.x += 1;

    direction.current.normalize();

    // Apply movement relative to camera direction
    const moveVector = new THREE.Vector3();
    
    // Get forward and right vectors from camera, ignoring Y axis
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();
    
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    if (direction.current.z !== 0) {
      moveVector.add(forward.multiplyScalar(-direction.current.z));
    }
    if (direction.current.x !== 0) {
      moveVector.add(right.multiplyScalar(direction.current.x));
    }

    // Apply velocity
    velocity.current.x = moveVector.x * speed;
    velocity.current.z = moveVector.z * speed;

    // Update position
    playerRef.current.position.x += velocity.current.x * delta;
    playerRef.current.position.y += velocity.current.y * delta;
    playerRef.current.position.z += velocity.current.z * delta;

    // Simple floor collision
    if (playerRef.current.position.y <= 1) {
      playerRef.current.position.y = 1;
      velocity.current.y = 0;
      isGrounded.current = true;
    }

    // Handle crouching
    const targetHeight = controls.crouch ? 0.5 : 1.6;
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, playerRef.current.position.y + targetHeight, 0.1);
    
    // Sync camera position with player
    camera.position.x = playerRef.current.position.x;
    camera.position.z = playerRef.current.position.z;
  });

  return (
    <>
      <PointerLockControls />
      <group ref={playerRef} position={[0, 1, 0]}>
        {/* Visual representation of player (optional, usually hidden in FPS) */}
        <mesh position={[0, 0, 0]} castShadow>
          <capsuleGeometry args={[0.5, 1, 4, 8]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      </group>
    </>
  );
};
