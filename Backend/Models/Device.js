import db from '../Db/database.js';

class Device {
  static findOrCreate(deviceId) {
    console.log('Device.findOrCreate - deviceId:', deviceId);
    // Check if device exists
    let device = this.findById(deviceId);
    
    if (!device) {
      console.log('Device not found, creating new device');
      // Create new device
      const stmt = db.prepare('INSERT INTO devices (device_id) VALUES (?)');
      stmt.run(deviceId);
      device = this.findById(deviceId);
      console.log('Device created:', device);
    } else {
      console.log('Device found:', device);
      // Update last accessed
      const updateStmt = db.prepare('UPDATE devices SET last_accessed = CURRENT_TIMESTAMP WHERE device_id = ?');
      updateStmt.run(deviceId);
      console.log('Device last_accessed updated');
    }
    
    return device;
  }

  static findById(deviceId) {
    const stmt = db.prepare('SELECT * FROM devices WHERE device_id = ?');
    return stmt.get(deviceId);
  }
}

export default Device;
