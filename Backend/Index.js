import app from './App.js';
import { PORT } from './Constant.js';

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Notes Maker Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📁 API endpoint: http://localhost:${PORT}/api`);
  console.log(`✅ Backend ready!`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use!`);
    process.exit(1);
  }
});
