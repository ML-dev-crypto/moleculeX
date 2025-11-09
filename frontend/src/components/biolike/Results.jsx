import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getJobStatus, getJobResult } from '../../api/client'
import useWebSocket from '../../hooks/useWebSocket'
import Chatbot from './Chatbot'

function Results({ jobData, onNewAnalysis, onBackToHome }) {
  const [status, setStatus] = useState('queued')
  const [progress, setProgress] = useState(0)
  const [agents, setAgents] = useState([
    { name: 'Master Agent', status: 'idle', result_count: 0 },
    { name: 'Clinical Trials Agent', status: 'idle', result_count: 0 },
    { name: 'Patent Agent', status: 'idle', result_count: 0 },
    { name: 'Web Intel Agent', status: 'idle', result_count: 0 },
  ])
  const [results, setResults] = useState(null)
  const [reportUrl, setReportUrl] = useState(null)

  const pollIntervalRef = useRef(null)

  useWebSocket(jobData?.jobId, (message) => {
    const { event_type, data } = message ?? {}

    switch (event_type) {
      case 'job_started':
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

      case 'job_completed':
        setStatus('completed')
        setProgress(100)
        if (data?.report_url) setReportUrl(data.report_url)
        if (data?.job_id ?? jobData?.jobId) fetchResults(data?.job_id ?? jobData?.jobId)
        clearPolling()
        break

      case 'job_failed':
        setStatus('failed')
        clearPolling()
        break

      default:
        break
    }
  })

  useEffect(() => {
    if (jobData?.jobId) {
      pollProgress(jobData.jobId)
    }

    return () => clearPolling()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobData])

  const clearPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }

  const pollProgress = (jobId) => {
    pollIntervalRef.current = setInterval(async () => {
      try {
        const data = await getJobStatus(jobId)
        if (!data) return
        if (typeof data.progress === 'number') setProgress(data.progress)
        if (Array.isArray(data.agents)) setAgents(data.agents)
        if (data.status) setStatus(data.status)

        if (data.status === 'completed') {
          clearPolling()
          await fetchResults(jobId)
        } else if (data.status === 'failed') {
          clearPolling()
        }
      } catch (err) {
        console.error('Error polling progress:', err)
      }
    }, 2000)
  }

  const fetchResults = async (jobId) => {
    try {
      const data = await getJobResult(jobId)
      setResults(data)
      if (data?.report_url) setReportUrl(data.report_url)
    } catch (err) {
      console.error('Error fetching results:', err)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'text-cyan-400'
      case 'completed':
        return 'text-green-400'
      case 'failed':
        return 'text-red-400'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusIndicator = (status) => {
    switch (status) {
      case 'running':
        return '◐'
      case 'completed':
        return '✓'
      case 'failed':
        return '✗'
      default:
        return '○'
    }
  }

  return (
    <section className="min-h-screen py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-mono font-bold text-white mb-4">
            ANALYSIS RESULTS
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mb-6" />
          
          {/* Query display */}
          <div className="bg-black/50 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
            <h3 className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">
              Query
            </h3>
            <p className="text-white font-mono text-sm">
              {jobData?.query}
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Progress & Agents */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-black/50 border border-white/10 rounded-lg p-6 backdrop-blur-sm"
            >
              <h3 className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-4">
                System Status
              </h3>

              <div className="space-y-4">
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-white">Progress</span>
                    <span className={`text-sm font-mono font-bold ${getStatusColor(status)}`}>
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between py-3 border-t border-white/5">
                  <span className="text-sm font-mono text-gray-400">Status</span>
                  <span className={`text-sm font-mono font-bold uppercase ${getStatusColor(status)}`}>
                    {getStatusIndicator(status)} {status}
                  </span>
                </div>

                {/* New Analysis Button */}
                {status === 'completed' && onNewAnalysis && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={onNewAnalysis}
                    className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-mono text-sm rounded hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    [NEW ANALYSIS]
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Agents status */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-black/50 border border-white/10 rounded-lg p-6 backdrop-blur-sm"
            >
              <h3 className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-4">
                Agent Status
              </h3>

              <div className="space-y-3">
                {agents.map((agent, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-mono text-white mb-1">
                        {agent.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono ${getStatusColor(agent.status)}`}>
                          {getStatusIndicator(agent.status)} {agent.status}
                        </span>
                        {agent.result_count > 0 && (
                          <span className="text-xs font-mono text-gray-600">
                            • {agent.result_count} results
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right column - Results */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {status === 'completed' && results && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="space-y-6"
                >
                  {/* Clinical Trials */}
                  {results.clinical_trials && results.clinical_trials.length > 0 && (
                    <div className="bg-black/50 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
                      <h3 className="text-lg font-mono font-bold text-cyan-400 mb-4 flex items-center gap-2">
                        <span>🧪</span> Clinical Trials ({results.clinical_trials.length})
                      </h3>
                      <div className="space-y-4">
                        {results.clinical_trials.slice(0, 5).map((trial, i) => (
                          <div key={i} className="border-l-2 border-cyan-500/30 pl-4 py-2">
                            <div className="text-sm font-mono text-white mb-1">
                              {trial.title || trial.study_title || 'Untitled Study'}
                            </div>
                            <div className="text-xs font-mono text-gray-500">
                              {trial.nct_id || trial.id} • {trial.status || 'Unknown Status'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Patents */}
                  {results.patents && results.patents.length > 0 && (
                    <div className="bg-black/50 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
                      <h3 className="text-lg font-mono font-bold text-purple-400 mb-4 flex items-center gap-2">
                        <span>📋</span> Patents ({results.patents.length})
                      </h3>
                      <div className="space-y-4">
                        {results.patents.slice(0, 5).map((patent, i) => (
                          <div key={i} className="border-l-2 border-purple-500/30 pl-4 py-2">
                            <div className="text-sm font-mono text-white mb-1">
                              {patent.title || 'Untitled Patent'}
                            </div>
                            <div className="text-xs font-mono text-gray-500">
                              {patent.patent_number || patent.id} • {patent.date || 'Unknown Date'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Web Intel */}
                  {results.web_intel && results.web_intel.length > 0 && (
                    <div className="bg-black/50 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
                      <h3 className="text-lg font-mono font-bold text-blue-400 mb-4 flex items-center gap-2">
                        <span>🌐</span> Web Intelligence ({results.web_intel.length})
                      </h3>
                      <div className="space-y-4">
                        {results.web_intel.slice(0, 5).map((item, i) => (
                          <div key={i} className="border-l-2 border-blue-500/30 pl-4 py-2">
                            <div className="text-sm font-mono text-white mb-1">
                              {item.title || 'Untitled'}
                            </div>
                            <div className="text-xs font-mono text-gray-500">
                              {item.source || 'Unknown Source'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Report download */}
                  {reportUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-6 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-mono font-bold text-white mb-2">
                            Report Generated
                          </h3>
                          <p className="text-sm font-mono text-gray-400">
                            Your comprehensive analysis report is ready
                          </p>
                        </div>
                        <a
                          href={reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative px-6 py-3 bg-transparent border-2 border-cyan-500/50 text-cyan-400 font-mono text-sm hover:bg-cyan-500/10 transition-all duration-300 rounded overflow-hidden flex items-center gap-2"
                        >
                          <span className="relative z-10">DOWNLOAD</span>
                          <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        </a>
                      </div>
                    </motion.div>
                  )}

                  {/* AI Chatbot for follow-up questions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <h3 className="text-lg font-mono font-bold text-white mb-4 flex items-center gap-2">
                      <span>💬</span> Ask Follow-up Questions
                    </h3>
                    <Chatbot jobId={jobData?.jobId} jobData={results} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading state */}
            {(status === 'queued' || status === 'running') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-20"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full mx-auto mb-4"
                  />
                  <p className="text-sm font-mono text-gray-400">
                    Processing your query...
                  </p>
                </div>
              </motion.div>
            )}

            {/* Failed state */}
            {status === 'failed' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-6"
              >
                <p className="text-red-400 font-mono text-sm">
                  <span className="font-bold">[ERROR]</span> Analysis failed. Please try again.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Results
