import {User} from '@/models'

async function userSeeder(session) {
    const users = [
        {
            name: 'Nguyễn Văn A',
            username: 'user1',
            email: 'user1@gmail.com',
            phone: '0123456781',
            password: 'User1@123',
            role: 'user'
        },
        {
            name: 'Trần Thị B',
            username: 'user2',
            email: 'user2@gmail.com',
            phone: '0123456782',
            password: 'User2@123',
            role: 'user'
        }
    ]

    for (const data of users) {
        await User.findOneAndUpdate(
            {username: data.username},
            {$set: data},
            {upsert: true, session}
        )
    }
}

export default userSeeder
