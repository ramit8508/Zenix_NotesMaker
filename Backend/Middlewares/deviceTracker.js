import { v4 as uuidv4 } from 'uuid';
import Device from '../Models/Device.js';

export const deviceTracker = (req, res, next) => {
  // Get device ID from cookie or create new one
  let deviceId = req.cookies?.deviceId;
  
  console.log('deviceTracker - cookies:', req.cookies);
  console.log('deviceTracker - existing deviceId from cookie:', deviceId);
  
  if (!deviceId) {
    deviceId = uuidv4();
    console.log('deviceTracker - NEW deviceId generated:', deviceId);
    // Set cookie for 10 years (effectively permanent for desktop app)
    res.cookie('deviceId', deviceId, {
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false, // Disable secure flag for development/Electron
      sameSite: 'lax' // Changed from 'strict' to 'lax' for better compatibility
    });
  } else {
    console.log('deviceTracker - USING existing deviceId:', deviceId);
  }

  // Find or create device in database
  Device.findOrCreate(deviceId);
  
  // Attach deviceId to request
  req.deviceId = deviceId;
  console.log('deviceTracker - deviceId attached to request:', req.deviceId);
  
  next();
};
