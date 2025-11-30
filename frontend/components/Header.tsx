'use client';

import { Skull, Activity, LogOut, User, Rss } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="border-b border-red-900/30 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50 dripping-effect">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition">
            <Skull className="w-8 h-8 text-red-600 spectral-glow" />
            <div>
              <h1 className="text-2xl font-bold blood-text">
                RSS NECROMANCY
              </h1>
              <p className="text-xs text-gray-500 ghost-text">
                Resurrecting Dead Feeds with Dark Intelligence
              </p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-6">
            {user && (
              <Link 
                href="/feeds"
                className="flex items-center space-x-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
              >
                <Rss className="w-5 h-5" />
                <span>Manage Feeds</span>
              </Link>
            )}

            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-500 animate-pulse" />
              <span className="text-sm text-gray-400">System Active</span>
            </div>

            {user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-300">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}