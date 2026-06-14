export interface User {
  id: number
  uuid: string
  username: string
  email: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  company_id: number | null
  hotel_id: number | null
  branch_id: number | null
  is_super_admin: boolean
  is_active: boolean
  is_verified: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
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
  logo_url: string | null
  website: string | null
  timezone: string
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
  logo_url: string | null
  email: string | null
  phone: string | null
  address: string | null
  country: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  star_rating: number | null
  check_in_time: string
  check_out_time: string
  is_active: boolean
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

export interface Building {
  id: number
  uuid: string
  hotel_id: number
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Floor {
  id: number
  uuid: string
  building_id: number
  number: string
  name: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RoomCategory {
  id: number
  uuid: string
  company_id: number | null
  hotel_id: number | null
  name: string
  slug: string
  description: string | null
  base_price: number
  max_guests: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RoomType {
  id: number
  uuid: string
  category_id: number | null
  company_id: number | null
  name: string
  slug: string
  description: string | null
  price_modifier: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RoomFeature {
  id: number
  uuid: string
  company_id: number | null
  name: string
  slug: string
  icon: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RoomStatus {
  id: number
  uuid: string
  name: string
  slug: string
  color: string
  description: string | null
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Room {
  id: number
  uuid: string
  hotel_id: number
  floor_id: number | null
  category_id: number | null
  room_type_id: number | null
  status_id: number | null
  room_number: string
  name: string | null
  description: string | null
  base_price: number
  size_sqm: number | null
  max_guests: number
  bed_type: string | null
  bed_count: number
  floor_number: number | null
  phone_extension: string | null
  feature_ids: number[] | null
  amenity_ids: number[] | null
  policy_ids: number[] | null
  photos: string[] | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Booking {
  id: number
  uuid: string
  booking_number: string
  company_id: number
  hotel_id: number
  branch_id: number | null
  customer_id: number
  status_id: number | null
  booking_type: string
  group_name: string | null
  check_in_date: string
  check_out_date: string
  actual_check_in: string | null
  actual_check_out: string | null
  guest_count: number
  special_requests: string | null
  notes: string | null
  is_group_booking: boolean
  total_amount: number
  paid_amount: number
  tax_amount: number
  discount_amount: number
  currency: string
  created_by_id: number | null
  created_at: string
  updated_at: string
}

export interface BookingStatus {
  id: number
  uuid: string
  name: string
  slug: string
  description: string | null
  is_default: boolean
  is_active: boolean
}

export interface Customer {
  id: number
  uuid: string
  company_id: number
  hotel_id: number | null
  full_name: string
  first_name: string | null
  last_name: string | null
  middle_name: string | null
  nationality: string | null
  date_of_birth: string | null
  gender: string | null
  phone: string | null
  email: string | null
  address: string | null
  photo_url: string | null
  notes: string | null
  registration_type: string
  is_blacklisted: boolean
  is_active: boolean
  created_at: string
  updated_at: string
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

export interface CleaningTask {
  id: number
  uuid: string
  task_number: string
  company_id: number
  hotel_id: number
  room_id: number
  booking_id: number | null
  assigned_to_id: number | null
  status: string
  priority: string
  started_at: string | null
  completed_at: string | null
  notes: string | null
  photos: string[] | null
  checklist_results: Record<string, unknown> | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ServiceCategory {
  id: number
  uuid: string
  company_id: number | null
  name: string
  slug: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: number
  uuid: string
  company_id: number | null
  hotel_id: number | null
  category_id: number | null
  name: string
  slug: string
  description: string | null
  price: number
  tax_rate: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PaymentMethod {
  id: number
  uuid: string
  name: string
  slug: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Payment {
  id: number
  uuid: string
  payment_number: string
  company_id: number
  booking_id: number
  invoice_id: number | null
  payment_method_id: number
  amount: number
  currency: string
  transaction_id: string | null
  paid_at: string
  notes: string | null
  status: string
  receipt_url: string | null
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: number
  uuid: string
  invoice_number: string
  company_id: number
  booking_id: number
  customer_id: number
  invoice_type: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  paid_amount: number
  balance_due: number
  currency: string
  issued_at: string
  due_at: string | null
  pdf_url: string | null
  notes: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total_rooms: number
  occupied_rooms: number
  available_rooms: number
  occupancy_rate: number
  today_revenue: number
  today_bookings: number
  new_customers: number
  pending_cleaning: number
}

export interface RevenueData {
  date?: string
  year?: number
  month?: number
  total_revenue: number
  transaction_count: number
}

export interface OccupancyData {
  total_rooms: number
  occupied_rooms: number
  available_rooms: number
  occupancy_rate: number
}

export interface CustomerReport {
  period: string
  new_customers: number
  total_customers: number
}

export interface EmployeePerformance {
  user_id: number
  total_tasks: number
  completed_tasks: number
  completion_rate: number
}

export interface EmployeeReport {
  period_days: number
  performance: EmployeePerformance[]
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  skip: number
  limit: number
}
