'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Rss, Check, X, Radio, ArrowLeft } from 'lucide-react';
import { usersAPI } from '@/lib/api';
import Link from 'next/link';

interface Feed {
  id: number;
  url: string;
  title: string;
  category: string;
  description: string;
  is_subscribed: boolean;
  last_fetched: string | null;
}

export default function FeedsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && token) {
      fetchFeeds();
    }
  }, [user, token, authLoading, router]);

  const fetchFeeds = async () => {
    try {
      const response = await usersAPI.getAvailableFeeds();
      setFeeds(response.data);
    } catch (error: any) {
      console.error('Error fetching feeds:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    }
  };

  const toggleSubscription = async (feedId: number, isSubscribed: boolean) => {
    setUpdating(feedId);
    try {
      if (isSubscribed) {
        await usersAPI.unsubscribeFromFeed(feedId);
      } else {
        await usersAPI.subscribeToFeed(feedId);
      }
      setFeeds(feeds.map(feed => 
        feed.id === feedId 
          ? { ...feed, is_subscribed: !isSubscribed }
          : feed
      ));
    } catch (error) {
      console.error('Error toggling subscription:', error);
    } finally {
      setUpdating(null);
    }
  };

  // Simple loading
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

  const subscribedCount = feeds.filter(f => f.is_subscribed).length;
  const hasSubscriptions = subscribedCount > 0;

  return (
    <div className="space-y-8">
      {/* Header with Back Button */}
      <div className="text-center py-8 dripping-effect">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-slate-300 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>

        <Rss className="w-16 h-16 text-slate-400 mx-auto mb-4 spectral-glow" />
        <h1 className="text-4xl font-bold mb-2">
          <span className="blood-text">Feed Management</span>
        </h1>
        <p className="text-xl text-gray-400 ghost-text">
          Configure your information sources
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {subscribedCount} of {feeds.length} feeds active
        </p>
      </div>

      {/* Action Button */}
      {hasSubscriptions && (
        <div className="flex justify-center">
          <Link
            href="/"
            className="px-8 py-3 cursed-button flex items-center space-x-2"
          >
            <Check className="w-5 h-5" />
            <span>View Dashboard ({subscribedCount} active)</span>
          </Link>
        </div>
      )}

      {/* Feeds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feeds.map((feed) => (
          <div
            key={feed.id}
            className={`haunted-card transition-all ${
              feed.is_subscribed ? 'border-slate-500/50 bg-slate-800/10' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Radio className={`w-5 h-5 ${feed.is_subscribed ? 'text-slate-400 animate-pulse' : 'text-gray-600'}`} />
                  <h3 className="text-lg font-bold text-white">
                    {feed.title}
                  </h3>
                </div>
                <p className="text-xs px-2 py-1 bg-gray-800 rounded inline-block mb-2">
                  {feed.category}
                </p>
                {feed.description && (
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                    {feed.description}
                  </p>
                )}
                {feed.last_fetched && (
                  <p className="text-xs text-gray-600 mt-2">
                    Last fetched: {new Date(feed.last_fetched).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => toggleSubscription(feed.id, feed.is_subscribed)}
              disabled={updating === feed.id}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                feed.is_subscribed
                  ? 'cursed-button'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-slate-700/40'
              }`}
            >
              {updating === feed.id ? (
                <span>Processing...</span>
              ) : feed.is_subscribed ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Active</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  <span>Activate</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {!hasSubscriptions && (
        <div className="haunted-card text-center py-12">
          <p className="text-gray-500 ghost-text text-lg">
            No feeds configured yet. Activate at least one feed to begin tracking information cascades.
          </p>
        </div>
      )}
    </div>
  );
}
