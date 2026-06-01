const http = require('http')

const data = JSON.stringify({
    username: `test_api_${Date.now()}`,
    password: 'Password123',
    name: 'API Test User',
    email: `test_api_${Date.now()}@example.com`,
    phone: '09' + Math.floor(10000000 + Math.random() * 90000000),
    studentId: `ST_${Date.now()}`,
    dob: '2001-05-15',
    gender: 'male'
})

const options = {
    hostname: 'localhost',
    port: 3456,
    path: '/user/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}

const req = http.request(options, (res) => {
    let responseBody = ''
    res.on('data', (chunk) => {
        responseBody += chunk
    })
    res.on('end', () => {
        console.log('Status Code:', res.statusCode)
        console.log('Response Body:', responseBody)
        process.exit(0)
    })
})

req.on('error', (error) => {
    console.error('Request Error:', error)
    process.exit(1)
})

req.write(data)
req.end()
