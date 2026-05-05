import { db } from '@/configs'
import { abort } from '@/utils/helpers'

async function ensureTableExists() {
    const check = await db.query(`
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserNotifications]') AND type in (N'U'))
        BEGIN
            CREATE TABLE UserNotifications (
                NotificationID INT IDENTITY(1,1) PRIMARY KEY,
                UserID INT NOT NULL,
                Title NVARCHAR(200),
                Content NVARCHAR(MAX),
                IsRead BIT DEFAULT 0,
                NgayTao DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (UserID) REFERENCES Users(UserID)
            )
        END
    `)
}

export async function createNotification(userId, title, content) {
    await ensureTableExists()
    await db.query(`
        INSERT INTO UserNotifications (UserID, Title, Content)
        VALUES (${userId}, N'${title}', N'${content}')
    `)
}

export async function getUserNotifications(userId) {
    await ensureTableExists()
    const result = await db.query(`
        SELECT * FROM UserNotifications 
        WHERE UserID = ${userId} 
        ORDER BY NgayTao DESC
    `)
    return result.recordset
}

export async function markNotificationAsRead(notificationId) {
    await db.query(`
        UPDATE UserNotifications 
        SET IsRead = 1 
        WHERE NotificationID = ${notificationId}
    `)
}
