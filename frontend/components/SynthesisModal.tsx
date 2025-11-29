'use client';

import { X, Sparkles } from 'lucide-react';
import { Synthesis } from '@/types';

interface SynthesisModalProps {
  synthesis: Synthesis;
  onClose: () => void;
}

export default function SynthesisModal({ synthesis, onClose }: SynthesisModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-gray-900 border-2 border-red-900/50 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-[0_0_50px_rgba(139,0,0,0.5)]">
        <div className="sticky top-0 bg-gray-900 border-b border-red-900/30 p-6 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Sparkles className="w-6 h-6 text-purple-500 spectral-glow" />
              <h2 className="text-2xl font-bold blood-text">{synthesis.entity}</h2>
            </div>
            <p className="text-sm text-gray-400">
              {synthesis.mention_count} mentions across {synthesis.source_count} sources
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
              {synthesis.synthesis}
            </div>
          </div>
        </div>

        <div className="border-t border-red-900/30 p-6">
          <button 
            onClick={onClose}
            className="cursed-button w-full"
          >
            Close Transmission
          </button>
        </div>
      </div>
    </div>
  );
}