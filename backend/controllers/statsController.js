import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Message from '../models/Message.js';

// @desc    Get dashboard statistics for Admin
// @route   GET /api/stats/admin
// @access  Private (Admin)
export const getAdminStats = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const [
      totalPatients,
      totalDoctors,
      activeDoctors,
      totalAppointments,
      pendingAppointments,
      acceptedAppointments,
      completedAppointments,
      cancelledAppointments,
      todayAppointments,
      unreadMessages,
      recentAppointments,
      departmentStats,
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'doctor', isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'accepted' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      Appointment.countDocuments({ appointmentDate: todayStr }),
      Message.countDocuments({ isRead: false }),
      Appointment.find()
        .populate('patient', 'name email phone')
        .populate('doctor', 'name specialization department')
        .sort({ createdAt: -1 })
        .limit(5),
      Appointment.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        activeDoctors,
        totalAppointments,
        pendingAppointments,
        acceptedAppointments,
        completedAppointments,
        cancelledAppointments,
        todayAppointments,
        unreadMessages,
        departmentBreakdown: departmentStats,
        recentAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for Doctor
// @route   GET /api/stats/doctor
// @access  Private (Doctor)
export const getDoctorStats = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const todayStr = new Date().toISOString().split('T')[0];

    const [
      totalAppointments,
      pendingAppointments,
      acceptedAppointments,
      completedAppointments,
      todayAppointments,
      upcomingAppointments,
    ] = await Promise.all([
      Appointment.countDocuments({ doctor: doctorId }),
      Appointment.countDocuments({ doctor: doctorId, status: 'pending' }),
      Appointment.countDocuments({ doctor: doctorId, status: 'accepted' }),
      Appointment.countDocuments({ doctor: doctorId, status: 'completed' }),
      Appointment.countDocuments({ doctor: doctorId, appointmentDate: todayStr }),
      Appointment.find({ doctor: doctorId, status: 'accepted' })
        .populate('patient', 'name email phone gender dob')
        .sort({ appointmentDate: 1, appointmentTimeSlot: 1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        pendingAppointments,
        acceptedAppointments,
        completedAppointments,
        todayAppointments,
        upcomingAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};
