'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, Database, Zap } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import CascadeCard from '@/components/CascadeCard';
import SynthesisModal from '@/components/SynthesisModal';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { processingAPI, synthesisAPI, analysisAPI } from '@/lib/api';
import { Cascade, Synthesis } from '@/types';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import { graphAPI } from '@/lib/api';

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [syntheses, setSyntheses] = useState<Synthesis[]>([]);
  const [cascades, setCascades] = useState<Cascade[]>([]);
  const [selectedSynthesis, setSelectedSynthesis] = useState<Synthesis | null>(null);
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState<any>(null);

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, synthesisRes, cascadesRes, graphRes] = await Promise.all([
        processingAPI.getStats(),
        synthesisAPI.getTopCascades(5),
        analysisAPI.getCascades(48),
        graphAPI.getKnowledgeGraph(48, 0.75)
      ]);

      setStats(statsRes.data);
      setSyntheses(synthesisRes.data.syntheses);
      setCascades(cascadesRes.data.cascades);
      setGraphData(graphRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 dripping-effect">
        <h1 className="text-5xl font-bold mb-4">
          <span className="blood-text">RSS NECROMANCY</span>
        </h1>
        <p className="text-xl text-gray-400 ghost-text max-w-2xl mx-auto">
          Resurrecting the dead art of RSS feeds through dark AI magic.
          Watch as information cascades spread like spectral whispers across the digital realm.
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Articles"
            value={stats.total_articles}
            icon={Database}
            subtitle="Souls collected"
          />
          <StatsCard
            title="Processed"
            value={stats.processed}
            icon={Activity}
            subtitle={stats.processing_rate}
          />
          <StatsCard
            title="Cascades Detected"
            value={cascades.length}
            icon={TrendingUp}
            subtitle="Information spreading"
            danger
          />
          <StatsCard
            title="AI Syntheses"
            value={syntheses.length}
            icon={Zap}
            subtitle="Intelligence summoned"
          />
        </div>
      )}

      {/* Knowledge Graph */}
      {graphData && graphData.nodes.length > 0 && (
        <div>
          <KnowledgeGraph data={graphData} />
        </div>
      )}
      {/* AI Syntheses Section */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <Zap className="w-6 h-6 text-purple-500 spectral-glow" />
          <h2 className="text-2xl font-bold blood-text">
            AI-Summoned Intelligence
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => <LoadingSkeleton key={i} />)}
          </div>
        ) : syntheses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {syntheses.map((synthesis, idx) => {
              const cascade = cascades.find(c => c.entity === synthesis.entity);
              return cascade ? (
                <CascadeCard
                  key={idx}
                  cascade={cascade}
                  onViewSynthesis={() => setSelectedSynthesis(synthesis)}
                />
              ) : null;
            })}
          </div>
        ) : (
          <div className="haunted-card text-center py-12">
            <p className="text-gray-500 ghost-text">
              No cascades detected yet. The spirits are gathering...
            </p>
          </div>
        )}
      </div>

      {/* All Cascades Section */}
      {cascades.length > syntheses.length && (
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-red-500 spectral-glow" />
            <h2 className="text-2xl font-bold blood-text">
              All Information Cascades
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {cascades.slice(syntheses.length).map((cascade, idx) => (
              <CascadeCard
                key={idx}
                cascade={cascade}
              />
            ))}
          </div>
        </div>
      )}

      {/* Synthesis Modal */}
      {selectedSynthesis && (
        <SynthesisModal
          synthesis={selectedSynthesis}
          onClose={() => setSelectedSynthesis(null)}
        />
      )}
    </div>
  );
}