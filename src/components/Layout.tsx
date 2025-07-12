'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  Search,
  Bell,
  User,
  X,
  LogOut,
  Settings,
  UserCircle,
  HelpCircle,
  Moon,
  Sun,
  Menu,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import NotificationsPanel from './NotificationsPanel'
import ProfileDropdown from './ProfileDropdown'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })
  
  const notificationRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (
        !target.closest('.notifications-panel') &&
        !target.closest('.notifications-trigger')
      ) {
        setNotificationsOpen(false)
      }
      if (
        !target.closest('.profile-dropdown') &&
        !target.closest('.profile-trigger')
      ) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
    }
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-50 transition-colors duration-300 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/"
                className="text-xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300 flex items-center"
              >
                <motion.span
                  initial={{
                    opacity: 0,
                    y: -10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                >
                  FlowQ
                </motion.span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/ask"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Ask New Question
              </Link>

              <button
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={toggleDarkMode}
                aria-label={
                  isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
                }
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              <div className="relative" ref={notificationRef}>
                <button
                  className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 notifications-trigger"
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen)
                    setProfileOpen(false)
                  }}
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <motion.span
                    initial={{
                      scale: 0.8,
                    }}
                    animate={{
                      scale: 1,
                    }}
                    className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                  >
                    3
                  </motion.span>
                </button>
                <AnimatePresence>
                  {notificationsOpen && <NotificationsPanel />}
                </AnimatePresence>
              </div>

              <div className="relative" ref={profileRef}>
                <button
                  className="p-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transform transition-transform duration-300 hover:scale-105 profile-trigger"
                  onClick={() => {
                    setProfileOpen(!profileOpen)
                    setNotificationsOpen(false)
                  }}
                  aria-label="Profile menu"
                >
                  <User className="h-5 w-5 text-white" />
                </button>
                <AnimatePresence>
                  {profileOpen && <ProfileDropdown />}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0,
                }}
                animate={{
                  height: 'auto',
                  opacity: 1,
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.3,
                }}
                className="md:hidden overflow-hidden"
              >
                <div className="pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-800 mt-3">
                  <div className="relative px-4 py-2">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    />
                    <Search className="absolute right-7 top-4.5 h-5 w-5 text-gray-400" />
                  </div>
                  <Link
                    href="/ask"
                    className="block px-4 py-2 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg mx-4"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Ask New Question
                  </Link>
                  <div className="flex items-center justify-between px-4 py-2">
                    <button
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300"
                      onClick={toggleDarkMode}
                    >
                      {isDarkMode ? (
                        <>
                          <Sun className="h-5 w-5" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="h-5 w-5" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </button>
                    <div className="flex items-center space-x-4">
                      <button
                        className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 notifications-trigger"
                        onClick={() => {
                          setNotificationsOpen(!notificationsOpen)
                          setProfileOpen(false)
                        }}
                      >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                          3
                        </span>
                      </button>
                      <button
                        className="p-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 profile-trigger"
                        onClick={() => {
                          setProfileOpen(!profileOpen)
                          setNotificationsOpen(false)
                        }}
                      >
                        <User className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
          }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 py-6 bg-white dark:bg-gray-950 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} FlowQ. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default Layout 