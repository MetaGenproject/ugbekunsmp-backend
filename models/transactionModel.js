import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
    },
    type: {
        type: String,
        enum: ['revenue', 'expense'],
        required: [true, 'Transaction type is required'],
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'completed',
    },
    description: {
        type: String,
        trim: true,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: [true, 'School reference is required'],
    },
    date: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
