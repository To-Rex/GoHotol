import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, DoorOpen, CalendarCheck, Users, UserCheck,
  BarChart3, Settings, Shield, Wrench, CreditCard, ChevronLeft,
  ChevronRight, Building2, AppWindow, GitBranch,
} from 'lucide-react'

interface NavItem {
  to: string
  icon: React.ElementType
  label: string
  permission?: string
}

const allNav: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/rooms', icon: DoorOpen, label: 'Rooms' },
  { to: '/bookings', icon: CalendarCheck, label: 'Bookings' },
  { to: '/branches', icon: GitBranch, label: 'Branches' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/employees', icon: UserCheck, label: 'Employees', permission: 'employees.read' },
  { to: '/services', icon: AppWindow, label: 'Services' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/reports', icon: BarChart3, label: 'Reports', permission: 'reports.read' },
  { to: '/roles', icon: Shield, label: 'Roles', permission: 'roles.read' },
  { to: '/settings', icon: Settings, label: 'Settings', permission: 'settings.read' },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-zinc-950 border-r border-zinc-800 flex flex-col z-40 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className={`h-16 flex items-center border-b border-zinc-800 ${collapsed ? 'px-4 justify-center' : 'px-5'}`}>
        {!collapsed && (
          <>
            <Building2 size={22} className="text-indigo-400" />
            <span className="ml-2.5 text-lg font-bold tracking-tight text-white">XMS</span>
            <span className="ml-2 text-xs text-zinc-500 font-medium bg-zinc-800 px-1.5 py-0.5 rounded">PRO</span>
          </>
        )}
        {collapsed && <Building2 size={22} className="text-indigo-400" />}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {allNav.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || (to !== '/' && pathname.startsWith(to))
          return (
            <Link
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/70'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon size={18} />
              {!collapsed && label}
            </Link>
          )
        })}
      </nav>

      <div className={`p-4 border-t border-zinc-800 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  )
}
