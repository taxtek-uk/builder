import { useState, useEffect } from 'react';
import { X, Ruler, Palette, Settings, ShoppingCart, ChevronDown, ChevronRight, MessageSquareMore, Zap, BookOpen, Target } from 'lucide-react';
import { WallConfig } from '../hooks/useWallConfig';
import { useUserExperience } from '../hooks/useUserExperience';
import { DimensionsPanel } from './panels/DimensionsPanel';
import { FinishPanel } from './panels/FinishPanel';
import { AccessoriesPanel } from './panels/AccessoriesPanel';
import { SummaryPanel } from './panels/SummaryPanel';
import { CustomQuoteModal } from './CustomQuoteModal';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ConfigurationSidebarProps {
  config: any;
  isOpen: boolean;
  onClose: () => void;
}

type PanelType = 'dimensions' | 'finish' | 'accessories' | 'summary';

export function ConfigurationSidebar({ config, isOpen, onClose }: ConfigurationSidebarProps) {
  const [activePanel, setActivePanel] = useState<PanelType | null>(null);
  const [showCustomQuoteModal, setShowCustomQuoteModal] = useState(false);
  const userExperience = useUserExperience();
  const interfaceConfig = userExperience.getInterfaceConfig();

  // Auto-open first panel for beginners
  useEffect(() => {
    if (userExperience.expertiseLevel === 'beginner' && !activePanel && isOpen) {
      setActivePanel('dimensions');
    }
  }, [userExperience.expertiseLevel, activePanel, isOpen]);

  const panels = [
    {
      id: 'dimensions' as PanelType,
      title: 'Wall Dimensions',
      icon: Ruler,
      component: DimensionsPanel,
      priority: 'high',
      description: 'Set your wall size and layout'
    },
    {
      id: 'finish' as PanelType,
      title: 'Finish Selection',
      icon: Palette,
      component: FinishPanel,
      priority: 'medium',
      description: 'Choose colors and textures'
    },
    {
      id: 'accessories' as PanelType,
      title: 'Accessories & Smart Devices',
      icon: Settings,
      component: AccessoriesPanel,
      priority: userExperience.expertiseLevel === 'beginner' ? 'low' : 'medium',
      description: 'Add functional elements'
    },
    {
      id: 'summary' as PanelType,
      title: 'Summary & Checkout',
      icon: ShoppingCart,
      component: SummaryPanel,
      priority: 'high',
      description: 'Review and finalize your order'
    }
  ];

  const togglePanel = (panelId: PanelType) => {
    userExperience.trackInteraction('click', { type: 'panel_toggle', panel: panelId });
    setActivePanel(activePanel === panelId ? null : panelId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getExpertiseIcon = () => {
    switch (userExperience.expertiseLevel) {
      case 'beginner': return BookOpen;
      case 'intermediate': return Target;
      case 'expert': return Zap;
      default: return BookOpen;
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed right-0 top-16 bottom-0 w-full max-w-md bg-white/95 backdrop-blur-lg shadow-2xl z-50
        md:relative md:top-0 md:w-96 md:shadow-none md:bg-white/90
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-slate-200 bg-white/95 backdrop-blur-lg">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-slate-900">Configure Your Wall</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    {(() => {
                      const ExpertiseIcon = getExpertiseIcon();
                      return <ExpertiseIcon size={12} />;
                    })()}
                    <span className="capitalize text-xs">{userExperience.expertiseLevel}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your current experience level affects which options are shown</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Panels */}
        <div className="flex-1 overflow-y-auto">
          {panels.map((panel) => {
            const Icon = panel.icon;
            const Component = panel.component;
            const isActive = activePanel === panel.id;

            return (
              <div key={panel.id} className="border-b border-slate-100">
                {/* Panel Header */}
                <button
                  onClick={() => togglePanel(panel.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gold-100 rounded-lg flex items-center justify-center">
                      <Icon size={16} className="text-gold-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-slate-900">{panel.title}</span>
                        {interfaceConfig.showTooltips && (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs px-1.5 py-0.5 ${getPriorityColor(panel.priority)}`}
                          >
                            {panel.priority}
                          </Badge>
                        )}
                      </div>
                      {interfaceConfig.showTooltips && userExperience.expertiseLevel === 'beginner' && (
                        <p className="text-xs text-slate-500 mt-1">{panel.description}</p>
                      )}
                    </div>
                  </div>
                  {isActive ? (
                    <ChevronDown size={16} className="text-slate-500" />
                  ) : (
                    <ChevronRight size={16} className="text-slate-500" />
                  )}
                </button>

                {/* Panel Content */}
                {isActive && (
                  <div className={`px-4 ${interfaceConfig.compactMode ? 'pb-4' : 'pb-6'}`}>
                    <Component config={config} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="sticky bottom-0 z-10 p-4 bg-white/95 backdrop-blur-lg border-t border-slate-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              £{config.pricing?.total.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-sm text-slate-600">
              {config.config?.width}mm × {config.config?.height}mm wall
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {config.pricing?.area.toFixed(2)}m² • {config.config?.modules.length} modules
            </div>

            {/* Custom Quote Button */}
            {config.needsCustomQuote && (
              <button
                onClick={() => setShowCustomQuoteModal(true)}
                className="w-full mt-3 flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <MessageSquareMore size={16} />
                <span>Get Custom Quote</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Custom Quote Modal */}
      <CustomQuoteModal
        isOpen={showCustomQuoteModal}
        onClose={() => setShowCustomQuoteModal(false)}
        wallWidth={config.config?.width || 0}
        moduleCount={config.config?.modules.length || 0}
      />
    </>
  );
}
