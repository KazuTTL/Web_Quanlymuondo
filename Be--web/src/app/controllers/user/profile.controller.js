import * as userService from '@/app/services/user.service'

export async function getProfile(req, res) {
    const user = await userService.getUserProfile(req.currentUser._id)
    res.json({ message: 'Lấy thông tin thành công', data: user })
}

export async function updateProfile(req, res) {
    const updatedUser = await userService.updateUserProfile(req.currentUser._id, req.body)
    res.json({
        message: 'Cập nhật thông tin thành công',
        data: updatedUser
    })
} 