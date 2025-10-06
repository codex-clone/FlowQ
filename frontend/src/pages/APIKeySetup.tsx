import { useEffect, useState } from 'react';
import { APIKeyInput } from '@components/ui/APIKeyInput';
import { useApiKeys } from '@contexts/ApiKeyContext';
import { useSession } from '@contexts/SessionContext';
import { apiEndpoints } from '@services/apiService';
import { useUI } from '@contexts/UIContext';

export const APIKeySetup = () => {
  const { sessionId } = useSession();
  const { apiKeys, saveKey, refresh } = useApiKeys();
  const { notify } = useUI();
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const existing = apiKeys.find((key) => key.service_name === 'openai');
    if (existing) {
      setInputValue('••••••••••••');
    }
  }, [apiKeys]);

  const onSave = async (value: string) => {
    await saveKey('openai', value);
    setInputValue('••••••••••••');
  };

  const testConnection = async (key: string) => {
    if (!sessionId) return;
    if (!key || key.includes('•')) {
      notify('Enter your API key to test the connection.', { type: 'info' });
      return;
    }
    try {
      await saveKey('openai', key);
      await apiEndpoints.aiGenerate({
        session_id: sessionId,
        language: 'en',
        test_type: 'reading',
        difficulty: 1
      });
      notify('OpenAI key validated successfully', { type: 'success' });
      setInputValue('••••••••••••');
    } catch (error: any) {
      notify(error.message || 'Unable to validate API key', { type: 'error' });
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Connect your OpenAI account</h1>
      <p className="mt-2 text-sm text-slate-600">
        We never store your API keys on our servers. Keys are saved securely in your session and are only used
        to call OpenAI on your behalf.
      </p>
      <div className="mt-6 space-y-4">
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              Need a key? Visit{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                the OpenAI dashboard
              </a>{' '}
              to create one.
            </p>
          </div>
          <APIKeyInput defaultValue={inputValue} onSave={onSave} onTest={testConnection} />
        </div>
      </div>
    </div>
  );
};
