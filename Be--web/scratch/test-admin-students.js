const http = require('http')

async function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = ''
            res.on('data', chunk => body += chunk)
            res.on('end', () => {
                try {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: JSON.parse(body)
                    })
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: body
                    })
                }
            })
        })
        req.on('error', reject)
        if (postData) {
            req.write(JSON.stringify(postData))
        }
        req.end()
    })
}

async function run() {
    try {
        console.log('1. Logging in as Admin...')
        const loginRes = await makeRequest({
            hostname: 'localhost',
            port: 3456,
            path: '/admin/auth/login', // Admin login is under /admin/auth/login
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            email: 'admin@school.edu.vn',
            password: '123456'
        })

        console.log('Login Status:', loginRes.statusCode)
        console.log('Login Data:', loginRes.data)

        const token = loginRes.data.data?.access_token || loginRes.data.access_token
        if (!token) {
            console.error('Failed to get token!')
            process.exit(1)
        }

        console.log('Token obtained:', token.substring(0, 15) + '...')

        console.log('\n2. Fetching students list...')
        const studentsRes = await makeRequest({
            hostname: 'localhost',
            port: 3456,
            path: '/admin/students',
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`
            }
        })
        console.log('Status Code:', studentsRes.statusCode)
        console.log('Students count:', studentsRes.data.data?.length)
        console.log('First student sample:', studentsRes.data.data?.[0])

        if (studentsRes.data.data?.length > 0) {
            const sampleStudent = studentsRes.data.data.find(s => s.name.includes('Mai') || s.name.includes('Nam') || s.id !== 1)
            if (sampleStudent) {
                console.log(`\n3. Toggling status for student: ${sampleStudent.name} (ID: ${sampleStudent.id}, Current Status: ${sampleStudent.status})`)
                const toggleRes = await makeRequest({
                    hostname: 'localhost',
                    port: 3456,
                    path: `/admin/students/${sampleStudent.id}/status`,
                    method: 'PATCH',
                    headers: { 
                        'Authorization': `Bearer ${token}`
                    }
                })
                console.log('Toggle Status Code:', toggleRes.statusCode)
                console.log('Toggle Response:', toggleRes.data)

                console.log(`\n4. Updating details for student: ${sampleStudent.name} (ID: ${sampleStudent.id})`)
                const updateRes = await makeRequest({
                    hostname: 'localhost',
                    port: 3456,
                    path: `/admin/students/${sampleStudent.id}`,
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }, {
                    phone: '0977665544',
                    studentId: 'B21STUDENT999'
                })
                console.log('Update Status Code:', updateRes.statusCode)
                console.log('Update Response:', updateRes.data)

                console.log('\n5. Fetching student list again to verify changes...')
                const verifyRes = await makeRequest({
                    hostname: 'localhost',
                    port: 3456,
                    path: '/admin/students',
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const updatedStudent = verifyRes.data.data?.find(s => s.id === sampleStudent.id)
                console.log('Updated Student from verify:', updatedStudent)
            }
        }

    } catch (err) {
        console.error('Test error:', err)
    }
    process.exit(0)
}

run()
