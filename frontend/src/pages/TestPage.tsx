import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTest } from '@contexts/TestContext';
import { ProgressBar } from '@components/ui/ProgressBar';
import { Button } from '@components/ui/Button';
import { ReadingTest } from '@components/tests/ReadingTest';
import { WritingTest } from '@components/tests/WritingTest';
import { SpeakingTest } from '@components/tests/SpeakingTest';
import { useCountdown } from '@hooks/useCountdown';

const TEST_DURATION_SECONDS = 900;

export const TestPage = () => {
  const { questions, testType, submitResponse, completeTest, testId } = useTest();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responsesSubmitted, setResponsesSubmitted] = useState(0);
  const navigate = useNavigate();
  const { seconds } = useCountdown(TEST_DURATION_SECONDS, Boolean(testId));

  useEffect(() => {
    if (!testId) {
      navigate('/');
    }
  }, [testId, navigate]);

  useEffect(() => {
    if (seconds === 0 && testId) {
      completeTest().then(() => navigate('/results'));
    }
  }, [seconds, testId, completeTest, navigate]);

  if (!questions.length || !testType) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-slate-600">
        <p>Preparing your test session...</p>
      </div>
    );
  }

  const question = questions[currentIndex];
  const progress = (responsesSubmitted / questions.length) * 100;

  const handleContinue = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((index) => index + 1);
    } else {
      completeTest().then(() => navigate('/results'));
    }
  };

  const handleReadingSubmit = async (response: string) => {
    const success = await submitResponse({ questionId: question.id, responseText: response });
    if (success) {
      setResponsesSubmitted((count) => count + 1);
      handleContinue();
    }
  };

  const handleWritingSubmit = async (response: string) => {
    const success = await submitResponse({ questionId: question.id, responseText: response });
    if (success) {
      setResponsesSubmitted((count) => count + 1);
      handleContinue();
    }
  };

  const handleSpeakingSubmit = async (audio: Blob, responseTime: number) => {
    const success = await submitResponse({
      questionId: question.id,
      audioBlob: audio,
      responseTime
    });
    if (success) {
      setResponsesSubmitted((count) => count + 1);
      handleContinue();
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 capitalize">{testType} test</h1>
            <p className="text-sm text-slate-500">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
            Time left: {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
          </div>
        </div>
        <ProgressBar value={progress} />

        {testType === 'reading' && (
          <ReadingTest question={question} onSubmit={handleReadingSubmit} />
        )}
        {testType === 'writing' && (
          <WritingTest question={question} onSubmit={handleWritingSubmit} />
        )}
        {testType === 'speaking' && (
          <SpeakingTest question={question} onSubmit={handleSpeakingSubmit} />
        )}

        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={() => completeTest().then(() => navigate('/results'))}>
            Finish Test Early
          </Button>
        </div>
      </div>
    </div>
  );
};
