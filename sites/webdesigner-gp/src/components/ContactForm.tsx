import { useState } from 'react'

export default function ContactForm() {
  const [status, setStatus] = useState<'idle'|'sending'|'ok'|'error'>('idle')
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', budget: '', message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    // Simuler envoi (à connecter à n8n webhook)
    await new Promise(r => setTimeout(r, 1000))
    setStatus('ok')
  }

  if (status === 'ok') return (
    <div style={{padding:'2rem',background:'#f0fdf4',borderRadius:'0.75rem',textAlign:'center'}}>
      <p style={{fontSize:'2rem'}}>✅</p>
      <p style={{fontWeight:700,color:'#166534',marginTop:'0.5rem'}}>Message envoyé !</p>
      <p style={{color:'#15803d',marginTop:'0.5rem'}}>Je vous réponds sous 24h.</p>
    </div>
  )

  const field = (name: keyof typeof form, label: string, type = 'text', required = true) => (
    <div>
      <label style={{display:'block',fontWeight:600,marginBottom:'0.375rem',fontSize:'0.875rem'}}>{label}{required && ' *'}</label>
      <input
        type={type} name={name} required={required}
        value={form[name]} onChange={e => setForm(p => ({...p, [name]: e.target.value}))}
        style={{width:'100%',padding:'0.75rem 1rem',border:'1px solid #e2e8f0',borderRadius:'0.5rem',fontSize:'1rem',outline:'none'}}
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.25rem'}}>
        {field('name','Votre nom')}
        {field('email','Email','email')}
      </div>
      {field('phone','Téléphone (optionnel)','tel',false)}
      <div>
        <label style={{display:'block',fontWeight:600,marginBottom:'0.375rem',fontSize:'0.875rem'}}>Service souhaité *</label>
        <select value={form.service} onChange={e => setForm(p => ({...p, service: e.target.value}))} required
          style={{width:'100%',padding:'0.75rem 1rem',border:'1px solid #e2e8f0',borderRadius:'0.5rem',fontSize:'1rem'}}>
          <option value="">Choisir un service</option>
          <option>Création site vitrine</option>
          <option>Création site e-commerce</option>
          <option>Référencement SEO</option>
          <option>Refonte site existant</option>
          <option>Autre</option>
        </select>
      </div>
      <div>
        <label style={{display:'block',fontWeight:600,marginBottom:'0.375rem',fontSize:'0.875rem'}}>Budget envisagé</label>
        <select value={form.budget} onChange={e => setForm(p => ({...p, budget: e.target.value}))}
          style={{width:'100%',padding:'0.75rem 1rem',border:'1px solid #e2e8f0',borderRadius:'0.5rem',fontSize:'1rem'}}>
          <option value="">Sélectionner</option>
          <option>Moins de 1 000€</option>
          <option>1 000€ – 3 000€</option>
          <option>3 000€ – 5 000€</option>
          <option>Plus de 5 000€</option>
        </select>
      </div>
      <div>
        <label style={{display:'block',fontWeight:600,marginBottom:'0.375rem',fontSize:'0.875rem'}}>Votre projet *</label>
        <textarea value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} required rows={5}
          placeholder="Décrivez votre projet, votre activité et vos objectifs..."
          style={{width:'100%',padding:'0.75rem 1rem',border:'1px solid #e2e8f0',borderRadius:'0.5rem',fontSize:'1rem',resize:'vertical'}} />
      </div>
      <button type="submit" disabled={status === 'sending'}
        style={{background:'#0e7490',color:'white',padding:'1rem 2rem',borderRadius:'0.75rem',fontWeight:700,fontSize:'1rem',border:'none',cursor:'pointer'}}>
        {status === 'sending' ? 'Envoi en cours...' : 'Envoyer ma demande →'}
      </button>
      <p style={{fontSize:'0.8rem',color:'#64748b',textAlign:'center'}}>Réponse garantie sous 24h · Sans engagement</p>
    </form>
  )
}
