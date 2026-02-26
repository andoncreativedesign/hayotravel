export const getFromSessionStorage = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to get ${key} from sessionStorage:`, error);
    return null;
  }
};

export const setToSessionStorage = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to set ${key} to sessionStorage:`, error);
  }
};

export const removeFromSessionStorage = (key: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove ${key} from sessionStorage:`, error);
  }
};
