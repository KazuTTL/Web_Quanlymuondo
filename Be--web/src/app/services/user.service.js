import { db } from '@/configs'
import { abort } from '@/utils/helpers'
import moment from 'moment'

export async function getUserProfile(userId) {
    try {
        const query = `
            SELECT 
                u.UserID as id, u.UserID as _id,
                u.HoTen as name, u.Username as username,
                u.Email as email, u.Phone as phone, 
                u.Avatar as avatar, u.TrangThai as status,
                u.GioiTinh as gender, u.NgaySinh as dob,
                s.MaSinhVien as studentId
            FROM Users u
            LEFT JOIN Students s ON u.UserID = s.UserID
            WHERE u.UserID = ${userId} AND u.IsDeleted = 0
        `
        const result = await db.query(query)
        const user = result.recordset[0]
        
        if (!user) {
            abort(404, 'Không tìm thấy người dùng')
        }
        
        return user
    } catch (error) {
        if (error.status) throw error
        console.error(error)
        abort(500, 'Lỗi khi lấy thông tin người dùng')
    }
}

export async function updateUserProfile(userId, profileData) {
    try {
        const setQuery = []
        if (profileData.name) setQuery.push(`HoTen = N'${profileData.name}'`)
        if (profileData.email) setQuery.push(`Email = '${profileData.email}'`)
        if (profileData.phone && profileData.phone.length >= 10) {
            setQuery.push(`Phone = '${profileData.phone}'`)
        }
        if (profileData.gender !== undefined) {
            setQuery.push(profileData.gender ? `GioiTinh = N'${profileData.gender}'` : 'GioiTinh = NULL')
        }
        if (profileData.dob !== undefined) {
            setQuery.push(profileData.dob ? `NgaySinh = '${moment(profileData.dob).format('YYYY-MM-DD')}'` : 'NgaySinh = NULL')
        }
        if (profileData.avatar !== undefined) {
            setQuery.push(profileData.avatar ? `Avatar = '${profileData.avatar}'` : 'Avatar = NULL')
        }

        if (profileData.studentId !== undefined) {
            const studentId = profileData.studentId
            if (studentId) {
                // Check if studentId is already used by another user
                const checkResult = await db.query(`SELECT 1 FROM Students WHERE MaSinhVien = '${studentId}' AND UserID <> ${userId}`)
                if (checkResult.recordset.length > 0) {
                    abort(400, 'Mã sinh viên đã được sử dụng.')
                }

                // Check if user already has a student record
                const hasRecordResult = await db.query(`SELECT 1 FROM Students WHERE UserID = ${userId}`)
                if (hasRecordResult.recordset.length > 0) {
                    await db.query(`UPDATE Students SET MaSinhVien = '${studentId}' WHERE UserID = ${userId}`)
                } else {
                    await db.query(`INSERT INTO Students (UserID, MaSinhVien, TrangThaiHocTap) VALUES (${userId}, '${studentId}', N'dang_hoc')`)
                }
            }
        }

        if (setQuery.length > 0) {
            await db.query(`
                UPDATE Users 
                SET ${setQuery.join(', ')}, NgayCapNhat = GETDATE()
                WHERE UserID = ${userId} AND IsDeleted = 0
            `)
        }

        return await getUserProfile(userId)
    } catch (error) {
        if (error.status) throw error
        console.error(error)
        abort(500, 'Lỗi khi cập nhật thông tin người dùng')
    }
}