import { motion } from 'framer-motion'
import { useState } from 'react'

export default function ResultsPanel({ results }) {
  const { 
    executive_summary, 
    key_findings, 
    clinical_trials, 
    patents, 
    web_intel,
    confidence_score = 0,
    confidence_level = "Medium"
  } = results

  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    trials: true,
    patents: true,
    literature: true,
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const keyMetrics = {
    trials: clinical_trials?.length || 0,
    patents: patents?.length || 0,
    literature: web_intel?.length || 0,
    phase3Trials: clinical_trials?.filter(t => t.phase?.includes('3') || t.phase?.includes('4')).length || 0
  }

  const getConfidenceBadge = (level) => {
    const badges = {
      "High": { bg: "bg-green-500/20", text: "text-green-400", ring: "ring-green-500/30" },
      "Medium": { bg: "bg-yellow-500/20", text: "text-yellow-400", ring: "ring-yellow-500/30" },
      "Low": { bg: "bg-red-500/20", text: "text-red-400", ring: "ring-red-500/30" }
    }
    return badges[level] || badges["Medium"]
  }

  const confidenceBadge = getConfidenceBadge(confidence_level)

  const getMatchScoreStyle = (score) => {
    if (score >= 0.8) return "text-green-400 font-semibold"
    if (score >= 0.6) return "text-blue-400 font-semibold"
    if (score >= 0.4) return "text-yellow-400 font-medium"
    return "text-gray-500 font-medium"
  }

  const getPhaseStyle = (phase) => {
    if (phase.includes('3') || phase.includes('4')) {
      return "bg-green-500/20 text-green-400 ring-1 ring-green-500/30"
    }
    if (phase.includes('2')) {
      return "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30"
    }
    return "bg-gray-500/20 text-gray-400 ring-1 ring-gray-500/30"
  }

  return (
    <div className="space-y-6">
      {/* Header with Confidence Score */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Analysis Complete</h2>
            <p className="text-sm text-gray-400 mt-1">Comprehensive insights from multiple sources</p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                <div className="text-xl font-bold text-white">{keyMetrics.trials}</div>
                <div className="text-xs text-gray-400">Trials</div>
              </div>
              <div className="text-center px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                <div className="text-xl font-bold text-white">{keyMetrics.patents}</div>
                <div className="text-xs text-gray-400">Patents</div>
              </div>
              <div className="text-center px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                <div className="text-xl font-bold text-white">{keyMetrics.literature}</div>
                <div className="text-xs text-gray-400">Papers</div>
              </div>
            </div>

            {/* Confidence Score */}
            <div className="text-center">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="stroke-white/10"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="stroke-accent-purple"
                    initial={{ strokeDasharray: '0 264' }}
                    animate={{ strokeDasharray: `${(confidence_score / 100) * 264} 264` }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white">{Math.round(confidence_score)}</span>
                  <span className="text-xs text-gray-400">Score</span>
                </div>
              </div>
              <div className={`mt-2 ${confidenceBadge.bg} ${confidenceBadge.text} px-3 py-1 rounded-full ring-1 ${confidenceBadge.ring} text-xs font-semibold`}>
                {confidence_level}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden"
      >
        <button
          onClick={() => toggleSection('summary')}
          className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <h3 className="text-xl font-semibold text-white">Executive Summary</h3>
          </div>
          <motion.svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: expandedSections.summary ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </button>
        
        {expandedSections.summary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 pb-6"
          >
            <div className="bg-accent-purple/10 border border-accent-purple/20 p-5 rounded-xl">
              <p className="text-gray-300 leading-relaxed">{executive_summary}</p>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Key Findings
              </h4>
              <div className="space-y-3">
                {key_findings.map((finding, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-start gap-3 bg-white/5 border border-white/10 p-4 rounded-xl"
                  >
                    <span className="text-green-400 text-lg flex-shrink-0 mt-0.5">✓</span>
                    <p className="text-gray-300 text-sm leading-relaxed">{finding}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Clinical Trials */}
      {clinical_trials.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden"
        >
          <button
            onClick={() => toggleSection('trials')}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔬</span>
              <h3 className="text-xl font-semibold text-white">
                Clinical Trials
                <span className="ml-2 text-gray-400 font-normal text-base">({clinical_trials.length})</span>
              </h3>
            </div>
            <motion.svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: expandedSections.trials ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
          
          {expandedSections.trials && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-6 pb-6"
            >
              <div className="space-y-3">
                {clinical_trials.slice(0, 8).map((trial, index) => (
                  <motion.div
                    key={trial.nct_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-accent-purple/50 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white group-hover:text-accent-purple transition-colors line-clamp-2">
                          {trial.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{trial.nct_id}</p>
                      </div>
                      {trial.match_score > 0 && (
                        <span className={`text-sm ${getMatchScoreStyle(trial.match_score)} whitespace-nowrap`}>
                          {Math.round(trial.match_score * 100)}%
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPhaseStyle(trial.phase)}`}>
                        {trial.phase}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                        {trial.status}
                      </span>
                      {trial.location && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {trial.location}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Patents */}
      {patents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden"
        >
          <button
            onClick={() => toggleSection('patents')}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <h3 className="text-xl font-semibold text-white">
                Patents
                <span className="ml-2 text-gray-400 font-normal text-base">({patents.length})</span>
              </h3>
            </div>
            <motion.svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: expandedSections.patents ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
          
          {expandedSections.patents && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-6 pb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patents.slice(0, 8).map((patent, index) => (
                  <motion.a
                    key={patent.patent_id}
                    href={patent.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-accent-purple/50 transition-all duration-300 group block"
                  >
                    <p className="font-mono text-sm font-semibold text-accent-purple group-hover:text-accent-pink mb-3">
                      {patent.patent_id}
                    </p>
                    
                    <h4 className="text-sm font-medium text-white mb-3 line-clamp-2 leading-snug">
                      {patent.title}
                    </h4>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 truncate">{patent.assignee}</span>
                      <span className="px-2.5 py-1 bg-green-500/20 text-green-400 rounded-full font-medium ml-2 flex-shrink-0">
                        {patent.status}
                      </span>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Web Intelligence */}
      {web_intel.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden"
        >
          <button
            onClick={() => toggleSection('literature')}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌐</span>
              <h3 className="text-xl font-semibold text-white">
                Scientific Literature
                <span className="ml-2 text-gray-400 font-normal text-base">({web_intel.length})</span>
              </h3>
            </div>
            <motion.svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: expandedSections.literature ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
          
          {expandedSections.literature && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-6 pb-6"
            >
              <div className="space-y-3">
                {web_intel.slice(0, 8).map((intel, index) => (
                  <motion.a
                    key={index}
                    href={intel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-accent-purple/50 transition-all duration-300 group block"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white group-hover:text-accent-purple transition-colors leading-snug">
                          {intel.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{intel.source}</p>
                      </div>
                      {intel.relevance_score > 0 && (
                        <span className={`text-sm ${getMatchScoreStyle(intel.relevance_score)} whitespace-nowrap`}>
                          {Math.round(intel.relevance_score * 100)}%
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                      {intel.snippet}
                    </p>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}
