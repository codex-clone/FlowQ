import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@components/ui/Button';
import { TestQuestion } from '@types/index';

interface WritingTestProps {
  question: TestQuestion;
  onSubmit: (response: string) => Promise<void>;
}

interface WritingFormValues {
  response: string;
}

const getDraftKey = (questionId: number) => `writing-draft-${questionId}`;

export const WritingTest = ({ question, onSubmit }: WritingTestProps) => {
  const draftKey = useMemo(() => getDraftKey(question.id), [question.id]);
  const savedDraft = typeof window !== 'undefined' ? window.localStorage.getItem(draftKey) : '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<WritingFormValues>({ defaultValues: { response: savedDraft || '' } });

  const [wordCount, setWordCount] = useState(0);

  const responseValue = watch('response');

  useEffect(() => {
    const words = responseValue.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
    if (responseValue) {
      window.localStorage.setItem(draftKey, responseValue);
    } else {
      window.localStorage.removeItem(draftKey);
    }
  }, [responseValue, draftKey]);

  const submit = handleSubmit(async ({ response }) => {
    await onSubmit(response);
    window.localStorage.removeItem(draftKey);
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700">
        {question.question_text}
      </p>
      <textarea
        {...register('response', { required: 'Please provide your writing response.' })}
        className="h-48 w-full rounded-md border border-slate-300 p-3 text-sm focus:border-primary focus:outline-none"
        placeholder="Compose your answer"
      />
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Word count: {wordCount}</span>
        <span>Auto-saved</span>
      </div>
      {errors.response && <p className="text-sm text-red-600">{errors.response.message}</p>}
      <Button type="submit" isLoading={isSubmitting}>
        Submit Writing
      </Button>
    </form>
  );
};
