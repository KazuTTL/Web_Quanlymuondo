import authRouter from './auth.router'
import admin from './admin'
import userAuthRouter from './user/auth.router'
import userProfileRouter from './user/profile.route'
import user from './user'
function route(app) {
    app.get('/', (req, res) => {
        res.json({
            success: true,
            message: 'Backend is running successfully!'
        })
    })
    app.use('/admin', admin)
    app.use('/auth', authRouter)
    app.use('/user/auth', userAuthRouter)
    app.use('/user/profile', userProfileRouter)
    app.use('/user', user)
}

export default route
