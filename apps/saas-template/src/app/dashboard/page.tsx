import { supabaseAdmin } from '@/lib/supabase'

export default async function Dashboard() {
  const { data: articles } = await supabaseAdmin
    .from('articles')
    .select('id, title, keyword, status, word_count, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: keywords } = await supabaseAdmin
    .from('keywords')
    .select('id, keyword, status, priority')
    .order('priority', { ascending: false })
    .limit(20)

  const { data: budget } = await supabaseAdmin
    .from('budget_config')
    .select('*')
    .limit(1)
    .single()

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard n8n SEO</h1>

      {/* Budget */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Budget</h2>
        <p className="text-green-600 font-bold">0€ — Claude CLI Proxy</p>
        <p className="text-sm text-zinc-500">
          Exa: {budget?.exa_calls_used ?? 0}/{budget?.exa_calls_limit ?? 1000} appels ·
          Firecrawl: {budget?.firecrawl_pages_used ?? 0}/{budget?.firecrawl_pages_limit ?? 500} pages
        </p>
      </div>

      {/* Keywords */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Keywords ({keywords?.length ?? 0})</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-zinc-500 border-b"><th className="pb-2">Keyword</th><th>Statut</th><th>Priorité</th></tr></thead>
          <tbody>
            {keywords?.map(k => (
              <tr key={k.id} className="border-b last:border-0">
                <td className="py-2">{k.keyword}</td>
                <td><span className={`px-2 py-0.5 rounded text-xs ${k.status === 'processed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{k.status}</span></td>
                <td>{k.priority}</td>
              </tr>
            ))}
            {!keywords?.length && <tr><td colSpan={3} className="py-4 text-zinc-400">Aucun keyword</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Articles */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Articles ({articles?.length ?? 0})</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-zinc-500 border-b"><th className="pb-2">Titre</th><th>Statut</th><th>Mots</th><th>Date</th></tr></thead>
          <tbody>
            {articles?.map(a => (
              <tr key={a.id} className="border-b last:border-0">
                <td className="py-2 max-w-xs truncate">{a.title || a.keyword}</td>
                <td><span className={`px-2 py-0.5 rounded text-xs ${a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'}`}>{a.status}</span></td>
                <td>{a.word_count ?? '-'}</td>
                <td>{new Date(a.created_at).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
            {!articles?.length && <tr><td colSpan={4} className="py-4 text-zinc-400">Aucun article</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
