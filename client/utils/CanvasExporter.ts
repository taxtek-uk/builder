import { WebGLRenderer, Scene, Camera, Vector2 } from 'three';

export interface ExportOptions {
  format: 'png' | 'jpg' | 'webp';
  quality: number;
  width: number;
  height: number;
  fileName?: string;
}

export class CanvasExporter {
  private renderer: WebGLRenderer;
  private scene: Scene;
  private camera: Camera;

  constructor(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
  }

  // Export high-resolution screenshot
  async exportScreenshot(options: ExportOptions): Promise<string> {
    const { format, quality, width, height, fileName } = options;

    // Store original size
    const originalSize = this.renderer.getSize(new Vector2());
    const originalPixelRatio = this.renderer.getPixelRatio();

    try {
      // Set high resolution
      this.renderer.setSize(width, height, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Render scene
      this.renderer.render(this.scene, this.camera);

      // Get canvas data
      const canvas = this.renderer.domElement;
      const dataURL = canvas.toDataURL(`image/${format}`, quality);

      // Download if filename provided
      if (fileName) {
        this.downloadImage(dataURL, `${fileName}.${format}`);
      }

      return dataURL;
    } finally {
      // Restore original size
      this.renderer.setSize(originalSize.x, originalSize.y, false);
      this.renderer.setPixelRatio(originalPixelRatio);
    }
  }

  // Generate PDF layout summary
  async exportPDFSummary(wallConfig: any): Promise<void> {
    // This would integrate with a PDF library like jsPDF
    // For now, we'll create a structured data export
    const summary = {
      wallDimensions: {
        width: wallConfig.width,
        height: wallConfig.height,
        area: (wallConfig.width * wallConfig.height) / 1000000 // m²
      },
      modules: wallConfig.modules.map((module: any) => ({
        id: module.id,
        width: module.width,
        height: module.height,
        type: module.type,
        position: module.position
      })),
      finish: wallConfig.finish,
      accessories: wallConfig.accessories,
      exportDate: new Date().toISOString()
    };

    // Download as JSON for now (can be enhanced with actual PDF generation)
    const dataStr = JSON.stringify(summary, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wall-configuration-summary.json';
    link.click();
    
    URL.revokeObjectURL(url);
  }

  // Export for 3D viewers (GLB format would require additional libraries)
  async exportGLB(): Promise<void> {
    console.log('GLB export would require GLTFExporter from three.js examples');
    // Implementation would use GLTFExporter
    // This is a placeholder for future enhancement
  }

  private downloadImage(dataURL: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Quick export presets
  static getExportPresets(): Record<string, ExportOptions> {
    return {
      preview: {
        format: 'png',
        quality: 0.8,
        width: 1200,
        height: 800,
        fileName: 'wall-preview'
      },
      highRes: {
        format: 'png',
        quality: 1.0,
        width: 2400,
        height: 1600,
        fileName: 'wall-high-resolution'
      },
      print: {
        format: 'jpg',
        quality: 0.95,
        width: 3000,
        height: 2000,
        fileName: 'wall-print-quality'
      },
      social: {
        format: 'jpg',
        quality: 0.85,
        width: 1080,
        height: 1080,
        fileName: 'wall-social-media'
      }
    };
  }
}
