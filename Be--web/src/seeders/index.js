import {db} from '@/configs'
import adminSeeder from './admin.seeder'
import deviceSeeder from './device.seeder'
import borrowRequestSeeder from './borrow-request.seeder'
import chalk from 'chalk'
import permissionTypeSeeder from './permission-type.seeder'
import permissionGroupSeeder from './permission-group.seeder'
import permissionSeeder from './permission.seeder'
import roleSeeder from './role.seeder'
import userPermissionGroupSeeder from './user-permission-group.seeder'
import userPermissionSeeder from './user-permission.seeder'
import BorrowRecord from './borrow-record.seeder'
import userSeeder from './user.seeder'

async function seed() {
    console.log(chalk.bold('Initializing data...'))

    // Permissions and roles
    await permissionTypeSeeder()
    await permissionGroupSeeder()
    await permissionSeeder()
    await roleSeeder()

    // Users
    await adminSeeder()
    await userPermissionGroupSeeder()
    await userPermissionSeeder()
    await userSeeder()

    // Core data
    await deviceSeeder()
    await borrowRequestSeeder()
    await BorrowRecord()
    console.log(chalk.bold('Data has been initialized!'))
}

db.connect().then(seed).then(db.close)
