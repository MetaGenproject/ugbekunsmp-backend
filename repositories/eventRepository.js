import Event from '../models/eventModel.js';

class EventRepository {
    async create(eventData) {
        const newEvent = new Event(eventData);
        return await newEvent.save();
    }

    async findBySchool(schoolId) {
        return await Event.find({ school: schoolId }).sort({ date: 1 });
    }

    async findById(id) {
        return await Event.findById(id);
    }

    async update(id, eventData) {
        return await Event.findByIdAndUpdate(id, eventData, { new: true, runValidators: true });
    }

    async delete(id) {
        return await Event.findByIdAndDelete(id);
    }
}

export default new EventRepository();
