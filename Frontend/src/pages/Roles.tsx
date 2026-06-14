import { useEffect, useState } from 'react'
import { Plus, Shield, Check, X } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { Modal } from '../components/ui/Modal'
import type { Role, Permission } from '../types'

export default function Roles() {
  const { user } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [permOpen, setPermOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedPerms, setSelectedPerms] = useState<number[]>([])
  const [form, setForm] = useState({ name: '', slug: '', description: '' })
  const cid = user?.company_id

  const load = async () => {
    setLoading(true)
    try {
      const [r, p] = await Promise.all([
        api.get('/roles'),
        api.get('/permissions'),
      ])
      setRoles(r.data)
      setPermissions(p.data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    try {
      await api.post('/roles', { ...form, company_id: cid })
      setCreateOpen(false)
      setForm({ name: '', slug: '', description: '' })
      load()
    } catch { /* ignore */ }
  }

  const openPerms = async (role: Role) => {
    setSelectedRole(role)
    try {
      const { data } = await api.get(`/roles/${role.id}/permissions`)
      setSelectedPerms(data.map((p: Permission) => p.id))
    } catch {
      setSelectedPerms([])
    }
    setPermOpen(true)
  }

  const savePerms = async () => {
    if (!selectedRole) return
    try {
      await api.post('/roles/assign-permissions', { role_id: selectedRole.id, permission_ids: selectedPerms })
      setPermOpen(false)
    } catch { /* ignore */ }
  }

  const togglePerm = (id: number) => {
    setSelectedPerms((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id])
  }

  const grouped = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.module] ??= []).push(p)
    return acc
  }, {})

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Roles & Permissions</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{roles.length} roles · {permissions.length} permissions</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20">
          <Plus size={18} /> Add Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map((role, i) => (
          <div key={role.id} className={`bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all duration-300 animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center">
                <Shield size={20} className="text-indigo-400" />
              </div>
              {role.is_system && <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-md">System</span>}
            </div>
            <h3 className="text-white font-semibold">{role.name}</h3>
            <p className="text-xs text-zinc-500 mt-1">{role.description || role.slug}</p>
            <button
              onClick={() => openPerms(role)}
              className="mt-4 w-full px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-xl transition-colors"
            >
              Manage Permissions
            </button>
          </div>
        ))}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Role">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Slug</label>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
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

      <Modal open={permOpen} onClose={() => setPermOpen(false)} title={`Permissions: ${selectedRole?.name}`} maxWidth="max-w-2xl">
        <div className="space-y-5">
          {Object.entries(grouped).map(([module, perms]) => (
            <div key={module}>
              <h4 className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">{module}</h4>
              <div className="space-y-1">
                {perms.map((p) => (
                  <label key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-800/50 cursor-pointer transition-colors">
                    <div
                      onClick={() => togglePerm(p.id)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all ${
                        selectedPerms.includes(p.id) ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-600'
                      }`}
                    >
                      {selectedPerms.includes(p.id) && <Check size={12} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{p.name}</p>
                      <p className="text-xs text-zinc-500">{p.slug}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setPermOpen(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
            <button onClick={savePerms} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
