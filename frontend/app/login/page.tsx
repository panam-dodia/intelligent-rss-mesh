'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Mail, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const { login, register } = useAuth();
  const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setLoadingMessage('Authenticating...');

    try {
        console.log('Attempting login...'); // DEBUG
        if (isLogin) {
        await login(email, password);
        } else {
        await register(email, username, password, fullName);
        }
        console.log('Login successful, redirecting...'); // DEBUG
        setLoadingMessage('Loading dashboard...');
        router.push('/');
    } catch (err: any) {
        console.error('Login error:', err); // DEBUG
        setError(err.response?.data?.detail || 'Authentication failed');
        setLoading(false);
        setLoadingMessage('');
    }
    // Don't set loading false on success - let redirect happen
    };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 border-2 border-slate-600 rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-slate-500 rounded-full"></div>
          </div>
          <h1 className="text-4xl font-bold blood-text mb-2">
            {isLogin ? 'Access Intelligence Mesh' : 'Create Account'}
          </h1>
          <p className="text-gray-400 ghost-text">
            {isLogin ? 'Monitor distributed information flows' : 'Begin tracking information cascades'}
          </p>
        </div>

        <div className="haunted-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-700/50 rounded p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-slate-700/40 rounded px-4 py-2 text-white focus:outline-none focus:border-slate-500"
                required
                autoComplete="off"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-800 border border-slate-700/40 rounded px-4 py-2 text-white focus:outline-none focus:border-slate-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-gray-800 border border-slate-700/40 rounded px-4 py-2 text-white focus:outline-none focus:border-slate-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-slate-700/40 rounded px-4 py-2 text-white focus:outline-none focus:border-slate-500"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursed-button"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>

            {loading && (
              <div className="space-y-3">
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 animate-pulse"></div>
                </div>
                <p className="text-center text-sm text-gray-400 animate-pulse">
                  {loadingMessage}
                </p>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm text-gray-400 hover:text-slate-300 transition-colors"
            >
              {isLogin ? 'Need an account? Create one here' : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}