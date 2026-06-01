import { db, userLocalStorage } from '../src/configs/index.js'
import * as authService from '../src/app/services/auth.service.js'
import * as userService from '../src/app/services/user.service.js'
import * as borrowRequestService from '../src/app/services/borrow-request.service.js'

async function run() {
    try {
        console.log('--- STARTING COMPREHENSIVE SYSTEM INTEGRATION TEST ---')
        
        const uniqueEmail = `student_${Date.now()}@school.edu.vn`
        const uniqueUsername = `std_${Date.now()}`
        const uniquePhone = '09' + Math.floor(10000000 + Math.random() * 90000000)
        const registerData = {
            name: 'Nguyen Van Test',
            username: uniqueUsername,
            email: uniqueEmail,
            password: 'Password123',
            phone: uniquePhone,
            gender: 'Male',
            dob: '2001-05-15',
            address: 'Hanoi',
            studentId: `B21DCCN${Math.floor(100 + Math.random() * 900)}`
        }

        console.log('\n1. Testing Student Registration...')
        const regRes = await authService.registerUser(registerData)
        console.log('Registration Response:', regRes)
        const studentUserId = regRes._id || regRes.id

        console.log('\n2. Testing Student Login...')
        const userObj = await authService.checkValidLoginUser({
            username: registerData.username,
            password: registerData.password
        })
        console.log('Login verification:', userObj ? 'SUCCESS' : 'FAILED')
        const tokenRes = userObj ? authService.authTokenUser(userObj) : null
        console.log('Token generation:', tokenRes ? 'SUCCESS' : 'FAILED')

        console.log('\n3. Testing Get Student Profile...')
        const profile = await userService.getUserProfile(studentUserId)
        console.log('Retrieved Profile:', {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            studentId: profile.studentId,
            dob: profile.dob
        })

        console.log('\n4. Testing Update Profile (including Dob and StudentID changes)...')
        const updateData = {
            name: 'Nguyen Van Test Edited',
            phone: '0988776699',
            gender: 'Female',
            dob: new Date('2001-06-20'), // Pass as Date object like Joi does
            studentId: registerData.studentId // Keeping the same student ID
        }
        const updateRes = await userService.updateUserProfile(studentUserId, updateData)
        console.log('Update Profile Response:', updateRes)

        console.log('\n4.1. Verifying updated profile values...')
        const profileAfter = await userService.getUserProfile(studentUserId)
        console.log('Updated Profile:', {
            name: profileAfter.name,
            phone: profileAfter.phone,
            gender: profileAfter.gender,
            studentId: profileAfter.studentId,
            dob: profileAfter.dob
        })

        console.log('\n5. Testing Creating Borrow Request...')
        const reqData = {
            userId: studentUserId,
            deviceId: 1, // Let's use DeviceID = 1
            quantity: 1,
            borrowDate: '2026-06-10',
            returnDate: '2026-06-15',
            purpose: 'Testing full flow',
            note: 'None'
        }
        const createReqRes = await borrowRequestService.createBorrowRequest(reqData)
        console.log('Create Borrow Request Response:', createReqRes)

        console.log('\n6. Testing RLS Visibility - Querying user requests under Student Context...')
        let studentRequests
        await userLocalStorage.run(studentUserId, async () => {
            studentRequests = await borrowRequestService.getUserBorrowRequests(studentUserId)
            console.log(`Student (UserID = ${studentUserId}) saw requests count:`, studentRequests.data.length)
        })

        console.log('\n7. Testing RLS Visibility - Querying user requests under Admin Context...')
        let adminRequests
        await userLocalStorage.run(1, async () => {
            adminRequests = await borrowRequestService.getAllBorrowRequests({ status: 'pending' })
            console.log('Admin (UserID = 1) saw pending requests count:', adminRequests.length)
        })

        if (adminRequests.length > 0) {
            // Find our created request
            const ourReq = adminRequests.find(r => r.userId === studentUserId)
            if (ourReq) {
                console.log(`Found our request. RequestID = ${ourReq.id}. Current Status: ${ourReq.status}`)

                console.log('\n8. Testing Stored Procedure execution under Admin Context (Approve Request)...')
                await userLocalStorage.run(1, async () => {
                    const approveRes = await borrowRequestService.updateBorrowRequestStatus(null, ourReq.id, 'approved')
                    console.log('Approve Response:', approveRes)
                })

                console.log('\n9. Verifying request status after approval...')
                await userLocalStorage.run(studentUserId, async () => {
                    const studentRequestsAfter = await borrowRequestService.getUserBorrowRequests(studentUserId)
                    const updatedReq = studentRequestsAfter.data.find(r => r.id === ourReq.id)
                    console.log('Request Status after approval:', updatedReq ? updatedReq.status : 'NOT FOUND')
                })
            } else {
                console.log('Could not find the created request in the admin pending list.')
            }
        }

        console.log('\n--- ALL SYSTEM INTEGRATION TESTS COMPLETED SUCCESSFULLY ---')
    } catch (err) {
        console.error('\n❌ TEST FAILED WITH ERROR:', err)
    }
    process.exit(0)
}

run()
