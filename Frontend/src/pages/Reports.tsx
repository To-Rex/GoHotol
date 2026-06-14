import { useEffect, useState } from 'react'
import { TrendingUp, Users, BedDouble, DollarSign, Calendar } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import type { RevenueData, OccupancyData, CustomerReport } from '../types'

export default function Reports() {
  const { user } = useAuth()
  const [dailyRevenue, setDailyRevenue] = useState<RevenueData | null>(null)
  const [monthlyRevenue, setMonthlyRevenue] = useState<RevenueData | null>(null)
  const [occupancy, setOccupancy] = useState<OccupancyData | null>(null)
  const [customers, setCustomers] = useState<CustomerReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  const cid = user?.company_id

  const load = async () => {
    if (!cid) return
    setLoading(true)
    try {
      const [daily, monthly, cust] = await Promise.all([
        api.get('/reports/revenue/daily', { params: { company_id: cid } }),
        api.get('/reports/revenue/monthly', { params: { company_id: cid } }),
        api.get('/reports/customers', { params: { company_id: cid, period } }),
      ])
      setDailyRevenue(daily.data)
      setMonthlyRevenue(monthly.data)
      setCustomers(cust.data)

      if (user?.hotel_id) {
        const occ = await api.get('/reports/occupancy', { params: { company_id: cid, hotel_id: user.hotel_id } })
        setOccupancy(occ.data)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [cid, user?.hotel_id, period])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  const reportCards = [
    {
      label: 'Daily Revenue',
      value: `$${dailyRevenue?.total_revenue?.toFixed(2) ?? '0.00'}`,
      sub: `${dailyRevenue?.transaction_count ?? 0} transactions`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Monthly Revenue',
      value: `$${monthlyRevenue?.total_revenue?.toFixed(2) ?? '0.00'}`,
      sub: `${monthlyRevenue?.transaction_count ?? 0} transactions`,
      icon: Calendar,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Occupancy Rate',
      value: `${occupancy?.occupancy_rate?.toFixed(1) ?? 0}%`,
      sub: `${occupancy?.occupied_rooms ?? 0} / ${occupancy?.total_rooms ?? 0} rooms`,
      icon: BedDouble,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Customers',
      value: `${customers?.total_customers ?? 0}`,
      sub: `+${customers?.new_customers ?? 0} new this ${period}`,
      icon: Users,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Business analytics overview</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-700"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportCards.map((card, i) => (
          <div key={card.label} className={`bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all animate-fade-in-up stagger-${i + 1}`}>
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{card.value}</p>
            <p className="text-sm text-zinc-400">{card.label}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-indigo-400" />
            Revenue Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-xl">
              <span className="text-sm text-zinc-400">Daily Average</span>
              <span className="text-white font-bold">${dailyRevenue?.total_revenue?.toFixed(2) ?? '0.00'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-xl">
              <span className="text-sm text-zinc-400">Monthly Total</span>
              <span className="text-white font-bold">${monthlyRevenue?.total_revenue?.toFixed(2) ?? '0.00'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-xl">
              <span className="text-sm text-zinc-400">Transactions</span>
              <span className="text-white font-bold">{monthlyRevenue?.transaction_count ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
            <BedDouble size={18} className="text-amber-400" />
            Occupancy Details
          </h3>
          {occupancy ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-800" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${occupancy.occupancy_rate}, 100`} className="text-indigo-500" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{occupancy.occupancy_rate}%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-zinc-800/50 rounded-xl">
                  <p className="text-lg font-bold text-white">{occupancy.total_rooms}</p>
                  <p className="text-xs text-zinc-500">Total</p>
                </div>
                <div className="text-center p-2 bg-zinc-800/50 rounded-xl">
                  <p className="text-lg font-bold text-indigo-400">{occupancy.occupied_rooms}</p>
                  <p className="text-xs text-zinc-500">Occupied</p>
                </div>
                <div className="text-center p-2 bg-zinc-800/50 rounded-xl">
                  <p className="text-lg font-bold text-emerald-400">{occupancy.available_rooms}</p>
                  <p className="text-xs text-zinc-500">Available</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm text-center py-8">No hotel assigned</p>
          )}
        </div>
      </div>
    </div>
  )
}
