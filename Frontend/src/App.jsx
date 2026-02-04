import { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Pen,
  Type,
  Eraser,
  Sun,
  Moon,
  Download,
  RotateCw,
  Move,
  Maximize2,
  Crop,
  FlipHorizontal,
  FlipVertical,
  Square,
  Circle,
  Minus,
  Triangle,
  ArrowUpRight,
  Diamond,
  Hexagon,
  Database,
  File,
  Sparkles
} from 'lucide-react';
import './App.css';
import { getApiUrl } from './config';

function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [stats, setStats] = useState({ total: 0, folders: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState('pen');
  const canvasRef = useRef(null);
  const [isDrawingOnCanvas, setIsDrawingOnCanvas] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef(null);
  const [theme, setTheme] = useState('dark');
  const contentEditableRef = useRef(null);
  const [penColor, setPenColor] = useState('#ffffff');
  const [penSize, setPenSize] = useState(2);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageTransform, setImageTransform] = useState({ rotation: 0, scale: 1 });
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [imageMenuPosition, setImageMenuPosition] = useState({ x: 0, y: 0 });
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(true);
  const [folderContextMenu, setFolderContextMenu] = useState(null);
  const [renamingFolder, setRenamingFolder] = useState(null);
  const [newFolderRename, setNewFolderRename] = useState('');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [draggedImage, setDraggedImage] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [cropMode, setCropMode] = useState(false);
  const [cropData, setCropData] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [shapeStartPos, setShapeStartPos] = useState(null);
  const [canvasSnapshot, setCanvasSnapshot] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
    fetchStats();
    fetchFolders();
    checkAiService();
    
    // App loading animation
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 1500);
    
    // AUTO-SAVE: Save content before closing the app
    const handleBeforeUnload = (e) => {
      if (selectedNote && contentEditableRef.current) {
        const currentContent = contentEditableRef.current.innerHTML;
        if (currentContent !== selectedNote.content) {
          // Save synchronously before closing
          navigator.sendBeacon(
            `/api/notes/${selectedNote.id}`,
            JSON.stringify({
              title: title || 'Untitled Note',
              content: currentContent
            })
          );
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (selectedNote) {
      // Save the previous note's content if it changed
      if (selectedNote.title !== title || selectedNote.content !== content) {
        const saveTimeout = setTimeout(() => {
          handleUpdateNote();
        }, 500);
        return () => clearTimeout(saveTimeout);
      }
    }
  }, [selectedNote]);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content || '');
      
      // If switching notes while in drawing mode, save the current canvas first
      if (isDrawing) {
        saveCanvasToContent();
        setIsDrawing(false);
      }
      
      // Update the contentEditable div when note changes
      if (contentEditableRef.current) {
        contentEditableRef.current.innerHTML = selectedNote.content || '';
        // Reattach image listeners after content loads
        setTimeout(() => attachImageListeners(), 100);
      }
    }
  }, [selectedNote?.id]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Set default pen color based on theme on initial load
    if (penColor === '#ffffff' && theme === 'light') {
      setPenColor('#000000');
    }
  }, [theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete key - delete selected note
      if (e.key === 'Delete' && selectedNote && !e.target.matches('input, textarea, [contenteditable="true"]')) {
        e.preventDefault();
        handleDeleteNote();
      }
      // Ctrl+S - save note
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && selectedNote) {
        e.preventDefault();
        handleSaveNote();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNote]);

  const checkAiService = async () => {
    try {
      const response = await fetch(getApiUrl('ai/health'), {
        credentials: 'include'
      });
      const data = await response.json();
      setAiAvailable(data.status === 'ok' && data.models_loaded);
    } catch (error) {
      setAiAvailable(false);
    }
  };

  const handleAiSummarize = async () => {
    if (!selectedNote) return;
    
    setAiLoading(true);
    setShowAiModal(true);
    setAiSummary(null);
    
    try {
      const response = await fetch(getApiUrl('ai/analyze-note'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: title,
          content: content
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAiSummary(data);
        setAiAvailable(true);
      } else if (data.loading) {
        setAiSummary({
          error: data.error,
          loading: true
        });
      } else if (data.need_install) {
        setAiSummary({
          error: data.error,
          need_install: true
        });
      } else {
        setAiSummary({
          error: data.error || 'Failed to generate summary'
        });
      }
    } catch (error) {
      setAiSummary({
        error: 'Could not connect to AI service. Please try again.'
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiAction = async (action) => {
    if (!selectedNote || !content) {
      alert('Please select a note with content first');
      return;
    }
    
    // For now, all actions will open the summarize modal
    // In the future, you can customize based on action type
    switch (action) {
      case 'summarize':
        await handleAiSummarize();
        break;
      case 'rewrite':
        // Future: Add rewrite functionality
        await handleAiSummarize();
        break;
      case 'explain':
        // Future: Add explain functionality
        await handleAiSummarize();
        break;
      default:
        break;
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    // Update pen color default when switching themes
    if (penColor === '#ffffff' || penColor === '#000000') {
      setPenColor(newTheme === 'dark' ? '#ffffff' : '#000000');
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch(getApiUrl('notes'), {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        console.log('Fetched notes:', data.data);
        setNotes(data.data);
        return data.data;
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
    return [];
  };
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(getApiUrl('notes/stats'), {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await fetch(getApiUrl('folders'), {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        let folderList = data.data || [];
        
        // Add default folders if they don't exist, calculate counts from notes array
        const defaultFolders = ['Work', 'Personal', 'Ideas', 'Projects'];
        const existingFolderNames = folderList.map(f => f.folder);
        
        defaultFolders.forEach(folderName => {
          if (!existingFolderNames.includes(folderName)) {
            // Calculate count from notes array
            const count = notes.filter(note => note.folder === folderName).length;
            folderList.push({ folder: folderName, count });
          }
        });
        
        // Sort folders: default folders first, then alphabetically
        folderList.sort((a, b) => {
          const aIsDefault = defaultFolders.includes(a.folder);
          const bIsDefault = defaultFolders.includes(b.folder);
          
          if (aIsDefault && !bIsDefault) return -1;
          if (!aIsDefault && bIsDefault) return 1;
          return a.folder.localeCompare(b.folder);
        });
        
        setFolders(folderList);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleNewNote = async () => {
    try {
      const response = await fetch(getApiUrl('notes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: 'Untitled Note',
          content: '',
          folder: selectedFolder || 'Personal'
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchNotes();
        await fetchStats();
        await fetchFolders();
        setSelectedNote(data.data);
        setTitle(data.data.title);
        setContent(data.data.content || '');
        if (contentEditableRef.current) {
          contentEditableRef.current.innerHTML = data.data.content || '';
        }
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    // Check for duplicates
    const folderExists = folders.some(f => f.folder.toLowerCase() === newFolderName.trim().toLowerCase());
    if (folderExists) {
      alert('A folder with this name already exists!');
      return;
    }
    
    try {
      const response = await fetch(getApiUrl('folders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: newFolderName.trim() }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchFolders();
        setNewFolderName('');
        setShowNewFolderInput(false);
      } else {
        alert(data.error || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder');
    }
  };

  const getFilteredNotes = () => {
    if (!selectedFolder) return notes;
    return notes.filter(note => note.folder === selectedFolder);
  };

  const groupNotesByDate = (notesToGroup) => {
    const groups = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    notesToGroup.forEach(note => {
      const noteDate = new Date(note.updated_at || note.created_at);
      noteDate.setHours(0, 0, 0, 0);
      
      let groupKey;
      if (noteDate.getTime() === today.getTime()) {
        groupKey = 'Today';
      } else if (noteDate.getTime() === yesterday.getTime()) {
        groupKey = 'Yesterday';
      } else if (noteDate > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        groupKey = 'This Week';
      } else if (noteDate.getMonth() === today.getMonth() && noteDate.getFullYear() === today.getFullYear()) {
        groupKey = 'This Month';
      } else {
        groupKey = noteDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(note);
    });
    
    return groups;
  };

  const getFolderIcon = (folderName) => {
    const icons = {
      'Work': '💼',
      'Personal': '🏠',
      'Ideas': '💡',
      'Projects': '🚀',
      'Archive': '📦',
      'Important': '⭐',
      'Notes': '📝',
      'Study': '📚',
      'Research': '🔬',
      'Meeting': '🤝',
      'Travel': '✈️',
      'Finance': '💰'
    };
    return icons[folderName] || '📁';
  };

  const handleFolderRightClick = (e, folder) => {
    e.preventDefault();
    setFolderContextMenu({
      x: e.clientX,
      y: e.clientY,
      folder: folder
    });
  };

  const handleRenameFolder = () => {
    if (!folderContextMenu) return;
    setRenamingFolder(folderContextMenu.folder);
    setNewFolderRename(folderContextMenu.folder.folder);
    setFolderContextMenu(null);
  };

  const confirmRenameFolder = async () => {
    if (!renamingFolder || !newFolderRename.trim()) {
      setRenamingFolder(null);
      return;
    }
    
    const oldName = renamingFolder.folder;
    const newName = newFolderRename.trim();
    
    if (oldName === newName) {
      setRenamingFolder(null);
      return;
    }
    
    try {
      const response = await fetch(getApiUrl(`folders/${encodeURIComponent(oldName)}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ newName }),
      });

      const data = await response.json();
      if (data.success) {
        // If this folder was selected, update selection
        if (selectedFolder === oldName) {
          setSelectedFolder(newName);
        }
        
        // Reset renaming state
        setRenamingFolder(null);
        setNewFolderRename('');
        await fetchNotes();
        await fetchFolders();
      } else {
        alert(data.error || 'Failed to rename folder');
      }
    } catch (error) {
      console.error('Error renaming folder:', error);
      alert('Failed to rename folder');
    }
  };

  const handleDeleteFolder = async () => {
    if (!folderContextMenu) return;
    
    const folderName = folderContextMenu.folder.folder;
    setFolderContextMenu(null);
    
    // Don't allow deletion of default folders
    const defaultFolders = ['Work', 'Personal', 'Ideas', 'Projects'];
    if (defaultFolders.includes(folderName)) {
      alert('Cannot delete default folders!');
      return;
    }
    
    if (!confirm(`Delete "${folderName}" folder? All notes will be moved to Personal.`)) {
      return;
    }
    
    try {
      const response = await fetch(getApiUrl(`folders/${encodeURIComponent(folderName)}`), {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        // Reset selection if this folder was selected
        if (selectedFolder === folderName) {
          setSelectedFolder(null);
        }
        
        await fetchNotes();
        await fetchFolders();
      } else {
        alert(data.error || 'Failed to delete folder');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      alert('Failed to delete folder');
    }
  };

  const handleCreateNoteInFolder = async () => {
    if (!folderContextMenu) return;
    
    const folderName = folderContextMenu.folder.folder;
    setFolderContextMenu(null);
    
    try {
      const response = await fetch(getApiUrl('notes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: 'Untitled Note',
          content: '',
          folder: folderName
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('Created note in folder:', folderName, data.data);
        
        // Force refresh everything and wait for completion
        const updatedNotes = await fetchNotes();
        await fetchStats();
        await fetchFolders();
        
        console.log('Updated notes:', updatedNotes);
        console.log('Setting folder to:', folderName);
        
        // Set folder and note selection immediately
        setSelectedFolder(folderName);
        
        // Find the created note in the updated notes list
        const createdNote = updatedNotes.find(n => n.id === data.data.id);
        if (createdNote) {
          setSelectedNote(createdNote);
          setTitle(createdNote.title);
          setContent(createdNote.content || '');
          if (contentEditableRef.current) {
            contentEditableRef.current.innerHTML = createdNote.content || '';
          }
        } else {
          console.error('Created note not found in updated notes list');
        }
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setFolderContextMenu(null);
    if (folderContextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [folderContextMenu]);

  // Close download menu on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (showDownloadMenu && !e.target.closest('.download-menu') && !e.target.closest('.icon-btn')) {
        setShowDownloadMenu(false);
      }
    };
    if (showDownloadMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showDownloadMenu]);

  const handleUpdateNote = async () => {
    if (!selectedNote) return;

    // Get the actual content from contentEditable div
    const actualContent = contentEditableRef.current ? contentEditableRef.current.innerHTML : content;

    try {
      const response = await fetch(getApiUrl(`notes/${selectedNote.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: title || 'Untitled Note',
          content: actualContent
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update the content state to match what was saved
        setContent(actualContent);
        // Refresh notes list to show updated note
        await fetchNotes();
        await fetchFolders();
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;

    if (!confirm('Delete this note?')) return;

    try {
      const response = await fetch(getApiUrl(`notes/${selectedNote.id}`), {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setSelectedNote(null);
        setTitle('');
        setContent('');
        await fetchNotes();
        await fetchStats();
        await fetchFolders();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getPreview = (text) => {
    if (!text) return 'No additional text';
    
    // Remove HTML tags and extract plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    let plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    // Replace images and drawings with indicators
    plainText = plainText.replace(/\[Image\]/g, '📷 ');
    plainText = plainText.replace(/\[Drawing\]/g, '🎨 ');
    
    // Get first line or first meaningful sentence
    const lines = plainText.split('\n').filter(line => line.trim().length > 0);
    const firstLine = lines[0] || '';
    
    // Count images and drawings
    const imageCount = (text.match(/<img/g) || []).length;
    const drawingCount = (text.match(/<canvas/g) || []).length;
    
    let preview = firstLine.trim();
    if (preview.length > 80) {
      preview = preview.substring(0, 80) + '...';
    }
    
    // Add media indicators
    if (imageCount > 0 || drawingCount > 0) {
      const indicators = [];
      if (imageCount > 0) indicators.push(`📷 ${imageCount}`);
      if (drawingCount > 0) indicators.push(`🎨 ${drawingCount}`);
      preview = preview + ' • ' + indicators.join(' ');
    }
    
    return preview || 'Empty note';
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgId = `img-${Date.now()}`;
        const imgTag = `<img id="${imgId}" src="${event.target.result}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; display: block; cursor: move; transition: transform 0.2s;" class="draggable-img" /><br>`;
        const newContent = content + imgTag;
        setContent(newContent);
        
        // Update the contentEditable div directly
        if (contentEditableRef.current) {
          contentEditableRef.current.innerHTML = newContent;
          // Add click listener to images
          setTimeout(() => attachImageListeners(), 100);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    e.target.value = '';
  };

  const attachImageListeners = () => {
    if (!contentEditableRef.current) return;
    const images = contentEditableRef.current.querySelectorAll('img');
    images.forEach(img => {
      img.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Capture current content BEFORE state changes to prevent content loss
        if (contentEditableRef.current) {
          const currentContent = contentEditableRef.current.innerHTML;
          setContent(currentContent);
        }
        
        setSelectedImage(img);
        
        // Position menu near the clicked image
        const rect = img.getBoundingClientRect();
        setImageMenuPosition({
          x: rect.right + 10,
          y: rect.top
        });
        setShowImageMenu(true);
        
        // Add selected class
        images.forEach(i => i.classList.remove('selected'));
        img.classList.add('selected');
      };
      
      // Enable dragging
      img.draggable = true;
      img.ondragstart = (e) => {
        setDraggedImage(img);
        e.dataTransfer.effectAllowed = 'move';
        const rect = img.getBoundingClientRect();
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
        img.style.opacity = '0.5';
      };
      
      img.ondragend = (e) => {
        img.style.opacity = '1';
        setDraggedImage(null);
      };
    });
    
    // Setup drop zone on contentEditable
    if (contentEditableRef.current) {
      contentEditableRef.current.ondragover = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      };
      
      contentEditableRef.current.ondrop = (e) => {
        e.preventDefault();
        if (draggedImage) {
          // Image will be repositioned by contentEditable naturally
          const updatedContent = contentEditableRef.current.innerHTML;
          setContent(updatedContent);
        }
      };
    }
  };

  const rotateImage = () => {
    if (!selectedImage) return;
    const currentRotation = selectedImage.style.transform.match(/rotate\(([^)]+)\)/);
    const rotation = currentRotation ? parseInt(currentRotation[1]) + 90 : 90;
    selectedImage.style.transform = `rotate(${rotation}deg) scale(${imageTransform.scale})`;
    
    // Update content and save
    if (contentEditableRef.current) {
      const updatedContent = contentEditableRef.current.innerHTML;
      setContent(updatedContent);
      setTimeout(() => handleUpdateNote(), 100);
    }
  };

  const resizeImage = (scaleChange) => {
    if (!selectedImage) return;
    const currentScale = imageTransform.scale + scaleChange;
    if (currentScale >= 0.2 && currentScale <= 3) {
      setImageTransform(prev => ({ ...prev, scale: currentScale }));
      const currentRotation = selectedImage.style.transform.match(/rotate\(([^)]+)\)/);
      const rotation = currentRotation ? currentRotation[1] : '0deg';
      selectedImage.style.transform = `rotate(${rotation}) scale(${currentScale})`;
      
      // Update content and save
      if (contentEditableRef.current) {
        const updatedContent = contentEditableRef.current.innerHTML;
        setContent(updatedContent);
        setTimeout(() => handleUpdateNote(), 100);
      }
    }
  };

  const deleteImage = () => {
    if (!selectedImage) return;
    
    if (confirm('Delete this image?')) {
      selectedImage.remove();
      setShowImageMenu(false);
      setSelectedImage(null);
      // Update content immediately
      if (contentEditableRef.current) {
        const updatedContent = contentEditableRef.current.innerHTML;
        setContent(updatedContent);
        // Save to backend
        handleUpdateNote();
      }
    }
  };

  const flipImageHorizontal = () => {
    if (!selectedImage) return;
    const currentTransform = selectedImage.style.transform || '';
    const scaleXMatch = currentTransform.match(/scaleX\(([^)]+)\)/);
    const currentScaleX = scaleXMatch ? parseFloat(scaleXMatch[1]) : 1;
    const newScaleX = currentScaleX * -1;
    
    let newTransform = currentTransform.replace(/scaleX\([^)]+\)/, '');
    newTransform += ` scaleX(${newScaleX})`;
    selectedImage.style.transform = newTransform.trim();
    
    // Update content and save
    if (contentEditableRef.current) {
      const updatedContent = contentEditableRef.current.innerHTML;
      setContent(updatedContent);
      setTimeout(() => handleUpdateNote(), 100);
    }
  };

  const flipImageVertical = () => {
    if (!selectedImage) return;
    const currentTransform = selectedImage.style.transform || '';
    const scaleYMatch = currentTransform.match(/scaleY\(([^)]+)\)/);
    const currentScaleY = scaleYMatch ? parseFloat(scaleYMatch[1]) : 1;
    const newScaleY = currentScaleY * -1;
    
    let newTransform = currentTransform.replace(/scaleY\([^)]+\)/, '');
    newTransform += ` scaleY(${newScaleY})`;
    selectedImage.style.transform = newTransform.trim();
    
    // Update content and save
    if (contentEditableRef.current) {
      const updatedContent = contentEditableRef.current.innerHTML;
      setContent(updatedContent);
      setTimeout(() => handleUpdateNote(), 100);
    }
  };

  const startCropImage = () => {
    if (!selectedImage) return;
    setCropMode(true);
    setShowImageMenu(false);
    
    // Add crop-mode class to image
    selectedImage.classList.add('crop-mode');
    
    // Use local variable instead of state for dragging flag
    let isCurrentlyDragging = false;
    let startPos = { x: 0, y: 0 };
    let currentCropData = { x: 0, y: 0, width: 0, height: 0 };
    
    const handleMouseDown = (e) => {
      // Only start crop on the image itself
      if (e.target !== selectedImage) return;
      isCurrentlyDragging = true;
      const rect = selectedImage.getBoundingClientRect();
      startPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      currentCropData = {
        x: startPos.x,
        y: startPos.y,
        width: 0,
        height: 0
      };
      setCropData(currentCropData);
      e.preventDefault();
    };
    
    const handleMouseMove = (e) => {
      if (!isCurrentlyDragging) return;
      const rect = selectedImage.getBoundingClientRect();
      const currentX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const currentY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
      
      currentCropData = {
        x: Math.min(startPos.x, currentX),
        y: Math.min(startPos.y, currentY),
        width: Math.abs(currentX - startPos.x),
        height: Math.abs(currentY - startPos.y)
      };
      setCropData(currentCropData);
    };
    
    const handleMouseUp = () => {
      isCurrentlyDragging = false;
    };
    
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Store cleanup function
    selectedImage._cropListeners = () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  };

  const applyCrop = () => {
    if (!selectedImage || !cropMode) return;
    
    // Check if crop area is valid
    if (cropData.width < 10 || cropData.height < 10) {
      alert('Crop area too small. Please select a larger area.');
      return;
    }
    
    // Create canvas to crop image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const rect = selectedImage.getBoundingClientRect();
      const scaleX = img.naturalWidth / rect.width;
      const scaleY = img.naturalHeight / rect.height;
      
      canvas.width = cropData.width * scaleX;
      canvas.height = cropData.height * scaleY;
      
      ctx.drawImage(
        img,
        cropData.x * scaleX,
        cropData.y * scaleY,
        cropData.width * scaleX,
        cropData.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );
      
      selectedImage.src = canvas.toDataURL();
      selectedImage.style.width = cropData.width + 'px';
      selectedImage.style.height = cropData.height + 'px';
      
      // Cleanup
      if (selectedImage._cropListeners) {
        selectedImage._cropListeners();
        delete selectedImage._cropListeners;
      }
      
      setCropMode(false);
      selectedImage.classList.remove('crop-mode');
      setIsCropping(false);
      
      // Update content
      if (contentEditableRef.current) {
        setContent(contentEditableRef.current.innerHTML);
        handleUpdateNote();
      }
    };
    img.src = selectedImage.src;
  };

  const cancelCrop = () => {
    setCropMode(false);
    setIsCropping(false);
    if (selectedImage) {
      selectedImage.classList.remove('crop-mode');
      if (selectedImage._cropListeners) {
        selectedImage._cropListeners();
        delete selectedImage._cropListeners;
      }
    }
  };

  const startMoveImage = () => {
    if (!selectedImage) return;
    setShowImageMenu(false);
    
    // Add moving class for visual feedback
    selectedImage.classList.add('moving');
    selectedImage.style.cursor = 'move';
    
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    
    // Reset position to inline (not relative) to keep it in flow
    selectedImage.style.position = 'static';
    selectedImage.style.display = 'inline-block';
    selectedImage.style.margin = '10px';
    
    const handleMouseDown = (e) => {
      if (e.target !== selectedImage) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      
      // Store initial position
      const rect = selectedImage.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      
      // Switch to absolute positioning for dragging
      selectedImage.style.position = 'absolute';
      selectedImage.style.left = rect.left + 'px';
      selectedImage.style.top = rect.top + 'px';
      selectedImage.style.zIndex = '1000';
      
      e.preventDefault();
      e.stopPropagation();
    };
    
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      selectedImage.style.left = (initialLeft + deltaX) + 'px';
      selectedImage.style.top = (initialTop + deltaY) + 'px';
    };
    
    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        
        // Return to static positioning
        selectedImage.style.position = 'static';
        selectedImage.style.left = '';
        selectedImage.style.top = '';
        selectedImage.style.zIndex = '';
        
        stopMoveImage();
        
        // Update content and save
        if (contentEditableRef.current) {
          setContent(contentEditableRef.current.innerHTML);
          setTimeout(() => handleUpdateNote(), 100);
        }
      }
    };
    
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Store cleanup function
    selectedImage._moveListeners = () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  };

  const stopMoveImage = () => {
    if (selectedImage) {
      selectedImage.classList.remove('moving');
      selectedImage.style.cursor = '';
      if (selectedImage._moveListeners) {
        selectedImage._moveListeners();
        delete selectedImage._moveListeners;
      }
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showImageMenu && !e.target.closest('.image-menu') && !e.target.closest('img')) {
        setShowImageMenu(false);
        if (selectedImage) {
          selectedImage.classList.remove('selected');
        }
        setSelectedImage(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showImageMenu, selectedImage]);

  // Attach image listeners when note changes
  useEffect(() => {
    if (selectedNote && contentEditableRef.current) {
      setTimeout(() => attachImageListeners(), 100);
    }
  }, [selectedNote, content]);

  const handleSaveNote = () => {
    if (selectedNote) {
      handleUpdateNote();
      alert('Note saved successfully!');
    }
  };

  const handleDownloadNote = () => {
    if (!selectedNote) return;
    setShowDownloadMenu(true);
  };

  const downloadAsHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title || 'Untitled Note'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { font-size: 32px; margin-bottom: 20px; }
    img { max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>${title || 'Untitled Note'}</h1>
  ${content}
</body>
</html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'note'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  const downloadAsPDF = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title || 'Untitled Note'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { font-size: 32px; margin-bottom: 20px; }
    img { max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; }
    @media print {
      body { margin: 0; padding: 20px; }
    }
  </style>
</head>
<body>
  <h1>${title || 'Untitled Note'}</h1>
  ${content}
</body>
</html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
    setShowDownloadMenu(false);
  };

  const downloadAsDOCX = () => {
    // Create simple DOCX-compatible HTML
    const docContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="UTF-8">
  <title>${title || 'Untitled Note'}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    h1 { font-size: 24pt; margin-bottom: 12pt; }
    p { margin: 0 0 12pt 0; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <h1>${title || 'Untitled Note'}</h1>
  ${content}
</body>
</html>
    `;
    
    const blob = new Blob([docContent], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'note'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  const saveCanvasToContent = () => {
    // Save canvas as image to content
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      
      // Check if canvas has any content (not just blank)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const bgColor = theme === 'dark' ? [28, 28, 30] : [242, 242, 247];
      let hasContent = false;
      
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        // Check if pixel is different from background
        if (Math.abs(r - bgColor[0]) > 5 || Math.abs(g - bgColor[1]) > 5 || Math.abs(b - bgColor[2]) > 5) {
          hasContent = true;
          break;
        }
      }
      
      if (hasContent) {
        const dataURL = canvas.toDataURL('image/png');
        const imgTag = `<img src="${dataURL}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; display: block;" class="draggable-img" /><br>`;
        const newContent = content + imgTag;
        setContent(newContent);
        
        // Update contentEditable div immediately
        if (contentEditableRef.current) {
          contentEditableRef.current.innerHTML = newContent;
          setTimeout(() => attachImageListeners(), 50);
        }
        
        // Auto-save the note
        setTimeout(() => handleUpdateNote(), 100);
      }
    }
  };

  const toggleDrawingMode = () => {
    if (!isDrawing) {
      // Entering drawing mode - save current content first
      if (contentEditableRef.current) {
        const currentContent = contentEditableRef.current.innerHTML;
        setContent(currentContent);
        // AUTO-SAVE: Save text content before switching to drawing
        handleUpdateNote();
      }
      // Initialize canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = theme === 'dark' ? '#1c1c1e' : '#f2f2f7';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      setIsDrawing(true);
    } else {
      // Exiting drawing mode - auto-save canvas as image
      saveCanvasToContent();
      setIsDrawing(false);
      
      // Restore text content when switching back
      setTimeout(() => {
        if (contentEditableRef.current && content) {
          contentEditableRef.current.innerHTML = content;
        }
      }, 50);
      
      // AUTO-SAVE: Save drawing content immediately after switching back to text
      setTimeout(() => handleUpdateNote(), 200);
    }
  };

  const startDrawing = (e) => {
    setIsDrawingOnCanvas(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const pos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setLastPos(pos);
    
    // For shapes, store starting position and canvas snapshot
    if (['rectangle', 'circle', 'line', 'triangle', 'arrow', 'diamond', 'parallelogram', 'hexagon', 'cylinder', 'document'].includes(drawingMode)) {
      setShapeStartPos(pos);
      // Save canvas state for preview
      setCanvasSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
  };

  const draw = (e) => {
    if (!isDrawingOnCanvas) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawingMode === 'pen') {
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
      ctx.lineCap = 'round';
      ctx.stroke();
      setLastPos({ x, y });
    } else if (drawingMode === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = theme === 'dark' ? '#1c1c1e' : '#f2f2f7';
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.stroke();
      setLastPos({ x, y });
    } else if (['rectangle', 'circle', 'line', 'triangle', 'arrow', 'diamond', 'parallelogram', 'hexagon', 'cylinder', 'document'].includes(drawingMode) && shapeStartPos && canvasSnapshot) {
      // Restore canvas to show live preview
      ctx.putImageData(canvasSnapshot, 0, 0);
      
      ctx.strokeStyle = penColor;
      ctx.fillStyle = penColor;
      ctx.lineWidth = penSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      const width = x - shapeStartPos.x;
      const height = y - shapeStartPos.y;
      
      // Draw preview of shape
      if (drawingMode === 'rectangle') {
        ctx.strokeRect(shapeStartPos.x, shapeStartPos.y, width, height);
      } else if (drawingMode === 'circle') {
        const radius = Math.sqrt(width * width + height * height) / 2;
        const centerX = shapeStartPos.x + width / 2;
        const centerY = shapeStartPos.y + height / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (drawingMode === 'line') {
        ctx.beginPath();
        ctx.moveTo(shapeStartPos.x, shapeStartPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (drawingMode === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(shapeStartPos.x + width / 2, shapeStartPos.y);
        ctx.lineTo(shapeStartPos.x, shapeStartPos.y + height);
        ctx.lineTo(shapeStartPos.x + width, shapeStartPos.y + height);
        ctx.closePath();
        ctx.stroke();
      } else if (drawingMode === 'arrow') {
        const headlen = 15;
        const angle = Math.atan2(height, width);
        ctx.beginPath();
        ctx.moveTo(shapeStartPos.x, shapeStartPos.y);
        ctx.lineTo(x, y);
        ctx.lineTo(x - headlen * Math.cos(angle - Math.PI / 6), y - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(x, y);
        ctx.lineTo(x - headlen * Math.cos(angle + Math.PI / 6), y - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (drawingMode === 'diamond') {
        // Diamond (Decision) shape
        ctx.beginPath();
        ctx.moveTo(shapeStartPos.x + width / 2, shapeStartPos.y);
        ctx.lineTo(shapeStartPos.x + width, shapeStartPos.y + height / 2);
        ctx.lineTo(shapeStartPos.x + width / 2, shapeStartPos.y + height);
        ctx.lineTo(shapeStartPos.x, shapeStartPos.y + height / 2);
        ctx.closePath();
        ctx.stroke();
      } else if (drawingMode === 'parallelogram') {
        // Parallelogram (Input/Output) shape
        const offset = width * 0.2;
        ctx.beginPath();
        ctx.moveTo(shapeStartPos.x + offset, shapeStartPos.y);
        ctx.lineTo(shapeStartPos.x + width, shapeStartPos.y);
        ctx.lineTo(shapeStartPos.x + width - offset, shapeStartPos.y + height);
        ctx.lineTo(shapeStartPos.x, shapeStartPos.y + height);
        ctx.closePath();
        ctx.stroke();
      } else if (drawingMode === 'hexagon') {
        // Hexagon (Preparation) shape
        const offset = width * 0.15;
        ctx.beginPath();
        ctx.moveTo(shapeStartPos.x + offset, shapeStartPos.y);
        ctx.lineTo(shapeStartPos.x + width - offset, shapeStartPos.y);
        ctx.lineTo(shapeStartPos.x + width, shapeStartPos.y + height / 2);
        ctx.lineTo(shapeStartPos.x + width - offset, shapeStartPos.y + height);
        ctx.lineTo(shapeStartPos.x + offset, shapeStartPos.y + height);
        ctx.lineTo(shapeStartPos.x, shapeStartPos.y + height / 2);
        ctx.closePath();
        ctx.stroke();
      } else if (drawingMode === 'cylinder') {
        // Cylinder (Database) shape
        const ellipseHeight = Math.abs(height) * 0.15;
        ctx.beginPath();
        // Top ellipse
        ctx.ellipse(shapeStartPos.x + width / 2, shapeStartPos.y + ellipseHeight / 2, Math.abs(width / 2), ellipseHeight / 2, 0, 0, 2 * Math.PI);
        ctx.stroke();
        // Sides
        ctx.beginPath();
        ctx.moveTo(shapeStartPos.x, shapeStartPos.y + ellipseHeight / 2);
        ctx.lineTo(shapeStartPos.x, shapeStartPos.y + height - ellipseHeight / 2);
        ctx.moveTo(shapeStartPos.x + width, shapeStartPos.y + ellipseHeight / 2);
        ctx.lineTo(shapeStartPos.x + width, shapeStartPos.y + height - ellipseHeight / 2);
        ctx.stroke();
        // Bottom ellipse
        ctx.beginPath();
        ctx.ellipse(shapeStartPos.x + width / 2, shapeStartPos.y + height - ellipseHeight / 2, Math.abs(width / 2), ellipseHeight / 2, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (drawingMode === 'document') {
        // Document shape
        const waveHeight = Math.abs(height) * 0.1;
        ctx.beginPath();
        ctx.moveTo(shapeStartPos.x, shapeStartPos.y);
        ctx.lineTo(shapeStartPos.x + width, shapeStartPos.y);
        ctx.lineTo(shapeStartPos.x + width, shapeStartPos.y + height - waveHeight);
        // Wavy bottom
        ctx.quadraticCurveTo(
          shapeStartPos.x + width * 0.75, shapeStartPos.y + height - waveHeight * 2,
          shapeStartPos.x + width / 2, shapeStartPos.y + height - waveHeight
        );
        ctx.quadraticCurveTo(
          shapeStartPos.x + width * 0.25, shapeStartPos.y + height,
          shapeStartPos.x, shapeStartPos.y + height - waveHeight
        );
        ctx.closePath();
        ctx.stroke();
      }
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawingOnCanvas) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Finalize shapes on mouse up
    if (shapeStartPos && ['rectangle', 'circle', 'line', 'triangle', 'arrow', 'diamond', 'parallelogram', 'hexagon', 'cylinder', 'document'].includes(drawingMode)) {
      // The shape is already drawn from the last draw() call, just clean up
      setShapeStartPos(null);
      setCanvasSnapshot(null);
    }
    
    setIsDrawingOnCanvas(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = theme === 'dark' ? '#1c1c1e' : '#f2f2f7';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Auto-save when title or content changes
  useEffect(() => {
    if (selectedNote && selectedNote.id) {
      // Check if content actually changed
      const titleChanged = title !== selectedNote.title;
      const contentChanged = content !== selectedNote.content;
      
      if (titleChanged || contentChanged) {
        const timeoutId = setTimeout(() => {
          handleUpdateNote();
        }, 800); // Reduced from 1000ms for faster auto-save
        return () => clearTimeout(timeoutId);
      }
    }
  }, [title, content, selectedNote?.id]);

  return (
    <>
      {appLoading && (
        <div className="app-loading-screen">
          <img 
            src={theme === 'dark' ? 'darkmodelogo.jpeg' : 'lightmodelogo.jpeg'} 
            alt="Zenix Notes" 
            className="loading-logo"
          />
          <h1 className="loading-title">Zenix Notes</h1>
          <div className="loading-spinner"></div>
        </div>
      )}
      <div className={`app ${appLoading ? 'hidden' : 'loaded'}`}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <img 
            src={theme === 'dark' ? 'darkmodelogo.jpeg' : 'lightmodelogo.jpeg'} 
            alt="Zenix Notes Logo" 
            className="app-logo"
          />
          <h1>Zenix Notes</h1>
          <p>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        
        <div className="stats">
          {stats.total} {stats.total === 1 ? 'Note' : 'Notes'}
        </div>

        {/* Folder Browser */}
        <div className="folder-browser">
          <div className="folder-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                className="folder-expand-btn"
                onClick={() => setExpandedFolders(!expandedFolders)}
                title={expandedFolders ? 'Collapse' : 'Expand'}
              >
                {expandedFolders ? '▼' : '▶'}
              </button>
              <span>📁 Folders</span>
            </div>
            <button 
              className="folder-add-btn"
              onClick={() => setShowNewFolderInput(true)}
              title="New Folder"
            >
              +
            </button>
          </div>
          
          {expandedFolders && (
            <>
              {showNewFolderInput && (
                <div className="new-folder-input">
                  <input
                    type="text"
                    placeholder="Folder name..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                    autoFocus
                  />
                  <button onClick={handleCreateFolder}>✓</button>
                  <button onClick={() => { setShowNewFolderInput(false); setNewFolderName(''); }}>✕</button>
                </div>
              )}
              
              <div 
                className={`folder-item ${!selectedFolder ? 'active' : ''}`}
                onClick={() => setSelectedFolder(null)}
              >
                <span>📋 All Notes</span>
                <span className="folder-count">{notes.length}</span>
              </div>
              
              {folders.map((folder, index) => {
                const folderIcon = getFolderIcon(folder.folder);
                const isRenaming = renamingFolder?.folder === folder.folder;
                
                return (
                  <div key={index}>
                    {isRenaming ? (
                      <div className="new-folder-input" style={{ padding: '4px 20px' }}>
                        <input
                          type="text"
                          value={newFolderRename}
                          onChange={(e) => setNewFolderRename(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && confirmRenameFolder()}
                          onBlur={confirmRenameFolder}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div 
                        className={`folder-item ${selectedFolder === folder.folder ? 'active' : ''}`}
                        onClick={() => setSelectedFolder(folder.folder)}
                        onContextMenu={(e) => handleFolderRightClick(e, folder)}
                      >
                        <span>{folderIcon} {folder.folder}</span>
                        <span className="folder-count">{folder.count || 0}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="notes-list">
          {(() => {
            const filteredNotes = getFilteredNotes();
            const groupedNotes = groupNotesByDate(filteredNotes);
            const groupOrder = ['Today', 'Yesterday', 'This Week', 'This Month'];
            const sortedGroups = Object.keys(groupedNotes).sort((a, b) => {
              const aIndex = groupOrder.indexOf(a);
              const bIndex = groupOrder.indexOf(b);
              if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
              if (aIndex !== -1) return -1;
              if (bIndex !== -1) return 1;
              return b.localeCompare(a);
            });
            
            return sortedGroups.map(groupName => (
              <div key={groupName} className="notes-date-group">
                <div className="notes-date-header">{groupName}</div>
                {groupedNotes[groupName].map(note => (
                  <div 
                    key={note.id}
                    className={`note-item ${selectedNote?.id === note.id ? 'active' : ''}`}
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className="note-item-title">{note.title}</div>
                    <div className="note-item-preview">{getPreview(note.content)}</div>
                    <div className="note-item-date">{formatDate(note.updated_at)}</div>
                  </div>
                ))}
              </div>
            ));
          })()}
        </div>

        <button className="new-note-btn" onClick={handleNewNote}>
          <Plus size={20} />
          New Note
        </button>
        
        {/* Folder Context Menu */}
        {folderContextMenu && (
          <div 
            className="folder-context-menu"
            style={{
              position: 'fixed',
              left: `${folderContextMenu.x}px`,
              top: `${folderContextMenu.y}px`,
              zIndex: 1000
            }}
          >
            <button onClick={handleCreateNoteInFolder}>
              📄 New Note
            </button>
            <div className="context-menu-divider"></div>
            <button onClick={handleRenameFolder}>
              ✏️ Rename
            </button>
            <button onClick={handleDeleteFolder} className="delete">
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="editor-container">
        {selectedNote ? (
          <>
            <div className="editor-header">
              <div className="editor-actions">
                <button className="icon-btn save" onClick={handleSaveNote} title="Save Note (Ctrl+S)">
                  <Save size={18} />
                </button>
                <button className="icon-btn ai-btn" onClick={handleAiSummarize} title="✨ AI Summarize (Click to activate)">
                  <Sparkles size={18} />
                </button>
                <button className="icon-btn" onClick={handleDownloadNote} title="Download Note to PC">
                  <Download size={18} />
                </button>
                
                {/* Download Format Menu */}
                {showDownloadMenu && (
                  <div 
                    className="download-menu"
                    style={{
                      position: 'absolute',
                      top: '60px',
                      left: '90px',
                      zIndex: 1000
                    }}
                  >
                    <div className="download-menu-header">Download as...</div>
                    <button onClick={downloadAsHTML}>
                      📄 HTML File
                    </button>
                    <button onClick={downloadAsPDF}>
                      📕 PDF Document
                    </button>
                    <button onClick={downloadAsDOCX}>
                      📘 Word Document (.doc)
                    </button>
                    <button onClick={() => setShowDownloadMenu(false)} className="cancel">
                      ✕ Cancel
                    </button>
                  </div>
                )}
                
                <button 
                  className={`icon-btn ${!isDrawing ? 'active' : ''}`}
                  onClick={() => {
                    if (isDrawing) {
                      saveCanvasToContent();
                      setIsDrawing(false);
                      // Restore text content when switching to text mode
                      setTimeout(() => {
                        if (contentEditableRef.current && content) {
                          contentEditableRef.current.innerHTML = content;
                        }
                      }, 50);
                    }
                  }}
                  title="Text Mode - Type with keyboard"
                >
                  <Type size={18} />
                </button>
                <button 
                  className="icon-btn" 
                  onClick={() => fileInputRef.current?.click()}
                  title="Insert Image (Photos/Screenshots)"
                >
                  <ImageIcon size={18} />
                </button>
                <button 
                  className={`icon-btn ${isDrawing ? 'active' : ''}`}
                  onClick={toggleDrawingMode}
                  title="Draw Mode - Use pen to draw"
                >
                  <Pen size={18} />
                </button>
                <button className="icon-btn delete" onClick={handleDeleteNote} title="Delete Note">
                  <Trash2 size={18} />
                </button>
                <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
            </div>
            
            {isDrawing && (
              <div className="drawing-toolbar">
                <button 
                  className={`tool-btn ${drawingMode === 'pen' ? 'active' : ''}`}
                  onClick={() => setDrawingMode('pen')}
                >
                  <Pen size={16} /> Pen
                </button>
                <button 
                  className={`tool-btn ${drawingMode === 'eraser' ? 'active' : ''}`}
                  onClick={() => setDrawingMode('eraser')}
                >
                  <Eraser size={16} /> Eraser
                </button>
                
                <div className="toolbar-divider"></div>
                
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginRight: '8px' }}>Shapes:</span>
                <button 
                  className={`tool-btn ${drawingMode === 'rectangle' ? 'active' : ''}`}
                  onClick={() => setDrawingMode('rectangle')}
                  title="Rectangle"
                >
                  <Square size={16} />
                </button>
                <button 
                  className={`tool-btn ${drawingMode === 'circle' ? 'active' : ''}`}
                  onClick={() => setDrawingMode('circle')}
                  title="Circle"
                >
                  <Circle size={16} />
                </button>
                <button 
                  className={`tool-btn ${drawingMode === 'line' ? 'active' : ''}`}
                  onClick={() => setDrawingMode('line')}
                  title="Line"
                >
                  <Minus size={16} />
                </button>
                <button 
                  className={`tool-btn ${drawingMode === 'triangle' ? 'active' : ''}`}
                  onClick={() => setDrawingMode('triangle')}
                  title="Triangle"
                >
                  <Triangle size={16} />
                </button>
                <button 
                  className={`tool-btn ${drawingMode === 'arrow' ? 'active' : ''}`}
                  onClick={() => setDrawingMode('arrow')}
                  title="Arrow"
                >
                  <ArrowUpRight size={16} />
                </button>
                
                <div className="toolbar-divider"></div>
                
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginRight: '8px' }}>Flowchart:</span>
                <button 
                  className={`tool-btn ${drawingMode === 'diamond' ? 'active' : ''}`}
                  onClick={() => setDrawingMode('diamond')}
                  title="Decision (Diamond)"
                >
                  <Diamond size={16} />
                </button>
                <button 
                  className={`tool-btn ${drawingMode === 'parallelogram' ? 'active' : ''}`}
                  onClick={() => setDrawingMode('parallelogram')}
                  title="Input/Output (Parallelogram)"
                >
                  <span style={{ transform: 'skewX(-15deg)', display: 'inline-block' }}>▱</span>
                </button>
                <button 
                  className={`tool-btn ${drawingMode === 'hexagon' ? 'active' : ''}`}
                  onClick={() => setDrawingMode('hexagon')}
                  title="Preparation (Hexagon)"
                >
                  <Hexagon size={16} />
                </button>
                <button 
                  className={`tool-btn ${drawingMode === 'cylinder' ? 'active' : ''}`}
                  onClick={() => setDrawingMode('cylinder')}
                  title="Database (Cylinder)"
                >
                  <Database size={16} />
                </button>
                <button 
                  className={`tool-btn ${drawingMode === 'document' ? 'active' : ''}`}
                  onClick={() => setDrawingMode('document')}
                  title="Document"
                >
                  <File size={16} />
                </button>
                
                <div className="toolbar-divider"></div>
                
                <div className="color-picker">
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginRight: '8px' }}>Colors:</span>
                  {[
                    '#ffffff', '#000000', '#808080', '#ff3b30', '#ff9500', '#ffcc00',
                    '#34c759', '#00c7be', '#0a84ff', '#5856d6', '#af52de', '#ff2d55',
                    '#8B4513', '#FF69B4', '#00FF00', '#FFD700'
                  ].map(color => (
                    <button
                      key={color}
                      className={`color-btn ${penColor === color ? 'active' : ''}`}
                      style={{ backgroundColor: color, border: color === '#ffffff' ? '2px solid #666' : '2px solid transparent' }}
                      onClick={() => setPenColor(color)}
                      title={color}
                    />
                  ))}
                </div>
                
                <div className="toolbar-divider"></div>
                
                <div className="pen-size-picker">
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginRight: '8px' }}>Size:</span>
                  {[1, 2, 4, 6, 8, 12].map(size => (
                    <button
                      key={size}
                      className={`size-btn ${penSize === size ? 'active' : ''}`}
                      onClick={() => setPenSize(size)}
                      title={`${size}px`}
                    >
                      <div 
                        style={{
                          width: `${Math.min(size * 2, 16)}px`,
                          height: `${Math.min(size * 2, 16)}px`,
                          borderRadius: '50%',
                          backgroundColor: 'var(--text-primary)'
                        }}
                      />
                    </button>
                  ))}
                </div>
                
                <div className="toolbar-divider"></div>
                
                <button className="tool-btn" onClick={clearCanvas}>
                  Clear
                </button>
                <button className="tool-btn save" onClick={toggleDrawingMode}>
                  Done
                </button>
              </div>
            )}

            <div className="editor-content">
              <input
                type="text"
                className="note-title-input"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              
              {isDrawing ? (
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="drawing-canvas"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              ) : (
                <div
                  ref={contentEditableRef}
                  className="note-content-input"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => {
                    const newContent = e.currentTarget.innerHTML;
                    setContent(newContent);
                    // ✅ AUTO-SAVE: Debounced save after 1 second of no typing
                    if (window.autoSaveTimeout) clearTimeout(window.autoSaveTimeout);
                    window.autoSaveTimeout = setTimeout(() => {
                      handleUpdateNote();
                    }, 1000);
                  }}
                  onBlur={(e) => {
                    setContent(e.currentTarget.innerHTML);
                    // ✅ AUTO-SAVE: Save immediately on blur
                    handleUpdateNote();
                  }}
                  data-placeholder="Start writing..."
                />
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            
            {/* Image Manipulation Menu */}
            {showImageMenu && selectedImage && !cropMode && (
              <div className="image-menu">
                <div className="image-menu-header">Image Options</div>
                <button className="image-menu-item" onClick={startMoveImage}>
                  <Move size={16} />
                  <span>Move</span>
                </button>
                <button className="image-menu-item" onClick={startCropImage}>
                  <Crop size={16} />
                  <span>Crop</span>
                </button>
                <button className="image-menu-item" onClick={rotateImage}>
                  <RotateCw size={16} />
                  <span>Rotate 90°</span>
                </button>
                <button className="image-menu-item" onClick={flipImageHorizontal}>
                  <FlipHorizontal size={16} />
                  <span>Flip Horizontal</span>
                </button>
                <button className="image-menu-item" onClick={flipImageVertical}>
                  <FlipVertical size={16} />
                  <span>Flip Vertical</span>
                </button>
                <div className="image-menu-divider"></div>
                <button className="image-menu-item" onClick={() => resizeImage(0.2)}>
                  <Maximize2 size={16} />
                  <span>Larger</span>
                </button>
                <button className="image-menu-item" onClick={() => resizeImage(-0.2)}>
                  <Maximize2 size={16} style={{ transform: 'scale(0.8)' }} />
                  <span>Smaller</span>
                </button>
                <div className="image-menu-divider"></div>
                <button className="image-menu-item delete" onClick={deleteImage}>
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            )}
            
            {/* Crop Toolbar */}
            {cropMode && selectedImage && (
              <>
                {/* Crop Selection Overlay */}
                {cropData.width > 0 && cropData.height > 0 && (
                  <div
                    className="crop-selection"
                    style={{
                      position: 'fixed',
                      left: selectedImage.getBoundingClientRect().left + cropData.x + 'px',
                      top: selectedImage.getBoundingClientRect().top + cropData.y + 'px',
                      width: cropData.width + 'px',
                      height: cropData.height + 'px',
                      border: '2px dashed var(--accent)',
                      backgroundColor: 'rgba(10, 132, 255, 0.1)',
                      pointerEvents: 'none',
                      zIndex: 999
                    }}
                  />
                )}
                
                <div 
                className="crop-toolbar"
                style={{
                  position: 'fixed',
                  bottom: '40px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 1000
                }}
              >
                <div className="crop-toolbar-content">
                  <span className="crop-info">🖌️ Crop Mode: Drag to select area</span>
                  <button className="crop-btn apply" onClick={applyCrop}>
                    ✓ Apply
                  </button>
                  <button className="crop-btn cancel" onClick={cancelCrop}>
                    ✕ Cancel
                  </button>
                </div>
              </div>
              </>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h2>Select a note</h2>
            <p>Choose a note from the list or create a new one</p>
            <p style={{ fontSize: '13px', color: 'var(--accent)', marginTop: '12px' }}>
              ✨ AI Summary available - click the sparkle button!
            </p>
          </div>
        )}
        
        {/* AI Summary Modal */}
        {showAiModal && (
          <div className="ai-modal-overlay" onClick={() => setShowAiModal(false)}>
            <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ai-modal-header">
                <div className="ai-modal-title">
                  <Sparkles size={20} />
                  <span>AI Summary (100% Offline)</span>
                </div>
                <button className="ai-modal-close" onClick={() => setShowAiModal(false)}>✕</button>
              </div>
              
              <div className="ai-modal-content">
                {aiLoading ? (
                  <div className="ai-loading">
                    <div className="ai-spinner"></div>
                    <p>Analyzing your note...</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      Reading text, images, and drawings
                    </p>
                  </div>
                ) : aiSummary?.error ? (
                  <div className="ai-error">                    {aiSummary.loading ? (
                      <>
                        <div className="ai-spinner"></div>
                        <p style={{ color: 'var(--accent)', marginTop: '16px' }}>🤖 {aiSummary.error}</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                          First-time use may take 1-2 minutes
                        </p>
                      </>
                    ) : aiSummary.need_install ? (
                      <>
                        <p>❌ {aiSummary.error}</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '12px' }}>
                          <strong>Setup Required:</strong><br/>
                          1. Open Command Prompt<br/>
                          2. Run: <code>cd "d:\StudentOS Project\NotesMaker\Backend\AI-Service"</code><br/>
                          3. Run: <code>install.bat</code><br/>
                          4. Wait for installation to complete<br/>
                          5. Click AI button again!
                        </p>
                      </>
                    ) : (
                      <>
                        <p>❌ {aiSummary.error}</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '12px' }}>
                          Click the AI button again to retry
                        </p>
                      </>
                    )}
                  </div>
                ) : aiSummary ? (
                  <div className="ai-results">
                    <div className="ai-section">
                      <h3>📝 Summary</h3>
                      <p>{aiSummary.summary}</p>
                    </div>
                    
                    <div className="ai-section">
                      <h3>🎯 Key Points</h3>
                      <div className="ai-key-points">
                        {aiSummary.key_points}
                      </div>
                    </div>
                    
                    {aiSummary.image_descriptions && aiSummary.image_descriptions.length > 0 && (
                      <div className="ai-section">
                        <h3>🖼️ Images Detected ({aiSummary.image_count})</h3>
                        {aiSummary.image_descriptions.map((desc, i) => (
                          <p key={i} style={{ fontSize: '14px', marginBottom: '8px' }}>{desc}</p>
                        ))}
                      </div>
                    )}
                    
                    <div className="ai-stats">
                      <span>📊 {aiSummary.word_count} words</span>
                      <span>🖼️ {aiSummary.image_count} images</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default App;
