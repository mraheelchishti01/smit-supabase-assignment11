const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes/apiRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middlewares/errorHandler');
const { supabaseClient, db } = require('./config/supabase');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Frontend Assets from public/
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Apex Dental Care & Implant Clinic API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Public config for frontend Supabase client
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
  });
});

// Diagnostic route for database check (supports user's /test-db check)
app.get('/test-db', async (req, res) => {
  try {
    if (!supabaseClient) {
      const services = await db.getServices();
      return res.json({
        success: true,
        mode: 'Local High-Fidelity Store',
        message: 'No Supabase URL/keys found in .env. Running on local seed store.',
        servicesCount: services.length,
        data: services
      });
    }

    // Attempt to read from Supabase
    const { data, error } = await supabaseClient.from('dental_services').select('*');
    if (error) {
      const fallbackServices = await db.getServices();
      return res.json({
        success: true,
        supabaseConnected: true,
        tablesCreated: false,
        notice: "Connected to your Supabase project, but the tables (dental_services, doctors, etc.) haven't been created yet.",
        instruction: "To create the tables in Supabase: Open your Supabase Dashboard -> Click 'SQL Editor' on the left -> Paste the contents of 'schema.sql' -> Click 'Run'.",
        fallbackActive: true,
        data: fallbackServices
      });
    }

    res.json({
      success: true,
      supabaseConnected: true,
      tablesCreated: true,
      message: 'Supabase PostgreSQL connected successfully and tables found!',
      data
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Centralized Error Handling
app.use(errorHandler);

// Start Server if not imported by tests/serverless runner
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🦷 Apex Dental Care & Implant Clinic System is LIVE`);
    console.log(`📍 Web Application: http://localhost:${PORT}`);
    console.log(`📊 Admin Control:  http://localhost:${PORT}/admin.html`);
    console.log(`📅 Bookings Page:  http://localhost:${PORT}/book-appointment.html`);
    console.log(`⚡ API Health:     http://localhost:${PORT}/api/health`);
    console.log(`🔍 DB Diagnostic:  http://localhost:${PORT}/test-db`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;
