import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SessionProvider } from '@contexts/SessionContext';
import { UIProvider, useUI } from '@contexts/UIContext';
import { TestProvider } from '@contexts/TestContext';
import { ApiKeyProvider } from '@contexts/ApiKeyContext';
import { Header } from '@components/layout/Header';
import { Footer } from '@components/layout/Footer';
import { LoadingSpinner } from '@components/layout/LoadingSpinner';
import { ErrorBoundary } from '@components/layout/ErrorBoundary';
import { HomePage } from '@pages/HomePage';
import { APIKeySetup } from '@pages/APIKeySetup';
import { TestPage } from '@pages/TestPage';
import { ResultsPage } from '@pages/ResultsPage';
import { NotFoundPage } from '@pages/NotFoundPage';
import { useSession } from '@contexts/SessionContext';

const GlobalLoader = () => {
  const { isGlobalLoading } = useUI();
  const { isLoading } = useSession();

  if (!isGlobalLoading && !isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-20 z-50 flex justify-center">
      <LoadingSpinner label="Loading..." className="rounded-full bg-white/90 px-4 py-2 shadow" />
    </div>
  );
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/api-key" element={<APIKeySetup />} />
    <Route path="/test" element={<TestPage />} />
    <Route path="/results" element={<ResultsPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export const App = () => (
  <BrowserRouter>
    <UIProvider>
      <SessionProvider>
        <ApiKeyProvider>
          <TestProvider>
            <ErrorBoundary>
              <div className="flex min-h-screen flex-col bg-slate-50">
                <Header />
                <main className="flex-1">
                  <AppRoutes />
                </main>
                <Footer />
              </div>
              <GlobalLoader />
              <ToastContainer position="bottom-right" autoClose={5000} newestOnTop closeOnClick pauseOnHover />
            </ErrorBoundary>
          </TestProvider>
        </ApiKeyProvider>
      </SessionProvider>
    </UIProvider>
  </BrowserRouter>
);
