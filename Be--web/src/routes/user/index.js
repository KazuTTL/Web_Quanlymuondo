import { Router } from 'express'
import authRouter from './auth.router'
import profileRouter from './profile.route'
import deviceRouter from './device.router'
import borrowRequestRouter from './borrow-request.router'
import fineRouter from './fine.router'
import { asyncHandler } from '@/utils/helpers'
import * as notificationController from '@/app/controllers/notification.controller'
import * as borrowRecordController from '@/app/controllers/user/borrow-record.controller'
import { checkValidToken } from '@/app/middleware/user/auth.middleware'

const userRouter = Router()

userRouter.use('/auth', authRouter)
userRouter.use('/profile', profileRouter)
userRouter.use('/devices', deviceRouter)
userRouter.use('/borrow-requests', borrowRequestRouter)
userRouter.use('/fines', fineRouter)

// Lịch sử mượn trả (BorrowRecords)
userRouter.get('/borrow-records', checkValidToken, asyncHandler(borrowRecordController.getUserHistory))

userRouter.get('/notifications', checkValidToken, notificationController.getUserNotifications)
userRouter.patch('/notifications/:id/read', checkValidToken, notificationController.markNotificationRead)

export default userRouter