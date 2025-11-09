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

  const [activeTab, setActiveTab] = useState('summary')

  const tabs = [
    { id: 'summary', label: 'Summary', count: null },
    { id: 'trials', label: 'Clinical Trials', count: clinical_trials?.length || 0 },
    { id: 'patents', label: 'Patents', count: patents?.length || 0 },
    { id: 'literature', label: 'Literature', count: web_intel?.length || 0 },
  ]

  const getConfidenceColor = (level) => {
    switch (level) {
      case 'High': return 'text-green-700 bg-green-50 border-green-200'
      case 'Medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      case 'Low': return 'text-red-700 bg-red-50 border-red-200'
      default: return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Answer Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-perplexity-primary text-white flex items-center justify-center text-sm font-semibold">
          A
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Answer</h2>
            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getConfidenceColor(confidence_level)}`}>
              {confidence_level} confidence · {Math.round(confidence_score)}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-perplexity-primary text-perplexity-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 text-xs text-gray-400">({tab.count})</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <p className="text-gray-800 leading-relaxed">{executive_summary}</p>
            </div>

            {key_findings && key_findings.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Findings</h3>
                <ul className="space-y-2">
                  {key_findings.map((finding, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-perplexity-primary/10 text-perplexity-primary flex items-center justify-center text-xs font-semibold mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 leading-relaxed">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Clinical Trials Tab */}
        {activeTab === 'trials' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {clinical_trials && clinical_trials.slice(0, 10).map((trial, index) => (
              <div
                key={trial.nct_id}
                className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="font-medium text-gray-900 flex-1">{trial.title}</h4>
                  {trial.match_score > 0 && (
                    <span className="text-sm font-medium text-perplexity-primary">
                      {Math.round(trial.match_score * 100)}%
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{trial.nct_id}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-white rounded border border-gray-300 text-gray-700">
                    {trial.phase}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium bg-white rounded border border-gray-300 text-gray-700">
                    {trial.status}
                  </span>
                  {trial.location && (
                    <span className="px-2 py-1 text-xs text-gray-600">
                      📍 {trial.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Patents Tab */}
        {activeTab === 'patents' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {patents && patents.slice(0, 10).map((patent) => (
              <a
                key={patent.patent_id}
                href={patent.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-mono text-perplexity-primary mb-1">
                      {patent.patent_id}
                    </p>
                    <h4 className="font-medium text-gray-900">{patent.title}</h4>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{patent.assignee}</span>
                  <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded border border-green-200">
                    {patent.status}
                  </span>
                </div>
              </a>
            ))}
          </motion.div>
        )}

        {/* Literature Tab */}
        {activeTab === 'literature' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {web_intel && web_intel.slice(0, 10).map((intel, index) => (
              <a
                key={index}
                href={intel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{intel.title}</h4>
                    <p className="text-sm text-gray-600">{intel.snippet}</p>
                  </div>
                  {intel.relevance_score > 0 && (
                    <span className="text-sm font-medium text-perplexity-primary flex-shrink-0">
                      {Math.round(intel.relevance_score * 100)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{intel.source}</p>
              </a>
            ))}
          </motion.div>
        )}
      </div>

      {/* Sources section */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Sources</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200">
            ClinicalTrials.gov
          </span>
          <span className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200">
            USPTO
          </span>
          <span className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200">
            PubMed
          </span>
          <span className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200">
            {clinical_trials?.length || 0} trials · {patents?.length || 0} patents · {web_intel?.length || 0} papers
          </span>
        </div>
      </div>
    </div>
  )
}
