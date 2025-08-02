import { useState, useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Vector3, PerspectiveCamera as ThreePerspectiveCamera } from 'three';
import { Camera, RotateCcw, Eye, Square, Maximize2 } from 'lucide-react';
import gsap from 'gsap';

interface CameraControlsProps {
  wallWidth: number;
  wallHeight: number;
  autoFocus?: boolean;
}

type CameraPreset = 'front' | 'isometric' | 'left' | 'top' | 'auto';

export function CameraControls({ wallWidth, wallHeight, autoFocus = true }: CameraControlsProps) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const [currentPreset, setCurrentPreset] = useState<CameraPreset>('auto');
  
  const scaleX = wallWidth * 0.001;
  const scaleY = wallHeight * 0.001;
  const scaleZ = Math.max(scaleX, scaleY);

  // Camera preset positions
  const presets: Record<CameraPreset, { position: Vector3; target: Vector3 }> = {
    auto: {
      position: new Vector3(scaleX * 1.5, scaleY * 0.8, scaleZ * 1.2),
      target: new Vector3(0, scaleY * 0.3, 0)
    },
    front: {
      position: new Vector3(0, scaleY * 0.5, scaleZ * 2),
      target: new Vector3(0, scaleY * 0.3, 0)
    },
    isometric: {
      position: new Vector3(scaleX * 1.2, scaleY * 1.2, scaleZ * 1.2),
      target: new Vector3(0, scaleY * 0.3, 0)
    },
    left: {
      position: new Vector3(-scaleX * 2, scaleY * 0.5, 0),
      target: new Vector3(0, scaleY * 0.3, 0)
    },
    top: {
      position: new Vector3(0, scaleY * 3, 0.1),
      target: new Vector3(0, 0, 0)
    }
  };

  // Animate camera to preset
  const animateToPreset = (preset: CameraPreset) => {
    if (!controlsRef.current) return;

    const targetPos = presets[preset].position;
    const targetLookAt = presets[preset].target;

    // Animate camera position
    gsap.to(camera.position, {
      duration: 1.5,
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      ease: "power2.inOut"
    });

    // Animate controls target
    gsap.to(controlsRef.current.target, {
      duration: 1.5,
      x: targetLookAt.x,
      y: targetLookAt.y,
      z: targetLookAt.z,
      ease: "power2.inOut",
      onUpdate: () => {
        controlsRef.current?.update();
      }
    });

    setCurrentPreset(preset);
  };

  // Auto-focus on wall when dimensions change
  useEffect(() => {
    if (autoFocus) {
      animateToPreset('auto');
    }
  }, [wallWidth, wallHeight, autoFocus]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={scaleZ * 0.5}
      maxDistance={scaleZ * 4}
      maxPolarAngle={Math.PI / 2.1}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.8}
      zoomSpeed={1.2}
      panSpeed={0.8}
      target={presets.auto.target}
    />
  );
}

export interface CameraUIProps {
  onPresetChange: (preset: CameraPreset) => void;
  currentPreset: CameraPreset;
}

export function CameraUI({ onPresetChange, currentPreset }: CameraUIProps) {
  const presetButtons = [
    { id: 'auto', label: 'Auto', icon: RotateCcw },
    { id: 'front', label: 'Front', icon: Eye },
    { id: 'isometric', label: 'ISO', icon: Square },
    { id: 'left', label: 'Left', icon: Camera },
    { id: 'top', label: 'Top', icon: Maximize2 }
  ];

  return (
    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 z-40">
      <div className="text-xs font-medium text-slate-700 mb-2 px-1">Camera Views</div>
      <div className="flex flex-col space-y-1">
        {presetButtons.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onPresetChange(id as CameraPreset)}
            className={`flex items-center space-x-2 px-3 py-2 rounded text-xs transition-colors ${
              currentPreset === id
                ? 'bg-gold-500 text-white'
                : 'bg-white hover:bg-gold-50 text-slate-700 hover:text-gold-700'
            }`}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
