import { useState } from 'react';
import { TreePine, Paintbrush, Mountain, Shirt, Zap, Sparkles } from 'lucide-react';

interface FinishPanelProps {
  config: any;
}

const finishCategories = [
  {
    id: 'wood',
    name: 'Wood Grain',
    icon: TreePine,
    colors: [
      { name: 'Oak', color: '#DEB887' },
      { name: 'Walnut', color: '#8B4513' },
      { name: 'Maple', color: '#F5DEB3' },
      { name: 'Cherry', color: '#DE3163' },
      { name: 'Ebony', color: '#2F2F2F' }
    ]
  },
  { 
    id: 'solid', 
    name: 'Solid Colour', 
    icon: Paintbrush,
    colors: [
      { name: 'Charcoal', color: '#2d3748' },
      { name: 'White', color: '#ffffff' },
      { name: 'Anthracite', color: '#1a202c' },
      { name: 'Sage', color: '#68d391' },
      { name: 'Navy', color: '#2b6cb0' },
      { name: 'Cream', color: '#f7fafc' },
      { name: 'Taupe', color: '#a0aec0' },
      { name: 'Graphite', color: '#4a5568' },
      { name: 'Pearl', color: '#edf2f7' }
    ]
  },
  {
    id: 'stone',
    name: 'Stone Grain',
    icon: Mountain,
    colors: [
      { name: 'Calacatta Marble', color: '#f8f9fa', texture: 'https://cdn.builder.io/api/v1/image/assets%2F41e52eff47724129b24eb097221dbe68%2Fc2cd7a3250ce4e69a1bd1f3fd936ae5c?format=webp&width=800' },
      { name: 'Carrara Marble', color: '#f1f3f4', texture: 'https://cdn.builder.io/api/v1/image/assets%2F41e52eff47724129b24eb097221dbe68%2F89db21df37f9439fb62d9821cec18c03?format=webp&width=800' },
      { name: 'Terrazzo Beige', color: '#d4c4a0', texture: 'https://cdn.builder.io/api/v1/image/assets%2F41e52eff47724129b24eb097221dbe68%2F0743e5c8c7904c078fe9a8cc67b772b1?format=webp&width=800' },
      { name: 'Concrete Grey', color: '#9ca3af', texture: 'https://cdn.builder.io/api/v1/image/assets%2F41e52eff47724129b24eb097221dbe68%2Fa62e6a2e2b6a4fe39f12faac264bf45a?format=webp&width=800' },
      { name: 'Dark Slate', color: '#64748b', texture: 'https://cdn.builder.io/api/v1/image/assets%2F41e52eff47724129b24eb097221dbe68%2F14f19c28a90642c3ab746afdef298255?format=webp&width=800' },
      { name: 'Light Slate', color: '#94a3b8', texture: 'https://cdn.builder.io/api/v1/image/assets%2F41e52eff47724129b24eb097221dbe68%2F0eec77dfbe0e4a43b64234c6b60da972?format=webp&width=800' },
      { name: 'Grey Marble', color: '#94a3b8', texture: 'https://cdn.builder.io/api/v1/image/assets%2F41e52eff47724129b24eb097221dbe68%2Fd9605d51caf4452480a36131a6f14262?format=webp&width=800' },
      { name: 'Dark Marble', color: '#475569', texture: 'https://cdn.builder.io/api/v1/image/assets%2F41e52eff47724129b24eb097221dbe68%2Ffd27beb7d6c54cf4a7244d12f3c1429b?format=webp&width=800' },
      { name: 'Cream Marble', color: '#f7f3e9', texture: 'https://cdn.builder.io/api/v1/image/assets%2F41e52eff47724129b24eb097221dbe68%2F9ab693124c4541578e82bbb7f63b45c2?format=webp&width=800' },
      { name: 'Black Marble', color: '#1e293b', texture: 'https://cdn.builder.io/api/v1/image/assets%2F41e52eff47724129b24eb097221dbe68%2Fedf45db73ed0489aafbe551d732a08d6?format=webp&width=800' },
      { name: 'Crema Marfil', color: '#f5f1e8', texture: 'https://cdn.builder.io/api/v1/image/assets%2F41e52eff47724129b24eb097221dbe68%2F108a351f9f4942299b18059b246ebc0b?format=webp&width=800' },
      { name: 'White Marble', color: '#fafafa', texture: 'https://cdn.builder.io/api/v1/image/assets%2F41e52eff47724129b24eb097221dbe68%2F5aa2181323914bf6ad2a7b01e270df91?format=webp&width=800' },
      { name: 'Flowing Marble', color: '#f8f8f8', texture: 'https://cdn.builder.io/api/v1/image/assets%2F41e52eff47724129b24eb097221dbe68%2F5b2a54f1a8484c429f3912493b564c58?format=webp&width=800' },
      { name: 'Dark Travertine', color: '#4a5568', texture: 'https://cdn.builder.io/api/v1/image/assets%2F41e52eff47724129b24eb097221dbe68%2F1b6aeda44e7141feb48bb794d79dcd49?format=webp&width=800' },
      { name: 'Black Granite', color: '#2d3748', texture: 'https://cdn.builder.io/api/v1/image/assets%2F41e52eff47724129b24eb097221dbe68%2F8d37133b27bd4c92b6eb34bae6b8d62a?format=webp&width=800' },
      { name: 'Beige Marble', color: '#f1e9dc', texture: 'https://cdn.builder.io/api/v1/image/assets%2F41e52eff47724129b24eb097221dbe68%2Fbc7d4d27fab24ef4bd80041bfde397f4?format=webp&width=800' },
      { name: 'Forest Green', color: '#4a5d3a', texture: 'https://cdn.builder.io/api/v1/image/assets%2F41e52eff47724129b24eb097221dbe68%2F4cce58bf490f42e09250f55ba570dbd7?format=webp&width=800' },
      { name: 'Gold Veined Black', color: '#1a1a1a', texture: 'https://cdn.builder.io/api/v1/image/assets%2F41e52eff47724129b24eb097221dbe68%2Fe190c1fd98704ae09da05920ec2f5762?format=webp&width=800' },
      { name: 'Dark Wood Grain', color: '#3e2723', texture: 'https://cdn.builder.io/api/v1/image/assets%2F41e52eff47724129b24eb097221dbe68%2F42a85dfc16cb49ea95e42c8471cb3fea?format=webp&width=800' }
    ]
  },
  { 
    id: 'cloth', 
    name: 'Cloth Pattern', 
    icon: Shirt,
    colors: [
      { name: 'Linen Natural', color: '#f8f6f0' },
      { name: 'Canvas Grey', color: '#9ca3af' },
      { name: 'Tweed Brown', color: '#8b5a3c' },
      { name: 'Felt Charcoal', color: '#374151' },
      { name: 'Wool Cream', color: '#fef7e0' }
    ]
  },
  { 
    id: 'metal', 
    name: 'Metal', 
    icon: Zap,
    colors: [
      { name: 'Brushed Steel', color: '#8e9aaf' },
      { name: 'Black Steel', color: '#2f3349' },
      { name: 'Copper', color: '#b87333' },
      { name: 'Brass', color: '#b89773' },
      { name: 'Titanium', color: '#c0c0c0' }
    ]
  },
  {
    id: 'mirror',
    name: 'Mirror',
    icon: Sparkles,
    colors: [
      { name: 'Clear Mirror', color: '#e5e7eb' },
      { name: 'Smoked Mirror', color: '#9ca3af' },
      { name: 'Bronze Mirror', color: '#92400e' },
      { name: 'Grey Mirror', color: '#6b7280' }
    ]
  }
];

export function FinishPanel({ config }: FinishPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('solid');

  const handleFinishSelect = (category: string, color: string, texture?: string) => {
    config.updateFinish({ category, color, texture });
  };

  return (
    <div className="space-y-3">
      {finishCategories.map((category) => {
        const Icon = category.icon;
        const isExpanded = expandedCategory === category.id;
        const isSelected = config.config.finish.category === category.id;

        return (
          <div key={category.id} className="border border-slate-200 rounded-lg overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
              className={`w-full flex items-center justify-between p-3 transition-colors ${
                isSelected ? 'bg-gold-50 border-gold-200' : 'bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-gold-100' : 'bg-slate-100'
                }`}>
                  <Icon size={16} className={isSelected ? 'text-gold-600' : 'text-slate-600'} />
                </div>
                <span className="font-medium text-slate-900">{category.name}</span>
              </div>
              {isSelected && (
                <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </button>

            {/* Color Swatches */}
            {isExpanded && (
              <div className="p-3 bg-slate-50 border-t border-slate-200">
                <div className="grid grid-cols-3 gap-2">
                  {category.colors.map((colorOption) => (
                    <button
                      key={colorOption.name}
                      onClick={() => handleFinishSelect(category.id, colorOption.color, colorOption.texture)}
                      className={`group relative flex flex-col items-center p-2 rounded-lg transition-all ${
                        config.config.finish.color === colorOption.color && isSelected
                          ? 'ring-2 ring-gold-500 bg-white' 
                          : 'hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg border-2 border-white shadow-sm bg-cover bg-center"
                        style={{
                          backgroundColor: colorOption.color,
                          backgroundImage: colorOption.texture ? `url(${colorOption.texture})` : 'none'
                        }}
                      />
                      <span className="text-xs text-slate-600 mt-1 text-center">
                        {colorOption.name}
                      </span>
                      {config.config.finish.color === colorOption.color && isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Current Selection */}
      <div className="bg-slate-50 rounded-lg p-3">
        <h4 className="text-sm font-medium text-slate-900 mb-2">Current Selection</h4>
        <div className="flex items-center space-x-3">
          <div
            className="w-6 h-6 rounded border-2 border-white shadow-sm bg-cover bg-center"
            style={{
              backgroundColor: config.config.finish.color,
              backgroundImage: config.config.finish.texture ? `url(${config.config.finish.texture})` : 'none'
            }}
          />
          <div>
            <div className="text-sm font-medium text-slate-900 capitalize">
              {config.config.finish.category.replace('_', ' ')}
            </div>
            <div className="text-xs text-slate-500">
              {config.config.finish.texture ? 'Textured finish' : config.config.finish.color}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
