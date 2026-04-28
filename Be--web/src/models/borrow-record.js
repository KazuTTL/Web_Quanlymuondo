import createModel, { ObjectId } from './base'

const BORROW_RECORD_STATUS = {
    BORROWED: 'borrowed',
    RETURNED: 'returned',
    OVERDUE: 'overdue'
}

const BorrowRecord = createModel(
    'BorrowRecord',
    'borrow_records',
    {
        borrowRequestId: {
            type: ObjectId,
            ref: 'BorrowRequest',
            required: true
        },
        userId: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
        deviceId: {
            type: ObjectId,
            ref: 'Device',
            required: true
        },
        borrowDate: {
            type: Date,
            required: true
        },
        returnDate: {
            type: Date,
            required: true
        },
        actualReturnDate: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: Object.values(BORROW_RECORD_STATUS),
            default: BORROW_RECORD_STATUS.BORROWED
        },
        note: {
            type: String,
            default: '',
            trim: true
        }
    },
    {
        toJSON: {
            virtuals: true,
            transform(doc, ret) {
                return ret
            }
        },
        virtuals: {
            borrowRequest: {
                options: {
                    ref: 'BorrowRequest',
                    localField: 'borrowRequestId',
                    foreignField: '_id'
                }
            },
            user: {
                options: {
                    ref: 'User',
                    localField: 'userId',
                    foreignField: '_id'
                }
            },
            device: {
                options: {
                    ref: 'Device',
                    localField: 'deviceId',
                    foreignField: '_id'
                }
            }
        }
    }
)

export { BORROW_RECORD_STATUS }
export default BorrowRecord
