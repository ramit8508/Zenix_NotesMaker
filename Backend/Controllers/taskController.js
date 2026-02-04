import Note from '../Models/Task.js';

export const getNotes = (req, res) => {
  try {
    const notes = Note.getAllByDevice(req.deviceId);
    res.json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getNotesByFolder = (req, res) => {
  try {
    const { folder } = req.params;
    const notes = Note.getByFolder(req.deviceId, folder);
    res.json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getNoteStats = (req, res) => {
  try {
    const stats = Note.getStats(req.deviceId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getFolders = (req, res) => {
  try {
    // Get folders from notes (with counts)
    const noteFolders = Note.getFolders(req.deviceId);
    // Get custom folders (empty folders)
    const customFolders = Note.getCustomFolders(req.deviceId);
    
    // Merge and deduplicate
    const folderMap = new Map();
    noteFolders.forEach(f => folderMap.set(f.folder, f.count));
    customFolders.forEach(f => {
      if (!folderMap.has(f.folder)) {
        folderMap.set(f.folder, 0);
      }
    });
    
    const folders = Array.from(folderMap, ([folder, count]) => ({ folder, count }));
    res.json({ success: true, data: folders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createFolder = (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Folder name is required' });
    }
    const folder = Note.createFolder(req.deviceId, name.trim());
    res.status(201).json({ success: true, data: folder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const renameFolder = (req, res) => {
  try {
    const { oldName } = req.params;
    const { newName } = req.body;
    if (!newName || !newName.trim()) {
      return res.status(400).json({ success: false, error: 'New folder name is required' });
    }
    Note.renameFolder(req.deviceId, oldName, newName.trim());
    res.json({ success: true, message: 'Folder renamed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteFolder = (req, res) => {
  try {
    const { name } = req.params;
    Note.deleteFolder(req.deviceId, name);
    res.json({ success: true, message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createNote = (req, res) => {
  try {
    const { title, content, folder } = req.body;

    const note = Note.create(req.deviceId, title, content, folder);
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateNote = (req, res) => {
  try {
    const { id } = req.params;
    const note = Note.update(id, req.deviceId, req.body);
    
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    res.json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteNote = (req, res) => {
  try {
    const { id } = req.params;
    const result = Note.delete(id, req.deviceId);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
