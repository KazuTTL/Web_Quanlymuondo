import { Router } from 'express'
import authRouter from './auth.router'
import profileRouter from './profile.route'
import deviceRouter from './device.router'
import borrowRequestRouter from './borrow-request.router'
import * as notificationController from '@/app/controllers/notification.controller'
import { checkValidToken } from '@/app/middleware/user/auth.middleware'

const userRouter = Router()

userRouter.use('/auth', authRouter)
userRouter.use('/profile', profileRouter)
userRouter.use('/devices', deviceRouter)
userRouter.use('/borrow-requests', borrowRequestRouter)
userRouter.get('/notifications', checkValidToken, notificationController.getUserNotifications)
userRouter.patch('/notifications/:id/read', checkValidToken, notificationController.markNotificationRead)

export default userRouter