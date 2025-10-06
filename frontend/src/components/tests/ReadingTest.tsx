import { useForm } from 'react-hook-form';
import { Button } from '@components/ui/Button';
import { TestQuestion } from '@types/index';

interface ReadingTestProps {
  question: TestQuestion;
  onSubmit: (response: string) => Promise<void>;
}

interface ReadingFormValues {
  response: string;
}

export const ReadingTest = ({ question, onSubmit }: ReadingTestProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ReadingFormValues>({ defaultValues: { response: '' } });

  const submit = handleSubmit(async ({ response }) => {
    await onSubmit(response);
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <article className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700">
        {question.question_text}
      </article>
      <textarea
        {...register('response', { required: 'Please provide an answer.' })}
        className="h-32 w-full rounded-md border border-slate-300 p-3 text-sm focus:border-primary focus:outline-none"
        placeholder="Write your response here"
      />
      {errors.response && <p className="text-sm text-red-600">{errors.response.message}</p>}
      <Button type="submit" isLoading={isSubmitting}>
        Submit Answer
      </Button>
    </form>
  );
};
