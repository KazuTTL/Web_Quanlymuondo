import { Router } from 'express'
import authRouter from './auth.router'
import profileRouter from './profile.route'
import deviceRouter from './device.router'
import borrowRequestRouter from './borrow-request.router'

const userRouter = Router()

userRouter.use('/auth', authRouter)
userRouter.use('/profile', profileRouter)
userRouter.use('/devices', deviceRouter)
userRouter.use('/borrow-requests', borrowRequestRouter)

export default userRouter
