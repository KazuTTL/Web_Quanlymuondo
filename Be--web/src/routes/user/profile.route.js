import express from 'express'
import * as profileController from '@/app/controllers/user/profile.controller'
import validate from '@/app/middleware/user/validate'
import * as profileRequest from '@/app/requests/user/profile.request'
import { checkValidToken } from '@/app/middleware/user/auth.middleware'
import { asyncHandler } from '@/utils/helpers'

const router = express.Router()

router.get('/', checkValidToken, asyncHandler(profileController.getProfile))
router.put('/', [
    checkValidToken,
    asyncHandler(validate(profileRequest.updateProfile))
], asyncHandler(profileController.updateProfile))

export default router