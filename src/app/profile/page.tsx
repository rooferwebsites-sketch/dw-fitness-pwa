'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/client'
import Navigation from '@/components/Navigation'

export default function ProfilePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<any>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data } = await supabase.auth.getUser()
    if (data?.user) {
      setUser(data.user)
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) {
        setMessage(`Error: ${error.message}`)
      } else if (data.user) {
        setMessage('Account created! Logging you in...')
        setUser(data.user)
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setMessage(`Error: ${error.message}`)
      } else if (data.user) {
        setUser(data.user)
      }
    }
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
    setMessage('Logged out successfully.')
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-24 p-4 max-w-md mx-auto flex flex-col justify-center">
      <h1 className="text-2xl font-bold tracking-tight mb-6 text-emerald-400 text-center">
        User Profile
      </h1>

      {user ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-4 shadow-lg">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            {user.email?.[0].toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-slate-400">Logged in as:</p>
            <p className="text-sm font-semibold text-slate-200">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 font-semibold py-2 rounded-lg text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-slate-200 mb-1 text-center">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400 text-center mb-6">
            {isSignUp ? 'Sign up to track your workout routines' : 'Log in to manage your workouts'}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {message && (
              <p className={`text-xs p-2 rounded text-center ${message.startsWith('Error') ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Log In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setMessage('')
              }}
              className="text-xs text-slate-400 hover:text-emerald-400 underline transition-colors"
            >
              {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      )}

      <Navigation />
    </main>
  )
}