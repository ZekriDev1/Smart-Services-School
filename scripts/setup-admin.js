/**
 * SMARTSERVICES Schools - Admin Setup Script
 * 
 * Auto-creates the admin user from .env credentials.
 * Run this after the migration: node scripts/setup-admin.js
 * 
 * The credentials are read from .env:
 *   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@smartservices.ma';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'G12345678';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Super Admin';

async function setupAdmin() {
  console.log('🔧 SMARTSERVICES Schools - Admin Setup');
  console.log('=====================================');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // 1. Check if admin already exists in Auth
    console.log(`\n📧 Checking admin email: ${ADMIN_EMAIL}`);
    
    // Try to sign in first to check if user exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (signInData?.user) {
      console.log('✅ Admin user found in Auth (already exists)');
      
      // Update profile role to admin
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          role: 'admin', 
          account_status: 'active',
          full_name: ADMIN_NAME 
        })
        .eq('id', signInData.user.id);

      if (updateError) {
        console.log('⚠️  Could not update profile in users table:', updateError.message);
        console.log('   The user exists in Auth but may need the SQL migration first.');
      } else {
        console.log('✅ Admin role set in database');
      }
    } else {
      console.log('👤 Admin not found in Auth. Attempting to create...');
      
      // Sign up the admin user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: {
          data: {
            full_name: ADMIN_NAME,
            role: 'admin'
          }
        }
      });

      if (signUpError) {
        // If signup fails because user exists, try to prompt password reset
        if (signUpError.message?.includes('already registered') || 
            signUpError.message?.includes('User already')) {
          console.log('⚠️  User already registered in Auth but password may differ.');
          console.log('   Reset password at: https://supabase.com/dashboard/project/' + 
                     SUPABASE_URL.match(/https:\/\/(.+)\.supabase/)?.[1] + 
                     '/auth/users');
        } else {
          throw signUpError;
        }
      } else if (signUpData?.user) {
        console.log('✅ Admin user created in Auth!');
        
        // Update the profile with admin role
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: signUpData.user.id,
            email: ADMIN_EMAIL,
            full_name: ADMIN_NAME,
            role: 'admin',
            account_status: 'active'
          }, { onConflict: 'id' });

        if (profileError) {
          console.log('⚠️  Profile update warning:', profileError.message);
          console.log('   Run the SQL migration to fix this.');
        } else {
          console.log('✅ Admin profile created in database');
        }
      }
    }

    console.log('\n=====================================');
    console.log('✅ Setup complete!');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   URL:      http://localhost:3000/admin/`);
    console.log('=====================================\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nManual steps:');
    console.error('1. Go to Supabase Dashboard → Authentication → Users');
    console.error('2. Create user with:');
    console.error(`   Email: ${ADMIN_EMAIL}`);
    console.error(`   Password: ${ADMIN_PASSWORD}`);
    console.error('3. Run this SQL:');
    console.error(`   UPDATE public.users SET role = 'admin', account_status = 'active' WHERE email = '${ADMIN_EMAIL}';`);
    process.exit(1);
  }
}

setupAdmin();