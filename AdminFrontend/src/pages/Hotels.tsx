import { useState, useEffect, type FormEvent } from 'react'
import { Plus, Search, Edit2, Star, GitBranch, ChevronDown, ChevronRight } from 'lucide-react'
import { Hotel as HotelIcon } from 'lucide-react'
import api from '../lib/api'
import type { Hotel as HotelType, Company, Branch } from '../types'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'

export default function Hotels() {
  const [hotels, setHotels] = useState<HotelType[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [branchesMap, setBranchesMap] = useState<Record<number, Branch[]>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<HotelType | null>(null)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [loadingBranches, setLoadingBranches] = useState<Set<number>>(new Set())
  const [form, setForm] = useState({ name: '', slug: '', company_id: 0, star_rating: 0, city: '', country: '' })

  const fetchData = async () => {
    try {
      const [hRes, cRes] = await Promise.all([
        api.get('/hotels', { params: { limit: 200 } }),
        api.get('/companies', { params: { limit: 200 } }),
      ])
      setHotels(Array.isArray(hRes.data) ? hRes.data : hRes.data.items || [])
      setCompanies(Array.isArray(cRes.data) ? cRes.data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const toggleExpand = async (hotelId: number) => {
    const next = new Set(expanded)
    if (next.has(hotelId)) {
      next.delete(hotelId)
      setExpanded(next)
    } else {
      next.add(hotelId)
      setExpanded(next)
      if (!branchesMap[hotelId]) {
        setLoadingBranches((prev) => new Set(prev).add(hotelId))
        try {
          const { data } = await api.get('/branches', { params: { hotel_id: hotelId } })
          setBranchesMap((prev) => ({ ...prev, [hotelId]: Array.isArray(data) ? data : [] }))
        } finally {
          setLoadingBranches((prev) => {
            const s = new Set(prev)
            s.delete(hotelId)
            return s
          })
        }
      }
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', slug: '', company_id: companies[0]?.id || 0, star_rating: 0, city: '', country: '' })
    setModalOpen(true)
  }

  const openEdit = (h: HotelType) => {
    setEditing(h)
    setForm({ name: h.name, slug: h.slug, company_id: h.company_id, star_rating: h.star_rating || 0, city: h.city || '', country: h.country || '' })
    setModalOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (editing) {
      await api.put(`/hotels/${editing.id}`, form)
    } else {
      await api.post('/hotels', form)
    }
    setModalOpen(false)
    fetchData()
  }

  const handleToggle = async (h: HotelType) => {
    await api.put(`/hotels/${h.id}`, { is_active: !h.is_active })
    fetchData()
  }

  const handleBranchToggle = async (b: Branch) => {
    await api.put(`/branches/${b.id}`, { is_active: !b.is_active })
    setBranchesMap((prev) => ({
      ...prev,
      [b.hotel_id]: (prev[b.hotel_id] || []).map((br) =>
        br.id === b.id ? { ...br, is_active: !b.is_active } : br,
      ),
    }))
  }

  const filtered = hotels.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Hotels</h2>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={16} /> New Hotel
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search hotels..."
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors" />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider w-10"></th>
              <th className="text-left px-0 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Slug</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Branches</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Stars</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filtered.map((h) => {
              const isExpanded = expanded.has(h.id)
              const isLoadingBranches = loadingBranches.has(h.id)
              const hotelBranches = branchesMap[h.id] || []

              return (
                <>
                  <tr key={h.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleExpand(h.id)}
                        className="text-zinc-500 hover:text-white transition-colors"
                      >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </td>
                    <td className="px-0 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <HotelIcon size={14} className="text-emerald-400" />
                        </div>
                        <span className="text-sm text-white font-medium">{h.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400 hidden md:table-cell">{h.slug}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <GitBranch size={14} className="text-violet-400" />
                        <span className="text-sm text-zinc-400">{hotelBranches.length || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: h.star_rating || 0 }).map((_, i) => (
                          <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(h)}>
                        <Badge variant={h.is_active ? 'success' : 'danger'}>{h.is_active ? 'Active' : 'Inactive'}</Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(h)} className="text-zinc-400 hover:text-white transition-colors p-1">
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${h.id}-branches`}>
                      <td colSpan={7} className="px-0 py-0 bg-zinc-950/50">
                        {isLoadingBranches ? (
                          <div className="px-12 py-4 text-sm text-zinc-500">Loading branches...</div>
                        ) : hotelBranches.length === 0 ? (
                          <div className="px-12 py-4 text-sm text-zinc-600 italic">
                            No branches — <a href="/branches" className="text-indigo-400 hover:text-indigo-300 not-italic">add a branch</a>
                          </div>
                        ) : (
                          <div className="px-12 py-2 divide-y divide-zinc-800/30">
                            {hotelBranches.map((b) => (
                              <div key={b.id} className="flex items-center justify-between py-2.5">
                                <div className="flex items-center gap-3">
                                  <GitBranch size={14} className="text-violet-400 flex-shrink-0" />
                                  <div>
                                    <span className="text-sm text-white">{b.name}</span>
                                    {b.address && <span className="text-xs text-zinc-500 ml-2">— {b.address}</span>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  {b.working_hours_start && b.working_hours_end && (
                                    <span className="text-xs text-zinc-500 hidden sm:inline">
                                      {b.working_hours_start} – {b.working_hours_end}
                                    </span>
                                  )}
                                  <button onClick={() => handleBranchToggle(b)}>
                                    <Badge variant={b.is_active ? 'success' : 'danger'}>
                                      {b.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-zinc-500 text-sm">No hotels found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Hotel' : 'New Hotel'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Company</label>
            <select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500">
              {companies.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Stars</label>
              <input type="number" min={0} max={5} value={form.star_rating} onChange={(e) => setForm({ ...form, star_rating: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
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
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
            {editing ? 'Update' : 'Create'} Hotel
          </button>
        </form>
      </Modal>
    </div>
  )
}
