const { db } = require('../config/supabase');

async function getDashboardAnalytics(req, res, next) {
  try {
    const appointments = await db.getAppointments();
    const inquiries = await db.getInquiries();
    const services = await db.getServices();
    const doctors = await db.getDoctors();

    const todayStr = new Date().toISOString().split('T')[0];

    const totalAppointments = appointments.length;
    const pendingAppointments = appointments.filter(a => a.status === 'Pending').length;
    const confirmedAppointments = appointments.filter(a => a.status === 'Confirmed').length;
    const completedAppointments = appointments.filter(a => a.status === 'Completed').length;
    const cancelledAppointments = appointments.filter(a => a.status === 'Cancelled').length;

    const todayAppointments = appointments.filter(a => a.appointment_date === todayStr);

    const pendingInquiries = inquiries.filter(i => !i.is_resolved).length;
    const resolvedInquiries = inquiries.filter(i => i.is_resolved).length;

    // Calculate treatment popularity
    const treatmentCounts = {};
    appointments.forEach(apt => {
      const name = apt.service_name || 'General';
      treatmentCounts[name] = (treatmentCounts[name] || 0) + 1;
    });

    const popularTreatments = Object.keys(treatmentCounts).map(name => ({
      name,
      count: treatmentCounts[name]
    })).sort((a, b) => b.count - a.count);

    // Estimated revenue from confirmed & completed (simple average estimate per appointment ~ $220)
    const activeConfirmedOrDone = confirmedAppointments + completedAppointments;
    const estimatedRevenue = activeConfirmedOrDone * 220;

    res.json({
      success: true,
      data: {
        summary: {
          totalAppointments,
          pendingAppointments,
          confirmedAppointments,
          completedAppointments,
          cancelledAppointments,
          todayCount: todayAppointments.length,
          pendingInquiries,
          resolvedInquiries,
          totalDoctors: doctors.length,
          totalServices: services.length,
          estimatedRevenue
        },
        popularTreatments,
        todayAppointments,
        recentAppointments: appointments.slice(0, 5),
        recentInquiries: inquiries.slice(0, 5)
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardAnalytics
};
