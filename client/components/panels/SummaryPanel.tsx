import { CreditCard, Smartphone, Download, Share2 } from 'lucide-react';

interface SummaryPanelProps {
  config: any;
}

export function SummaryPanel({ config }: SummaryPanelProps) {
  const handleCheckout = () => {
    // This would integrate with Klarna/payment processing
    alert('Checkout integration would be implemented here');
  };

  const handleShare = () => {
    // Generate shareable URL with configuration
    const configData = btoa(JSON.stringify(config.config));
    const shareUrl = `${window.location.origin}/builder/${configData}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Configuration URL copied to clipboard!');
  };

  const handleExport = () => {
    // Export configuration as image/PDF
    alert('Export functionality would be implemented here');
  };

  return (
    <div className="space-y-4">
      {/* Configuration Summary */}
      <div className="bg-slate-50 rounded-lg p-4">
        <h4 className="font-medium text-slate-900 mb-3">Your Configuration</h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Wall Size:</span>
            <span className="font-medium">{config.config.width}mm × {config.config.height}mm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Area:</span>
            <span className="font-medium">{config.pricing.area.toFixed(2)}m²</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Modules:</span>
            <span className="font-medium">{config.config.modules.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Finish:</span>
            <span className="font-medium capitalize">{config.config.finish.category}</span>
          </div>
        </div>
      </div>

      {/* Live Pricing Display */}
      <div className="border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-slate-900">Live Pricing</h4>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>

        <div className="space-y-2 text-sm">
          {/* Base Price Calculation */}
          <div className="bg-slate-50 rounded-lg p-3 mb-3">
            <div className="text-xs text-slate-500 mb-1">Base Price Calculation:</div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Area: {config.pricing.area.toFixed(2)}m² × £595/m²</span>
              <span className="font-medium text-slate-900">£{config.pricing.base.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-600">Base Price:</span>
            <span className="font-medium">£{config.pricing.base.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</span>
          </div>

          {config.pricing.accessories > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600">Add-ons & Accessories:</span>
              <span className="font-medium">£{config.pricing.accessories.toLocaleString('en-GB')}</span>
            </div>
          )}

          {config.pricing.installation > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600">Professional Installation:</span>
              <span className="font-medium">£{config.pricing.installation.toLocaleString('en-GB')}</span>
            </div>
          )}

          <div className="border-t border-slate-200 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-slate-900">Total Price (Live):</span>
              <span className="text-xl font-bold text-gold-600">£{config.pricing.total.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 text-right">
              Updates automatically as you configure
            </div>
          </div>
        </div>
      </div>

      {/* Selected Accessories */}
      {config.pricing.accessories > 0 && (
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="font-medium text-slate-900 mb-3">Selected Accessories</h4>
          <div className="space-y-1 text-sm">
            {config.config.accessories.tv && <div className="text-slate-600">• TV Package (£990)</div>}
            {config.config.accessories.fire && <div className="text-slate-600">• Fire Package (£1,490)</div>}
            {config.config.accessories.gaming && <div className="text-slate-600">• Gaming Console Base (£600)</div>}
            {config.config.accessories.speakers && <div className="text-slate-600">• Speaker Set (£300)</div>}
            {config.config.accessories.ledLighting && <div className="text-slate-600">• LED Lighting (£250)</div>}
            {config.config.accessories.smartControl && <div className="text-slate-600">• Smart Control Panel (£200)</div>}
            {config.config.accessories.shelves > 0 && (
              <div className="text-slate-600">• {config.config.accessories.shelves} Shelves (£{config.config.accessories.shelves * 250})</div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="flex space-x-2">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>

        {/* Primary Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={!config.isValidConfiguration || config.needsCustomQuote}
          className="w-full flex items-center justify-center space-x-2 bg-gold-500 hover:bg-gold-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          <CreditCard size={16} />
          <span>
            {config.needsCustomQuote
              ? 'Custom Quote Required'
              : 'Confirm & Reserve My Wall'
            }
          </span>
        </button>

        {/* Configuration Status */}
        {!config.isValidConfiguration && !config.needsCustomQuote && (
          <div className="text-center text-xs text-amber-600 mt-2">
            Please adjust your configuration to continue
          </div>
        )}

        {config.needsCustomQuote && (
          <div className="text-center text-xs text-slate-600 mt-2">
            Configuration exceeds standard limits - custom quote needed
          </div>
        )}

        {/* Payment Options */}
        <div className="text-center">
          <div className="text-xs text-slate-500 mb-2">Payment Options:</div>
          <div className="flex items-center justify-center space-x-4 text-xs text-slate-600">
            <div className="flex items-center space-x-1">
              <Smartphone size={12} />
              <span>Klarna</span>
            </div>
            <div className="flex items-center space-x-1">
              <CreditCard size={12} />
              <span>Card</span>
            </div>
            <span>Bank Transfer</span>
          </div>
        </div>
      </div>

      {/* Installation Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-900 mb-1">Installation Method</h4>
        <div className="text-sm text-blue-800">
          {config.config.installation === 'diy' 
            ? 'DIY installation with detailed guide and support'
            : 'Professional installation by The Wall Shop team'
          }
        </div>
        {config.config.installation === 'diy' && (
          <div className="text-xs text-blue-700 mt-1">
            Heavy-duty bracket + snap fit system included
          </div>
        )}
      </div>
    </div>
  );
}
