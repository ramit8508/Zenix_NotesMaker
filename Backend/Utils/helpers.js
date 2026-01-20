/**
 * Format a date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Validate task data
 * @param {Object} taskData - Task data to validate
 * @returns {Object} Validation result
 */
export const validateTask = (taskData) => {
  const errors = [];

  if (!taskData.title || taskData.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (taskData.title && taskData.title.length > 255) {
    errors.push('Title must be less than 255 characters');
  }

  if (taskData.status && !['active', 'scheduled', 'completed'].includes(taskData.status)) {
    errors.push('Status must be one of: active, scheduled, completed');
  }

  if (taskData.scheduled_date) {
    const date = new Date(taskData.scheduled_date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid scheduled date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize user input
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim();
};
