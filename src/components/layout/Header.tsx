import Link from 'next/link';

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <Link href="/" className="text-2xl font-bold">
        DevFlow
      </Link>
      <nav>
        <Link href="/questions" className="mr-4">
          Questions
        </Link>
        <Link href="/tags" className="mr-4">
          Tags
        </Link>
        <Link href="/users" className="mr-4">
          Users
        </Link>
      </nav>
      <div>
        <Link href="/login" className="mr-2">
          Log In
        </Link>
        <Link href="/signup" className="bg-blue-500 px-4 py-2 rounded">
          Sign Up
        </Link>
      </div>
    </header>
  );
};

export default Header;
