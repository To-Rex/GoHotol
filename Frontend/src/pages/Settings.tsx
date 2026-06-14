import { useEffect, useState } from 'react'
import { Save, Key, User, Bell, Globe, Shield } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'

export default function Settings() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'profile' | 'security' | 'hotel'>('profile')
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setProfileForm({
      full_name: user?.full_name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    })
  }, [user])

  const tabs = [
    { key: 'profile' as const, icon: User, label: 'Profile' },
    { key: 'security' as const, icon: Key, label: 'Security' },
    { key: 'hotel' as const, icon: Globe, label: 'Hotel Info' },
  ]

  const handleProfileSave = async () => {
    try {
      await api.put(`/users/${user?.id}`, profileForm)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden w-fit">
        {tabs.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
              tab === key ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="max-w-lg bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 animate-scale-in">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.full_name?.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() ?? '?'}
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">{user?.full_name}</h2>
              <p className="text-zinc-500 text-sm">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Full Name</label>
              <input value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Email</label>
              <input value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Phone</label>
              <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <button onClick={handleProfileSave} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
              saved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
            }`}>
              <Save size={16} />
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="max-w-lg bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 animate-scale-in">
          <h2 className="text-white font-semibold mb-4">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Current Password</label>
              <input type="password" value={passwordForm.current_password} onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">New Password</label>
              <input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Confirm Password</label>
              <input type="password" value={passwordForm.confirm_password} onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20">
              <Key size={16} />
              Update Password
            </button>
          </div>
        </div>
      )}

      {tab === 'hotel' && (
        <div className="max-w-lg bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 animate-scale-in">
          <h2 className="text-white font-semibold mb-4">Hotel Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
              <Globe size={18} className="text-zinc-500" />
              <div>
                <p className="text-sm text-white">Hotel ID</p>
                <p className="text-xs text-zinc-500">{user?.hotel_id ?? 'Not assigned'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
              <Shield size={18} className="text-zinc-500" />
              <div>
                <p className="text-sm text-white">Role</p>
                <p className="text-xs text-zinc-500">{user?.is_super_admin ? 'Super Admin' : 'Staff'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
              <Bell size={18} className="text-zinc-500" />
              <div>
                <p className="text-sm text-white">Company ID</p>
                <p className="text-xs text-zinc-500">{user?.company_id ?? 'Not assigned'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
