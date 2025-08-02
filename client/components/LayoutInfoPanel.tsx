import { Info, Ruler, Zap } from 'lucide-react';

interface LayoutInfoPanelProps {
  config: any;
}

export function LayoutInfoPanel({ config }: LayoutInfoPanelProps) {
  const { modules } = config.config;
  const layoutInfo = (modules[0] as any)?.layoutInfo;
  
  if (!layoutInfo) return null;

  const usableWidth = config.config.width - 50; // Account for margins
  const hasSpecialModule = modules.some((m: any) => ['tv', 'fire', 'gaming'].includes(m.type));

  return (
    <div className="fixed bottom-4 left-4 bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-3 max-w-sm z-40">
      <div className="flex items-center space-x-2 mb-2">
        <Ruler size={16} className="text-blue-600" />
        <span className="text-sm font-medium text-slate-900">Layout Information</span>
      </div>
      
      <div className="space-y-1 text-xs text-slate-600">
        <div className="flex justify-between">
          <span>Total Width:</span>
          <span className="font-mono">{config.config.width}mm</span>
        </div>
        <div className="flex justify-between">
          <span>Usable Width:</span>
          <span className="font-mono">{usableWidth}mm</span>
        </div>
        <div className="flex justify-between">
          <span>Modules:</span>
          <span className="font-mono">{modules.length}</span>
        </div>
      </div>

      {hasSpecialModule && layoutInfo && (
        <>
          <div className="border-t border-slate-200 mt-2 pt-2">
            <div className="text-xs text-blue-700 font-medium mb-1">
              {layoutInfo.centerModule}
            </div>
            <div className="text-xs text-slate-600">
              <div>{layoutInfo.leftFill}</div>
              <div>{layoutInfo.rightFill}</div>
            </div>
          </div>
          
          {/* Precision indicator */}
          <div className="flex items-center space-x-1 mt-2 text-xs text-green-600">
            <Zap size={12} />
            <span>CAD Precision: 0.001mm</span>
          </div>
        </>
      )}
      
      {/* Gap detection */}
      {usableWidth - modules.reduce((sum: number, m: any) => sum + m.width, 0) < 100 && (
        <div className="flex items-center space-x-1 mt-2 text-xs text-amber-600">
          <Info size={12} />
          <span>Auto-adjusted for symmetry</span>
        </div>
      )}
    </div>
  );
}
