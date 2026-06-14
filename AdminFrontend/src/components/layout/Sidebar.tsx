import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Hotel, Users, Shield, ScrollText, Settings, Bell, GitBranch,
} from 'lucide-react'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/companies', icon: Building2, label: 'Companies' },
  { to: '/hotels', icon: Hotel, label: 'Hotels' },
  { to: '/branches', icon: GitBranch, label: 'Branches' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/roles', icon: Shield, label: 'Roles' },
  { to: '/audit-logs', icon: ScrollText, label: 'Audit Logs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
]

export default function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-zinc-950 border-r border-zinc-800 flex flex-col z-40">
      <div className="h-16 flex items-center px-5 border-b border-zinc-800">
        <span className="text-lg font-bold tracking-tight text-white">XMS</span>
        <span className="ml-2 text-xs text-zinc-500 font-medium">ADMIN</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label }) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/70'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate font-medium">Super Admin</p>
            <p className="text-xs text-zinc-500 truncate">Platform admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
