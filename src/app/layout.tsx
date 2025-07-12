import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'FlowQ - Developer Q&A Platform',
  description: 'A modern Q&A platform for developers to ask questions and share knowledge',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
          // Check if dark mode preference exists in localStorage
          const isDarkMode = localStorage.getItem('darkMode') === 'true';
          // Or use system preference if no preference is set
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          
          // Apply dark mode if needed
          if (isDarkMode || (systemPrefersDark && localStorage.getItem('darkMode') === null)) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          `}
        </Script>
      </body>
    </html>
  )
}
