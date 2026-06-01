import { registerUser } from '../src/app/services/auth.service.js'

async function testRegister() {
    try {
        const userData = {
            username: 'test.student3',
            password: 'password123',
            name: 'Test Student 3',
            email: 'test.student3@student.edu.vn',
            phone: '0987654323',
            studentId: '21IT9993',
            dob: '2003-01-01',
            gender: 'male'
        }
        
        console.log('Testing registration with data:', userData)
        const result = await registerUser(userData)
        console.log('Registration Success:', result)
    } catch (err) {
        console.error('❌ Registration Failure:', err.message || err)
        if (err.status) console.error('Status Code:', err.status)
    }
    process.exit(0)
}

testRegister()
