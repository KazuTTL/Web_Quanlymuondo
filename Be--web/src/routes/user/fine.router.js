import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import { checkValidToken } from '@/app/middleware/user/auth.middleware'
import * as fineController from '@/app/controllers/user/fine.controller'

const router = Router()

// Yêu cầu xác thực tài khoản Sinh viên
router.use(asyncHandler(checkValidToken))

// Lấy danh sách tiền phạt của bản thân
router.get('/', asyncHandler(fineController.readMyFines))

// Thanh toán tiền phạt
router.post('/:id/pay', asyncHandler(fineController.payFine))

export default router
