const express = require('express');
const router = express.Router();

const { 
  getAppointments, 
  updateAppointmentStatus, 
  deleteAppointment 
} = require('../controllers/appointmentController');

const { 
  getAllInquiries, 
  toggleResolveInquiry 
} = require('../controllers/inquiryController');

const { getDashboardAnalytics } = require('../controllers/analyticsController');

// Admin Analytics Overview
router.get('/analytics', getDashboardAnalytics);

// Admin Appointments Management
router.get('/appointments', getAppointments);
router.patch('/appointments/:id/status', updateAppointmentStatus);
router.delete('/appointments/:id', deleteAppointment);

// Admin Inquiries Management
router.get('/inquiries', getAllInquiries);
router.patch('/inquiries/:id/resolve', toggleResolveInquiry);

module.exports = router;
