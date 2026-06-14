import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs text-zinc-500 font-medium tracking-widest uppercase">System Online</span>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <LogOut size={14} />
        Logout
      </button>
    </header>
  )
}
