import { useEffect, useState } from 'react';
import { Button } from './Button';
import { apiKeyService } from '@services/apiKeyService';

interface APIKeyInputProps {
  defaultValue?: string;
  onSave: (value: string) => Promise<void>;
  onTest?: (value: string) => Promise<void>;
}

export const APIKeyInput = ({ defaultValue = '', onSave, onTest }: APIKeyInputProps) => {
  const [value, setValue] = useState(defaultValue);
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!apiKeyService.validateKeyFormat(value)) {
      setError('Invalid OpenAI API key format');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await onSave(value);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!onTest) return;
    if (!apiKeyService.validateKeyFormat(value)) {
      setError('Enter a valid OpenAI API key to test the connection.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await onTest(value);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-slate-700">OpenAI API Key</label>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          type={showKey ? 'text' : 'password'}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          placeholder="sk-..."
        />
        <Button type="button" variant="ghost" onClick={() => setShowKey((prev) => !prev)}>
          {showKey ? 'Hide' : 'Show'}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={handleSave} isLoading={isLoading}>
          Save API Key
        </Button>
        {onTest && (
          <Button type="button" variant="secondary" onClick={handleTest} isLoading={isLoading}>
            Test Connection
          </Button>
        )}
      </div>
    </div>
  );
};
