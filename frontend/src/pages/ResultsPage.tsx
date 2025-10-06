import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTest } from '@contexts/TestContext';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { formatDateTime } from '@utils/format';

export const ResultsPage = () => {
  const { results, resetTest, questions } = useTest();
  const navigate = useNavigate();

  useEffect(() => {
    if (!results) {
      navigate('/');
    }
  }, [results, navigate]);

  if (!results) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Your Results</h1>
            <p className="text-sm text-slate-500">Generated on {formatDateTime(new Date().toISOString())}</p>
          </div>
          <div className="rounded-xl bg-primary/10 px-4 py-2 text-center">
            <p className="text-xs uppercase text-primary">Overall Score</p>
            <p className="text-3xl font-bold text-primary">{results.score.toFixed(1)}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {results.responses.map((response) => {
            const question = questions.find((question) => question.id === response.question_id);
            return (
              <Card key={response.id}>
                <h3 className="text-base font-semibold text-slate-800">Question</h3>
                <p className="mt-2 text-sm text-slate-600">{question?.question_text}</p>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-medium text-slate-700">Your response:</span> {response.response_text || 'Audio response submitted'}
                  </p>
                  {response.feedback && (
                    <p>
                      <span className="font-medium text-slate-700">Feedback:</span> {response.feedback}
                    </p>
                  )}
                  {typeof response.score === 'number' && (
                    <p>
                      <span className="font-medium text-slate-700">Score:</span> {response.score.toFixed(1)} / 100
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => {
              resetTest();
              navigate('/');
            }}
          >
            Retake Test
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              resetTest();
              navigate('/');
            }}
          >
            Choose Different Test
          </Button>
        </div>
      </div>
    </div>
  );
};
