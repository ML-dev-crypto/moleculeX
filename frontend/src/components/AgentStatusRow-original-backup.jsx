import { motion } from 'framer-motion'

const AGENT_CONFIG = {
  'Master Agent': { icon: '🎯', color: 'lavender' },
  'Clinical Trials Agent': { icon: '🔬', color: 'mint' },
  'Patent Agent': { icon: '📄', color: 'lavender' },
  'Web Intel Agent': { icon: '🌐', color: 'mint' },
}

export default function AgentStatusRow({ agents }) {
  const getStatusStyle = (status, color) => {
    const styles = {
      idle: {
        ring: 'stroke-apple-gray-300',
        fill: 'fill-apple-gray-100',
        glow: '',
      },
      running: {
        ring: color === 'mint' ? 'stroke-apple-mint-400' : 'stroke-apple-lavender-400',
        fill: color === 'mint' ? 'fill-apple-mint-100' : 'fill-apple-lavender-100',
        glow: color === 'mint' ? 'shadow-glow-mint' : 'shadow-glow-lavender',
      },
      completed: {
        ring: 'stroke-apple-mint-500',
        fill: 'fill-apple-mint-200',
        glow: 'shadow-glow-mint',
      },
      failed: {
        ring: 'stroke-red-400',
        fill: 'fill-red-100',
        glow: '',
      },
    }
    return styles[status] || styles.idle
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="backdrop-blur-glass bg-white/65 rounded-3xl shadow-apple border border-white/20 p-8"
    >
      <h3 className="text-sm font-semibold text-apple-gray-500 uppercase tracking-wider mb-6">
        Agent Status
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent, index) => {
          const config = AGENT_CONFIG[agent.name] || { icon: '🤖', color: 'lavender' }
          const statusStyle = getStatusStyle(agent.status, config.color)
          
          return (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="backdrop-blur-sm bg-white/40 rounded-2xl p-4 border border-apple-gray-200/30 hover:bg-white/60 hover:border-apple-gray-200/50 transition-all duration-300">
                {/* Apple Watch Style Ring */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      {/* Background ring */}
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="stroke-apple-gray-200/50"
                      />
                      
                      {/* Progress ring */}
                      <motion.circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        strokeWidth="4"
                        strokeLinecap="round"
                        className={`${statusStyle.ring} ${statusStyle.glow} transition-all duration-500`}
                        initial={{ strokeDasharray: '0 176' }}
                        animate={{
                          strokeDasharray: agent.status === 'completed' 
                            ? '176 176' 
                            : agent.status === 'running'
                            ? ['44 176', '132 176', '44 176']
                            : '0 176',
                        }}
                        transition={{
                          duration: agent.status === 'running' ? 2 : 0.8,
                          repeat: agent.status === 'running' ? Infinity : 0,
                          ease: 'easeInOut',
                        }}
                      />
                      
                      {/* Center fill */}
                      <motion.circle
                        cx="32"
                        cy="32"
                        r="22"
                        className={statusStyle.fill}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: agent.status !== 'idle' ? 1 : 0.3 }}
                        transition={{ duration: 0.3 }}
                      />
                    </svg>
                    
                    {/* Icon in center */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center text-2xl"
                      animate={agent.status === 'running' ? {
                        scale: [1, 1.1, 1],
                      } : {}}
                      transition={{
                        duration: 1.5,
                        repeat: agent.status === 'running' ? Infinity : 0,
                      }}
                    >
                      {config.icon}
                    </motion.div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Agent Name */}
                    <h4 className="font-semibold text-apple-gray-800 text-sm mb-2 leading-tight">
                      {agent.name}
                    </h4>
                    
                    {/* Status Pill */}
                    <motion.div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                        agent.status === 'completed' 
                          ? 'bg-apple-mint-100/80 text-apple-mint-700' 
                          : agent.status === 'running'
                          ? config.color === 'mint' 
                            ? 'bg-apple-mint-100/60 text-apple-mint-600'
                            : 'bg-apple-lavender-100/60 text-apple-lavender-600'
                          : agent.status === 'failed'
                          ? 'bg-red-100/80 text-red-700'
                          : 'bg-apple-gray-100/60 text-apple-gray-600'
                      }`}
                      animate={agent.status === 'running' ? {
                        opacity: [0.6, 1, 0.6],
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: agent.status === 'running' ? Infinity : 0,
                      }}
                    >
                      {agent.status === 'running' && (
                        <motion.div
                          className="w-1.5 h-1.5 rounded-full bg-current"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                      {agent.status === 'completed' && '✓ '}
                      {agent.status === 'failed' && '✗ '}
                      {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                    </motion.div>
                    
                    {/* Result Count */}
                    {agent.result_count > 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-apple-gray-600 mt-2 font-medium"
                      >
                        {agent.result_count} results
                      </motion.p>
                    )}
                    
                    {/* Error Message */}
                    {agent.error && (
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-600 mt-2"
                      >
                        Error: {agent.error}
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
