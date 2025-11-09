import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QueryCard from './components/QueryCard'
import AgentStatusRow from './components/AgentStatusRow'
import ResultsPanel from './components/ResultsPanel'
import ReportDownload from './components/ReportDownload'
import AnimatedBackground from './components/AnimatedBackground'
import Footer from './components/Footer'
import { submitQuery, getJobStatus, getJobResult } from './api/client'
import useWebSocket from './hooks/useWebSocket'

function App() {
  const [jobId, setJobId] = useState(null)
  const [query, setQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [agents, setAgents] = useState([])
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle')
  const [reportUrl, setReportUrl] = useState(null)
  const [results, setResults] = useState(null)

  // WebSocket hook for real-time updates
  useWebSocket(jobId, (message) => {
    const { event_type, data } = message

    switch (event_type) {
      case 'job_started':
        setIsProcessing(true)
        setStatus('running')
        break
      
      case 'agent_update':
        setAgents(prev => {
          const newAgents = [...prev]
          const agentIndex = newAgents.findIndex(a => a.name === data.agent)
          if (agentIndex >= 0) {
            newAgents[agentIndex] = {
              ...newAgents[agentIndex],
              status: data.status,
              result_count: data.result_count || 0
            }
          }
          return newAgents
        })
        break
      
      case 'job_completed':
        setStatus('completed')
        setIsProcessing(false)
        setProgress(100)
        if (data.report_url) {
          setReportUrl(data.report_url)
        }
        // Fetch final results
        fetchResults(jobId)
        break
      
      case 'job_failed':
        setStatus('failed')
        setIsProcessing(false)
        break
      
      default:
        break
    }
  })

  const fetchResults = async (jId) => {
    try {
      const data = await getJobResult(jId)
      setResults(data)
      // Set report URL if available
      if (data.report_url) {
        setReportUrl(data.report_url)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    }
  }

  const handleSubmitQuery = async (userQuery) => {
    try {
      setQuery(userQuery)
      setIsProcessing(true)
      setStatus('queued')
      setProgress(0)
      setReportUrl(null)
      setResults(null)
      
      // Initialize agents
      setAgents([
        { name: 'Master Agent', status: 'idle', result_count: 0 },
        { name: 'Clinical Trials Agent', status: 'idle', result_count: 0 },
        { name: 'Patent Agent', status: 'idle', result_count: 0 },
        { name: 'Web Intel Agent', status: 'idle', result_count: 0 },
      ])

      const response = await submitQuery(userQuery)
      setJobId(response.job_id)
      
      // Poll for progress updates
      pollProgress(response.job_id)
    } catch (error) {
      console.error('Error submitting query:', error)
      setIsProcessing(false)
      setStatus('failed')
    }
  }

  const pollProgress = async (jId) => {
    const interval = setInterval(async () => {
      try {
        const data = await getJobStatus(jId)
        setProgress(data.progress)
        setAgents(data.agents)
        
        if (data.status === 'completed') {
          clearInterval(interval)
          setStatus('completed')
            setIsProcessing(false)
            // Automatically fetch results when completed
            await fetchResults(jId)
          } else if (data.status === 'failed') {
            clearInterval(interval)
            setStatus('failed')
            setIsProcessing(false)
          }
        }
      } catch (error) {
        console.error('Error polling progress:', error)
      }
    }, 2000)

    // Clear interval after 5 minutes
    setTimeout(() => clearInterval(interval), 300000)
  }

  const handleReset = () => {
    setJobId(null)
    setQuery('')
    setIsProcessing(false)
    setAgents([])
    setProgress(0)
    setStatus('idle')
    setReportUrl(null)
    setResults(null)
  }

  const scrollToQuery = () => {
    const querySection = document.getElementById('query-section')
    if (querySection) {
      querySection.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Beautiful Gradient Background - only on hero */}
      {status === 'idle' && (
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.3),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.3),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,rgba(236,72,153,0.2),transparent_50%)]"></div>
          <div className="absolute inset-0 backdrop-blur-3xl"></div>
        </div>
      )}
      
      {/* Animated Background for processing/results */}
      {(isProcessing || status === 'completed') && <AnimatedBackground />}
      
      {/* Minimal Translucent Navbar */}
      {(isProcessing || status === 'completed') && (
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-strong bg-white/80 border-b border-white/30 shadow-apple"
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center">
            <button onClick={handleReset} className="flex items-center gap-3 hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-full px-4 py-2">
              <span className="text-2xl">🧬</span>
              <span className="text-lg font-display text-apple-gray-800 font-semibold">MoleculeX</span>
            </button>
          </div>
        </motion.nav>
      )}
      
      <div className="relative z-10">
        {/* Full-Height Centered Hero Section */}
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.section
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-screen flex flex-col items-center justify-center px-6"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-center max-w-3xl mx-auto"
              >
                {/* DNA Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, type: 'spring', bounce: 0.4 }}
                  className="mb-8"
                >
                  <div className="inline-block">
                    <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                      <defs>
                        <linearGradient id="dnaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#EC4899" />
                          <stop offset="50%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                      </defs>
                      {/* DNA helix */}
                      <path d="M20,20 Q30,50 20,80" stroke="url(#dnaGradient)" strokeWidth="4" fill="none" strokeLinecap="round"/>
                      <path d="M80,20 Q70,50 80,80" stroke="url(#dnaGradient)" strokeWidth="4" fill="none" strokeLinecap="round"/>
                      <line x1="20" y1="30" x2="80" y2="30" stroke="url(#dnaGradient)" strokeWidth="2" opacity="0.6"/>
                      <line x1="25" y1="50" x2="75" y2="50" stroke="url(#dnaGradient)" strokeWidth="2" opacity="0.6"/>
                      <line x1="20" y1="70" x2="80" y2="70" stroke="url(#dnaGradient)" strokeWidth="2" opacity="0.6"/>
                      <circle cx="20" cy="20" r="4" fill="#EC4899"/>
                      <circle cx="80" cy="20" r="4" fill="#3B82F6"/>
                      <circle cx="20" cy="80" r="4" fill="#3B82F6"/>
                      <circle cx="80" cy="80" r="4" fill="#EC4899"/>
                    </svg>
                  </div>
                </motion.div>
                
                {/* Title */}
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight"
                >
                  MoleculeX
                </motion.h1>
                
                {/* Subtitle */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-xl md:text-2xl text-gray-700 font-medium mb-4"
                >
                  AI-powered pharmaceutical intelligence platform
                </motion.p>
                
                {/* Description */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-12"
                >
                  Discover clinical trials, analyze patent landscapes, and explore scientific literature—all in one unified search experience
                </motion.p>

                {/* CTA Button */}
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  onClick={scrollToQuery}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative inline-flex items-center gap-3 px-10 py-4 text-lg font-semibold text-white rounded-full overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 transition-transform group-hover:scale-110"></div>
                  <span className="relative">Start Analysis</span>
                  <svg className="relative w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </motion.button>

                {/* Scroll Hint */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="mt-20 flex flex-col items-center gap-3"
                >
                  <span className="text-sm text-gray-500 font-medium">Scroll to explore</span>
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Query Section - Full Width with alternating background */}
        <section id="query-section" className="bg-section-gradient py-16 px-6">
          <div className="max-w-5xl mx-auto w-full">
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <QueryCard onSubmit={handleSubmitQuery} />
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Two-Column Layout for Processing/Results - 95% width */}
        {(isProcessing || status === 'completed') && (
          <div className={`${(isProcessing || status === 'completed') ? 'pt-20' : ''} bg-white`}>
            <div className="max-w-screen-2xl mx-auto w-[95%]">
              <div className="grid lg:grid-cols-12 gap-8 py-12">
                {/* LEFT PANE - Query & Status (Sticky) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="lg:sticky lg:top-24 space-y-6">
                    {/* Query Display Card */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="backdrop-blur-glass bg-white/70 rounded-3xl shadow-apple border border-white/30 p-8"
                    >
                      <h3 className="text-sm font-semibold text-apple-gray-500 uppercase tracking-wider mb-3">
                        Your Query
                      </h3>
                      <p className="text-lg text-apple-gray-800 font-medium leading-relaxed mb-6">{query}</p>

                      {/* Progress Bar */}
                      {isProcessing && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-apple-gray-600">Analysis Progress</span>
                            <span className="text-sm font-semibold text-apple-lavender-500">{progress}%</span>
                          </div>
                          <div className="w-full bg-apple-gray-200/50 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                            <motion.div
                              className="bg-gradient-to-r from-apple-lavender-400 to-apple-lavender-500 h-full rounded-full relative overflow-hidden"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                              <motion.div
                                className="absolute inset-0 bg-shimmer-gradient"
                                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                style={{ backgroundSize: '200% 100%' }}
                              />
                            </motion.div>
                          </div>
                        </div>
                      )}

                      {status === 'completed' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleReset}
                          className="w-full px-6 py-3 backdrop-blur-sm bg-apple-gray-800/90 hover:bg-apple-gray-900 text-white rounded-2xl transition-all duration-300 shadow-apple font-medium"
                        >
                          New Analysis
                        </motion.button>
                      )}
                    </motion.div>

                    {/* Agent Status */}
                    <AgentStatusRow agents={agents} />
                  </div>
                </div>

              {/* RIGHT PANE - Results (Scrollable) */}
              <div className="lg:col-span-7">
                <div className="space-y-6">
                  {status === 'completed' && results && (
                    <ResultsPanel results={results} />
                  )}

                  {reportUrl && (
                    <ReportDownload reportUrl={reportUrl} jobId={jobId} />
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Footer */}
        {(status === 'idle' || status === 'completed') && <Footer />}
      </div>
    </div>
  )
}

export default App
