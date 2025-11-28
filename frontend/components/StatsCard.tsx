'use client';

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  danger?: boolean;
}

export default function StatsCard({ title, value, icon: Icon, subtitle, danger }: StatsCardProps) {
  return (
    <div className={`haunted-card ${danger ? 'border-red-700' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wider ghost-text">
            {title}
          </p>
          <p className={`text-3xl font-bold mt-2 ${danger ? 'blood-text' : 'text-white'}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        <Icon className={`w-8 h-8 ${danger ? 'text-red-600' : 'text-purple-500'} spectral-glow`} />
      </div>
    </div>
  );
}