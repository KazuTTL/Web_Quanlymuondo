import createModel, { ObjectId } from './base'

const BORROW_REQUEST_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    RETURNED: 'returned'
}

const BorrowRequest = createModel(
    'BorrowRequest',
    'borrow_requests',
    {
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
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        status: {
            type: String,
            enum: Object.values(BORROW_REQUEST_STATUS),
            default: BORROW_REQUEST_STATUS.PENDING
        },
        purpose: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },
        note: {
            type: String,
            default: '',
            trim: true
        },
    },
    {
        toJSON: {
            virtuals: true,
            transform(doc, ret) {
                return ret
            }
        },
        virtuals: {
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
        },
        methods: {
            canBeApproved() {
                return this.status === BORROW_REQUEST_STATUS.PENDING
            },
            canBeRejected() {
                return this.status === BORROW_REQUEST_STATUS.PENDING
            }
        }
    }
)

export { BORROW_REQUEST_STATUS }
export default BorrowRequest
