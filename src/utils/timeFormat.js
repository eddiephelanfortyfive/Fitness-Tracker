// Time format conversion and utility functions

// Convert decimal minutes to MM:SS format
export const decimalToMMSS = (decimal) => {
  if (!decimal && decimal !== 0) return '';
  const num = parseFloat(decimal);
  if (isNaN(num)) return '';
  
  const minutes = Math.floor(num);
  const seconds = Math.round((num - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Convert MM:SS format to decimal minutes
export const mmssToDecimal = (mmss) => {
  if (!mmss || mmss === '') return '';
  
  // Handle decimal format (for backward compatibility)
  if (!mmss.includes(':')) {
    const num = parseFloat(mmss);
    if (!isNaN(num)) return num;
    return '';
  }
  
  const parts = mmss.split(':');
  const minutes = parseInt(parts[0], 10) || 0;
  const seconds = parseInt(parts[1], 10) || 0;
  
  if (isNaN(minutes) || isNaN(seconds)) return '';
  
  return minutes + (seconds / 60);
};

// Validate MM:SS format
export const validateMMSS = (input) => {
  if (!input || input === '') return true; // Empty is valid (optional field)
  
  // Allow decimal format for backward compatibility
  if (!input.includes(':')) {
    const num = parseFloat(input);
    return !isNaN(num) && num >= 0;
  }
  
  const pattern = /^(\d{1,3}):([0-5]?\d)$/;
  if (!pattern.test(input)) return false;
  
  const [mins, secs] = input.split(':').map(Number);
  return mins >= 0 && secs >= 0 && secs < 60;
};

// Auto-format user input to MM:SS
export const formatMMSS = (input) => {
  if (!input) return '';
  
  // Remove all non-numeric characters except colon
  let cleaned = input.replace(/[^\d:]/g, '');
  
  // If already has colon, validate format
  if (cleaned.includes(':')) {
    const parts = cleaned.split(':');
    if (parts.length === 2) {
      const mins = parts[0].slice(0, 3); // Max 3 digits for minutes
      const secs = parts[1].slice(0, 2); // Max 2 digits for seconds
      // Ensure seconds are 0-59
      const secsNum = parseInt(secs, 10);
      const validSecs = isNaN(secsNum) ? '' : Math.min(59, Math.max(0, secsNum)).toString().padStart(2, '0');
      return `${mins}:${validSecs}`;
    }
    return cleaned;
  }
  
  // If no colon, try to format as user types
  // If 4+ digits, assume MM:SS format
  if (cleaned.length >= 4) {
    const mins = cleaned.slice(0, -2);
    const secs = cleaned.slice(-2);
    const secsNum = parseInt(secs, 10);
    const validSecs = isNaN(secsNum) ? '00' : Math.min(59, Math.max(0, secsNum)).toString().padStart(2, '0');
    return `${mins}:${validSecs}`;
  }
  
  // If less than 4 digits, just return as is (will be formatted on blur or when colon is added)
  return cleaned;
};

// Calculate pace in min/km from duration (decimal minutes) and distance (km)
export const calculatePaceMinPerKm = (durationDecimal, distance) => {
  if (!durationDecimal && durationDecimal !== 0) return '';
  if (!distance || distance === 0) return '';
  
  const durationNum = typeof durationDecimal === 'string' 
    ? mmssToDecimal(durationDecimal) 
    : parseFloat(durationDecimal);
  
  if (isNaN(durationNum) || durationNum === 0) return '';
  
  const distanceNum = parseFloat(distance);
  if (isNaN(distanceNum) || distanceNum === 0) return '';
  
  const paceDecimal = durationNum / distanceNum; // min/km
  return decimalToMMSS(paceDecimal);
};

// Check if a value is in decimal format (for migration)
export const isDecimalFormat = (value) => {
  if (!value && value !== 0) return false;
  const str = String(value);
  // Check if it's a decimal number (has decimal point and is not MM:SS)
  return /^\d+\.\d+$/.test(str) && !str.includes(':');
};

