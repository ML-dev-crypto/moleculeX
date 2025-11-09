import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

function Solution() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8])

  const features = [
    {
      title: 'UNIFIED DATA AGGREGATION',
      description: 'Automatically collects and normalizes data from clinical trials databases, patent offices, and scientific literature into a single unified pipeline.',
      tag: '+',
    },
    {
      title: 'AI-POWERED ANALYSIS',
      description: 'Advanced machine learning models analyze patterns, relationships, and insights across millions of data points in seconds, not weeks.',
      tag: '+',
    },
    {
      title: 'COMPREHENSIVE REPORTS',
      description: 'Generate detailed, actionable intelligence reports with visualizations, competitive analysis, and strategic recommendations.',
      tag: '+',
    },
  ]

  return (
    <section id="solution" ref={ref} className="min-h-screen py-32 px-6 relative bg-gradient-to-b from-transparent to-black/30">
      <motion.div 
        className="max-w-7xl mx-auto"
        style={{ y, scale }}
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
            02
          </div>
          <h2 className="text-4xl md:text-5xl font-mono font-bold text-white mb-4">
            PROPOSED SOLUTION
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mb-8" />
          <p className="text-gray-400 font-mono text-lg max-w-4xl leading-relaxed">
            Our AI-driven pipeline leverages advanced machine learning and multi-source data integration 
            to analyze pharmaceutical intelligence without relying on fragmented manual processes. 
            The system is designed to:
          </p>
        </motion.div>

        {/* Features */}
        <div className="space-y-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent border-l-2 border-cyan-500/30 group-hover:border-cyan-400 transition-all duration-300" />
              
              <div className="relative p-6 pl-8">
                <div className="flex items-start gap-4">
                  {/* Tag */}
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-cyan-500/50 text-cyan-400 font-mono font-bold rounded group-hover:bg-cyan-500/10 transition-colors">
                    {feature.tag}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-mono font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm font-mono leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Key benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {[
            { label: 'Time Savings', value: '95%', color: 'from-green-400 to-emerald-500' },
            { label: 'Data Coverage', value: '10x', color: 'from-cyan-400 to-blue-500' },
            { label: 'Accuracy', value: '99.9%', color: 'from-purple-400 to-pink-500' },
          ].map((metric, i) => (
            <div
              key={i}
              className="relative p-6 border border-white/10 rounded-lg bg-black/30 backdrop-blur-sm"
            >
              <div className={`text-4xl font-mono font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent mb-2`}>
                {metric.value}
              </div>
              <div className="text-sm font-mono text-gray-500 uppercase tracking-wider">
                {metric.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Solution
