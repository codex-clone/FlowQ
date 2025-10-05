const STORAGE_KEY = 'language-test-api-keys';

type StoredKey = {
  sessionId: string;
  serviceName: string;
  apiKey: string;
};

const loadKeys = (): StoredKey[] => {
  const stored = window.sessionStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveKeys = (keys: StoredKey[]) => {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
};

export const apiKeyService = {
  getKey(sessionId: string, serviceName: string) {
    const keys = loadKeys();
    return keys.find((key) => key.sessionId === sessionId && key.serviceName === serviceName);
  },
  saveKey(sessionId: string, serviceName: string, apiKey: string) {
    const keys = loadKeys().filter(
      (key) => !(key.sessionId === sessionId && key.serviceName === serviceName)
    );
    keys.push({ sessionId, serviceName, apiKey });
    saveKeys(keys);
  },
  removeKey(sessionId: string, serviceName: string) {
    const keys = loadKeys().filter(
      (key) => !(key.sessionId === sessionId && key.serviceName === serviceName)
    );
    saveKeys(keys);
  },
  validateKeyFormat(key: string) {
    return /^sk-[a-zA-Z0-9]{20,}$/.test(key.trim());
  }
};
