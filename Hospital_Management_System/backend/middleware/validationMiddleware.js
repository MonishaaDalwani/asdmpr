// Simple, dependency-free robust input validation middleware

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Full name is required');
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('A valid email address is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(', '),
      errors,
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Please provide a valid email');
  }

  if (!password) {
    errors.push('Please provide your password');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(', '),
      errors,
    });
  }

  next();
};

export const validateAppointmentBooking = (req, res, next) => {
  const { doctorId, appointmentDate, appointmentTimeSlot, reason } = req.body;
  const errors = [];

  if (!doctorId) errors.push('Please select a doctor');
  if (!appointmentDate) errors.push('Please select an appointment date');
  if (!appointmentTimeSlot) errors.push('Please select a time slot');
  if (!reason || reason.trim().length === 0) errors.push('Please provide a reason or symptoms for the visit');

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(', '),
      errors,
    });
  }

  next();
};

export const validateMessageInput = (req, res, next) => {
  const { name, email, subject, message } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) errors.push('Name is required');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('Valid email is required');
  if (!subject || subject.trim().length === 0) errors.push('Subject is required');
  if (!message || message.trim().length === 0) errors.push('Message cannot be empty');

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(', '),
      errors,
    });
  }

  next();
};
