import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import * as authMiddleware from '@/app/middleware/admin/auth.middleware'
import * as studentController from '@/app/controllers/admin/student.controller'

const studentRouter = Router()

// Require admin authentication
studentRouter.use(asyncHandler(authMiddleware.checkValidToken))

// Get list of all students with statistics
studentRouter.get('/', asyncHandler(studentController.getAllStudents))

// Toggle user status (lock/unlock student)
studentRouter.patch('/:id/status', asyncHandler(studentController.toggleStudentStatus))

// Update student phone or student ID
studentRouter.put('/:id', asyncHandler(studentController.updateStudentDetails))

export default studentRouter
