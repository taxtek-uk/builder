import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { useUserExperience } from '../hooks/useUserExperience';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

interface LoadingState {
  id: string;
  type: 'configuration' | 'preview' | 'export' | 'save';
  message: string;
  progress?: number;
  isOptimistic?: boolean;
}

interface OptimisticUpdate {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  confirmed: boolean;
}

export function PerformanceOptimizer({ children }: PerformanceOptimizerProps) {
  const [loadingStates, setLoadingStates] = useState<LoadingState[]>([]);
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    averageResponseTime: 0,
    successRate: 100,
    optimisticHitRate: 95
  });
  const userExperience = useUserExperience();

  // Simulate optimistic UI updates
  const addOptimisticUpdate = useCallback((type: string, data: any) => {
    const update: OptimisticUpdate = {
      id: `optimistic_${Date.now()}`,
      type,
      data,
      timestamp: Date.now(),
      confirmed: false
    };

    setOptimisticUpdates(prev => [...prev, update]);

    // Simulate confirmation after a delay
    setTimeout(() => {
      setOptimisticUpdates(prev => 
        prev.map(u => u.id === update.id ? { ...u, confirmed: true } : u)
      );
      
      // Remove confirmed updates after animation
      setTimeout(() => {
        setOptimisticUpdates(prev => prev.filter(u => u.id !== update.id));
      }, 1000);
    }, Math.random() * 500 + 200); // 200-700ms delay
  }, []);

  // Add loading state
  const addLoadingState = useCallback((type: LoadingState['type'], message: string, isOptimistic = false) => {
    const loadingState: LoadingState = {
      id: `loading_${Date.now()}`,
      type,
      message,
      progress: 0,
      isOptimistic
    };

    setLoadingStates(prev => [...prev, loadingState]);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setLoadingStates(prev => 
        prev.map(state => 
          state.id === loadingState.id 
            ? { ...state, progress: Math.min((state.progress || 0) + Math.random() * 20, 95) }
            : state
        )
      );
    }, 100);

    // Complete loading
    setTimeout(() => {
      clearInterval(progressInterval);
      setLoadingStates(prev => 
        prev.map(state => 
          state.id === loadingState.id 
            ? { ...state, progress: 100 }
            : state
        )
      );

      // Remove completed loading state
      setTimeout(() => {
        setLoadingStates(prev => prev.filter(state => state.id !== loadingState.id));
      }, 500);
    }, isOptimistic ? 300 : Math.random() * 1000 + 500);

    return loadingState.id;
  }, []);

  // Strategic loading sequence for psychological momentum
  const createLoadingSequence = useCallback((steps: Array<{ message: string; duration: number }>) => {
    let delay = 0;
    steps.forEach((step, index) => {
      setTimeout(() => {
        addLoadingState('configuration', step.message, true);
      }, delay);
      delay += step.duration;
    });
  }, [addLoadingState]);

  // Preload likely next actions based on user behavior
  useEffect(() => {
    const { behaviorPattern, expertiseLevel } = userExperience;
    
    if (behaviorPattern === 'quick_decision_maker') {
      // Preload export functionality
      setTimeout(() => {
        console.log('Preloading export functionality for quick decision maker');
      }, 2000);
    } else if (expertiseLevel === 'beginner') {
      // Preload help content
      setTimeout(() => {
        console.log('Preloading help content for beginner');
      }, 1000);
    }
  }, [userExperience]);

  // Performance monitoring
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      setPerformanceMetrics(prev => ({
        ...prev,
        averageResponseTime: (prev.averageResponseTime + responseTime) / 2
      }));
    };
  }, []);

  // Provide performance context to children
  const performanceContext = {
    addOptimisticUpdate,
    addLoadingState,
    createLoadingSequence,
    metrics: performanceMetrics
  };

  return (
    <div className="relative">
      {/* Performance Context Provider */}
      <PerformanceContext.Provider value={performanceContext}>
        {children}
      </PerformanceContext.Provider>

      {/* Loading States Overlay */}
      <AnimatePresence>
        {loadingStates.map((state) => (
          <motion.div
            key={state.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-64 border">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  {state.isOptimistic && (
                    <Zap className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{state.message}</p>
                  {state.progress !== undefined && (
                    <div className="mt-2">
                      <div className="bg-gray-200 rounded-full h-1.5">
                        <motion.div
                          className="bg-blue-500 h-1.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${state.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Optimistic Updates Feedback */}
      <AnimatePresence>
        {optimisticUpdates.map((update) => (
          <motion.div
            key={update.id}
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="fixed top-20 right-4 z-40"
          >
            <div className={`rounded-lg p-3 shadow-lg border ${
              update.confirmed 
                ? 'bg-green-50 border-green-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center space-x-2">
                {update.confirmed ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                )}
                <span className={`text-sm font-medium ${
                  update.confirmed ? 'text-green-800' : 'text-blue-800'
                }`}>
                  {update.confirmed ? 'Updated!' : 'Updating...'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Performance Metrics (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 z-50 bg-black/80 text-white p-2 rounded text-xs">
          <div>Avg Response: {performanceMetrics.averageResponseTime.toFixed(0)}ms</div>
          <div>Success Rate: {performanceMetrics.successRate}%</div>
          <div>Optimistic Hit: {performanceMetrics.optimisticHitRate}%</div>
        </div>
      )}
    </div>
  );
}

// Performance Context
const PerformanceContext = React.createContext<{
  addOptimisticUpdate: (type: string, data: any) => void;
  addLoadingState: (type: LoadingState['type'], message: string, isOptimistic?: boolean) => string;
  createLoadingSequence: (steps: Array<{ message: string; duration: number }>) => void;
  metrics: any;
} | null>(null);

export const usePerformanceOptimizer = () => {
  const context = React.useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceOptimizer must be used within PerformanceOptimizer');
  }
  return context;
};

// Higher-order component for optimistic updates
export function withOptimisticUpdates<T extends object>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return function OptimisticComponent(props: T) {
    const performance = usePerformanceOptimizer();
    
    const optimisticProps = {
      ...props,
      onOptimisticUpdate: (type: string, data: any) => {
        performance.addOptimisticUpdate(type, data);
      }
    };

    return <Component {...optimisticProps} />;
  };
}