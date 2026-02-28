import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
    },
    date: {
        type: Date,
        required: [true, 'Event date is required'],
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
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

export default Event;
