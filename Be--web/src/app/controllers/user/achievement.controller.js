import * as achievementService from '@/app/services/achievement.service'
import { abort } from '@/utils/helpers'
/**
 * Lấy danh sách tất cả thành tích
 */
export async function getAllAchievements(req, res) {
    const achievements = await achievementService.getAllAchievements()
    console.log(achievements)
    res.jsonify({
        message: 'Lấy danh sách thành tích thành công',
        achievements
    })
}

/**
 * Lấy thành tích theo ID
 */
export async function getAchievementById(req, res) {
    const { id } = req.params
    const achievement = await achievementService.getAchievementById(id)
    res.jsonify({
        message: 'Lấy thông tin thành tích thành công',
        achievement
    })
}

/**
 * Lấy thành tích theo sự kiện
 */
export async function getAchievementsByEventId(req, res) {
    const { eventId } = req.params
    const achievements = await achievementService.getAchievementsByEventId(eventId)
    res.jsonify({
        message: 'Lấy danh sách thành tích theo sự kiện thành công',
        achievements
    })
}

/**
 * Lấy thành tích theo người dùng
 */
export async function getAchievementsByUserId(req, res) {
    const { userId } = req.params
    const achievements = await achievementService.getAchievementsByUserId(userId)
    res.jsonify({
        message: 'Lấy danh sách thành tích theo người dùng thành công',
        achievements
    })
}

/**
 * Lấy thành tích nổi bật
 */
export async function getBestAchievements(req, res) {
    const achievements = await achievementService.getBestAchievements()
    res.jsonify({
        message: 'Lấy danh sách thành tích nổi bật thành công',
        achievements
    })
} 

/**
 * Thêm thành tích cá nhân mới không liên quan đến sự kiện của trang
 */
export async function createAchievement(req, res) {
    try {
        // Lấy user_id từ người dùng đã đăng nhập
        const user_id = req.currentUser._id
        const achievement = await achievementService.createAchievement(user_id, req.body)
        console.log(achievement)
        
        res.jsonify({
            message: 'Thêm thành tích cá nhân thành công',
            achievement
        })
    } catch (error) {
        abort(400, 'Không thể thêm thành tích cá nhân')
    }
}

/**
 * Cập nhật thành tích
 */
export async function updateAchievement(req, res) {
    try {
        const { id } = req.params
        const user_id = req.currentUser._id
        
        // Kiểm tra xem thành tích có thuộc về người dùng hiện tại không
        const existingAchievement = await achievementService.getAchievementById(id)
        
        console.log(existingAchievement)
        if (!existingAchievement) {
            abort(404, 'Không tìm thấy thành tích')
        }
        
        if (existingAchievement.user_id._id.toString() !== user_id.toString()) {
            abort(403, 'Bạn không có quyền cập nhật thành tích này')
        }
        
        const achievement = await achievementService.updateAchievement(id, req.body)
        
        res.jsonify({
            message: 'Cập nhật thành tích cá nhân thành công',
            achievement
        })
    } catch (error) {
        abort(400, 'Không thể cập nhật thành tích cá nhân')
    }
}

/**
 * Xóa thành tích
 */
export async function deleteAchievement(req, res) {
    try {
        const { id } = req.params
        const user_id = req.currentUser._id
        // Kiểm tra xem thành tích có thuộc về người dùng hiện tại không
        const existingAchievement = await achievementService.getAchievementById(id)
        if (!existingAchievement) {
            abort(404, 'Không tìm thấy thành tích')
        }
        if (existingAchievement.user_id._id.toString() !== user_id.toString()) {
            abort(403, 'Bạn không có quyền xóa thành tích này')
        }
        
        const achievement = await achievementService.deleteAchievement(id)
        
        res.jsonify({
            message: 'Xóa thành tích thành công',
            achievement
        })
    } catch (error) {
        abort(400, 'Không thể xóa thành tích')
    }
}

