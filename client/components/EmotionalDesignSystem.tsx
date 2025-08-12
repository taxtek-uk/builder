import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Sparkles, Heart, Star, CheckCircle, Zap, Trophy, Target } from 'lucide-react';
import { useUserExperience } from '../hooks/useUserExperience';

interface EmotionalDesignSystemProps {
  children: React.ReactNode;
}

interface Celebration {
  id: string;
  type: 'success' | 'milestone' | 'achievement' | 'completion';
  message: string;
  icon: React.ComponentType<any>;
  color: string;
  duration: number;
}

interface MicroInteraction {
  id: string;
  element: string;
  animation: 'pulse' | 'bounce' | 'glow' | 'shake' | 'float';
  trigger: 'hover' | 'click' | 'focus' | 'success' | 'error';
  duration: number;
}

export function EmotionalDesignSystem({ children }: EmotionalDesignSystemProps) {
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [activeInteractions, setActiveInteractions] = useState<MicroInteraction[]>([]);
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  const userExperience = useUserExperience();
  const controls = useAnimation();

  // Confidence building system
  useEffect(() => {
    const { interactionData, expertiseLevel } = userExperience;
    
    // Calculate confidence based on successful interactions
    const successRate = interactionData.totalClicks > 0 
      ? Math.max(0, (interactionData.totalClicks - interactionData.errorCount) / interactionData.totalClicks)
      : 0;
    
    const expertiseBonus = expertiseLevel === 'expert' ? 0.3 : expertiseLevel === 'intermediate' ? 0.2 : 0;
    const newConfidence = Math.min(1, successRate + expertiseBonus);
    
    setConfidenceLevel(newConfidence);
  }, [userExperience]);

  // Trigger celebrations for milestones
  const triggerCelebration = (type: Celebration['type'], message: string) => {
    const celebrations: Record<Celebration['type'], { icon: any; color: string; duration: number }> = {
      success: { icon: CheckCircle, color: 'text-green-500', duration: 2000 },
      milestone: { icon: Star, color: 'text-yellow-500', duration: 3000 },
      achievement: { icon: Trophy, color: 'text-purple-500', duration: 4000 },
      completion: { icon: Sparkles, color: 'text-blue-500', duration: 5000 }
    };

    const celebration: Celebration = {
      id: `celebration_${Date.now()}`,
      type,
      message,
      ...celebrations[type]
    };

    setCelebrations(prev => [...prev, celebration]);

    // Remove celebration after duration
    setTimeout(() => {
      setCelebrations(prev => prev.filter(c => c.id !== celebration.id));
    }, celebration.duration);
  };

  // Monitor user progress and trigger appropriate celebrations
  useEffect(() => {
    const { interactionData, expertiseLevel } = userExperience;
    
    // First successful configuration
    if (interactionData.configurationChanges === 1) {
      triggerCelebration('success', 'Great start! Your first configuration change.');
    }
    
    // Milestone celebrations
    if (interactionData.configurationChanges === 5) {
      triggerCelebration('milestone', 'You\'re getting the hang of this!');
    }
    
    if (interactionData.configurationChanges === 10) {
      triggerCelebration('achievement', 'Configuration expert in the making!');
    }
    
    // Expertise level progression
    if (expertiseLevel === 'intermediate' && interactionData.totalClicks > 20) {
      triggerCelebration('achievement', 'Welcome to intermediate level!');
    }
    
    if (expertiseLevel === 'expert') {
      triggerCelebration('completion', 'Expert level unlocked! Full control is yours.');
    }
  }, [userExperience.interactionData.configurationChanges, userExperience.expertiseLevel]);

  // Micro-interaction animations
  const microAnimations = {
    pulse: {
      scale: 1.05,
      transition: { duration: 0.6, repeat: Infinity, repeatType: 'reverse' as const }
    },
    bounce: {
      y: -10,
      transition: { duration: 0.5, ease: 'easeOut' }
    },
    glow: {
      boxShadow: '0 0 0 10px rgba(59, 130, 246, 0.1)',
      transition: { duration: 1.5, repeat: Infinity, repeatType: 'reverse' as const }
    },
    shake: {
      x: 5,
      transition: { duration: 0.1, repeat: 5, repeatType: 'reverse' as const }
    },
    float: {
      y: -5,
      transition: { duration: 2, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut' }
    }
  };

  // Success animation for the entire interface
  const celebrateSuccess = async () => {
    await controls.start({
      scale: 1.02,
      transition: { duration: 0.4, ease: 'easeOut' }
    });
    await controls.start({
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    });
  };

  // Confidence indicator component
  const ConfidenceIndicator = () => (
    <motion.div
      className="fixed top-1/2 right-4 transform -translate-y-1/2 z-30"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: confidenceLevel > 0.3 ? 1 : 0, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            <motion.path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray={`${confidenceLevel * 100}, 100`}
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${confidenceLevel * 100}, 100` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="text-xs text-center mt-1 font-medium text-gray-700">
          {Math.round(confidenceLevel * 100)}%
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      className="relative"
      animate={controls}
    >
      {children}

      {/* Confidence Indicator */}
      <ConfidenceIndicator />

      {/* Celebration Animations */}
      <AnimatePresence>
        {celebrations.map((celebration) => {
          const Icon = celebration.icon;
          return (
            <motion.div
              key={celebration.id}
              initial={{ opacity: 0, scale: 0, y: 50 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                rotate: 0
              }}
              exit={{ 
                opacity: 0, 
                scale: 0, 
                y: -50,
                transition: { duration: 0.3 }
              }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut"
              }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20 text-center max-w-sm">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: 1.1
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
                  }}
                  className="mb-4"
                >
                  <Icon className={`w-12 h-12 mx-auto ${celebration.color}`} />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {celebration.type === 'success' && 'Success!'}
                  {celebration.type === 'milestone' && 'Milestone Reached!'}
                  {celebration.type === 'achievement' && 'Achievement Unlocked!'}
                  {celebration.type === 'completion' && 'Congratulations!'}
                </h3>
                <p className="text-sm text-gray-600">{celebration.message}</p>
                
                {/* Confetti effect */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full"
                      initial={{ 
                        x: '50%', 
                        y: '50%', 
                        scale: 0,
                        rotate: 0
                      }}
                      animate={{ 
                        x: `${50 + (Math.random() - 0.5) * 200}%`,
                        y: `${50 + (Math.random() - 0.5) * 200}%`,
                        scale: 1,
                        rotate: 360
                      }}
                      transition={{ 
                        duration: 2,
                        delay: i * 0.1,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Ambient particles for atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-200 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: -20,
              opacity: 0.6,
              scale: 1.2
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Emotional state indicator */}
      {userExperience.expertiseLevel === 'beginner' && (
        <motion.div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            <motion.div
              className="flex items-center space-x-2"
              animate={{ scale: 1.05 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <Heart className="w-4 h-4" />
              <span>You're doing great!</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}