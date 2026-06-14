import { LogOut, User, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useState, useRef, useEffect } from 'react'

export default function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.full_name
    ?.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() ?? '??'

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="w-2 h-2 rounded-full bg-emerald-400 absolute inset-0 animate-ping" />
          </div>
          <span className="text-xs text-zinc-500 font-medium tracking-widest uppercase">
            {user?.hotel_id ? 'Hotel Active' : 'Online'}
          </span>
        </div>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-zinc-800/70 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm text-white font-medium leading-tight">{user?.full_name}</p>
            <p className="text-xs text-zinc-500 leading-tight">{user?.email}</p>
          </div>
          <ChevronDown size={14} className={`text-zinc-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-scale-in origin-top-right">
            <div className="px-4 py-3 border-b border-zinc-800">
              <p className="text-sm text-white font-medium">{user?.full_name}</p>
              <p className="text-xs text-zinc-500">{user?.email}</p>
            </div>
            <div className="py-1">
              <button
                onClick={() => { setMenuOpen(false); navigate('/settings') }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <User size={16} />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
