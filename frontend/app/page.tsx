'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Activity, TrendingUp, Database, Zap } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import CascadeCard from '@/components/CascadeCard';
import SynthesisModal from '@/components/SynthesisModal';
import { processingAPI, synthesisAPI, analysisAPI } from '@/lib/api';
import { Cascade, Synthesis } from '@/types';
import Link from 'next/link';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Simple loading (not SpookyLoader)
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Dashboard />;
}

function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [syntheses, setSyntheses] = useState<Synthesis[]>([]);
  const [cascades, setCascades] = useState<Cascade[]>([]);
  const [selectedSynthesis, setSelectedSynthesis] = useState<Synthesis | null>(null);
  const [loadingSynthesis, setLoadingSynthesis] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data once on mount
    fetchData();

    // Auto-refresh every 60 seconds (reduced from 30s for better performance)
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      console.log('🔍 Starting data fetch...');

      // Fetch fast APIs in parallel
      const [statsRes, synthesisRes, cascadesRes] = await Promise.all([
        processingAPI.getStats(),
        synthesisAPI.getTopCascades(5),
        analysisAPI.getCascades(1),
      ]);

      console.log('📊 Stats response:', statsRes.data);
      console.log('🎯 Synthesis response:', synthesisRes.data);
      console.log('📈 Cascades response:', cascadesRes.data);

      setStats(statsRes.data);
      setSyntheses(synthesisRes.data.syntheses);
      setCascades(cascadesRes.data.cascades);

      console.log('✅ State set - syntheses:', synthesisRes.data.syntheses?.length, 'cascades:', cascadesRes.data.cascades?.length);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleViewSynthesis = async (entity: string) => {
    // Check if synthesis already exists
    const existing = syntheses.find(s => s.entity === entity);
    if (existing) {
      setSelectedSynthesis(existing);
      return;
    }

    // Fetch synthesis on-demand
    setLoadingSynthesis(entity);
    try {
      console.log(`🔮 Fetching synthesis for: ${entity}`);
      const response = await synthesisAPI.getCascadeSynthesis(entity);
      const newSynthesis = response.data;
      setSelectedSynthesis(newSynthesis);

      // Optionally cache it
      setSyntheses([...syntheses, newSynthesis]);
    } catch (error) {
      console.error('Error fetching synthesis:', error);
      alert('Failed to generate synthesis. Please try again.');
    } finally {
      setLoadingSynthesis(null);
    }
  };

  // Page shows immediately, even before data loads
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 dripping-effect">
        <h1 className="text-5xl font-bold mb-4">
          <span className="blood-text">RSS Intelligence Mesh</span>
        </h1>
        <p className="text-xl text-gray-400 ghost-text max-w-2xl mx-auto">
          Advanced feed aggregation and cascade analysis.
          Track emerging narratives across distributed sources.
        </p>
      </div>

      {/* Stats Grid */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Articles"
            value={stats.total_articles}
            icon={Database}
            subtitle="In database"
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
            subtitle="Active narratives"
            danger
          />
          <StatsCard
            title="AI Syntheses"
            value={syntheses.length}
            icon={Zap}
            subtitle="Generated insights"
          />
        </div>
      ) : (
        <div className="text-center text-gray-500">Loading stats...</div>
      )}

      {/* AI Syntheses Section */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <Zap className="w-6 h-6 text-slate-400 spectral-glow" />
          <h2 className="text-2xl font-bold blood-text">
            Intelligence Synthesis
          </h2>
        </div>

        {syntheses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {syntheses.map((synthesis, idx) => {
              const cascade = cascades.find(c => c.entity === synthesis.entity);
              return cascade ? (
                <CascadeCard
                  key={idx}
                  cascade={cascade}
                  onViewSynthesis={() => handleViewSynthesis(cascade.entity)}
                  isLoading={loadingSynthesis === cascade.entity}
                />
              ) : null;
            })}
          </div>
        ) : (
          <div className="haunted-card text-center py-12">
            <p className="text-gray-500 ghost-text mb-4">
              No cascades detected yet. Analysis in progress...
            </p>

            {stats && stats.total_articles > 0 && (
              <div className="max-w-md mx-auto mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Processing articles...</span>
                  <span>{stats.processed} / {stats.total_articles}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 transition-all duration-500"
                    style={{ width: `${stats.processing_rate || '0%'}` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Cascades will appear once enough articles are analyzed
                </p>
              </div>
            )}

            <Link
              href="/feeds"
              className="inline-block px-6 py-3 cursed-button"
            >
              Configure Feeds
            </Link>
          </div>
        )}
      </div>

      {/* All Cascades Section */}
      {cascades.length > syntheses.length && (
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-slate-400 spectral-glow" />
            <h2 className="text-2xl font-bold blood-text">
              Active Cascades
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {cascades.slice(syntheses.length).map((cascade, idx) => (
              <CascadeCard
                key={idx}
                cascade={cascade}
                onViewSynthesis={() => handleViewSynthesis(cascade.entity)}
                isLoading={loadingSynthesis === cascade.entity}
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
