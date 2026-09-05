function validateAppointment(req, res, next) {
  const { patient_name, patient_email, patient_phone, service_id, doctor_id, appointment_date, appointment_time } = req.body;
  const errors = [];

  if (!patient_name || patient_name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!patient_email || !emailRegex.test(patient_email.trim())) {
    errors.push('A valid email address is required.');
  }

  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  if (!patient_phone || patient_phone.trim().length < 7) {
    errors.push('A valid phone number (at least 7 digits) is required.');
  }

  if (!service_id) {
    errors.push('Please select a dental service.');
  }

  if (!doctor_id) {
    errors.push('Please select a preferred doctor.');
  }

  if (!appointment_date) {
    errors.push('Appointment date is required.');
  } else {
    const today = new Date().toISOString().split('T')[0];
    if (appointment_date < today) {
      errors.push('Appointment date cannot be in the past.');
    }
  }

  if (!appointment_time) {
    errors.push('Appointment time slot is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
}

function validateInquiry(req, res, next) {
  const { full_name, email, message } = req.body;
  const errors = [];

  if (!full_name || full_name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!message || message.trim().length < 5) {
    errors.push('Inquiry message must be at least 5 characters long.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
}

module.exports = {
  validateAppointment,
  validateInquiry
};
