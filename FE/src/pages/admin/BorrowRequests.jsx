import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllBorrowRequestsAdmin, approveRequest, rejectRequest, returnDevice } from '../../services/api'
import dayjs from 'dayjs'

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

function AdminBorrowRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [actionLoading, setActionLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Modal state
  const [approveModal, setApproveModal] = useState(null)   // { id }
  const [rejectModal, setRejectModal] = useState(null)     // { id }
  const [returnModal, setReturnModal] = useState(null)     // { id }
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    loadRequests()
  }, [filter])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const res = await getAllBorrowRequestsAdmin({ status: filter })
      // API có thể trả về { data: [...] } hoặc { data: { data: [...] } }
      const raw = res.data
      const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []
      setRequests(list)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveConfirm = async () => {
    if (!approveModal) return
    setActionLoading(true)
    setErrorMsg('')
    try {
      await approveRequest(approveModal.id)
      setApproveModal(null)
      loadRequests()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi khi duyệt yêu cầu')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectModal) return
    if (!rejectReason.trim()) {
      setErrorMsg('Vui lòng nhập lý do từ chối')
      return
    }
    setActionLoading(true)
    setErrorMsg('')
    try {
      await rejectRequest(rejectModal.id, rejectReason)
      setRejectModal(null)
      setRejectReason('')
      loadRequests()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi khi từ chối yêu cầu')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReturnConfirm = async () => {
    if (!returnModal) return
    setActionLoading(true)
    setErrorMsg('')
    try {
      await returnDevice(returnModal.id)
      // Reload TRƯỚC rồi mới đóng modal để tránh race condition
      await loadRequests()
      setReturnModal(null)
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi khi xác nhận trả')
    } finally {
      setActionLoading(false)
    }
  }

  const closeAllModals = () => {
    setApproveModal(null)
    setRejectModal(null)
    setReturnModal(null)
    setRejectReason('')
    setErrorMsg('')
  }

  const getStatusTag = (status, daTra) => {
    if (status === 'approved' && daTra) {
      return { text: 'Đã Trả', class: 'tag-returned' }
    }
    const tags = {
      pending: { text: 'Chờ duyệt', class: 'tag-pending' },
      approved: { text: 'Đã duyệt', class: 'tag-approved' },
      rejected: { text: 'Từ chối', class: 'tag-rejected' }
    }
    return tags[status] || { text: status, class: '' }
  }

  return (
    <div>
      <div className="container">
        <h1 style={{ fontSize: '24px', textTransform: 'uppercase', marginBottom: '24px' }}>
          Quản Lý Yêu Cầu Mượn
        </h1>


        <div className="flex gap-2 mb-4">
          {['pending', 'approved', 'rejected'].map(s => (
            <button
              key={s}
              className={`btn ${filter === s ? 'btn-primary' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'pending' ? 'Chờ Duyệt' : s === 'approved' ? 'Đã Duyệt' : 'Đã Từ Chối'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">ĐANG TẢI...</div>
        ) : requests.length === 0 ? (
          <div className="empty">Không có yêu cầu nào</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Người Mượn</th>
                <th>Thiết Bị</th>
                <th>Số Lượng</th>
                <th>Ngày Mượn</th>
                <th>Ngày Trả</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const reqStatus = req.status || req.TrangThai
                const daTra = req.DaTra === 1 || req.DaTra === true
                const status = getStatusTag(reqStatus, daTra)
                return (
                  <tr key={req._id || req.RequestID}>
                    <td>{req.user?.name || req.HoTen || req.TenSinhVien}</td>
                    <td>{req.device?.name || req.TenThietBi}</td>
                    <td>{req.quantity || req.SoLuongMuon}</td>
                    <td>{dayjs(req.borrowDate || req.NgayMuon).format('DD/MM/YYYY')}</td>
                    <td>{dayjs(req.returnDate || req.NgayTraDuKien).format('DD/MM/YYYY')}</td>
                    <td><span className={`tag ${status.class}`}>{status.text}</span></td>
                    <td>
                      {reqStatus === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => { setErrorMsg(''); setApproveModal({ id: req._id || req.RequestID }) }}
                          >Duyệt</button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => { setErrorMsg(''); setRejectReason(''); setRejectModal({ id: req._id || req.RequestID }) }}
                          >Từ Chối</button>
                        </div>
                      )}
                      {reqStatus === 'approved' && !daTra && (
                        <button
                          className="btn btn-sm"
                          onClick={() => { setErrorMsg(''); setReturnModal({ id: req._id || req.RequestID }) }}
                        >Xác Nhận Trả</button>
                      )}
                      {reqStatus === 'approved' && daTra && (
                        <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '12px' }}>✓ Đã hoàn trả</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* APPROVE MODAL */}
      {approveModal && (
        <Modal title="Xác Nhận Duyệt" onClose={closeAllModals}>
          <p style={{ marginBottom: '16px' }}>Bạn có chắc muốn <strong>duyệt</strong> yêu cầu mượn này không?</p>
          {errorMsg && <div className="alert alert-error" style={{ marginBottom: '12px' }}>{errorMsg}</div>}
          <div className="flex gap-2 justify-center">
            <button className="btn btn-success" onClick={handleApproveConfirm} disabled={actionLoading}>
              {actionLoading ? 'ĐANG XỬ LÝ...' : '✓ DUYỆT'}
            </button>
            <button className="btn" onClick={closeAllModals} disabled={actionLoading}>HỦY</button>
          </div>
        </Modal>
      )}

      {/* REJECT MODAL */}
      {rejectModal && (
        <Modal title="Từ Chối Yêu Cầu" onClose={closeAllModals}>
          <div className="input-group">
            <label className="input-label">Lý do từ chối *</label>
            <textarea
              className="input"
              rows="3"
              value={rejectReason}
              onChange={(e) => { setRejectReason(e.target.value); setErrorMsg('') }}
              placeholder="Nhập lý do từ chối yêu cầu này..."
              autoFocus
            />
          </div>
          {errorMsg && <div className="alert alert-error" style={{ marginBottom: '12px' }}>{errorMsg}</div>}
          <div className="flex gap-2 justify-center">
            <button className="btn btn-danger" onClick={handleRejectConfirm} disabled={actionLoading}>
              {actionLoading ? 'ĐANG XỬ LÝ...' : '✗ TỪ CHỐI'}
            </button>
            <button className="btn" onClick={closeAllModals} disabled={actionLoading}>HỦY</button>
          </div>
        </Modal>
      )}

      {/* RETURN MODAL */}
      {returnModal && (
        <Modal title="Xác Nhận Trả Thiết Bị" onClose={closeAllModals}>
          <p style={{ marginBottom: '16px' }}>Xác nhận sinh viên đã <strong>trả thiết bị</strong>?</p>
          {errorMsg && <div className="alert alert-error" style={{ marginBottom: '12px' }}>{errorMsg}</div>}
          <div className="flex gap-2 justify-center">
            <button className="btn btn-primary" onClick={handleReturnConfirm} disabled={actionLoading}>
              {actionLoading ? 'ĐANG XỬ LÝ...' : '✓ XÁC NHẬN TRẢ'}
            </button>
            <button className="btn" onClick={closeAllModals} disabled={actionLoading}>HỦY</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AdminBorrowRequests