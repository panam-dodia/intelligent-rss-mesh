'use client';

import { motion } from 'framer-motion';

interface LoadingSpiderProps {
  progress: number; // 0 to 100
  isLoading: boolean;
}

export default function LoadingSpider({ progress, isLoading }: LoadingSpiderProps) {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
    >
      <div className="relative">
        {/* Spider body */}
        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          {/* Main body */}
          <div className="relative w-64 h-64">
            {/* Abdomen */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-40 h-48 bg-gradient-to-b from-gray-900 via-black to-red-950 rounded-[50%] border-4 border-red-900 shadow-[0_0_60px_rgba(139,0,0,0.8)]">
                {/* Skull pattern on abdomen */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-600 text-6xl opacity-30">
                  ☠
                </div>
              </div>
            </div>

            {/* Head/Cephalothorax */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-28 h-28 bg-gradient-to-b from-black to-gray-900 rounded-full border-4 border-red-900 shadow-[0_0_40px_rgba(139,0,0,0.6)]">
                {/* Eyes - multiple spider eyes */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 bg-red-600 rounded-full"
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      style={{
                        boxShadow: '0 0 10px rgba(255, 0, 0, 0.8)',
                      }}
                    />
                  ))}
                </div>
                
                {/* Fangs */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-3">
                  <div className="w-2 h-8 bg-red-900 rounded-b-full" />
                  <div className="w-2 h-8 bg-red-900 rounded-b-full" />
                </div>
              </div>
            </div>

            {/* Legs - 8 legs, 4 on each side */}
            {[...Array(8)].map((_, i) => {
              const side = i < 4 ? -1 : 1;
              const legIndex = i % 4;
              const baseAngle = side === -1 ? 180 : 0;
              const angle = baseAngle + (legIndex * 40 - 60);
              
              return (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    transformOrigin: 'center',
                    rotate: `${angle}deg`,
                  }}
                  animate={{
                    rotate: [`${angle}deg`, `${angle + (side * 10)}deg`, `${angle}deg`],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: legIndex * 0.1,
                  }}
                >
                  <div className="w-1 h-32 bg-gradient-to-b from-red-900 via-black to-transparent origin-top" />
                  <motion.div
                    className="w-1 h-24 bg-gradient-to-b from-black to-transparent origin-top"
                    style={{
                      position: 'absolute',
                      top: '128px',
                      transformOrigin: 'top',
                    }}
                    animate={{
                      rotate: ['-30deg', '30deg', '-30deg'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: legIndex * 0.1,
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Loading text and progress */}
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 text-center">
          <motion.p
            className="text-2xl font-bold blood-text title-horror mb-4"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            SUMMONING DARK INTELLIGENCE...
          </motion.p>
          
          {/* Progress bar */}
          <div className="w-full h-4 bg-gray-900 border-2 border-red-900 rounded-full overflow-hidden shadow-[0_0_20px_rgba(139,0,0,0.5)]">
            <motion.div
              className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-900"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              style={{
                boxShadow: '0 0 20px rgba(139, 0, 0, 0.8)',
              }}
            />
          </div>
          
          <p className="text-sm text-gray-500 mt-2 font-mono">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Web thread from top */}
        <div className="absolute -top-96 left-1/2 w-1 h-96 bg-gradient-to-b from-red-900/40 to-transparent" />
      </div>
    </motion.div>
  );
}