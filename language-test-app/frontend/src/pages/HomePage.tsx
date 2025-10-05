import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { useTest } from '@contexts/TestContext';
import { LanguageCode, TestType } from '@types/index';

const languages: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'German' }
];

const testTypes: { type: TestType; title: string; description: string }[] = [
  {
    type: 'reading',
    title: 'Reading',
    description: 'Improve comprehension through curated passages and questions.'
  },
  {
    type: 'writing',
    title: 'Writing',
    description: 'Craft thoughtful responses with AI-powered feedback.'
  },
  {
    type: 'speaking',
    title: 'Speaking',
    description: 'Practice speaking with real-time audio recording and evaluation.'
  }
];

export const HomePage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');
  const [selectedTestType, setSelectedTestType] = useState<TestType>('reading');
  const [difficulty, setDifficulty] = useState(1);
  const { startTest } = useTest();
  const navigate = useNavigate();

  const handleStart = async () => {
    await startTest({ language: selectedLanguage, testType: selectedTestType, difficulty });
    navigate('/test');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Master German and English with adaptive AI tests
        </h1>
        <p className="mt-3 text-base text-slate-600 sm:text-lg">
          Choose a skill, provide your own OpenAI API key, and get instant insights into your language
          performance.
        </p>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-800">Select Language</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  selectedLanguage === language.code
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-200 text-slate-600 hover:border-primary'
                }`}
                onClick={() => setSelectedLanguage(language.code)}
              >
                {language.label}
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-800">Difficulty</h2>
          <p className="mt-2 text-sm text-slate-500">
            Adjust the difficulty level to match your comfort. Level 1 is beginner friendly, while level 3
            challenges advanced learners.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={3}
              value={difficulty}
              onChange={(event) => setDifficulty(Number(event.target.value))}
              className="flex-1"
            />
            <span className="w-10 rounded-md bg-primary/10 py-1 text-center text-sm font-semibold text-primary">
              {difficulty}
            </span>
          </div>
        </Card>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {testTypes.map((test) => (
          <Card key={test.type} className={selectedTestType === test.type ? 'border-primary' : undefined}>
            <div className="flex h-full flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{test.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{test.description}</p>
              </div>
              <Button
                type="button"
                variant={selectedTestType === test.type ? 'primary' : 'ghost'}
                onClick={() => setSelectedTestType(test.type)}
              >
                {selectedTestType === test.type ? 'Selected' : 'Choose Test'}
              </Button>
            </div>
          </Card>
        ))}
      </section>

      <div className="mt-10 flex justify-center">
        <Button type="button" onClick={handleStart}>
          Start Test
        </Button>
      </div>
    </div>
  );
};
