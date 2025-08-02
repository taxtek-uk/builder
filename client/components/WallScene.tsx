import { useRef, useState, useMemo } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { Text, Box, Plane, Html } from '@react-three/drei';
import { Group, Mesh, TextureLoader, RepeatWrapping } from 'three';
import { WallConfig } from '../hooks/useWallConfig';
import { AccessorySnapping } from '../utils/accessorySnapping';
import { materialLibrary } from '../utils/MaterialLibrary';
import gsap from 'gsap';

interface WallSceneProps {
  config: WallConfig & { modules: any[] };
  selectedAccessory?: string;
  onAccessorySnap?: (accessoryId: string, moduleId: string) => void;
  environmentMode?: 'studio' | 'livingRoom' | 'night';
}

export function WallScene({ config, selectedAccessory, onAccessorySnap, environmentMode = 'studio' }: WallSceneProps) {
  const wallGroupRef = useRef<Group>(null);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  // Convert mm to meters for Three.js (1mm = 0.001m)
  const toMeters = (mm: number) => mm * 0.001;

  // Initialize accessory snapping logic
  const accessorySnapping = useMemo(() =>
    new AccessorySnapping(config.modules, config.width),
    [config.modules, config.width]
  );

  // Get valid snap points for selected accessory
  const validSnapPoints = useMemo(() =>
    selectedAccessory ? accessorySnapping.getValidSnapPoints(selectedAccessory) : [],
    [selectedAccessory, accessorySnapping]
  );

  // Get accessory placements
  const accessoryPlacements = useMemo(() =>
    accessorySnapping.generatePlacements(config.accessories),
    [accessorySnapping, config.accessories]
  );

  return (
    <group ref={wallGroupRef}>
      {/* Floor and environment handled by EnvironmentScene component */}

      {/* Wall modules */}
      {config.modules && config.modules.map((module, index) => {
        const isValidSnapTarget = selectedAccessory ?
          accessorySnapping.canModuleHoldAccessory(module.id, selectedAccessory).valid : false;

        return (
          <WallModule
            key={module.id}
            module={module}
            config={config}
            index={index}
            accessorySnapping={accessorySnapping}
            selectedAccessory={selectedAccessory}
            isHovered={hoveredModule === module.id}
            isValidSnapTarget={isValidSnapTarget}
            onModuleHover={setHoveredModule}
            onModuleClick={(moduleId) => {
              if (selectedAccessory && onAccessorySnap && isValidSnapTarget) {
                onAccessorySnap(selectedAccessory, moduleId);
              }
            }}
          />
        );
      })}

      {/* Dimension labels */}
      <Text
        position={[0, toMeters(config.height) + 0.3, 0]}
        fontSize={0.1}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
      >
        {config.width}mm × {config.height}mm
      </Text>
    </group>
  );
}

interface WallModuleProps {
  module: any;
  config: WallConfig;
  index: number;
  accessorySnapping: AccessorySnapping;
  selectedAccessory?: string;
  isHovered: boolean;
  isValidSnapTarget: boolean;
  onModuleHover: (moduleId: string | null) => void;
  onModuleClick: (moduleId: string) => void;
}

function WallModule({
  module,
  config,
  index,
  accessorySnapping,
  selectedAccessory,
  isHovered,
  isValidSnapTarget,
  onModuleHover,
  onModuleClick
}: WallModuleProps) {
  const moduleRef = useRef<Mesh>(null);
  const [localHovered, setLocalHovered] = useState(false);
  const toMeters = (mm: number) => mm * 0.001;
  const { camera } = useThree();

  const hovered = isHovered || localHovered;

  // Calculate if this is an edge module
  const isEdgeModule = index === 0 || index === config.modules.length - 1;

  // Helper function for precision rounding
  const roundToPrecision = (value: number, decimals: number): number => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };

  // True-to-scale position calculation with CAD precision
  // Convert mm to meters: startX = -usableWidth / 2 + sum(previousModuleWidths)
  const usableWidth = config.width - 50; // Account for 25mm margins
  const moduleStartX = module.position - (config.width / 2); // Relative to wall center
  const moduleCenterX = moduleStartX + (module.width / 2); // Center of this module

  const xPos = roundToPrecision(toMeters(moduleCenterX), 6); // 6 decimal precision for Three.js
  const yPos = roundToPrecision(toMeters(module.height / 2), 6);
  const zPos = 0;

  // Load texture if available
  const texture = config.finish.texture ? useLoader(TextureLoader, config.finish.texture) : null;
  if (texture) {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(2, 2); // Adjust repeat for better scaling
  }

  // Color based on finish
  const getModuleColor = () => {
    switch (config.finish.category) {
      case 'wood': return '#8b4513';
      case 'solid': return config.finish.color;
      case 'stone': return config.finish.texture ? '#ffffff' : '#6b7280'; // Use white base for textured stone
      case 'cloth': return '#9ca3af';
      case 'metal': return '#374151';
      case 'mirror': return '#e5e7eb';
      default: return config.finish.color;
    }
  };

  // Get context-aware tooltip with precision layout info
  const getModuleTooltip = () => {
    // Check for layout info from centered layouts
    const layoutInfo = (config.modules[0] as any)?.layoutInfo;

    if (module.type === 'tv') {
      return layoutInfo ?
        `${layoutInfo.centerModule}\n${layoutInfo.leftFill}\n${layoutInfo.rightFill}` :
        'Center TV Module – 2000mm Allocated – Ready for TV Installation';
    }
    if (module.type === 'fire') {
      return layoutInfo ?
        `${layoutInfo.centerModule}\n${layoutInfo.leftFill}\n${layoutInfo.rightFill}` :
        'Center Fire Module – 2000mm Allocated – Ready for Fireplace Installation';
    }
    if (module.type === 'gaming') {
      return layoutInfo ?
        `${layoutInfo.centerModule}\n${layoutInfo.leftFill}\n${layoutInfo.rightFill}` :
        'Center Gaming Module – 2000mm Allocated – Ready for Gaming Console';
    }

    // Enhanced tooltips for standard modules
    const moduleCapabilities = [];
    if (module.width >= 1000) moduleCapabilities.push('TV Compatible');
    if (isEdgeModule) {
      moduleCapabilities.push('Speaker Compatible');
      moduleCapabilities.push('Smart Control Panel');
      moduleCapabilities.push('Plug Position');
    }
    if (module.width >= 400) moduleCapabilities.push('Shelf Compatible');

    const baseTooltip = `${module.width}mm Module`;
    const capabilityText = moduleCapabilities.length > 0 ? ` – ${moduleCapabilities.join(', ')}` : '';

    if (selectedAccessory) {
      const canHold = accessorySnapping.canModuleHoldAccessory(module.id, selectedAccessory);
      if (canHold.valid) {
        return `${baseTooltip} – ${selectedAccessory.toUpperCase()} Ready`;
      } else {
        return `${baseTooltip} – ${canHold.reason}`;
      }
    }

    return `${baseTooltip}${capabilityText}`;
  };

  return (
    <group position={[xPos, yPos, zPos]}>
      {/* Main module */}
      <Box
        ref={moduleRef}
        args={[toMeters(module.width), toMeters(module.height), 0.18]} // 180mm depth
        castShadow
        receiveShadow
        onPointerOver={() => {
          setLocalHovered(true);
          onModuleHover(module.id);
        }}
        onPointerOut={() => {
          setLocalHovered(false);
          onModuleHover(null);
        }}
        onClick={() => onModuleClick(module.id)}
      >
        {(() => {
          // Get enhanced material from library
          const baseMaterial = materialLibrary.getMaterialForFinish(
            config.finish.category,
            config.finish.color,
            config.finish.texture
          );

          // Clone and modify for special states
          const material = baseMaterial.clone();

          // Apply hover and selection states
          if (hovered && isValidSnapTarget) {
            material.emissive.setHex(0x10b981);
            material.emissiveIntensity = 0.2;
          } else if (hovered && selectedAccessory) {
            material.emissive.setHex(0xef4444);
            material.emissiveIntensity = 0.2;
          } else if (hovered) {
            material.emissive.setHex(0xb89773);
            material.emissiveIntensity = 0.1;
          } else if (['tv', 'fire', 'gaming'].includes(module.type)) {
            const emissiveColors = {
              tv: 0x3b82f6,
              fire: 0xdc2626,
              gaming: 0x7c3aed
            };
            material.emissive.setHex(emissiveColors[module.type as keyof typeof emissiveColors]);
            material.emissiveIntensity = 0.1;
          }

          return <primitive object={material} attach="material" />;
        })()}
      </Box>

      {/* Special Module Border Indicator */}
      {['tv', 'fire', 'gaming'].includes(module.type) && (
        <Box
          args={[toMeters(module.width + 20), toMeters(module.height + 20), 0.01]}
          position={[0, 0, -0.01]}
        >
          <meshBasicMaterial
            color={module.type === 'tv' ? '#3b82f6' : module.type === 'fire' ? '#dc2626' : '#7c3aed'}
            transparent
            opacity={0.3}
          />
        </Box>
      )}

      {/* Hover Tooltip */}
      {hovered && (
        <Html position={[0, toMeters(module.height / 2) + 0.1, 0.2]} center>
          <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none">
            {getModuleTooltip()}
          </div>
        </Html>
      )}

      {/* Module label */}
      <Text
        position={[0, 0, 0.1]}
        fontSize={0.08}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {module.type === 'tv' ? 'Center TV Module – 2000mm Allocated' :
         module.type === 'fire' ? 'Center Fire Module – 2000mm Allocated' :
         module.type === 'gaming' ? 'Center Gaming Module – 2000mm Allocated' :
         `${module.width}mm ${module.type !== 'standard' ? `- ${module.type.toUpperCase()}` : ''}`}
      </Text>

      {/* Edge indicator for cable access */}
      {(index === 0 || index === config.modules.length - 1) && (
        <Box
          args={[0.05, 0.1, 0.05]}
          position={index === 0 ? [-toMeters(module.width / 2 - 50), -toMeters(module.height / 2 - 100), 0.12] : [toMeters(module.width / 2 - 50), -toMeters(module.height / 2 - 100), 0.12]}
        >
          <meshStandardMaterial color="#ef4444" />
        </Box>
      )}

      {/* Special Module Accessories */}
      {module.type === 'tv' && (
        <>
          {/* TV Screen */}
          <Box
            args={[1.4, 0.8, 0.05]}
            position={[0, 0.2, 0.15]}
            castShadow
          >
            <primitive object={materialLibrary.createTVMaterial()} attach="material" />
          </Box>
          {/* TV Bracket Cut-out indication */}
          <Box
            args={[0.6, 0.4, 0.02]}
            position={[0, 0.2, 0.09]}
          >
            <primitive object={materialLibrary.getMaterialForFinish('metal', '#374151')} attach="material" />
          </Box>
        </>
      )}

      {module.type === 'fire' && (
        <>
          {/* Fireplace Insert */}
          <Box
            args={[1.2, 0.6, 0.15]}
            position={[0, -0.3, 0.15]}
            castShadow
          >
            <primitive object={materialLibrary.createFireMaterial()} attach="material" />
          </Box>
          {/* Fire Surround */}
          <Box
            args={[1.6, 0.8, 0.05]}
            position={[0, -0.3, 0.12]}
            castShadow
          >
            <primitive object={materialLibrary.getMaterialForFinish('stone', '#6b7280')} attach="material" />
          </Box>
        </>
      )}

      {module.type === 'gaming' && (
        <>
          {/* Extended Base Block (400mm deep) - True to scale */}
          <Box
            args={[toMeters(module.width), toMeters(600), toMeters(400)]} // 400mm depth exactly
            position={[0, -toMeters((module.height - 600) / 2), toMeters(200)]} // Offset by half depth
          >
            <meshStandardMaterial
              color={getModuleColor()}
              roughness={0.2}
              metalness={0.1}
            />
          </Box>
          {/* Gaming Console platform indication */}
          <Box
            args={[toMeters(400), toMeters(80), toMeters(300)]} // Console platform
            position={[0, -toMeters((module.height - 600) / 2) + toMeters(40), toMeters(350)]}
          >
            <primitive object={materialLibrary.getMaterialForFinish('metal', '#1f2937')} attach="material" />
          </Box>
          {/* Gaming Console mock device */}
          <Box
            args={[toMeters(350), toMeters(60), toMeters(250)]} // Console device
            position={[0, -toMeters((module.height - 600) / 2) + toMeters(70), toMeters(375)]}
          >
            <primitive object={materialLibrary.createConsoleMaterial()} attach="material" />
          </Box>
          {/* Base block outline for clarity */}
          <Box
            args={[toMeters(module.width + 4), toMeters(604), toMeters(2)]}
            position={[0, -toMeters((module.height - 600) / 2), toMeters(401)]}
          >
            <meshBasicMaterial color="#7c3aed" transparent opacity={0.3} />
          </Box>
        </>
      )}

      {/* Additional Accessories */}
      {/* Speakers - Edge modules only */}
      {config.accessories.speakers && isEdgeModule && (
        <>
          <Box
            args={[0.15, 0.25, 0.1]}
            position={[toMeters(module.width / 4), toMeters(module.height / 3), 0.15]}
            castShadow
          >
            <primitive object={materialLibrary.getMaterialForFinish('solid', '#2d3748')} attach="material" />
          </Box>
          <Box
            args={[0.15, 0.25, 0.1]}
            position={[-toMeters(module.width / 4), toMeters(module.height / 3), 0.15]}
            castShadow
          >
            <primitive object={materialLibrary.getMaterialForFinish('solid', '#2d3748')} attach="material" />
          </Box>
        </>
      )}

      {/* LED Lighting - Edge or top panels */}
      {config.accessories.ledLighting && isEdgeModule && (
        <>
          {/* Top LED strip */}
          <Box
            args={[toMeters(module.width - 100), 0.02, 0.01]}
            position={[0, toMeters(module.height / 2 - 20), 0.2]}
          >
            <primitive object={materialLibrary.createLEDMaterial('#60a5fa')} attach="material" />
          </Box>
          {/* Side LED strips */}
          <Box
            args={[0.02, toMeters(module.height - 100), 0.01]}
            position={[toMeters((module.width / 2) - 20), 0, 0.2]}
          >
            <primitive object={materialLibrary.createLEDMaterial('#60a5fa')} attach="material" />
          </Box>
        </>
      )}

      {/* Smart Control Panel - End panel (usually right) */}
      {config.accessories.smartControl && index === config.modules.length - 1 && (
        <>
          {/* Control panel screen */}
          <Box
            args={[0.2, 0.3, 0.05]}
            position={[toMeters(module.width / 2 - 150), 0, 0.15]}
          >
            <meshStandardMaterial color="#1f2937" />
          </Box>
          {/* Screen bezel */}
          <Box
            args={[0.18, 0.28, 0.02]}
            position={[toMeters(module.width / 2 - 150), 0, 0.16]}
          >
            <meshStandardMaterial color="#374151" />
          </Box>
          {/* Power indicator */}
          <Box
            args={[0.02, 0.02, 0.01]}
            position={[toMeters(module.width / 2 - 150), toMeters(120), 0.17]}
          >
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
          </Box>
        </>
      )}

      {/* Shelves - Any module (distribute across modules) */}
      {config.accessories.shelves > 0 && index < config.accessories.shelves && (
        <>
          {/* Horizontal shelf */}
          <Box
            args={[toMeters(module.width - 200), 0.03, 0.25]}
            position={[0, toMeters(module.height / 3), 0.2]}
          >
            <meshStandardMaterial color="#8b5a3c" />
          </Box>
          {/* Shelf brackets */}
          <Box
            args={[0.05, 0.15, 0.2]}
            position={[toMeters(module.width / 2 - 100), toMeters(module.height / 3 - 75), 0.15]}
          >
            <meshStandardMaterial color="#6b7280" />
          </Box>
          <Box
            args={[0.05, 0.15, 0.2]}
            position={[-toMeters(module.width / 2 - 100), toMeters(module.height / 3 - 75), 0.15]}
          >
            <meshStandardMaterial color="#6b7280" />
          </Box>
        </>
      )}
    </group>
  );
}
