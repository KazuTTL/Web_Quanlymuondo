import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import * as authMiddleware from '@/app/middleware/user/auth.middleware'
import * as borrowRequestController from '@/app/controllers/user/borrow-request.controller'

const router = Router()

// Middleware to check user authentication
router.use(asyncHandler(authMiddleware.checkValidToken))

// Get all borrow requests of current user
router.get('/', asyncHandler(borrowRequestController.getUserBorrowRequests))

// Get borrow request detail
router.get('/:id', asyncHandler(borrowRequestController.getBorrowRequestById))

// Create new borrow request
router.post('/', asyncHandler(borrowRequestController.createBorrowRequest))

// // Cancel borrow request
// router.delete('/:id', asyncHandler(borrowRequestController.cancelBorrowRequest))

export default router
