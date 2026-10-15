import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Default credentials provided for live preview environment
const FALLBACK_SUPABASE_URL = 'https://evgjfbykskbdzvgyxavv.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2Z2pmYnlrc2tiZHp2Z3l4YXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMjIzMzEsImV4cCI6MjEwNzU5ODMzMX0.ZMfUU_YPk33cSy8d3QSdd_R-SBuh4RXe9v6mpwhjTpo'

function resolveSupabaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!envUrl || !envUrl.trim()) {
    return FALLBACK_SUPABASE_URL
  }
  // Sanitize common typo if ref missing 'b'
  if (envUrl.includes('evgjfykskbdzvgyxavv')) {
    return envUrl.replace('evgjfykskbdzvgyxavv', 'evgjfbykskbdzvgyxavv')
  }
  return envUrl
}

function resolveSupabaseAnonKey(): string {
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!envKey || !envKey.trim()) {
    return FALLBACK_SUPABASE_ANON_KEY
  }
  return envKey
}

let browserClient: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  const url = resolveSupabaseUrl()
  const anonKey = resolveSupabaseAnonKey()

  if (typeof window === 'undefined') {
    return createBrowserClient(url, anonKey)
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url, anonKey)
  }

  return browserClient
}