'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  Filter,
  Flame,
  Clock,
  ThumbsUp,
  MessageSquare,
  Eye,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const HomePage = () => {
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('newest')

  // Mock data for questions
  const questions = [
    {
      id: 1,
      title:
        'How to join 2 columns in a data set to make a separate column in SQL',
      tags: ['sql', 'data'],
      description:
        'I do not know the code for it as I am a beginner. As an example, what I need to do is like there is a column 1 containing first name and column 2 consists of last name I want a column to combine.',
      user: 'User Name',
      votes: 5,
      answers: 2,
      views: 42,
      timestamp: '2 hours ago',
    },
    {
      id: 2,
      title: 'How to implement authentication with JWT in React',
      tags: ['react', 'jwt', 'authentication'],
      description:
        "I'm trying to implement JWT authentication in my React application but I'm facing some issues with token storage and refresh tokens.",
      user: 'React Dev',
      votes: 10,
      answers: 3,
      views: 120,
      timestamp: '5 hours ago',
    },
    {
      id: 3,
      title: 'Best practices for organizing large React projects',
      tags: ['react', 'architecture', 'best-practices'],
      description:
        "I'm working on a large React project and I'm looking for advice on how to organize components, state management, and folder structure.",
      user: 'Code Organizer',
      votes: 15,
      answers: 4,
      views: 230,
      timestamp: '1 day ago',
    },
  ]

  const filterOptions = [
    {
      id: 'newest',
      label: 'Newest',
      icon: <Clock className="h-4 w-4" />,
    },
    {
      id: 'trending',
      label: 'Trending',
      icon: <Flame className="h-4 w-4" />,
    },
    {
      id: 'most-voted',
      label: 'Most Voted',
      icon: <ThumbsUp className="h-4 w-4" />,
    },
    {
      id: 'unanswered',
      label: 'Unanswered',
      icon: <MessageSquare className="h-4 w-4" />,
    },
  ]

  const container = {
    hidden: {
      opacity: 0,
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <motion.h1
          initial={{
            opacity: 0,
            x: -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
        >
          Questions
        </motion.h1>
        <div className="flex space-x-3 w-full sm:w-auto justify-end">
          <div className="relative">
            <button
              className="flex items-center space-x-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden xs:inline">Filters</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            <AnimatedFilterDropdown
              isOpen={filterOpen}
              options={filterOptions}
              activeFilter={activeFilter}
              onSelect={(id: string) => {
                setActiveFilter(id)
                setFilterOpen(false)
              }}
            />
          </div>
          <Link
            href="/ask"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex-grow sm:flex-grow-0 text-center sm:text-left"
          >
            Ask Question
          </Link>
        </div>
      </div>

      <motion.div
        className="space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {questions.map((question) => (
          <motion.div
            key={question.id}
            variants={item}
            className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300"
          >
            <Link href={`/question/${question.id}`} className="block">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 line-clamp-2">
                {question.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                {question.description}
              </p>
            </Link>
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-md border border-blue-100 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="line-clamp-1">{question.user}</span>
                <span className="mx-2 hidden sm:inline">•</span>
                <span className="hidden sm:inline">{question.timestamp}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  <span className="font-medium">{question.votes}</span>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span className="font-medium">{question.answers}</span>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Eye className="h-4 w-4 mr-1" />
                  <span className="font-medium">{question.views}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 flex justify-center">
        <nav className="flex items-center flex-wrap justify-center">
          <button className="px-3 py-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 mr-1">
            &lt;
          </button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              className={`px-3 py-2 rounded-md transition-colors duration-200 m-1 ${
                page === 1
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {page}
            </button>
          ))}
          <button className="px-3 py-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 ml-1">
            &gt;
          </button>
        </nav>
      </div>
    </div>
  )
}

// Animated Filter Dropdown Component
interface AnimatedFilterDropdownProps {
  isOpen: boolean
  options: Array<{
    id: string
    label: string
    icon: React.ReactNode
  }>
  activeFilter: string
  onSelect: (id: string) => void
}

const AnimatedFilterDropdown: React.FC<AnimatedFilterDropdownProps> = ({
  isOpen,
  options,
  activeFilter,
  onSelect,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
        scale: 0.95,
      }}
      animate={
        isOpen
          ? {
              opacity: 1,
              y: 0,
              scale: 1,
            }
          : {
              opacity: 0,
              y: 10,
              scale: 0.95,
            }
      }
      transition={{
        duration: 0.2,
      }}
      className={`absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 ${
        !isOpen ? 'hidden' : ''
      }`}
    >
      <div className="py-1">
        {options.map((option) => (
          <button
            key={option.id}
            className="flex items-center justify-between px-4 py-2 w-full text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
            onClick={() => onSelect(option.id)}
          >
            <span className="flex items-center">
              <span className="mr-2 text-gray-500 dark:text-gray-400">
                {option.icon}
              </span>
              <span>{option.label}</span>
            </span>
            {activeFilter === option.id && (
              <motion.span
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                }}
              >
                ✓
              </motion.span>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

export default HomePage 