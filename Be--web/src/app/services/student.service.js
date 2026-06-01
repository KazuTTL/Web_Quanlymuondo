import { db } from '@/configs'
import { abort } from '@/utils/helpers'

// Get all students with their loan, overdue and fine statistics
export async function getAllStudents() {
    try {
        const query = `
            SELECT 
                u.UserID as id,
                u.HoTen as name,
                s.MaSinhVien as studentId,
                u.Email as email,
                u.Phone as phone,
                u.TrangThai as status,
                -- Count of overdue occurrences (returned late OR currently late)
                (
                    SELECT COUNT(*) 
                    FROM BorrowRecords br 
                    WHERE br.UserID = u.UserID 
                      AND (br.NgayTraThucTe > br.NgayTraDuKien OR (br.NgayTraThucTe IS NULL AND br.NgayTraDuKien < CAST(GETDATE() AS DATE)))
                ) AS overdueCount,
                -- Total unpaid fines amount
                (
                    SELECT ISNULL(SUM(f.SoTien), 0) 
                    FROM Fines f 
                    WHERE f.UserID = u.UserID AND f.TrangThai = N'chua_thanh_toan'
                ) AS pendingFines,
                -- Number of items currently borrowing
                (
                    SELECT ISNULL(SUM(br.SoLuongMuon), 0) 
                    FROM BorrowRecords br 
                    WHERE br.UserID = u.UserID AND br.NgayTraThucTe IS NULL
                ) AS borrowingCount
            FROM Users u
            LEFT JOIN Students s ON u.UserID = s.UserID
            WHERE u.RoleID = 2 AND u.IsDeleted = 0
            ORDER BY u.HoTen ASC
        `
        const result = await db.query(query)
        return result.recordset
    } catch (error) {
        console.error('Error in getAllStudents service:', error)
        abort(500, 'Lỗi khi lấy danh sách sinh viên')
    }
}

// Toggle active/deactive status of a student account
export async function toggleStudentStatus(userId) {
    try {
        // Find current status
        const userQuery = await db.query(`SELECT TrangThai FROM Users WHERE UserID = ${userId} AND RoleID = 2 AND IsDeleted = 0`)
        const user = userQuery.recordset[0]
        if (!user) {
            abort(404, 'Không tìm thấy sinh viên')
        }

        const newStatus = user.TrangThai === 'ACTIVE' ? 'DE_ACTIVE' : 'ACTIVE'
        await db.query(`UPDATE Users SET TrangThai = '${newStatus}', NgayCapNhat = GETDATE() WHERE UserID = ${userId}`)
        
        return { userId, status: newStatus }
    } catch (error) {
        if (error.status) throw error
        console.error('Error in toggleStudentStatus service:', error)
        abort(500, 'Lỗi khi cập nhật trạng thái tài khoản sinh viên')
    }
}

// Update student details (Admin only - updates phone in Users and studentId in Students)
export async function updateStudentDetails(userId, { phone, studentId }) {
    try {
        // Check if student exists
        const userQuery = await db.query(`SELECT UserID FROM Users WHERE UserID = ${userId} AND RoleID = 2 AND IsDeleted = 0`)
        if (userQuery.recordset.length === 0) {
            abort(404, 'Không tìm thấy sinh viên')
        }

        // 1. Update phone in Users if provided
        if (phone !== undefined) {
            if (phone && phone.length < 10) {
                abort(400, 'Số điện thoại phải từ 10 chữ số trở lên.')
            }
            // Check if phone number is already used by another user
            if (phone) {
                const checkPhone = await db.query(`SELECT 1 FROM Users WHERE Phone = '${phone}' AND UserID <> ${userId} AND IsDeleted = 0`)
                if (checkPhone.recordset.length > 0) {
                    abort(400, 'Số điện thoại này đã được sử dụng bởi tài khoản khác.')
                }
            }
            const phoneVal = phone ? `'${phone}'` : 'NULL'
            await db.query(`UPDATE Users SET Phone = ${phoneVal}, NgayCapNhat = GETDATE() WHERE UserID = ${userId}`)
        }

        // 2. Update studentId in Students if provided
        if (studentId !== undefined) {
            if (studentId) {
                // Check if studentId is already used by another user
                const checkStudent = await db.query(`SELECT 1 FROM Students WHERE MaSinhVien = '${studentId}' AND UserID <> ${userId}`)
                if (checkStudent.recordset.length > 0) {
                    abort(400, 'Mã sinh viên này đã được sử dụng.')
                }

                // Check if student has a record in Students table
                const hasRecord = await db.query(`SELECT 1 FROM Students WHERE UserID = ${userId}`)
                if (hasRecord.recordset.length > 0) {
                    await db.query(`UPDATE Students SET MaSinhVien = '${studentId}' WHERE UserID = ${userId}`)
                } else {
                    await db.query(`INSERT INTO Students (UserID, MaSinhVien, TrangThaiHocTap) VALUES (${userId}, '${studentId}', N'dang_hoc')`)
                }
            } else {
                // If studentId is set to empty or null, remove student record or throw error?
                // MaSinhVien is NOT NULL in database schema, so we cannot set it to null.
                // We'll throw an error if trying to set studentId to empty.
                abort(400, 'Mã sinh viên không được để trống.')
            }
        }

        return { message: 'Cập nhật thông tin sinh viên thành công' }
    } catch (error) {
        if (error.status) throw error
        console.error('Error in updateStudentDetails service:', error)
        abort(500, 'Lỗi khi cập nhật thông tin sinh viên')
    }
}
