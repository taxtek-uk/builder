import React, { useState } from 'react';
import { useUserExperience } from '../hooks/useUserExperience';
import { useSmartDefaults } from '../hooks/useSmartDefaults';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export function TestAdaptiveUX() {
  const [testConfig, setTestConfig] = useState({
    width: 3000,
    height: 2400,
    finish: 'default',
    accessories: {}
  });

  const userExperience = useUserExperience();
  const smartDefaults = useSmartDefaults();
  const suggestions = smartDefaults.generateSmartDefaults(testConfig);
  const interfaceConfig = userExperience.getInterfaceConfig();

  const handleTestClick = () => {
    userExperience.trackInteraction('click', { type: 'test_button' });
  };

  const handleApplySuggestion = (suggestion: any) => {
    if (suggestion.category === 'dimensions') {
      setTestConfig(prev => ({ ...prev, ...suggestion.value }));
    } else if (suggestion.category === 'finish') {
      setTestConfig(prev => ({ ...prev, finish: suggestion.value }));
    } else if (suggestion.category === 'accessories') {
      setTestConfig(prev => ({ 
        ...prev, 
        accessories: { ...prev.accessories, ...suggestion.value }
      }));
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Adaptive UX System Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Experience Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Expertise Level</h3>
              <Badge variant="outline" className="mt-2">
                {userExperience.expertiseLevel}
              </Badge>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Behavior Pattern</h3>
              <Badge variant="outline" className="mt-2">
                {userExperience.behaviorPattern}
              </Badge>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">Total Interactions</h3>
              <Badge variant="outline" className="mt-2">
                {userExperience.interactionData.totalClicks}
              </Badge>
            </div>
          </div>

          {/* Interface Configuration */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Interface Configuration</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>Tooltips: {interfaceConfig.showTooltips ? '✅' : '❌'}</div>
              <div>Progress: {interfaceConfig.showProgressBar ? '✅' : '❌'}</div>
              <div>Advanced: {interfaceConfig.showAdvancedSettings ? '✅' : '❌'}</div>
              <div>Smart Defaults: {interfaceConfig.enableSmartDefaults ? '✅' : '❌'}</div>
            </div>
          </div>

          {/* Test Configuration */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-3">Test Configuration</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Width: {testConfig.width}mm</div>
              <div>Height: {testConfig.height}mm</div>
              <div>Finish: {testConfig.finish}</div>
              <div>Accessories: {Object.keys(testConfig.accessories).length}</div>
            </div>
          </div>

          {/* Smart Suggestions */}
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-900 mb-3">Smart Suggestions ({suggestions.length})</h3>
            <div className="space-y-2">
              {suggestions.slice(0, 3).map((suggestion) => (
                <div key={suggestion.id} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div className="flex-1">
                    <div className="font-medium">{suggestion.name}</div>
                    <div className="text-sm text-gray-600">{suggestion.description}</div>
                    <div className="text-xs text-gray-500">Confidence: {Math.round(suggestion.confidence * 100)}%</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleApplySuggestion(suggestion)}
                    className="ml-3"
                  >
                    Apply
                  </Button>
                </div>
              ))}
              {suggestions.length === 0 && (
                <div className="text-gray-500 text-center py-4">No suggestions available</div>
              )}
            </div>
          </div>

          {/* Test Actions */}
          <div className="flex space-x-4">
            <Button onClick={handleTestClick} variant="outline">
              Test Click Tracking
            </Button>
            <Button 
              onClick={() => userExperience.setExpertiseLevel('beginner')}
              variant="outline"
            >
              Set Beginner
            </Button>
            <Button 
              onClick={() => userExperience.setExpertiseLevel('intermediate')}
              variant="outline"
            >
              Set Intermediate
            </Button>
            <Button 
              onClick={() => userExperience.setExpertiseLevel('expert')}
              variant="outline"
            >
              Set Expert
            </Button>
            <Button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              variant="destructive"
            >
              Reset All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}