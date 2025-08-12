import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, CheckCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { useUserExperience } from '../hooks/useUserExperience';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  tip: string;
  targetElement?: string;
  action?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Smart Wall Builder',
    description: 'Let\'s create your perfect wall configuration in just a few simple steps.',
    tip: 'This guided tour will help you understand all the features available.',
    action: 'Get Started'
  },
  {
    id: 'dimensions',
    title: 'Set Your Wall Dimensions',
    description: 'Start by defining the size of your wall. You can adjust width and height to match your space.',
    tip: 'Most office walls are between 8-12 feet high and 10-20 feet wide.',
    targetElement: '[data-panel="dimensions"]',
    action: 'Set Dimensions'
  },
  {
    id: 'finish',
    title: 'Choose Your Finish',
    description: 'Select colors and textures that match your space and style preferences.',
    tip: 'Neutral colors work well in most environments and are easier to match with existing decor.',
    targetElement: '[data-panel="finish"]',
    action: 'Pick Finish'
  },
  {
    id: 'accessories',
    title: 'Add Smart Features',
    description: 'Enhance your wall with accessories like lighting, power outlets, or acoustic panels.',
    tip: 'You can always add or remove accessories later, so don\'t worry about getting it perfect now.',
    targetElement: '[data-panel="accessories"]',
    action: 'Add Features'
  },
  {
    id: 'preview',
    title: 'Preview Your Design',
    description: 'Use the 3D preview to see how your wall will look. You can rotate and zoom to get different angles.',
    tip: 'Try switching between different environment modes to see how your wall looks in various settings.',
    targetElement: '.canvas-container',
    action: 'Explore Preview'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Your wall configuration is ready. You can continue making adjustments or proceed to get a quote.',
    tip: 'Remember, you can always come back and modify your design at any time.',
    action: 'Finish Tour'
  }
];

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onStepChange?: (stepId: string) => void;
}

export function OnboardingFlow({ isOpen, onClose, onStepChange }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const userExperience = useUserExperience();

  useEffect(() => {
    if (isOpen && onStepChange) {
      onStepChange(ONBOARDING_STEPS[currentStep].id);
    }
  }, [currentStep, isOpen, onStepChange]);

  const handleNext = () => {
    userExperience.trackInteraction('click', { type: 'onboarding_next', step: currentStep });
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
      // Mark user as intermediate after completing onboarding
      userExperience.setExpertiseLevel('intermediate');
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const handlePrevious = () => {
    userExperience.trackInteraction('click', { type: 'onboarding_previous', step: currentStep });
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    userExperience.trackInteraction('click', { type: 'onboarding_skip', step: currentStep });
    onClose();
  };

  const handleStepClick = (stepIndex: number) => {
    userExperience.trackInteraction('click', { type: 'onboarding_jump', from: currentStep, to: stepIndex });
    setCurrentStep(stepIndex);
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl"
        >
          <Card className="bg-white shadow-2xl">
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex space-x-1">
                  {ONBOARDING_STEPS.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(index)}
                      className={`flex-1 h-2 rounded-full transition-colors ${
                        index <= currentStep
                          ? 'bg-blue-500'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  {ONBOARDING_STEPS.map((step, index) => (
                    <span
                      key={step.id}
                      className={`${index <= currentStep ? 'text-blue-600 font-medium' : ''}`}
                    >
                      {step.id}
                    </span>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted ? (
                    <div className="text-center py-8">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-green-800 mb-2">
                        Congratulations!
                      </h3>
                      <p className="text-muted-foreground">
                        You've completed the onboarding tour. You're now ready to create amazing wall configurations!
                      </p>
                      <Badge variant="secondary" className="mt-3">
                        Experience Level: Intermediate
                      </Badge>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <p className="text-lg leading-relaxed">
                          {currentStepData.description}
                        </p>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-blue-900 mb-1">Pro Tip</h4>
                              <p className="text-sm text-blue-800">{currentStepData.tip}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <Button
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={currentStep === 0}
                          className="flex items-center space-x-2"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </Button>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            onClick={handleSkip}
                            className="text-muted-foreground"
                          >
                            Skip Tour
                          </Button>
                          <Button
                            onClick={handleNext}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                          >
                            <span>{currentStepData.action || 'Next'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}