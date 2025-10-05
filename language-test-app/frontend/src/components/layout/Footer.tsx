export const Footer = () => {
  return (
    <footer className="mt-12 bg-slate-900 py-6 text-slate-200">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm md:flex-row">
        <p>&copy; {new Date().getFullYear()} Language Test. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};
