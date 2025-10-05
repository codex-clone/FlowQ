import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';
import { apiEndpoints } from '@services/apiService';
import { useSession } from './SessionContext';
import { useUI } from './UIContext';
import { LanguageCode, TestQuestion, TestResult, TestType } from '@types/index';

interface StartTestPayload {
  language: LanguageCode;
  testType: TestType;
  difficulty?: number;
}

interface SubmitResponsePayload {
  questionId: number;
  responseText?: string;
  audioBlob?: Blob;
  responseTime?: number;
}

interface TestContextValue {
  testId: number | null;
  language: LanguageCode | null;
  testType: TestType | null;
  questions: TestQuestion[];
  isSubmitting: boolean;
  results: TestResult | null;
  startTest: (payload: StartTestPayload) => Promise<void>;
  submitResponse: (payload: SubmitResponsePayload) => Promise<boolean>;
  completeTest: () => Promise<void>;
  resetTest: () => void;
}

const TestContext = createContext<TestContextValue | undefined>(undefined);

export const TestProvider = ({ children }: { children: ReactNode }) => {
  const { sessionId } = useSession();
  const { setGlobalLoading, notify } = useUI();

  const [testId, setTestId] = useState<number | null>(null);
  const [language, setLanguage] = useState<LanguageCode | null>(null);
  const [testType, setTestType] = useState<TestType | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [results, setResults] = useState<TestResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startTest = useCallback(
    async ({ language, testType, difficulty = 1 }: StartTestPayload) => {
      if (!sessionId) return;
      setGlobalLoading(true);
      try {
        const response = await apiEndpoints.startTest({
          session_id: sessionId,
          language,
          test_type: testType,
          difficulty
        });
        setTestId(response.test_id);
        setLanguage(language);
        setTestType(testType);
        setQuestions(response.questions as TestQuestion[]);
        setResults(null);
        notify('Test started successfully', { type: 'success' });
      } catch (error: any) {
        notify(error.message || 'Unable to start test', { type: 'error' });
      } finally {
        setGlobalLoading(false);
      }
    },
    [notify, sessionId, setGlobalLoading]
  );

  const submitResponse = useCallback(
    async ({ questionId, responseText, audioBlob, responseTime }: SubmitResponsePayload) => {
      if (!sessionId || !testId) return false;
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append('session_id', sessionId);
        formData.append('question_id', String(questionId));
        formData.append('response_time', responseTime ? String(responseTime) : '');
        if (audioBlob) {
          formData.append('audio', audioBlob, 'response.webm');
          formData.append('transcription_required', 'true');
        } else if (responseText) {
          formData.append('response', responseText);
        }

        await apiEndpoints.submitResponse(testId, formData);
        notify('Response submitted', { type: 'success' });
        return true;
      } catch (error: any) {
        notify(error.message || 'Failed to submit response', { type: 'error' });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [notify, sessionId, testId]
  );

  const completeTest = useCallback(async () => {
    if (!sessionId || !testId) return;
    setGlobalLoading(true);
    try {
      const response = await apiEndpoints.completeTest(testId, { session_id: sessionId });
      setResults(response as TestResult);
      notify('Test completed', { type: 'success' });
    } catch (error: any) {
      notify(error.message || 'Failed to complete test', { type: 'error' });
    } finally {
      setGlobalLoading(false);
    }
  }, [notify, sessionId, setGlobalLoading, testId]);

  const resetTest = useCallback(() => {
    setTestId(null);
    setLanguage(null);
    setTestType(null);
    setQuestions([]);
    setResults(null);
  }, []);

  const value = useMemo(
    () => ({
      testId,
      language,
      testType,
      questions,
      isSubmitting,
      results,
      startTest,
      submitResponse,
      completeTest,
      resetTest
    }),
    [
      testId,
      language,
      testType,
      questions,
      isSubmitting,
      results,
      startTest,
      submitResponse,
      completeTest,
      resetTest
    ]
  );

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
};

export const useTest = () => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTest must be used within TestProvider');
  }
  return context;
};
