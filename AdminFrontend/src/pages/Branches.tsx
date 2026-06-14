import { useState, useEffect, type FormEvent } from 'react'
import { Plus, Search, Edit2, GitBranch } from 'lucide-react'
import api from '../lib/api'
import type { Branch, Hotel } from '../types'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'

export default function Branches() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedHotelId, setSelectedHotelId] = useState<number>(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Branch | null>(null)
  const [form, setForm] = useState({
    hotel_id: 0,
    name: '',
    address: '',
    email: '',
    contact_number: '',
    working_hours_start: '09:00',
    working_hours_end: '18:00',
    description: '',
  })

  const fetchHotels = async () => {
    try {
      const { data } = await api.get('/hotels', { params: { limit: 200 } })
      const h = Array.isArray(data) ? data : data.items || []
      setHotels(h)
      if (h.length > 0 && !selectedHotelId) setSelectedHotelId(h[0].id)
    } finally {
      setLoading(false)
    }
  }

  const fetchBranches = async (hotelId: number) => {
    if (!hotelId) return
    const { data } = await api.get('/branches', { params: { hotel_id: hotelId } })
    setBranches(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    fetchHotels()
  }, [])

  useEffect(() => {
    if (selectedHotelId) fetchBranches(selectedHotelId)
  }, [selectedHotelId])

  const openCreate = () => {
    setEditing(null)
    setForm({ hotel_id: selectedHotelId, name: '', address: '', email: '', contact_number: '', working_hours_start: '09:00', working_hours_end: '18:00', description: '' })
    setModalOpen(true)
  }

  const openEdit = (b: Branch) => {
    setEditing(b)
    setForm({
      hotel_id: b.hotel_id,
      name: b.name,
      address: b.address || '',
      email: b.email || '',
      contact_number: b.contact_numbers?.[0] || '',
      working_hours_start: b.working_hours_start || '09:00',
      working_hours_end: b.working_hours_end || '18:00',
      description: b.description || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      contact_numbers: form.contact_number ? [form.contact_number] : [],
    }
    if (editing) {
      await api.put(`/branches/${editing.id}`, payload)
    } else {
      await api.post('/branches', payload)
    }
    setModalOpen(false)
    fetchBranches(selectedHotelId)
  }

  const handleToggle = async (b: Branch) => {
    await api.put(`/branches/${b.id}`, { is_active: !b.is_active })
    fetchBranches(selectedHotelId)
  }

  const filtered = branches.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  )

  const selectedHotel = hotels.find((h) => h.id === selectedHotelId)

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Branches</h2>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={16} /> New Branch
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <select
          value={selectedHotelId}
          onChange={(e) => setSelectedHotelId(Number(e.target.value))}
          className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
        >
          {hotels.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>

        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search branches..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>
      </div>

      {selectedHotel && (
        <p className="text-xs text-zinc-500 mb-4">
          Showing branches for <span className="text-zinc-300">{selectedHotel.name}</span>
          {selectedHotel.city ? ` — ${selectedHotel.city}` : ''}
        </p>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Address</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Working Hours</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <GitBranch size={14} className="text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{b.name}</p>
                      {b.email && <p className="text-xs text-zinc-500">{b.email}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400 hidden md:table-cell">{b.address || '—'}</td>
                <td className="px-4 py-3 text-sm text-zinc-400 hidden lg:table-cell">
                  {b.working_hours_start && b.working_hours_end
                    ? `${b.working_hours_start} — ${b.working_hours_end}`
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggle(b)}>
                    <Badge variant={b.is_active ? 'success' : 'danger'}>
                      {b.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(b)} className="text-zinc-400 hover:text-white transition-colors p-1">
                    <Edit2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-zinc-500 text-sm">
                No branches found for this hotel
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Branch' : 'New Branch'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Hotel</label>
            <select value={form.hotel_id} onChange={(e) => setForm({ ...form, hotel_id: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500">
              {hotels.map((h) => (<option key={h.id} value={h.id}>{h.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Address</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Contact Number</label>
            <input value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Working Hours (Start)</label>
              <input type="time" value={form.working_hours_start} onChange={(e) => setForm({ ...form, working_hours_start: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Working Hours (End)</label>
              <input type="time" value={form.working_hours_end} onChange={(e) => setForm({ ...form, working_hours_end: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
            {editing ? 'Update' : 'Create'} Branch
          </button>
        </form>
      </Modal>
    </div>
  )
}
