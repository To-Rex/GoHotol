import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Companies from './pages/Companies'
import Hotels from './pages/Hotels'
import Branches from './pages/Branches'
import Users from './pages/Users'
import Roles from './pages/Roles'
import AuditLogs from './pages/AuditLogs'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import { Spinner } from './components/ui/Spinner'
import { useAuth } from './hooks/useAuth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (!user.is_super_admin) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg font-medium">Access Denied</p>
          <p className="text-zinc-500 text-sm mt-1">Super admin access required</p>
        </div>
      </div>
    )
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="companies" element={<Companies />} />
          <Route path="hotels" element={<Hotels />} />
          <Route path="branches" element={<Branches />} />
          <Route path="users" element={<Users />} />
          <Route path="roles" element={<Roles />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
