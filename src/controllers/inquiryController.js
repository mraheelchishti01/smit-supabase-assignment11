const { db } = require('../config/supabase');

async function createInquiry(req, res, next) {
  try {
    const { full_name, email, phone, subject, message } = req.body;

    const created = await db.createInquiry({
      full_name,
      email,
      phone,
      subject,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your inquiry has been submitted. Our dental team will respond within 24 hours.',
      data: created
    });
  } catch (err) {
    next(err);
  }
}

async function getAllInquiries(req, res, next) {
  try {
    const inquiries = await db.getInquiries();
    res.json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (err) {
    next(err);
  }
}

async function toggleResolveInquiry(req, res, next) {
  try {
    const { id } = req.params;
    const { is_resolved } = req.body;

    const updated = await db.toggleResolveInquiry(
      id, 
      is_resolved !== undefined ? is_resolved : true
    );

    res.json({
      success: true,
      message: `Inquiry marked as ${updated.is_resolved ? 'resolved' : 'unresolved'}`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createInquiry,
  getAllInquiries,
  toggleResolveInquiry
};
