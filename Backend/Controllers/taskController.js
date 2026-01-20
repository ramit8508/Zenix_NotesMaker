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
    const folders = Note.getFolders(req.deviceId);
    res.json({ success: true, data: folders });
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
