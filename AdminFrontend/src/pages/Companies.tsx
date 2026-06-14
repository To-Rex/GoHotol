import { useState, useEffect, type FormEvent } from 'react'
import { Plus, Search, Building2, Edit2 } from 'lucide-react'
import api from '../lib/api'
import type { Company } from '../types'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Company | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', country: '', city: '', description: '' })

  const fetchCompanies = async () => {
    try {
      const { data } = await api.get('/companies', { params: { limit: 200 } })
      setCompanies(Array.isArray(data) ? data : data.items || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCompanies() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', slug: '', country: '', city: '', description: '' })
    setModalOpen(true)
  }

  const openEdit = (c: Company) => {
    setEditing(c)
    setForm({ name: c.name, slug: c.slug, country: c.country || '', city: c.city || '', description: c.description || '' })
    setModalOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (editing) {
      await api.put(`/companies/${editing.id}`, form)
    } else {
      await api.post('/companies', form)
    }
    setModalOpen(false)
    fetchCompanies()
  }

  const handleToggle = async (c: Company) => {
    await api.put(`/companies/${c.id}`, { is_active: !c.is_active })
    fetchCompanies()
  }

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Companies</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Company
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies..."
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Slug</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Country</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <Building2 size={14} className="text-indigo-400" />
                    </div>
                    <span className="text-sm text-white font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400 hidden md:table-cell">{c.slug}</td>
                <td className="px-4 py-3 text-sm text-zinc-400 hidden lg:table-cell">{c.country || '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggle(c)}>
                    <Badge variant={c.is_active ? 'success' : 'danger'}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(c)} className="text-zinc-400 hover:text-white transition-colors p-1">
                    <Edit2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-zinc-500 text-sm">
                  No companies found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Company' : 'New Company'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Slug</label>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Country</label>
              <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">City</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <button type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
            {editing ? 'Update' : 'Create'} Company
          </button>
        </form>
      </Modal>
    </div>
  )
}
