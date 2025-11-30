'use client';

import { motion } from 'framer-motion';

interface GlitchTextProps {
  children: string;
  className?: string;
}

export default function GlitchText({ children, className = '' }: GlitchTextProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      
      <motion.span
        className="absolute top-0 left-0 text-red-600"
        animate={{
          x: [0, -2, 2, 0],
          opacity: [0, 0.7, 0.7, 0],
        }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      >
        {children}
      </motion.span>
      
      <motion.span
        className="absolute top-0 left-0 text-purple-600"
        animate={{
          x: [0, 2, -2, 0],
          opacity: [0, 0.7, 0.7, 0],
        }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          repeatDelay: 3,
          delay: 0.1,
        }}
      >
        {children}
      </motion.span>
    </div>
  );
}