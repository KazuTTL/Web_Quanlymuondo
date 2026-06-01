import { db } from '../src/configs'
import fs from 'fs'
import path from 'path'

async function runUpdates() {
    try {
        console.log('Connecting to database...')
        const sqlPath = path.resolve('..', 'Database', '99_UpdateDB_V2.sql')
        console.log(`Reading SQL from ${sqlPath}...`)
        const sql = fs.readFileSync(sqlPath, 'utf8')
        
        // Split SQL by GO and filter empty blocks
        const commands = sql.split(/\bGO\b/i).filter(cmd => cmd.trim().length > 0)
        
        for (const cmd of commands) {
            console.log('Executing command...')
            await db.query(cmd)
        }
        
        console.log('Database updates completed successfully!')
        process.exit(0)
    } catch (err) {
        console.error('Error running database updates:', err)
        process.exit(1)
    }
}

runUpdates()
