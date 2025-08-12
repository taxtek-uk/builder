import { useRef } from 'react';
import { Text, Html, Box } from '@react-three/drei';
import { Vector3, BufferGeometry } from 'three';

interface DimensionLabelsProps {
  modules: any[];
  wallWidth: number;
  wallHeight: number;
  showDimensions?: boolean;
}

export function DimensionLabels({ modules, wallWidth, wallHeight, showDimensions = true }: DimensionLabelsProps) {
  const toMeters = (mm: number) => mm * 0.001;

  if (!showDimensions || !modules.length) return null;

  // Create dimension lines and labels for each module
  const dimensionElements = modules.map((module, index) => {
    const moduleStartX = module.position - (wallWidth / 2);
    const moduleCenterX = moduleStartX + (module.width / 2);
    const moduleEndX = moduleStartX + module.width;
    
    const centerX = toMeters(moduleCenterX);
    const startX = toMeters(moduleStartX);
    const endX = toMeters(moduleEndX);
    const topY = toMeters(module.height / 2 + 100); // 100mm above module
    const labelY = toMeters(module.height / 2 + 150); // 150mm above module

    // Dimension line points
    const linePoints = [
      new Vector3(startX, topY, 0),
      new Vector3(endX, topY, 0)
    ];

    // Extension lines
    const extensionStart = [
      new Vector3(startX, toMeters(module.height / 2), 0),
      new Vector3(startX, topY + toMeters(50), 0)
    ];
    const extensionEnd = [
      new Vector3(endX, toMeters(module.height / 2), 0),
      new Vector3(endX, topY + toMeters(50), 0)
    ];

    return (
      <group key={`dimension-${module.id}`}>
        {/* Main dimension line */}
        <Box
          args={[toMeters(module.width), toMeters(4), toMeters(2)]}
          position={[centerX, topY, 0]}
        >
          <meshBasicMaterial color="#b89773" />
        </Box>

        {/* Extension lines */}
        <Box
          args={[toMeters(2), toMeters(150), toMeters(2)]}
          position={[startX, topY - toMeters(75), 0]}
        >
          <meshBasicMaterial color="#b89773" />
        </Box>
        <Box
          args={[toMeters(2), toMeters(150), toMeters(2)]}
          position={[endX, topY - toMeters(75), 0]}
        >
          <meshBasicMaterial color="#b89773" />
        </Box>
        
        {/* Dimension arrows */}
        <mesh position={[startX, topY, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[toMeters(20), toMeters(40), 3]} />
          <meshBasicMaterial color="#b89773" />
        </mesh>
        <mesh position={[endX, topY, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[toMeters(20), toMeters(40), 3]} />
          <meshBasicMaterial color="#b89773" />
        </mesh>
        
        {/* Dimension text */}
        <Text
          position={[centerX, labelY, 0]}
          fontSize={toMeters(80)}
          color="#2d3748"
          anchorX="center"
          anchorY="middle"
        >
          {module.width}mm
        </Text>
        
        {/* Module type label for special modules */}
        {['tv', 'fire', 'gaming'].includes(module.type) && (
          <Html position={[centerX, toMeters(module.height / 2 - 200), 0.1]} center>
            <div className="bg-blue-500/90 text-white px-2 py-1 rounded text-xs font-medium pointer-events-none">
              {module.type.toUpperCase()} MODULE
            </div>
          </Html>
        )}
      </group>
    );
  });

  // Overall wall dimension
  const wallCenterX = 0;
  const wallBottomY = toMeters(-200); // 200mm below floor
  const wallLabelY = toMeters(-300); // 300mm below floor
  const wallStartX = toMeters(-wallWidth / 2);
  const wallEndX = toMeters(wallWidth / 2);

  const wallDimensionPoints = [
    new Vector3(wallStartX, wallBottomY, 0),
    new Vector3(wallEndX, wallBottomY, 0)
  ];

  return (
    <group>
      {/* Module dimensions */}
      {dimensionElements}
      
      {/* Overall wall dimension */}
      <Box
        args={[toMeters(wallWidth), toMeters(6), toMeters(2)]}
        position={[wallCenterX, wallBottomY, 0]}
      >
        <meshBasicMaterial color="#1f2937" />
      </Box>
      
      {/* Wall dimension arrows */}
      <mesh position={[wallStartX, wallBottomY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[toMeters(30), toMeters(60), 3]} />
        <meshBasicMaterial color="#1f2937" />
      </mesh>
      <mesh position={[wallEndX, wallBottomY, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[toMeters(30), toMeters(60), 3]} />
        <meshBasicMaterial color="#1f2937" />
      </mesh>
      
      {/* Wall dimension text */}
      <Text
        position={[wallCenterX, wallLabelY, 0]}
        fontSize={toMeters(120)}
        color="#1f2937"
        anchorX="center"
        anchorY="middle"
      >
        {wallWidth}mm TOTAL WIDTH
      </Text>
      
      {/* Height dimension (vertical) */}
      <Box
        args={[toMeters(4), toMeters(wallHeight), toMeters(2)]}
        position={[toMeters(wallWidth / 2 + 150), toMeters(wallHeight / 2), 0]}
      >
        <meshBasicMaterial color="#1f2937" />
      </Box>
      
      <Text
        position={[toMeters(wallWidth / 2 + 200), toMeters(wallHeight / 2), 0]}
        fontSize={toMeters(100)}
        color="#1f2937"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, Math.PI / 2]}
      >
        {wallHeight}mm
      </Text>
    </group>
  );
}
