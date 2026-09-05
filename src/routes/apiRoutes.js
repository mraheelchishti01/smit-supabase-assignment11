const express = require('express');
const router = express.Router();

const { getAllServices, getServiceBySlug } = require('../controllers/serviceController');
const { getAllDoctors, getDoctorById } = require('../controllers/doctorController');
const { createAppointment, getAppointments } = require('../controllers/appointmentController');
const { createInquiry } = require('../controllers/inquiryController');
const { validateAppointment, validateInquiry } = require('../middlewares/validator');

// Public Services routes
router.get('/services', getAllServices);
router.get('/services/:slug', getServiceBySlug);

// Public Doctors routes
router.get('/doctors', getAllDoctors);
router.get('/doctors/:id', getDoctorById);

// Public Patient Appointments
router.post('/appointments', validateAppointment, createAppointment);
router.get('/appointments/check', getAppointments); // For slot checking

// Public Contact Inquiry
router.post('/inquiries', validateInquiry, createInquiry);

module.exports = router;
