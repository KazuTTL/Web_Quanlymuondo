import db from './src/configs/database.js';
import bcrypt from 'bcrypt';

async function updatePasswords() {
    try {
        await db.connect();
        const hash = bcrypt.hashSync('123456', 10);
        await db.query(`UPDATE Users SET PasswordHash = '${hash}'`);
        console.log('Passwords updated successfully!');
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
updatePasswords();
