// role.middleware.js
// Đã loại bỏ Mongoose, hệ thống dùng SQL Server (RoleID hardcoded: 1=admin, 2=user)
// Các route /roles vẫn được giữ nhưng trả về stub rỗng (không còn dùng trong nghiệp vụ chính)

import {abort} from '@/utils/helpers'

// eslint-disable-next-line require-await
export async function checkRoleId(req, res, next) {
    // Stub: không còn quản lý Role động qua DB, luôn cho phép đi qua
    req.role = { _id: req.params.roleId, can_edit: true, can_delete: true }
    next()
}

export function canUpdate(req, res, next) {
    if (!req.role.can_edit) {
        abort(403, 'Không thể chỉnh sửa vai trò này.')
    }
    next()
}

export function canDelete(req, res, next) {
    if (!req.role.can_delete) {
        abort(403, 'Không thể xóa vai trò này.')
    }
    next()
}

// eslint-disable-next-line require-await
export async function checkPermissionId(req, res, next) {
    // Stub: không còn quản lý Permission động
    req.permission = { _id: req.params.permissionId }
    next()
}

// eslint-disable-next-line require-await
export async function checkAccountId(req, res, next) {
    // Stub: forward cho route handler tự xử lý
    req.account = { _id: req.params.accountId }
    next()
}
