import { v4 as uuidv4 } from 'uuid';
import Device from '../Models/Device.js';

export const deviceTracker = (req, res, next) => {
  // Get device ID from cookie or create new one
  let deviceId = req.cookies?.deviceId;
  
  if (!deviceId) {
    deviceId = uuidv4();
    // Set cookie for 10 years (effectively permanent for desktop app)
    res.cookie('deviceId', deviceId, {
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  // Find or create device in database
  Device.findOrCreate(deviceId);
  
  // Attach deviceId to request
  req.deviceId = deviceId;
  
  next();
};
