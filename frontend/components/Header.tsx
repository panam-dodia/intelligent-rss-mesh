'use client';

import { Skull, LogOut, User, Rss, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="border-b border-slate-700/30 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50 dripping-effect">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition">
            <Skull className="w-8 h-8 text-slate-400 spectral-glow" />
            <div>
              <h1 className="text-2xl font-bold blood-text">
                RSS Intelligence Mesh
              </h1>
              <p className="text-xs text-gray-500 ghost-text">
                Distributed Narrative Tracking & Analysis
              </p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-6">
            {user && (
              <>
                <Link
                  href="/feeds"
                  className="flex items-center space-x-2 text-sm text-gray-400 hover:text-slate-300 transition-colors"
                >
                  <Rss className="w-5 h-5" />
                  <span>Feeds</span>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    <User className="w-5 h-5 text-slate-400" />
                    <span>{user.username}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showProfile && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-slate-700/40 rounded-lg shadow-lg py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-gray-400 hover:text-slate-300 hover:bg-gray-800 transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}