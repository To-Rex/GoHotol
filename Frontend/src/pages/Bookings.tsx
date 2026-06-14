import { useEffect, useState } from 'react'
import { Plus, Search, LogIn, LogOut, Eye } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import type { Booking, BookingStatus, Customer, Room, PaymentMethod } from '../types'

export default function Bookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [statuses, setStatuses] = useState<BookingStatus[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [checkInForm, setCheckInForm] = useState({ payment_method_id: 0, amount: 0 })

  const cid = user?.company_id

  const [form, setForm] = useState({
    customer_id: 0, room_ids: [] as number[], check_in_date: '',
    check_out_date: '', guest_count: 1, special_requests: '', notes: '',
    booking_type: 'reservation', currency: 'UZS',
  })

  const load = async () => {
    if (!cid) return
    setLoading(true)
    try {
      const [b, s, c, r, m] = await Promise.all([
        api.get('/bookings', { params: { company_id: cid, limit: 200 } }),
        api.get('/bookings/statuses', { params: { company_id: cid } }),
        api.get('/customers', { params: { company_id: cid, limit: 200 } }),
        user?.hotel_id ? api.get('/rooms', { params: { hotel_id: user.hotel_id, limit: 500 } }) : Promise.resolve({ data: [] }),
        api.get('/payments/methods', { params: { company_id: cid } }),
      ])
      setBookings(b.data)
      setStatuses(s.data)
      setCustomers(c.data)
      setRooms(r.data)
      setMethods(m.data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [cid, user?.hotel_id])

  const getStatus = (id: number | null) => statuses.find((s) => s.id === id)
  const getCustomer = (id: number) => customers.find((c) => c.id === id)?.full_name ?? `#${id}`
  const getRoom = (id: number) => rooms.find((r) => r.id === id)?.room_number ?? `#${id}`

  const filtered = bookings.filter((b) => {
    if (!search) return true
    const q = search.toLowerCase()
    return b.booking_number.toLowerCase().includes(q) || getCustomer(b.customer_id).toLowerCase().includes(q)
  })

  const handleCreate = async () => {
    if (!user?.hotel_id) return
    try {
      await api.post('/bookings', {
        ...form, company_id: cid, hotel_id: user.hotel_id,
      })
      setCreateOpen(false)
      load()
    } catch { /* ignore */ }
  }

  const handleCheckIn = async () => {
    if (!selectedBooking) return
    try {
      await api.post('/bookings/check-in', { booking_id: selectedBooking.id, ...checkInForm })
      setCheckInOpen(false)
      load()
    } catch { /* ignore */ }
  }

  const handleCheckOut = async () => {
    if (!selectedBooking) return
    try {
      await api.post('/bookings/check-out', { booking_id: selectedBooking.id })
      load()
    } catch { /* ignore */ }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{bookings.length} bookings</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20">
          <Plus size={18} /> New Booking
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text" placeholder="Search bookings..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
        />
      </div>

      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase">Booking #</th>
                <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase">Customer</th>
                <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase">Dates</th>
                <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase">Guests</th>
                <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase">Amount</th>
                <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const status = getStatus(b.status_id)
                return (
                  <tr key={b.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-white font-mono text-sm font-medium">{b.booking_number}</span>
                      <span className="text-xs text-zinc-500 block">{b.booking_type}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-300">{getCustomer(b.customer_id)}</td>
                    <td className="px-5 py-3 text-sm text-zinc-300">
                      {b.check_in_date} → {b.check_out_date}
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-300">{b.guest_count}</td>
                    <td className="px-5 py-3">
                      <Badge variant={status?.slug === 'confirmed' ? 'success' : status?.slug === 'pending' ? 'warning' : 'default'}>
                        {status?.name ?? 'Unknown'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-white text-sm font-medium">${b.total_amount}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setSelectedBooking(b); setDetailOpen(true) }}
                          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                        {!b.actual_check_in && (
                          <button
                            onClick={() => { setSelectedBooking(b); setCheckInOpen(true); setCheckInForm({ payment_method_id: methods[0]?.id ?? 0, amount: b.total_amount }) }}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Check In"
                          >
                            <LogIn size={15} />
                          </button>
                        )}
                        {b.actual_check_in && !b.actual_check_out && (
                          <button
                            onClick={() => { setSelectedBooking(b); handleCheckOut() }}
                            className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors"
                            title="Check Out"
                          >
                            <LogOut size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Booking" maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Customer *</label>
              <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: Number(e.target.value) })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                <option value={0}>Select customer</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Booking Type</label>
              <select value={form.booking_type} onChange={(e) => setForm({ ...form, booking_type: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                <option value="reservation">Reservation</option>
                <option value="walk_in">Walk-in</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Check-in Date *</label>
              <input type="date" value={form.check_in_date} onChange={(e) => setForm({ ...form, check_in_date: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Check-out Date *</label>
              <input type="date" value={form.check_out_date} onChange={(e) => setForm({ ...form, check_out_date: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Room *</label>
            <select multiple={false} value={form.room_ids[0] ?? 0} onChange={(e) => setForm({ ...form, room_ids: [Number(e.target.value)] })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
              <option value={0}>Select room</option>
              {rooms.filter((r) => r.is_active).map((r) => <option key={r.id} value={r.id}>{r.room_number} {r.name ? `(${r.name})` : ''} - ${r.base_price}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Guests</label>
              <input type="number" value={form.guest_count} onChange={(e) => setForm({ ...form, guest_count: Number(e.target.value) })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Currency</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                <option value="UZS">UZS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Special Requests</label>
            <textarea value={form.special_requests} onChange={(e) => setForm({ ...form, special_requests: e.target.value })} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setCreateOpen(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
            <button onClick={handleCreate} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl">Create</button>
          </div>
        </div>
      </Modal>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`Booking ${selectedBooking?.booking_number}`} maxWidth="max-w-lg">
        {selectedBooking && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-zinc-500">Customer:</span><p className="text-white">{getCustomer(selectedBooking.customer_id)}</p></div>
              <div><span className="text-zinc-500">Type:</span><p className="text-white capitalize">{selectedBooking.booking_type}</p></div>
              <div><span className="text-zinc-500">Check-in:</span><p className="text-white">{selectedBooking.check_in_date}</p></div>
              <div><span className="text-zinc-500">Check-out:</span><p className="text-white">{selectedBooking.check_out_date}</p></div>
              <div><span className="text-zinc-500">Guests:</span><p className="text-white">{selectedBooking.guest_count}</p></div>
              <div><span className="text-zinc-500">Currency:</span><p className="text-white">{selectedBooking.currency}</p></div>
              <div><span className="text-zinc-500">Total:</span><p className="text-white font-bold">${selectedBooking.total_amount}</p></div>
              <div><span className="text-zinc-500">Paid:</span><p className="text-white">${selectedBooking.paid_amount}</p></div>
            </div>
            {selectedBooking.actual_check_in && <div><span className="text-zinc-500">Actual Check-in:</span><p className="text-white">{selectedBooking.actual_check_in}</p></div>}
            {selectedBooking.actual_check_out && <div><span className="text-zinc-500">Actual Check-out:</span><p className="text-white">{selectedBooking.actual_check_out}</p></div>}
            {selectedBooking.special_requests && <div><span className="text-zinc-500">Special Requests:</span><p className="text-white">{selectedBooking.special_requests}</p></div>}
          </div>
        )}
      </Modal>

      <Modal open={checkInOpen} onClose={() => setCheckInOpen(false)} title="Check In">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Payment Method</label>
            <select value={checkInForm.payment_method_id} onChange={(e) => setCheckInForm({ ...checkInForm, payment_method_id: Number(e.target.value) })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
              {methods.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Amount</label>
            <input type="number" value={checkInForm.amount} onChange={(e) => setCheckInForm({ ...checkInForm, amount: Number(e.target.value) })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setCheckInOpen(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
            <button onClick={handleCheckIn} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl">Confirm Check In</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
