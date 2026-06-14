import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Rooms from './pages/Rooms'
import Bookings from './pages/Bookings'
import Branches from './pages/Branches'
import Customers from './pages/Customers'
import Employees from './pages/Employees'
import Services from './pages/Services'
import Payments from './pages/Payments'
import Reports from './pages/Reports'
import Roles from './pages/Roles'
import Settings from './pages/Settings'
import { Spinner } from './components/ui/Spinner'
import { useAuth } from './hooks/useAuth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
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
          <Route path="rooms" element={<Rooms />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="branches" element={<Branches />} />
          <Route path="customers" element={<Customers />} />
          <Route path="employees" element={<Employees />} />
          <Route path="services" element={<Services />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="roles" element={<Roles />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
