import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';
import fs from 'fs';

// Get database path
const dbPath = path.join(os.homedir(), '.notesmaker', 'tasks.db');
const deviceIdPath = path.join(os.homedir(), '.notesmaker', 'device-id.txt');

console.log('Database path:', dbPath);
console.log('DeviceId file path:', deviceIdPath);

if (!fs.existsSync(dbPath)) {
  console.log('❌ Database not found');
  process.exit(1);
}

const db = new Database(dbPath);

// Get current deviceId from file
let currentDeviceId = null;
if (fs.existsSync(deviceIdPath)) {
  currentDeviceId = fs.readFileSync(deviceIdPath, 'utf8').trim();
  console.log('✅ Current deviceId from file:', currentDeviceId);
} else {
  console.log('❌ No deviceId file found');
}

// Show all notes and their deviceIds
const allNotes = db.prepare('SELECT id, device_id, title, folder, CASE WHEN length(content) > 50 THEN substr(content, 1, 50) || "..." ELSE content END as content_preview FROM notes ORDER BY updated_at DESC').all();

console.log('\n📋 All notes in database:');
console.log('═══════════════════════════════════════════════════════════');
allNotes.forEach(note => {
  const isCurrent = note.device_id === currentDeviceId ? '✅' : '❌';
  console.log(`${isCurrent} ID: ${note.id} | DeviceId: ${note.device_id} | Title: ${note.title} | Folder: ${note.folder}`);
  console.log(`   Preview: ${note.content_preview}`);
  console.log('-----------------------------------------------------------');
});

// Get unique deviceIds
const deviceIds = db.prepare('SELECT DISTINCT device_id FROM notes').all();
console.log('\n🔑 Unique deviceIds found:', deviceIds.length);
deviceIds.forEach(d => {
  const count = db.prepare('SELECT COUNT(*) as count FROM notes WHERE device_id = ?').get(d.device_id).count;
  const isCurrent = d.device_id === currentDeviceId ? '✅ CURRENT' : '❌ OLD';
  console.log(`${isCurrent} ${d.device_id}: ${count} notes`);
});

// Ask if user wants to migrate
console.log('\n\n💡 TO RECOVER YOUR NOTES:');
console.log('Run this command to migrate all notes to current deviceId:\n');
console.log(`node recover-notes.js migrate "${currentDeviceId}"`);

// If migrate argument provided
if (process.argv[2] === 'migrate' && process.argv[3]) {
  const targetDeviceId = process.argv[3];
  console.log('\n\n🔄 MIGRATING all notes to deviceId:', targetDeviceId);
  
  const result = db.prepare('UPDATE notes SET device_id = ?').run(targetDeviceId);
  console.log('✅ Migrated', result.changes, 'notes');
  
  // Verify
  const check = db.prepare('SELECT COUNT(*) as count FROM notes WHERE device_id = ?').get(targetDeviceId).count;
  console.log('✅ Total notes now with deviceId', targetDeviceId, ':', check);
  
  // Force WAL checkpoint
  db.pragma('wal_checkpoint(FULL)');
  console.log('✅ Database checkpoint complete');
  console.log('\n🎉 Migration complete! Restart your app to see all notes.');
}

db.close();
