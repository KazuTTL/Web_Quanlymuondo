import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import * as authMiddleware from '@/app/middleware/admin/auth.middleware'
import * as borrowRequestController from '@/app/controllers/admin/borrow-request.controller'

const router = Router()

// Middleware to check admin authentication
router.use(asyncHandler(authMiddleware.checkValidToken))

// Get all borrow requests
router.get('/', asyncHandler(borrowRequestController.getAllBorrowRequests))

// Get borrow request by id
router.get('/:id', asyncHandler(borrowRequestController.getBorrowRequestById))

// Approve borrow request
router.patch('/:id/approve', asyncHandler(borrowRequestController.approveRequest))

// Reject borrow request
router.patch('/:id/reject', asyncHandler(borrowRequestController.rejectRequest))

// Return device (Admin only)
router.patch('/:id/return', asyncHandler(borrowRequestController.returnDevice))

export default router
