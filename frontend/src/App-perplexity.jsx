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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={handleReset} className="flex items-center gap-2 group">
            <span className="text-2xl">🧬</span>
            <span className="text-xl font-semibold text-gray-900 group-hover:text-perplexity-primary transition-colors">
              MoleculeX
            </span>
          </button>

          {status === 'completed' && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-perplexity-primary hover:bg-gray-50 rounded-lg transition-colors"
            >
              New Search
            </button>
          )}
        </div>
      </header>

      <main className="pt-16">
        {/* Hero / Search Section */}
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-[80vh] flex flex-col items-center justify-center px-4"
            >
              <div className="w-full max-w-3xl">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center mb-12"
                >
                  <h1 className="text-5xl font-bold text-gray-900 mb-4">
                    Pharmaceutical Intelligence
                  </h1>
                  <p className="text-xl text-gray-600">
                    Search clinical trials, patents, and scientific literature with AI
                  </p>
                </motion.div>

                <QueryCard onSubmit={handleSubmitQuery} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        {(isProcessing || status === 'completed') && (
          <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Query Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-perplexity-primary text-white flex items-center justify-center text-sm font-semibold">
                  Q
                </div>
                <div className="flex-1">
                  <p className="text-lg text-gray-900 leading-relaxed">{query}</p>
                  {isProcessing && (
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-perplexity-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-perplexity-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-perplexity-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm text-gray-500">Searching...</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Agent Status */}
            {isProcessing && agents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <AgentStatusRow agents={agents} progress={progress} />
              </motion.div>
            )}

            {/* Results */}
            {status === 'completed' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                {results && <ResultsPanel results={results} />}
                {reportUrl && <ReportDownload reportUrl={reportUrl} jobId={jobId} />}
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      {status === 'idle' && (
        <footer className="py-8 px-4 text-center text-sm text-gray-500">
          <p>© 2025 MoleculeX · AI-Powered Pharmaceutical Intelligence</p>
        </footer>
      )}
    </div>
  )
}

export default App
