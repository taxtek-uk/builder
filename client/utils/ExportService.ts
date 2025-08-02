import { WallConfig } from '../hooks/useWallConfig';

export interface ExportOptions {
  format: 'png' | 'pdf' | 'json' | 'bom';
  quality?: 'preview' | 'high' | 'print' | 'social';
  includeMetadata?: boolean;
}

export interface BOMItem {
  item: string;
  quantity: number;
  unit_price_gbp: number;
  total_price_gbp: number;
  description?: string;
}

export interface BOM {
  order_reference: string;
  wall_dimensions: {
    width_mm: number;
    height_mm: number;
    area_m2: number;
  };
  modules: {
    estimated_count: number;
    standard_modules: number;
    special_modules: number;
  };
  finish: {
    category: string;
    color: string;
    texture?: string;
    area_required_m2: number;
  };
  accessories: BOMItem[];
  pricing: {
    base_wall_gbp: number;
    accessories_gbp: number;
    installation_gbp: number;
    total_gbp: number;
  };
  generated_at: string;
}

export class ExportService {
  private static readonly API_BASE = '/api';

  /**
   * Export the current 3D canvas as an image
   */
  static async exportCanvas(options: ExportOptions = { format: 'png', quality: 'high' }): Promise<void> {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      throw new Error('Canvas not found');
    }

    const { width, height } = this.getExportDimensions(options.quality || 'high');
    
    // Create a temporary canvas with the desired dimensions
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Draw the original canvas onto the temporary canvas with scaling
    ctx.drawImage(canvas, 0, 0, width, height);

    // Convert to blob and download
    return new Promise((resolve, reject) => {
      tempCanvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create image blob'));
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wall-configuration-${options.quality}.${options.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        resolve();
      }, `image/${options.format}`, 0.95);
    });
  }

  /**
   * Export wall configuration as JSON
   */
  static async exportJSON(config: WallConfig, includeMetadata: boolean = true): Promise<void> {
    const exportData = {
      wall_configuration: {
        width: config.width,
        height: config.height,
        modules: config.modules,
        finish: config.finish,
        accessories: config.accessories,
        installation: config.installation
      },
      ...(includeMetadata && {
        metadata: {
          exported_at: new Date().toISOString(),
          version: '1.0',
          application: 'Smart Wall Configurator'
        }
      })
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'wall-configuration.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate and export Bill of Materials (BOM)
   */
  static async exportBOM(config: WallConfig): Promise<void> {
    const bom = this.generateBOM(config);
    
    // Export as CSV
    const csvContent = this.bomToCSV(bom);
    const csvBlob = new Blob([csvContent], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvBlob);

    const csvLink = document.createElement('a');
    csvLink.href = csvUrl;
    csvLink.download = `BOM-${bom.order_reference}.csv`;
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);
    URL.revokeObjectURL(csvUrl);

    // Also export as JSON for detailed information
    const jsonBlob = new Blob([JSON.stringify(bom, null, 2)], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);

    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = `BOM-${bom.order_reference}.json`;
    document.body.appendChild(jsonLink);
    jsonLink.click();
    document.body.removeChild(jsonLink);
    URL.revokeObjectURL(jsonUrl);
  }

  /**
   * Export as PDF (using browser's print functionality)
   */
  static async exportPDF(config: WallConfig): Promise<void> {
    // Create a new window with the configuration summary
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    const bom = this.generateBOM(config);
    const htmlContent = this.generatePDFHTML(config, bom);
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);
  }

  /**
   * Save configuration to backend
   */
  static async saveConfiguration(config: WallConfig): Promise<{ id: number; message: string }> {
    const response = await fetch(`${this.API_BASE}/wall-configs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        width: config.width,
        height: config.height,
        finish: config.finish,
        accessories: config.accessories,
        installation: config.installation
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to save configuration: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      id: result.wall_config.id,
      message: result.message
    };
  }

  /**
   * Load configuration from backend
   */
  static async loadConfiguration(configId: number): Promise<WallConfig> {
    const response = await fetch(`${this.API_BASE}/wall-configs/${configId}`);

    if (!response.ok) {
      throw new Error(`Failed to load configuration: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      width: data.width,
      height: data.height,
      modules: [], // Will be recalculated by useWallConfig
      finish: data.finish,
      accessories: data.accessories,
      installation: data.installation
    };
  }

  /**
   * Get export dimensions based on quality setting
   */
  private static getExportDimensions(quality: string): { width: number; height: number } {
    switch (quality) {
      case 'preview':
        return { width: 1200, height: 800 };
      case 'high':
        return { width: 2400, height: 1600 };
      case 'print':
        return { width: 3000, height: 2000 };
      case 'social':
        return { width: 1080, height: 1080 };
      default:
        return { width: 1920, height: 1080 };
    }
  }

  /**
   * Generate Bill of Materials from configuration
   */
  private static generateBOM(config: WallConfig): BOM {
    const area_m2 = (config.width * config.height) / 1000000;
    const usable_width = config.width - 50; // Account for margins
    const estimated_modules = Math.max(1, Math.ceil(usable_width / 600)); // Simplified module calculation

    const accessory_pricing: Record<string, number> = {
      tv: 990,
      fire: 1490,
      gaming: 600,
      speakers: 300,
      ledLighting: 250,
      smartControl: 0,
      shelves: 250 // per shelf
    };

    const accessories: BOMItem[] = [];
    let total_accessories = 0;

    Object.entries(config.accessories).forEach(([accessory, enabled]) => {
      if (enabled) {
        if (accessory === 'shelves' && typeof enabled === 'number') {
          const price = accessory_pricing[accessory] * enabled;
          accessories.push({
            item: 'Floating Shelves',
            quantity: enabled,
            unit_price_gbp: accessory_pricing[accessory],
            total_price_gbp: price,
            description: 'Premium floating shelves with hidden brackets'
          });
          total_accessories += price;
        } else if (enabled === true) {
          const price = accessory_pricing[accessory] || 0;
          accessories.push({
            item: this.getAccessoryDisplayName(accessory),
            quantity: 1,
            unit_price_gbp: price,
            total_price_gbp: price,
            description: this.getAccessoryDescription(accessory)
          });
          total_accessories += price;
        }
      }
    });

    const base_wall_price = area_m2 * 595;
    const installation_price = config.installation === 'professional' ? 495 : 0;

    return {
      order_reference: `WC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      wall_dimensions: {
        width_mm: config.width,
        height_mm: config.height,
        area_m2: Math.round(area_m2 * 100) / 100
      },
      modules: {
        estimated_count: estimated_modules,
        standard_modules: estimated_modules,
        special_modules: 0
      },
      finish: {
        category: config.finish.category,
        color: config.finish.color,
        texture: config.finish.texture,
        area_required_m2: Math.round(area_m2 * 100) / 100
      },
      accessories,
      pricing: {
        base_wall_gbp: Math.round(base_wall_price * 100) / 100,
        accessories_gbp: total_accessories,
        installation_gbp: installation_price,
        total_gbp: Math.round((base_wall_price + total_accessories + installation_price) * 100) / 100
      },
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Convert BOM to CSV format
   */
  private static bomToCSV(bom: BOM): string {
    const lines = [
      'Smart Wall Configurator - Bill of Materials',
      `Order Reference: ${bom.order_reference}`,
      `Generated: ${new Date(bom.generated_at).toLocaleString()}`,
      '',
      'WALL SPECIFICATIONS',
      `Width: ${bom.wall_dimensions.width_mm}mm`,
      `Height: ${bom.wall_dimensions.height_mm}mm`,
      `Area: ${bom.wall_dimensions.area_m2}m²`,
      '',
      'FINISH',
      `Category: ${bom.finish.category}`,
      `Color: ${bom.finish.color}`,
      `Texture: ${bom.finish.texture || 'None'}`,
      '',
      'ACCESSORIES',
      'Item,Quantity,Unit Price (£),Total Price (£),Description'
    ];

    bom.accessories.forEach(item => {
      lines.push(`"${item.item}",${item.quantity},${item.unit_price_gbp},${item.total_price_gbp},"${item.description || ''}"`);
    });

    lines.push(
      '',
      'PRICING SUMMARY',
      `Base Wall: £${bom.pricing.base_wall_gbp}`,
      `Accessories: £${bom.pricing.accessories_gbp}`,
      `Installation: £${bom.pricing.installation_gbp}`,
      `TOTAL: £${bom.pricing.total_gbp}`
    );

    return lines.join('\n');
  }

  /**
   * Generate HTML for PDF export
   */
  private static generatePDFHTML(config: WallConfig, bom: BOM): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Wall Configuration - ${bom.order_reference}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .section h2 { color: #333; border-bottom: 2px solid #DAA520; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Smart Wall Configuration</h1>
          <p>Order Reference: ${bom.order_reference}</p>
          <p>Generated: ${new Date(bom.generated_at).toLocaleString()}</p>
        </div>

        <div class="section">
          <h2>Wall Specifications</h2>
          <p><strong>Dimensions:</strong> ${bom.wall_dimensions.width_mm}mm × ${bom.wall_dimensions.height_mm}mm</p>
          <p><strong>Area:</strong> ${bom.wall_dimensions.area_m2}m²</p>
          <p><strong>Estimated Modules:</strong> ${bom.modules.estimated_count}</p>
        </div>

        <div class="section">
          <h2>Finish Selection</h2>
          <p><strong>Category:</strong> ${bom.finish.category}</p>
          <p><strong>Color:</strong> ${bom.finish.color}</p>
          ${bom.finish.texture ? `<p><strong>Texture:</strong> ${bom.finish.texture}</p>` : ''}
        </div>

        <div class="section">
          <h2>Accessories & Components</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price (£)</th>
                <th>Total Price (£)</th>
              </tr>
            </thead>
            <tbody>
              ${bom.accessories.map(item => `
                <tr>
                  <td>${item.item}</td>
                  <td>${item.quantity}</td>
                  <td>£${item.unit_price_gbp}</td>
                  <td>£${item.total_price_gbp}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Pricing Summary</h2>
          <table>
            <tr><td>Base Wall (${bom.wall_dimensions.area_m2}m² × £595)</td><td>£${bom.pricing.base_wall_gbp}</td></tr>
            <tr><td>Accessories</td><td>£${bom.pricing.accessories_gbp}</td></tr>
            <tr><td>Installation</td><td>£${bom.pricing.installation_gbp}</td></tr>
            <tr class="total"><td><strong>TOTAL</strong></td><td><strong>£${bom.pricing.total_gbp}</strong></td></tr>
          </table>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get display name for accessory
   */
  private static getAccessoryDisplayName(accessory: string): string {
    const names: Record<string, string> = {
      tv: 'TV Mount & Bracket',
      fire: 'Electric Fireplace Insert',
      gaming: 'Gaming Console Platform',
      speakers: 'Integrated Speakers',
      ledLighting: 'LED Lighting System',
      smartControl: 'Smart Control Panel'
    };
    return names[accessory] || accessory;
  }

  /**
   * Get description for accessory
   */
  private static getAccessoryDescription(accessory: string): string {
    const descriptions: Record<string, string> = {
      tv: 'Professional TV mounting system with cable management',
      fire: 'Electric fireplace with remote control and safety features',
      gaming: 'Dedicated gaming console platform with ventilation',
      speakers: 'High-quality integrated speaker system',
      ledLighting: 'RGB LED lighting with smart controls',
      smartControl: 'Touch control panel for all smart features'
    };
    return descriptions[accessory] || '';
  }
}

