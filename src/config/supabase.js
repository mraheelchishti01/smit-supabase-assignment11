const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabaseClient = null;
const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_KEY && 
  SUPABASE_URL.startsWith('http') && 
  !SUPABASE_URL.includes('your-project-id')
);

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
    console.log('[Database] Supabase client initialized for:', SUPABASE_URL);
  } catch (err) {
    console.warn('[Database] Supabase client initialization error, will use fallback store:', err.message);
  }
} else {
  console.log('[Database] No active Supabase credentials in .env. Running on local seed store.');
}

// Seed dental services
const initialServices = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    name: 'Teeth Whitening',
    slug: 'teeth-whitening',
    description: 'Professional laser teeth whitening brightening your smile up to 8 shades in a single comfortable 45-minute session.',
    duration_minutes: 45,
    price_range: '$150 - $250',
    icon_name: 'bi-stars',
    category: 'Cosmetic',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    name: 'Dental Implants',
    slug: 'dental-implants',
    description: 'Permanent titanium tooth replacements designed to look, feel, and function just like your natural teeth with lifelong durability.',
    duration_minutes: 90,
    price_range: '$800 - $1,500',
    icon_name: 'bi-shield-check',
    category: 'Restorative',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    name: 'Root Canal Therapy',
    slug: 'root-canal',
    description: 'Gentle, pain-free endodontic procedure to eliminate deep infection, alleviate toothache, and preserve your natural tooth.',
    duration_minutes: 60,
    price_range: '$300 - $600',
    icon_name: 'bi-heart-pulse',
    category: 'Endodontics',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    name: 'Orthodontics & Clear Aligners',
    slug: 'orthodontics',
    description: 'Discreet clear aligners and modern braces to straighten misaligned teeth, fix bite issues, and build an immaculate smile.',
    duration_minutes: 45,
    price_range: '$1,200 - $2,800',
    icon_name: 'bi-grid-1x2',
    category: 'Orthodontics',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    name: 'Deep Scaling & Polishing',
    slug: 'scaling-polishing',
    description: 'Comprehensive ultrasonic plaque and calculus removal followed by fluoride polishing to prevent gum disease and freshen breath.',
    duration_minutes: 30,
    price_range: '$80 - $130',
    icon_name: 'bi-gem',
    category: 'Preventive',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '11111111-1111-1111-1111-111111111106',
    name: 'Porcelain Veneers',
    slug: 'porcelain-veneers',
    description: 'Ultra-thin, custom-crafted ceramic shells bonded to the front of teeth to correct discoloration, chips, gaps, or asymmetry.',
    duration_minutes: 60,
    price_range: '$450 - $900',
    icon_name: 'bi-emoji-smile',
    category: 'Cosmetic',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '11111111-1111-1111-1111-111111111107',
    name: 'Pediatric Dentistry',
    slug: 'pediatric-dentistry',
    description: 'Specialized, warm, and gentle dental checkups, sealants, and cavity treatments customized specifically for young children.',
    duration_minutes: 30,
    price_range: '$70 - $120',
    icon_name: 'bi-balloon',
    category: 'Pediatric',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '11111111-1111-1111-1111-111111111108',
    name: 'Emergency Dental Care',
    slug: 'emergency-dental',
    description: 'Same-day urgent response for severe tooth pain, knocked-out teeth, broken restorations, or oral bleeding.',
    duration_minutes: 45,
    price_range: '$120 - $350',
    icon_name: 'bi-hospital',
    category: 'Emergency',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

// Seed doctors
const initialDoctors = [
  {
    id: '22222222-2222-2222-2222-222222222201',
    full_name: 'Dr. Sarah Jenkins, DDS',
    specialization: 'Implantologist & Chief Surgeon',
    qualifications: 'DDS, MS (Harvard School of Dental Medicine)',
    experience_years: 14,
    bio: 'Recognized specialist in guided surgical implant placement and bone grafting with over 4,000 successful smile rehabilitations.',
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    shift_start: '09:00',
    shift_end: '17:00',
    image_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    full_name: 'Dr. Marcus Vance, DMD',
    specialization: 'Orthodontist & Aesthetic Specialist',
    qualifications: 'DMD, Cert. Ortho (Columbia University)',
    experience_years: 11,
    bio: 'Elite provider of Invisalign clear aligners and modern aesthetic smile makeovers combining function with natural beauty.',
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
    shift_start: '10:00',
    shift_end: '18:30',
    image_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '22222222-2222-2222-2222-222222222203',
    full_name: 'Dr. Elena Rostova, BDS',
    specialization: 'Endodontist & Root Canal Specialist',
    qualifications: "BDS, MDS (Endodontics, King's College London)",
    experience_years: 9,
    bio: 'Pioneering micro-endodontic therapy using dental microscopes for virtually pain-free single-visit root canal treatments.',
    available_days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    shift_start: '09:30',
    shift_end: '17:30',
    image_url: 'https://images.unsplash.com/photo-1594824813515-59b433e5c01b?auto=format&fit=crop&q=80&w=400',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '22222222-2222-2222-2222-222222222204',
    full_name: 'Dr. Keith Larson, DDS',
    specialization: 'Pediatric & Preventive Dentist',
    qualifications: 'DDS, Fellowship in Pediatric Dentistry',
    experience_years: 8,
    bio: 'Dedicated to creating fun, stress-free dental visits for kids while establishing lifelong healthy oral hygiene habits.',
    available_days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    shift_start: '09:00',
    shift_end: '16:00',
    image_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const inThreeDays = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

const initialAppointments = [
  {
    id: '33333333-3333-3333-3333-333333333301',
    patient_name: 'Emily Watson',
    patient_email: 'emily.watson@example.com',
    patient_phone: '+1 (555) 234-5678',
    service_id: '11111111-1111-1111-1111-111111111101',
    doctor_id: '22222222-2222-2222-2222-222222222202',
    appointment_date: tomorrow,
    appointment_time: '10:00',
    notes: 'First-time laser whitening before upcoming wedding.',
    status: 'Pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '33333333-3333-3333-3333-333333333302',
    patient_name: 'David Miller',
    patient_email: 'david.m@example.com',
    patient_phone: '+1 (555) 345-6789',
    service_id: '11111111-1111-1111-1111-111111111102',
    doctor_id: '22222222-2222-2222-2222-222222222201',
    appointment_date: inThreeDays,
    appointment_time: '14:00',
    notes: 'Consultation for lower molar titanium implant.',
    status: 'Confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '33333333-3333-3333-3333-333333333303',
    patient_name: 'Sophia Rodriguez',
    patient_email: 'sophia.r@example.com',
    patient_phone: '+1 (555) 456-7890',
    service_id: '11111111-1111-1111-1111-111111111105',
    doctor_id: '22222222-2222-2222-2222-222222222204',
    appointment_date: today,
    appointment_time: '11:30',
    notes: 'Routine 6-month routine scaling and checkup.',
    status: 'Completed',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const initialInquiries = [
  {
    id: '44444444-4444-4444-4444-444444444401',
    full_name: 'Jonathan Reed',
    email: 'jreed@example.com',
    phone: '+1 (555) 123-9999',
    subject: 'Invisalign Pricing Query',
    message: 'Hello, do you offer monthly payment installments for full clear aligner treatments?',
    is_resolved: false,
    created_at: new Date().toISOString()
  },
  {
    id: '44444444-4444-4444-4444-444444444402',
    full_name: 'Clara Henderson',
    email: 'clara.h@example.com',
    phone: '+1 (555) 888-1122',
    subject: 'Insurance Coverage Question',
    message: 'Hi! Does Apex Dental accept Delta Dental PPO insurance plans for root canals?',
    is_resolved: true,
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
];

// Local store
const localStore = {
  services: [...initialServices],
  doctors: [...initialDoctors],
  appointments: [...initialAppointments],
  inquiries: [...initialInquiries]
};

// Unified Database Access Layer
const db = {
  isUsingSupabase: () => Boolean(supabaseClient),

  async getServices() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('dental_services')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('[Database] Supabase services read failed, using fallback:', err.message);
      }
    }
    return localStore.services.filter(s => s.is_active);
  },

  async getDoctors() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('doctors')
          .select('*')
          .eq('is_active', true)
          .order('experience_years', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('[Database] Supabase doctors read failed, using fallback:', err.message);
      }
    }
    return localStore.doctors.filter(d => d.is_active);
  },

  async getAppointments(filters = {}) {
    let appointments = [];
    if (supabaseClient) {
      try {
        let query = supabaseClient.from('appointments').select('*');
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.date) query = query.eq('appointment_date', filters.date);
        const { data, error } = await query.order('appointment_date', { ascending: false });
        if (!error && data && data.length > 0) {
          appointments = data;
        }
      } catch (err) {
        console.warn('[Database] Supabase appointments read failed, using fallback:', err.message);
      }
    }
    
    if (appointments.length === 0) {
      appointments = [...localStore.appointments];
      if (filters.status) {
        appointments = appointments.filter(a => a.status.toLowerCase() === filters.status.toLowerCase());
      }
      if (filters.date) {
        appointments = appointments.filter(a => a.appointment_date === filters.date);
      }
    }

    // Hydrate service & doctor details for display
    const services = await this.getServices();
    const doctors = await this.getDoctors();

    return appointments.map(apt => {
      const service = services.find(s => s.id === apt.service_id);
      const doctor = doctors.find(d => d.id === apt.doctor_id);
      return {
        ...apt,
        service_name: service ? service.name : 'General Dentistry',
        service_price: service ? service.price_range : 'Consultation',
        doctor_name: doctor ? doctor.full_name : 'Clinic Specialist',
        doctor_specialization: doctor ? doctor.specialization : 'Dentist'
      };
    });
  },

  async createAppointment(appointmentData) {
    const payload = {
      patient_name: appointmentData.patient_name,
      patient_email: appointmentData.patient_email,
      patient_phone: appointmentData.patient_phone,
      service_id: appointmentData.service_id || null,
      service_name: appointmentData.service_name || null,
      doctor_id: appointmentData.doctor_id || null,
      doctor_name: appointmentData.doctor_name || null,
      appointment_date: appointmentData.appointment_date,
      appointment_time: appointmentData.appointment_time,
      notes: appointmentData.notes || '',
      status: 'Pending'
    };

    if (supabaseClient) {
      console.log('📤 [Supabase Client] Executing supabase.from("appointments").insert(...)');
      console.log('📦 [Payload]:', payload);

      const { data, error } = await supabaseClient
        .from('appointments')
        .insert([payload])
        .select();

      if (error) {
        console.error('❌ [Supabase Database Error]:', error);
        if (error.code === 'PGRST205') {
          throw new Error("Supabase table 'public.appointments' does not exist yet. Please run 'create_appointments_table.sql' in your Supabase SQL Editor.");
        }
        throw new Error(`Supabase Error (${error.code || 'FAIL'}): ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('Supabase insert executed but no record was returned.');
      }

      console.log('✅ [Supabase Database] Successfully inserted into Supabase cloud table! ID:', data[0].id);
      return data[0];
    }

    // Only used if SUPABASE_URL is completely missing in .env
    console.log('💾 [Local Store] Storing in local development memory store...');
    const localApt = {
      ...payload,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localStore.appointments.unshift(localApt);
    return localApt;
  },

  async updateAppointmentStatus(id, status) {
    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('appointments')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select();
        if (!error && data && data.length > 0) return data[0];
      } catch (err) {
        console.warn('[Database] Supabase update status failed, using fallback:', err.message);
      }
    }

    const apt = localStore.appointments.find(a => a.id === id);
    if (!apt) throw new Error('Appointment not found');
    apt.status = status;
    apt.updated_at = new Date().toISOString();
    return apt;
  },

  async deleteAppointment(id) {
    if (supabaseClient) {
      try {
        await supabaseClient.from('appointments').delete().eq('id', id);
      } catch (err) {
        console.warn('[Database] Supabase delete failed, using fallback:', err.message);
      }
    }
    const idx = localStore.appointments.findIndex(a => a.id === id);
    if (idx !== -1) {
      localStore.appointments.splice(idx, 1);
      return true;
    }
    return false;
  },

  async getInquiries() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('[Database] Supabase inquiries read failed, using fallback:', err.message);
      }
    }
    return [...localStore.inquiries].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async createInquiry(inquiryData) {
    const newInquiry = {
      id: crypto.randomUUID(),
      full_name: inquiryData.full_name,
      email: inquiryData.email,
      phone: inquiryData.phone || '',
      subject: inquiryData.subject || 'General Inquiry',
      message: inquiryData.message,
      is_resolved: false,
      created_at: new Date().toISOString()
    };

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('inquiries')
          .insert([newInquiry])
          .select();
        if (!error && data && data.length > 0) return data[0];
      } catch (err) {
        console.warn('[Database] Supabase inquiry insert failed, using fallback:', err.message);
      }
    }

    localStore.inquiries.unshift(newInquiry);
    return newInquiry;
  },

  async toggleResolveInquiry(id, isResolved = true) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('inquiries')
          .update({ is_resolved: isResolved })
          .eq('id', id)
          .select();
        if (!error && data && data.length > 0) return data[0];
      } catch (err) {
        console.warn('[Database] Supabase resolve inquiry failed, using fallback:', err.message);
      }
    }

    const inq = localStore.inquiries.find(i => i.id === id);
    if (!inq) throw new Error('Inquiry not found');
    inq.is_resolved = isResolved;
    return inq;
  },

  async checkSlotAvailability(doctorId, date, time) {
    const all = await this.getAppointments();
    const conflict = all.find(
      a => a.doctor_id === doctorId && 
           a.appointment_date === date && 
           a.appointment_time.startsWith(time.slice(0, 5)) &&
           a.status !== 'Cancelled'
    );
    return !conflict;
  }
};

module.exports = { supabaseClient, db };
