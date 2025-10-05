import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
    <h1 className="text-4xl font-bold text-slate-900">404</h1>
    <p className="text-base text-slate-600">
      We couldn&apos;t find the page you were looking for. Try heading back to the homepage.
    </p>
    <Link
      to="/"
      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
    >
      Return Home
    </Link>
  </div>
);
