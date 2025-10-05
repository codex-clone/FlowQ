import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { apiEndpoints } from '@services/apiService';
import { apiKeyService } from '@services/apiKeyService';
import { useSession } from './SessionContext';
import { useUI } from './UIContext';
import { ApiKeyRecord } from '@types/index';

interface ApiKeyContextValue {
  apiKeys: ApiKeyRecord[];
  saveKey: (serviceName: string, apiKey: string) => Promise<void>;
  removeKey: (keyId: number, serviceName: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const ApiKeyContext = createContext<ApiKeyContextValue | undefined>(undefined);

export const ApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const { sessionId } = useSession();
  const { notify } = useUI();

  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);

  const refresh = useCallback(async () => {
    if (!sessionId) return;
    try {
      const response = await apiEndpoints.getApiKeys(sessionId);
      setApiKeys(response.api_keys);
    } catch (error: any) {
      notify(error.message || 'Unable to load API keys', { type: 'error' });
    }
  }, [notify, sessionId]);

  const saveKey = useCallback(
    async (serviceName: string, apiKey: string) => {
      if (!sessionId) return;
      try {
        await apiEndpoints.saveApiKey({
          session_id: sessionId,
          service_name: serviceName,
          api_key: apiKey
        });
        apiKeyService.saveKey(sessionId, serviceName, apiKey);
        notify('API key saved', { type: 'success' });
        await refresh();
      } catch (error: any) {
        notify(error.message || 'Failed to save API key', { type: 'error' });
      }
    },
    [notify, refresh, sessionId]
  );

  const removeKey = useCallback(
    async (keyId: number, serviceName: string) => {
      if (!sessionId) return;
      try {
        await apiEndpoints.deleteApiKey(keyId, sessionId);
        apiKeyService.removeKey(sessionId, serviceName);
        notify('API key removed', { type: 'info' });
        await refresh();
      } catch (error: any) {
        notify(error.message || 'Failed to delete API key', { type: 'error' });
      }
    },
    [notify, refresh, sessionId]
  );

  const value = useMemo(
    () => ({ apiKeys, saveKey, removeKey, refresh }),
    [apiKeys, refresh, removeKey, saveKey]
  );

  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>;
};

export const useApiKeys = () => {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error('useApiKeys must be used within ApiKeyProvider');
  }
  return context;
};
