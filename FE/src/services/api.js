import axios from 'axios'

const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - Add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// AUTH
export const login = (username, password) => 
  api.post('/user/auth/login', { username, password })

export const loginAdmin = (email, password) => 
  api.post('/admin/auth/login', { email, password })

export const logout = () => 
  api.post('/user/auth/logout')

export const register = (data) => 
  api.post('/user/auth/register', data)

// PROFILE - User
export const getProfile = () =>
  api.get('/user/profile')

export const updateProfile = (data) =>
  api.put('/user/profile', data)

// DEVICES - User
export const getDevices = (params) => 
  api.get('/user/devices', { params })

export const getDeviceById = (id) => 
  api.get(`/user/devices/${id}`)

// BORROW REQUESTS - User
export const createBorrowRequest = (data) => 
  api.post('/user/borrow-requests', data)

export const getMyBorrowRequests = (params) => 
  api.get('/user/borrow-requests', { params })

export const getMyHistory = (params) => 
  api.get('/user/borrow-records', { params })


// DEVICES - Admin
export const getAllDevicesAdmin = (params) => 
  api.get('/admin/devices', { params })

export const createDevice = (data) => 
  api.post('/admin/devices', data)

export const updateDevice = (id, data) => 
  api.put(`/admin/devices/${id}`, data)

export const deleteDevice = (id) => 
  api.delete(`/admin/devices/${id}`)

// BORROW REQUESTS - Admin
export const getAllBorrowRequestsAdmin = (params) => 
  api.get('/admin/borrow-requests', { params })

export const approveRequest = (id) => 
  api.patch(`/admin/borrow-requests/${id}/approve`)

export const rejectRequest = (id, reason) => 
  api.patch(`/admin/borrow-requests/${id}/reject`, { rejectReason: reason })

export const returnDevice = (id) => 
  api.patch(`/admin/borrow-requests/${id}/return`)

// STATISTICS - Admin
export const getStatistics = () => 
  api.get('/admin/stats')

// NOTIFICATIONS - User
export const getMyNotifications = () => 
  api.get('/user/notifications')

export const markNotificationRead = (id) => 
  api.patch(`/user/notifications/${id}/read`)

// REMINDERS - Admin
export const sendOverdueReminders = () => 
  api.post('/admin/overdue/remind')

export default api