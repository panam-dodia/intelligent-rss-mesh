'use client';

import { Skull, Activity } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-red-900/30 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50 dripping-effect">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skull className="w-8 h-8 text-red-600 spectral-glow" />
            <div>
              <h1 className="text-2xl font-bold blood-text">
                RSS NECROMANCY
              </h1>
              <p className="text-xs text-gray-500 ghost-text">
                Resurrecting Dead Feeds with Dark Intelligence
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-500 animate-pulse" />
            <span className="text-sm text-gray-400">System Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}