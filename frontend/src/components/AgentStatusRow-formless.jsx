import { motion } from 'framer-motion'

export default function AgentStatusRow({ agents }) {
  if (!agents || agents.length === 0) return null

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'text-blue-400 bg-blue-500/20 ring-blue-500/30'
      case 'completed':
        return 'text-green-400 bg-green-500/20 ring-green-500/30'
      case 'failed':
        return 'text-red-400 bg-red-500/20 ring-red-500/30'
      default:
        return 'text-gray-400 bg-gray-500/20 ring-gray-500/30'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full"
          />
        )
      case 'completed':
        return <span className="text-green-400">✓</span>
      case 'failed':
        return <span className="text-red-400">✕</span>
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl"
    >
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Agent Status
      </h3>
      
      <div className="space-y-3">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl"
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(agent.status)}
              <div>
                <p className="text-sm font-medium text-white">{agent.name}</p>
                {agent.result_count > 0 && (
                  <p className="text-xs text-gray-500">{agent.result_count} results</p>
                )}
              </div>
            </div>
            
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${getStatusColor(agent.status)}`}>
              {agent.status}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
