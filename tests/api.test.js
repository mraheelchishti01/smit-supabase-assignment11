/**
 * Automated API Test Suite for Apex Dental Care Management System
 */

const assert = require('assert');
const http = require('http');
const app = require('../src/server');

let server;
let baseUrl;

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Apex Dental API automated test suite...\n');

  // Start test server on random port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`[Test Server] Running at ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    // Test 1: Health check
    console.log('Test 1: Health check endpoint GET /api/health');
    const health = await makeRequest('GET', '/api/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.data.status, 'online');
    console.log('  ✅ Passed: Server is online\n');

    // Test 2: Services listing
    console.log('Test 2: Fetch active dental services GET /api/services');
    const services = await makeRequest('GET', '/api/services');
    assert.strictEqual(services.status, 200);
    assert.strictEqual(services.data.success, true);
    assert(Array.isArray(services.data.data), 'Expected array of services');
    assert(services.data.data.length >= 6, 'Expected at least 6 dental services');
    const implantService = services.data.data.find(s => s.slug === 'dental-implants');
    assert(implantService, 'Expected dental-implants service');
    console.log(`  ✅ Passed: Retrieved ${services.data.data.length} services\n`);

    // Test 3: Doctors listing
    console.log('Test 3: Fetch active doctors GET /api/doctors');
    const doctors = await makeRequest('GET', '/api/doctors');
    assert.strictEqual(doctors.status, 200);
    assert.strictEqual(doctors.data.success, true);
    assert(Array.isArray(doctors.data.data), 'Expected array of doctors');
    assert(doctors.data.data.length >= 4, 'Expected at least 4 doctors');
    console.log(`  ✅ Passed: Retrieved ${doctors.data.data.length} doctors\n`);

    // Test 4: Appointment Validation
    console.log('Test 4: Appointment validation fails with 400 on empty fields');
    const invalidApt = await makeRequest('POST', '/api/appointments', {
      patient_name: '',
      patient_email: 'not-an-email'
    });
    assert.strictEqual(invalidApt.status, 400);
    assert.strictEqual(invalidApt.data.success, false);
    assert(Array.isArray(invalidApt.data.details), 'Expected validation details');
    console.log('  ✅ Passed: Validation prevented invalid appointment\n');

    // Test 5: Successful Appointment Creation
    console.log('Test 5: Create valid appointment POST /api/appointments');
    const targetService = services.data.data[0];
    const targetDoctor = doctors.data.data[0];
    const futureDate = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];

    const validApt = await makeRequest('POST', '/api/appointments', {
      patient_name: 'Jessica Alba',
      patient_email: 'jessica.a@example.com',
      patient_phone: '+1 (555) 912-3456',
      service_id: targetService.id,
      doctor_id: targetDoctor.id,
      appointment_date: futureDate,
      appointment_time: '14:30',
      notes: 'Routine checkup and laser whitening consultation.'
    });

    assert.strictEqual(validApt.status, 201);
    assert.strictEqual(validApt.data.success, true);
    assert(validApt.data.data.id, 'Expected generated UUID');
    assert.strictEqual(validApt.data.data.status, 'Pending');
    const createdId = validApt.data.data.id;
    console.log(`  ✅ Passed: Appointment created with ID ${createdId}\n`);

    // Test 6: Admin Status Update
    console.log('Test 6: Admin update appointment status PATCH /api/admin/appointments/:id/status');
    const statusUpdate = await makeRequest('PATCH', `/api/admin/appointments/${createdId}/status`, {
      status: 'Confirmed'
    });
    assert.strictEqual(statusUpdate.status, 200);
    assert.strictEqual(statusUpdate.data.success, true);
    assert.strictEqual(statusUpdate.data.data.status, 'Confirmed');
    console.log('  ✅ Passed: Appointment status updated to Confirmed\n');

    // Test 7: Inquiry Submission
    console.log('Test 7: Submit patient inquiry POST /api/inquiries');
    const inq = await makeRequest('POST', '/api/inquiries', {
      full_name: 'Robert Downey',
      email: 'robert@example.com',
      phone: '+1 (555) 432-1098',
      subject: 'Invisalign Timeline',
      message: 'What is the average treatment length for mild adult teeth alignment?'
    });
    assert.strictEqual(inq.status, 201);
    assert.strictEqual(inq.data.success, true);
    assert(inq.data.data.id, 'Expected inquiry id');
    const inqId = inq.data.data.id;
    console.log(`  ✅ Passed: Inquiry created with ID ${inqId}\n`);

    // Test 8: Admin Inquiry Resolution
    console.log('Test 8: Admin toggle inquiry resolve PATCH /api/admin/inquiries/:id/resolve');
    const inqResolve = await makeRequest('PATCH', `/api/admin/inquiries/${inqId}/resolve`, {
      is_resolved: true
    });
    assert.strictEqual(inqResolve.status, 200);
    assert.strictEqual(inqResolve.data.data.is_resolved, true);
    console.log('  ✅ Passed: Inquiry marked as resolved\n');

    // Test 9: Admin Analytics Overview
    console.log('Test 9: Admin analytics overview GET /api/admin/analytics');
    const analytics = await makeRequest('GET', '/api/admin/analytics');
    assert.strictEqual(analytics.status, 200);
    assert.strictEqual(analytics.data.success, true);
    assert(analytics.data.data.summary.totalAppointments >= 4, 'Expected total appointments metric');
    assert(analytics.data.data.summary.confirmedAppointments >= 1, 'Expected confirmed metric');
    console.log('  ✅ Passed: Analytics returned with summary stats\n');

    console.log('🎉 ALL 9 TEST SUITES PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('❌ Test failed with error:', err);
  if (server) server.close();
  process.exit(1);
});
