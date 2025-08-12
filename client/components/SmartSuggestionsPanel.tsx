import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, Check, Sparkles, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { useUserExperience } from '../hooks/useUserExperience';
import { useSmartDefaults } from '../hooks/useSmartDefaults';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface SmartSuggestionsPanelProps {
  currentStep: string;
  currentConfig: any;
  onApplySuggestion: (suggestion: any) => void;
  isVisible?: boolean;
}

export function SmartSuggestionsPanel({ 
  currentStep, 
  currentConfig, 
  onApplySuggestion,
  isVisible = true 
}: SmartSuggestionsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const userExperience = useUserExperience();
  const smartDefaults = useSmartDefaults();
  const interfaceConfig = userExperience.getInterfaceConfig();

  // Get contextual suggestions for current step
  const suggestions = smartDefaults.getContextualSuggestions(currentStep, currentConfig);
  const useCases = smartDefaults.getUseCases();
  const detectedUseCase = smartDefaults.detectUseCase(currentConfig);

  // Auto-expand for beginners when suggestions are available
  useEffect(() => {
    if (userExperience.expertiseLevel === 'beginner' && suggestions.length > 0 && !isExpanded) {
      const timer = setTimeout(() => setIsExpanded(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [suggestions.length, userExperience.expertiseLevel, isExpanded]);

  const handleApplySuggestion = (suggestion: any) => {
    userExperience.trackInteraction('click', { 
      type: 'suggestion_applied', 
      suggestionId: suggestion.id,
      confidence: suggestion.confidence 
    });
    
    smartDefaults.applySmartDefault(suggestion, onApplySuggestion);
    setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
  };

  const handleApplyUseCase = (useCaseId: string) => {
    userExperience.trackInteraction('click', { 
      type: 'use_case_applied', 
      useCaseId 
    });
    
    smartDefaults.applyUseCase(useCaseId, onApplySuggestion);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Highly Recommended';
    if (confidence >= 0.6) return 'Recommended';
    return 'Suggested';
  };

  if (!isVisible || (!interfaceConfig.enableSmartDefaults && userExperience.expertiseLevel === 'expert')) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 z-30 max-w-sm">
      <AnimatePresence>
        {!isExpanded && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Button
              onClick={() => setIsExpanded(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {suggestions.length} Smart Suggestion{suggestions.length > 1 ? 's' : ''}
            </Button>
          </motion.div>
        )}

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80"
          >
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 ring-1 ring-black/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                    <span>Smart Suggestions</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {detectedUseCase && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    <span>Detected: {detectedUseCase.name}</span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Use Case Quick Apply */}
                {userExperience.expertiseLevel === 'beginner' && detectedUseCase && (
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-green-900 mb-1">Quick Setup</h4>
                        <p className="text-xs text-green-700 mb-2">{detectedUseCase.description}</p>
                        <Button
                          size="sm"
                          onClick={() => handleApplyUseCase(detectedUseCase.id)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs h-7"
                        >
                          Apply {detectedUseCase.name} Setup
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Individual Suggestions */}
                {suggestions.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                      <Clock className="w-3 h-3" />
                      <span>For Current Step</span>
                    </div>
                    
                    {suggestions.slice(0, 3).map((suggestion) => {
                      const isApplied = appliedSuggestions.has(suggestion.id);
                      
                      return (
                        <motion.div
                          key={suggestion.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 rounded-lg border transition-all ${
                            isApplied 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-white border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-sm text-slate-900">
                                  {suggestion.name}
                                </h4>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs px-1.5 py-0.5 ${getConfidenceColor(suggestion.confidence)}`}
                                >
                                  {getConfidenceLabel(suggestion.confidence)}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-600 mb-2">
                                {suggestion.description}
                              </p>
                              <p className="text-xs text-slate-500">
                                {suggestion.reasoning}
                              </p>
                            </div>
                            
                            {!isApplied ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApplySuggestion(suggestion)}
                                className="ml-2 h-7 text-xs"
                              >
                                Apply
                                <ChevronRight className="w-3 h-3 ml-1" />
                              </Button>
                            ) : (
                              <div className="ml-2 w-7 h-7 bg-green-100 rounded flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-600" />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No suggestions for this step</p>
                    <p className="text-xs">Your configuration looks good!</p>
                  </div>
                )}

                {/* Alternative Use Cases */}
                {userExperience.expertiseLevel !== 'beginner' && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                        <TrendingUp className="w-3 h-3" />
                        <span>Popular Setups</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {useCases.slice(0, 4).map((useCase) => (
                          <Button
                            key={useCase.id}
                            variant="outline"
                            size="sm"
                            onClick={() => handleApplyUseCase(useCase.id)}
                            className="h-auto p-2 text-left justify-start"
                          >
                            <div>
                              <div className="font-medium text-xs">{useCase.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {useCase.commonDimensions.width/1000}×{useCase.commonDimensions.height/1000}m
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}