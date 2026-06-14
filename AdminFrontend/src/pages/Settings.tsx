import { useState, useEffect, type FormEvent } from 'react'
import { Plus, Edit2 } from 'lucide-react'
import { Settings as SettingsIcon } from 'lucide-react'
import api from '../lib/api'
import type { Setting } from '../types'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'

export default function Settings() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Setting | null>(null)
  const [form, setForm] = useState({ key: '', value: '', description: '' })

  const fetch = async () => {
    const { data } = await api.get('/admin/settings')
    setSettings(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ key: '', value: '', description: '' })
    setModalOpen(true)
  }

  const openEdit = (s: Setting) => {
    setEditing(s)
    setForm({ key: s.key, value: JSON.stringify(s.value), description: s.description || '' })
    setModalOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams({ key: form.key, value: form.value, description: form.description })
    await api.post(`/admin/settings?${params}`)
    setModalOpen(false)
    fetch()
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={16} /> Add Setting
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Key</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Value</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Description</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {settings.map((s) => (
              <tr key={s.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <SettingsIcon size={16} className="text-indigo-400" />
                    <span className="text-sm text-white font-mono">{s.key}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400 hidden md:table-cell font-mono truncate max-w-xs">
                  {JSON.stringify(s.value)}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400 hidden lg:table-cell">{s.description || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(s)} className="text-zinc-400 hover:text-white transition-colors p-1">
                    <Edit2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {settings.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-zinc-500 text-sm">No settings found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Setting' : 'Add Setting'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Key</label>
            <input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} required
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Value (JSON)</label>
            <textarea value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} rows={4}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <button type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
            {editing ? 'Update' : 'Add'} Setting
          </button>
        </form>
      </Modal>
    </div>
  )
}
