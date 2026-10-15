'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/client'
import Navigation from '@/components/Navigation'
import { User } from '@supabase/supabase-js'
import { ShieldCheck, Mail, KeyRound, LogOut, CheckCircle2 } from 'lucide-react'

export default function ProfilePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')

  useEffect(() => {
    let isMounted = true

    // Check existing authenticated user
    supabase.auth.getUser().then(({ data }) => {
      if (isMounted && data?.user) {
        setUser(data.user)
      }
    })

    // Listen to real-time auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (error) {
        setMessageType('error')
        setMessage(`Error: ${error.message}`)
      } else if (data.user) {
        if (data.session) {
          setMessageType('success')
          setMessage('Account created and logged in!')
          setUser(data.user)
        } else {
          setMessageType('info')
          setMessage('Account created! A confirmation email was sent. Please verify your email before logging in.')
          setUser(data.user)
        }
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setMessageType('error')
        setMessage(`Error: ${error.message}`)
      } else if (data.user) {
        setMessageType('success')
        setMessage('Welcome back! Logged in successfully.')
        setUser(data.user)
      }
    }
    setLoading(false)
  }

  async function handleSignOut() {
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setMessageType('info')
    setMessage('Logged out successfully.')
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-28 p-4 max-w-md mx-auto flex flex-col justify-center">
      <header className="mb-6 text-center">
        <h1 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1">
          DW / FITNESS
        </h1>
        <p className="text-2xl font-extrabold tracking-tight text-white">
          {user ? 'Member Profile' : 'Member Access'}
        </p>
      </header>

      {user ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-2xl font-black shadow-inner">
            {user.email?.[0]?.toUpperCase() || 'M'}
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Authenticated Member
            </span>
            <p className="text-sm font-bold text-slate-100 break-all">{user.email}</p>
            <p className="text-[11px] text-slate-500 font-mono mt-1">ID: {user.id.substring(0, 16)}...</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-left space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between items-center">
              <span>Database Connection:</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Role:</span>
              <span className="text-slate-200 capitalize font-medium">{user.role || 'Member'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Auth Provider:</span>
              <span className="text-slate-200 font-medium">Email / Password</span>
            </div>
          </div>

          {message && (
            <p className="text-xs p-2.5 rounded-lg text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {message}
            </p>
          )}

          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-bold py-3 rounded-xl text-xs transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {loading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="text-center mb-5">
            <h2 className="text-lg font-bold text-slate-100">
              {isSignUp ? 'Create Member Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isSignUp
                ? 'Register your account to sync workouts & track streaks'
                : 'Sign in to access your workout programs and history'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                required
                minLength={6}
              />
            </div>

            {message && (
              <p
                className={`text-xs p-3 rounded-xl text-center leading-relaxed ${
                  messageType === 'error'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : messageType === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setMessage('')
              }}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
            >
              {isSignUp ? (
                <>Already have an account? <span className="text-emerald-400 font-semibold underline">Log In</span></>
              ) : (
                <>Don&apos;t have an account? <span className="text-emerald-400 font-semibold underline">Sign Up</span></>
              )}
            </button>
          </div>
        </div>
      )}

      <Navigation />
    </main>
  )
}