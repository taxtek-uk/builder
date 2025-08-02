import React, { useState, useRef } from 'react';
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
import { Sun, Home, Moon, Square, Smartphone, RotateCw } from 'lucide-react';

export function WallConfigurator() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isMobileWizardOpen, setIsMobileWizardOpen] = useState(false);
  const [environmentMode, setEnvironmentMode] = useState<'studio' | 'livingRoom' | 'night' | 'modern'>('studio');
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

  const cycleScene = () => {
    const scenes: Array<'studio' | 'livingRoom' | 'night' | 'modern'> = ['studio', 'livingRoom', 'night', 'modern'];
    const currentIndex = scenes.indexOf(environmentMode);
    const nextIndex = (currentIndex + 1) % scenes.length;
    setEnvironmentMode(scenes[nextIndex]);
  };

  const getSceneName = () => {
    switch (environmentMode) {
      case 'studio': return 'Studio';
      case 'livingRoom': return 'Living Room';
      case 'night': return 'Night Mode';
      case 'modern': return 'Modern';
      default: return 'Studio';
    }
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
                : environmentMode === 'modern'
                ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'
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

          {/* Control Buttons */}
          <div className="absolute top-4 left-4 z-40 flex flex-col space-y-2">
            {/* Dimensions Toggle Button */}
            <button
              onClick={() => setShowDimensions(!showDimensions)}
              className={`w-10 h-10 rounded-full transition-colors ${
                showDimensions
                  ? 'bg-gold-600 hover:bg-gold-700'
                  : 'bg-black hover:bg-gray-800'
              } flex items-center justify-center shadow-lg`}
              title="Start the Preview"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>

            {/* Scene Switcher Button */}
            <button
              onClick={cycleScene}
              className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center shadow-lg transition-colors border border-gray-200"
              title={`Switch Scene (Current: ${getSceneName()})`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
              </svg>
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
