import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Home, Ruler, Settings, Gamepad2, Wrench, CreditCard } from 'lucide-react';
import { WallConfig } from '../hooks/useWallConfig';

interface MobileWizardProps {
  config: any;
  isOpen: boolean;
  onClose: () => void;
}

type WizardStep = 'covering' | 'dimensions' | 'accessories' | 'devices' | 'installation' | 'review';

interface StepConfig {
  id: WizardStep;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}

const WIZARD_STEPS: StepConfig[] = [
  {
    id: 'covering',
    title: 'Wall Covering',
    icon: Home,
    description: 'Choose your wall finish and style'
  },
  {
    id: 'dimensions',
    title: 'Dimensions',
    icon: Ruler,
    description: 'Set your wall size and measurements'
  },
  {
    id: 'accessories',
    title: 'Accessories',
    icon: Settings,
    description: 'Add shelves, lighting, and controls'
  },
  {
    id: 'devices',
    title: 'Smart Devices',
    icon: Gamepad2,
    description: 'Configure TV, gaming, and entertainment'
  },
  {
    id: 'installation',
    title: 'Installation',
    icon: Wrench,
    description: 'Choose DIY or professional installation'
  },
  {
    id: 'review',
    title: 'Review & Pay',
    icon: CreditCard,
    description: 'Review your order and complete purchase'
  }
];

export function MobileWizard({ config, isOpen, onClose }: MobileWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('covering');
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set());

  const currentStepIndex = WIZARD_STEPS.findIndex(step => step.id === currentStep);
  const currentStepConfig = WIZARD_STEPS[currentStepIndex];

  const canGoNext = () => {
    // Add validation logic for each step
    switch (currentStep) {
      case 'covering':
        return config.config.finish.category && config.config.finish.color;
      case 'dimensions':
        return config.config.width >= 1000 && config.config.height >= 2200;
      case 'accessories':
      case 'devices':
      case 'installation':
        return true; // These steps are optional
      case 'review':
        return false; // Last step
      default:
        return false;
    }
  };

  const canGoPrevious = () => {
    return currentStepIndex > 0;
  };

  const handleNext = () => {
    if (canGoNext() && currentStepIndex < WIZARD_STEPS.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(WIZARD_STEPS[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious()) {
      setCurrentStep(WIZARD_STEPS[currentStepIndex - 1].id);
    }
  };

  const handleStepClick = (stepId: WizardStep) => {
    const stepIndex = WIZARD_STEPS.findIndex(step => step.id === stepId);
    if (stepIndex <= currentStepIndex || completedSteps.has(stepId)) {
      setCurrentStep(stepId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col md:hidden">
      {/* Header with Progress */}
      <div className="bg-gradient-to-r from-gold-500 to-gold-600 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Configure Your Wall</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-2">
          {WIZARD_STEPS.map((step, index) => {
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = step.id === currentStep;
            const isAccessible = index <= currentStepIndex || completedSteps.has(step.id);

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                disabled={!isAccessible}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                  isAccessible ? 'hover:bg-white/20' : 'opacity-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent 
                    ? 'bg-white text-gold-600' 
                    : 'bg-white/30 text-white'
                }`}>
                  {isCompleted ? (
                    <Check size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs text-center leading-tight">{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Current Step Info */}
        <div className="text-center">
          <h2 className="text-xl font-bold">{currentStepConfig.title}</h2>
          <p className="text-white/90 text-sm">{currentStepConfig.description}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {currentStep === 'covering' && <CoveringStep config={config} />}
        {currentStep === 'dimensions' && <DimensionsStep config={config} />}
        {currentStep === 'accessories' && <AccessoriesStep config={config} />}
        {currentStep === 'devices' && <DevicesStep config={config} />}
        {currentStep === 'installation' && <InstallationStep config={config} />}
        {currentStep === 'review' && <ReviewStep config={config} />}
      </div>

      {/* Navigation Footer */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious()}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              canGoPrevious()
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStepIndex + 1} of {WIZARD_STEPS.length}
          </div>

          <button
            onClick={handleNext}
            disabled={!canGoNext()}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              canGoNext()
                ? 'bg-gold-500 hover:bg-gold-600 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>{currentStep === 'review' ? 'Complete' : 'Next'}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Step Components
function CoveringStep({ config }: { config: any }) {
  const finishCategories = [
    { id: 'wood', name: 'Wood', description: 'Natural wood finishes', colors: ['#8B4513', '#D2691E', '#CD853F', '#DEB887'] },
    { id: 'solid', name: 'Solid Color', description: 'Modern solid colors', colors: ['#2D3748', '#4A5568', '#718096', '#E2E8F0'] },
    { id: 'stone', name: 'Stone', description: 'Natural stone textures', colors: ['#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6'] },
    { id: 'metal', name: 'Metal', description: 'Industrial metal finishes', colors: ['#374151', '#4B5563', '#6B7280', '#9CA3AF'] }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Wall Finish</h3>
        
        <div className="grid grid-cols-1 gap-4">
          {finishCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => config.updateFinish({ category: category.id })}
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                config.config.finish.category === category.id
                  ? 'border-gold-500 bg-gold-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
                <div className="flex space-x-1">
                  {category.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {config.config.finish.category && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Select Color</h4>
          <div className="grid grid-cols-4 gap-3">
            {finishCategories
              .find(cat => cat.id === config.config.finish.category)
              ?.colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => config.updateFinish({ color })}
                  className={`w-full h-16 rounded-lg border-2 transition-colors ${
                    config.config.finish.color === color
                      ? 'border-gold-500 ring-2 ring-gold-200'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DimensionsStep({ config }: { config: any }) {
  const [width, setWidth] = useState(config.config.width);
  const [height, setHeight] = useState(config.config.height);

  const handleWidthChange = (value: number) => {
    const clampedValue = Math.max(1000, Math.min(6000, value));
    setWidth(clampedValue);
    config.updateDimensions(clampedValue, height);
  };

  const handleHeightChange = (value: number) => {
    const clampedValue = Math.max(2200, Math.min(4000, value));
    setHeight(clampedValue);
    config.updateDimensions(width, clampedValue);
  };

  const presets = [
    { name: 'Small', width: 2400, height: 2400 },
    { name: 'Medium', width: 3200, height: 2400 },
    { name: 'Large', width: 4000, height: 2800 },
    { name: 'Extra Large', width: 5000, height: 3200 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Set Wall Dimensions</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Width (mm)
            </label>
            <input
              type="number"
              value={width}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1000)}
              min={1000}
              max={6000}
              step={100}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Range: 1,000mm - 6,000mm</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height (mm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 2200)}
              min={2200}
              max={4000}
              step={100}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Range: 2,200mm - 4,000mm</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Quick Presets</h4>
        <div className="grid grid-cols-2 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                setWidth(preset.width);
                setHeight(preset.height);
                config.updateDimensions(preset.width, preset.height);
              }}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900">{preset.name}</div>
              <div className="text-xs text-gray-500">{preset.width} × {preset.height}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Configuration Summary</h4>
        <div className="space-y-1 text-sm text-blue-800">
          <div>Area: {config.pricing.area.toFixed(2)}m²</div>
          <div>Modules: {config.config.modules.length}</div>
          <div>Base Price: £{config.pricing.base.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

function AccessoriesStep({ config }: { config: any }) {
  const accessories = [
    { id: 'speakers', name: 'Integrated Speakers', price: 300, description: 'High-quality built-in speakers' },
    { id: 'ledLighting', name: 'LED Lighting', price: 250, description: 'RGB LED strip lighting system' },
    { id: 'smartControl', name: 'Smart Control Panel', price: 0, description: 'Touch control for all features' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Accessories</h3>
        
        <div className="space-y-3">
          {accessories.map((accessory) => (
            <div
              key={accessory.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{accessory.name}</h4>
                <p className="text-sm text-gray-600">{accessory.description}</p>
                <p className="text-sm font-medium text-gold-600">
                  {accessory.price > 0 ? `+£${accessory.price}` : 'Included'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.config.accessories[accessory.id] || false}
                  onChange={(e) => config.updateAccessories({ [accessory.id]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Floating Shelves</h4>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Quantity:</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => config.updateAccessories({ 
                shelves: Math.max(0, (config.config.accessories.shelves || 0) - 1) 
              })}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
            >
              -
            </button>
            <span className="w-8 text-center font-medium">
              {config.config.accessories.shelves || 0}
            </span>
            <button
              onClick={() => config.updateAccessories({ 
                shelves: Math.min(6, (config.config.accessories.shelves || 0) + 1) 
              })}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
            >
              +
            </button>
          </div>
          <span className="text-sm text-gold-600">£250 each</span>
        </div>
      </div>
    </div>
  );
}

function DevicesStep({ config }: { config: any }) {
  const devices = [
    { id: 'tv', name: 'TV Mount & Bracket', price: 990, description: 'Professional TV mounting with cable management' },
    { id: 'fire', name: 'Electric Fireplace', price: 1490, description: 'Built-in electric fireplace with remote control' },
    { id: 'gaming', name: 'Gaming Console Platform', price: 600, description: 'Dedicated gaming setup with ventilation' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Devices</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose one main feature for your wall. Additional devices can be added later.
        </p>
        
        <div className="space-y-3">
          {devices.map((device) => (
            <button
              key={device.id}
              onClick={() => {
                // Only allow one main device at a time
                const updates = { tv: false, fire: false, gaming: false };
                updates[device.id as keyof typeof updates] = !config.config.accessories[device.id];
                config.updateAccessories(updates);
              }}
              className={`w-full p-4 border-2 rounded-lg transition-colors text-left ${
                config.config.accessories[device.id]
                  ? 'border-gold-500 bg-gold-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{device.name}</h4>
                  <p className="text-sm text-gray-600">{device.description}</p>
                  <p className="text-sm font-medium text-gold-600">+£{device.price}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  config.config.accessories[device.id]
                    ? 'border-gold-500 bg-gold-500'
                    : 'border-gray-300'
                }`}>
                  {config.config.accessories[device.id] && (
                    <Check size={16} className="text-white" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function InstallationStep({ config }: { config: any }) {
  const options = [
    {
      id: 'diy',
      name: 'DIY Installation',
      price: 0,
      description: 'Complete installation kit with detailed instructions',
      features: ['Step-by-step guide', 'All mounting hardware', 'Video tutorials', 'Phone support']
    },
    {
      id: 'professional',
      name: 'Professional Installation',
      price: 495,
      description: 'Expert installation by certified technicians',
      features: ['Professional installation', 'Cable management', '12-month warranty', 'Same-day service available']
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Installation Options</h3>
        
        <div className="space-y-4">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => config.updateInstallation(option.id)}
              className={`w-full p-4 border-2 rounded-lg transition-colors text-left ${
                config.config.installation === option.id
                  ? 'border-gold-500 bg-gold-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{option.name}</h4>
                  <p className="text-sm text-gray-600">{option.description}</p>
                  <p className="text-sm font-medium text-gold-600 mt-1">
                    {option.price > 0 ? `+£${option.price}` : 'Included'}
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  config.config.installation === option.id
                    ? 'border-gold-500 bg-gold-500'
                    : 'border-gray-300'
                }`}>
                  {config.config.installation === option.id && (
                    <Check size={16} className="text-white" />
                  )}
                </div>
              </div>
              
              <ul className="space-y-1">
                {option.features.map((feature, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-center">
                    <Check size={12} className="text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ config }: { config: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Wall Specifications</h4>
            <p className="text-sm text-gray-600">
              {config.config.width}mm × {config.config.height}mm ({config.pricing.area.toFixed(2)}m²)
            </p>
            <p className="text-sm text-gray-600">
              {config.config.finish.category} finish in {config.config.finish.color}
            </p>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Pricing Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base Wall ({config.pricing.area.toFixed(2)}m²)</span>
                <span>£{config.pricing.base.toLocaleString()}</span>
              </div>
              {config.pricing.accessories > 0 && (
                <div className="flex justify-between">
                  <span>Accessories</span>
                  <span>£{config.pricing.accessories.toLocaleString()}</span>
                </div>
              )}
              {config.pricing.installation > 0 && (
                <div className="flex justify-between">
                  <span>Professional Installation</span>
                  <span>£{config.pricing.installation.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>£{config.pricing.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button className="w-full bg-gold-500 hover:bg-gold-600 text-white py-4 rounded-lg font-medium text-lg transition-colors">
        Proceed to Checkout
      </button>
    </div>
  );
}

