/**
 * SMARTSERVICES Schools - Auth Service
 */

const { supabase } = require('../config/db');
const userRepository = require('../repositories/user.repository');
const logger = require('../utils/logger');

class AuthService {
  async signup(email, password, profileData) {
    logger.info(`Signing up new user with email: ${email}`);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: profileData.fullName || '',
          school_name: profileData.schoolName || '',
          phone: profileData.phone || ''
        }
      }
    });

    if (error) {
      logger.warn(`Signup failed for ${email}: ${error.message}`);
      throw error;
    }

    return {
      user: data.user,
      session: data.session
    };
  }

  async login(email, password) {
    logger.info(`Logging in user: ${email}`);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      logger.warn(`Login failed for ${email}: ${error.message}`);
      throw error;
    }

    // Resolve profile details from DB
    const profile = await userRepository.findById(data.user.id);

     return {
       session: {
         access_token: data.session.access_token,
         refresh_token: data.session.refresh_token,
         expires_at: data.session.expires_at
       },
       user: profile || {
         id: data.user.id,
         email: data.user.email
       }
     };
   }

  async logout(token) {
    logger.info(`Logging out session`);
    const { error } = await supabase.auth.signOut(token);
    if (error) throw error;
    return true;
  }

  async getProfile(userId) {
    return userRepository.findById(userId);
  }

  async updateProfile(userId, profileData) {
    return userRepository.updateProfile(userId, profileData);
  }
}

module.exports = new AuthService();
