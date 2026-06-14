import { useEffect, useState } from 'react'
import { Plus, Search, Filter, Grid3X3, List, Wifi, Coffee, Tv, Wind, Bath, ChevronDown } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import type { Room, RoomCategory, RoomStatus, RoomType } from '../types'

const featureIcons: Record<string, React.ElementType> = {
  wifi: Wifi, tv: Tv, ac: Wind, coffee: Coffee, bath: Bath,
}

export default function Rooms() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState<Room[]>([])
  const [categories, setCategories] = useState<RoomCategory[]>([])
  const [statuses, setStatuses] = useState<RoomStatus[]>([])
  const [types, setTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({
    room_number: '', name: '', category_id: 0, room_type_id: 0, status_id: 0,
    base_price: 0, max_guests: 2, bed_type: '', bed_count: 1,
    description: '', size_sqm: 0, floor_number: 0,
  })

  const hid = user?.hotel_id

  const load = async () => {
    if (!hid) return
    setLoading(true)
    try {
      const [r, c, s, t] = await Promise.all([
        api.get('/rooms', { params: { hotel_id: hid, limit: 1000 } }),
        api.get('/rooms/categories'),
        api.get('/rooms/statuses'),
        api.get('/rooms/types'),
      ])
      setRooms(r.data)
      setCategories(c.data)
      setStatuses(s.data)
      setTypes(t.data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [hid])

  const getStatusInfo = (statusId: number | null) => {
    if (!statusId) return { name: 'Unknown', color: '#808080' }
    const s = statuses.find((st) => st.id === statusId)
    return s ? { name: s.name, color: s.color } : { name: 'Unknown', color: '#808080' }
  }

  const getCategoryName = (id: number | null) => categories.find((c) => c.id === id)?.name ?? '—'
  const getTypeName = (id: number | null) => types.find((t) => t.id === id)?.name ?? '—'

  const filtered = rooms.filter((r) => {
    if (search && !r.room_number.toLowerCase().includes(search.toLowerCase()) && !r.name?.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStatus && r.status_id !== filterStatus) return false
    return true
  })

  const handleCreate = async () => {
    try {
      await api.post('/rooms', { ...form, hotel_id: hid })
      setCreateOpen(false)
      load()
    } catch { /* ignore */ }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Rooms</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{rooms.length} rooms total</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus size={18} /> Add Room
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-all"
          />
        </div>

        <select
          value={filterStatus ?? ''}
          onChange={(e) => setFilterStatus(e.target.value ? Number(e.target.value) : null)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-700"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 ${viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 ${viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((room, i) => {
            const status = getStatusInfo(room.status_id)
            return (
              <div key={room.id} className={`bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all duration-300 animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold text-white">{room.room_number}</p>
                    <p className="text-xs text-zinc-500">{room.name || getCategoryName(room.category_id)}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: `${status.color}15`, color: status.color, border: `1px solid ${status.color}30` }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
                    {status.name}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-zinc-500">Type</span><span className="text-zinc-300">{getTypeName(room.room_type_id)}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Guests</span><span className="text-zinc-300">{room.max_guests}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Floor</span><span className="text-zinc-300">{room.floor_number ?? '—'}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Price</span><span className="text-white font-medium">${room.base_price}</span></div>
                </div>
                {room.feature_ids && room.feature_ids.length > 0 && (
                  <div className="flex gap-1.5 mt-3 pt-3 border-t border-zinc-800/50">
                    {room.feature_ids.slice(0, 4).map((fid) => {
                      const feat = room.feature_ids ? String(fid) : ''
                      const Icon = featureIcons[feat] ?? Coffee
                      return <Icon key={fid} size={14} className="text-zinc-500" />
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">Room</th>
                  <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">Category</th>
                  <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">Floor</th>
                  <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">Price</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((room) => {
                  const status = getStatusInfo(room.status_id)
                  return (
                    <tr key={room.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-white font-medium">{room.room_number}</span>
                        <span className="text-xs text-zinc-500 block">{room.name}</span>
                      </td>
                      <td className="px-5 py-3 text-zinc-300 text-sm">{getCategoryName(room.category_id)}</td>
                      <td className="px-5 py-3 text-zinc-300 text-sm">{getTypeName(room.room_type_id)}</td>
                      <td className="px-5 py-3 text-zinc-300 text-sm">{room.floor_number ?? '—'}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium" style={{ background: `${status.color}15`, color: status.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
                          {status.name}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-white text-sm font-medium">${room.base_price}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Room">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Room Number *</label>
              <input value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Category</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                <option value={0}>Select</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Type</label>
              <select value={form.room_type_id} onChange={(e) => setForm({ ...form, room_type_id: Number(e.target.value) })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                <option value={0}>Select</option>
                {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Status</label>
              <select value={form.status_id} onChange={(e) => setForm({ ...form, status_id: Number(e.target.value) })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                <option value={0}>Select</option>
                {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Base Price</label>
              <input type="number" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Max Guests</label>
              <input type="number" value={form.max_guests} onChange={(e) => setForm({ ...form, max_guests: Number(e.target.value) })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Floor</label>
              <input type="number" value={form.floor_number} onChange={(e) => setForm({ ...form, floor_number: Number(e.target.value) })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Bed Type</label>
              <input value={form.bed_type} onChange={(e) => setForm({ ...form, bed_type: e.target.value })} placeholder="e.g. King" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Bed Count</label>
              <input type="number" value={form.bed_count} onChange={(e) => setForm({ ...form, bed_count: Number(e.target.value) })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setCreateOpen(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all">Create Room</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
