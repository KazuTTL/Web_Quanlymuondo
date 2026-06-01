import http from 'http'

http.get('http://localhost:3456/', (res) => {
    console.log('Status Code:', res.statusCode)
    let data = ''
    res.on('data', (chunk) => { data += chunk })
    res.on('end', () => {
        console.log('Data:', data)
        process.exit(0)
    })
}).on('error', (err) => {
    console.error('Error connecting to server:', err.message)
    process.exit(1)
})
