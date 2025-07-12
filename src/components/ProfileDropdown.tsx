'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  Award,
  BookOpen,
} from 'lucide-react'

const ProfileDropdown: React.FC = () => {
  // Mock user data
  const user = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    reputation: 1250,
    role: 'Developer',
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: 10,
        scale: 0.95,
      }}
      transition={{
        duration: 0.2,
      }}
      className="absolute right-0 mt-2 w-[calc(100vw-32px)] sm:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden profile-dropdown"
      style={{
        maxWidth: 'calc(100vw - 16px)',
      }}
    >
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-750 dark:to-gray-800">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
            <span className="text-white font-medium">
              {user.name.charAt(0)}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center">
          <Award className="h-4 w-4 text-yellow-500 mr-1" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {user.reputation} reputation
          </span>
          <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {user.role}
          </span>
        </div>
      </div>
      <div className="py-1 max-h-[70vh] sm:max-h-[300px] overflow-y-auto overscroll-contain">
        <Link
          href="/profile"
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-150"
        >
          <User className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
          Your Profile
        </Link>
        <Link
          href="/questions"
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-150"
        >
          <BookOpen className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
          Your Questions
        </Link>
        <Link
          href="/settings"
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-150"
        >
          <Settings className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
          Settings
        </Link>
        <Link
          href="/help"
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-150"
        >
          <HelpCircle className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
          Help Center
        </Link>
      </div>
      <div className="py-1 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850">
        <button className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-150">
          <LogOut className="h-4 w-4 mr-3" />
          Sign out
        </button>
      </div>
    </motion.div>
  )
}

export default ProfileDropdown 