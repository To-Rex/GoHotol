import { useEffect, useState } from 'react'
import { Search, DollarSign, CreditCard, FileText, Receipt } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import type { Payment, Invoice } from '../types'

export default function Payments() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'payments' | 'invoices'>('payments')
  const [search, setSearch] = useState('')

  const cid = user?.company_id

  useEffect(() => {
    if (!cid) return
    const load = async () => {
      setLoading(true)
      try {
        const [pRes, iRes] = await Promise.all([
          api.get('/payments', { params: { booking_id: 0, company_id: cid } }).catch(() => ({ data: [] })),
          api.get('/invoices', { params: { booking_id: 0 } }).catch(() => ({ data: [] })),
        ])
        setPayments(pRes.data)
        setInvoices(iRes.data)
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [cid])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Payments & Invoices</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Financial transactions overview</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <button onClick={() => setTab('payments')} className={`px-4 py-2 text-sm font-medium transition-colors ${tab === 'payments' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}>Payments</button>
          <button onClick={() => setTab('invoices')} className={`px-4 py-2 text-sm font-medium transition-colors ${tab === 'invoices' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}>Invoices</button>
        </div>
        <div className="relative max-w-xs flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700" />
        </div>
      </div>

      {tab === 'payments' ? (
        <div className="space-y-3">
          {payments.length === 0 ? (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-12 text-center">
              <CreditCard size={40} className="mx-auto text-zinc-600 mb-3" />
              <p className="text-zinc-500">No payments recorded yet</p>
            </div>
          ) : (
            payments.map((p, i) => (
              <div key={p.id} className={`bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700 transition-all animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <DollarSign size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium font-mono text-sm">{p.payment_number}</p>
                    <p className="text-xs text-zinc-500">{p.paid_at}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {p.status}
                  </span>
                  <span className="text-white font-bold">{p.amount} {p.currency}</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.length === 0 ? (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-12 text-center">
              <FileText size={40} className="mx-auto text-zinc-600 mb-3" />
              <p className="text-zinc-500">No invoices yet</p>
            </div>
          ) : (
            invoices.map((inv, i) => (
              <div key={inv.id} className={`bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700 transition-all animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Receipt size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium font-mono text-sm">{inv.invoice_number}</p>
                    <p className="text-xs text-zinc-500">Due: {inv.due_at ?? '—'} · {inv.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-white font-bold">{inv.total_amount} {inv.currency}</p>
                    <p className="text-xs text-zinc-500">Balance: {inv.balance_due}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
