import createModel from './base'

const DEVICE_STATUS = {
    AVAILABLE: 'available',
    MAINTENANCE: 'maintenance',
    LOST: 'lost'
}

const Device = createModel(
    'Device',
    'devices',
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        description: {
            type: String,
            default: '',
            trim: true
        },
        status: {
            type: String,
            enum: Object.values(DEVICE_STATUS),
            default: DEVICE_STATUS.AVAILABLE
        },
        quantity: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        imageUrl: {
            type: String,
            default: '',
            trim: true
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        location: {
            type: String,
            required: true,
            trim: true
        },
        serialNumber: {
            type: String,
            required: true,
            unique: true
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
            availableQuantity: {
                get() {
                    return this.quantity
                }
            },
            borrowRequests: {
                options: {
                    ref: 'BorrowRequest',
                    localField: '_id',
                    foreignField: 'deviceId'
                }
            },
            borrowRecords: {
                options: {
                    ref: 'BorrowRecord',
                    localField: '_id',
                    foreignField: 'deviceId'
                }
            }
        }
    }
)

export { DEVICE_STATUS }
export default Device
