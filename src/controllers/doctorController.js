const { db } = require('../config/supabase');

async function getAllDoctors(req, res, next) {
  try {
    const doctors = await db.getDoctors();
    res.json({
      success: true,
      data: doctors
    });
  } catch (err) {
    next(err);
  }
}

async function getDoctorById(req, res, next) {
  try {
    const { id } = req.params;
    const doctors = await db.getDoctors();
    const doctor = doctors.find(d => d.id === id);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }
    res.json({
      success: true,
      data: doctor
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllDoctors,
  getDoctorById
};
