import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import * as authMiddleware from '@/app/middleware/admin/auth.middleware'
import * as fineController from '@/app/controllers/admin/fine.controller'

const router = Router()

// Yêu cầu xác thực quyền Admin
router.use(asyncHandler(authMiddleware.checkValidToken))

// Lấy danh sách tiền phạt toàn bộ
router.get('/', asyncHandler(fineController.readAllFines))

// Tự động kiểm tra quá hạn và tính phạt
router.post('/process', asyncHandler(fineController.processOverdueFines))

export default router
