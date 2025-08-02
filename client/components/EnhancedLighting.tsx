import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { DirectionalLight, AmbientLight, SpotLight } from 'three';

interface EnhancedLightingProps {
  wallWidth: number;
  wallHeight: number;
  lightingMode?: 'studio' | 'livingRoom' | 'night' | 'modern';
}

export function EnhancedLighting({ wallWidth, wallHeight, lightingMode = 'studio' }: EnhancedLightingProps) {
  const keyLightRef = useRef<DirectionalLight>(null);
  const fillLightRef = useRef<SpotLight>(null);
  const rimLightRef = useRef<SpotLight>(null);
  const { scene } = useThree();

  // Scale factors for responsive lighting
  const scaleX = wallWidth * 0.001;
  const scaleY = wallHeight * 0.001;
  const scaleZ = Math.max(scaleX, scaleY);

  useEffect(() => {
    // Configure shadows for better quality
    if (keyLightRef.current) {
      const light = keyLightRef.current;
      light.shadow.mapSize.width = 4096;
      light.shadow.mapSize.height = 4096;
      light.shadow.camera.near = 0.1;
      light.shadow.camera.far = 50;
      light.shadow.camera.left = -scaleX * 2;
      light.shadow.camera.right = scaleX * 2;
      light.shadow.camera.top = scaleY * 2;
      light.shadow.camera.bottom = -2;
      light.shadow.bias = -0.0001;
      light.shadow.normalBias = 0.02;
    }
  }, [scaleX, scaleY]);

  // Lighting configurations for different modes
  const getLightingConfig = () => {
    switch (lightingMode) {
      case 'livingRoom':
        return {
          ambient: { intensity: 0.4, color: '#fff5e6' },
          key: { intensity: 1.0, color: '#ffffff' },
          fill: { intensity: 0.6, color: '#e6f3ff' },
          rim: { intensity: 0.4, color: '#fff2d9' }
        };
      case 'night':
        return {
          ambient: { intensity: 0.2, color: '#1a1a2e' },
          key: { intensity: 0.8, color: '#ffffff' },
          fill: { intensity: 0.3, color: '#16213e' },
          rim: { intensity: 0.6, color: '#0f4c75' }
        };
      case 'studio':
      default:
        return {
          ambient: { intensity: 0.3, color: '#ffffff' },
          key: { intensity: 1.2, color: '#ffffff' },
          fill: { intensity: 0.5, color: '#f0f8ff' },
          rim: { intensity: 0.4, color: '#b89773' }
        };
    }
  };

  const config = getLightingConfig();

  return (
    <>
      {/* Ambient Light - Soft overall illumination */}
      <ambientLight
        intensity={config.ambient.intensity}
        color={config.ambient.color}
      />

      {/* Key Light - Primary directional light with shadows */}
      <directionalLight
        ref={keyLightRef}
        position={[scaleX * 2, scaleY * 2, scaleZ * 1.5]}
        intensity={config.key.intensity}
        color={config.key.color}
        castShadow
      />

      {/* Fill Light - Reduces harsh shadows */}
      <spotLight
        ref={fillLightRef}
        position={[-scaleX * 1.5, scaleY * 1.5, scaleZ]}
        intensity={config.fill.intensity}
        color={config.fill.color}
        angle={Math.PI / 3}
        penumbra={0.5}
        distance={scaleZ * 10}
        target-position={[0, 0, 0]}
      />

      {/* Rim Light - Adds edge definition and separation */}
      <spotLight
        ref={rimLightRef}
        position={[0, scaleY * 0.5, -scaleZ * 2]}
        intensity={config.rim.intensity}
        color={config.rim.color}
        angle={Math.PI / 4}
        penumbra={0.8}
        distance={scaleZ * 8}
        target-position={[0, 0, 0]}
      />

      {/* Additional accent lights for specific modes */}
      {lightingMode === 'livingRoom' && (
        <>
          <pointLight
            position={[-scaleX, scaleY * 0.3, scaleZ * 0.5]}
            intensity={0.3}
            color="#ffcc80"
            distance={scaleX * 3}
          />
          <pointLight
            position={[scaleX, scaleY * 0.3, scaleZ * 0.5]}
            intensity={0.3}
            color="#ffcc80"
            distance={scaleX * 3}
          />
        </>
      )}

      {lightingMode === 'night' && (
        <>
          <pointLight
            position={[0, scaleY * 0.1, scaleZ * 0.5]}
            intensity={0.2}
            color="#4f46e5"
            distance={scaleX * 2}
          />
        </>
      )}
    </>
  );
}
