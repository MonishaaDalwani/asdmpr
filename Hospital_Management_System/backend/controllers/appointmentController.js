import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
export const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, appointmentTimeSlot, reason } = req.body;
    const patientId = req.user._id;

    // Check doctor exists and is active
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isActive: true });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Selected doctor is not found or is currently inactive',
      });
    }

    // Prevent conflict: check if doctor already has an active appointment at the requested date & time slot
    const conflictingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate,
      appointmentTimeSlot,
      status: { $in: ['pending', 'accepted'] },
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked for Dr. ' + doctor.name + '. Please choose another time slot or date.',
      });
    }

    // Check if same patient already booked this doctor on this date
    const duplicatePatientBooking = await Appointment.findOne({
      patient: patientId,
      doctor: doctorId,
      appointmentDate,
      status: { $in: ['pending', 'accepted'] },
    });

    if (duplicatePatientBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active appointment scheduled with Dr. ' + doctor.name + ' on ' + appointmentDate + '.',
      });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      department: doctor.department,
      appointmentDate,
      appointmentTimeSlot,
      reason,
      status: 'pending',
      fee: doctor.doctorFee || 500,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone gender dob')
      .populate('doctor', 'name email specialization department qualification doctorFee');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully. Awaiting doctor confirmation.',
      appointment: populatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments for logged-in patient
// @route   GET /api/appointments/my-appointments
// @access  Private (Patient)
export const getPatientAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { patient: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name email specialization department qualification phone doctorFee')
      .sort({ appointmentDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments assigned to logged-in doctor
// @route   GET /api/appointments/doctor-appointments
// @access  Private (Doctor)
export const getDoctorAppointments = async (req, res, next) => {
  try {
    const { status, date, search } = req.query;
    const query = { doctor: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      query.appointmentDate = date;
    }

    let appointments = await Appointment.find(query)
      .populate('patient', 'name email phone gender dob address')
      .sort({ appointmentDate: 1, appointmentTimeSlot: 1 });

    if (search) {
      const searchLower = search.toLowerCase();
      appointments = appointments.filter(
        (app) =>
          app.patient?.name?.toLowerCase().includes(searchLower) ||
          app.patient?.email?.toLowerCase().includes(searchLower) ||
          app.reason?.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments (Admin master list)
// @route   GET /api/appointments/admin/all
// @access  Private (Admin)
export const getAllAppointmentsAdmin = async (req, res, next) => {
  try {
    const { doctorId, status, department, date, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (doctorId && doctorId !== 'all') query.doctor = doctorId;
    if (status && status !== 'all') query.status = status;
    if (department && department !== 'all') query.department = department;
    if (date) query.appointmentDate = date;

    const count = await Appointment.countDocuments(query);
    let appointments = await Appointment.find(query)
      .populate('patient', 'name email phone gender dob')
      .populate('doctor', 'name email specialization department qualification')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    if (search) {
      const searchLower = search.toLowerCase();
      appointments = appointments.filter(
        (app) =>
          app.patient?.name?.toLowerCase().includes(searchLower) ||
          app.doctor?.name?.toLowerCase().includes(searchLower) ||
          app.department?.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({
      success: true,
      total: count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment details
// @route   GET /api/appointments/:id
// @access  Private (Patient, Doctor, Admin)
export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone gender dob address')
      .populate('doctor', 'name email specialization department qualification phone doctorFee');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Role-based access validation
    const userId = req.user._id.toString();
    const isPatient = appointment.patient?._id?.toString() === userId;
    const isDoctor = appointment.doctor?._id?.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view this appointment record',
      });
    }

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (Accept, Reject, Complete)
// @route   PATCH /api/appointments/:id/status
// @access  Private (Doctor or Admin)
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, doctorNotes, cancellationReason } = req.body;
    const validStatuses = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`,
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Authorization: Doctor must own the appointment, or user is Admin
    if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update appointments assigned to you',
      });
    }

    // Status transition rules
    if (appointment.status === 'completed' && status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed appointments cannot change status',
      });
    }

    appointment.status = status;
    if (doctorNotes !== undefined) {
      appointment.doctorNotes = doctorNotes;
    }

    if (status === 'rejected' || status === 'cancelled') {
      appointment.cancellationReason = cancellationReason || 'Cancelled/Rejected by doctor or admin';
      appointment.cancelledBy = req.user.role;
    }

    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone gender dob')
      .populate('doctor', 'name email specialization department qualification');

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      appointment: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment (by Patient)
// @route   PATCH /api/appointments/:id/cancel
// @access  Private (Patient)
export const cancelAppointment = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Ensure the patient owns the appointment
    if (appointment.patient.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only cancel your own appointments',
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an appointment that has already been completed',
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This appointment is already cancelled',
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason || 'Cancelled by patient';
    appointment.cancelledBy = req.user.role;

    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('doctor', 'name specialization department');

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment: updated,
    });
  } catch (error) {
    next(error);
  }
};
