import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, LogIn, UserPlus, DollarSign, Sparkles } from 'lucide-react';

const Welcome = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name);
      }
      navigate('/');
    } catch (e1) {
      alert(e1.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setSubmitting(true);
      await signInWithGoogle();
      navigate('/');
    } catch (e) {
      alert(e.message || 'Google sign-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-10">
      <div className="mx-auto max-w-5xl px-4">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 rounded-full bg-primary-50 px-3 py-1 text-primary-700 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-powered finance</span>
          </div>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <DollarSign className="h-10 w-10 text-primary-600" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Welcome to SmartSpend</h1>
          </div>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Track expenses effortlessly, get intelligent category suggestions, and visualize your spending trends across devices.
          </p>
        </div>

        {/* Auth cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Lock className="h-5 w-5 text-primary-600" />
                <span>{mode === 'signin' ? 'Sign in to continue' : 'Create your account'}</span>
              </h2>
            </div>
            <div className="card-body space-y-4">
              <button onClick={handleGoogle} className="btn btn-primary w-full" disabled={submitting}>
                <LogIn className="mr-2 h-4 w-4" />
                Continue with Google
              </button>

              <div className="flex items-center my-2">
                <div className="flex-grow border-t border-gray-200" />
                <span className="px-3 text-xs text-gray-500">or</span>
                <div className="flex-grow border-t border-gray-200" />
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      className="input w-full"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="input w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-secondary w-full" disabled={submitting}>
                  {mode === 'signin' ? (
                    <>
                      <LogIn className="mr-2 h-4 w-4" /> Sign In
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                    </>
                  )}
                </button>
              </form>

              <div className="text-sm text-center text-gray-600">
                {mode === 'signin' ? (
                  <>
                    New here?{' '}
                    <button className="text-primary-600 hover:underline" onClick={() => setMode('signup')}>Create an account</button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button className="text-primary-600 hover:underline" onClick={() => setMode('signin')}>Sign in</button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Why SmartSpend?</h2>
            </div>
            <div className="card-body text-sm text-gray-700 space-y-3">
              <div className="flex items-start space-x-3">
                <span className="mt-1">💡</span>
                <p>Automatic category suggestions powered by built-in AI heuristics.</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="mt-1">📊</span>
                <p>Beautiful dashboards and trends to understand your spending patterns.</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="mt-1">🔒</span>
                <p>Your data is scoped to your account and accessible from any device.</p>
              </div>
              <p className="text-xs text-gray-500">
                By signing in, you agree to store your expenses securely in our database tied to your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome; 