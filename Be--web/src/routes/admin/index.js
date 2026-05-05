import {Router} from 'express'
import authRouter from './auth.router'
import roleRouter from './role.router'
import deviceRouter from './device.router'
import borrowRequestRouter from './borrow-request.router'
import statsRouter from './stats.router'
import * as notificationController from '@/app/controllers/notification.controller'
import { checkValidToken as authAdmin } from '@/app/middleware/admin/auth.middleware'

const admin = Router()

admin.use('/auth', authRouter)
admin.use('/roles', roleRouter)
admin.use('/devices', deviceRouter)
admin.use('/borrow-requests', borrowRequestRouter)
admin.use('/stats', statsRouter)
admin.post('/overdue/remind', authAdmin, notificationController.sendOverdueReminders)

export default admin
