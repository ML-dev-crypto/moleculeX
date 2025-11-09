import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QueryCard from './components/QueryCard'
import AgentStatusRow from './components/AgentStatusRow'
import ResultsPanel from './components/ResultsPanel'
import ReportDownload from './components/ReportDownload'
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

  const pollIntervalRef = useRef(null)
  const pollTimeoutRef = useRef(null)

  useWebSocket(jobId, (message) => {
    const { event_type, data } = message ?? {}

    switch (event_type) {
      case 'job_started':
        setIsProcessing(true)
        setStatus('running')
        break

      case 'agent_update':
        setAgents((prev) => {
          const newAgents = [...prev]
          const idx = newAgents.findIndex((a) => a.name === data.agent)
          if (idx >= 0) {
            newAgents[idx] = {
              ...newAgents[idx],
              status: data.status,
              result_count: data.result_count || 0,
            }
          }
          return newAgents
        })
        break

      case 'job_completed': {
        setStatus('completed')
        setIsProcessing(false)
        setProgress(100)
        if (data?.report_url) setReportUrl(data.report_url)
        const jId = data?.job_id ?? jobId
        if (jId) fetchResults(jId)
        clearPolling()
        break
      }

      case 'job_failed':
        setStatus('failed')
        setIsProcessing(false)
        clearPolling()
        break

      default:
        break
    }
  })

  useEffect(() => {
    return () => clearPolling()
  }, [])

  const clearPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current)
      pollTimeoutRef.current = null
    }
  }

  const fetchResults = async (jId) => {
    try {
      const data = await getJobResult(jId)
      setResults(data)
      if (data?.report_url) setReportUrl(data.report_url)
    } catch (err) {
      console.error('Error fetching results:', err)
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

      setAgents([
        { name: 'Master Agent', status: 'idle', result_count: 0 },
        { name: 'Clinical Trials Agent', status: 'idle', result_count: 0 },
        { name: 'Patent Agent', status: 'idle', result_count: 0 },
        { name: 'Web Intel Agent', status: 'idle', result_count: 0 },
      ])

      const response = await submitQuery(userQuery)
      const jId = response?.job_id
      if (!jId) throw new Error('submitQuery did not return job_id')
      setJobId(jId)
      clearPolling()
      pollProgress(jId)
    } catch (err) {
      console.error('Error submitting query:', err)
      setIsProcessing(false)
      setStatus('failed')
    }
  }

  const pollProgress = (jId) => {
    pollIntervalRef.current = setInterval(async () => {
      try {
        const data = await getJobStatus(jId)
        if (!data) return
        if (typeof data.progress === 'number') setProgress(data.progress)
        if (Array.isArray(data.agents)) setAgents(data.agents)
        if (data.status) setStatus(data.status)

        if (data.status === 'completed') {
          clearPolling()
          setIsProcessing(false)
          await fetchResults(jId)
        } else if (data.status === 'failed') {
          clearPolling()
          setIsProcessing(false)
          setStatus('failed')
        }
      } catch (err) {
        console.error('Error polling progress:', err)
      }
    }, 2000)

    pollTimeoutRef.current = setTimeout(() => {
      clearPolling()
    }, 300000)
  }

  const handleReset = () => {
    clearPolling()
    setJobId(null)
    setQuery('')
    setIsProcessing(false)
    setAgents([])
    setProgress(0)
    setStatus('idle')
    setReportUrl(null)
    setResults(null)
  }

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-blue/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-dark-950/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="flex items-center gap-3 group"
            >
              <span className="text-2xl">🧬</span>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-accent-purple via-accent-pink to-accent-blue bg-clip-text text-transparent">
                  MoleculeX
                </h1>
                <p className="text-xs text-gray-500">AI Intelligence Platform</p>
              </div>
            </button>

            <div className="flex items-center gap-4">
              {isProcessing && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
                >
                  <div className="w-2 h-2 rounded-full bg-accent-purple animate-pulse" />
                  <span className="text-sm text-gray-400">Analyzing...</span>
                </motion.div>
              )}

              {status === 'completed' && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={handleReset}
                  className="px-6 py-2 bg-gradient-to-r from-accent-purple to-accent-pink text-white font-semibold rounded-full hover:shadow-lg hover:shadow-accent-purple/50 transition-all"
                >
                  New Analysis
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="relative z-10 pt-20">
        {/* Hero Section */}
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.section
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-5xl mx-auto"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mb-8 inline-block"
                >
                  <div className="text-8xl">🧬</div>
                </motion.div>

                <h1 className="text-7xl md:text-8xl font-bold mb-6 leading-none">
                  <span className="bg-gradient-to-r from-accent-purple via-accent-pink to-accent-blue bg-clip-text text-transparent">
                    Pharmaceutical
                  </span>
                  <br />
                  <span className="text-white">Intelligence</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Unlock insights from clinical trials, patents, and scientific literature with AI-powered analysis
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
                  {['Clinical Trials', 'Patent Analysis', 'Literature Review', 'AI-Powered'].map((tag, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300"
                    >
                      {tag}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Query Section */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {status === 'idle' && <QueryCard onSubmit={handleSubmitQuery} />}
            </AnimatePresence>
          </div>
        </section>

        {/* Results Section */}
        {(isProcessing || status === 'completed') && (
          <div className="py-12 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-12 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-4">
                  <div className="lg:sticky lg:top-24 space-y-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl"
                    >
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Your Query
                      </h3>
                      <p className="text-gray-200 leading-relaxed mb-6">{query}</p>

                      {isProcessing && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Progress</span>
                            <span className="text-sm font-semibold text-accent-purple">{progress}%</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                            <motion.div
                              className="bg-gradient-to-r from-accent-purple to-accent-pink h-full rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>

                    <AgentStatusRow agents={agents} />
                  </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-8">
                  {status === 'completed' && results && <ResultsPanel results={results} />}
                  {reportUrl && <ReportDownload reportUrl={reportUrl} jobId={jobId} />}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {status === 'idle' && (
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 px-6 border-t border-white/5"
          >
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-gray-500 text-sm">
                © 2025 MoleculeX. AI-Powered Pharmaceutical Intelligence.
              </p>
            </div>
          </motion.footer>
        )}
      </div>
    </div>
  )
}

export default App
