/**
 * SMARTSERVICES Schools - Create Storage Bucket Script
 * Run: node scripts/create-bucket.js
 *
 * This creates the "quotations" bucket in Supabase Storage.
 * Uses the Supabase Management API which requires the service_role key.
 *
 * Find your service_role key at:
 * Supabase Dashboard → Project Settings → API → service_role key
 */

const https = require('https');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ SUPABASE_URL or SUPABASE_ANON_KEY not found in .env');
  process.exit(1);
}

const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${projectRef}.supabase.co`,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function createBucket() {
  console.log('🚀 Creating "quotations" storage bucket...');
  console.log(`📁 Project: ${projectRef}`);
  console.log('');

  // Try using the Management API to create bucket (via POST to /storage/v1/bucket)
  const result = await makeRequest('POST', '/storage/v1/bucket', {
    id: 'quotations',
    name: 'quotations',
    public: true,
    file_size_limit: 10485760,
    allowed_mime_types: ['application/pdf']
  });

  if (result.status === 200 || result.status === 201) {
    console.log('✅ Bucket "quotations" created successfully!');
  } else if (result.status === 409 || result.status === 400) {
    console.log('✅ Bucket "quotations" already exists (or similar).');
  } else {
    console.log(`⚠️  API response (${result.status}):`, JSON.stringify(result.data));

    // Fallback: Try Supabase Management API using SQL
    console.log('');
    console.log('🔄 Trying alternative method via Supabase SQL API...');

    // Use the REST API to call the storage.functions
    const sqlResult = await makeRequest('POST', '/rest/v1/rpc/', {
      sql: `SELECT storage.create_bucket('quotations', '{"public": true, "file_size_limit": 10485760, "allowed_mime_types": ["application/pdf"]}')`
    });

    if (sqlResult.status === 200) {
      console.log('✅ Bucket created via SQL API!');
    } else {
      console.log(`⚠️  SQL API response: ${sqlResult.status}`);
    }
  }

  // Verify
  const { data: buckets } = await new Promise(resolve => {
    const options = {
      hostname: `${projectRef}.supabase.co`,
      path: '/storage/v1/bucket',
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ data: JSON.parse(data) }); }
        catch { resolve({ data: [] }); }
      });
    });
    req.on('error', () => resolve({ data: [] }));
    req.end();
  });

  const found = buckets?.find(b => b.name === 'quotations');
  if (found) {
    console.log(`✅ Bucket verified: id=${found.id}, public=${found.public}`);
  } else {
    console.log('');
    console.log('⚠️  Could not verify bucket via API.');
    console.log('');
    console.log('📋 Try this instead:');
    console.log('   1. Go to Supabase Dashboard → SQL Editor');
    console.log('   2. Run this SQL:');
    console.log('');
    console.log("   INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)");
    console.log("   VALUES ('quotations', 'quotations', true, 10485760, ARRAY['application/pdf']::text[]);");
    console.log('');
    console.log('   Then create a policy:');
    console.log("   CREATE POLICY \"public_read\" ON storage.objects FOR SELECT USING (bucket_id = 'quotations');");
    console.log("   CREATE POLICY \"auth_upload\" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'quotations');");
    process.exit(0);
  }

  console.log('\n🎉 Bucket setup complete! The "quotations" bucket is ready for use.');
  console.log('📝 You should now be able to upload quote PDFs from the admin panel.');
}

createBucket().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});