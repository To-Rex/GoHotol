import { useEffect, useState } from 'react'
import { Plus, Search, Phone, Mail, MapPin } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { Modal } from '../components/ui/Modal'
import type { Customer } from '../types'

export default function Customers() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({
    full_name: '', first_name: '', last_name: '', phone: '', email: '',
    address: '', nationality: '', gender: '', notes: '', registration_type: 'manual',
  })

  const cid = user?.company_id

  const load = async () => {
    if (!cid) return
    setLoading(true)
    try {
      const { data } = await api.get('/customers', { params: { company_id: cid, limit: 500 } })
      setCustomers(data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [cid])

  const filtered = customers.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.full_name.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
  })

  const handleCreate = async () => {
    if (!cid || !user?.hotel_id) return
    try {
      await api.post('/customers', { ...form, company_id: cid, hotel_id: user.hotel_id })
      setCreateOpen(false)
      setForm({ full_name: '', first_name: '', last_name: '', phone: '', email: '', address: '', nationality: '', gender: '', notes: '', registration_type: 'manual' })
      load()
    } catch { /* ignore */ }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  const getInitials = (name: string) => name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{customers.length} registered</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20">
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c, i) => (
          <div key={c.id} className={`bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all duration-300 animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-sm font-bold flex-shrink-0">
                {getInitials(c.full_name)}
              </div>
              <div className="min-w-0">
                <h3 className="text-white font-semibold truncate">{c.full_name}</h3>
                <span className="text-xs text-zinc-500">{c.nationality || '—'} {c.gender ? `· ${c.gender}` : ''}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {c.phone && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <Phone size={13} className="text-zinc-600" />
                  <span>{c.phone}</span>
                </div>
              )}
              {c.email && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <Mail size={13} className="text-zinc-600" />
                  <span className="truncate">{c.email}</span>
                </div>
              )}
              {c.address && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <MapPin size={13} className="text-zinc-600" />
                  <span className="truncate">{c.address}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Customer" maxWidth="max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Full Name *</label>
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" placeholder="John Doe" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">First Name</label>
              <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Last Name</label>
              <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Nationality</label>
              <input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Address</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setCreateOpen(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
            <button onClick={handleCreate} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl">Create</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
