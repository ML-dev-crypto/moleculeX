import { useState } from 'react'
import { motion } from 'framer-motion'

const EXAMPLE_QUERIES = [
  "Respiratory diseases with low competition and high patient burden in India",
  "Emerging cardiovascular drug development opportunities in Asia",
  "Diabetes treatments with fewer than 5 active competitors",
  "Unmet medical needs in oncology with recent patent activity",
]

export default function QueryCard({ onSubmit }) {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (query.trim().length < 10) {
      return
    }
    
    setIsLoading(true)
    await onSubmit(query)
    setIsLoading(false)
  }

  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative rounded-full border-2 transition-all duration-200 ${
            isFocused
              ? 'border-perplexity-primary shadow-lg'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask anything about pharmaceutical research..."
            className="w-full px-6 py-4 pr-14 text-base bg-transparent rounded-full focus:outline-none text-gray-900 placeholder:text-gray-400"
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={isLoading || query.trim().length < 10}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              query.trim().length >= 10 && !isLoading
                ? 'bg-perplexity-primary hover:bg-perplexity-hover text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Character count hint */}
        {query.length > 0 && query.length < 10 && (
          <p className="mt-2 text-xs text-gray-500 text-center">
            Enter at least {10 - query.length} more character{10 - query.length > 1 ? 's' : ''}
          </p>
        )}
      </form>

      {/* Example queries */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <p className="text-sm text-gray-500 mb-3">Try asking:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((example, index) => (
            <motion.button
              key={index}
              onClick={() => handleExampleClick(example)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors border border-gray-200"
            >
              {example}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
