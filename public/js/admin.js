/**
 * Apex Dental Care - Admin Dashboard Controller
 */

let allAppointments = [];
let allInquiries = [];
let currentFilter = 'All';

document.addEventListener('DOMContentLoaded', async () => {
  await refreshDashboard();
  setupAdminListeners();
});

async function refreshDashboard() {
  await Promise.all([
    loadAnalytics(),
    loadAppointments(),
    loadInquiries()
  ]);
}

async function loadAnalytics() {
  try {
    const res = await fetch('/api/admin/analytics');
    const data = await res.json();
    if (data.success) {
      const s = data.data.summary;
      document.getElementById('metricTotal').textContent = s.totalAppointments;
      document.getElementById('metricPending').textContent = s.pendingAppointments;
      document.getElementById('metricConfirmed').textContent = s.confirmedAppointments;
      document.getElementById('metricCompleted').textContent = s.completedAppointments;
      document.getElementById('metricRevenue').textContent = `$${s.estimatedRevenue.toLocaleString()}`;
    }
  } catch (err) {
    console.error('Failed to load analytics:', err);
  }
}

async function loadAppointments() {
  try {
    const res = await fetch('/api/admin/appointments');
    const data = await res.json();
    if (data.success) {
      allAppointments = data.data;
      renderAppointmentsTable();
    }
  } catch (err) {
    console.error('Failed to load appointments:', err);
    if (typeof showToast === 'function') showToast('Failed to load appointments', 'error');
  }
}

async function loadInquiries() {
  try {
    const res = await fetch('/api/admin/inquiries');
    const data = await res.json();
    if (data.success) {
      allInquiries = data.data;
      renderInquiries();
    }
  } catch (err) {
    console.error('Failed to load inquiries:', err);
  }
}

function renderAppointmentsTable() {
  const tbody = document.getElementById('appointmentsTableBody');
  const searchInput = document.getElementById('appointmentSearch');
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

  if (!tbody) return;

  let filtered = allAppointments;
  if (currentFilter !== 'All') {
    filtered = filtered.filter(a => a.status.toLowerCase() === currentFilter.toLowerCase());
  }

  if (searchTerm) {
    filtered = filtered.filter(a => 
      a.patient_name.toLowerCase().includes(searchTerm) ||
      a.patient_email.toLowerCase().includes(searchTerm) ||
      a.patient_phone.includes(searchTerm) ||
      (a.service_name && a.service_name.toLowerCase().includes(searchTerm))
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-5 text-muted">
          <i class="bi bi-folder-x fs-1 d-block mb-2"></i>
          No appointments found matching this criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(apt => {
    return `
      <tr>
        <td>
          <div class="fw-bold text-dark">${escapeHtml(apt.patient_name)}</div>
          <div class="small text-muted">${escapeHtml(apt.patient_phone)}</div>
          <div class="small text-muted">${escapeHtml(apt.patient_email)}</div>
        </td>
        <td>
          <div class="fw-semibold text-primary">${escapeHtml(apt.service_name || 'General Treatment')}</div>
          <div class="small text-muted">${escapeHtml(apt.service_price || '')}</div>
        </td>
        <td>
          <div class="fw-semibold">${escapeHtml(apt.doctor_name || 'Assigned Specialist')}</div>
          <div class="small text-muted">${escapeHtml(apt.doctor_specialization || '')}</div>
        </td>
        <td>
          <div class="fw-semibold">${apt.appointment_date}</div>
          <div class="small text-muted"><i class="bi bi-clock me-1"></i>${apt.appointment_time}</div>
        </td>
        <td>
          <span class="badge-status ${apt.status}">
            <i class="bi ${getStatusIcon(apt.status)}"></i>
            ${apt.status}
          </span>
        </td>
        <td class="small text-secondary" style="max-width: 180px;">
          ${apt.notes ? escapeHtml(apt.notes) : '<em class="text-muted">None</em>'}
        </td>
        <td>
          <div class="d-flex flex-wrap gap-1">
            ${apt.status === 'Pending' ? `
              <button class="btn btn-action-sm btn-approve" onclick="updateStatus('${apt.id}', 'Confirmed')">
                <i class="bi bi-check2"></i> Confirm
              </button>
            ` : ''}
            ${apt.status === 'Confirmed' ? `
              <button class="btn btn-action-sm btn-complete" onclick="updateStatus('${apt.id}', 'Completed')">
                <i class="bi bi-check-all"></i> Complete
              </button>
            ` : ''}
            ${apt.status !== 'Cancelled' && apt.status !== 'Completed' ? `
              <button class="btn btn-action-sm btn-cancel-action" onclick="updateStatus('${apt.id}', 'Cancelled')">
                <i class="bi bi-x-lg"></i> Cancel
              </button>
            ` : ''}
            <button class="btn btn-action-sm btn-outline-secondary" onclick="deleteAppointmentRecord('${apt.id}')" title="Delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function getStatusIcon(status) {
  switch (status) {
    case 'Pending': return 'bi-hourglass-split';
    case 'Confirmed': return 'bi-check-circle-fill';
    case 'Completed': return 'bi-patch-check-fill';
    case 'Cancelled': return 'bi-x-circle-fill';
    default: return 'bi-circle';
  }
}

async function updateStatus(id, newStatus) {
  try {
    const res = await fetch(`/api/admin/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await res.json();
    if (result.success) {
      if (typeof showToast === 'function') showToast(`Appointment marked as ${newStatus}`, 'success');
      await refreshDashboard();
    } else {
      if (typeof showToast === 'function') showToast(result.error || 'Update failed', 'error');
    }
  } catch (err) {
    console.error('Failed to update status:', err);
    if (typeof showToast === 'function') showToast('Network error while updating status', 'error');
  }
}

async function deleteAppointmentRecord(id) {
  if (!confirm('Are you sure you want to delete this appointment record?')) return;

  try {
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: 'DELETE'
    });

    const result = await res.json();
    if (result.success) {
      if (typeof showToast === 'function') showToast('Appointment deleted', 'success');
      await refreshDashboard();
    } else {
      if (typeof showToast === 'function') showToast('Failed to delete', 'error');
    }
  } catch (err) {
    console.error('Failed to delete:', err);
  }
}

function renderInquiries() {
  const container = document.getElementById('inquiriesContainer');
  if (!container) return;

  if (allInquiries.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5 text-muted">
        <i class="bi bi-chat-square-dots fs-1 d-block mb-2"></i>
        No patient inquiries at the moment.
      </div>
    `;
    return;
  }

  container.innerHTML = allInquiries.map(inq => {
    return `
      <div class="col-md-6 col-lg-4">
        <div class="inquiry-card ${inq.is_resolved ? 'resolved' : ''}">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge ${inq.is_resolved ? 'bg-success' : 'bg-warning text-dark'}">
              ${inq.is_resolved ? 'Resolved' : 'Needs Response'}
            </span>
            <small class="text-muted">${new Date(inq.created_at).toLocaleDateString()}</small>
          </div>
          <h5 class="fw-bold mb-1">${escapeHtml(inq.subject || 'General Inquiry')}</h5>
          <p class="text-muted small mb-2">From: <strong>${escapeHtml(inq.full_name)}</strong></p>
          <div class="p-3 mb-3 bg-light rounded text-secondary small" style="min-height: 70px;">
            "${escapeHtml(inq.message)}"
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <div class="small text-muted">
              <i class="bi bi-envelope me-1"></i>${escapeHtml(inq.email)}<br>
              ${inq.phone ? `<i class="bi bi-telephone me-1"></i>${escapeHtml(inq.phone)}` : ''}
            </div>
            <button class="btn btn-sm ${inq.is_resolved ? 'btn-outline-secondary' : 'btn-success'}" onclick="toggleInquiry('${inq.id}', ${!inq.is_resolved})">
              ${inq.is_resolved ? '<i class="bi bi-arrow-counterclockwise"></i> Reopen' : '<i class="bi bi-check2"></i> Mark Resolved'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function toggleInquiry(id, is_resolved) {
  try {
    const res = await fetch(`/api/admin/inquiries/${id}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_resolved })
    });
    const result = await res.json();
    if (result.success) {
      if (typeof showToast === 'function') {
        showToast(`Inquiry marked as ${is_resolved ? 'Resolved' : 'Active'}`, 'success');
      }
      await refreshDashboard();
    }
  } catch (err) {
    console.error('Failed to toggle inquiry:', err);
  }
}

function setupAdminListeners() {
  // Status filter pills
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active', 'btn-primary'));
      filterBtns.forEach(b => b.classList.add('btn-outline-secondary'));
      btn.classList.remove('btn-outline-secondary');
      btn.classList.add('active', 'btn-primary');
      currentFilter = btn.dataset.status;
      renderAppointmentsTable();
    });
  });

  // Search input
  const searchInput = document.getElementById('appointmentSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderAppointmentsTable();
    });
  }

  // Export CSV
  const exportBtn = document.getElementById('exportCsvBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportToCsv);
  }
}

function exportToCsv() {
  if (allAppointments.length === 0) {
    if (typeof showToast === 'function') showToast('No appointment data to export', 'warning');
    return;
  }

  const headers = ['ID', 'Patient Name', 'Email', 'Phone', 'Treatment', 'Doctor', 'Date', 'Time', 'Status', 'Notes'];
  const rows = allAppointments.map(a => [
    a.id,
    `"${a.patient_name.replace(/"/g, '""')}"`,
    `"${a.patient_email}"`,
    `"${a.patient_phone}"`,
    `"${(a.service_name || '').replace(/"/g, '""')}"`,
    `"${(a.doctor_name || '').replace(/"/g, '""')}"`,
    a.appointment_date,
    a.appointment_time,
    a.status,
    `"${(a.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `apex_dental_appointments_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.updateStatus = updateStatus;
window.deleteAppointmentRecord = deleteAppointmentRecord;
window.toggleInquiry = toggleInquiry;
window.refreshDashboard = refreshDashboard;
