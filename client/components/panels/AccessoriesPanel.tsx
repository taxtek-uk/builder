import { Monitor, Flame, Gamepad2, Speaker, Lightbulb, Minus, Plus, Settings, Target } from 'lucide-react';
import { useAccessorySelection } from '../../hooks/useAccessorySelection';

interface AccessoriesPanelProps {
  config: any;
}

const accessories = [
  {
    id: 'tv',
    name: 'TV Package',
    description: 'Auto-centers 2×1000mm TV module in wall',
    price: 990,
    icon: Monitor,
    type: 'boolean'
  },
  {
    id: 'fire',
    name: 'Fire Package',
    description: 'Auto-centers fireplace module in wall',
    price: 1490,
    icon: Flame,
    type: 'boolean'
  },
  {
    id: 'gaming',
    name: 'Gaming Console Base',
    description: 'Auto-centers gaming module with extended base',
    price: 600,
    icon: Gamepad2,
    type: 'boolean'
  },
  {
    id: 'speakers',
    name: 'Speaker Set',
    description: 'Built-in speakers (edge modules only)',
    price: 300,
    icon: Speaker,
    type: 'boolean'
  },
  {
    id: 'ledLighting',
    name: 'LED Lighting',
    description: 'Ambient lighting (edge/top panels)',
    price: 250,
    icon: Lightbulb,
    type: 'boolean'
  },
  {
    id: 'smartControl',
    name: 'Smart Control Panel',
    description: 'Control system (end panel)',
    price: 200,
    icon: Settings,
    type: 'boolean'
  }
];

const shelfTypes = [
  { name: 'Vertical Shelf', price: 250 },
  { name: 'Horizontal Shelf', price: 250 }
];

export function AccessoriesPanel({ config }: AccessoriesPanelProps) {
  const accessorySelection = useAccessorySelection();

  const handleAccessoryToggle = (accessoryId: string) => {
    // If accessory is already active, turn it off
    if (config.config.accessories[accessoryId]) {
      config.updateAccessories({
        [accessoryId]: !config.config.accessories[accessoryId]
      });
      return;
    }

    // Auto-configure special modules (TV, Fire, Gaming) without manual snapping
    if (['tv', 'fire', 'gaming'].includes(accessoryId)) {
      const isValid = validateAccessoryPlacement(accessoryId, config.config);
      if (!isValid.canPlace) {
        alert(isValid.reason);
        return;
      }

      // Automatically enable and reconfigure wall layout
      config.updateAccessories({ [accessoryId]: true });

      // Show success message
      const accessoryName = accessories.find(a => a.id === accessoryId)?.name || accessoryId;
      showFloatingMessage(`${accessoryName} added to center of wall`);
      return;
    }

    // Check placement rules for other accessories
    const isValid = validateAccessoryPlacement(accessoryId, config.config);
    if (!isValid.canPlace) {
      alert(isValid.reason);
      return;
    }

    // Enter snapping mode for placement of other accessories
    accessorySelection.selectAccessory(accessoryId);
  };

  // Show floating success message
  const showFloatingMessage = (message: string) => {
    // Create temporary floating message element
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
    document.body.appendChild(messageEl);

    // Animate in
    setTimeout(() => messageEl.style.transform = 'translateX(-50%) translateY(-10px)', 100);

    // Remove after 3 seconds
    setTimeout(() => {
      messageEl.style.opacity = '0';
      setTimeout(() => document.body.removeChild(messageEl), 300);
    }, 3000);
  };

  // Validate accessory placement rules
  const validateAccessoryPlacement = (accessoryId: string, wallConfig: any) => {
    const modules = wallConfig.modules || [];
    const edgeModules = modules.filter((_, index) => index === 0 || index === modules.length - 1);
    const usableWidth = wallConfig.width - 50; // Account for 25mm margins

    switch (accessoryId) {
      case 'tv':
      case 'fire':
      case 'gaming':
        return {
          canPlace: usableWidth >= 2000,
          reason: `${accessoryId === 'tv' ? 'TV' : accessoryId === 'fire' ? 'Fire' : 'Gaming'} module requires at least 2050mm total wall width (2000mm + 50mm margins)`
        };
      case 'speakers':
        return {
          canPlace: edgeModules.length > 0,
          reason: 'Speakers can only be placed on edge modules. Need at least one edge module.'
        };
      case 'ledLighting':
        return {
          canPlace: edgeModules.length > 0,
          reason: 'LED lighting can only be placed on edge or top panels. Need at least one edge module.'
        };
      case 'smartControl':
        return {
          canPlace: modules.length > 0,
          reason: 'Smart control panel requires at least one module (placed on end panel).'
        };
      default:
        return { canPlace: true, reason: '' };
    }
  };

  const handleShelfChange = (delta: number) => {
    const newCount = Math.max(0, Math.min(10, config.config.accessories.shelves + delta));
    config.updateAccessories({ shelves: newCount });
  };

  const handleInstallationChange = (installation: 'diy' | 'professional') => {
    config.updateInstallation(installation);
  };

  return (
    <div className="space-y-4">
      {/* Snap Mode Status */}
      {accessorySelection.selectedAccessory && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Placement Mode: {accessories.find(a => a.id === accessorySelection.selectedAccessory)?.name}
              </span>
            </div>
            <button
              onClick={accessorySelection.clearSelection}
              className="text-xs bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            Hover over modules in the 3D view to see compatibility, then click to place.
          </p>
        </div>
      )}

      {/* Main Accessories */}
      <div className="space-y-3">
        {accessories.map((accessory) => {
          const Icon = accessory.icon;
          const isSelected = config.config.accessories[accessory.id];
          const placementValidation = validateAccessoryPlacement(accessory.id, config.config);
          const isDisabled = !placementValidation.canPlace && !isSelected;
          const isInSnapMode = accessorySelection.selectedAccessory === accessory.id;

          return (
            <div
              key={accessory.id}
              className={`border rounded-lg p-3 transition-all ${
                isInSnapMode
                  ? 'border-blue-400 bg-blue-50 cursor-pointer ring-2 ring-blue-200'
                  : isDisabled
                    ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
                    : isSelected
                      ? 'border-gold-300 bg-gold-50 cursor-pointer'
                      : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
              }`}
              onClick={() => !isDisabled && handleAccessoryToggle(accessory.id)}
              title={
                isInSnapMode ? 'Click on a compatible module in the 3D view to place this accessory' :
                isDisabled ? placementValidation.reason : ''
              }
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDisabled
                      ? 'bg-slate-100'
                      : isSelected
                        ? 'bg-gold-100'
                        : 'bg-slate-100'
                  }`}>
                    <Icon size={16} className={
                      isDisabled
                        ? 'text-slate-400'
                        : isSelected
                          ? 'text-gold-600'
                          : 'text-slate-600'
                    } />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{accessory.name}</h4>
                    <p className="text-sm text-slate-600 mt-1">{accessory.description}</p>
                    {isInSnapMode && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <Target size={12} />
                        Click on a compatible module to place
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-slate-900">£{accessory.price}</div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shelves Section */}
      <div className="border border-slate-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-medium text-slate-900">Shelves</h4>
            <p className="text-sm text-slate-600">£250 each (vertical or horizontal)</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleShelfChange(-1)}
              disabled={config.config.accessories.shelves === 0}
              className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center font-medium">{config.config.accessories.shelves}</span>
            <button
              onClick={() => handleShelfChange(1)}
              disabled={config.config.accessories.shelves >= 10}
              className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        {config.config.accessories.shelves > 0 && (
          <div className="text-sm text-slate-600">
            Total: £{(config.config.accessories.shelves * 250).toLocaleString()}
          </div>
        )}
      </div>

      {/* Installation Options */}
      <div className="border border-slate-200 rounded-lg p-3">
        <h4 className="font-medium text-slate-900 mb-3">Installation</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="installation"
              checked={config.config.installation === 'diy'}
              onChange={() => handleInstallationChange('diy')}
              className="w-4 h-4 text-gold-500 border-slate-300 focus:ring-gold-500"
            />
            <div className="flex-1">
              <div className="font-medium text-slate-900">DIY Installation</div>
              <div className="text-sm text-slate-600">Install yourself with our guide</div>
            </div>
            <div className="font-medium text-slate-900">Free</div>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="installation"
              checked={config.config.installation === 'professional'}
              onChange={() => handleInstallationChange('professional')}
              className="w-4 h-4 text-gold-500 border-slate-300 focus:ring-gold-500"
            />
            <div className="flex-1">
              <div className="font-medium text-slate-900">Professional Installation</div>
              <div className="text-sm text-slate-600">We install it for you</div>
            </div>
            <div className="font-medium text-slate-900">£495</div>
          </label>
        </div>
      </div>

      {/* Accessory Summary */}
      <div className="bg-slate-50 rounded-lg p-3">
        <h4 className="text-sm font-medium text-slate-900 mb-2">Accessory Total</h4>
        <div className="text-lg font-bold text-slate-900">
          £{config.pricing.accessories.toLocaleString('en-GB')}
        </div>
        {config.pricing.installation > 0 && (
          <div className="text-sm text-slate-600">
            + £{config.pricing.installation} installation
          </div>
        )}
      </div>
    </div>
  );
}
