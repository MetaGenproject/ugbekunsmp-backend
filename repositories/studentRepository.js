import Student from '../models/studentModel.js';
import mongoose from 'mongoose';

class StudentRepository {
    async create(studentData) {
        const newStudent = new Student(studentData);
        return await newStudent.save();
    }

    async find(filter = {}, options = {}) {
        const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
        const skip = (page - 1) * limit;

        return await Student.find(filter)
            .populate('school', 'schoolName')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec();
    }

    async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid ObjectId format');
        }
        return await Student.findById(id).populate('school', 'schoolName').exec();
    }

    async findBySchool(schoolId, options = {}) {
        const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
        const skip = (page - 1) * limit;

        return await Student.find({ school: schoolId })
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec();
    }

    async update(id, studentData) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid ObjectId format');
        }
        return await Student.findByIdAndUpdate(
            id,
            studentData,
            { new: true, runValidators: true }
        ).exec();
    }

    async delete(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid ObjectId format');
        }
        return await Student.findByIdAndDelete(id).exec();
    }

    async countDocuments(filter = {}) {
        return await Student.countDocuments(filter);
    }
}

export default new StudentRepository();
