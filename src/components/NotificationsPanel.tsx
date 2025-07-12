'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, MessageSquare, Check, Star, AlertCircle, X } from 'lucide-react'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, Notification } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'new_answer':
      return <MessageSquare className="h-4 w-4 text-blue-500" />
    case 'answer_accepted':
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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const { data, error } = await getNotifications(10)
        
        if (error) {
          console.error('Error fetching notifications:', error)
        } else {
          setNotifications(data || [])
        }
      } catch (err) {
        console.error('Error in notification fetch:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [user])

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, is_read: true } : notification
      ))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(notifications.map(notification => ({ ...notification, is_read: true })))
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch (e) {
      // Fallback if date-fns is not available
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffDays > 0) {
        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
      }
      if (diffHours > 0) {
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
      }
      if (diffMins > 0) {
        return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
      }
      return 'just now';
    }
  }

  // Use mock data if user is not authenticated or for development
  const mockNotifications = [
    {
      id: '1',
      user_id: 'mock',
      type: 'new_answer',
      title: 'New answer to your question',
      message: 'SQL Expert answered your question about joining columns in SQL',
      is_read: false,
      related_id: null,
      related_type: null,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: 'mock',
      type: 'answer_accepted',
      title: 'Answer accepted',
      message: 'Your answer was accepted by React Dev',
      is_read: false,
      related_id: null,
      related_type: null,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      user_id: 'mock',
      type: 'mention',
      title: 'You were mentioned',
      message: 'Code Organizer mentioned you in a comment',
      is_read: true,
      related_id: null,
      related_type: null,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      user_id: 'mock',
      type: 'system',
      title: 'Welcome to FlowQ!',
      message: 'Thanks for joining our community of developers',
      is_read: true,
      related_id: null,
      related_type: null,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  const displayNotifications = user && notifications.length > 0 ? notifications : mockNotifications

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
          <button 
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200 font-medium"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </button>
        </div>
      </div>
      <div className="max-h-[70vh] sm:max-h-[400px] overflow-y-auto overscroll-contain">
        {loading ? (
          <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
            <div className="animate-pulse flex justify-center">
              <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
            <p className="mt-2">Loading notifications...</p>
          </div>
        ) : displayNotifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div>
            {displayNotifications.map((notification, index) => (
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
                className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150 ${!notification.is_read ? 'bg-blue-50 dark:bg-gray-750' : ''}`}
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
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <button
                      className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                      aria-label="Dismiss notification"
                      onClick={() => handleMarkAsRead(notification.id)}
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