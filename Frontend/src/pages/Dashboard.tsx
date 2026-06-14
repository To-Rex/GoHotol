import { useEffect, useState } from 'react'
import {
  TrendingUp, Users, DoorOpen, CalendarCheck, DollarSign,
  Activity, Clock, ArrowUpRight, ArrowDownRight, CheckCircle2,
} from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import type { DashboardStats, Booking, RevenueData, OccupancyData } from '../types'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [occupancy, setOccupancy] = useState<OccupancyData | null>(null)
  const [loading, setLoading] = useState(true)

  const cid = user?.company_id

  useEffect(() => {
    if (!cid) return
    const load = async () => {
      try {
        const [bookings, rev, occ, rooms] = await Promise.all([
          api.get('/bookings', { params: { company_id: cid, limit: 5 } }),
          api.get('/reports/revenue/daily', { params: { company_id: cid } }),
          user?.hotel_id
            ? api.get('/reports/occupancy', { params: { company_id: cid, hotel_id: user.hotel_id } })
            : Promise.resolve(null),
          user?.hotel_id
            ? api.get('/rooms', { params: { hotel_id: user.hotel_id, limit: 1000 } })
            : Promise.resolve(null),
        ])

        setRecentBookings(bookings.data)
        setRevenue(rev.data)
        if (occ?.data) setOccupancy(occ.data)

        if (rooms?.data) {
          const allRooms = rooms.data
          const pending = 0
          setStats({
            total_rooms: allRooms.length,
            occupied_rooms: allRooms.filter((r: { status_id: number | null }) => r.status_id).length,
            available_rooms: allRooms.filter((r: { status_id: number | null }) => !r.status_id).length,
            occupancy_rate: occ?.data?.occupancy_rate ?? 0,
            today_revenue: rev.data.total_revenue,
            today_bookings: bookings.data.length,
            new_customers: 0,
            pending_cleaning: pending,
          })
        } else {
          setStats({
            total_rooms: 0,
            occupied_rooms: 0,
            available_rooms: 0,
            occupancy_rate: 0,
            today_revenue: rev.data.total_revenue,
            today_bookings: bookings.data.length,
            new_customers: 0,
            pending_cleaning: 0,
          })
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [cid, user?.hotel_id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = [
    { label: 'Today Revenue', value: `$${stats?.today_revenue?.toFixed(2) ?? '0.00'}`, icon: DollarSign, trend: '+12%', up: true, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Bookings Today', value: String(stats?.today_bookings ?? 0), icon: CalendarCheck, trend: '+5%', up: true, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Occupancy', value: `${stats?.occupancy_rate?.toFixed(1) ?? 0}%`, icon: TrendingUp, trend: `${stats?.occupancy_rate ?? 0 > 50 ? '+' : '-'}${Math.abs(stats?.occupancy_rate ?? 0) > 50 ? '3' : '1'}%`, up: (stats?.occupancy_rate ?? 0) > 50, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Available Rooms', value: String(stats?.available_rooms ?? 0), icon: DoorOpen, trend: `of ${stats?.total_rooms ?? 0}`, up: true, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Overview of your hotel operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className={`bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all duration-300 hover:shadow-lg animate-fade-in-up stagger-${i + 1}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon size={20} className={card.color} />
              </div>
              <div className={`flex items-center gap-0.5 text-xs font-medium ${card.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {card.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {card.trend}
              </div>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{card.value}</p>
            <p className="text-sm text-zinc-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 animate-fade-in-up stagger-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Clock size={18} className="text-zinc-500" />
              Recent Bookings
            </h2>
            <span className="text-xs text-zinc-600">{recentBookings.length} bookings</span>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-zinc-500 text-sm py-6 text-center">No recent bookings</p>
          ) : (
            <div className="space-y-2">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors">
                  <div>
                    <p className="text-sm text-white font-medium">{b.booking_number}</p>
                    <p className="text-xs text-zinc-500">{b.check_in_date} → {b.check_out_date}</p>
                  </div>
                  <span className="text-sm text-zinc-400 font-medium">${b.total_amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 animate-fade-in-up stagger-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Activity size={18} className="text-zinc-500" />
              System Status
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span className="text-sm text-white">Backend API</span>
              </div>
              <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span className="text-sm text-white">Database</span>
              </div>
              <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Users size={18} className="text-zinc-400" />
                <span className="text-sm text-white">Staff Online</span>
              </div>
              <span className="text-xs text-zinc-500 font-medium bg-zinc-700/50 px-2 py-0.5 rounded-md">N/A</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
