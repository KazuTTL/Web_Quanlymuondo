import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../../services/api'

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    phone: '',
    studentId: '',
    dob: '',
    gender: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp')
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)

    try {
      await register({
        username: formData.username,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        studentId: formData.studentId || null,
        dob: formData.dob || null,
        gender: formData.gender || null
      })
      navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } })
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%' }}>
        <h1 style={{ fontSize: '24px', textTransform: 'uppercase', textAlign: 'center', marginBottom: '24px' }}>
          Đăng Ký Tài Khoản
        </h1>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Thông tin đăng nhập */}
          <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '16px' }}>
            <p style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '12px' }}>Thông tin đăng nhập</p>
            <div className="input-group">
              <label className="input-label">Tên đăng nhập *</label>
              <input
                type="text"
                name="username"
                className="input"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Mật khẩu * (ít nhất 6 ký tự)</label>
              <input
                type="password"
                name="password"
                className="input"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Nhập lại mật khẩu *</label>
              <input
                type="password"
                name="confirmPassword"
                className="input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Thông tin cá nhân */}
          <div>
            <p style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '12px' }}>Thông tin cá nhân</p>

            <div className="input-group">
              <label className="input-label">Họ và tên *</label>
              <input
                type="text"
                name="name"
                className="input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Mã sinh viên</label>
              <input
                type="text"
                name="studentId"
                className="input"
                placeholder="VD: 21IT123456"
                value={formData.studentId}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Email *</label>
              <input
                type="email"
                name="email"
                className="input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Số điện thoại</label>
              <input
                type="tel"
                name="phone"
                className="input"
                placeholder="VD: 0901234567"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label">Ngày sinh</label>
                <input
                  type="date"
                  name="dob"
                  className="input"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Giới tính</label>
                <select
                  name="gender"
                  className="input"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ'}
          </button>
        </form>

        <div className="text-center mt-4">
          <span>Đã có tài khoản? </span>
          <Link to="/login" style={{ fontWeight: 'bold' }}>Đăng nhập</Link>
        </div>
      </div>
    </div>
  )
}

export default Register