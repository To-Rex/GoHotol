import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Search, Edit2, Trash2, Briefcase, Mail, Phone, MapPin, Key, Building } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import type { Employee, Hotel, Branch, Role } from '../types'

export default function Employees() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedHotelId, setSelectedHotelId] = useState<number>(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [createdCreds, setCreatedCreds] = useState<{ username: string; password: string } | null>(null)
  const [form, setForm] = useState({
    hotel_id: 0, branch_id: 0, full_name: '', role_id: 0, department: '',
    phone: '', email: '', address: '', create_account: true, username: '',
    password: Math.random().toString(36).slice(2, 10), status: 'active', notes: '',
  })

  const cid = user?.company_id
  const selectedRole = roles.find((r) => r.id === form.role_id)

  const regeneratePassword = () => setForm((f) => ({ ...f, password: Math.random().toString(36).slice(2, 10) }))

  useEffect(() => {
    const load = async () => {
      if (!cid) { setLoading(false); return }
      try {
        const [eRes, hRes, rRes, bRes] = await Promise.all([
          api.get('/employees', { params: { limit: 500 } }),
          api.get('/hotels', { params: { limit: 200 } }),
          api.get('/roles'),
          user?.hotel_id ? api.get('/branches', { params: { hotel_id: user.hotel_id } }) : Promise.resolve({ data: [] }),
        ])
        setEmployees(Array.isArray(eRes.data) ? eRes.data : [])
        const h = Array.isArray(hRes.data) ? hRes.data : hRes.data.items || []
        setHotels(h)
        setRoles(Array.isArray(rRes.data) ? rRes.data.filter((r: Role) => r.is_active) : [])
        setBranches(Array.isArray(bRes.data) ? bRes.data : [])
        const hid = user?.hotel_id || (h.length > 0 ? h[0].id : 0)
        if (hid) setSelectedHotelId(hid)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [cid, user?.hotel_id])

  useEffect(() => {
    if (selectedHotelId) {
      api.get('/branches', { params: { hotel_id: selectedHotelId } }).then(({ data }) => {
        const brs = Array.isArray(data) ? data : []
        setBranches(brs)
        if (brs.length > 0) setForm((f) => ({ ...f, branch_id: brs[0].id }))
      })
    }
  }, [selectedHotelId])

  const openCreate = () => {
    setEditing(null)
    setCreatedCreds(null)
    const bid = branches.length > 0 ? branches[0].id : 0
    setForm({
      hotel_id: selectedHotelId, branch_id: bid, full_name: '',
      role_id: roles[0]?.id || 0, department: '', phone: '', email: '', address: '',
      create_account: true, username: '', password: Math.random().toString(36).slice(2, 10),
      status: 'active', notes: '',
    })
    setModalOpen(true)
  }

  const openEdit = (e: Employee) => {
    setEditing(e)
    setCreatedCreds(null)
    setForm({
      hotel_id: e.hotel_id || 0, branch_id: e.branch_id || 0, full_name: e.full_name,
      role_id: 0, department: e.department || '', phone: e.phone || '',
      email: e.email || '', address: e.address || '',
      create_account: false, username: '', password: '',
      status: e.status, notes: e.notes || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const empPayload = {
      full_name: form.full_name, company_id: cid,
      hotel_id: form.hotel_id || null, branch_id: form.branch_id || null,
      position: selectedRole?.name || null, department: form.department || null,
      phone: form.phone || null, email: form.email || null,
      address: form.address || null, status: form.status, notes: form.notes || null,
    }

    if (editing) {
      await api.put(`/employees/${editing.id}`, empPayload)
      setModalOpen(false)
      const { data } = await api.get('/employees', { params: { limit: 500 } })
      setEmployees(Array.isArray(data) ? data : [])
      return
    }

    await api.post('/employees', empPayload)

    if (form.create_account && form.username && form.password) {
      const autoUsername = form.username || form.full_name.toLowerCase().replace(/\s+/g, '.')
      try {
        const { data: newUser } = await api.post('/auth/register', {
          username: autoUsername, email: form.email || `${autoUsername}@xms.local`,
          password: form.password, full_name: form.full_name, phone: form.phone || undefined,
        })
        if (form.role_id && newUser?.id) {
          await api.post('/roles/users/assign-roles', { user_id: newUser.id, role_ids: [form.role_id] })
        }
        setCreatedCreds({ username: autoUsername, password: form.password })
      } catch { setCreatedCreds(null) }
    } else {
      setModalOpen(false)
    }

    const { data } = await api.get('/employees', { params: { limit: 500 } })
    setEmployees(Array.isArray(data) ? data : [])
  }

  const handleDelete = async (e: Employee) => {
    if (!confirm(`Delete ${e.full_name}? This action cannot be undone.`)) return
    await api.delete(`/employees/${e.id}`)
    setEmployees((prev) => prev.filter((p) => p.id !== e.id))
  }

  const closeModal = () => { setModalOpen(false); setCreatedCreds(null) }

  const filtered = employees.filter((e) => {
    if (!search) return true
    const q = search.toLowerCase()
    return e.full_name.toLowerCase().includes(q) || (e.position || '').toLowerCase().includes(q) || (e.department || '').toLowerCase().includes(q)
  })

  const getHotelName = (hid: number | null) => hotels.find((h) => h.id === hid)?.name || '—'
  const getBranchName = (bid: number | null) => branches.find((b) => b.id === bid)?.name || '—'

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{employees.length} staff members</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20">
          <Plus size={18} /> Add Employee
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, position or department..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700" />
      </div>

      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase">Employee</th>
                <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase hidden md:table-cell">Position · Dept</th>
                <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase hidden lg:table-cell">Hotel · Branch</th>
                <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase hidden lg:table-cell">Contact</th>
                <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase">Status</th>
                <th className="text-right px-5 py-3 text-xs text-zinc-500 font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-400">
                          {e.full_name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{e.full_name}</p>
                        <p className="text-xs text-zinc-500">{e.position || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <p className="text-sm text-zinc-300">{e.position || '—'}</p>
                    <p className="text-xs text-zinc-500">{e.department || '—'}</p>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <p className="text-xs text-zinc-400">{getHotelName(e.hotel_id)}</p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1"><MapPin size={10} /> {getBranchName(e.branch_id)}</p>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    {e.email && <p className="text-xs text-zinc-400 flex items-center gap-1"><Mail size={10} /> {e.email}</p>}
                    {e.phone && <p className="text-xs text-zinc-400 flex items-center gap-1"><Phone size={10} /> {e.phone}</p>}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={e.status === 'active' ? 'success' : e.status === 'on_leave' ? 'warning' : 'danger'}>
                      {e.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(e)} className="text-zinc-400 hover:text-white transition-colors p-1.5">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(e)} className="text-zinc-400 hover:text-red-400 transition-colors p-1.5">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-zinc-500 text-sm">No employees found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Employee' : 'Add Employee'} maxWidth="max-w-2xl">
        {createdCreds ? (
          <div>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4">
              <p className="text-emerald-400 font-medium text-sm mb-3 flex items-center gap-2">
                <Key size={16} /> Login credentials created — share with employee:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Username</span>
                  <span className="text-white font-mono bg-zinc-800 px-3 py-1 rounded-md">{createdCreds.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Password</span>
                  <span className="text-white font-mono bg-zinc-800 px-3 py-1 rounded-md">{createdCreds.password}</span>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-3">Save these now — password won't be shown again.</p>
            </div>
            <button onClick={closeModal} className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-xl transition-colors">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Hotel & Branch</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Hotel</label>
                  <select value={form.hotel_id} onChange={(e) => {
                    const hid = Number(e.target.value)
                    setForm({ ...form, hotel_id: hid, branch_id: 0 })
                    setSelectedHotelId(hid)
                  }} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                    <option value={0}>Select hotel</option>
                    {hotels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Branch</label>
                  <select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: Number(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                    <option value={0}>All branches</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Personal Info</p>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Full Name *</label>
                <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Position (Role)</label>
                  <select value={form.role_id} onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                    <option value={0}>No role</option>
                    {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Department</label>
                  <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                    placeholder="e.g. Front Desk" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Email</label>
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
            </div>

            {!editing && (
              <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Login Account</p>
                <label className="flex items-center gap-3 mb-3 cursor-pointer">
                  <input type="checkbox" checked={form.create_account}
                    onChange={(e) => setForm({ ...form, create_account: e.target.checked })}
                    className="w-4 h-4 rounded accent-indigo-600" />
                  <span className="text-sm text-white">Create system account for this employee</span>
                </label>
                {form.create_account && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">Username</label>
                      <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                        placeholder={form.full_name ? form.full_name.toLowerCase().replace(/\s+/g, '.') : 'auto-generated'}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">Password</label>
                      <div className="flex gap-2">
                        <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-indigo-500" />
                        <button type="button" onClick={regeneratePassword}
                          className="px-2.5 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-xs text-zinc-300 transition-colors">&#x21bb;</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl">
                {editing ? 'Update' : 'Add'} Employee
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
