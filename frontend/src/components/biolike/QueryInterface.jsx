import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { submitQuery } from '../../api/client'

function QueryInterface({ onJobCreated }) {
  const [query, setQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!query.trim()) {
      setError('Please enter a query')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await submitQuery(query)
      onJobCreated({
        jobId: response.job_id,
        query: query,
      })
    } catch (err) {
      console.error('Error submitting query:', err)
      setError('Failed to submit query. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const exampleQueries = [
    'Analyze clinical trials for immunotherapy in lung cancer',
    'Patent landscape analysis for CRISPR gene editing',
    'Latest research on mRNA vaccine technology',
  ]

  return (
    <section className="min-h-screen py-32 px-6 relative">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-mono font-bold text-white mb-4">
            QUERY INTERFACE
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-6" />
          <p className="text-gray-400 font-mono text-sm">
            Enter your pharmaceutical research query to begin analysis
          </p>
        </motion.div>

        {/* Query form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Terminal-style input */}
            <div className="relative bg-black/50 border border-cyan-500/30 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <span className="text-xs font-mono text-gray-500">moleculeX://query</span>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-cyan-400 font-mono text-sm flex-shrink-0 mt-3">{'>'}</span>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your pharmaceutical research query..."
                  className="flex-1 bg-transparent text-white font-mono text-sm outline-none resize-none min-h-[100px] placeholder:text-gray-600"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <p className="text-red-400 font-mono text-sm">
                    <span className="font-bold">[ERROR]</span> {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono text-gray-600">
                Press <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded">Enter</kbd> to submit
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative px-8 py-4 bg-transparent border-2 border-cyan-500/50 text-cyan-400 font-mono text-sm hover:bg-cyan-500/10 transition-all duration-300 rounded disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full"
                      />
                      PROCESSING...
                    </>
                  ) : (
                    <>
                      EXECUTE ANALYSIS
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </>
                  )}
                </span>
                {!isSubmitting && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Example queries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12"
        >
          <h3 className="text-sm font-mono text-gray-500 uppercase tracking-wider mb-4">
            Example Queries
          </h3>
          <div className="space-y-3">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                disabled={isSubmitting}
                className="w-full text-left px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <p className="text-sm font-mono text-gray-400 group-hover:text-cyan-400 transition-colors">
                  <span className="text-cyan-500/50 mr-2">→</span>
                  {example}
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default QueryInterface
