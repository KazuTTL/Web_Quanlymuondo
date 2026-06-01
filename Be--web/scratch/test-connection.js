import http from 'http'

http.get('http://localhost:3456/api/devices', (res) => {
    console.log('Status Code:', res.statusCode)
    let data = ''
    res.on('data', (chunk) => { data += chunk })
    res.on('end', () => {
        console.log('Data length:', data.length)
        console.log('Sample Data:', data.substring(0, 200))
        process.exit(0)
    })
}).on('error', (err) => {
    console.error('Error connecting to server:', err.message)
    process.exit(1)
})
