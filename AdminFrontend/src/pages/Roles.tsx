import { useState, useEffect, type FormEvent } from 'react'
import { Plus, Shield, Edit2, Trash2 } from 'lucide-react'
import api from '../lib/api'
import type { Role, Permission } from '../types'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'

const MODULES: Record<string, string> = {
  bookings: 'Booking',
  rooms: 'Room',
  customers: 'Customer',
  users: 'User',
  roles: 'Role',
  services: 'Service',
  payments: 'Payment',
  invoices: 'Invoice',
  cleaning: 'Cleaning',
  reports: 'Report',
  employees: 'Employee',
  settings: 'Settings',
  hotels: 'Hotel',
  branches: 'Branch',
}

const ACTIONS: Record<string, string> = {
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  view: 'View',
  manage: 'Manage',
  export: 'Export',
}

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [permModalOpen, setPermModalOpen] = useState(false)
  const [permCreateOpen, setPermCreateOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '' })
  const [selectedPerms, setSelectedPerms] = useState<number[]>([])
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set())
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set())

  const fetchData = async () => {
    const [rRes, pRes] = await Promise.all([
      api.get('/roles'),
      api.get('/permissions'),
    ])
    setRoles(Array.isArray(rRes.data) ? rRes.data : [])
    setPermissions(Array.isArray(pRes.data) ? pRes.data : [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    await api.post('/roles', form)
    setModalOpen(false)
    setForm({ name: '', slug: '', description: '' })
    fetchData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this role?')) return
    await api.put(`/roles/${id}`, { is_active: false })
    fetchData()
  }

  const openPermissions = async (role: Role) => {
    setSelectedRole(role)
    const { data } = await api.get(`/roles/${role.id}/permissions`)
    setSelectedPerms(Array.isArray(data) ? data.map((p: Permission) => p.id) : [])
    setPermModalOpen(true)
  }

  const savePermissions = async () => {
    if (!selectedRole) return
    await api.post('/roles/assign-permissions', { role_id: selectedRole.id, permission_ids: selectedPerms })
    setPermModalOpen(false)
  }

  const handleCreatePermission = async (e: FormEvent) => {
    e.preventDefault()
    const toCreate: { name: string; slug: string; module: string }[] = []
    for (const module of selectedModules) {
      for (const action of selectedActions) {
        const slug = `${action}_${module}`
        if (!permissions.find((p) => p.slug === slug)) {
          toCreate.push({
            name: ACTIONS[action] + ' ' + MODULES[module],
            slug,
            module,
          })
        }
      }
    }
    for (const p of toCreate) {
      await api.post('/permissions', p)
    }
    setPermCreateOpen(false)
    setSelectedModules(new Set())
    setSelectedActions(new Set())
    fetchData()
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Roles & Permissions</h2>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={16} /> New Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-white">Roles</h3>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {roles.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield size={16} className="text-indigo-400" />
                  <div>
                    <p className="text-sm text-white font-medium">{r.name}</p>
                    <p className="text-xs text-zinc-500">{r.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.is_active ? 'success' : 'danger'}>{r.is_active ? 'Active' : 'Inactive'}</Badge>
                  <button onClick={() => openPermissions(r)} className="text-zinc-400 hover:text-white transition-colors p-1">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="text-zinc-400 hover:text-red-400 transition-colors p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Permissions</h3>
            <button onClick={() => setPermCreateOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors">
              <Plus size={13} /> Add
            </button>
          </div>
          <div className="divide-y divide-zinc-800/50 max-h-[500px] overflow-y-auto">
            {permissions.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/30 transition-colors">
                <div>
                  <p className="text-sm text-white">{p.name}</p>
                  <p className="text-xs text-zinc-500">{p.slug} · {p.module}</p>
                </div>
                <Badge variant={p.is_active ? 'success' : 'default'}>{p.module}</Badge>
              </div>
            ))}
            {permissions.length === 0 && (
              <div className="px-4 py-12 text-center text-zinc-500 text-sm">No permissions</div>
            )}
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Role">
        <form onSubmit={handleCreate} className="space-y-4">
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
          <button type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
            Create Role
          </button>
        </form>
      </Modal>

      <Modal open={permModalOpen} onClose={() => setPermModalOpen(false)} title={`Permissions: ${selectedRole?.name}`} size="lg">
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {permissions.map((p) => {
            const checked = selectedPerms.includes(p.id)
            return (
              <label key={p.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  checked ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                }`}>
                <input type="checkbox" checked={checked} onChange={() => {
                  setSelectedPerms((prev) => prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id])
                }} className="sr-only" />
                <div>
                  <p className="text-sm text-white">{p.name}</p>
                  <p className="text-xs text-zinc-500">{p.slug}</p>
                </div>
              </label>
            )
          })}
        </div>
        <button onClick={savePermissions}
          className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          Save Permissions
        </button>
      </Modal>

      <Modal open={permCreateOpen} onClose={() => setPermCreateOpen(false)} title="Create Permissions" size="lg">
        <form onSubmit={handleCreatePermission} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">1. Select Modules</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(MODULES).map(([key, label]) => (
                <label key={key}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                    selectedModules.has(key) ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                  }`}>
                  <input type="checkbox" checked={selectedModules.has(key)}
                    onChange={() => {
                      const next = new Set(selectedModules)
                      next.has(key) ? next.delete(key) : next.add(key)
                      setSelectedModules(next)
                    }}
                    className="sr-only" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">2. Select Actions</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ACTIONS).map(([key, label]) => (
                <label key={key}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                    selectedActions.has(key) ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                  }`}>
                  <input type="checkbox" checked={selectedActions.has(key)}
                    onChange={() => {
                      const next = new Set(selectedActions)
                      next.has(key) ? next.delete(key) : next.add(key)
                      setSelectedActions(next)
                    }}
                    className="sr-only" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
            <p className="text-xs text-zinc-500 mb-2">Will create:</p>
            <div className="flex flex-wrap gap-1">
              {Array.from(selectedModules).flatMap((m) =>
                Array.from(selectedActions).map((a) => {
                  const slug = `${a}_${m}`
                  const exists = permissions.find((p) => p.slug === slug)
                  return (
                    <span key={slug}
                      className={`px-2 py-0.5 rounded text-xs font-mono ${exists ? 'bg-zinc-700 text-zinc-500 line-through' : 'bg-indigo-500/20 text-indigo-300'}`}>
                      {slug} {exists ? '(exists)' : ''}
                    </span>
                  )
                }),
              )}
              {selectedModules.size === 0 || selectedActions.size === 0 ? (
                <span className="text-xs text-zinc-600">Select modules and actions above</span>
              ) : null}
            </div>
          </div>

          <button type="submit" disabled={selectedModules.size === 0 || selectedActions.size === 0}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-medium rounded-lg transition-colors">
            Create {Array.from(selectedModules).flatMap((m) => Array.from(selectedActions).map((a) => {
              const slug = `${a}_${m}`
              return permissions.find((p) => p.slug === slug) ? null : slug
            })).filter(Boolean).length} Permissions
          </button>
        </form>
      </Modal>
    </div>
  )
}
