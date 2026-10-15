import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient, User } from '@supabase/supabase-js'

const FALLBACK_SUPABASE_URL = 'https://evgjfbykskbdzvgyxavv.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2Z2pmYnlrc2tiZHp2Z3l4YXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMjIzMzEsImV4cCI6MjEwNzU5ODMzMX0.ZMfUU_YPk33cSy8d3QSdd_R-SBuh4RXe9v6mpwhjTpo'

function resolveSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!raw || !raw.trim()) {
    return FALLBACK_SUPABASE_URL
  }

  // Extract clean http/https URL if wrapped in markdown [url](url) or extra punctuation
  const match = raw.match(/https?:\/\/[^\s)\]"'>]+/i)
  let url = match ? match[0] : raw.trim()

  // Fix common typo if project ref is missing 'b'
  if (url.includes('evgjfykskbdzvgyxavv')) {
    url = url.replace('evgjfykskbdzvgyxavv', 'evgjfbykskbdzvgyxavv')
  }

  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin
    }
  } catch {
    // If invalid, fall back to safe default
  }

  return FALLBACK_SUPABASE_URL
}

function resolveSupabaseAnonKey(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!raw || !raw.trim()) {
    return FALLBACK_SUPABASE_ANON_KEY
  }

  // Extract JWT if present or trim quotes/brackets
  const jwtMatch = raw.match(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/)
  if (jwtMatch) {
    return jwtMatch[0]
  }

  const cleaned = raw.trim().replace(/^["'`[]+|["'`\]]+$/g, '')
  return cleaned || FALLBACK_SUPABASE_ANON_KEY
}

const STORAGE_PREFIX = 'dw_fitness_'

function getStoredItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : defaultValue
  } catch {
    return defaultValue
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

function createMockClient(): unknown {
  return {
    auth: {
      async getUser() {
        const user = getStoredItem<User | null>('current_user', null)
        return { data: { user }, error: null }
      },
      async signUp({ email }: { email: string; password?: string }) {
        const user = {
          id: 'user_' + Math.random().toString(36).substring(2, 9),
          email,
          created_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          role: 'authenticated',
        }
        setStoredItem('current_user', user)
        return { data: { user: user as unknown as User }, error: null }
      },
      async signInWithPassword({ email }: { email: string; password?: string }) {
        const user = {
          id: 'user_' + Math.random().toString(36).substring(2, 9),
          email,
          created_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          role: 'authenticated',
        }
        setStoredItem('current_user', user)
        return { data: { user: user as unknown as User }, error: null }
      },
      async signOut() {
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem(STORAGE_PREFIX + 'current_user')
          } catch {
            // ignore
          }
        }
        return { error: null }
      },
      onAuthStateChange() {
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
    },
    from(_tableName: string) {
      void _tableName
      return {
        select() {
          return {
            order() {
              return Promise.resolve({ data: [], error: null })
            },
            then<TResult1 = { data: Record<string, unknown>[]; error: null }>(
              resolve?: ((value: { data: Record<string, unknown>[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
              reject?: ((reason: unknown) => unknown) | null
            ) {
              return Promise.resolve({ data: [], error: null }).then(resolve, reject)
            },
          }
        },
        async insert(records: Record<string, unknown>[]) {
          return { data: records, error: null }
        },
      }
    },
  }
}

let browserClient: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  const url = resolveSupabaseUrl()
  const anonKey = resolveSupabaseAnonKey()

  try {
    if (typeof window === 'undefined') {
      return createBrowserClient(url, anonKey)
    }

    if (!browserClient) {
      browserClient = createBrowserClient(url, anonKey)
    }

    return browserClient
  } catch (err) {
    console.warn('[DW / FITNESS] Error initializing Supabase client, using fallback:', err)
    return createMockClient() as unknown as SupabaseClient
  }
}