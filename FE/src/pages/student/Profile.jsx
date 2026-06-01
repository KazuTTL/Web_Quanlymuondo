import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProfile, updateProfile } from '../../services/api'
import StudentNavbar from '../../components/StudentNavbar'
import { CheckCircle } from 'lucide-react'

function StudentProfile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    dob: '',
    gender: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await getProfile()
      const data = res.data?.data || res.data || {}
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        studentId: data.studentId || '',
        dob: data.dob ? data.dob.split('T')[0] : '',
        gender: data.gender || ''
      })
    } catch (err) {
      setError('Không tải được thông tin cá nhân')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const res = await updateProfile({
        name: formData.name,
        phone: formData.phone || null,
        gender: formData.gender || null,
        dob: formData.dob || null,
        studentId: formData.studentId || null,
      })
      setSuccess('Cập nhật thông tin thành công!')
      // Update local user context
      const updatedUser = res.data?.data || res.data
      if (updatedUser) {
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
        const merged = { ...savedUser, name: updatedUser.name || savedUser.name }
        localStorage.setItem('user', JSON.stringify(merged))
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading">ĐANG TẢI...</div>

  return (
    <div>
      <StudentNavbar />

      <div className="container">
        <div className="card" style={{ maxWidth: '540px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '22px', textTransform: 'uppercase', marginBottom: '24px' }}>
            Thông Tin Cá Nhân
          </h1>

          {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
          {success && (
            <div className="alert" style={{ background: '#d1fae5', border: '2px solid #10b981', marginBottom: '16px' }}>
              <CheckCircle size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Họ và tên *</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Mã sinh viên (không thể thay đổi)</label>
              <input
                type="text"
                className="input"
                value={formData.studentId}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Email (không thể thay đổi)</label>
              <input
                type="email"
                className="input"
                value={formData.email}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Số điện thoại</label>
              <input
                type="tel"
                className="input"
                placeholder="VD: 0901234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label">Ngày sinh</label>
                <input
                  type="date"
                  className="input"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Giới tính</label>
                <select
                  className="input"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">-- Chọn --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
              </button>
              <button type="button" className="btn" onClick={() => navigate(-1)}>
                QUAY LẠI
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default StudentProfile
