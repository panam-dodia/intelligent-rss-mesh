'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Rss, Check, X, Radio } from 'lucide-react';
import { usersAPI } from '@/lib/api';
import SpookyLoader from '@/components/SpookyLoader';

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
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('Auth still loading...');
      return;
    }
    
    // Redirect if no user
    if (!user) {
      console.log('No user, redirecting to login');
      router.push('/login');
      return;
    }

    // CRITICAL: Only fetch when we have BOTH user AND token
    if (user && token) {
      console.log('User and token ready, fetching feeds');
      fetchFeeds();
    }
  }, [user, token, authLoading, router]);

  const fetchFeeds = async () => {
    try {
      console.log('Making request to get available feeds...');
      const response = await usersAPI.getAvailableFeeds();
      console.log('Feeds response:', response.data);
      setFeeds(response.data);
    } catch (error: any) {
      console.error('Error fetching feeds:', error);
      console.error('Error response:', error.response);
      
      // If 401, redirect to login
      if (error.response?.status === 401) {
        console.log('Got 401, redirecting to login');
        router.push('/login');
      }
    } finally {
      setLoading(false);
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
      // Update local state
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

  if (authLoading || loading) {
    return <SpookyLoader message="Loading feeds from the crypt..." />;
  }

  if (!user) {
    return null;
  }

  const subscribedCount = feeds.filter(f => f.is_subscribed).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center py-8 dripping-effect">
        <Rss className="w-16 h-16 text-red-600 mx-auto mb-4 spectral-glow" />
        <h1 className="text-4xl font-bold mb-2">
          <span className="blood-text">FEED SUMMONING CHAMBER</span>
        </h1>
        <p className="text-xl text-gray-400 ghost-text">
          Choose which dark sources shall feed your intelligence
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {subscribedCount} of {feeds.length} feeds summoned
        </p>
      </div>

      {/* Feeds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feeds.map((feed) => (
          <div
            key={feed.id}
            className={`haunted-card transition-all ${
              feed.is_subscribed ? 'border-red-600 bg-red-900/10' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Radio className={`w-5 h-5 ${feed.is_subscribed ? 'text-red-500 animate-pulse' : 'text-gray-600'}`} />
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
                    Last summoned: {new Date(feed.last_fetched).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => toggleSubscription(feed.id, feed.is_subscribed)}
              disabled={updating === feed.id}
              className={`w-full py-2 px-4 rounded-lg font-bold transition-all flex items-center justify-center space-x-2 ${
                feed.is_subscribed
                  ? 'bg-red-900 hover:bg-red-800 text-white border border-red-700'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
              }`}
            >
              {updating === feed.id ? (
                <span>Processing...</span>
              ) : feed.is_subscribed ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Subscribed</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  <span>Subscribe</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {subscribedCount === 0 && (
        <div className="haunted-card text-center py-12">
          <p className="text-gray-500 ghost-text text-lg">
            No feeds summoned yet. Subscribe to at least one feed to begin your dark journey...
          </p>
        </div>
      )}
    </div>
  );
}