import {abort, getToken, verifyToken} from '@/utils/helpers'
import _ from 'lodash'
import {tokenBlocklist} from '../../services/auth.service'
import {TOKEN_TYPE, db } from '@/configs'
import {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken'

export async function checkValidToken(req, res, next) {
    try {
        const token = getToken(req.headers)

        if (token) {
            const allowedToken = _.isUndefined(await tokenBlocklist.get(token))
            if (allowedToken) {
                const {userId} = verifyToken(token, TOKEN_TYPE.USER_AUTHORIZATION)
                
                // Get User from MSSQL
                const result = await db.query(`SELECT * FROM Users WHERE UserID = ${userId} AND IsDeleted = 0 AND RoleID = 2`)
                const user = result.recordset[0]
                
                if (user) {
                    user._id = user.UserID
                    req.currentUser = user
                    next()
                    return
                }
            }
        }
    } catch (error) {
        if (!(error instanceof JsonWebTokenError)) {
            throw error
        }
        if (error instanceof TokenExpiredError) {
            abort(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập để tiếp tục!')
        }
    }
    abort(401)
} 