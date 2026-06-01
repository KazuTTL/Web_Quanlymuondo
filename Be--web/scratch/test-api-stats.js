const http = require('http')

async function makeRequest(options) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = ''
            res.on('data', chunk => body += chunk)
            res.on('end', () => {
                try {
                    resolve({
                        statusCode: res.statusCode,
                        data: JSON.parse(body)
                    })
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        data: body
                    })
                }
            })
        })
        req.on('error', reject)
        req.end()
    })
}

async function run() {
    try {
        console.log('Logging in as Admin...')
        const loginRes = await makeRequest({
            hostname: 'localhost',
            port: 3456,
            path: '/admin/auth/login',
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            }
        })
        
        // Wait, we need to pass credentials
        const loginPayload = JSON.stringify({
            email: 'admin@school.edu.vn',
            password: '123456'
        })
        
        const loginReq = http.request({
            hostname: 'localhost',
            port: 3456,
            path: '/admin/auth/login',
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Content-Length': loginPayload.length
            }
        }, (res) => {
            let body = ''
            res.on('data', chunk => body += chunk)
            res.on('end', () => {
                const data = JSON.parse(body)
                const token = data.data?.access_token
                
                // Get Stats
                const statsReq = http.request({
                    hostname: 'localhost',
                    port: 3456,
                    path: '/admin/stats',
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }, (res2) => {
                    let body2 = ''
                    res2.on('data', chunk => body2 += chunk)
                    res2.on('end', () => {
                        console.log('Stats status:', res2.statusCode)
                        console.log('Stats data:', JSON.stringify(JSON.parse(body2), null, 2))
                    })
                })
                statsReq.end()
            })
        })
        loginReq.write(loginPayload)
        loginReq.end()

    } catch (err) {
        console.error('Test error:', err)
    }
}

run()
