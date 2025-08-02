import { WallModule } from '../hooks/useWallConfig';

export interface SnapPoint {
  moduleId: string;
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  valid: boolean;
  reason?: string;
}

export interface AccessoryPlacement {
  accessoryId: string;
  moduleId: string;
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  orientation?: 'horizontal' | 'vertical';
}

export class AccessorySnapping {
  private modules: WallModule[];
  private wallWidth: number;
  private sideMargin = 25; // mm

  constructor(modules: WallModule[], wallWidth: number) {
    this.modules = modules;
    this.wallWidth = wallWidth;
  }

  // Get valid snap points for a specific accessory
  getValidSnapPoints(accessoryId: string): SnapPoint[] {
    switch (accessoryId) {
      case 'tv':
        return this.getTVSnapPoints();
      case 'fire':
        return this.getFireSnapPoints();
      case 'gaming':
        return this.getGamingSnapPoints();
      case 'speakers':
        return this.getSpeakerSnapPoints();
      case 'ledLighting':
        return this.getLEDSnapPoints();
      case 'smartControl':
        return this.getSmartControlSnapPoints();
      case 'shelves':
        return this.getShelfSnapPoints();
      default:
        return [];
    }
  }

  // Check if a module can hold a specific accessory
  canModuleHoldAccessory(moduleId: string, accessoryId: string): { valid: boolean; reason?: string } {
    const module = this.modules.find(m => m.id === moduleId);
    if (!module) return { valid: false, reason: 'Module not found' };

    const isEdgeModule = this.isEdgeModule(module);

    switch (accessoryId) {
      case 'tv':
        return {
          valid: module.type === 'tv' || (module.width >= 2000 && this.canCreateTVModule(module)),
          reason: module.type !== 'tv' ? 'TV requires a 2×1000mm TV module' : undefined
        };
      case 'fire':
        return {
          valid: module.type === 'fire' || (module.width >= 2000 && this.canCreateFireModule(module)),
          reason: module.type !== 'fire' ? 'Fire requires a 2×1000mm Fire module' : undefined
        };
      case 'gaming':
        return {
          valid: module.type === 'gaming',
          reason: module.type !== 'gaming' ? 'Gaming console requires a Gaming module with extended base' : undefined
        };
      case 'speakers':
        return {
          valid: isEdgeModule,
          reason: !isEdgeModule ? 'Speakers can only be placed on edge modules' : undefined
        };
      case 'ledLighting':
        return {
          valid: isEdgeModule,
          reason: !isEdgeModule ? 'LED lighting can only be placed on edge or top panels' : undefined
        };
      case 'smartControl':
        return {
          valid: isEdgeModule,
          reason: !isEdgeModule ? 'Smart control panel must be placed on an end module' : undefined
        };
      case 'shelves':
        return { valid: true }; // Shelves can go on any module
      default:
        return { valid: false, reason: 'Unknown accessory type' };
    }
  }

  // Get context-aware tooltip for a module
  getModuleTooltip(moduleId: string): string {
    const module = this.modules.find(m => m.id === moduleId);
    if (!module) return '';

    const capabilities = [];
    const isEdge = this.isEdgeModule(module);

    // Special module types
    if (module.type === 'tv') return `${module.width}mm Module – TV Ready`;
    if (module.type === 'fire') return `${module.width}mm Module – Fire Ready`;
    if (module.type === 'gaming') return `${module.width}mm Module – Gaming Ready`;

    // Standard module capabilities
    if (module.width >= 2000) capabilities.push('TV/Fire Ready');
    if (isEdge) capabilities.push('Speaker Ready', 'LED Ready');
    if (isEdge && this.isRightEdge(module)) capabilities.push('Control Panel Ready');
    capabilities.push('Shelf Compatible');

    return `${module.width}mm Module – ${capabilities.join(', ')}`;
  }

  private getTVSnapPoints(): SnapPoint[] {
    return this.modules
      .filter(module => module.type === 'tv')
      .map(module => ({
        moduleId: module.id,
        position: { x: 0, y: 0.2, z: 0.15 }, // Centered, slightly above middle
        valid: true
      }));
  }

  private getFireSnapPoints(): SnapPoint[] {
    return this.modules
      .filter(module => module.type === 'fire')
      .map(module => ({
        moduleId: module.id,
        position: { x: 0, y: -0.3, z: 0.15 }, // Lower center
        valid: true
      }));
  }

  private getGamingSnapPoints(): SnapPoint[] {
    return this.modules
      .filter(module => module.type === 'gaming')
      .map(module => ({
        moduleId: module.id,
        position: { x: 0, y: -0.3, z: 0.35 }, // On the extended base
        valid: true
      }));
  }

  private getSpeakerSnapPoints(): SnapPoint[] {
    return this.modules
      .filter(module => this.isEdgeModule(module))
      .flatMap(module => [
        {
          moduleId: module.id,
          position: { x: module.width * 0.0003, y: module.height * 0.0003, z: 0.15 }, // Upper right
          valid: true
        },
        {
          moduleId: module.id,
          position: { x: -module.width * 0.0003, y: module.height * 0.0003, z: 0.15 }, // Upper left
          valid: true
        }
      ]);
  }

  private getLEDSnapPoints(): SnapPoint[] {
    return this.modules
      .filter(module => this.isEdgeModule(module))
      .flatMap(module => [
        {
          moduleId: module.id,
          position: { x: 0, y: module.height * 0.0005 - 0.02, z: 0.2 }, // Top edge
          valid: true
        },
        {
          moduleId: module.id,
          position: { x: (module.width * 0.0005) - 0.02, y: 0, z: 0.2 }, // Side edge
          valid: true
        }
      ]);
  }

  private getSmartControlSnapPoints(): SnapPoint[] {
    const rightEdgeModule = this.modules.find(module => this.isRightEdge(module));
    if (!rightEdgeModule) return [];

    return [{
      moduleId: rightEdgeModule.id,
      position: { x: (rightEdgeModule.width * 0.0005) - 0.15, y: 0, z: 0.15 },
      valid: true
    }];
  }

  private getShelfSnapPoints(): SnapPoint[] {
    return this.modules.flatMap(module => [
      {
        moduleId: module.id,
        position: { x: 0, y: module.height * 0.00025, z: 0.2 }, // Horizontal shelf
        valid: true
      },
      {
        moduleId: module.id,
        position: { x: 0, y: 0, z: 0.2 }, // Vertical shelf position
        rotation: { x: 0, y: 0, z: Math.PI / 2 },
        valid: true
      }
    ]);
  }

  private isEdgeModule(module: WallModule): boolean {
    const moduleIndex = this.modules.findIndex(m => m.id === module.id);
    return moduleIndex === 0 || moduleIndex === this.modules.length - 1;
  }

  private isRightEdge(module: WallModule): boolean {
    const moduleIndex = this.modules.findIndex(m => m.id === module.id);
    return moduleIndex === this.modules.length - 1;
  }

  private canCreateTVModule(module: WallModule): boolean {
    return module.width >= 2000; // Needs 2×1000mm
  }

  private canCreateFireModule(module: WallModule): boolean {
    return module.width >= 2000; // Same as TV module
  }

  // Generate placement data for active accessories
  generatePlacements(activeAccessories: Record<string, boolean | number>): AccessoryPlacement[] {
    const placements: AccessoryPlacement[] = [];

    Object.entries(activeAccessories).forEach(([accessoryId, isActive]) => {
      if (!isActive || (typeof isActive === 'number' && isActive === 0)) return;

      const snapPoints = this.getValidSnapPoints(accessoryId);
      if (snapPoints.length > 0) {
        const snapPoint = snapPoints[0]; // Use first valid snap point
        placements.push({
          accessoryId,
          moduleId: snapPoint.moduleId,
          position: snapPoint.position,
          rotation: snapPoint.rotation,
          orientation: accessoryId === 'shelves' ? 'horizontal' : undefined
        });
      }

      // Handle multiple shelves
      if (accessoryId === 'shelves' && typeof isActive === 'number' && isActive > 1) {
        for (let i = 1; i < isActive && i < this.modules.length; i++) {
          const module = this.modules[i];
          placements.push({
            accessoryId: `shelf-${i}`,
            moduleId: module.id,
            position: { x: 0, y: module.height * 0.00025, z: 0.2 },
            orientation: 'horizontal'
          });
        }
      }
    });

    return placements;
  }
}
