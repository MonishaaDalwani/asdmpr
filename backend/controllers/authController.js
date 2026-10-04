import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new patient
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, gender, dob, address } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // New registrations are strictly patient role
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      gender: gender || 'Prefer not to say',
      dob: dob || '',
      address: address || '',
      role: 'patient',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (Patient, Doctor, or Admin)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password since select: false in schema
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administration.',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        address: user.address,
        specialization: user.specialization,
        department: user.department,
        qualification: user.qualification,
        doctorFee: user.doctorFee,
        availability: user.availability,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.gender = req.body.gender || user.gender;
    user.dob = req.body.dob !== undefined ? req.body.dob : user.dob;
    user.address = req.body.address !== undefined ? req.body.address : user.address;

    // Doctor specific updates if doctor
    if (user.role === 'doctor') {
      if (req.body.specialization) user.specialization = req.body.specialization;
      if (req.body.qualification) user.qualification = req.body.qualification;
      if (req.body.bio !== undefined) user.bio = req.body.bio;
      if (req.body.doctorFee) user.doctorFee = req.body.doctorFee;
      if (req.body.availability) user.availability = req.body.availability;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all patients (for Admin)
// @route   GET /api/auth/patients
// @access  Private (Admin only)
export const getAllPatients = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = { role: 'patient' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const count = await User.countDocuments(query);
    const patients = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Get appointment counts for each patient
    const patientIds = patients.map((p) => p._id);
    const appointmentCounts = await Appointment.aggregate([
      { $match: { patient: { $in: patientIds } } },
      { $group: { _id: '$patient', total: { $sum: 1 } } },
    ]);

    const countMap = {};
    appointmentCounts.forEach((c) => {
      countMap[c._id.toString()] = c.total;
    });

    const enrichedPatients = patients.map((p) => ({
      ...p.toObject(),
      totalAppointments: countMap[p._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      total: count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      patients: enrichedPatients,
    });
  } catch (error) {
    next(error);
  }
};
