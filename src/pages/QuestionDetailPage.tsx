'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowUp,
  ArrowDown,
  Check,
  MessageSquare,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Code,
  Share2,
  BookmarkPlus,
} from 'lucide-react'
import { motion } from 'framer-motion'

const QuestionDetailPage = () => {
  const params = useParams()
  const id = params.id
  const [answerText, setAnswerText] = useState('')

  // Mock data for the question
  const question = {
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
  }

  // Mock data for answers
  const answers = [
    {
      id: 1,
      content:
        "You can use the concatenation operator || in SQL to combine two columns:\n\n```sql\nSELECT column1 || ' ' || column2 AS full_name FROM your_table;\n```\n\nOr if you're using MySQL, you can use CONCAT():\n\n```sql\nSELECT CONCAT(column1, ' ', column2) AS full_name FROM your_table;\n```",
      user: 'SQL Expert',
      votes: 7,
      isAccepted: true,
      timestamp: '1 hour ago',
    },
    {
      id: 2,
      content:
        "Another approach is to use the CONCAT_WS function, which allows you to specify a separator:\n\n```sql\nSELECT CONCAT_WS(' ', column1, column2) AS full_name FROM your_table;\n```\n\nThis is particularly useful when you need to handle NULL values.",
      user: 'Database Dev',
      votes: 3,
      isAccepted: false,
      timestamp: '45 minutes ago',
    },
  ]

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting answer:', answerText)
    // Handle answer submission
  }

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
      <div className="mb-4">
        <Link
          href="/"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
        >
          <motion.span
            initial={{
              x: 10,
            }}
            animate={{
              x: 0,
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            ←
          </motion.span>
          <span className="ml-1">Back to questions</span>
        </Link>
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
        }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {question.title}
        </h1>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <span>Asked {question.timestamp}</span>
          <span className="mx-2">•</span>
          <span>Viewed {question.views} times</span>
        </div>
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex sm:flex-col items-center sm:items-center order-2 sm:order-1 justify-center sm:justify-start">
            <motion.button
              whileHover={{
                scale: 1.1,
              }}
              whileTap={{
                scale: 0.9,
              }}
              className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200"
              aria-label="Upvote"
            >
              <ArrowUp className="h-6 w-6" />
            </motion.button>
            <motion.span
              initial={{
                scale: 0.8,
              }}
              animate={{
                scale: 1,
              }}
              className="mx-2 sm:my-2 font-medium text-gray-700 dark:text-gray-300"
            >
              {question.votes}
            </motion.span>
            <motion.button
              whileHover={{
                scale: 1.1,
              }}
              whileTap={{
                scale: 0.9,
              }}
              className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors duration-200"
              aria-label="Downvote"
            >
              <ArrowDown className="h-6 w-6" />
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.1,
              }}
              whileTap={{
                scale: 0.9,
              }}
              className="ml-4 sm:ml-0 sm:mt-4 p-1 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors duration-200"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.1,
              }}
              whileTap={{
                scale: 0.9,
              }}
              className="ml-4 sm:ml-0 sm:mt-2 p-1 text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors duration-200"
              aria-label="Bookmark"
            >
              <BookmarkPlus className="h-5 w-5" />
            </motion.button>
          </div>
          <div className="flex-1 order-1 sm:order-2">
            <div className="prose dark:prose-invert max-w-none mb-6">
              <p>{question.description}</p>
            </div>
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
            <div className="flex justify-end">
              <motion.div
                whileHover={{
                  y: -2,
                }}
                className="bg-blue-50 dark:bg-gray-700 rounded-md p-3 inline-flex items-center transition-transform duration-200"
              >
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Asked by <span className="font-medium">{question.user}</span>{' '}
                  on {question.timestamp}
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <span>{answers.length} Answers</span>
          <motion.div
            initial={{
              scale: 0,
            }}
            animate={{
              scale: 1,
            }}
            transition={{
              delay: 0.3,
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
            className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-full"
          >
            1 Accepted
          </motion.div>
        </h2>
        <motion.div variants={container} initial="hidden" animate="show">
          {answers.map((answer) => (
            <motion.div
              key={answer.id}
              variants={item}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-4"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex sm:flex-col items-center sm:items-center order-2 sm:order-1 justify-center sm:justify-start">
                  <motion.button
                    whileHover={{
                      scale: 1.1,
                    }}
                    whileTap={{
                      scale: 0.9,
                    }}
                    className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200"
                  >
                    <ArrowUp className="h-6 w-6" />
                  </motion.button>
                  <span className="mx-2 sm:my-2 font-medium text-gray-700 dark:text-gray-300">
                    {answer.votes}
                  </span>
                  <motion.button
                    whileHover={{
                      scale: 1.1,
                    }}
                    whileTap={{
                      scale: 0.9,
                    }}
                    className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors duration-200"
                  >
                    <ArrowDown className="h-6 w-6" />
                  </motion.button>
                  {answer.isAccepted && (
                    <motion.div
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
                      className="ml-4 sm:ml-0 sm:mt-2 p-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full"
                      title="Accepted answer"
                    >
                      <Check className="h-5 w-5" />
                    </motion.div>
                  )}
                </div>
                <div className="flex-1 order-1 sm:order-2">
                  <div className="prose dark:prose-invert max-w-none mb-6 whitespace-pre-line">
                    {answer.content}
                  </div>
                  <div className="flex justify-end">
                    <motion.div
                      whileHover={{
                        y: -2,
                      }}
                      className="bg-blue-50 dark:bg-gray-700 rounded-md p-3 inline-flex items-center transition-transform duration-200"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Answered by{' '}
                        <span className="font-medium">{answer.user}</span> on{' '}
                        {answer.timestamp}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          delay: 0.3,
        }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Your Answer
        </h2>
        <form onSubmit={handleSubmitAnswer}>
          <div className="border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden mb-6">
            <div className="flex flex-wrap items-center gap-1 px-2 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 overflow-x-auto">
              <motion.button
                type="button"
                whileHover={{
                  scale: 1.1,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                <Bold className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </motion.button>
              <motion.button
                type="button"
                whileHover={{
                  scale: 1.1,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                <Italic className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </motion.button>
              <motion.button
                type="button"
                whileHover={{
                  scale: 1.1,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                <Underline className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </motion.button>
              <div className="h-4 border-r border-gray-300 dark:border-gray-700 mx-1"></div>
              <motion.button
                type="button"
                whileHover={{
                  scale: 1.1,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                <List className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </motion.button>
              <motion.button
                type="button"
                whileHover={{
                  scale: 1.1,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                <ListOrdered className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </motion.button>
              <div className="h-4 border-r border-gray-300 dark:border-gray-700 mx-1"></div>
              <motion.button
                type="button"
                whileHover={{
                  scale: 1.1,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                <MessageSquare className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </motion.button>
              <motion.button
                type="button"
                whileHover={{
                  scale: 1.1,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                <Code className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </motion.button>
            </div>
            <textarea
              placeholder="Write your answer here..."
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none min-h-[200px] resize-y transition-colors duration-200"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            ></textarea>
          </div>
          <div className="flex justify-end">
            <motion.button
              type="submit"
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Submit
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default QuestionDetailPage 