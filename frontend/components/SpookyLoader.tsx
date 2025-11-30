'use client';

import { useEffect, useState } from 'react';
import { Skull, Eye } from 'lucide-react';

interface SpookyLoaderProps {
  message?: string;
}

export default function SpookyLoader({ message = "Summoning dark forces..." }: SpookyLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [glitchText, setGlitchText] = useState(message);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

    useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
        setProgress(prev => {
        if (prev >= 95) {
            clearInterval(interval); // Stop the interval
            return 95;
        }
        return prev + Math.random() * 15;
        });
    }, 200);

    // Glitch effect on text
    const glitchInterval = setInterval(() => {
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const glitched = message.split('').map(char => 
        Math.random() > 0.9 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
        ).join('');
        setGlitchText(glitched);
        
        setTimeout(() => setGlitchText(message), 50);
    }, 2000);

    return () => {
        clearInterval(interval);
        clearInterval(glitchInterval);
    };
    }, [message]);

  // Fixed heights to avoid hydration issues
  const dripHeights = [7, 9, 11, 8, 6, 10, 12, 9, 13, 8];

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="max-w-md w-full px-6">
        {/* Floating skulls */}
        <div className="relative mb-8">
          <div className="flex justify-center space-x-8">
            <Skull className="w-12 h-12 text-red-600 spectral-glow animate-bounce" style={{ animationDelay: '0s' }} />
            <Eye className="w-12 h-12 text-purple-600 spectral-glow animate-bounce" style={{ animationDelay: '0.2s' }} />
            <Skull className="w-12 h-12 text-red-600 spectral-glow animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold blood-text mb-2 font-mono">
            {glitchText}
          </h2>
          <p className="text-gray-500 text-sm ghost-text">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Progress bar */}
        <div className="relative h-6 bg-gray-900 border-2 border-red-900/50 rounded-lg overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-purple-900/20 to-red-900/20 animate-pulse"></div>
          
          {/* Progress fill */}
          <div 
            className="relative h-full bg-gradient-to-r from-red-600 via-red-700 to-red-900 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          >
            {/* Dripping effect */}
            <div className="absolute inset-0 opacity-50">
              <div className="h-full w-full bg-gradient-to-b from-transparent via-red-800 to-red-900 animate-pulse"></div>
            </div>
            
            {/* Glow effect */}
            <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-red-400/50 to-transparent blur-sm"></div>
          </div>
          
          {/* Blood drip animation - Fixed heights */}
          <div className="absolute bottom-0 left-0 right-0 h-1">
            {dripHeights.map((height, i) => (
              <div
                key={i}
                className="absolute w-1 bg-red-600 rounded-full animate-drip"
                style={{
                  left: `${i * 10}%`,
                  animationDelay: `${i * 0.2}s`,
                  height: `${height}px`
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Pulsing eyes */}
        <div className="flex justify-around mt-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-red-600 rounded-full spectral-glow animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes drip {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(400%);
            opacity: 0;
          }
        }
        .animate-drip {
          animation: drip 2s infinite;
        }
      `}</style>
    </div>
  );
}