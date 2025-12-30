// localStorage helper functions

// Save data to localStorage with error handling
export const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
};

// Load data from localStorage with error handling
export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
  }
  return defaultValue;
};

// Save simple value (string/number) to localStorage
export const saveSimpleToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, value.toString());
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
};

// Load simple value (string/number) from localStorage
export const loadSimpleFromLocalStorage = (key, defaultValue = null) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return saved;
    }
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
  }
  return defaultValue;
};

