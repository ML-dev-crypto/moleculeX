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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      <div className="p-8 md:p-10 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-white mb-3"
        >
          What would you like to discover?
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 mb-8 text-lg"
        >
          Ask about pharmaceutical opportunities, clinical trials, or competitive landscapes
        </motion.p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Which respiratory diseases show low competition but high patient burden?"
              className="w-full px-6 py-5 text-lg bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-accent-purple focus:border-transparent focus:outline-none transition-all duration-300 resize-none text-gray-100 placeholder:text-gray-500"
              rows={4}
              disabled={isLoading}
            />
          </motion.div>

          <motion.button
            type="submit"
            disabled={isLoading || query.trim().length < 10}
            className="w-full bg-gradient-to-r from-accent-purple to-accent-pink text-white font-semibold py-5 px-8 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-accent-purple/50 focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-offset-2 focus:ring-offset-dark-950"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Run Analysis
              </span>
            )}
          </motion.button>
        </form>

        {/* Example Queries */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10"
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Try these examples:
          </p>
          <div className="space-y-2">
            {EXAMPLE_QUERIES.map((example, index) => (
              <motion.button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="w-full text-left px-5 py-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 text-sm text-gray-300 border border-white/5 hover:border-accent-purple/50 group"
                whileHover={{ x: 4 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.08 }}
              >
                <span className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-accent-purple flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{example}</span>
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
