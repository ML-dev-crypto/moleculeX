import { useState } from 'react'
import { motion } from 'framer-motion'

const EXAMPLE_QUERIES = [
  "Which respiratory diseases show low competition but high patient burden in India?",
  "What are the emerging opportunities in cardiovascular drug development in Asia?",
  "Show me clinical trials for diabetes treatments with less than 5 active competitors",
  "Find unmet medical needs in oncology with recent patent activity",
]

export default function QueryCard({ onSubmit }) {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (query.trim().length < 10) {
      alert('Please enter a more detailed query (at least 10 characters)')
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
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-4xl mx-auto"
    >
      {/* Glass Card */}
      <div className="backdrop-blur-glass bg-white/70 rounded-3xl shadow-apple-lg overflow-hidden border border-white/30">
        <div className="p-10 md:p-14">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-title font-display text-apple-gray-800 mb-3"
          >
            What would you like to discover?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-apple-gray-600 mb-10 text-lg leading-relaxed"
          >
            Ask about pharmaceutical opportunities, clinical trials, competitive landscapes, or patient burdens.
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Which respiratory diseases show low competition but high patient burden in India?"
                className="w-full px-6 py-5 text-lg bg-white/50 backdrop-blur-sm border border-apple-gray-200/50 rounded-2xl focus:ring-2 focus:ring-apple-lavender-400 focus:border-apple-lavender-400 focus:outline-none transition-all duration-300 resize-none text-apple-gray-800 placeholder:text-apple-gray-400 shadow-sm"
                rows={4}
                disabled={isLoading}
                aria-label="Enter your pharmaceutical research query"
              />
            </motion.div>

            <motion.button
              type="submit"
              disabled={isLoading || query.trim().length < 10}
              className="w-full backdrop-blur-sm bg-apple-gray-800/90 hover:bg-apple-gray-800 text-white font-semibold py-5 px-8 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-apple hover:shadow-apple-lg border border-apple-gray-700/20 focus:outline-none focus:ring-2 focus:ring-apple-lavender-400 focus:ring-offset-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              aria-label="Submit query for analysis"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Starting Analysis...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Run Analysis
                </span>
              )}
            </motion.button>
          </form>

          {/* Example Queries - Horizontal Pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-10"
          >
            <p className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wider mb-4">
              Try these examples:
            </p>
            <div className="space-y-2">
              {EXAMPLE_QUERIES.map((example, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="w-full text-left px-5 py-4 backdrop-blur-sm bg-white/40 hover:bg-white/60 rounded-2xl transition-all duration-300 text-sm text-apple-gray-700 border border-apple-gray-200/30 hover:border-apple-lavender-200 hover:shadow-sm group focus:outline-none focus:ring-2 focus:ring-apple-lavender-400 focus:ring-offset-2"
                  whileHover={{ scale: 1.01, x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.08, duration: 0.4 }}
                  aria-label={`Use example query: ${example}`}
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-apple-lavender-400 group-hover:text-apple-lavender-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="leading-relaxed">{example}</span>
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
