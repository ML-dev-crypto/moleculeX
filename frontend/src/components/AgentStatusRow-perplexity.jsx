import { motion } from 'framer-motion'

export default function AgentStatusRow({ agents, progress }) {
  if (!agents || agents.length === 0) return null

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return (
          <svg className="w-4 h-4 animate-spin text-perplexity-primary" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )
      case 'completed':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'failed':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return <div className="w-2 h-2 bg-gray-300 rounded-full" />
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Search Progress</span>
        <span className="text-sm text-gray-500">{progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
        <motion.div
          className="bg-perplexity-primary h-1.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Agents */}
      <div className="grid grid-cols-2 gap-2">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-md border border-gray-200"
          >
            {getStatusIcon(agent.status)}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">
                {agent.name.replace(' Agent', '')}
              </p>
              {agent.result_count > 0 && (
                <p className="text-xs text-gray-500">{agent.result_count} results</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
