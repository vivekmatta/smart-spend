import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, LogIn, UserPlus, DollarSign } from 'lucide-react';

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
    <div className="max-w-3xl mx-auto py-10">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center space-x-2">
          <DollarSign className="h-10 w-10 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">SmartSpend</h1>
        </div>
        <p className="mt-3 text-gray-600">
          Track expenses, get AI-powered categorization, and visualize your spending trends.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Lock className="h-5 w-5 text-primary-600" />
              <span>Sign in to continue</span>
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
                <input
                  type="text"
                  placeholder="Full name"
                  className="input w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              <input
                type="email"
                placeholder="Email"
                className="input w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="input w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
            <h2 className="text-lg font-semibold text-gray-900">What you'll get</h2>
          </div>
          <div className="card-body text-sm text-gray-700 space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>Fast expense entry with clean UI</li>
              <li>Automatic category suggestions powered by AI</li>
              <li>Insightful dashboard and trends</li>
              <li>Data is scoped to your account, accessible on any device</li>
            </ul>
            <p className="text-xs text-gray-500">
              By signing in, you agree to store your expenses securely in our database tied to your account.
            </p>
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-gray-600">
        You can browse the app after signing in. See the <Link to="/" className="text-primary-600 underline">Dashboard</Link> and <Link to="/expenses" className="text-primary-600 underline">Expenses</Link> pages.
      </p>
    </div>
  );
};

export default Welcome; 