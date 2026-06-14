import { useState, useEffect, type FormEvent } from 'react'
import { Search, Plus, Edit2, Trash2, Briefcase, Mail, Phone, MapPin, Key, UserPlus } from 'lucide-react'
import api from '../lib/api'
import type { User, Employee, Hotel, Branch, Company, Role } from '../types'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'

type Tab = 'users' | 'employees'

export default function Users() {
  const [tab, setTab] = useState<Tab>('users')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Users & Employees</h2>
      </div>

      <div className="flex gap-1 mb-6 bg-zinc-900 rounded-lg p-1 border border-zinc-800 w-fit">
        <button onClick={() => setTab('users')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize flex items-center gap-2 ${tab === 'users' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}>
          <UserPlus size={15} /> System Users
        </button>
        <button onClick={() => setTab('employees')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize flex items-center gap-2 ${tab === 'employees' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}>
          <Briefcase size={15} /> Employees
        </button>
      </div>

      {tab === 'users' ? <SystemUsers /> : <Employees />}
    </div>
  )
}

// --------------- SYSTEM USERS ---------------

function SystemUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [createdUser, setCreatedUser] = useState<{ username: string; password: string } | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    full_name: '', email: '', phone: '', username: '', password: '',
    is_super_admin: false, is_active: true,
  })
  const [form, setForm] = useState({
    username: '', email: '', password: '', full_name: '', phone: '',
    is_super_admin: false,
  })

  const fetchUsers = () => {
    api.get('/admin/users', { params: { limit: 500 } }).then(({ data }) => {
      setUsers(Array.isArray(data) ? data : data.items || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const handleToggle = async (u: User) => {
    await api.put(`/admin/users/${u.id}`, { is_active: !u.is_active })
    setUsers((prev) => prev.map((p) => p.id === u.id ? { ...p, is_active: !p.is_active } : p))
  }

  const openEdit = (u: User) => {
    setEditingUser(u)
    setEditForm({
      full_name: u.full_name,
      email: u.email,
      phone: u.phone || '',
      username: u.username,
      password: '',
      is_super_admin: u.is_super_admin,
      is_active: u.is_active,
    })
    setEditModalOpen(true)
  }

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    try {
      const payload: Record<string, unknown> = {
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone || null,
        username: editForm.username || editingUser.username,
        is_super_admin: editForm.is_super_admin,
        is_active: editForm.is_active,
      }
      if (editForm.password) {
        payload.password = editForm.password
      }
      await api.put(`/admin/users/${editingUser.id}`, payload)
      setEditModalOpen(false)
      setEditingUser(null)
      fetchUsers()
    } catch (err: unknown) {
      alert((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed')
    }
  }

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/auth/register', form)
      setCreatedUser({ username: form.username, password: form.password })
      fetchUsers()
    } catch (err: unknown) {
      alert((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to create user')
    }
  }

  const closeModal = () => { setModalOpen(false); setCreatedUser(null) }

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>
        <button onClick={() => { setForm({ username: '', email: '', password: '', full_name: '', phone: '', is_super_admin: false }); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0">
          <Plus size={16} /> Create User
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">User</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-violet-400">
                        {u.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{u.full_name}</p>
                      <p className="text-xs text-zinc-500">@{u.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400 hidden md:table-cell">{u.email}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <Badge variant={u.is_super_admin ? 'warning' : 'default'}>
                    {u.is_super_admin ? 'Super Admin' : 'User'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggle(u)}>
                    <Badge variant={u.is_active ? 'success' : 'danger'}>{u.is_active ? 'Active' : 'Inactive'}</Badge>
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(u)} className="text-zinc-400 hover:text-white transition-colors p-1">
                    <Edit2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-zinc-500 text-sm">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title="Create System User">
        {createdUser ? (
          <div>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-4">
              <p className="text-emerald-400 font-medium text-sm mb-3">User created! Share these credentials:</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Username</span>
                  <span className="text-white font-mono bg-zinc-800 px-3 py-1 rounded">{createdUser.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Password</span>
                  <span className="text-white font-mono bg-zinc-800 px-3 py-1 rounded">{createdUser.password}</span>
                </div>
              </div>
            </div>
            <button onClick={closeModal} className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors">Close</button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Full Name</label>
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-zinc-400 mb-1">Username</label>
                <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" /></div>
              <div><label className="block text-sm font-medium text-zinc-400 mb-1">Password</label>
                <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" /></div>
              <div><label className="block text-sm font-medium text-zinc-400 mb-1">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" /></div>
            </div>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-700 bg-zinc-800 cursor-pointer">
              <input type="checkbox" checked={form.is_super_admin} onChange={(e) => setForm({ ...form, is_super_admin: e.target.checked })}
                className="w-4 h-4 rounded accent-indigo-600" />
              <div><p className="text-sm text-white">Super Admin</p><p className="text-xs text-zinc-500">Full platform access</p></div>
            </label>
            <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Create User</button>
          </form>
        )}
      </Modal>

      <Modal open={editModalOpen} onClose={() => { setEditModalOpen(false); setEditingUser(null) }} title="Edit User">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Full Name</label>
            <input value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} required
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-zinc-400 mb-1">Username</label>
              <input value={editForm.username || editingUser?.username || ''} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" /></div>
            <div><label className="block text-sm font-medium text-zinc-400 mb-1">New Password</label>
              <input type="text" value={editForm.password || ''} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                placeholder="Leave empty to keep current"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-zinc-600" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
              <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" /></div>
            <div><label className="block text-sm font-medium text-zinc-400 mb-1">Phone</label>
              <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" /></div>
          </div>
          <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-700 bg-zinc-800 cursor-pointer">
            <input type="checkbox" checked={editForm.is_super_admin} onChange={(e) => setEditForm({ ...editForm, is_super_admin: e.target.checked })}
              className="w-4 h-4 rounded accent-indigo-600" />
            <div><p className="text-sm text-white">Super Admin</p><p className="text-xs text-zinc-500">Full platform access</p></div>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-700 bg-zinc-800 cursor-pointer">
            <input type="checkbox" checked={editForm.is_active} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
              className="w-4 h-4 rounded accent-indigo-600" />
            <div><p className="text-sm text-white">Active</p><p className="text-xs text-zinc-500">User can log in and use the system</p></div>
          </label>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Save Changes</button>
        </form>
      </Modal>
    </div>
  )
}

// --------------- EMPLOYEES ---------------

function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedHotelId, setSelectedHotelId] = useState<number>(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [createdCreds, setCreatedCreds] = useState<{ username: string; password: string } | null>(null)
  const [form, setForm] = useState({
    company_id: 0, hotel_id: 0, branch_id: 0,
    full_name: '', role_id: 0, department: '', phone: '', email: '', address: '',
    create_account: true,
    username: '',
    password: Math.random().toString(36).slice(2, 10),
    status: 'active', notes: '',
    edit_username: '',
    edit_password: '',
  })

  const selectedRole = roles.find((r) => r.id === form.role_id)

  const regeneratePassword = () => {
    setForm((f) => ({ ...f, password: Math.random().toString(36).slice(2, 10) }))
  }

  useEffect(() => {
    const load = async () => {
      const [eRes, hRes, cRes, rRes] = await Promise.all([
        api.get('/employees', { params: { limit: 500 } }),
        api.get('/hotels', { params: { limit: 200 } }),
        api.get('/companies', { params: { limit: 200 } }),
        api.get('/roles'),
      ])
      setEmployees(Array.isArray(eRes.data) ? eRes.data : [])
      const h = Array.isArray(hRes.data) ? hRes.data : hRes.data.items || []
      setHotels(h)
      setCompanies(Array.isArray(cRes.data) ? cRes.data : [])
      setRoles(Array.isArray(rRes.data) ? rRes.data.filter((r: Role) => r.is_active) : [])
      if (h.length > 0) setSelectedHotelId(h[0].id)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (selectedHotelId) {
      api.get('/branches', { params: { hotel_id: selectedHotelId } }).then(({ data }) => {
        const brs = Array.isArray(data) ? data : []
        setBranches(brs)
        if (brs.length > 0) {
          setForm((f) => ({ ...f, branch_id: brs[0].id }))
        }
      })
    } else {
      setBranches([])
    }
  }, [selectedHotelId])

  const openCreate = () => {
    setEditing(null)
    setCreatedCreds(null)
    const cid = companies[0]?.id || 0
    const hid = selectedHotelId || hotels[0]?.id || 0
    const bid = branches.length > 0 ? branches[0].id : 0
    setForm({
      company_id: cid, hotel_id: hid, branch_id: bid,
      full_name: '', role_id: roles[0]?.id || 0, department: '', phone: '', email: '', address: '',
      create_account: true, username: '', password: Math.random().toString(36).slice(2, 10),
      status: 'active', notes: '',
      edit_username: '', edit_password: '',
    })
    setModalOpen(true)
  }

  const openEdit = async (e: Employee) => {
    setEditing(e)
    setCreatedCreds(null)
    let editUser = ''
    let editPass = ''
    if (e.user_id) {
      try {
        const { data: users } = await api.get('/admin/users', { params: { limit: 500 } })
        const allUsers = Array.isArray(users) ? users : users.items || []
        const linkedUser = allUsers.find((u: User) => u.id === e.user_id)
        if (linkedUser) {
          editUser = linkedUser.username
        }
      } catch { /* ignore */ }
    }
    setForm({
      company_id: e.company_id, hotel_id: e.hotel_id || 0, branch_id: e.branch_id || 0,
      full_name: e.full_name, role_id: 0, department: e.department || '',
      phone: e.phone || '', email: e.email || '', address: e.address || '',
      create_account: false, username: '', password: '',
      status: e.status, notes: e.notes || '',
      edit_username: editUser,
      edit_password: editPass,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // 1. Create employee record
    const empPayload = {
      full_name: form.full_name,
      company_id: form.company_id,
      hotel_id: form.hotel_id || null,
      branch_id: form.branch_id || null,
      position: selectedRole?.name || null,
      department: form.department || null,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      status: form.status,
      notes: form.notes || null,
    }

    if (editing) {
      await api.put(`/employees/${editing.id}`, empPayload)

      if (editing.user_id && (form.edit_username || form.edit_password)) {
        const userPayload: Record<string, unknown> = {}
        if (form.edit_username) userPayload.username = form.edit_username
        if (form.edit_password) userPayload.password = form.edit_password
        if (Object.keys(userPayload).length > 0) {
          await api.put(`/admin/users/${editing.user_id}`, userPayload)
        }
      }

      setModalOpen(false)
      const { data } = await api.get('/employees', { params: { limit: 500 } })
      setEmployees(Array.isArray(data) ? data : [])
      return
    }

    await api.post('/employees', empPayload)

    // 2. Optionally create login account
    if (form.create_account && form.username && form.password) {
      const autoUsername = form.username || form.full_name.toLowerCase().replace(/\s+/g, '.')
      try {
        const { data: newUser } = await api.post('/auth/register', {
          username: autoUsername,
          email: form.email || `${autoUsername}@xms.local`,
          password: form.password,
          full_name: form.full_name,
          phone: form.phone || undefined,
        })
        if (form.role_id && newUser?.id) {
          await api.post('/roles/users/assign-roles', {
            user_id: newUser.id,
            role_ids: [form.role_id],
          })
        }
        setCreatedCreds({ username: autoUsername, password: form.password })
      } catch (err: unknown) {
        const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || ''
        if (!detail.includes('already exists')) {
          setCreatedCreds(null)
        }
      }
    } else {
      setCreatedCreds(null)
      setModalOpen(false)
    }

    const { data } = await api.get('/employees', { params: { limit: 500 } })
    setEmployees(Array.isArray(data) ? data : [])
  }

  const closeModal = () => {
    setModalOpen(false)
    setCreatedCreds(null)
  }

  const handleToggle = async (e: Employee) => {
    await api.put(`/employees/${e.id}`, { is_active: !e.is_active })
    setEmployees((prev) => prev.map((p) => p.id === e.id ? { ...p, is_active: !p.is_active } : p))
  }

  const handleDelete = async (e: Employee) => {
    if (!confirm(`Delete ${e.full_name}? This action cannot be undone.`)) return
    await api.delete(`/employees/${e.id}`)
    setEmployees((prev) => prev.filter((p) => p.id !== e.id))
  }

  const filtered = employees.filter((e) =>
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (e.position || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.department || '').toLowerCase().includes(search.toLowerCase()),
  )

  const getHotelName = (hid: number | null) => hotels.find((h) => h.id === hid)?.name || '—'
  const getBranchName = (bid: number | null) => branches.find((b) => b.id === bid)?.name || '—'

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, position or department..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0">
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Employee</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Position · Dept</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Hotel · Branch</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filtered.map((e) => (
              <tr key={e.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Briefcase size={14} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{e.full_name}</p>
                      {e.position && <p className="text-xs text-zinc-500">{e.position}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-sm text-zinc-300">{e.position || '—'}</p>
                  <p className="text-xs text-zinc-500">{e.department || '—'}</p>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <p className="text-xs text-zinc-400">{getHotelName(e.hotel_id)}</p>
                  <p className="text-xs text-zinc-500 flex items-center gap-1"><MapPin size={10} /> {getBranchName(e.branch_id)}</p>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {e.email && <p className="text-xs text-zinc-400 flex items-center gap-1"><Mail size={10} /> {e.email}</p>}
                  {e.phone && <p className="text-xs text-zinc-400 flex items-center gap-1"><Phone size={10} /> {e.phone}</p>}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggle(e)}>
                    <Badge variant={e.is_active ? 'success' : 'danger'}>{e.is_active ? 'Active' : 'Inactive'}</Badge>
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(e)} className="text-zinc-400 hover:text-white transition-colors p-1">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(e)} className="text-zinc-400 hover:text-red-400 transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-zinc-500 text-sm">No employees found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- ADD / EDIT MODAL ---------- */}
      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Employee' : 'Add Employee to Hotel Branch'} size="lg">
        {createdCreds ? (
          <div>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-4">
              <p className="text-emerald-400 font-medium text-sm mb-3 flex items-center gap-2">
                <Key size={16} /> Login credentials created — share with employee:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Username</span>
                  <span className="text-white font-mono bg-zinc-800 px-3 py-1 rounded">{createdCreds.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Password</span>
                  <span className="text-white font-mono bg-zinc-800 px-3 py-1 rounded">{createdCreds.password}</span>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-3">⚠️ Save these now — password won't be shown again.</p>
            </div>
            <button onClick={closeModal} className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Step 1: Where */}
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">🏨 Hotel & Branch</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Company</label>
                  <select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500">
                    {companies.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Hotel</label>
                  <select value={form.hotel_id} onChange={(e) => {
                    const hid = Number(e.target.value)
                    setForm({ ...form, hotel_id: hid, branch_id: 0 })
                    setSelectedHotelId(hid)
                  }}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500">
                    <option value={0}>Select hotel</option>
                    {hotels.map((h) => (<option key={h.id} value={h.id}>{h.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Branch</label>
                  <select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500">
                    <option value={0}>All branches</option>
                    {branches.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Who */}
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">👤 Personal Info</p>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Full Name</label>
                <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Position (Role)</label>
                  <select value={form.role_id} onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500">
                    <option value={0}>No role</option>
                    {roles.map((r) => (<option key={r.id} value={r.id}>{r.name}</option>))}
                  </select>
                  <p className="text-xs text-zinc-600 mt-1">
                    Manage roles: <a href="/roles" className="text-indigo-400 hover:text-indigo-300">Roles & Permission</a>
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Department</label>
                  <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Front Desk"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Email</label>
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
            </div>

            {/* Step 3: Login account */}
            {!editing ? (
              <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">🔑 Login Account</p>
                <label className="flex items-center gap-3 mb-3 cursor-pointer">
                  <input type="checkbox" checked={form.create_account}
                    onChange={(e) => setForm({ ...form, create_account: e.target.checked })}
                    className="w-4 h-4 rounded accent-indigo-600" />
                  <span className="text-sm text-white">Create system account for this employee</span>
                </label>
                {form.create_account && (
                  <div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Username</label>
                        <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                          placeholder={form.full_name ? form.full_name.toLowerCase().replace(/\s+/g, '.') : 'auto-generated'}
                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Password</label>
                        <div className="flex gap-2">
                          <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 font-mono" />
                          <button type="button" onClick={regeneratePassword}
                            className="px-2 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-xs text-zinc-300 transition-colors">🔄</button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 mt-2">Leave username empty to auto-generate from full name.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">🔑 Change Login Credentials</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">New Username</label>
                    <input value={form.edit_username} onChange={(e) => setForm({ ...form, edit_username: e.target.value })}
                      placeholder="Leave empty to keep current"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-zinc-600" />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">New Password</label>
                    <input value={form.edit_password} onChange={(e) => setForm({ ...form, edit_password: e.target.value })}
                      placeholder="Leave empty to keep current"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-zinc-600" />
                  </div>
                </div>
                <p className="text-xs text-zinc-600 mt-2">Leave fields empty to keep current values.</p>
              </div>
            )}

            {/* Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>

            <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
              {editing ? 'Update Employee' : 'Add Employee'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  )
}
