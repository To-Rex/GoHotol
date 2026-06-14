import { useState, useEffect } from 'react'
import { Bell, CheckCircle } from 'lucide-react'
import api from '../lib/api'
import type { Notification } from '../types'
import { Spinner } from '../components/ui/Spinner'

export default function Notifications() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/notifications', { params: { user_id: 1, limit: 100 } }).then(({ data }) => {
      setNotifs(Array.isArray(data) ? data : [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Notifications</h2>
      </div>

      <div className="space-y-2">
        {notifs.map((n) => (
          <div key={n.id}
            className={`bg-zinc-900 border rounded-xl p-4 flex items-start gap-3 transition-colors ${
              n.is_read ? 'border-zinc-800 opacity-60' : 'border-indigo-500/30'
            }`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              n.is_read ? 'bg-zinc-800' : 'bg-indigo-500/10'
            }`}>
              {n.is_read ? <CheckCircle size={16} className="text-zinc-500" /> : <Bell size={16} className="text-indigo-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium">{n.title}</p>
              <p className="text-sm text-zinc-400 mt-0.5">{n.message}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-zinc-600">{n.notification_type}</span>
                <span className="text-xs text-zinc-600">{new Date(n.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
        {notifs.length === 0 && (
          <div className="py-20 text-center text-zinc-500">
            <Bell size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No notifications</p>
          </div>
        )}
      </div>
    </div>
  )
}
