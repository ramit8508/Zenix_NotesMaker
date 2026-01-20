import db from '../Db/database.js';

/**
 * Execute a database query with error handling
 * @param {Function} queryFn - Database query function
 * @param {string} operation - Operation name for error logging
 * @returns {Object} Query result
 */
export const executeQuery = (queryFn, operation) => {
  try {
    return {
      success: true,
      data: queryFn()
    };
  } catch (error) {
    console.error(`Error in ${operation}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Backup database to a file
 * @param {string} backupPath - Path to backup file
 */
export const backupDatabase = (backupPath) => {
  const backup = db.backup(backupPath);
  return new Promise((resolve, reject) => {
    backup.on('finish', resolve);
    backup.on('error', reject);
  });
};

/**
 * Get database statistics
 * @returns {Object} Database stats
 */
export const getDatabaseStats = () => {
  const deviceCount = db.prepare('SELECT COUNT(*) as count FROM devices').get();
  const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
  
  return {
    devices: deviceCount.count,
    tasks: taskCount.count
  };
};

/**
 * Clean up old completed tasks
 * @param {number} daysOld - Delete tasks completed more than this many days ago
 * @returns {number} Number of deleted tasks
 */
export const cleanupOldTasks = (daysOld = 30) => {
  const stmt = db.prepare(`
    DELETE FROM tasks 
    WHERE status = 'completed' 
    AND updated_at < datetime('now', '-${daysOld} days')
  `);
  const result = stmt.run();
  return result.changes;
};
