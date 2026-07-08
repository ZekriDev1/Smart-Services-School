/**
 * SMARTSERVICES Schools - Auth Controller
 */

const authService = require('../services/auth.service');
const logger = require('../utils/logger');

class AuthController {
  async signup(req, res, next) {
    try {
      const { email, password, fullName, schoolName, phone } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
      }

      const result = await authService.signup(email, password, { fullName, schoolName, phone });
      return res.status(201).json({
        success: true,
        message: 'Registration successful! Check your email to confirm.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
      }

      const result = await authService.login(email, password);
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.split(' ')[1] : null;
      
      if (token) {
        await authService.logout(token);
      }
      return res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await authService.getProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ success: false, error: 'User profile not found' });
      }

      return res.status(200).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { fullName, schoolName, phone, avatarUrl } = req.body;
      
      const updated = await authService.updateProfile(userId, { fullName, schoolName, phone, avatarUrl });
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
