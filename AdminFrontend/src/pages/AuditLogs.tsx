import { useState, useEffect } from 'react'
import { Search, ScrollText } from 'lucide-react'
import api from '../lib/api'
import type { AuditLog } from '../types'
import { Spinner } from '../components/ui/Spinner'

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/admin/audit-logs', { params: { limit: 500 } }).then(({ data }) => {
      setLogs(Array.isArray(data) ? data : [])
    }).finally(() => setLoading(false))
  }, [])

  const filtered = logs.filter((l) =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    (l.entity_type || '').toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Audit Logs</h2>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search audit logs..."
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors" />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Entity</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">User</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ScrollText size={16} className="text-indigo-400" />
                    <span className="text-sm text-white font-medium">{l.action}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400 hidden md:table-cell">
                  {l.entity_type}{l.entity_id ? ` #${l.entity_id}` : ''}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400 hidden lg:table-cell">
                  {l.user_id || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-500 text-right">
                  {new Date(l.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-zinc-500 text-sm">No audit logs found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
