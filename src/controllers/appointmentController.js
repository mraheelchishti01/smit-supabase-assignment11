const { db } = require('../config/supabase');

async function createAppointment(req, res, next) {
  try {
    const { 
      patient_name, 
      patient_email, 
      patient_phone, 
      service_id, 
      doctor_id, 
      appointment_date, 
      appointment_time, 
      notes 
    } = req.body;

    let service_name = req.body.service_name;
    let doctor_name = req.body.doctor_name;

    // Auto-resolve readable names if not directly sent
    if (!service_name && service_id) {
      const services = await db.getServices();
      const matched = services.find(s => s.id === service_id);
      if (matched) service_name = matched.name;
    }

    if (!doctor_name && doctor_id) {
      const doctors = await db.getDoctors();
      const matched = doctors.find(d => d.id === doctor_id);
      if (matched) doctor_name = matched.full_name;
    }

    console.log('[API] Processing new appointment request for:', patient_name);

    const created = await db.createAppointment({
      patient_name,
      patient_email,
      patient_phone,
      service_id,
      service_name,
      doctor_id,
      doctor_name,
      appointment_date,
      appointment_time,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Appointment successfully created and saved in Supabase database!',
      data: created
    });
  } catch (err) {
    console.error('[API Appointment Error]', err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      supabaseError: true
    });
  }
}

async function getAppointments(req, res, next) {
  try {
    const { status, date } = req.query;
    const appointments = await db.getAppointments({ status, date });
    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (err) {
    next(err);
  }
}

async function updateAppointmentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status field is required' });
    }

    const updated = await db.updateAppointmentStatus(id, status);
    res.json({
      success: true,
      message: `Appointment marked as ${status}`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

async function deleteAppointment(req, res, next) {
  try {
    const { id } = req.params;
    const success = await db.deleteAppointment(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
  deleteAppointment
};
