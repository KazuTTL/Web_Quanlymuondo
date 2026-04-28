import express from 'express'
import * as profileController from '@/app/controllers/user/profile.controller'
import validate from '@/app/middleware/user/validate'
import * as profileRequest from '@/app/requests/user/profile.request'
import { checkValidToken } from '@/app/middleware/user/auth.middleware'

const router = express.Router()

router.get('/', checkValidToken, profileController.getProfile)
router.put('/', [
    checkValidToken,
    validate(profileRequest.updateProfile)
], profileController.updateProfile)

export default router 