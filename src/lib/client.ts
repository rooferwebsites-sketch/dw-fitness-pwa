import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const FALLBACK_SUPABASE_URL = 'https://evgjfbykskbdzvgyxavv.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2Z2pmYnlrc2tiZHp2Z3l4YXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMjIzMzEsImV4cCI6MjEwNzU5ODMzMX0.ZMfUU_YPk33cSy8d3QSdd_R-SBuh4RXe9v6mpwhjTpo'

function resolveSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!raw || !raw.trim()) return FALLBACK_SUPABASE_URL
  const match = raw.match(/https?:\/\/[^\s)\]"'>]+/i)
  let url = match ? match[0] : raw.trim()
  if (url.includes('evgjfykskbdzvgyxavv')) {
    url = url.replace('evgjfykskbdzvgyxavv', 'evgjfbykskbdzvgyxavv')
  }
  return url
}

function resolveSupabaseAnonKey(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!raw || !raw.trim()) return FALLBACK_SUPABASE_ANON_KEY
  const match = raw.match(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/)
  return match ? match[0] : raw.trim().replace(/^["'`[]+|["'`\]]+$/g, '')
}

let client: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  const url = resolveSupabaseUrl()
  const key = resolveSupabaseAnonKey()
  if (typeof window === 'undefined') return createBrowserClient(url, key)
  if (!client) client = createBrowserClient(url, key)
  return client
}