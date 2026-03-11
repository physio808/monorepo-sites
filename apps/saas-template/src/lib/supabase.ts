import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client admin (server-side uniquement)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type Article = {
  id: string
  keyword: string
  title: string
  slug: string
  content: string
  meta_description: string
  word_count: number
  status: string
  site: string
  published_at: string
  created_at: string
}

export type Keyword = {
  id: string
  keyword: string
  status: string
  priority: number
  created_at: string
}
