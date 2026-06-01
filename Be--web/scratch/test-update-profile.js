import { updateUserProfile } from '../src/app/services/user.service.js'

async function testUpdate() {
    try {
        const profileData = {
            name: 'Updated Name',
            email: 'updated.email@gmail.com',
            phone: '0987654322',
            gender: 'male',
            dob: '2003-01-01',
            studentId: '21IT002'
        }
        console.log('Testing profile update with data:', profileData)
        // Let's use UserID = 2 (which is student Mai Tran in seed data if exists, or just a valid user)
        const result = await updateUserProfile(2, profileData)
        console.log('Update Success:', result)
    } catch (err) {
        console.error('❌ Update Failure:', err.message || err)
        if (err.status) console.error('Status Code:', err.status)
    }
    process.exit(0)
}

testUpdate()
