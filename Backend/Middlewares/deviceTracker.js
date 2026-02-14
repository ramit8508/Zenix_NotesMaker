import { v4 as uuidv4 } from 'uuid';
import Device from '../Models/Device.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Get persistent storage path for deviceId
const getDeviceIdPath = () => {
  const userDataDir = path.join(os.homedir(), '.notesmaker');
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }
  return path.join(userDataDir, 'device-id.txt');
};

// Read deviceId from file
const readDeviceIdFromFile = () => {
  try {
    const filePath = getDeviceIdPath();
    if (fs.existsSync(filePath)) {
      const deviceId = fs.readFileSync(filePath, 'utf8').trim();
      console.log('📱 Read deviceId from file:', deviceId);
      return deviceId;
    }
  } catch (error) {
    console.error('Error reading deviceId from file:', error);
  }
  return null;
};

// Write deviceId to file
const writeDeviceIdToFile = (deviceId) => {
  try {
    const filePath = getDeviceIdPath();
    fs.writeFileSync(filePath, deviceId, 'utf8');
    console.log('💾 Saved deviceId to file:', filePath);
  } catch (error) {
    console.error('Error writing deviceId to file:', error);
  }
};

export const deviceTracker = (req, res, next) => {
  // Try to get deviceId from file first (most reliable)
  let deviceId = readDeviceIdFromFile();
  
  // Fallback to cookie if file doesn't exist
  if (!deviceId) {
    deviceId = req.cookies?.deviceId;
    console.log('📱 deviceId from cookie:', deviceId);
  }
  
  if (!deviceId) {
    deviceId = uuidv4();
    console.log('🆕 NEW deviceId generated:', deviceId);
    // Save to file for persistence
    writeDeviceIdToFile(deviceId);
    
    // Also set cookie as backup
    res.cookie('deviceId', deviceId, {
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    });
  } else {
    console.log('✅ USING existing deviceId:', deviceId);
    // Make sure it's saved to file
    if (!fs.existsSync(getDeviceIdPath())) {
      writeDeviceIdToFile(deviceId);
    }
  }

  // Find or create device in database
  Device.findOrCreate(deviceId);
  
  // Attach deviceId to request
  req.deviceId = deviceId;
  console.log('📎 deviceId attached to request:', req.deviceId);
  
  next();
};
