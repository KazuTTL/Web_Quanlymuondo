import { db } from '../src/configs/index.js'
import { registerUser } from '../src/app/services/auth.service.js'

async function testRegister() {
    try {
        console.log('Calling registerUser with full fields...')
        const res = await registerUser({
            username: `test_direct_${Date.now()}`,
            password: 'Password123',
            name: 'Test Name',
            email: `test_direct_${Date.now()}@example.com`,
            phone: '0912345678', 
            studentId: `ST_${Date.now()}`, 
            dob: '2001-05-15', 
            gender: 'male'
        })
        console.log('Success:', res)
    } catch (err) {
        console.error('Registration failed with error stack:', err.stack || err)
    }
    process.exit(0)
}

testRegister()
