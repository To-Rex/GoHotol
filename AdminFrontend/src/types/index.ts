export interface User {
  id: number
  uuid: string
  username: string
  email: string
  full_name: string
  phone: string | null
  company_id: number | null
  hotel_id: number | null
  branch_id: number | null
  is_super_admin: boolean
  is_active: boolean
  created_at: string
}

export interface Employee {
  id: number
  uuid: string
  company_id: number
  user_id: number | null
  hotel_id: number | null
  branch_id: number | null
  full_name: string
  position: string | null
  department: string | null
  phone: string | null
  email: string | null
  address: string | null
  salary: Record<string, unknown> | null
  status: string
  joined_at: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Company {
  id: number
  uuid: string
  name: string
  slug: string
  description: string | null
  email: string | null
  phone: string | null
  address: string | null
  country: string | null
  city: string | null
  timezone: string
  is_active: boolean
  subscription_plan: string | null
  subscription_expires_at: string | null
  created_at: string
  updated_at: string
}

export interface Branch {
  id: number
  uuid: string
  hotel_id: number
  name: string
  address: string | null
  contact_numbers: string[] | null
  email: string | null
  working_hours_start: string | null
  working_hours_end: string | null
  manager_id: number | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Hotel {
  id: number
  uuid: string
  company_id: number
  name: string
  slug: string
  description: string | null
  email: string | null
  phone: string | null
  address: string | null
  country: string | null
  city: string | null
  star_rating: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Role {
  id: number
  uuid: string
  company_id: number | null
  name: string
  slug: string
  description: string | null
  is_system: boolean
  is_active: boolean
  created_at: string
}

export interface Permission {
  id: number
  uuid: string
  name: string
  slug: string
  module: string
  description: string | null
  is_active: boolean
}

export interface AuditLog {
  id: number
  uuid: string
  company_id: number | null
  user_id: number | null
  action: string
  entity_type: string | null
  entity_id: number | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  details: string | null
  created_at: string
}

export interface Setting {
  id: number
  uuid: string
  key: string
  value: Record<string, unknown>
  description: string | null
}

export interface Notification {
  id: number
  title: string
  message: string
  notification_type: string
  is_read: boolean
  created_at: string
}

export interface DashboardStats {
  total_companies: number
  total_hotels: number
  total_users: number
  total_bookings: number
  active_companies: number
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  skip: number
  limit: number
}
