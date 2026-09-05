/**
 * Supabase Migration Checker & Diagnostic Script
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkSupabase() {
  console.log('\n--- Checking Supabase PostgreSQL Status ---');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.log('⚠️  No Supabase credentials in .env. System will use local high-fidelity database.');
    return;
  }

  console.log('Supabase URL:', url);
  const client = createClient(url, key);

  try {
    const { data, error } = await client.from('dental_services').select('count');
    if (error) {
      if (error.code === 'PGRST205') {
        console.log('\n❌ Supabase connected, but tables (dental_services, doctors, etc.) do not exist yet!');
        console.log('\n👉 Quick 1-minute Fix:');
        console.log('1. Go to: https://supabase.com/dashboard/project/' + url.split('//')[1].split('.')[0] + '/sql');
        console.log('2. Copy all SQL commands from: schema.sql');
        console.log('3. Paste into the Supabase SQL Editor and click "Run"');
        console.log('4. Once executed, your cloud database will be fully populated with all tables and seed records!\n');
      } else {
        console.log('Supabase response error:', error.message);
      }
    } else {
      console.log('✅ Supabase tables are ready and accessible!');
    }
  } catch (err) {
    console.error('Connection test error:', err.message);
  }
}

checkSupabase();
