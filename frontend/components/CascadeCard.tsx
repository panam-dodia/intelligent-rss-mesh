'use client';

import { TrendingUp, ExternalLink } from 'lucide-react';
import { Cascade } from '@/types';

interface CascadeCardProps {
  cascade: Cascade;
  onViewSynthesis?: () => void;
  isLoading?: boolean;
}

export default function CascadeCard({ cascade, onViewSynthesis, isLoading }: CascadeCardProps) {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'PERSON': 'text-blue-400',
      'ORG': 'text-purple-400',
      'GPE': 'text-green-400',
      'PRODUCT': 'text-yellow-400',
      'EVENT': 'text-red-400',
    };
    return colors[type] || 'text-gray-400';
  };

  return (
    <div className="haunted-card group cursor-pointer" onClick={onViewSynthesis}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-1 h-6 bg-gradient-to-b from-red-600 to-red-900 rounded-full"></div>
            <h3 className="text-xl font-bold text-white">
              {cascade.entity}
            </h3>
            <span className={`text-xs px-2 py-1 rounded ${getTypeColor(cascade.type)} bg-gray-800`}>
              {cascade.type}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-1 text-red-500" />
              {cascade.mention_count} mentions
            </span>
            <span>
              {cascade.source_count} sources
            </span>
            <span className="blood-text">
              {cascade.velocity.toFixed(1)} mentions/hr
            </span>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Sources</p>
        <div className="flex flex-wrap gap-2">
          {cascade.sources.map((source, idx) => (
            <span key={idx} className="text-xs px-2 py-1 bg-gray-800 rounded border border-red-900/30">
              {source}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-red-900/30 pt-3">
        <p className="text-xs text-gray-500 mb-2">Recent Articles ({cascade.articles.length})</p>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {cascade.articles.slice(0, 3).map((article, idx) => (
            <div key={idx} className="text-xs text-gray-400 hover:text-gray-300 flex items-start">
              <ExternalLink className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline line-clamp-1"
                onClick={(e) => e.stopPropagation()}
              >
                {article.title}
              </a>
            </div>
          ))}
        </div>
      </div>

      {onViewSynthesis && (
        <button
          className="mt-4 w-full cursed-button text-sm"
          onClick={onViewSynthesis}
          disabled={isLoading}
        >
          {isLoading ? 'Summoning AI...' : 'View AI Synthesis'}
        </button>
      )}
    </div>
  );
}