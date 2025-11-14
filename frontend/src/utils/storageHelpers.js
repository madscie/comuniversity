export const safeParseJSON = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;

    const parsed = JSON.parse(item);
    return parsed || defaultValue;
  } catch (error) {
    console.error(`❌ Error parsing localStorage key "${key}":`, error);
    localStorage.removeItem(key);
    return defaultValue;
  }
};

export const safeSetJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`❌ Error setting localStorage key "${key}":`, error);
    return false;
  }
};

export const clearCorruptedData = (keys = []) => {
  keys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error clearing key ${key}:`, error);
    }
  });
};