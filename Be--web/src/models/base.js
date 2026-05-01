// models/base.js
// Mongoose đã được loại bỏ, dự án chuyển sang SQL Server (mssql)
// File này chỉ giữ lại các hằng số dùng chung cho toàn bộ dự án

export const ROLE = {
    ADMIN: 'admin',
    USER: 'user',
}

export const STATUS_ACCOUNT = {
    ACTIVE: 'ACTIVE',
    DE_ACTIVE: 'DE_ACTIVE',
}

export const EVENT_TYPE = {
    INTERNAL: 'INTERNAL',
    PUBLIC: 'PUBLIC',
}
