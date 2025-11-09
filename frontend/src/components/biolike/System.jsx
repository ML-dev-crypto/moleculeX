import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

function System() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [150, -150])
  const rotate = useTransform(scrollYProgress, [0, 1], [-5, 5])

  const pipeline = [
    { step: 'INPUT', label: 'User Query' },
    { step: 'NORMALIZE', label: 'Query Processing' },
    { step: 'ORCHESTRATE', label: 'Master Agent' },
    { step: 'PARALLEL', label: 'Multi-Agent System' },
    { step: 'ANALYZE', label: 'AI Processing' },
    { step: 'SYNTHESIZE', label: 'Report Generation' },
    { step: 'OUTPUT', label: 'Intelligence Report' },
  ]

  const agents = [
    {
      name: 'Clinical Trials Agent',
      description: 'Searches and analyzes clinical trial data from ClinicalTrials.gov and other registries',
      icon: '🧪',
    },
    {
      name: 'Patent Agent',
      description: 'Analyzes patent landscapes, filing trends, and intellectual property strategies',
      icon: '📋',
    },
    {
      name: 'Web Intel Agent',
      description: 'Scrapes and analyzes scientific literature, news, and research publications',
      icon: '🌐',
    },
  ]

  return (
    <section id="system" ref={ref} className="min-h-screen py-32 px-6 relative">
      <motion.div 
        className="max-w-7xl mx-auto"
        style={{ y }}
      >
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-6xl md:text-8xl font-mono font-bold text-white/5 mb-4">
            03
          </div>
          <h2 className="text-4xl md:text-5xl font-mono font-bold text-white mb-4">
            SYSTEM ARCHITECTURE
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
        </motion.div>

        {/* Pipeline visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-20"
        >
          <div className="bg-black/50 border border-white/10 rounded-lg p-8 backdrop-blur-sm">
            <h3 className="text-lg font-mono font-bold text-cyan-400 mb-6 uppercase tracking-wider">
              // Processing Pipeline
            </h3>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              {pipeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="flex items-center"
                >
                  {/* Pipeline step */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-xl group-hover:bg-cyan-500/30 transition-all" />
                    <div className="relative px-6 py-4 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-lg">
                      <div className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">
                        {item.step}
                      </div>
                      <div className="text-sm font-mono text-white">
                        {item.label}
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  {index < pipeline.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
                      className="mx-2 text-cyan-500/50 text-xl"
                    >
                      →
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Agents grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-mono font-bold text-white mb-8 uppercase tracking-wider">
            <span className="text-cyan-400">//</span> Specialized Agents
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {agents.map((agent, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="group relative"
              >
                {/* Card */}
                <div className="relative h-full p-6 bg-gradient-to-br from-gray-900/50 to-black/50 border border-white/10 rounded-lg hover:border-cyan-500/30 transition-all duration-300">
                  {/* Icon */}
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                    {agent.icon}
                  </div>

                  {/* Name */}
                  <h4 className="text-lg font-mono font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                    {agent.name}
                  </h4>

                  {/* Description */}
                  <p className="text-sm font-mono text-gray-400 leading-relaxed">
                    {agent.description}
                  </p>

                  {/* Status indicator */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs font-mono text-gray-500">OPERATIONAL</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="border border-white/10 rounded-lg p-8 bg-black/30"
        >
          <h3 className="text-lg font-mono font-bold text-cyan-400 mb-6 uppercase tracking-wider">
            // Technology Stack
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-mono text-gray-500 mb-3 uppercase">Backend</h4>
              <div className="flex flex-wrap gap-2">
                {['Python', 'FastAPI', 'WebSockets', 'Async Processing'].map((tech, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-mono text-gray-500 mb-3 uppercase">AI & Data</h4>
              <div className="flex flex-wrap gap-2">
                {['Machine Learning', 'NLP', 'Data Mining', 'Semantic Search'].map((tech, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs font-mono bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default System
