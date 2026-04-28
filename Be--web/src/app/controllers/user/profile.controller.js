import * as userService from '@/app/services/user.service'

export async function getProfile(req, res) {
    const user = await userService.getUserProfile(req.currentUser._id)
    res.jsonify(user)
}

export async function updateProfile(req, res) {
    const updatedUser = await userService.updateUserProfile(req.currentUser._id, req.body)
    res.jsonify({
        message: 'Cập nhật thông tin thành công',
        user: updatedUser
    })
} 