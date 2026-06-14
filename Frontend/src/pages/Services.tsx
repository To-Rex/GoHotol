import { useEffect, useState } from 'react'
import { Plus, Search, Tag, Wrench } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { Modal } from '../components/ui/Modal'
import type { Service, ServiceCategory } from '../types'

export default function Services() {
  const { user } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', category_id: 0, price: 0, tax_rate: 0, description: '' })
  const [catForm, setCatForm] = useState({ name: '', slug: '' })
  const [catOpen, setCatOpen] = useState(false)

  const cid = user?.company_id

  const load = async () => {
    if (!cid) return
    setLoading(true)
    try {
      const [s, c] = await Promise.all([
        api.get('/services', { params: { company_id: cid } }),
        api.get('/services/categories', { params: { company_id: cid } }),
      ])
      setServices(s.data)
      setCategories(c.data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [cid])

  const getCategoryName = (id: number | null) => categories.find((c) => c.id === id)?.name ?? '—'

  const filtered = services.filter((s) => {
    if (!search) return true
    return s.name.toLowerCase().includes(search.toLowerCase())
  })

  const handleCreate = async () => {
    try {
      await api.post('/services', { ...form, company_id: cid, hotel_id: user?.hotel_id })
      setCreateOpen(false)
      setForm({ name: '', slug: '', category_id: 0, price: 0, tax_rate: 0, description: '' })
      load()
    } catch { /* ignore */ }
  }

  const handleCreateCategory = async () => {
    try {
      await api.post('/services/categories', { ...catForm, company_id: cid })
      setCatOpen(false)
      setCatForm({ name: '', slug: '' })
      load()
    } catch { /* ignore */ }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Services</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{services.length} services</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCatOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 border border-zinc-700 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-all">
            <Tag size={16} /> Add Category
          </button>
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20">
            <Plus size={18} /> Add Service
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700" />
        </div>
        {categories.map((cat) => (
          <button key={cat.id} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s, i) => (
          <div key={s.id} className={`bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all duration-300 animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center">
                <Wrench size={20} className="text-indigo-400" />
              </div>
              {s.category_id && (
                <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-md">{getCategoryName(s.category_id)}</span>
              )}
            </div>
            <h3 className="text-white font-semibold">{s.name}</h3>
            <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{s.description || 'No description'}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/50">
              <span className="text-lg font-bold text-white">${s.price}</span>
              {s.tax_rate > 0 && <span className="text-xs text-zinc-500">Tax: {s.tax_rate}%</span>}
            </div>
          </div>
        ))}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Service">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Category</label>
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
              <option value={0}>Select</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Price</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Tax Rate (%)</label>
              <input type="number" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: Number(e.target.value) })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setCreateOpen(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
            <button onClick={handleCreate} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl">Create</button>
          </div>
        </div>
      </Modal>

      <Modal open={catOpen} onClose={() => setCatOpen(false)} title="Add Category">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Name</label>
            <input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Slug</label>
            <input value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setCatOpen(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
            <button onClick={handleCreateCategory} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl">Create</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
