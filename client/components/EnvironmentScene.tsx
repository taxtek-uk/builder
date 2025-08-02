import { useState } from 'react';
import { Plane, Box, Environment } from '@react-three/drei';
import { DoubleSide, ShadowMaterial } from 'three';
import * as THREE from 'three';
import { Sun, Home, Moon, Square } from 'lucide-react';

interface EnvironmentSceneProps {
  wallWidth: number;
  wallHeight: number;
  environmentMode?: 'studio' | 'livingRoom' | 'night';
  onModeChange?: (mode: 'studio' | 'livingRoom' | 'night') => void;
}

export function EnvironmentScene({ 
  wallWidth, 
  wallHeight, 
  environmentMode = 'studio',
  onModeChange 
}: EnvironmentSceneProps) {
  const toMeters = (mm: number) => mm * 0.001;
  const scaleX = wallWidth * 0.001;
  const scaleY = wallHeight * 0.001;

  // Floor configurations for different environments
  const getFloorConfig = () => {
    switch (environmentMode) {
      case 'livingRoom':
        return {
          color: '#8B7355', // Warm wood
          roughness: 0.8,
          metalness: 0.0
        };
      case 'night':
        return {
          color: '#2D3748', // Dark grey
          roughness: 0.3,
          metalness: 0.1
        };
      case 'studio':
      default:
        return {
          color: '#F8FAFC', // Light grey
          roughness: 0.1,
          metalness: 0.02
        };
    }
  };

  const floorConfig = getFloorConfig();

  return (
    <group>
      {/* Enhanced Floor with realistic materials */}
      <Plane 
        args={[scaleX * 4, scaleX * 4]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial 
          color={floorConfig.color}
          roughness={floorConfig.roughness}
          metalness={floorConfig.metalness}
        />
      </Plane>

      {/* Soft shadow plane */}
      <Plane 
        args={[scaleX * 3, toMeters(500)]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.001, toMeters(400)]}
        receiveShadow
      >
        <shadowMaterial transparent opacity={0.3} />
      </Plane>

      {/* Grid reference lines for studio mode */}
      {environmentMode === 'studio' && (
        <primitive
          object={new THREE.GridHelper(
            scaleX * 3,
            Math.floor(wallWidth / 500),
            '#e2e8f0',
            '#f1f5f9'
          )}
          position={[0, 0.002, 0]}
        />
      )}

      {/* Background elements for living room */}
      {environmentMode === 'livingRoom' && (
        <>
          {/* Back wall */}
          <Plane
            args={[scaleX * 4, scaleY * 2]}
            position={[0, scaleY, -scaleX * 2]}
            receiveShadow
          >
            <meshStandardMaterial 
              color="#F7FAFC" 
              roughness={0.9}
              metalness={0.0}
            />
          </Plane>

          {/* Side furniture/elements */}
          <Box
            args={[toMeters(600), toMeters(800), toMeters(400)]}
            position={[-scaleX * 1.5, toMeters(400), toMeters(800)]}
            castShadow
          >
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </Box>

          <Box
            args={[toMeters(400), toMeters(1200), toMeters(300)]}
            position={[scaleX * 1.8, toMeters(600), toMeters(600)]}
            castShadow
          >
            <meshStandardMaterial color="#2D3748" roughness={0.7} />
          </Box>
        </>
      )}

      {/* Night mode ambient elements */}
      {environmentMode === 'night' && (
        <>
          {/* Darker background */}
          <Plane
            args={[scaleX * 4, scaleY * 2]}
            position={[0, scaleY, -scaleX * 2]}
          >
            <meshStandardMaterial 
              color="#1A202C" 
              roughness={0.9}
              metalness={0.0}
            />
          </Plane>

          {/* Ambient light sources */}
          <mesh position={[-scaleX, scaleY * 1.5, -scaleX]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial 
              color="#4F46E5"
              emissive="#4F46E5"
              emissiveIntensity={0.5}
            />
          </mesh>

          <mesh position={[scaleX, scaleY * 1.5, -scaleX]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial 
              color="#7C3AED"
              emissive="#7C3AED"
              emissiveIntensity={0.5}
            />
          </mesh>
        </>
      )}

    </group>
  );
}

interface EnvironmentUIProps {
  currentMode: 'studio' | 'livingRoom' | 'night';
  onModeChange?: (mode: 'studio' | 'livingRoom' | 'night') => void;
}

function EnvironmentUI({ currentMode, onModeChange }: EnvironmentUIProps) {
  if (!onModeChange) return null;

  const modes = [
    { id: 'studio', label: 'Studio', icon: Square },
    { id: 'livingRoom', label: 'Living Room', icon: Home },
    { id: 'night', label: 'Night', icon: Moon }
  ];

  return (
    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 z-40">
      <div className="text-xs font-medium text-slate-700 mb-2 px-1">Environment</div>
      <div className="flex space-x-1">
        {modes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onModeChange(id as any)}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
              currentMode === id
                ? 'bg-gold-500 text-white'
                : 'bg-white hover:bg-gold-50 text-slate-700 hover:text-gold-700'
            }`}
            title={label}
          >
            <Icon size={12} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
