import express from 'express'
import * as achievementController from '@/app/controllers/user/achievement.controller'
import validate from '@/app/middleware/user/validate'
import * as achievementRequest from '@/app/requests/user/achievement.request'
import { checkValidToken } from '@/app/middleware/user/auth.middleware'

const router = express.Router()

// Lấy tất cả thành tích
router.get('/', achievementController.getAllAchievements)

// Lấy thành tích nổi bật
router.get('/best', achievementController.getBestAchievements)

// Lấy thành tích theo ID
router.get('/:id', achievementController.getAchievementById)

// Lấy thành tích theo sự kiện
router.get('/event/:eventId', achievementController.getAchievementsByEventId)

// Lấy thành tích theo người dùng
router.get('/user/:userId', achievementController.getAchievementsByUserId)

// Thêm thành tích mới không liên quan đến sự kiện của trang
router.post('/', [
    checkValidToken,
    validate(achievementRequest.createAchievementSchema)
], achievementController.createAchievement)

// Cập nhật thành tích
router.put('/:id', [
    checkValidToken,
    validate(achievementRequest.updateAchievementSchema)
], achievementController.updateAchievement)

// Xóa thành tích
router.delete('/:id', [
    checkValidToken,
], achievementController.deleteAchievement)

export default router 