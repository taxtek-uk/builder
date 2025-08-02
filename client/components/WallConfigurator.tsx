import { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { WallScene } from './WallScene';
import { ConfigurationSidebar } from './ConfigurationSidebar';
import { LayoutInfoPanel } from './LayoutInfoPanel';
import { EnhancedLighting } from './EnhancedLighting';
import { CameraControls, CameraUI } from './CameraControls';
import { EnvironmentScene } from './EnvironmentScene';
import { DimensionLabels } from './DimensionLabels';
import { ExportControls } from './ExportControls';
import { MobileWizard } from './MobileWizard';
import { useWallConfig } from '../hooks/useWallConfig';
import { useAccessorySelectionProvider } from '../hooks/useAccessorySelection';
import { useState as useReactState } from 'react';
import { Sun, Home, Moon, Square, Smartphone, RotateCw } from 'lucide-react';

export function WallConfigurator() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isMobileWizardOpen, setIsMobileWizardOpen] = useState(false);
  const [environmentMode, setEnvironmentMode] = useState<'studio' | 'livingRoom' | 'night'>('studio');
  const [showDimensions, setShowDimensions] = useState(true);
  const [cameraPreset, setCameraPreset] = useState<'auto' | 'front' | 'isometric' | 'left' | 'top'>('auto');
  const wallConfig = useWallConfig();
  const accessorySelection = useAccessorySelectionProvider();

  const handleAccessorySnap = (accessoryId: string, moduleId: string) => {
    // Enable the accessory in configuration
    wallConfig.updateAccessories({ [accessoryId]: true });
    // Clear selection state
    accessorySelection.clearSelection();

    // Show brief success feedback
    console.log(`${accessoryId} placed on module ${moduleId}`);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* 3D Preview Area */}
      <div className="flex-1 relative">
        <div className="absolute inset-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-gold-200">
          <Canvas
            shadows="soft"
            className="w-full h-full"
            style={{
              background: environmentMode === 'night'
                ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                : environmentMode === 'livingRoom'
                ? 'linear-gradient(135deg, #fef3e2 0%, #fde8d0 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}
            dpr={[1, 2]}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
              preserveDrawingBuffer: true
            }}
          >
            {/* Enhanced Camera with Presets */}
            <CameraControls
              wallWidth={wallConfig.config.width}
              wallHeight={wallConfig.config.height}
              autoFocus={true}
            />

            {/* Professional 3-Point Lighting */}
            <EnhancedLighting
              wallWidth={wallConfig.config.width}
              wallHeight={wallConfig.config.height}
              lightingMode={environmentMode}
            />

            {/* Environment and Context */}
            <EnvironmentScene
              wallWidth={wallConfig.config.width}
              wallHeight={wallConfig.config.height}
              environmentMode={environmentMode}
              onModeChange={setEnvironmentMode}
            />

            {/* Main Wall Scene with Enhanced Materials */}
            <WallScene
              config={wallConfig.config}
              selectedAccessory={accessorySelection.selectedAccessory}
              onAccessorySnap={handleAccessorySnap}
              environmentMode={environmentMode}
            />

            {/* CAD-like Dimension Labels */}
            <DimensionLabels
              modules={wallConfig.config.modules}
              wallWidth={wallConfig.config.width}
              wallHeight={wallConfig.config.height}
              showDimensions={showDimensions}
            />
          </Canvas>

          {/* Premium Control Panel */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 z-40">
            <button
              onClick={() => setShowDimensions(!showDimensions)}
              className={`flex items-center space-x-2 px-3 py-2 rounded text-xs transition-colors ${
                showDimensions
                  ? 'bg-gold-500 text-white'
                  : 'bg-white hover:bg-gold-50 text-slate-700 hover:text-gold-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Dimensions</span>
            </button>
          </div>

          {/* Mobile wizard toggle button */}
          <button
            onClick={() => setIsMobileWizardOpen(true)}
            className="absolute bottom-4 left-4 md:hidden bg-gold-500 hover:bg-gold-600 text-white p-3 rounded-full shadow-lg transition-colors z-40"
          >
            <Smartphone className="w-6 h-6" />
          </button>

          {/* Desktop toggle button */}
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="absolute bottom-4 right-4 md:hidden bg-gold-500 hover:bg-gold-600 text-white p-3 rounded-full shadow-lg transition-colors z-40"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Configuration Sidebar */}
      <accessorySelection.AccessorySelectionContext.Provider value={accessorySelection}>
        <ConfigurationSidebar
          config={wallConfig}
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
        />
      </accessorySelection.AccessorySelectionContext.Provider>

      {/* Mobile Wizard */}
      <MobileWizard
        config={wallConfig}
        isOpen={isMobileWizardOpen}
        onClose={() => setIsMobileWizardOpen(false)}
      />

      {/* Layout Information Panel */}
      <LayoutInfoPanel config={wallConfig} />

      {/* Camera Controls UI */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 z-40">
        <div className="text-xs font-medium text-slate-700 mb-2 px-1">Camera Views</div>
        <div className="flex flex-col space-y-1">
          {[
            { id: 'auto', label: 'Auto', icon: 'rotate-ccw' },
            { id: 'front', label: 'Front', icon: 'eye' },
            { id: 'isometric', label: 'ISO', icon: 'square' },
            { id: 'left', label: 'Left', icon: 'camera' },
            { id: 'top', label: 'Top', icon: 'maximize-2' }
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setCameraPreset(id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded text-xs transition-colors ${
                cameraPreset === id
                  ? 'bg-gold-500 text-white'
                  : 'bg-white hover:bg-gold-50 text-slate-700 hover:text-gold-700'
              }`}
            >
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Environment Controls UI */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 z-40">
        <div className="text-xs font-medium text-slate-700 mb-2 px-1">Environment</div>
        <div className="flex space-x-1">
          {[
            { id: 'studio', label: 'Studio', icon: Square },
            { id: 'livingRoom', label: 'Living Room', icon: Home },
            { id: 'night', label: 'Night', icon: Moon }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setEnvironmentMode(id as any)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                environmentMode === id
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

      {/* Export Controls */}
      <ExportControls wallConfig={wallConfig.config} />
    </div>
  );
}
