import { useState, useRef } from 'react';
import { Download, FileImage, FileText, Share2, Save, Database } from 'lucide-react';
import { ExportService } from '../utils/ExportService';

interface ExportControlsProps {
  wallConfig: any;
}

export function ExportControls({ wallConfig }: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleImageExport = async (quality: 'preview' | 'high' | 'print' | 'social') => {
    setIsExporting(true);
    try {
      await ExportService.exportCanvas({ format: 'png', quality });
    } catch (error) {
      console.error('Image export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setExportMenuOpen(false);
    }
  };

  const handleJSONExport = async () => {
    setIsExporting(true);
    try {
      await ExportService.exportJSON(wallConfig);
    } catch (error) {
      console.error('JSON export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setExportMenuOpen(false);
    }
  };

  const handleBOMExport = async () => {
    setIsExporting(true);
    try {
      await ExportService.exportBOM(wallConfig);
    } catch (error) {
      console.error('BOM export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setExportMenuOpen(false);
    }
  };

  const handlePDFExport = async () => {
    setIsExporting(true);
    try {
      await ExportService.exportPDF(wallConfig);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setExportMenuOpen(false);
    }
  };

  const handleSaveConfiguration = async () => {
    setSaveStatus('saving');
    try {
      const result = await ExportService.saveConfiguration(wallConfig);
      setSaveStatus('saved');
      alert(`Configuration saved successfully! ID: ${result.id}`);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
      alert('Failed to save configuration. Please try again.');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleShare = async () => {
    try {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'wall-configuration.png', { type: 'image/png' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
              navigator.share({
                title: 'My Wall Configuration',
                text: 'Check out my smart wall design from The Wall Shop',
                files: [file]
              });
            } else {
              // Fallback: download
              const dataURL = canvas.toDataURL('image/png');
              const link = document.createElement('a');
              link.href = dataURL;
              link.download = 'wall-share.png';
              link.click();
            }
          }
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const exportOptions = [
    {
      id: 'preview',
      label: 'Preview (1200×800)',
      icon: FileImage,
      description: 'Standard quality for viewing',
      action: () => handleImageExport('preview')
    },
    {
      id: 'highRes',
      label: 'High Resolution (2400×1600)',
      icon: FileImage,
      description: 'High quality for presentations',
      action: () => handleImageExport('high')
    },
    {
      id: 'print',
      label: 'Print Quality (3000×2000)',
      icon: FileImage,
      description: 'Maximum quality for printing',
      action: () => handleImageExport('print')
    },
    {
      id: 'social',
      label: 'Social Media (1080×1080)',
      icon: Share2,
      description: 'Square format for social sharing',
      action: () => handleImageExport('social')
    },
    {
      id: 'json',
      label: 'Configuration (JSON)',
      icon: FileText,
      description: 'Technical configuration file',
      action: handleJSONExport
    },
    {
      id: 'bom',
      label: 'Bill of Materials',
      icon: Database,
      description: 'Detailed parts list and pricing',
      action: handleBOMExport
    },
    {
      id: 'pdf',
      label: 'PDF Summary',
      icon: FileText,
      description: 'Complete specification document',
      action: handlePDFExport
    }
  ];

  return (
    <div className="absolute bottom-20 right-4 z-40">
      {/* Export Menu */}
      {exportMenuOpen && (
        <div className="mb-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 min-w-72">
          <div className="text-sm font-medium text-slate-900 mb-3">Export Options</div>
          
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {exportOptions.map(({ id, label, icon: Icon, description, action }) => (
              <button
                key={id}
                onClick={action}
                disabled={isExporting}
                className="w-full flex items-start space-x-3 p-2 rounded hover:bg-gold-50 transition-colors text-left disabled:opacity-50"
              >
                <Icon size={16} className="text-gold-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-900">{label}</div>
                  <div className="text-xs text-slate-600">{description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Control Buttons */}
      <div className="flex space-x-2">
        {/* Save Configuration Button */}
        <button
          onClick={handleSaveConfiguration}
          disabled={saveStatus === 'saving'}
          className={`backdrop-blur-sm p-3 rounded-lg shadow-lg transition-colors ${
            saveStatus === 'saved' 
              ? 'bg-green-500 text-white' 
              : saveStatus === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-white/90 hover:bg-white text-slate-700'
          }`}
          title="Save Configuration"
        >
          {saveStatus === 'saving' ? (
            <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Save size={18} />
          )}
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          disabled={isExporting}
          className="bg-white/90 hover:bg-white backdrop-blur-sm text-slate-700 p-3 rounded-lg shadow-lg transition-colors disabled:opacity-50"
          title="Quick Share"
        >
          <Share2 size={18} />
        </button>
        
        {/* Export Menu Button */}
        <button
          onClick={() => setExportMenuOpen(!exportMenuOpen)}
          disabled={isExporting}
          className={`backdrop-blur-sm p-3 rounded-lg shadow-lg transition-colors disabled:opacity-50 ${
            exportMenuOpen 
              ? 'bg-gold-500 hover:bg-gold-600 text-white' 
              : 'bg-white/90 hover:bg-white text-slate-700'
          }`}
          title="Export Options"
        >
          {isExporting ? (
            <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Download size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
