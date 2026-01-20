import db from '../Db/database.js';

class Device {
  static findOrCreate(deviceId) {
    // Check if device exists
    let device = this.findById(deviceId);
    
    if (!device) {
      // Create new device
      const stmt = db.prepare('INSERT INTO devices (device_id) VALUES (?)');
      stmt.run(deviceId);
      device = this.findById(deviceId);
    } else {
      // Update last accessed
      const updateStmt = db.prepare('UPDATE devices SET last_accessed = CURRENT_TIMESTAMP WHERE device_id = ?');
      updateStmt.run(deviceId);
    }
    
    return device;
  }

  static findById(deviceId) {
    const stmt = db.prepare('SELECT * FROM devices WHERE device_id = ?');
    return stmt.get(deviceId);
  }
}

export default Device;
