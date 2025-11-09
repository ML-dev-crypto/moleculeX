import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

function Problem() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  const problems = [
    {
      title: '// Fragmented Data Sources',
      description: 'Pharmaceutical research data is scattered across multiple databases, clinical trial registries, patent offices, and scientific publications. This fragmentation leads to incomplete analysis and missed insights.',
      icon: '🔍',
    },
    {
      title: '// Time-Intensive Research',
      description: 'Traditional research methods require weeks or months to manually review patents, clinical trials, and scientific literature. This delays critical decision-making and competitive analysis.',
      icon: '⏱️',
    },
    {
      title: '// Inconsistent Analysis',
      description: 'Manual review processes introduce human bias and inconsistency. Different researchers may interpret the same data differently, leading to unreliable conclusions and strategic missteps.',
      icon: '⚠️',
    },
  ]

  return (
    <section id="problem" ref={ref} className="min-h-screen py-32 px-6 relative">
      {/* Parallax section number */}
      <motion.div 
        className="max-w-7xl mx-auto"
        style={{ y, opacity }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-6xl md:text-8xl font-mono font-bold text-white/5 mb-4">
            01
          </div>
          <h2 className="text-4xl md:text-5xl font-mono font-bold text-white mb-4">
            PROBLEM STATEMENT
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
        </motion.div>

        {/* Problems grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="group relative"
            >
              {/* Card background */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-lg border border-white/5 group-hover:border-cyan-500/30 transition-all duration-300" />
              
              {/* Content */}
              <div className="relative p-8 h-full">
                {/* Icon */}
                <div className="text-5xl mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                  {problem.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-mono font-bold text-cyan-400 mb-4">
                  {problem.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed font-mono">
                  {problem.description}
                </p>

                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute top-4 right-4 w-8 h-[1px] bg-gradient-to-r from-transparent to-cyan-500/50" />
                  <div className="absolute top-4 right-4 w-[1px] h-8 bg-gradient-to-b from-transparent to-cyan-500/50" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-block px-6 py-3 border border-white/10 rounded-full">
            <p className="text-sm font-mono text-gray-500">
              <span className="text-red-400">[CRITICAL]</span> Current methods fail to deliver timely, comprehensive insights
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Problem
