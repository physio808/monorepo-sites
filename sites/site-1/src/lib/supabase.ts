import { createClient } from '@supabase/supabase-js'

// En SSG (build-time), ces variables ne sont JAMAIS exposées au navigateur
const supabaseUrl = import.meta.env.SUPABASE_URL
const supabaseKey = import.meta.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('[supabase] SUPABASE_URL ou SUPABASE_SERVICE_KEY manquant — articles désactivés')
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

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
