import { useCallback, useMemo } from 'react';
import { useUserExperience } from './useUserExperience';

interface SmartDefault {
  id: string;
  name: string;
  description: string;
  confidence: number; // 0-1 scale
  reasoning: string;
  category: 'dimensions' | 'finish' | 'accessories' | 'layout';
  value: any;
}

interface UseCase {
  id: string;
  name: string;
  description: string;
  commonDimensions: { width: number; height: number };
  recommendedFinishes: string[];
  essentialAccessories: string[];
  optionalAccessories: string[];
}

const USE_CASES: UseCase[] = [
  {
    id: 'office_meeting_room',
    name: 'Office Meeting Room',
    description: 'Professional meeting space with acoustic requirements',
    commonDimensions: { width: 4000, height: 2700 },
    recommendedFinishes: ['acoustic_fabric_gray', 'acoustic_fabric_navy', 'wood_veneer_oak'],
    essentialAccessories: ['power_outlet', 'data_port'],
    optionalAccessories: ['led_strip', 'whiteboard_panel', 'acoustic_panel']
  },
  {
    id: 'office_open_plan',
    name: 'Open Plan Office',
    description: 'Collaborative workspace with privacy needs',
    commonDimensions: { width: 6000, height: 2700 },
    recommendedFinishes: ['fabric_light_gray', 'fabric_warm_white', 'acoustic_felt_charcoal'],
    essentialAccessories: ['acoustic_panel'],
    optionalAccessories: ['power_outlet', 'led_strip', 'plant_holder']
  },
  {
    id: 'home_office',
    name: 'Home Office',
    description: 'Personal workspace with style focus',
    commonDimensions: { width: 3000, height: 2400 },
    recommendedFinishes: ['wood_veneer_walnut', 'fabric_warm_beige', 'painted_white'],
    essentialAccessories: ['power_outlet'],
    optionalAccessories: ['led_strip', 'shelf', 'plant_holder']
  },
  {
    id: 'reception_area',
    name: 'Reception Area',
    description: 'Welcoming entrance with brand focus',
    commonDimensions: { width: 5000, height: 3000 },
    recommendedFinishes: ['wood_veneer_oak', 'painted_corporate', 'fabric_premium'],
    essentialAccessories: ['led_strip'],
    optionalAccessories: ['logo_panel', 'plant_holder', 'display_mount']
  },
  {
    id: 'conference_room',
    name: 'Conference Room',
    description: 'Large meeting space with AV requirements',
    commonDimensions: { width: 8000, height: 2700 },
    recommendedFinishes: ['acoustic_fabric_charcoal', 'wood_veneer_dark', 'fabric_executive'],
    essentialAccessories: ['power_outlet', 'data_port', 'acoustic_panel'],
    optionalAccessories: ['display_mount', 'led_strip', 'whiteboard_panel']
  }
];

export function useSmartDefaults() {
  const userExperience = useUserExperience();

  // Detect likely use case based on user behavior and selections
  const detectUseCase = useCallback((currentConfig: any): UseCase | null => {
    if (!currentConfig) return USE_CASES[0]; // Default to office meeting room

    const { width, height } = currentConfig;
    
    // Simple heuristic based on dimensions
    if (width <= 3500 && height <= 2500) {
      return USE_CASES.find(uc => uc.id === 'home_office') || USE_CASES[0];
    } else if (width >= 7000) {
      return USE_CASES.find(uc => uc.id === 'conference_room') || USE_CASES[0];
    } else if (width >= 5000 && height >= 2800) {
      return USE_CASES.find(uc => uc.id === 'reception_area') || USE_CASES[0];
    } else if (width >= 5000) {
      return USE_CASES.find(uc => uc.id === 'office_open_plan') || USE_CASES[0];
    }
    
    return USE_CASES[0]; // Default
  }, []);

  // Generate smart defaults based on current configuration and user behavior
  const generateSmartDefaults = useCallback((currentConfig: any): SmartDefault[] => {
    const defaults: SmartDefault[] = [];
    const detectedUseCase = detectUseCase(currentConfig);
    
    if (!detectedUseCase) return defaults;

    // Dimension defaults
    if (!currentConfig?.width || !currentConfig?.height) {
      defaults.push({
        id: 'dimensions_smart',
        name: 'Optimal Dimensions',
        description: `${detectedUseCase.commonDimensions.width}mm × ${detectedUseCase.commonDimensions.height}mm`,
        confidence: 0.8,
        reasoning: `Based on typical ${detectedUseCase.name.toLowerCase()} requirements`,
        category: 'dimensions',
        value: detectedUseCase.commonDimensions
      });
    }

    // Finish defaults
    if (!currentConfig?.finish || currentConfig.finish === 'default') {
      const recommendedFinish = detectedUseCase.recommendedFinishes[0];
      defaults.push({
        id: 'finish_smart',
        name: 'Recommended Finish',
        description: getFinishDisplayName(recommendedFinish),
        confidence: 0.7,
        reasoning: `Popular choice for ${detectedUseCase.name.toLowerCase()}`,
        category: 'finish',
        value: recommendedFinish
      });
    }

    // Essential accessories
    detectedUseCase.essentialAccessories.forEach((accessory, index) => {
      if (!currentConfig?.accessories?.[accessory]) {
        defaults.push({
          id: `accessory_essential_${accessory}`,
          name: 'Essential Accessory',
          description: getAccessoryDisplayName(accessory),
          confidence: 0.9,
          reasoning: `Essential for ${detectedUseCase.name.toLowerCase()} functionality`,
          category: 'accessories',
          value: { [accessory]: true }
        });
      }
    });

    // Optional accessories based on user expertise
    if (userExperience.expertiseLevel !== 'beginner') {
      detectedUseCase.optionalAccessories.slice(0, 2).forEach((accessory) => {
        if (!currentConfig?.accessories?.[accessory]) {
          defaults.push({
            id: `accessory_optional_${accessory}`,
            name: 'Suggested Enhancement',
            description: getAccessoryDisplayName(accessory),
            confidence: 0.5,
            reasoning: `Commonly added to ${detectedUseCase.name.toLowerCase()}`,
            category: 'accessories',
            value: { [accessory]: true }
          });
        }
      });
    }

    return defaults.sort((a, b) => b.confidence - a.confidence);
  }, [detectUseCase, userExperience.expertiseLevel]);

  // Get contextual suggestions based on current step
  const getContextualSuggestions = useCallback((step: string, currentConfig: any): SmartDefault[] => {
    const allDefaults = generateSmartDefaults(currentConfig);
    return allDefaults.filter(def => def.category === step);
  }, [generateSmartDefaults]);

  // Apply a smart default to configuration
  const applySmartDefault = useCallback((defaultItem: SmartDefault, updateConfig: (updates: any) => void) => {
    userExperience.trackInteraction('click', { 
      type: 'smart_default_applied', 
      defaultId: defaultItem.id,
      category: defaultItem.category 
    });

    switch (defaultItem.category) {
      case 'dimensions':
        updateConfig({
          width: defaultItem.value.width,
          height: defaultItem.value.height
        });
        break;
      case 'finish':
        updateConfig({ finish: defaultItem.value });
        break;
      case 'accessories':
        updateConfig({ accessories: { ...currentConfig?.accessories, ...defaultItem.value } });
        break;
    }
  }, [userExperience]);

  // Get all available use cases for manual selection
  const getUseCases = useCallback(() => USE_CASES, []);

  // Apply a complete use case configuration
  const applyUseCase = useCallback((useCaseId: string, updateConfig: (updates: any) => void) => {
    const useCase = USE_CASES.find(uc => uc.id === useCaseId);
    if (!useCase) return;

    userExperience.trackInteraction('click', { 
      type: 'use_case_applied', 
      useCaseId 
    });

    const accessories: Record<string, boolean> = {};
    [...useCase.essentialAccessories, ...useCase.optionalAccessories.slice(0, 2)].forEach(acc => {
      accessories[acc] = true;
    });

    updateConfig({
      width: useCase.commonDimensions.width,
      height: useCase.commonDimensions.height,
      finish: useCase.recommendedFinishes[0],
      accessories
    });
  }, [userExperience]);

  return {
    generateSmartDefaults,
    getContextualSuggestions,
    applySmartDefault,
    getUseCases,
    applyUseCase,
    detectUseCase
  };
}

// Helper functions for display names
function getFinishDisplayName(finishId: string): string {
  const finishNames: Record<string, string> = {
    'acoustic_fabric_gray': 'Acoustic Fabric - Gray',
    'acoustic_fabric_navy': 'Acoustic Fabric - Navy',
    'wood_veneer_oak': 'Wood Veneer - Oak',
    'fabric_light_gray': 'Fabric - Light Gray',
    'fabric_warm_white': 'Fabric - Warm White',
    'acoustic_felt_charcoal': 'Acoustic Felt - Charcoal',
    'wood_veneer_walnut': 'Wood Veneer - Walnut',
    'fabric_warm_beige': 'Fabric - Warm Beige',
    'painted_white': 'Painted - White',
    'painted_corporate': 'Painted - Corporate',
    'fabric_premium': 'Fabric - Premium',
    'acoustic_fabric_charcoal': 'Acoustic Fabric - Charcoal',
    'wood_veneer_dark': 'Wood Veneer - Dark',
    'fabric_executive': 'Fabric - Executive'
  };
  return finishNames[finishId] || finishId;
}

function getAccessoryDisplayName(accessoryId: string): string {
  const accessoryNames: Record<string, string> = {
    'power_outlet': 'Power Outlet',
    'data_port': 'Data Port',
    'led_strip': 'LED Strip Lighting',
    'whiteboard_panel': 'Whiteboard Panel',
    'acoustic_panel': 'Acoustic Panel',
    'plant_holder': 'Plant Holder',
    'shelf': 'Shelf',
    'logo_panel': 'Logo Panel',
    'display_mount': 'Display Mount'
  };
  return accessoryNames[accessoryId] || accessoryId;
}