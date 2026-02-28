import UserRepository from '../repositories/userRepository.js';
import SchoolRepository from '../repositories/schoolRepository.js';
import jwt from 'jsonwebtoken';

// @desc    Create super admin (initial setup)
// @route   POST /api/users/create-super-admin
// @access  Public (should be protected in production)
export const createSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if super admin already exists
    const existingSuperAdmin = await UserRepository.findOne({ role: 'super-admin' });
    if (existingSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Super admin already exists'
      });
    }

    // Create super admin
    const superAdmin = await UserRepository.create({
      email,
      password,
      role: 'super-admin'
    });

    res.status(201).json({
      success: true,
      message: 'Super admin created successfully',
      data: {
        user: superAdmin
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating super admin',
      error: error.message
    });
  }
};

// @desc    Signup users (Admin, Teacher, Parent, Student)
// @route   POST /api/users/signup
// @access  Private/Admin
export const signupUser = async (req, res) => {
  try {
    const { email, password, role, school, studentId, ...otherData } = req.body;

    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Prepare user data
    const userData = {
      email,
      password,
      role,
      school,
      ...otherData
    };

    // Add studentId if role is student
    if (role === 'student' && studentId) {
      userData.studentId = studentId;
    }

    // Create user
    const user = await UserRepository.create(userData);

    // If this is an admin and a school was provided, link the school.admin to this user
    try {
      if (role === 'admin' && school) {
        await SchoolRepository.update(school, { admin: user._id, createdBy: user._id });
      }
    } catch (linkErr) {
      console.warn('Failed to link admin to school after signup:', linkErr);
    }

    // Generate auth token for the newly created user (so frontend can log them in immediately)
    let token = null;
    try {
      token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    } catch (tokenErr) {
      console.warn('Failed to generate token for new user:', tokenErr);
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error signing up user',
      error: error.message
    });
  }
};

// @desc    Get all users (for super admin)
// @route   GET /api/users
// @access  Private/SuperAdmin
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, school, search } = req.query;
    
    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (school) filter.school = school;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const users = await UserRepository.find(filter, options);
    const totalUsers = await UserRepository.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await UserRepository.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { email, ...updateData } = req.body;

    // Check if email is being updated and if it's taken
    if (email) {
      const emailTaken = await UserRepository.isEmailTaken(email, req.params.id);
      if (emailTaken) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }

    const user = await UserRepository.update(req.params.id, { email, ...updateData });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/SuperAdmin
export const deleteUser = async (req, res) => {
  try {
    await UserRepository.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// @desc    Deactivate user
// @route   PUT /api/users/:id/deactivate
// @access  Private/Admin
export const deactivateUser = async (req, res) => {
  try {
    const user = await UserRepository.deactivateUser(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating user',
      error: error.message
    });
  }
};

// @desc    Activate user
// @route   PUT /api/users/:id/activate
// @access  Private/Admin
export const activateUser = async (req, res) => {
  try {
    const user = await UserRepository.activateUser(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User activated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error activating user',
      error: error.message
    });
  }
};

// @desc    Get users by school
// @route   GET /api/users/school/:schoolId
// @access  Private/Admin
export const getUsersBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { page = 1, limit = 10, role } = req.query;

    const filter = { school: schoolId };
    if (role) filter.role = role;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const users = await UserRepository.find(filter, options);
    const totalUsers = await UserRepository.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching school users',
      error: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats/:schoolId
// @access  Private/Admin
export const getUserStats = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const roleDistribution = await UserRepository.getUsersByRoleDistribution(schoolId);
    const totalUsers = await UserRepository.countDocuments({ school: schoolId });
    const activeUsers = await UserRepository.countDocuments({ 
      school: schoolId, 
      isActive: true 
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        roleDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};