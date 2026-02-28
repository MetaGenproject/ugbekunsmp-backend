import User from '../models/userModel.js';
import mongoose from 'mongoose';

class UserRepository {
  async create(userData) {
    const newUser = new User(userData);
    return await newUser.save();
  }

  async find(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, select } = options;
    const skip = (page - 1) * limit;

    const query = User.find(filter)
      .populate('school', 'schoolName email plan status')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (select) {
      query.select(select);
    }

    return await query.exec();
  }

  async findAll(options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, select } = options;
    const skip = (page - 1) * limit;

    const query = User.find()
      .populate('school', 'schoolName email plan status')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (select) {
      query.select(select);
    }

    return await query.exec();
  }

  async findById(id, select) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId format');
    }

    const query = User.findById(id).populate('school', 'schoolName email plan status');
    if (select) {
      query.select(select);
    }
    return await query.exec();
  }

  async findByEmail(email, select) {
    const query = User.findOne({ email: email.toLowerCase() })
      .populate('school', 'schoolName email plan status');
    
    if (select) {
      query.select(select);
    }
    return await query.exec();
  }

  async findBySchool(schoolId, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, select } = options;
    const skip = (page - 1) * limit;

    const query = User.find({ school: schoolId })
      .populate('school', 'schoolName email plan status')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (select) {
      query.select(select);
    }

    return await query.exec();
  }

  async findByRole(role, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, select } = options;
    const skip = (page - 1) * limit;

    const query = User.find({ role })
      .populate('school', 'schoolName email plan status')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (select) {
      query.select(select);
    }

    return await query.exec();
  }

  async findByRoleAndSchool(role, schoolId, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, select } = options;
    const skip = (page - 1) * limit;

    const query = User.find({ role, school: schoolId })
      .populate('school', 'schoolName email plan status')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (select) {
      query.select(select);
    }

    return await query.exec();
  }

  async update(id, userData, options = {}) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId format');
    }

    return await User.findByIdAndUpdate(
      id, 
      userData, 
      { 
        new: true, 
        runValidators: true,
        ...options 
      }
    ).populate('school', 'schoolName email plan status');
  }

  async delete(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId format');
    }
    
    return await User.findByIdAndDelete(id);
  }

  async findOne(query, select) {
    const userQuery = User.findOne(query)
      .populate('school', 'schoolName email plan status');
    
    if (select) {
      userQuery.select(select);
    }
    
    return await userQuery.exec();
  }

  async updateOne(query, update, options = {}) {
    return await User.updateOne(
      query, 
      update, 
      { 
        runValidators: true,
        ...options 
      }
    );
  }

  async updateLastLogin(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid ObjectId format');
    }

    return await User.findByIdAndUpdate(
      userId,
      { lastLogin: new Date() },
      { new: true }
    );
  }

  async deactivateUser(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid ObjectId format');
    }

    return await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );
  }

  async activateUser(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid ObjectId format');
    }

    return await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    );
  }

  async changePassword(userId, newPassword) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid ObjectId format');
    }

    const user = await User.findById(userId);
    user.password = newPassword;
    return await user.save();
  }

  async countDocuments(filter = {}) {
    return await User.countDocuments(filter);
  }

  async exists(filter) {
    return await User.exists(filter);
  }

  async getActiveUsersBySchool(schoolId) {
    return await User.find({ 
      school: schoolId, 
      isActive: true 
    })
    .populate('school', 'schoolName email plan status')
    .sort({ role: 1, createdAt: -1 })
    .exec();
  }

  async getUsersByRoleDistribution(schoolId) {
    return await User.aggregate([
      { $match: { school: new mongoose.Types.ObjectId(schoolId), isActive: true } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          users: { $push: { email: '$email', lastLogin: '$lastLogin' } }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  // Authentication related methods
  async validateCredentials(email, password) {
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('school', 'schoolName email plan status isActive');

    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await user.correctPassword(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    // Update last login
    await this.updateLastLogin(user._id);
    
    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }

  async isEmailTaken(email, excludeUserId = null) {
    const query = { email: email.toLowerCase() };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    return await User.exists(query);
  }
}

export default new UserRepository();