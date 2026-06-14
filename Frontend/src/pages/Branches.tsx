import { useState, useEffect, type FormEvent } from 'react'
import { Plus, Search, Edit2, GitBranch, Clock, MapPin, Mail, Phone } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import type { Branch, Hotel } from '../types'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'

export default function Branches() {
  const { user } = useAuth()
  const [branches, setBranches] = useState<Branch[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedHotelId, setSelectedHotelId] = useState<number>(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Branch | null>(null)
  const [form, setForm] = useState({
    hotel_id: 0, name: '', address: '', email: '',
    contact_number: '', working_hours_start: '09:00', working_hours_end: '18:00', description: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/hotels', { params: { limit: 200 } })
        const h = Array.isArray(data) ? data : data.items || []
        setHotels(h)
        const hid = user?.hotel_id || (h.length > 0 ? h[0].id : 0)
        if (hid) {
          setSelectedHotelId(hid)
          const { data: bData } = await api.get('/branches', { params: { hotel_id: hid } })
          setBranches(Array.isArray(bData) ? bData : [])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.hotel_id])

  const fetchBranches = async (hotelId: number) => {
    if (!hotelId) return
    const { data } = await api.get('/branches', { params: { hotel_id: hotelId } })
    setBranches(Array.isArray(data) ? data : [])
  }

  const handleHotelChange = (hid: number) => {
    setSelectedHotelId(hid)
    fetchBranches(hid)
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ hotel_id: selectedHotelId, name: '', address: '', email: '', contact_number: '', working_hours_start: '09:00', working_hours_end: '18:00', description: '' })
    setModalOpen(true)
  }

  const openEdit = (b: Branch) => {
    setEditing(b)
    setForm({
      hotel_id: b.hotel_id, name: b.name, address: b.address || '',
      email: b.email || '', contact_number: b.contact_numbers?.[0] || '',
      working_hours_start: b.working_hours_start || '09:00',
      working_hours_end: b.working_hours_end || '18:00',
      description: b.description || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const payload = { ...form, contact_numbers: form.contact_number ? [form.contact_number] : [] }
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

  const filtered = branches.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
  const selectedHotel = hotels.find((h) => h.id === selectedHotelId)

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Branches</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{branches.length} branches</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20">
          <Plus size={18} /> New Branch
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select value={selectedHotelId} onChange={(e) => handleHotelChange(Number(e.target.value))}
          className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500">
          {hotels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search branches..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700" />
        </div>
      </div>

      {selectedHotel && (
        <p className="text-xs text-zinc-500">
          Showing branches for <span className="text-zinc-300">{selectedHotel.name}</span>
          {selectedHotel.city ? ` — ${selectedHotel.city}` : ''}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((b, i) => (
          <div key={b.id} className={`bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all duration-300 animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <GitBranch size={18} className="text-violet-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{b.name}</h3>
                  {b.email && <p className="text-xs text-zinc-500">{b.email}</p>}
                </div>
              </div>
              <button onClick={() => handleToggle(b)}>
                <Badge variant={b.is_active ? 'success' : 'danger'}>{b.is_active ? 'Active' : 'Inactive'}</Badge>
              </button>
            </div>
            <div className="space-y-1.5 text-sm">
              {b.address && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <MapPin size={13} className="text-zinc-600" /> <span>{b.address}</span>
                </div>
              )}
              {b.email && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <Mail size={13} className="text-zinc-600" /> <span>{b.email}</span>
                </div>
              )}
              {b.contact_numbers && b.contact_numbers.length > 0 && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <Phone size={13} className="text-zinc-600" /> <span>{b.contact_numbers[0]}</span>
                </div>
              )}
              {(b.working_hours_start || b.working_hours_end) && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <Clock size={13} className="text-zinc-600" />
                  <span>{b.working_hours_start || '—'} — {b.working_hours_end || '—'}</span>
                </div>
              )}
            </div>
            <button onClick={() => openEdit(b)} className="mt-4 w-full px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
              <Edit2 size={13} /> Edit
            </button>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Branch' : 'New Branch'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Hotel</label>
            <select value={form.hotel_id} onChange={(e) => setForm({ ...form, hotel_id: Number(e.target.value) })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
              {hotels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Address</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Contact Number</label>
            <input value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Start</label>
              <input type="time" value={form.working_hours_start} onChange={(e) => setForm({ ...form, working_hours_start: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">End</label>
              <input type="time" value={form.working_hours_end} onChange={(e) => setForm({ ...form, working_hours_end: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl">
              {editing ? 'Update' : 'Create'} Branch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
