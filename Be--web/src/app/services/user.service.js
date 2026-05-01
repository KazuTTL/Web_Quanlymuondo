import { db } from '@/configs'
import { abort } from '@/utils/helpers'

export async function updateUserProfile(userId, profileData) {
    // Kiểm tra nếu cả email và phone đều trống
    if (!profileData.email && !profileData.phone) {
        abort(400, 'Email hoặc số điện thoại là bắt buộc')
    }
    
    try {
        const setQuery = []
        if (profileData.name) setQuery.push(`HoTen = N'${profileData.name}'`)
        if (profileData.email) setQuery.push(`Email = '${profileData.email}'`)
        if (profileData.phone) setQuery.push(`Phone = '${profileData.phone}'`)
        if (profileData.avatar) setQuery.push(`Avatar = '${profileData.avatar}'`)

        if (setQuery.length === 0) return await getUserProfile(userId)

        const query = `
            UPDATE Users 
            SET ${setQuery.join(', ')}
            OUTPUT inserted.UserID as _id, inserted.HoTen as name, inserted.Email as email, inserted.Phone as phone, inserted.Avatar as avatar
            WHERE UserID = ${userId} AND IsDeleted = 0
        `
        const result = await db.query(query)
        const updatedUser = result.recordset[0]
        
        if (!updatedUser) {
            abort(404, 'Không tìm thấy người dùng')
        }
        
        return updatedUser
    } catch (error) {
        console.error(error)
        abort(500, 'Lỗi khi cập nhật thông tin người dùng')
    }
}

export async function getUserProfile(userId) {
    try {
        const query = `
            SELECT UserID as _id, HoTen as name, Email as email, Phone as phone, Avatar as avatar, TrangThai as status
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
        console.error(error)
        abort(500, 'Lỗi khi lấy thông tin người dùng')
    }
}