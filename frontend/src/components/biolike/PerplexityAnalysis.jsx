import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { submitQuery, getJobStatus, getJobResult } from '../../api/client'
import useWebSocket from '../../hooks/useWebSocket'

export default function PerplexityAnalysis({ initialQuery = '', onBack }) {
  const [query, setQuery] = useState(initialQuery)
  const [jobId, setJobId] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle')
  const [timeRemaining, setTimeRemaining] = useState(120)
  const [searchQueries, setSearchQueries] = useState([])
  const [sources, setSources] = useState([])
  const [results, setResults] = useState(null)
  const [answer, setAnswer] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [showAssistantSteps, setShowAssistantSteps] = useState(false)
  const pollIntervalRef = useRef(null)
  const messagesEndRef = useRef(null)

  useWebSocket(jobId, (message) => {
    const { event_type, data } = message ?? {}

    switch (event_type) {
      case 'job_started':
        setIsAnalyzing(true)
        setStatus('running')
        break

      case 'agent_update':
        // Add search query
        if (data.status === 'running') {
          setSearchQueries(prev => {
            if (!prev.find(q => q.agent === data.agent)) {
              return [...prev, { agent: data.agent, query: data.query || `Searching ${data.agent}` }]
            }
            return prev
          })
        }
        break

      case 'job_completed':
        setStatus('completed')
        setIsAnalyzing(false)
        setProgress(100)
        setTimeRemaining(0)
        if (data?.job_id ?? jobId) fetchResults(data?.job_id ?? jobId)
        clearPolling()
        break

      case 'job_failed':
        setStatus('failed')
        setIsAnalyzing(false)
        clearPolling()
        break

      default:
        break
    }
  })

  useEffect(() => {
    return () => clearPolling()
  }, [])

  useEffect(() => {
    if (isAnalyzing && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isAnalyzing, timeRemaining])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const clearPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }

  const fetchResults = async (jId) => {
    try {
      const data = await getJobResult(jId)
      setResults(data)
      
      // Create sources from results
      const sourcesData = []
      if (data.clinical_trials) {
        data.clinical_trials.slice(0, 5).forEach(trial => {
          sourcesData.push({
            title: trial.title || trial.study_title,
            source: 'clinicaltrials.gov',
            url: trial.source_url || `https://clinicaltrials.gov/study/${trial.nct_id}`
          })
        })
      }
      if (data.patents) {
        data.patents.slice(0, 3).forEach(patent => {
          sourcesData.push({
            title: patent.title,
            source: 'PatentsView',
            url: patent.source_url || '#'
          })
        })
      }
      setSources(sourcesData)
      
      // Generate answer
      if (data.executive_summary) {
        setAnswer(data.executive_summary)
      }
    } catch (err) {
      console.error('Error fetching results:', err)
    }
  }

  const handleSubmitQuery = async (e) => {
    e.preventDefault()
    if (!query.trim() || isAnalyzing) return

    setIsAnalyzing(true)
    setStatus('running')
    setProgress(0)
    setTimeRemaining(120)
    setSearchQueries([])
    setSources([])
    setResults(null)
    setAnswer('')
    setChatMessages([])

    // Simulate search queries appearing
    setTimeout(() => {
      setSearchQueries([
        { agent: 'Master Agent', query: 'Pharmaceutical research overview' },
        { agent: 'Clinical Trials Agent', query: 'Clinical trial databases' },
      ])
    }, 500)

    setTimeout(() => {
      setSearchQueries(prev => [...prev, { agent: 'Patent Agent', query: 'Patent landscape analysis' }])
    }, 1500)

    setTimeout(() => {
      setSearchQueries(prev => [...prev, { agent: 'Web Intel Agent', query: 'Scientific literature search' }])
    }, 2500)

    try {
      const response = await submitQuery(query)
      if (response?.job_id) {
        setJobId(response.job_id)
        pollProgress(response.job_id)
      }
    } catch (error) {
      console.error('Error submitting query:', error)
      setIsAnalyzing(false)
      setStatus('failed')
    }
  }

  const pollProgress = (jId) => {
    pollIntervalRef.current = setInterval(async () => {
      try {
        const data = await getJobStatus(jId)
        if (!data) return
        if (typeof data.progress === 'number') setProgress(data.progress)
        if (data.status) setStatus(data.status)

        if (data.status === 'completed') {
          clearPolling()
          setIsAnalyzing(false)
          await fetchResults(jId)
        } else if (data.status === 'failed') {
          clearPolling()
          setIsAnalyzing(false)
          setStatus('failed')
        }
      } catch (err) {
        console.error('Error polling progress:', err)
      }
    }, 2000)
  }

  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || !results) return

    const userMessage = { role: 'user', content: chatInput.trim() }
    const currentInput = chatInput.trim()
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')

    // Add loading message
    const loadingMessage = { role: 'assistant', content: '...', isLoading: true }
    setChatMessages(prev => [...prev, loadingMessage])

    try {
      // Call backend chat API with Gemini
      const response = await fetch(`http://localhost:8000/api/chat/${jobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          context: results
        })
      })

      if (!response.ok) throw new Error('Failed to get AI response')

      const data = await response.json()
      
      // Remove loading message and add real response
      setChatMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading)
        return [...filtered, {
          role: 'assistant',
          content: data.response
        }]
      })
    } catch (error) {
      console.error('Chat error:', error)
      
      // Generate a helpful fallback response based on the question
      let fallbackResponse = ''
      const lowerInput = currentInput.toLowerCase()
      
      if (lowerInput.includes('trial') || lowerInput.includes('clinical')) {
        const trialCount = results?.clinical_trials?.length || 0
        fallbackResponse = `Based on the analysis, we found ${trialCount} relevant clinical trials. These studies represent ongoing research in this pharmaceutical area. The trials span various phases and provide insights into development pipelines and therapeutic approaches.`
      } else if (lowerInput.includes('patent')) {
        const patentCount = results?.patents?.length || 0
        fallbackResponse = `The analysis identified ${patentCount} patents related to your query. These patents represent intellectual property developments and innovation trends in this pharmaceutical space.`
      } else if (lowerInput.includes('summary') || lowerInput.includes('overview')) {
        fallbackResponse = results?.executive_summary || 'The analysis provides comprehensive insights across clinical trials, patents, and web intelligence sources, revealing key trends and developments in this pharmaceutical research area.'
      } else if (lowerInput.includes('finding') || lowerInput.includes('key')) {
        const findings = results?.key_findings || []
        if (findings.length > 0) {
          fallbackResponse = 'Key findings from the analysis include:\n\n' + findings.slice(0, 5).map((f, i) => `${i + 1}. ${f}`).join('\n')
        } else {
          fallbackResponse = 'The analysis has compiled findings from multiple data sources including clinical trials, patents, and scientific literature to provide comprehensive insights.'
        }
      } else {
        fallbackResponse = `Based on the pharmaceutical analysis conducted, I can provide insights on the clinical trials, patents, and research findings related to your original query. The backend server is currently unavailable, but the analysis data shows significant information across multiple data sources. What specific aspect would you like to know more about?`
      }
      
      // Remove loading message and add fallback response
      setChatMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading)
        return [...filtered, {
          role: 'assistant',
          content: fallbackResponse
        }]
      })
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins} minute${mins !== 1 ? 's' : ''}`
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header with back button */}
      <div className="border-b border-white/10 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-bold font-mono">MoleculeX</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Query Input */}
        <div className="mb-8">
          <form onSubmit={handleSubmitQuery}>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything about pharmaceutical research..."
                disabled={isAnalyzing}
                autoFocus
                className="w-full bg-white border-2 border-cyan-500/50 rounded-2xl px-6 py-5 pr-16
                         text-gray-900 text-lg placeholder-gray-400
                         focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20
                         disabled:opacity-50 disabled:bg-gray-100 transition-all duration-200
                         shadow-lg shadow-cyan-500/10"
                style={{ caretColor: '#06b6d4' }}
              />
              <motion.button
                type="submit"
                disabled={!query.trim() || isAnalyzing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 
                         bg-gradient-to-r from-cyan-500 to-blue-500 
                         text-white p-3 rounded-xl
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-200 shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.button>
            </div>
          </form>
        </div>

        {/* Analysis in Progress */}
        <AnimatePresence mode="wait">
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              {/* Progress Bar */}
              <div className="bg-dark-900/50 border border-cyan-500/20 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-cyan-400 font-mono text-sm">
                    {formatTime(timeRemaining)} left to gather sources and create your report.
                  </span>
                  <div className="flex items-center gap-4">
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                    <span className="text-gray-500 text-sm">Skip remaining steps</span>
                  </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Search Queries */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full"
                  />
                  <span className="text-white font-medium">Searching</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {searchQueries.map((sq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-dark-800/50 border border-cyan-500/20 px-4 py-2 rounded-lg"
                    >
                      <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-sm text-gray-300 font-mono">{sq.query}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Sources Being Reviewed */}
              {sources.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4 text-cyan-400">
                    <span className="font-medium">Reviewing sources</span>
                    <span className="text-gray-500">· {sources.length}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {sources.map((source, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 bg-dark-900/30 border border-white/10 rounded-lg p-4 hover:border-cyan-500/30 transition-colors"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                          <span className="text-cyan-400 font-bold text-sm">{source.source.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white text-sm font-medium mb-1">{source.title}</h4>
                          <p className="text-gray-500 text-xs">{source.source}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Results with Integrated Chatbot */}
          {status === 'completed' && results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Tabs */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-white font-medium border-b-2 border-cyan-400 pb-4 -mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Answer
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 font-medium hover:text-gray-300 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Assets
                  </button>
                </div>
                
                {/* New Chat Button */}
                <motion.button
                  onClick={() => {
                    setQuery('')
                    setJobId(null)
                    setIsAnalyzing(false)
                    setProgress(0)
                    setStatus('idle')
                    setSearchQueries([])
                    setSources([])
                    setResults(null)
                    setAnswer('')
                    setChatMessages([])
                    setChatInput('')
                    setShowAssistantSteps(false)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-lg bg-dark-800/50 border border-white/10 flex items-center justify-center
                           hover:bg-dark-700/50 hover:border-cyan-500/30 transition-all group"
                  title="New chat"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </motion.button>
              </div>

              {/* Sources Cards - Like Perplexity */}
              {sources.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sources.slice(0, 3).map((source, index) => (
                      <a
                        key={index}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-dark-900/30 border border-white/10 rounded-lg p-4 hover:border-cyan-500/30 transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-cyan-400">{source.source.slice(0, 2).toUpperCase()}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white mb-1 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                              {source.title}
                            </h4>
                            <p className="text-xs text-gray-500">{source.source}</p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                  {sources.length > 3 && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
                      <span className="text-sm">+{sources.length - 3} more sources</span>
                    </div>
                  )}
                </div>
              )}

              {/* Answer Section */}
              <div className="bg-transparent">
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed text-lg">{answer}</p>
                </div>
              </div>

              {/* Assistant Steps (Expandable) */}
              <div className="border-t border-white/10 pt-6">
                <button 
                  onClick={() => setShowAssistantSteps(!showAssistantSteps)}
                  className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                >
                  <span>Assistant steps</span>
                  <motion.svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    animate={{ rotate: showAssistantSteps ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </motion.svg>
                </button>

                <AnimatePresence>
                  {showAssistantSteps && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-3">
                        {/* Step 1: Analysis Started */}
                        <div className="flex items-start gap-3 text-sm">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-300">Analyzed query: <span className="text-cyan-400">"{query}"</span></p>
                          </div>
                        </div>

                        {/* Step 2: Search Queries */}
                        {searchQueries.length > 0 && (
                          <div className="flex items-start gap-3 text-sm">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-gray-300 mb-2">Executed {searchQueries.length} specialized searches:</p>
                              <ul className="space-y-1 ml-4">
                                {searchQueries.map((sq, idx) => (
                                  <li key={idx} className="text-gray-500 text-xs">• {sq.query}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Step 3: Sources Reviewed */}
                        {sources.length > 0 && (
                          <div className="flex items-start gap-3 text-sm">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-gray-300">Reviewed {sources.length} sources from multiple databases</p>
                            </div>
                          </div>
                        )}

                        {/* Step 4: Analysis Complete */}
                        <div className="flex items-start gap-3 text-sm">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-300">Generated comprehensive analysis report</p>
                          </div>
                        </div>

                        {/* Data Sources Used */}
                        <div className="mt-4 p-3 bg-dark-800/30 border border-white/10 rounded-lg">
                          <p className="text-xs text-gray-500 mb-2">Data Sources:</p>
                          <div className="flex flex-wrap gap-2">
                            {results?.clinical_trials?.length > 0 && (
                              <span className="text-xs px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded">
                                Clinical Trials ({results.clinical_trials.length})
                              </span>
                            )}
                            {results?.patents?.length > 0 && (
                              <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-400 rounded">
                                Patents ({results.patents.length})
                              </span>
                            )}
                            {results?.web_intel?.length > 0 && (
                              <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded">
                                Web Intel ({results.web_intel.length})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Integrated Chatbot */}
              <div className="bg-transparent border-t border-white/10 pt-8">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-white">
                  <span>💬</span>
                  Ask Follow-up Questions
                </h3>

                {/* Chat Messages */}
                {chatMessages.length > 0 && (
                  <div className="mb-6 space-y-4">
                    {chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            msg.role === 'user'
                              ? 'bg-cyan-500/20 border border-cyan-500/30'
                              : 'bg-dark-800/50 border border-white/10'
                          }`}
                        >
                          {msg.isLoading ? (
                            <div className="flex gap-1">
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                                className="w-2 h-2 bg-cyan-400 rounded-full"
                              />
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                className="w-2 h-2 bg-cyan-400 rounded-full"
                              />
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                className="w-2 h-2 bg-cyan-400 rounded-full"
                              />
                            </div>
                          ) : (
                            <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {/* Chat Input - Perplexity Style */}
                <form onSubmit={handleChatSubmit} className="relative">
                  <div className="relative bg-dark-800/50 border border-cyan-500/20 rounded-xl overflow-hidden">
                    <textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleChatSubmit(e)
                        }
                      }}
                      placeholder="Add details or clarifications..."
                      rows={1}
                      className="w-full bg-transparent text-white placeholder-gray-500 px-4 py-4 pr-28
                               resize-none outline-none text-sm"
                      style={{ 
                        caretColor: '#06b6d4',
                        maxHeight: '200px',
                        minHeight: '52px'
                      }}
                    />
                    
                    {/* Action Buttons */}
                    <div className="absolute right-3 bottom-3 flex items-center gap-2">
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                        title="Web access"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </button>
                      
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                        title="Attach"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </button>
                      
                      <motion.button
                        type="submit"
                        disabled={!chatInput.trim()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-cyan-500 text-white rounded-lg
                                 disabled:opacity-30 disabled:cursor-not-allowed
                                 transition-all duration-200 hover:bg-cyan-400"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
