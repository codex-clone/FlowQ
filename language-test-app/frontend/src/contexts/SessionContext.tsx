import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode
} from 'react';
import { apiEndpoints } from '@services/apiService';

interface SessionContextValue {
  sessionId: string | null;
  userId: number | null;
  isLoading: boolean;
  initializeSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

const SESSION_STORAGE_KEY = 'language-test-session-id';
const USER_STORAGE_KEY = 'language-test-user-id';

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
      const storedUserId = window.localStorage.getItem(USER_STORAGE_KEY);
      if (storedSession && storedUserId) {
        try {
          await apiEndpoints.getSession(storedSession);
          setSessionId(storedSession);
          setUserId(Number(storedUserId));
          return;
        } catch (error) {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
          window.localStorage.removeItem(USER_STORAGE_KEY);
        }
      }

      const data = await apiEndpoints.createSession();
      setSessionId(data.session_id);
      setUserId(data.user_id);
      window.localStorage.setItem(SESSION_STORAGE_KEY, data.session_id);
      window.localStorage.setItem(USER_STORAGE_KEY, data.user_id.toString());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  const value = useMemo(
    () => ({ sessionId, userId, isLoading, initializeSession }),
    [sessionId, userId, isLoading, initializeSession]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};
