const { db } = require('../config/supabase');

async function getAllServices(req, res, next) {
  try {
    const services = await db.getServices();
    res.json({
      success: true,
      data: services
    });
  } catch (err) {
    next(err);
  }
}

async function getServiceBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const services = await db.getServices();
    const service = services.find(s => s.slug === slug);
    if (!service) {
      return res.status(404).json({ success: false, error: 'Dental service not found' });
    }
    res.json({
      success: true,
      data: service
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllServices,
  getServiceBySlug
};
