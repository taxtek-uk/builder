import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Lightbulb, ChevronRight, X, Settings, Zap, BookOpen } from 'lucide-react';
import { useUserExperience, ExpertiseLevel } from '../hooks/useUserExperience';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface AdaptiveInterfaceProps {
  currentStep?: string;
  children: React.ReactNode;
}

const CONTEXTUAL_TIPS = {
  beginner: {
    dimensions: "Start with the basic dimensions. Most office walls are 8-10 feet high and 10-20 feet wide.",
    accessories: "Add accessories one at a time. You can always remove them later if needed.",
    finish: "Choose finishes that match your existing decor. Neutral colors work well in most spaces.",
    summary: "Review your configuration carefully. You can go back to any step to make changes."
  },
  intermediate: {
    dimensions: "Consider acoustic requirements when setting dimensions. Larger panels provide better sound absorption.",
    accessories: "Group related accessories together for better functionality and aesthetics.",
    finish: "Mix textures and colors strategically to create visual interest while maintaining cohesion.",
    summary: "Check the technical specifications to ensure compatibility with your installation requirements."
  },
  expert: {
    dimensions: "Optimize panel sizing for minimal waste and maximum acoustic performance.",
    accessories: "Consider load-bearing requirements and electrical integration for advanced accessories.",
    finish: "Specify custom finishes and textures for unique design requirements.",
    summary: "Export technical drawings and specifications for professional installation."
  }
};

const EXPERTISE_DESCRIPTIONS = {
  beginner: "New to wall systems - guided experience with smart defaults",
  intermediate: "Some experience - balanced control with helpful suggestions",
  expert: "Professional user - full control with advanced features"
};

export function AdaptiveInterface({ currentStep = 'dimensions', children }: AdaptiveInterfaceProps) {
  const userExperience = useUserExperience();
  const [showTip, setShowTip] = useState(false);
  const [showExpertiseSelector, setShowExpertiseSelector] = useState(false);
  const interfaceConfig = userExperience.getInterfaceConfig();

  const currentTip = CONTEXTUAL_TIPS[userExperience.expertiseLevel][currentStep as keyof typeof CONTEXTUAL_TIPS.beginner];

  // Auto-show tips for beginners
  useEffect(() => {
    if (userExperience.expertiseLevel === 'beginner' && interfaceConfig.showContextualHelp) {
      const timer = setTimeout(() => setShowTip(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, userExperience.expertiseLevel, interfaceConfig.showContextualHelp]);

  const handleExpertiseLevelChange = (level: ExpertiseLevel) => {
    userExperience.setExpertiseLevel(level);
    userExperience.trackInteraction('change', { type: 'expertise_level', value: level });
    setShowExpertiseSelector(false);
  };

  const handleHelpRequest = () => {
    userExperience.trackInteraction('help');
    setShowTip(true);
  };

  return (
    <TooltipProvider>
      <div className="relative">
        {/* Adaptive Interface Controls */}
        <div className="absolute top-4 right-4 z-50 flex items-center space-x-2">
          {/* Expertise Level Indicator */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExpertiseSelector(!showExpertiseSelector)}
                className="bg-white/90 backdrop-blur-sm"
              >
                <Settings className="w-4 h-4 mr-1" />
                <Badge variant={userExperience.expertiseLevel === 'beginner' ? 'default' : 
                              userExperience.expertiseLevel === 'intermediate' ? 'secondary' : 'destructive'}>
                  {userExperience.expertiseLevel}
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{EXPERTISE_DESCRIPTIONS[userExperience.expertiseLevel]}</p>
            </TooltipContent>
          </Tooltip>

          {/* Contextual Help Button */}
          {interfaceConfig.showContextualHelp && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleHelpRequest}
                  className="bg-white/90 backdrop-blur-sm"
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Get help for this step</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Expertise Level Selector */}
        <AnimatePresence>
          {showExpertiseSelector && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-16 right-4 z-50"
            >
              <Card className="w-80 bg-white/95 backdrop-blur-sm shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    Choose Your Experience Level
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowExpertiseSelector(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(['beginner', 'intermediate', 'expert'] as ExpertiseLevel[]).map((level) => (
                    <Button
                      key={level}
                      variant={userExperience.expertiseLevel === level ? 'default' : 'outline'}
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => handleExpertiseLevelChange(level)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {level === 'beginner' && <BookOpen className="w-4 h-4" />}
                          {level === 'intermediate' && <Settings className="w-4 h-4" />}
                          {level === 'expert' && <Zap className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-medium capitalize">{level}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {EXPERTISE_DESCRIPTIONS[level]}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contextual Tip */}
        <AnimatePresence>
          {showTip && currentTip && interfaceConfig.showContextualHelp && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-20 right-4 z-40"
            >
              <Card className="w-80 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between text-blue-900">
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="w-4 h-4" />
                      <span>Helpful Tip</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTip(false)}
                      className="text-blue-700 hover:text-blue-900"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-800">{currentTip}</p>
                  {userExperience.expertiseLevel === 'beginner' && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExpertiseLevelChange('intermediate')}
                        className="text-xs"
                      >
                        I'm ready for more options
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Indicator for Beginners */}
        {interfaceConfig.showProgressBar && userExperience.expertiseLevel === 'beginner' && (
          <div className="absolute top-4 left-4 z-40">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1">
                    {['dimensions', 'accessories', 'finish', 'summary'].map((step, index) => (
                      <React.Fragment key={step}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          step === currentStep 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        {index < 3 && <ChevronRight className="w-3 h-3 text-gray-400" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content with Adaptive Styling */}
        <div className={`${interfaceConfig.compactMode ? 'space-y-2' : 'space-y-4'}`}>
          {children}
        </div>

        {/* Behavior Pattern Indicator (for debugging/analytics) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute bottom-4 left-4 z-40">
            <Card className="bg-black/80 text-white">
              <CardContent className="p-2">
                <div className="text-xs space-y-1">
                  <div>Pattern: {userExperience.behaviorPattern}</div>
                  <div>Clicks: {userExperience.interactionData.totalClicks}</div>
                  <div>Changes: {userExperience.interactionData.configurationChanges}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}