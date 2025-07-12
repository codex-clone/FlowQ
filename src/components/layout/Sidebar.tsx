import Link from 'next/link';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-100 p-4">
      <nav className="flex flex-col">
        <Link href="/" className="py-2">
          Home
        </Link>
        <Link href="/questions" className="py-2">
          Questions
        </Link>
        <Link href="/tags" className="py-2">
          Tags
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
