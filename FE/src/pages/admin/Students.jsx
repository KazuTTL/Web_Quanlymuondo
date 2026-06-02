import { useState, useEffect } from 'react'
import { getStudentsAdmin, toggleStudentStatusAdmin, updateStudentAdmin } from '../../services/api'
import { Users, Lock, Unlock, Edit, Search, Phone, Mail, GraduationCap, Landmark, AlertTriangle } from 'lucide-react'

function Modal({ title, children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#fff', border: '3px solid #0a0a0a', boxShadow: '6px 6px 0 #0a0a0a',
        padding: '24px', minWidth: '360px', maxWidth: '480px', width: '90%'
      }}>
        <div style={{
          fontWeight: 'bold', fontSize: '18px', textTransform: 'uppercase',
          borderBottom: '2px solid #0a0a0a', paddingBottom: '12px', marginBottom: '16px'
        }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Edit modal state
  const [editStudent, setEditStudent] = useState(null) // { id, name, studentId, email }
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  // Toggle lock state
  const [lockModal, setLockModal] = useState(null) // { id, name, status }
  const [lockLoading, setLockLoading] = useState(false)

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getStudentsAdmin()
      const data = res.data?.data || res.data || []
      setStudents(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError('Không thể tải danh sách sinh viên')
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditError('')
    setEditLoading(true)
    try {
      await updateStudentAdmin(editStudent.id, {
        email: editStudent.email,
        studentId: editStudent.studentId
      })
      setSuccess(`Đã cập nhật thông tin cho sinh viên: ${editStudent.name}`)
      setEditStudent(null)
      loadStudents()
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setEditError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật')
    } finally {
      setEditLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!lockModal) return
    setLockLoading(true)
    try {
      await toggleStudentStatusAdmin(lockModal.id)
      const action = lockModal.status === 'ACTIVE' ? 'khóa' : 'mở khóa'
      setSuccess(`Đã ${action} tài khoản sinh viên: ${lockModal.name}`)
      setLockModal(null)
      loadStudents()
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi thay đổi trạng thái tài khoản')
    } finally {
      setLockLoading(false)
    }
  }

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const filteredStudents = students.filter(student => {
    const term = searchTerm.toLowerCase()
    const name = (student.name || '').toLowerCase()
    const email = (student.email || '').toLowerCase()
    const studentId = (student.studentId || '').toLowerCase()
    const phone = (student.phone || '').toLowerCase()
    return name.includes(term) || email.includes(term) || studentId.includes(term) || phone.includes(term)
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', textTransform: 'uppercase', margin: 0, fontWeight: '800' }}>
          Quản Lý Sinh Viên
        </h1>
        
        {/* Thanh tìm kiếm */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '2px solid #0a0a0a', boxShadow: '3px 3px 0 #0a0a0a', padding: '6px 12px', width: '320px' }}>
          <Search size={18} style={{ color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Tìm theo tên, MSV, mail, SĐT..."
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', fontWeight: '500' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}

      {loading ? (
        <div className="loading">ĐANG TẢI...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="empty">
          <p>{searchTerm ? 'Không tìm thấy sinh viên phù hợp' : 'Không có dữ liệu sinh viên'}</p>
        </div>
      ) : (
        <div className="card">
          <h3 className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} /> Danh Sách Sinh Viên và Trạng Thái Học Tập
          </h3>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Tên Sinh Viên</th>
                  <th>MSSV</th>
                  <th>Liên Hệ</th>
                  <th style={{ textAlign: 'center' }}>Số Lần Quá Hạn</th>
                  <th style={{ textAlign: 'center' }}>Tiền Phạt</th>
                  <th style={{ textAlign: 'center' }}>Đang Nợ TB</th>
                  <th style={{ textAlign: 'center' }}>Trạng Thái</th>
                  <th style={{ textAlign: 'center' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div style={{ fontWeight: '700' }}>{student.name}</div>
                    </td>
                    <td>
                      {student.studentId ? (
                        <code style={{ background: '#f1f5f9', padding: '2px 6px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>
                          {student.studentId}
                        </code>
                      ) : (
                        <span style={{ color: '#ef4444', fontStyle: 'italic', fontWeight: '600' }}>Trống (Cần cập nhật)</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={12} /> {student.email}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} /> {student.phone || <span style={{ color: '#a1a1aa', fontStyle: 'italic' }}>Chưa có</span>}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: student.overdueCount > 0 ? '#ef4444' : '#000' }}>
                      {student.overdueCount}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: student.pendingFines > 0 ? '#ef4444' : '#16a34a' }}>
                      {student.pendingFines > 0 ? formatMoney(student.pendingFines) : '0 ₫'}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: student.borrowingCount > 0 ? '#ea580c' : '#16a34a' }}>
                      {student.borrowingCount}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`tag ${student.status === 'ACTIVE' ? 'tag-approved' : 'tag-overdue'}`} style={{ display: 'inline-block', minWidth: '72px' }}>
                        {student.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đang khóa'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          className="btn btn-sm"
                          style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', background: '#f4f4f5' }}
                          onClick={() => setEditStudent({
                            id: student.id,
                            name: student.name,
                            studentId: student.studentId || '',
                            email: student.email || ''
                          })}
                        >
                          <Edit size={14} /> SỬA
                        </button>
                        <button
                          className={`btn btn-sm ${student.status === 'ACTIVE' ? 'btn-danger' : 'btn-primary'}`}
                          style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', minWidth: '85px' }}
                          onClick={() => setLockModal({
                            id: student.id,
                            name: student.name,
                            status: student.status
                          })}
                        >
                          {student.status === 'ACTIVE' ? <Lock size={14} /> : <Unlock size={14} />}
                          <span>{student.status === 'ACTIVE' ? 'KHÓA' : 'MỞ KHÓA'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT STUDENT DETAILS MODAL */}
      {editStudent && (
        <Modal title="Cập nhật thông tin sinh viên" onClose={() => setEditStudent(null)}>
          <form onSubmit={handleEditSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>Họ tên:</span>
              <div style={{ fontWeight: 'bold', fontSize: '16px', marginTop: '4px' }}>{editStudent.name}</div>
            </div>
            
            {editError && <div className="alert alert-error mb-4">{editError}</div>}

            <div className="input-group">
              <label className="input-label">Mã sinh viên (MSSV)</label>
              <input
                type="text"
                className="input"
                value={editStudent.studentId}
                onChange={(e) => setEditStudent({ ...editStudent, studentId: e.target.value })}
                placeholder="VD: B21DCCN123"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                type="email"
                className="input"
                value={editStudent.email}
                onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })}
                placeholder="VD: sinhvien@school.edu.vn"
                required
              />
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button type="submit" className="btn btn-primary" disabled={editLoading}>
                {editLoading ? 'ĐANG LƯU...' : 'LƯU LẠI'}
              </button>
              <button type="button" className="btn" onClick={() => setEditStudent(null)} disabled={editLoading}>
                HỦY
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* LOCK / UNLOCK CONFIRMATION MODAL */}
      {lockModal && (
        <Modal 
          title={lockModal.status === 'ACTIVE' ? 'Xác Nhận Khóa Tài Khoản' : 'Xác Nhận Mở Khóa'} 
          onClose={() => setLockModal(null)}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
            <AlertTriangle size={36} style={{ color: lockModal.status === 'ACTIVE' ? '#ef4444' : '#16a34a', flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontWeight: '500' }}>
                Bạn có chắc chắn muốn {lockModal.status === 'ACTIVE' ? 'khóa' : 'mở khóa'} tài khoản của sinh viên:
                <br /><strong>"{lockModal.name}"</strong>?
              </p>
              {lockModal.status === 'ACTIVE' && (
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>
                  Sinh viên này sẽ không thể đăng nhập hoặc thực hiện yêu cầu mượn thiết bị mới sau khi bị khóa.
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button 
              className={`btn ${lockModal.status === 'ACTIVE' ? 'btn-danger' : 'btn-primary'}`} 
              onClick={handleToggleStatus} 
              disabled={lockLoading}
            >
              {lockLoading ? 'ĐANG XỬ LÝ...' : (lockModal.status === 'ACTIVE' ? 'KHÓA TÀI KHOẢN' : 'MỞ KHÓA')}
            </button>
            <button className="btn" onClick={() => setLockModal(null)} disabled={lockLoading}>HỦY</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AdminStudents
