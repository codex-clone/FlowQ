import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

const questions = [
  {
    title: 'How to vertically center a div?',
    tags: ['css', 'html'],
    votes: 125,
    answers: 12,
    views: 2500,
  },
  {
    title: 'What is the difference between `let`, `const`, and `var`?',
    tags: ['javascript'],
    votes: 98,
    answers: 7,
    views: 1800,
  },
  {
    title: 'How to fetch data in React?',
    tags: ['react', 'javascript'],
    votes: 210,
    answers: 15,
    views: 4500,
  },
];

export default function Home() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Top Questions</h1>
        <Button>Ask Question</Button>
      </div>
      <div className="flex items-center mb-4">
        <Input placeholder="Search..." className="mr-2" />
        <Button>Search</Button>
      </div>
      <div>
        {questions.map((question, index) => (
          <Card key={index} className="mb-4">
            <CardHeader>
              <CardTitle>{question.title}</CardTitle>
              <CardDescription>
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2"
                  >
                    {tag}
                  </span>
                ))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{question.votes} votes</span>
                <span>{question.answers} answers</span>
                <span>{question.views} views</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
