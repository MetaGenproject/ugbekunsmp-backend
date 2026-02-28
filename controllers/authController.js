import UserRepository from '../repositories/userRepository.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Send token response with cookies
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.SECURE_COOKIES === 'true', // HTTPS only in production
    sameSite: 'lax', // CSRF protection
    signed: true // Sign the cookie
  };

  // Set auth token cookie (HTTP-only for security)
  res.cookie('auth_token', token, cookieOptions);

  // Set session ID cookie (can be accessed by JS if needed)
  res.cookie('session_id', user._id.toString(), {
    ...cookieOptions,
    httpOnly: false // Allow JS access for session tracking
  });

  // Remove password from output if it exists
  let userWithoutPassword;
  if (user.toObject) {
    userWithoutPassword = user.toObject();
  } else {
    userWithoutPassword = { ...user };
  }

  if (userWithoutPassword.password) {
    delete userWithoutPassword.password;
  }

  res.status(statusCode).json({
    success: true,
    token, // Still send token in response for backward compatibility
    data: {
      user: userWithoutPassword
    }
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // 2) Validate credentials using repository
    const user = await UserRepository.validateCredentials(email, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, res);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in user',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await UserRepository.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { email, ...otherData } = req.body;

    // Check if email is being updated and if it's taken
    if (email && email !== req.user.email) {
      const emailTaken = await UserRepository.isEmailTaken(email, req.user.id);
      if (emailTaken) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }

    const updateData = email ? { email, ...otherData } : otherData;
    const updatedUser = await UserRepository.update(req.user.id, updateData);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    // Verify current password
    const user = await UserRepository.validateCredentials(req.user.email, currentPassword);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update to new password
    await UserRepository.changePassword(req.user.id, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// @desc    Logout user (clear cookies)
// @route   POST /api/auth/logout
// @access  Private
export const logout = (req, res) => {
  // Clear all auth cookies
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.SECURE_COOKIES === 'true',
    sameSite: 'lax',
    signed: true
  });

  res.clearCookie('session_id', {
    httpOnly: false,
    secure: process.env.SECURE_COOKIES === 'true',
    sameSite: 'lax',
    signed: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};