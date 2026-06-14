import { useState, useEffect } from 'react'
import { Building2, Hotel, Users, Activity } from 'lucide-react'
import api from '../lib/api'
import { Spinner } from '../components/ui/Spinner'

interface Stats {
  total_companies: number
  total_hotels: number
  total_users: number
  total_bookings: number
  active_companies: number
}

const cards = [
  { key: 'total_companies', label: 'Companies', icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { key: 'total_hotels', label: 'Hotels', icon: Hotel, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { key: 'total_users', label: 'Users', icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { key: 'total_bookings', label: 'Bookings', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
]

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [companies, hotels, users] = await Promise.all([
          api.get('/companies?limit=1'),
          api.get('/hotels?company_id=1&limit=1'),
          api.get('/admin/users?limit=1'),
        ])
        setStats({
          total_companies: companies.data.length,
          total_hotels: hotels.data.length,
          total_users: users.data.length,
          total_bookings: 0,
          active_companies: companies.data.filter((c: { is_active: boolean }) => c.is_active).length,
        })
      } catch {
        setStats(null)
      }
    }
    load()
  }, [])

  if (!stats) return <Spinner />

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-500">{label}</span>
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stats[key as keyof Stats]}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
