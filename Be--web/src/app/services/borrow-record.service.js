import { db } from '@/configs'
import { abort } from '@/utils/helpers'

// Map kết quả từ view vw_LichSuMuonTraSinhVien sang chuẩn Frontend
const mapRecordToFE = (r) => ({
    ...r,
    id: r.RecordID,
    _id: r.RecordID,
    userId: r.UserID,
    userName: r.TenSinhVien,
    email: r.Email,
    deviceName: r.TenThietBi,
    category: r.DanhMuc,
    quantity: r.SoLuongMuon,
    borrowDate: r.NgayMuon,
    returnDate: r.NgayTraDuKien,
    returnedAt: r.NgayTraThucTe,
    status: r.TrangThai,
    statusText: r.TinhTrangHienTai,
    overdueDays: r.SoNgayQuaHan,
    note: r.GhiChu
})

export async function getUserBorrowHistory(userId) {
    try {
        const result = await db.query(`
            SELECT * FROM vw_LichSuMuonTraSinhVien 
            WHERE UserID = ${userId}
            ORDER BY NgayMuon DESC
        `)
        return result.recordset.map(mapRecordToFE)
    } catch (error) {
        console.error('Error in getUserBorrowHistory:', error)
        abort(500, 'Lỗi khi lấy lịch sử mượn trả.')
    }
}
