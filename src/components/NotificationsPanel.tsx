'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Bell, MessageSquare, Check, Star, AlertCircle, X } from 'lucide-react'

// Mock data for notifications
const notifications = [
  {
    id: 1,
    type: 'answer',
    title: 'New answer to your question',
    message: 'SQL Expert answered your question about joining columns in SQL',
    time: '5 minutes ago',
    isRead: false,
  },
  {
    id: 2,
    type: 'accepted',
    title: 'Answer accepted',
    message: 'Your answer was accepted by React Dev',
    time: '2 hours ago',
    isRead: false,
  },
  {
    id: 3,
    type: 'mention',
    title: 'You were mentioned',
    message: 'Code Organizer mentioned you in a comment',
    time: '1 day ago',
    isRead: true,
  },
  {
    id: 4,
    type: 'system',
    title: 'Welcome to FlowQ!',
    message: 'Thanks for joining our community of developers',
    time: '3 days ago',
    isRead: true,
  },
]

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'answer':
      return <MessageSquare className="h-4 w-4 text-blue-500" />
    case 'accepted':
      return <Check className="h-4 w-4 text-green-500" />
    case 'mention':
      return <Star className="h-4 w-4 text-yellow-500" />
    case 'system':
      return <AlertCircle className="h-4 w-4 text-purple-500" />
    default:
      return <Bell className="h-4 w-4 text-gray-500" />
  }
}

const NotificationsPanel: React.FC = () => {
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
      className="absolute right-0 mt-2 w-[calc(100vw-32px)] sm:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden notifications-panel"
      style={{
        maxWidth: 'calc(100vw - 16px)',
        transform: 'translateX(0)',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
          <Bell className="h-4 w-4 mr-2 text-blue-500" />
          Notifications
        </h3>
        <div className="flex space-x-2">
          <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200 font-medium">
            Mark all as read
          </button>
        </div>
      </div>
      <div className="max-h-[70vh] sm:max-h-[400px] overflow-y-auto overscroll-contain">
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{
                  x: -20,
                  opacity: 0,
                }}
                animate={{
                  x: 0,
                  opacity: 1,
                }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.05,
                }}
                className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150 ${!notification.isRead ? 'bg-blue-50 dark:bg-gray-750' : ''}`}
              >
                <div className="flex">
                  <div className="flex-shrink-0 mr-3 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {notification.time}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <button
                      className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                      aria-label="Dismiss notification"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-center sticky bottom-0 bg-white dark:bg-gray-800 z-10">
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200 font-medium">
          View all notifications
        </button>
      </div>
    </motion.div>
  )
}

export default NotificationsPanel 