import { Link } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'API Key Setup', to: '/api-key' }
];

export const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold text-primary">
          <span aria-hidden className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
            LT
          </span>
          <span>Language Test</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-slate-600 transition hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Menu as="div" className="relative md:hidden">
          <Menu.Button className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-white">
            <span className="sr-only">Open navigation</span>
            <Bars3Icon className="h-6 w-6" />
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md bg-white py-2 shadow-lg focus:outline-none">
            {navLinks.map((link) => (
              <Menu.Item key={link.to}>
                {({ active }) => (
                  <Link
                    to={link.to}
                    className={clsx(
                      'block px-4 py-2 text-sm text-slate-700',
                      active && 'bg-slate-100'
                    )}
                  >
                    {link.label}
                  </Link>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Menu>
      </div>
    </header>
  );
};
