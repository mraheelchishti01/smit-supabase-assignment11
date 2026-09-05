/**
 * Apex Dental Care - Dynamic Booking Workflow
 * End-to-End Supabase PostgreSQL Integration
 */

const DEFAULT_SERVICES = [
  { id: '11111111-1111-1111-1111-111111111101', name: 'Laser Teeth Whitening', slug: 'teeth-whitening', price_range: '$150 - $250', duration_minutes: 45 },
  { id: '11111111-1111-1111-1111-111111111102', name: 'Titanium Dental Implants', slug: 'dental-implants', price_range: '$800 - $1,500', duration_minutes: 90 },
  { id: '11111111-1111-1111-1111-111111111103', name: 'Root Canal Therapy', slug: 'root-canal', price_range: '$300 - $600', duration_minutes: 60 },
  { id: '11111111-1111-1111-1111-111111111104', name: 'Orthodontics & Clear Aligners', slug: 'orthodontics', price_range: '$1,200 - $2,800', duration_minutes: 45 },
  { id: '11111111-1111-1111-1111-111111111105', name: 'Deep Scaling & Polishing', slug: 'scaling-polishing', price_range: '$80 - $130', duration_minutes: 30 },
  { id: '11111111-1111-1111-1111-111111111106', name: 'Porcelain Veneers', slug: 'porcelain-veneers', price_range: '$450 - $900', duration_minutes: 60 },
  { id: '11111111-1111-1111-1111-111111111107', name: 'Pediatric Dentistry', slug: 'pediatric-dentistry', price_range: '$70 - $120', duration_minutes: 30 },
  { id: '11111111-1111-1111-1111-111111111108', name: 'Emergency Dental Care', slug: 'emergency-dental', price_range: '$120 - $350', duration_minutes: 45 }
];

const DEFAULT_DOCTORS = [
  { id: '22222222-2222-2222-2222-222222222201', full_name: 'Dr. Sarah Jenkins, DDS', specialization: 'Implantologist & Chief Surgeon' },
  { id: '22222222-2222-2222-2222-222222222202', full_name: 'Dr. Marcus Vance, DMD', specialization: 'Orthodontist & Aesthetic Specialist' },
  { id: '22222222-2222-2222-2222-222222222203', full_name: 'Dr. Elena Rostova, BDS', specialization: 'Endodontist & Root Canal Specialist' },
  { id: '22222222-2222-2222-2222-222222222204', full_name: 'Dr. Keith Larson, DDS', specialization: 'Pediatric & Preventive Dentist' }
];

let allServices = [...DEFAULT_SERVICES];
let allDoctors = [...DEFAULT_DOCTORS];
let selectedSlot = '10:00';
let browserSupabase = null;

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

document.addEventListener('DOMContentLoaded', async () => {
  initDateInput();
  renderTimeSlots();
  
  // 1. Instantly populate dropdowns with initial data
  populateServicesSelect(allServices);
  populateDoctorsSelect(allDoctors);
  setupEventListeners();
  checkUrlParams();
  updateSummary();

  // 2. Initialize Supabase browser client & live data
  await initSupabaseAndLiveData();
});

function initDateInput() {
  const dateInput = document.getElementById('appointment_date');
  if (!dateInput) return;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomDd = String(tomorrow.getDate()).padStart(2, '0');
  const tomMm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  dateInput.value = `${tomorrow.getFullYear()}-${tomMm}-${tomDd}`;
}

function renderTimeSlots() {
  const container = document.getElementById('slotsContainer');
  if (!container) return;

  container.innerHTML = '';
  timeSlots.forEach(slot => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `slot-btn ${slot === selectedSlot ? 'active' : ''}`;
    btn.textContent = slot;
    btn.dataset.slot = slot;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSlot = slot;
      const hiddenTime = document.getElementById('appointment_time');
      if (hiddenTime) hiddenTime.value = slot;
      updateSummary();
    });

    container.appendChild(btn);
  });

  const hiddenTime = document.getElementById('appointment_time');
  if (hiddenTime) hiddenTime.value = selectedSlot;
}

async function initSupabaseAndLiveData() {
  try {
    // Fetch public Supabase configuration from backend
    const configRes = await fetch('/api/config');
    if (configRes.ok) {
      const config = await configRes.json();
      if (config.supabaseUrl && config.supabaseAnonKey && window.supabase && window.supabase.createClient) {
        browserSupabase = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
        window.browserSupabase = browserSupabase;
        console.log('✅ [Supabase] Browser client initialized for project:', config.supabaseUrl);
      }
    }

    // Refresh live treatments & doctors if available
    const [servicesRes, doctorsRes] = await Promise.all([
      fetch('/api/services'),
      fetch('/api/doctors')
    ]);

    if (servicesRes.ok) {
      const sData = await servicesRes.json();
      if (sData.success && sData.data && sData.data.length > 0) {
        allServices = sData.data;
        populateServicesSelect(allServices);
      }
    }

    if (doctorsRes.ok) {
      const dData = await doctorsRes.json();
      if (dData.success && dData.data && dData.data.length > 0) {
        allDoctors = dData.data;
        populateDoctorsSelect(allDoctors);
      }
    }

    checkUrlParams();
    updateSummary();
  } catch (err) {
    console.warn('[Booking] Could not fetch live database items, retaining preloaded data:', err.message);
  }
}

function populateServicesSelect(services) {
  const select = document.getElementById('service_id');
  if (!select) return;

  const previousValue = select.value;
  select.innerHTML = '<option value="">-- Choose Dental Treatment --</option>';
  
  services.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.name} (${s.price_range || 'Consultation'})`;
    opt.dataset.slug = s.slug;
    opt.dataset.price = s.price_range || 'Consultation';
    opt.dataset.duration = s.duration_minutes || 30;
    opt.dataset.name = s.name;
    select.appendChild(opt);
  });

  if (previousValue && services.some(s => s.id === previousValue)) {
    select.value = previousValue;
  } else if (services.length > 0 && !select.value) {
    select.selectedIndex = 1;
  }
}

function populateDoctorsSelect(doctors) {
  const select = document.getElementById('doctor_id');
  if (!select) return;

  const previousValue = select.value;
  select.innerHTML = '<option value="">-- Choose Preferred Specialist --</option>';
  
  doctors.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = `${d.full_name} — ${d.specialization}`;
    opt.dataset.name = d.full_name;
    select.appendChild(opt);
  });

  if (previousValue && doctors.some(d => d.id === previousValue)) {
    select.value = previousValue;
  } else if (doctors.length > 0 && !select.value) {
    select.selectedIndex = 1;
  }
}

function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const serviceSlug = params.get('service');
  if (serviceSlug && allServices.length > 0) {
    const matched = allServices.find(s => s.slug === serviceSlug);
    if (matched) {
      const select = document.getElementById('service_id');
      if (select) {
        select.value = matched.id;
        updateSummary();
      }
    }
  }
}

function updateSummary() {
  const serviceSelect = document.getElementById('service_id');
  const doctorSelect = document.getElementById('doctor_id');
  const dateInput = document.getElementById('appointment_date');

  const summaryService = document.getElementById('summaryService');
  const summaryPrice = document.getElementById('summaryPrice');
  const summaryDoctor = document.getElementById('summaryDoctor');
  const summaryDateTime = document.getElementById('summaryDateTime');

  if (serviceSelect && summaryService) {
    const selectedOpt = serviceSelect.options[serviceSelect.selectedIndex];
    if (selectedOpt && selectedOpt.value) {
      summaryService.textContent = selectedOpt.dataset.name || selectedOpt.textContent;
      if (summaryPrice) summaryPrice.textContent = selectedOpt.dataset.price || 'Contact Clinic';
    } else {
      summaryService.textContent = 'Select a treatment';
      if (summaryPrice) summaryPrice.textContent = '$0.00';
    }
  }

  if (doctorSelect && summaryDoctor) {
    const docOpt = doctorSelect.options[doctorSelect.selectedIndex];
    summaryDoctor.textContent = docOpt && docOpt.value ? docOpt.dataset.name : 'First Available Specialist';
  }

  if (summaryDateTime) {
    const dateVal = dateInput && dateInput.value ? dateInput.value : 'Tomorrow';
    summaryDateTime.textContent = `${dateVal} at ${selectedSlot}`;
  }
}

function setupEventListeners() {
  const serviceSelect = document.getElementById('service_id');
  const doctorSelect = document.getElementById('doctor_id');
  const dateInput = document.getElementById('appointment_date');
  const form = document.getElementById('bookingForm');

  if (serviceSelect) serviceSelect.addEventListener('change', updateSummary);
  if (doctorSelect) doctorSelect.addEventListener('change', updateSummary);
  if (dateInput) dateInput.addEventListener('change', updateSummary);

  if (form) {
    form.addEventListener('submit', handleBookingSubmit);
  }
}

/**
 * Handle form submission: sends appointment to Supabase with strict error handling
 */
async function handleBookingSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');

  const patient_name = document.getElementById('patient_name').value.trim();
  const patient_email = document.getElementById('patient_email').value.trim();
  const patient_phone = document.getElementById('patient_phone').value.trim();
  const service_id = document.getElementById('service_id').value;
  const doctor_id = document.getElementById('doctor_id').value;
  const appointment_date = document.getElementById('appointment_date').value;
  const appointment_time = document.getElementById('appointment_time').value || selectedSlot;
  const notes = document.getElementById('notes') ? document.getElementById('notes').value.trim() : '';

  // Get readable names from selects
  const serviceSelect = document.getElementById('service_id');
  const service_name = serviceSelect.options[serviceSelect.selectedIndex]?.dataset?.name || 'General Dental Treatment';

  const doctorSelect = document.getElementById('doctor_id');
  const doctor_name = doctorSelect.options[doctorSelect.selectedIndex]?.dataset?.name || 'Clinic Specialist';

  // Client validation
  if (!patient_name) {
    showToast('Please enter your full name.', 'warning');
    return;
  }
  if (!patient_email || !patient_email.includes('@')) {
    showToast('Please enter a valid email address.', 'warning');
    return;
  }
  if (!patient_phone) {
    showToast('Please enter a contact phone number.', 'warning');
    return;
  }
  if (!service_id) {
    showToast('Please select a dental service.', 'warning');
    return;
  }
  if (!doctor_id) {
    showToast('Please choose a preferred doctor.', 'warning');
    return;
  }
  if (!appointment_date) {
    showToast('Please select an appointment date.', 'warning');
    return;
  }

  // Exact Supabase columns payload mapping
  const payload = {
    patient_name,
    patient_email,
    patient_phone,
    service_id,
    service_name,
    doctor_id,
    doctor_name,
    appointment_date,
    appointment_time,
    notes,
    status: 'Pending'
  };

  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving to Supabase...';

    console.log('[Booking Form] Submitting appointment data to Supabase...', payload);

    let savedRecord = null;

    // 1. Submit through backend API which executes supabase.from('appointments').insert(...)
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      // If backend reports an error, throw it so it is shown to user and logged
      const errMsg = result.error || (result.details && result.details.join(', ')) || 'Database error: Could not insert appointment';
      throw new Error(errMsg);
    }

    savedRecord = result.data;
    console.log('✅ [Supabase Success] Appointment saved into Supabase database:', savedRecord);

    // Success flow
    showToast('Appointment successfully booked and saved to database!', 'success');
    renderConfirmationModal(savedRecord);

    // Reset form fields
    form.reset();
    initDateInput();
    renderTimeSlots();
    populateServicesSelect(allServices);
    populateDoctorsSelect(allDoctors);
    updateSummary();

  } catch (err) {
    console.error('❌ [Supabase Insertion Failed]:', err);
    
    // User-friendly error message
    let displayMsg = err.message || 'Failed to save appointment in Supabase.';
    if (displayMsg.includes('does not exist') || displayMsg.includes('PGRST205')) {
      displayMsg = "Supabase table 'appointments' not found. Please run create_appointments_table.sql in Supabase SQL Editor.";
    }

    showToast(displayMsg, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="bi bi-calendar-check-fill me-2"></i> Confirm Appointment Request';
  }
}

function renderConfirmationModal(booking) {
  let modalEl = document.getElementById('confirmationModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'confirmationModal';
    modalEl.className = 'modal fade';
    modalEl.tabIndex = -1;
    document.body.appendChild(modalEl);
  }

  const bookingRef = booking.id ? booking.id.slice(0, 8).toUpperCase() : 'APT-' + Math.random().toString(36).substr(2, 6).toUpperCase();

  modalEl.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content" style="border-radius: 20px; border:none; box-shadow: 0 25px 50px -12px rgba(14, 116, 144, 0.25);">
        <div class="modal-body text-center p-4 p-md-5">
          <div style="width: 72px; height: 72px; background: #D1FAE5; color: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin: 0 auto 20px;">
            <i class="bi bi-check-lg"></i>
          </div>
          <h3 class="fw-bold mb-2">Appointment Scheduled!</h3>
          <p class="text-muted mb-4">Your appointment has been securely stored in the clinic database. Confirmation sent to <strong>${escapeHtml(booking.patient_email)}</strong>.</p>
          
          <div class="p-3 mb-4 text-start" style="background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0; font-size: 0.92rem;">
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Supabase Record ID:</span>
              <span class="fw-bold text-primary font-monospace">${bookingRef}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Patient:</span>
              <span class="fw-semibold">${escapeHtml(booking.patient_name)}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Treatment:</span>
              <span class="fw-semibold">${escapeHtml(booking.service_name || 'Dental Treatment')}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Dentist:</span>
              <span class="fw-semibold">${escapeHtml(booking.doctor_name || 'Specialist')}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Date & Time:</span>
              <span class="fw-semibold">${booking.appointment_date} at ${booking.appointment_time}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span class="text-muted">Database Status:</span>
              <span class="badge bg-warning text-dark px-2 py-1">${booking.status || 'Pending'}</span>
            </div>
          </div>

          <div class="d-grid gap-2">
            <button type="button" class="btn btn-primary-custom justify-content-center" data-bs-dismiss="modal">
              Close & Book Another
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.bootstrap && bootstrap.Modal) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } else {
    alert(`Appointment Saved! Reference ID: ${bookingRef}`);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
