'use client';

import { useEffect, useRef, useState } from 'react';
import { Network } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import ForceGraph2D with no SSR
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
});

interface GraphNode {
  id: string;
  label: string;
  type: string;
  size: number;
  source?: string;
  entity_type?: string;
  mention_count?: number;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
  similarity?: number;
}

interface KnowledgeGraphProps {
  data: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
}

export default function KnowledgeGraph({ data }: KnowledgeGraphProps) {
  const graphRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth - 100,
        height: Math.min(window.innerHeight - 200, 600)
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getNodeColor = (node: GraphNode) => {
    if (node.type === 'article') {
      const sourceColors: Record<string, string> = {
        'techcrunch.com': '#8B0000',
        'theverge.com': '#4B0082',
        'arstechnica.com': '#228B22',
        'engadget.com': '#8B008B'
      };
      return sourceColors[node.source || ''] || '#DC143C';
    } else {
      const typeColors: Record<string, string> = {
        'PERSON': '#4169E1',
        'ORG': '#9370DB',
        'GPE': '#32CD32',
        'PRODUCT': '#FFD700'
      };
      return typeColors[node.entity_type || ''] || '#FFA500';
    }
  };

  const getLinkColor = (link: GraphLink) => {
    return link.type === 'similar' ? 'rgba(139, 0, 0, 0.3)' : 'rgba(75, 0, 130, 0.2)';
  };

  if (!mounted) {
    return (
      <div className="haunted-card">
        <div className="flex items-center space-x-2 mb-4">
          <Network className="w-6 h-6 text-purple-500 spectral-glow" />
          <h2 className="text-2xl font-bold blood-text">Knowledge Graph</h2>
        </div>
        <div className="bg-black/50 rounded-lg border border-red-900/30 h-[600px] flex items-center justify-center">
          <p className="text-gray-500 ghost-text">Summoning the graph from the void...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="haunted-card">
      <div className="flex items-center space-x-2 mb-4">
        <Network className="w-6 h-6 text-purple-500 spectral-glow" />
        <h2 className="text-2xl font-bold blood-text">Knowledge Graph</h2>
        <span className="text-sm text-gray-500">
          {data.nodes.length} nodes, {data.links.length} connections
        </span>
      </div>

      <div className="bg-black/50 rounded-lg border border-red-900/30 overflow-hidden">
        <ForceGraph2D
        ref={graphRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        nodeLabel={(node: any) => `
            <div style="background: rgba(0,0,0,0.9); padding: 8px; border-radius: 4px; border: 1px solid #8B0000;">
            <strong style="color: #DC143C;">${node.label}</strong><br/>
            ${node.type === 'entity' ? `Type: ${node.entity_type}<br/>Mentions: ${node.mention_count}` : `Source: ${node.source}`}
            </div>
        `}
        nodeColor={getNodeColor}
        nodeRelSize={6}
        nodeVal={(node: any) => node.size}
        linkColor={getLinkColor}
        linkWidth={(link: any) => link.type === 'similar' ? 2 : 1}
        linkDirectionalParticles={(link: any) => link.type === 'mentions' ? 2 : 0}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.005}
        backgroundColor="rgba(0,0,0,0)"
        d3VelocityDecay={0.3}
        d3AlphaDecay={0.01}
        d3AlphaMin={0.001}
        cooldownTicks={200}
        warmupTicks={100}
        linkDistance={150}
        chargeStrength={-300}
        onNodeClick={(node: any) => {
            if (node.url) {
            window.open(node.url, '_blank');
            }
        }}
        onEngineStop={() => {
            if (graphRef.current) {
            graphRef.current.zoomToFit(400, 50);
            }
        }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-600"></div>
          <span className="text-gray-400">Articles</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-purple-600"></div>
          <span className="text-gray-400">Entities</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-600 opacity-30"></div>
          <span className="text-gray-400">Similar Articles</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-600 opacity-30"></div>
          <span className="text-gray-400">Entity Mentions</span>
        </div>
      </div>
    </div>
  );
}