import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

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
