import db from '../Db/database.js';

class Note {
  static getAllByDevice(deviceId) {
    const stmt = db.prepare('SELECT * FROM notes WHERE device_id = ? ORDER BY updated_at DESC');
    return stmt.all(deviceId);
  }

  static getByFolder(deviceId, folder) {
    const stmt = db.prepare('SELECT * FROM notes WHERE device_id = ? AND folder = ? ORDER BY updated_at DESC');
    return stmt.all(deviceId, folder);
  }

  static create(deviceId, title, content, folder) {
    const stmt = db.prepare(`
      INSERT INTO notes (device_id, title, content, folder)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(deviceId, title || 'Untitled Note', content || '', folder || 'Notes');
    return this.getById(result.lastInsertRowid);
  }

  static getById(id) {
    const stmt = db.prepare('SELECT * FROM notes WHERE id = ?');
    return stmt.get(id);
  }

  static update(id, deviceId, data) {
    const { title, content, folder } = data;
    const stmt = db.prepare(`
      UPDATE notes 
      SET title = COALESCE(?, title),
          content = COALESCE(?, content),
          folder = COALESCE(?, folder),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND device_id = ?
    `);
    stmt.run(title, content, folder, id, deviceId);
    return this.getById(id);
  }

  static delete(id, deviceId) {
    const stmt = db.prepare('DELETE FROM notes WHERE id = ? AND device_id = ?');
    return stmt.run(id, deviceId);
  }

  static getStats(deviceId) {
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT folder) as folders
      FROM notes 
      WHERE device_id = ?
    `);
    return stmt.get(deviceId);
  }

  static getFolders(deviceId) {
    const stmt = db.prepare(`
      SELECT folder, COUNT(*) as count 
      FROM notes 
      WHERE device_id = ? 
      GROUP BY folder 
      ORDER BY folder
    `);
    return stmt.all(deviceId);
  }
}

export default Note;
