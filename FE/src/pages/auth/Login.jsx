import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../../App'
import { login, loginAdmin } from '../../services/api'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login: authLogin } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Try admin login first (admin login expects { email, password } but backend supports username as email)
      const adminRes = await loginAdmin(username, password).catch(() => null)
      if (adminRes?.data?.data?.access_token) {
        authLogin(adminRes.data.data.user, adminRes.data.data.access_token, 'admin')
        navigate('/admin')
        return
      }

      // Try user login
      const userRes = await login(username, password).catch(() => null)
      if (userRes?.data?.data?.access_token) {
        authLogin(userRes.data.data.user, userRes.data.data.access_token, 'user')
        navigate('/')
        return
      }

      setError('Tài khoản hoặc mật khẩu không đúng')
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h1 style={{ fontSize: '24px', textTransform: 'uppercase', textAlign: 'center', marginBottom: '24px' }}>
          Đăng Nhập
        </h1>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Tên đăng nhập</label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Mật khẩu</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
          </button>
        </form>

        <div className="text-center mt-4">
          <span>Chưa có tài khoản? </span>
          <Link to="/register" style={{ fontWeight: 'bold' }}>Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  )
}

export default Login