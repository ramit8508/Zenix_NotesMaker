# Task Notepad - Linux Desktop App

A beautiful task management desktop application with offline SQLite database and automatic device tracking.

## Features

✨ **Key Features:**
- 📝 Create, edit, and manage tasks
- 📅 Schedule tasks with date/time
- ✅ Mark tasks as complete
- 📊 Real-time statistics (Active, Scheduled, Completed)
- 💾 Offline SQLite database
- 🔒 Automatic device tracking (no login required)
- 🎨 Modern dark UI design
- 🔐 Secure with proxy configuration

## Tech Stack

**Backend:**
- Node.js + Express
- SQLite3 with better-sqlite3
- Cookie-based device tracking
- CORS enabled

**Frontend:**
- React 19
- Vite
- Lucide React icons
- Proxy-secured API calls

## Installation

### 1. Install Dependencies

**Backend:**
```bash
cd Backend
npm install
```

**Frontend:**
```bash
cd Frontend
npm install
```

### 2. Start the Application

**Terminal 1 - Start Backend:**
```bash
cd Backend
npm start
```

**Terminal 2 - Start Frontend:**
```bash
cd Frontend
npm run dev
```

The app will be available at `http://localhost:5173`

## How It Works

### Auto Device Tracking
- No login/signup required
- Automatic device identification using UUID
- Data persists across sessions via cookies
- Each device has its own isolated task list

### Database
- SQLite database stored in `Backend/tasks.db`
- Automatic table creation on first run
- Two tables: `devices` and `tasks`

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks for current device |
| GET | `/api/tasks/stats` | Get task statistics |
| GET | `/api/tasks/status/:status` | Get tasks by status |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

## Project Structure

```
Backend/
├── App.js              # Express app configuration
├── Index.js            # Server entry point
├── Constant.js         # Configuration constants
├── Controllers/
│   └── taskController.js
├── Db/
│   └── database.js     # SQLite setup
├── Middlewares/
│   └── deviceTracker.js
├── Models/
│   ├── Task.js
│   └── Device.js
└── Routes/
    └── taskRoutes.js

Frontend/
├── src/
│   ├── App.jsx         # Main component
│   ├── App.css         # Styles
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
└── vite.config.js      # Proxy configuration
```

## Security Features

- HTTP-only cookies for device tracking
- CORS configured for localhost
- Secure cookies in production
- SameSite cookie policy
- Proxy-secured API calls via Vite

## Usage

1. **Add Task:** Enter title and optional details, click "Add Task"
2. **Schedule Task:** Click "Schedule" button to set date/time
3. **Complete Task:** Click checkbox to mark as complete
4. **Delete Task:** Click trash icon to remove
5. **Filter Tasks:** Use tabs to filter by All, Active, Scheduled, or Completed

## Development Scripts

**Backend:**
- `npm start` - Start server
- `npm run dev` - Start with auto-reload (Node --watch)

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Building for Linux Desktop

To package as a Linux desktop app, you can use Electron or Tauri:

### Option 1: Electron
```bash
npm install -g electron
# Configure electron-builder for Linux packaging
```

### Option 2: Tauri (Recommended for Linux)
```bash
npm install -g @tauri-apps/cli
# Configure Tauri for Linux
```

## License

MIT

## Author

Built for Linux desktop environments with ❤️
