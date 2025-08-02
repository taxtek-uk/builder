import { useState, useMemo } from 'react';

export interface WallModule {
  id: string;
  width: number; // in mm
  height: number; // in mm
  type: 'standard' | 'tv' | 'fire' | 'gaming';
  position: number; // position from left
  accessories: string[];
}

export interface WallConfig {
  width: number; // total wall width in mm
  height: number; // total wall height in mm
  modules: WallModule[];
  finish: {
    category: 'wood' | 'solid' | 'stone' | 'cloth' | 'metal' | 'mirror';
    color: string;
    texture?: string;
  };
  accessories: {
    tv: boolean;
    fire: boolean;
    gaming: boolean;
    speakers: boolean;
    shelves: number;
    ledLighting: boolean;
    smartControl: boolean;
  };
  installation: 'diy' | 'professional';
}

const MODULE_SIZES = [400, 600, 800, 1000, 1100, 1200];
const EDGE_ONLY_SIZES = [400, 600, 800, 1000];
const INFILL_ONLY_SIZES = [1100, 1200];
const SIDE_MARGIN = 25; // mm on each side for cables

// Generate centered layout for special modules (TV, Fire, Gaming) with CAD precision
function generateCenteredLayout(
  specialType: 'tv' | 'fire' | 'gaming',
  specialWidth: number,
  usableWidth: number,
  totalWidth: number,
  height: number,
  sideMargin: number
): WallModule[] {
  const modules: WallModule[] = [];
  let moduleId = 0;

  // Calculate remaining space after centering special module
  const remainingSpace = usableWidth - specialWidth;
  const leftSpace = Math.floor(remainingSpace / 2);
  const rightSpace = remainingSpace - leftSpace; // Right gets extra if odd

  // Check for minimal gaps and auto-adjust
  if (remainingSpace < 100) {
    console.log("Minimal gap detected. Auto-adjusting layout for symmetry.");
    showMinimalGapMessage();
  }

  // Fill left side with precision positioning
  const leftModules = fillSpaceWithPrecision(leftSpace, true, moduleId, sideMargin, height);
  modules.push(...leftModules);
  moduleId += leftModules.length;

  // Calculate exact center position
  const leftTotalWidth = leftModules.reduce((sum, mod) => sum + mod.width, 0);
  const centerPosition = roundToPrecision(sideMargin + leftTotalWidth, 3);

  // Add centered special module
  modules.push({
    id: `module-${moduleId++}`,
    width: specialWidth,
    height: specialType === 'gaming' ? 2100 : height,
    type: specialType,
    position: centerPosition,
    accessories: []
  });

  // Fill right side with precision positioning
  const rightStartPosition = roundToPrecision(centerPosition + specialWidth, 3);
  const rightModules = fillSpaceWithPrecision(rightSpace, false, moduleId, rightStartPosition, height);
  modules.push(...rightModules);

  // Add layout info for tooltips
  const layoutInfo = {
    centerModule: `Center ${specialType.toUpperCase()} Module – ${specialWidth}mm Allocated`,
    leftFill: leftModules.length > 0 ? `Left Fill: ${leftModules.map(m => `${m.width}mm`).join(' + ')}` : 'Left: Empty',
    rightFill: rightModules.length > 0 ? `Right Fill: ${rightModules.map(m => `${m.width}mm`).join(' + ')}` : 'Right: Empty'
  };

  // Store layout info in first module for tooltip access
  if (modules.length > 0) {
    (modules[0] as any).layoutInfo = layoutInfo;
  }

  return modules;
}

// Round to specified decimal places to avoid floating point errors
function roundToPrecision(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// Show minimal gap message
function showMinimalGapMessage() {
  const messageEl = document.createElement('div');
  messageEl.textContent = 'Minimal gap detected. Auto-adjusting layout for symmetry.';
  messageEl.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
  document.body.appendChild(messageEl);

  setTimeout(() => messageEl.style.transform = 'translateX(-50%) translateY(-10px)', 100);
  setTimeout(() => {
    messageEl.style.opacity = '0';
    setTimeout(() => document.body.removeChild(messageEl), 300);
  }, 3000);
}

// Generate standard layout without special centered modules
function generateStandardLayout(
  usableWidth: number,
  totalWidth: number,
  height: number,
  sideMargin: number
): WallModule[] {
  const modules: WallModule[] = [];
  let moduleId = 0;

  const allModules = fillSpaceWithPrecision(usableWidth, true, moduleId, sideMargin, height);
  return allModules;
}

// Fill space with CAD-level precision (no gaps, exact positioning)
function fillSpaceWithPrecision(
  spaceWidth: number,
  isLeftSide: boolean,
  startModuleId: number,
  startPosition: number,
  height: number
): WallModule[] {
  if (spaceWidth <= 0) return [];

  const modules: WallModule[] = [];
  let moduleId = startModuleId;

  // Find optimal module combination with exact fit
  const targetModules = findOptimalModuleCombination(spaceWidth, isLeftSide);

  // Calculate precise positions using cumulative widths
  let currentPosition = roundToPrecision(startPosition, 3);

  for (let i = 0; i < targetModules.length; i++) {
    const moduleWidth = targetModules[i];

    modules.push({
      id: `module-${moduleId++}`,
      width: moduleWidth,
      height: height,
      type: 'standard',
      position: currentPosition,
      accessories: []
    });

    // Calculate next position with precision
    currentPosition = roundToPrecision(currentPosition + moduleWidth, 3);
  }

  return modules;
}

// Find optimal combination of modules to fill space exactly (or as close as possible)
function findOptimalModuleCombination(spaceWidth: number, isLeftSide: boolean): number[] {
  if (spaceWidth <= 0) return [];

  // Available sizes for edge vs middle positions
  const edgeSizes = [400, 600, 800, 1000];
  const allSizes = [400, 600, 800, 1000, 1100, 1200];

  // Try to find exact combinations first
  const combinations = generateModuleCombinations(spaceWidth, isLeftSide ? edgeSizes : allSizes, isLeftSide);

  if (combinations.length > 0) {
    // Return the combination with fewest modules
    return combinations.sort((a, b) => a.length - b.length)[0];
  }

  // If no exact combination, use greedy approach but ensure no gaps
  return greedyFillWithoutGaps(spaceWidth, isLeftSide);
}

// Generate all possible combinations that exactly fill the space
function generateModuleCombinations(targetWidth: number, availableSizes: number[], isLeftSide: boolean): number[][] {
  const results: number[][] = [];

  function backtrack(remaining: number, current: number[], maxModules: number): void {
    if (remaining === 0) {
      // Check edge constraints
      if (isLeftSide && current.length > 0 && !edgeSizes.includes(current[0])) return;
      if (!isLeftSide && current.length > 0 && !edgeSizes.includes(current[current.length - 1])) return;

      results.push([...current]);
      return;
    }

    if (remaining < 0 || current.length >= maxModules) return;

    for (const size of availableSizes) {
      if (size <= remaining) {
        current.push(size);
        backtrack(remaining - size, current, maxModules);
        current.pop();
      }
    }
  }

  backtrack(targetWidth, [], 3); // Max 3 modules per side
  return results;
}

// Greedy fill ensuring no gaps (fill as much as possible)
function greedyFillWithoutGaps(spaceWidth: number, isLeftSide: boolean): number[] {
  const edgeSizes = [400, 600, 800, 1000];
  const allSizes = [400, 600, 800, 1000, 1100, 1200];

  const modules: number[] = [];
  let remaining = spaceWidth;

  while (remaining > 0 && modules.length < 3) {
    // Determine available sizes based on position
    const isEdgePosition = (isLeftSide && modules.length === 0) ||
                          (!isLeftSide && modules.length === 0);

    const availableSizes = isEdgePosition ? edgeSizes : allSizes;

    // Find largest size that fits
    const fittingSize = availableSizes
      .filter(size => size <= remaining)
      .sort((a, b) => b - a)[0];

    if (!fittingSize || fittingSize < 400) break; // Don't create modules smaller than 400mm

    modules.push(fittingSize);
    remaining -= fittingSize;
  }

  return modules;
}

const edgeSizes = [400, 600, 800, 1000];

export function useWallConfig() {
  const [config, setConfig] = useState<WallConfig>({
    width: 3200,
    height: 2400,
    modules: [],
    finish: {
      category: 'solid',
      color: '#2d3748'
    },
    accessories: {
      tv: false,
      fire: false,
      gaming: false,
      speakers: false,
      shelves: 0,
      ledLighting: false,
      smartControl: false
    },
    installation: 'diy'
  });

  // Calculate optimal module configuration with centered special modules
  const optimizedModules = useMemo(() => {
    const usableWidth = config.width - (SIDE_MARGIN * 2);
    const modules: WallModule[] = [];
    let moduleId = 0;

    // Check for special modules that need centering
    const needsCenteredTV = config.accessories.tv;
    const needsCenteredFire = config.accessories.fire;
    const needsCenteredGaming = config.accessories.gaming;

    if (needsCenteredTV && usableWidth >= 2000) {
      // TV Module: Center a 2000mm TV module
      return generateCenteredLayout('tv', 2000, usableWidth, config.width, config.height, SIDE_MARGIN);
    } else if (needsCenteredFire && usableWidth >= 2000) {
      // Fire Module: Center a 2000mm Fire module
      return generateCenteredLayout('fire', 2000, usableWidth, config.width, config.height, SIDE_MARGIN);
    } else if (needsCenteredGaming && usableWidth >= 2000) {
      // Gaming Module: Center a 2000mm Gaming module
      return generateCenteredLayout('gaming', 2000, usableWidth, config.width, config.height, SIDE_MARGIN);
    } else {
      // Standard layout without special centered modules
      return generateStandardLayout(usableWidth, config.width, config.height, SIDE_MARGIN);
    }
  }, [config.width, config.height, config.accessories.tv, config.accessories.fire, config.accessories.gaming]);

  // Calculate pricing
  const pricing = useMemo(() => {
    const areaM2 = (config.width * config.height) / 1000000; // Convert mm�� to m²
    const basePrice = areaM2 * 595; // £595 per m²
    
    let accessoryPrice = 0;
    if (config.accessories.tv) accessoryPrice += 990;
    if (config.accessories.fire) accessoryPrice += 1490;
    if (config.accessories.gaming) accessoryPrice += 600;
    if (config.accessories.speakers) accessoryPrice += 300;
    if (config.accessories.ledLighting) accessoryPrice += 250;
    accessoryPrice += config.accessories.shelves * 250;
    
    const installationPrice = config.installation === 'professional' ? 495 : 0;
    
    return {
      base: basePrice,
      accessories: accessoryPrice,
      installation: installationPrice,
      total: basePrice + accessoryPrice + installationPrice,
      area: areaM2
    };
  }, [config]);

  const updateDimensions = (width: number, height: number) => {
    setConfig(prev => ({ ...prev, width, height }));
  };

  const updateFinish = (finish: Partial<WallConfig['finish']>) => {
    setConfig(prev => ({ 
      ...prev, 
      finish: { ...prev.finish, ...finish }
    }));
  };

  const updateAccessories = (accessories: Partial<WallConfig['accessories']>) => {
    setConfig(prev => ({ 
      ...prev, 
      accessories: { ...prev.accessories, ...accessories }
    }));
  };

  const updateInstallation = (installation: 'diy' | 'professional') => {
    setConfig(prev => ({ ...prev, installation }));
  };

  // Check if custom quote is needed
  const needsCustomQuote = config.width > 6000 || optimizedModules.length > 6;

  return {
    config: { ...config, modules: optimizedModules },
    pricing,
    updateDimensions,
    updateFinish,
    updateAccessories,
    updateInstallation,
    isValidConfiguration: optimizedModules.length > 0 && optimizedModules.length <= 6,
    needsCustomQuote
  };
}
