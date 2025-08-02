import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface DimensionsPanelProps {
  config: any;
}

export function DimensionsPanel({ config }: DimensionsPanelProps) {
  const [width, setWidth] = useState(config.config.width);
  const [height, setHeight] = useState(config.config.height);

  const handleWidthChange = (value: number) => {
    const clampedValue = Math.max(1000, Math.min(6000, value));
    setWidth(clampedValue);
    config.updateDimensions(clampedValue, config.config.height);
  };

  const handleHeightChange = (value: number) => {
    const clampedValue = Math.max(2200, Math.min(4000, value));
    setHeight(clampedValue);
    config.updateDimensions(config.config.width, clampedValue);
  };

  const needsCustomQuote = config.needsCustomQuote;

  return (
    <div className="space-y-4">
      {/* Width Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Wall Width (mm)
        </label>
        <div className="relative">
          <input
            type="number"
            value={width}
            onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1000)}
            min={1000}
            max={6000}
            step={100}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          />
          <span className="absolute right-3 top-2 text-sm text-slate-500">mm</span>
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Range: 1,000mm - 6,000mm
        </div>
      </div>

      {/* Height Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Wall Height (mm)
        </label>
        <div className="relative">
          <input
            type="number"
            value={height}
            onChange={(e) => handleHeightChange(parseInt(e.target.value) || 2200)}
            min={2200}
            max={4000}
            step={100}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          />
          <span className="absolute right-3 top-2 text-sm text-slate-500">mm</span>
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Range: 2,200mm - 4,000mm
        </div>
      </div>

      {/* Module Information */}
      <div className="bg-slate-50 rounded-lg p-3">
        <h4 className="text-sm font-medium text-slate-900 mb-2">Module Configuration</h4>
        <div className="space-y-1 text-sm text-slate-600">
          <div>Modules required: {config.config.modules.length}</div>
          <div>Usable width: {width - 50}mm (accounting for 25mm cable margins)</div>
          <div>Area: {config.pricing.area.toFixed(2)}m²</div>
        </div>
      </div>

      {/* Custom Quote Warning */}
      {needsCustomQuote && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">Custom Quote Required</h4>
              <p className="text-xs text-amber-700 mt-1">
                For larger walls, please request a custom quotation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Size Presets */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-2">Common Sizes</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { w: 2400, h: 2400, name: 'Small' },
            { w: 3200, h: 2400, name: 'Medium' },
            { w: 4000, h: 2800, name: 'Large' },
            { w: 5000, h: 3200, name: 'XL' }
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                setWidth(preset.w);
                setHeight(preset.h);
                config.updateDimensions(preset.w, preset.h);
              }}
              className="p-2 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="font-medium">{preset.name}</div>
              <div className="text-slate-500">{preset.w} × {preset.h}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
