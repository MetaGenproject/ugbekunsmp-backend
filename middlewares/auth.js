import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/userRepository.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check for token in signed cookies first (primary method)
    if (req.signedCookies && req.signedCookies.auth_token) {
      token = req.signedCookies.auth_token;
    }
    // 2. Fall back to Authorization header (backward compatibility)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to access this resource'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token (token is created with 'id', not 'userId')
    const user = await UserRepository.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account has been deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      error: error.message
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No user information.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

// School-specific authorization
export const authorizeSchoolAccess = (req, res, next) => {
  const { schoolId } = req.params;

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No user information.'
    });
  }

  // Super admins can access all schools
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Check if user belongs to the requested school
  if (req.user.school?.toString() !== schoolId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own school data.'
    });
  }

  next();
};