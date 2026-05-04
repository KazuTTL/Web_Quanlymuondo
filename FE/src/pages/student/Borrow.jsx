import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getDeviceById, createBorrowRequest } from '../../services/api'

function StudentBorrow() {
  const { deviceId } = useParams()
  const navigate = useNavigate()
  const [device, setDevice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    quantity: 1,
    borrowDate: '',
    returnDate: '',
    purpose: ''
  })

  useEffect(() => {
    loadDevice()
  }, [deviceId])

  const loadDevice = async () => {
    try {
      const res = await getDeviceById(deviceId)
      setDevice(res.data)
    } catch (err) {
      setError('Không tải được thiết bị')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await createBorrowRequest({
        deviceId: parseInt(deviceId),
        borrowDate: formData.borrowDate,
        returnDate: formData.returnDate,
        quantity: formData.quantity,
        purpose: formData.purpose
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi yêu cầu')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading">ĐANG TẢI...</div>
  }

  if (success) {
    return (
      <div>
        <div className="navbar">
          <Link to="/" className="navbar-brand">LendHub</Link>
        </div>
        <div className="container">
          <div className="card text-center">
            <h2 style={{ color: 'var(--success)', marginBottom: '16px' }}>✓ GỬI YÊU CẦU THÀNH CÔNG</h2>
            <p>Yêu cầu của bạn đã được gửi đến quản trị viên.</p>
            <p>Vui lòng chờ duyệt trong thời gian sớm nhất.</p>
            <div className="flex justify-center gap-4 mt-4">
              <Link to="/my-requests">
                <button className="btn btn-primary">XEM YÊU CẦU</button>
              </Link>
              <Link to="/devices">
                <button className="btn">TIẾP TỤC MƯỢN</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!device) {
    return (
      <div className="container">
        <div className="alert alert-error">{error || 'Không tìm thấy thiết bị'}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="navbar">
        <Link to="/" className="navbar-brand">LendHub</Link>
        <div className="navbar-menu">
          <Link to="/devices" className="navbar-link">← Quay lại</Link>
        </div>
      </div>

      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '20px', textTransform: 'uppercase', marginBottom: '24px' }}>
            Yêu Cầu Mượn Thiết Bị
          </h1>

          <div className="card-header">Thông tin thiết bị</div>
          <div className="mb-4">
            <p><strong>Tên:</strong> {device.name}</p>
            <p><strong>Mã:</strong> {device.serialNumber}</p>
            <p><strong>Số lượng có:</strong> {device.availableQuantity || device.quantity}</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Số lượng mượn *</label>
              <input
                type="number"
                className="input"
                min="1"
                max={device.availableQuantity || device.quantity}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Ngày mượn *</label>
              <input
                type="date"
                className="input"
                value={formData.borrowDate}
                onChange={(e) => setFormData({ ...formData, borrowDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Ngày trả dự kiến *</label>
              <input
                type="date"
                className="input"
                value={formData.returnDate}
                onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                min={formData.borrowDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Mục đích sử dụng *</label>
              <textarea
                className="input"
                rows="3"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Nhập mục đích mượn thiết bị..."
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'ĐANG GỬI...' : 'GỬI YÊU CẦU'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default StudentBorrow