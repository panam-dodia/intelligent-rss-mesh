'use client';

import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  danger?: boolean;
  delay?: number;
}

export default function StatsCard({ title, value, icon: Icon, subtitle, danger, delay = 0 }: StatsCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      className={`haunted-card ${danger ? 'border-red-700/60' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-widest ghost-text font-semibold mb-2">
            {title}
          </p>
          <motion.p 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
            className={`text-4xl font-bold mt-2 ${danger ? 'blood-text' : 'text-white'}`}
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            {value}
          </motion.p>
          {subtitle && (
            <p className="text-xs text-gray-600 mt-2 font-mono">{subtitle}</p>
          )}
        </div>
        <motion.div
          animate={{ 
            rotate: danger ? [0, -5, 5, -5, 0] : 0,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1
          }}
        >
          <Icon className={`w-10 h-10 ${danger ? 'text-red-600' : 'text-purple-500'} spectral-glow`} />
        </motion.div>
      </div>
      <div className="crack-overlay"></div>
    </motion.div>
  );
}