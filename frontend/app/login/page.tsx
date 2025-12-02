'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Skull, Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        console.log('Attempting login...'); // DEBUG
        if (isLogin) {
        await login(email, password);
        } else {
        await register(email, username, password, fullName);
        }
        console.log('Login successful, redirecting...'); // DEBUG
        router.push('/');
    } catch (err: any) {
        console.error('Login error:', err); // DEBUG
        setError(err.response?.data?.detail || 'Authentication failed');
        setLoading(false); // IMPORTANT: Stop loading on error
    }
    // Don't set loading false on success - let redirect happen
    };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Skull className="w-16 h-16 text-red-600 mx-auto mb-4 spectral-glow" />
          <h1 className="text-4xl font-bold blood-text mb-2">
            {isLogin ? 'ENTER THE CRYPT' : 'JOIN THE UNDEAD'}
          </h1>
          <p className="text-gray-400 ghost-text">
            {isLogin ? 'Return to the realm of knowledge' : 'Begin your dark journey'}
          </p>
        </div>

        <div className="haunted-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-600 rounded p-3 text-sm text-red-400">
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
                className="w-full bg-gray-800 border border-red-900/30 rounded px-4 py-2 text-white focus:outline-none focus:border-red-600"
                required
                autoComplete="off"  // ADD THIS
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
                    className="w-full bg-gray-800 border border-red-900/30 rounded px-4 py-2 text-white focus:outline-none focus:border-red-600"
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
                    className="w-full bg-gray-800 border border-red-900/30 rounded px-4 py-2 text-white focus:outline-none focus:border-red-600"
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
                className="w-full bg-gray-800 border border-red-900/30 rounded px-4 py-2 text-white focus:outline-none focus:border-red-600"
                required
                minLength={6}
                autoComplete="new-password"  // ADD THIS
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursed-button"
            >
              {loading ? 'Summoning...' : isLogin ? 'Enter' : 'Arise'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              {isLogin ? 'Need an account? Join the undead' : 'Already risen? Enter here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}