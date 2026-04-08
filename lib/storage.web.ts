// Web storage — localStorage (not encrypted, but fine for JWTs on web)
export const getItem = async (key: string): Promise<string | null> => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore quota errors
  }
};

export const removeItem = async (key: string): Promise<void> => {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
};
