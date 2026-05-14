import { db } from '@/configs'
import { abort } from '@/utils/helpers'

export async function getUserProfile(userId) {
    try {
        const query = `
            SELECT 
                UserID as id, UserID as _id,
                HoTen as name, Username as username,
                Email as email, Phone as phone, 
                Avatar as avatar, TrangThai as status,
                GioiTinh as gender, NgaySinh as dob
            FROM Users 
            WHERE UserID = ${userId} AND IsDeleted = 0
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
            setQuery.push(profileData.dob ? `NgaySinh = '${profileData.dob}'` : 'NgaySinh = NULL')
        }
        if (profileData.avatar !== undefined) {
            setQuery.push(profileData.avatar ? `Avatar = '${profileData.avatar}'` : 'Avatar = NULL')
        }

        if (setQuery.length === 0) return await getUserProfile(userId)

        await db.query(`
            UPDATE Users 
            SET ${setQuery.join(', ')}, NgayCapNhat = GETDATE()
            WHERE UserID = ${userId} AND IsDeleted = 0
        `)

        const selectResult = await db.query(`
            SELECT UserID as id, UserID as _id, HoTen as name, Username as username,
                   Email as email, Phone as phone, Avatar as avatar, GioiTinh as gender,
                   NgaySinh as dob, TrangThai as status
            FROM Users WHERE UserID = ${userId}
        `)
        const updatedUser = selectResult.recordset[0]
        
        if (!updatedUser) {
            abort(404, 'Không tìm thấy người dùng')
        }
        
        return updatedUser
    } catch (error) {
        if (error.status) throw error
        console.error(error)
        abort(500, 'Lỗi khi cập nhật thông tin người dùng')
    }
}