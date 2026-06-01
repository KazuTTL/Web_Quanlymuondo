import { db } from '@/configs'

export async function createNotification(userId, title, content, type = 'he_thong') {
    // Escape single quotes in title and content to prevent SQL injection or syntax errors
    const safeTitle = title.replace(/'/g, "''")
    const safeContent = content.replace(/'/g, "''")
    
    await db.query(`
        INSERT INTO Notifications (UserID, TieuDe, NoiDung, LoaiThongBao, DaXem)
        VALUES (${userId}, N'${safeTitle}', N'${safeContent}', N'${type}', 0)
    `)
}

export async function getUserNotifications(userId) {
    const result = await db.query(`
        SELECT 
            NotificationID,
            UserID,
            TieuDe as Title,
            NoiDung as Content,
            DaXem as IsRead,
            NgayTao
        FROM Notifications 
        WHERE UserID = ${userId} 
        ORDER BY NgayTao DESC
    `)
    return result.recordset
}

export async function markNotificationAsRead(notificationId) {
    await db.query(`
        UPDATE Notifications 
        SET DaXem = 1 
        WHERE NotificationID = ${notificationId}
    `)
}
