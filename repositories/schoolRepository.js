import School from '../models/schoolModel.js';

class SchoolRepository {
  async create(schoolData) {
    const newSchool = new School(schoolData);
    return await newSchool.save();
  }

  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, select } = options;
    const skip = (page - 1) * limit;

    const query = School.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (select) {
      query.select(select);
    }

    return await query.exec();
  }

  async findById(id, select) {
    const query = School.findById(id);
    if (select) {
      query.select(select);
    }
    return await query.exec();
  }

  async update(id, schoolData, options = {}) {
    return await School.findByIdAndUpdate(
      id, 
      schoolData, 
      { 
        new: true, 
        runValidators: true,
        ...options 
      }
    );
  }

  async delete(id) {
    return await School.findByIdAndDelete(id);
  }

  async findByAdmin(adminId) {
    return await School.findOne({ admin: adminId });
  }

  async findByEmail(email) {
    return await School.findOne({ email });
  }

  async findByCreatedBy(userId, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    return await School.find({ createdBy: userId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findByLocation(country, state, lga = null) {
    const filter = { country, state };
    if (lga) {
      filter.lga = lga;
    }
    return await School.find(filter).sort({ schoolName: 1 }).exec();
  }

  async findByStatus(status, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    return await School.find({ status })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findByPlan(plan, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    return await School.find({ plan })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findActiveSchools(options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    return await School.find({ isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findExpiredTrials() {
    return await School.find({ 
      expiresAt: { $lt: new Date() },
      isActive: true 
    }).sort({ expiresAt: 1 }).exec();
  }

  async findBySchoolLevels(levels, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    return await School.find({ schoolLevels: { $in: levels } })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countDocuments(filter = {}) {
    return await School.countDocuments(filter);
  }

  async exists(filter) {
    return await School.exists(filter);
  }

  async softDelete(id) {
    return await School.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  async restore(id) {
    return await School.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );
  }

  async updateExpiration(id, newExpirationDate) {
    return await School.findByIdAndUpdate(
      id,
      { expiresAt: newExpirationDate },
      { new: true, runValidators: true }
    );
  }

  // Bulk operations
  async bulkUpdateStatus(ids, status) {
    return await School.updateMany(
      { _id: { $in: ids } },
      { status },
      { runValidators: true }
    );
  }

  async bulkUpdatePlan(ids, plan) {
    return await School.updateMany(
      { _id: { $in: ids } },
      { plan },
      { runValidators: true }
    );
  }
}

export default new SchoolRepository();