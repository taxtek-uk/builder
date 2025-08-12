import { 
  MeshStandardMaterial, 
  MeshPhysicalMaterial, 
  TextureLoader, 
  RepeatWrapping,
  Color
} from 'three';

export interface MaterialConfig {
  baseColor: string;
  roughness: number;
  metalness: number;
  normal?: string;
  roughnessMap?: string;
  textureUrl?: string;
  bumpScale?: number;
  envMapIntensity?: number;
}

export class MaterialLibrary {
  private textureLoader = new TextureLoader();
  private materialCache = new Map<string, MeshStandardMaterial>();

  // Material configurations for different finish types
  private materials: Record<string, MaterialConfig> = {
    // Wood Grain Materials
    oak: {
      baseColor: '#DEB887',
      roughness: 0.8,
      metalness: 0.0,
      bumpScale: 0.002,
      envMapIntensity: 0.1
    },
    walnut: {
      baseColor: '#8B4513',
      roughness: 0.7,
      metalness: 0.0,
      bumpScale: 0.003,
      envMapIntensity: 0.15
    },
    
    // Stone Materials
    marble: {
      baseColor: '#f8f9fa',
      roughness: 0.2,
      metalness: 0.0,
      envMapIntensity: 0.3
    },
    granite: {
      baseColor: '#6c757d',
      roughness: 0.4,
      metalness: 0.1,
      envMapIntensity: 0.2
    },
    
    // Metal Materials
    brushedSteel: {
      baseColor: '#8e9aaf',
      roughness: 0.3,
      metalness: 0.9,
      envMapIntensity: 1.0
    },
    blackSteel: {
      baseColor: '#2f3349',
      roughness: 0.2,
      metalness: 0.9,
      envMapIntensity: 0.8
    },
    brass: {
      baseColor: '#b89773',
      roughness: 0.4,
      metalness: 0.8,
      envMapIntensity: 0.9
    },
    
    // Fabric Materials
    linen: {
      baseColor: '#f8f6f0',
      roughness: 0.9,
      metalness: 0.0,
      bumpScale: 0.001,
      envMapIntensity: 0.1
    },
    canvas: {
      baseColor: '#9ca3af',
      roughness: 0.8,
      metalness: 0.0,
      bumpScale: 0.002,
      envMapIntensity: 0.1
    },
    
    // Mirror Materials
    mirror: {
      baseColor: '#ffffff',
      roughness: 0.0,
      metalness: 1.0,
      envMapIntensity: 1.0
    },
    
    // Solid Color Materials (Matte & Gloss)
    mattePaint: {
      baseColor: '#ffffff',
      roughness: 0.9,
      metalness: 0.0,
      envMapIntensity: 0.1
    },
    glossPaint: {
      baseColor: '#ffffff',
      roughness: 0.1,
      metalness: 0.0,
      envMapIntensity: 0.5
    }
  };

  // Create material with PBR properties
  createMaterial(type: string, color?: string, textureUrl?: string): MeshStandardMaterial {
    const cacheKey = `${type}-${color || 'default'}-${textureUrl || 'none'}`;
    
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!;
    }

    const config = this.materials[type] || this.materials.mattePaint;

    // Use Physical material for glossy, metal, mirror and cloth (for sheen)
    const usePhysical = ['glossPaint', 'brushedSteel', 'blackSteel', 'brass', 'mirror', 'linen'].includes(type);
    const material: MeshStandardMaterial = usePhysical
      ? new MeshPhysicalMaterial()
      : new MeshStandardMaterial();

    // Set base properties
    material.color = new Color(color || config.baseColor);
    material.roughness = config.roughness;
    material.metalness = config.metalness;
    material.envMapIntensity = config.envMapIntensity || 0.3;

    // Additional tuning for physical materials
    if (material instanceof MeshPhysicalMaterial) {
      if (type === 'glossPaint') {
        material.clearcoat = 0.7;
        material.clearcoatRoughness = 0.12;
      }
      if (type === 'mirror') {
        material.roughness = 0.02;
        material.metalness = 1.0;
        material.reflectivity = 1.0 as any; // backward compatibility
        material.envMapIntensity = 1.2;
      }
      if (type === 'linen') {
        // Cloth-like sheen
        // @ts-ignore - sheen is available on MeshPhysicalMaterial in three >= r155
        material.sheen = 0.5;
        // @ts-ignore
        material.sheenRoughness = 0.7;
      }
    }

    // Load texture if provided
    if (textureUrl) {
      this.textureLoader.load(textureUrl, (texture) => {
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(2, 2);
        material.map = texture;
        material.needsUpdate = true;
      });
    }

    // Cache and return
    this.materialCache.set(cacheKey, material);
    return material;
  }

  // Get material for finish category and color
  getMaterialForFinish(category: string, color: string, texture?: string): MeshStandardMaterial {
    switch (category) {
      case 'wood':
        return this.createMaterial('oak', color, texture);
      case 'stone':
        return this.createMaterial('marble', color, texture);
      case 'metal':
        return this.createMaterial('brushedSteel', color, texture);
      case 'cloth':
        return this.createMaterial('linen', color, texture);
      case 'mirror':
        return this.createMaterial('mirror', color, texture);
      case 'solid':
      default:
        // Determine if it should be matte or gloss based on color
        const isGlossy = this.isGlossyColor(color);
        const type = isGlossy ? 'glossPaint' : 'mattePaint';
        return this.createMaterial(type, color, texture);
    }
  }

  // Special material for LED lighting effects
  createLEDMaterial(color: string = '#60a5fa'): MeshStandardMaterial {
    const material = new MeshStandardMaterial({
      color: new Color(color),
      emissive: new Color(color),
      emissiveIntensity: 0.5,
      roughness: 0.1,
      metalness: 0.0
    });
    return material;
  }

  // Gaming console material
  createConsoleMaterial(): MeshStandardMaterial {
    return new MeshStandardMaterial({
      color: new Color('#000000'),
      roughness: 0.1,
      metalness: 0.8,
      envMapIntensity: 0.9
    });
  }

  // TV screen material
  createTVMaterial(): MeshStandardMaterial {
    return new MeshStandardMaterial({
      color: new Color('#1f2937'),
      roughness: 0.05,
      metalness: 0.1,
      envMapIntensity: 0.8
    });
  }

  // Fireplace material with emissive glow
  createFireMaterial(): MeshStandardMaterial {
    return new MeshStandardMaterial({
      color: new Color('#dc2626'),
      emissive: new Color('#dc2626'),
      emissiveIntensity: 0.3,
      roughness: 0.7,
      metalness: 0.0
    });
  }

  // Determine if color should be glossy
  private isGlossyColor(color: string): boolean {
    const c = new Color(color);
    const lightness = (c.r + c.g + c.b) / 3;
    return lightness > 0.8 || color.toLowerCase().includes('white');
  }

  // Clear cache
  clearCache(): void {
    this.materialCache.clear();
  }
}

export const materialLibrary = new MaterialLibrary();
