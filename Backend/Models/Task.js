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

  static getCustomFolders(deviceId) {
    const stmt = db.prepare(`
      SELECT name as folder, 0 as count
      FROM folders 
      WHERE device_id = ?
      ORDER BY name
    `);
    return stmt.all(deviceId);
  }

  static createFolder(deviceId, folderName) {
    try {
      const stmt = db.prepare(`
        INSERT INTO folders (device_id, name)
        VALUES (?, ?)
      `);
      stmt.run(deviceId, folderName);
      return { folder: folderName, count: 0 };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint')) {
        throw new Error('Folder already exists');
      }
      throw error;
    }
  }

  static renameFolder(deviceId, oldName, newName) {
    // Update folder name in custom folders table
    const stmt1 = db.prepare(`
      UPDATE folders 
      SET name = ?
      WHERE device_id = ? AND name = ?
    `);
    stmt1.run(newName, deviceId, oldName);

    // Update all notes with this folder
    const stmt2 = db.prepare(`
      UPDATE notes 
      SET folder = ?
      WHERE device_id = ? AND folder = ?
    `);
    stmt2.run(newName, deviceId, oldName);
    return true;
  }

  static deleteFolder(deviceId, folderName) {
    // Delete from custom folders table
    const stmt1 = db.prepare(`
      DELETE FROM folders 
      WHERE device_id = ? AND name = ?
    `);
    stmt1.run(deviceId, folderName);

    // Move notes to 'Personal' folder
    const stmt2 = db.prepare(`
      UPDATE notes 
      SET folder = 'Personal'
      WHERE device_id = ? AND folder = ?
    `);
    stmt2.run(deviceId, folderName);
    return true;
  }
}

export default Note;
