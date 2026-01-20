import app from './App.js';
import { PORT } from './Constant.js';

app.listen(PORT, () => {
  console.log(`🚀 Notes Maker Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
