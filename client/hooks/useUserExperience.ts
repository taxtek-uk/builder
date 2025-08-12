import { useState, useEffect, useCallback } from 'react';

export type ExpertiseLevel = 'beginner' | 'intermediate' | 'expert';
export type UserBehaviorPattern = 'hesitant_explorer' | 'expert_configurator' | 'mobile_browser' | 'quick_decision_maker';

interface UserInteractionData {
  sessionStartTime: number;
  totalClicks: number;
  hoverDuration: number;
  configurationChanges: number;
  timeSpentOnSteps: Record<string, number>;
  errorCount: number;
  helpRequestCount: number;
  undoRedoCount: number;
  mobileDevice: boolean;
}

interface UserExperienceState {
  expertiseLevel: ExpertiseLevel;
  behaviorPattern: UserBehaviorPattern;
  showAdvancedOptions: boolean;
  enableGuidedMode: boolean;
  preferredComplexity: 'simple' | 'detailed' | 'full';
  adaptiveHelpEnabled: boolean;
  interactionData: UserInteractionData;
}

const STORAGE_KEY = 'wall-configurator-ux-state';
const EXPERTISE_THRESHOLDS = {
  beginner: { maxClicks: 50, maxTime: 300000, maxChanges: 10 }, // 5 minutes
  intermediate: { maxClicks: 100, maxTime: 600000, maxChanges: 25 }, // 10 minutes
  expert: { maxClicks: Infinity, maxTime: Infinity, maxChanges: Infinity }
};

export function useUserExperience() {
  const [state, setState] = useState<UserExperienceState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const defaultState: UserExperienceState = {
      expertiseLevel: 'beginner',
      behaviorPattern: 'hesitant_explorer',
      showAdvancedOptions: false,
      enableGuidedMode: true,
      preferredComplexity: 'simple',
      adaptiveHelpEnabled: true,
      interactionData: {
        sessionStartTime: Date.now(),
        totalClicks: 0,
        hoverDuration: 0,
        configurationChanges: 0,
        timeSpentOnSteps: {},
        errorCount: 0,
        helpRequestCount: 0,
        undoRedoCount: 0,
        mobileDevice: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      }
    };
    
    return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
  });

  // Auto-detect expertise level based on interaction patterns
  const analyzeUserBehavior = useCallback(() => {
    const { interactionData } = state;
    const sessionDuration = Date.now() - interactionData.sessionStartTime;
    
    // Determine expertise level
    let newExpertiseLevel: ExpertiseLevel = 'beginner';
    if (interactionData.totalClicks > EXPERTISE_THRESHOLDS.intermediate.maxClicks ||
        sessionDuration > EXPERTISE_THRESHOLDS.intermediate.maxTime ||
        interactionData.configurationChanges > EXPERTISE_THRESHOLDS.intermediate.maxChanges) {
      newExpertiseLevel = 'expert';
    } else if (interactionData.totalClicks > EXPERTISE_THRESHOLDS.beginner.maxClicks ||
               sessionDuration > EXPERTISE_THRESHOLDS.beginner.maxTime ||
               interactionData.configurationChanges > EXPERTISE_THRESHOLDS.beginner.maxChanges) {
      newExpertiseLevel = 'intermediate';
    }

    // Determine behavior pattern
    let newBehaviorPattern: UserBehaviorPattern = 'hesitant_explorer';
    if (interactionData.mobileDevice) {
      newBehaviorPattern = 'mobile_browser';
    } else if (interactionData.totalClicks > 100 && interactionData.errorCount < 3) {
      newBehaviorPattern = 'expert_configurator';
    } else if (sessionDuration < 60000 && interactionData.configurationChanges > 5) {
      newBehaviorPattern = 'quick_decision_maker';
    }

    // Update state if patterns have changed
    if (newExpertiseLevel !== state.expertiseLevel || newBehaviorPattern !== state.behaviorPattern) {
      setState(prev => ({
        ...prev,
        expertiseLevel: newExpertiseLevel,
        behaviorPattern: newBehaviorPattern,
        showAdvancedOptions: newExpertiseLevel !== 'beginner',
        enableGuidedMode: newExpertiseLevel === 'beginner' || newBehaviorPattern === 'hesitant_explorer',
        preferredComplexity: newExpertiseLevel === 'beginner' ? 'simple' : 
                           newExpertiseLevel === 'intermediate' ? 'detailed' : 'full'
      }));
    }
  }, [state]);

  // Track user interactions
  const trackInteraction = useCallback((type: 'click' | 'hover' | 'change' | 'error' | 'help' | 'undo', data?: any) => {
    setState(prev => {
      const newInteractionData = { ...prev.interactionData };
      
      switch (type) {
        case 'click':
          newInteractionData.totalClicks++;
          break;
        case 'hover':
          newInteractionData.hoverDuration += data?.duration || 0;
          break;
        case 'change':
          newInteractionData.configurationChanges++;
          break;
        case 'error':
          newInteractionData.errorCount++;
          break;
        case 'help':
          newInteractionData.helpRequestCount++;
          break;
        case 'undo':
          newInteractionData.undoRedoCount++;
          break;
      }
      
      return {
        ...prev,
        interactionData: newInteractionData
      };
    });
  }, []);

  // Manual expertise level override
  const setExpertiseLevel = useCallback((level: ExpertiseLevel) => {
    setState(prev => ({
      ...prev,
      expertiseLevel: level,
      showAdvancedOptions: level !== 'beginner',
      enableGuidedMode: level === 'beginner',
      preferredComplexity: level === 'beginner' ? 'simple' : 
                         level === 'intermediate' ? 'detailed' : 'full'
    }));
  }, []);

  // Get interface configuration based on current state
  const getInterfaceConfig = useCallback(() => {
    const { expertiseLevel, behaviorPattern, preferredComplexity } = state;
    
    return {
      // Navigation complexity
      showStepNumbers: expertiseLevel === 'beginner',
      showProgressBar: expertiseLevel !== 'expert',
      enableBulkOperations: expertiseLevel === 'expert',
      
      // Information density
      showTooltips: expertiseLevel === 'beginner' || behaviorPattern === 'hesitant_explorer',
      showAdvancedSettings: expertiseLevel !== 'beginner',
      compactMode: expertiseLevel === 'expert' && !state.interactionData.mobileDevice,
      
      // Interaction patterns
      enableGestures: behaviorPattern === 'mobile_browser',
      showConfirmations: expertiseLevel === 'beginner',
      enableKeyboardShortcuts: expertiseLevel === 'expert',
      
      // Help and guidance
      showContextualHelp: state.adaptiveHelpEnabled && expertiseLevel !== 'expert',
      enableSmartDefaults: expertiseLevel === 'beginner',
      showExpertTips: expertiseLevel === 'expert',
      
      // Visual complexity
      animationLevel: behaviorPattern === 'quick_decision_maker' ? 'minimal' : 'full',
      informationDensity: preferredComplexity,
      showPreviewUpdates: expertiseLevel !== 'beginner' || behaviorPattern !== 'hesitant_explorer'
    };
  }, [state]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Periodic behavior analysis
  useEffect(() => {
    const interval = setInterval(analyzeUserBehavior, 30000); // Analyze every 30 seconds
    return () => clearInterval(interval);
  }, [analyzeUserBehavior]);

  return {
    ...state,
    trackInteraction,
    setExpertiseLevel,
    getInterfaceConfig,
    analyzeUserBehavior
  };
}