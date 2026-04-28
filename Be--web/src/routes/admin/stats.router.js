import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import * as authMiddleware from '@/app/middleware/admin/auth.middleware'
import * as statsController from '@/app/controllers/admin/stats.controller'

const router = Router()

// Middleware to check admin authentication
router.use(asyncHandler(authMiddleware.checkValidToken))

// Get top borrowed devices in current month
router.get('/top-borrowed', asyncHandler(statsController.getTopBorrowedDevices))

// Get overdue devices
router.get('/overdue', asyncHandler(statsController.getOverdueDevices))

// Get devices due soon
router.get('/due-soon', asyncHandler(statsController.getDueSoonDevices))

export default router
