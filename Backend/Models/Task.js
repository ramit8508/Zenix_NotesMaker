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
    console.log('Note created with ID:', result.lastInsertRowid);
    // Force WAL checkpoint to write to database file
    db.pragma('wal_checkpoint(FULL)');
    return this.getById(result.lastInsertRowid);
  }

  static getById(id) {
    const stmt = db.prepare('SELECT * FROM notes WHERE id = ?');
    return stmt.get(id);
  }

  static update(id, deviceId, data) {
    const { title, content, folder } = data;
    console.log('📝 Task.update called:', {
      id,
      deviceId,
      title,
      contentLength: content?.length || 0,
      folder
    });
    
    const stmt = db.prepare(`
      UPDATE notes 
      SET title = COALESCE(?, title),
          content = COALESCE(?, content),
          folder = COALESCE(?, folder),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND device_id = ?
    `);
    const result = stmt.run(title, content, folder, id, deviceId);
    console.log('📊 Update result - changes:', result.changes);
    
    if (result.changes === 0) {
      console.log('⚠️ No rows updated! Checking if note exists...');
      const checkStmt = db.prepare('SELECT id, device_id FROM notes WHERE id = ?');
      const existingNote = checkStmt.get(id);
      if (existingNote) {
        console.log('❌ Note exists but device_id mismatch:', {
          requested: deviceId,
          actual: existingNote.device_id
        });
      } else {
        console.log('❌ Note does not exist with ID:', id);
      }
    }
    
    // Force WAL checkpoint to write to database file
    console.log('💾 Running WAL checkpoint...');
    const checkpoint = db.pragma('wal_checkpoint(FULL)');
    console.log('✅ WAL checkpoint result:', checkpoint);
    
    const updated = this.getById(id);
    console.log('📄 Updated note:', updated ? { id: updated.id, title: updated.title, contentLength: updated.content?.length } : 'NOT FOUND');
    return updated;
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
    console.log('Note.renameFolder - deviceId:', deviceId, 'oldName:', oldName, 'newName:', newName);
    
    // Update folder name in custom folders table
    const stmt1 = db.prepare(`
      UPDATE folders 
      SET name = ?
      WHERE device_id = ? AND name = ?
    `);
    const result1 = stmt1.run(newName, deviceId, oldName);
    console.log('Updated folders table, changes:', result1.changes);

    // Update all notes with this folder
    const stmt2 = db.prepare(`
      UPDATE notes 
      SET folder = ?
      WHERE device_id = ? AND folder = ?
    `);
    const result2 = stmt2.run(newName, deviceId, oldName);
    console.log('Updated notes table, changes:', result2.changes);
    
    // Force WAL checkpoint to write to database file
    db.pragma('wal_checkpoint(FULL)');
    console.log('Database checkpoint completed');
    
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
