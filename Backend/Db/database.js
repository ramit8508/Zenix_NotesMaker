import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine database path based on environment
let dbPath;
if (process.env.IS_PACKAGED === 'true') {
  // In packaged app, use user data directory (writable location)
  const userDataDir = path.join(os.homedir(), '.notesmaker');
  console.log('📁 Creating user data directory:', userDataDir);
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
    console.log('✅ Directory created');
  } else {
    console.log('✅ Directory already exists');
  }
  dbPath = path.join(userDataDir, 'tasks.db');
  console.log('📁 Database path:', dbPath);
  console.log('📁 Database exists?', fs.existsSync(dbPath));
} else {
  // In development, use local directory
  dbPath = path.join(__dirname, 'tasks.db');
  console.log('📁 Development database path:', dbPath);
}

console.log('🔧 Opening database...');
const db = new Database(dbPath);
console.log('✅ Database opened successfully');
console.log('📊 Database info:', {
  path: dbPath,
  readonly: db.readonly,
  inTransaction: db.inTransaction,
  open: db.open
});

// Enable WAL mode for better concurrency and durability
const walMode = db.pragma('journal_mode = WAL', { simple: true });
const syncMode = db.pragma('synchronous = FULL', { simple: true });
console.log('💾 Database mode:', { journalMode: walMode, synchronous: syncMode });
// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTables = () => {
  // Device table for auto-remembering
  db.exec(`
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      folder TEXT DEFAULT 'Notes',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
    )
  `);

  // Folders table for custom folders
  db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(device_id, name),
      FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Database tables created successfully');
};

createTables();

export default db;
