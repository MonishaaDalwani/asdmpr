import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

// Default weekly availability template
const defaultAvailability = [
  { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Saturday', startTime: '09:00', endTime: '14:00', isAvailable: false },
  { day: 'Sunday', startTime: '09:00', endTime: '14:00', isAvailable: false },
];

// @desc    Get active doctors (Public for patients)
// @route   GET /api/doctors
// @access  Public
export const getPublicDoctors = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    const query = { role: 'doctor', isActive: true };

    if (department && department !== 'All') {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const doctors = await User.find(query)
      .select('-__v')
      .sort({ department: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' }).select('-__v');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all doctors (Admin only)
// @route   GET /api/doctors/admin/all
// @access  Private (Admin)
export const getAllDoctorsAdmin = async (req, res, next) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;
    const query = { role: 'doctor' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const count = await User.countDocuments(query);
    const doctors = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total: count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      doctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new doctor (Admin only)
// @route   POST /api/doctors
// @access  Private (Admin)
export const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      gender,
      department,
      specialization,
      qualification,
      experienceYears,
      doctorFee,
      bio,
      availability,
    } = req.body;

    if (!name || !email || !password || !department || !specialization) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, department, and specialization',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const doctor = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'doctor',
      phone: phone || '',
      gender: gender || 'Prefer not to say',
      department,
      specialization,
      qualification: qualification || 'MBBS',
      experienceYears: experienceYears ? Number(experienceYears) : 1,
      doctorFee: doctorFee ? Number(doctorFee) : 500,
      bio: bio || '',
      availability: availability && availability.length > 0 ? availability : defaultAvailability,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully',
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor (Admin only)
// @route   PUT /api/doctors/:id
// @access  Private (Admin)
export const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const fieldsToUpdate = [
      'name',
      'phone',
      'gender',
      'department',
      'specialization',
      'qualification',
      'experienceYears',
      'doctorFee',
      'bio',
      'availability',
      'isActive',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        doctor[field] = req.body[field];
      }
    });

    // If password provided, update it
    if (req.body.password && req.body.password.length >= 6) {
      doctor.password = req.body.password;
    }

    const updatedDoctor = await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Doctor details updated successfully',
      doctor: updatedDoctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle doctor active/inactive status (Admin only)
// @route   PATCH /api/doctors/:id/toggle-status
// @access  Private (Admin)
export const toggleDoctorStatus = async (req, res, next) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    doctor.isActive = !doctor.isActive;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: `Doctor status updated to ${doctor.isActive ? 'Active' : 'Inactive'}`,
      doctor,
    });
  } catch (error) {
    next(error);
  }
};
