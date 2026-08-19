'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { buildMesh } from '@/lib/geometry';
import type { House, MeshPart } from '@/lib/geometry/types';
import {
  floorSpecFor,
  paletteFrom,
  type MaterialSpec,
  type StyleAppearance,
} from '@/lib/shared/palette';

interface Props {
  house: House;
  mode?: 'exterior' | 'cutaway' | 'interior';
  floor?: number | null;
  appearance?: StyleAppearance | null;
  className?: string;
}

export function House3D({
  house,
  mode = 'exterior',
  floor = null,
  appearance = null,
  className,
}: Props) {
  const palette = useMemo(() => paletteFrom(appearance), [appearance]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    const global = window as unknown as { __archaiPalette?: unknown };
    global.__archaiPalette = palette;

    return () => {
      delete global.__archaiPalette;
    };
  }, [palette]);

  const roomTypes = useMemo(() => {
    const map = new Map<string, string>();
    for (const level of house.floors) {
      for (const room of level.rooms) map.set(room.id, room.roomType);
    }
    return map;
  }, [house.floors]);
  const mesh = useMemo(
    () => buildMesh(house, { includeRoof: mode === 'exterior', includeCeiling: false }),
    [house, mode],
  );

  const parts = useMemo(
    () => (floor === null ? mesh.parts : mesh.parts.filter((part) => part.floor === undefined || part.floor === floor)),
    [mesh.parts, floor],
  );

  const { center, distance, radius, eye } = useMemo(() => {
    const { min, max } = mesh.bbox;
    const size = Math.max(max.x - min.x, max.y - min.y, max.z - min.z);

    const middle: [number, number, number] = [
      (min.x + max.x) / 2,
      (min.y + max.y) / 2,
      (min.z + max.z) / 2,
    ];

    const away = size * 1.25;

    const interior: [number, number, number] = [
      middle[0] + (max.x - min.x) * 0.22,
      min.y + 1.6,
      middle[2] + (max.z - min.z) * 0.22,
    ];

    return {
      center: middle,
      distance: away,
      radius: size,
      eye: interior,
    };
  }, [mesh.bbox]);

  const cameraPosition: [number, number, number] =
    mode === 'interior'
      ? eye
      : [center[0] + distance * 0.9, center[1] + distance * 0.32, center[2] + distance * 0.9];

  return (
    <div className={className}>
      {}
      <Canvas
        key={mode}
        shadows
        dpr={[1, 2]}
        camera={{
          position: cameraPosition,
          fov: mode === 'interior' ? 62 : 42,
          near: 0.1,
          far: distance * 12,
        }}
      >
        <color attach="background" args={['#f4f4f6']} />

        {}
        <ambientLight intensity={0.4} />
        <hemisphereLight intensity={0.7} groundColor="#c9c2b6" color="#eef2f7" />
        {}
        <directionalLight
          position={[radius, radius * 1.4, radius * 0.7]}
          intensity={1.7}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.5}
          shadow-camera-far={radius * 4}
          shadow-camera-left={-radius * 0.9}
          shadow-camera-right={radius * 0.9}
          shadow-camera-top={radius * 0.9}
          shadow-camera-bottom={-radius * 0.9}
          shadow-bias={-0.0004}
          shadow-normalBias={0.04}
        />
        {}
        <directionalLight position={[-distance, distance * 0.5, -distance * 0.7]} intensity={0.5} />

        {}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[center[0], mesh.bbox.min.y - 0.01, center[2]]}
          receiveShadow
        >
          <circleGeometry args={[radius * 1.15, 64]} />
          <meshStandardMaterial color="#eceae6" />
        </mesh>

        <group>
          {parts.map((part) => (
            <Part
              key={part.id}
              part={part}
              spec={
                part.material === 'floor'
                  ? floorSpecFor(appearance, roomTypes.get(part.roomId ?? ''), palette)
                  : palette[part.material]
              }
            />
          ))}
        </group>

        {}
        <OrbitControls
          target={mode === 'interior' ? [center[0], eye[1], center[2]] : center}
          enablePan
          enableDamping
          dampingFactor={0.08}
          minDistance={mode === 'interior' ? 0.5 : distance * 0.25}
          maxDistance={mode === 'interior' ? distance : distance * 3}
          maxPolarAngle={mode === 'interior' ? Math.PI : Math.PI / 2 - 0.05}
        />
      </Canvas>
    </div>
  );
}

function Part({ part, spec }: { part: MeshPart; spec: MaterialSpec }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(part.positions, 3));
    geo.setIndex(part.indices);
    geo.computeVertexNormals();

    return geo;
  }, [part.positions, part.indices]);

  const transparent = spec.opacity !== undefined;

  return (
    <mesh geometry={geometry} castShadow={!transparent} receiveShadow>
      <meshStandardMaterial
        color={spec.color}
        roughness={spec.roughness}
        metalness={spec.metalness ?? 0}
        transparent={transparent}
        opacity={spec.opacity ?? 1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
