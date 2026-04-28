import {abort, getToken} from '@/utils/helpers'
import * as authService from '@/app/services/auth.service'

export async function login(req, res) {
    const validLogin = await authService.checkValidLoginUser(req.body)

    if (validLogin) {
        res.json({
            message: 'Đăng nhập thành công',
            data: authService.authTokenUser(validLogin)
        })
    } else {
        abort(400, 'Tài khoản hoặc mật khẩu không đúng.')
    }
}

export async function register(req, res) {
    const user = await authService.registerUser(req.body)
    res.json({
        message: 'Đăng ký tài khoản thành công',
        data: user
    })
}

export async function logout(req, res) {
    const token = getToken(req.headers)
    await authService.blockToken(token)
    res.json({
        message: 'Đăng xuất thành công'
    })
}
