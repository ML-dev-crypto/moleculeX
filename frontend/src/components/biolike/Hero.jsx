import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

function Hero({ onStartAnalysis }) {
  const [text, setText] = useState('')
  const fullText = 'A high-throughput AI pipeline to analyze pharmaceutical compounds, clinical trials, and patent landscapes — bypassing the limitations of conventional research methods.'

  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300, 500], [1, 0.5, 0])
  const scale = useTransform(scrollY, [0, 500], [1, 0.8])

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(interval)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [])

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated grid background with parallax */}
      <motion.div 
        className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"
        style={{ y: useTransform(scrollY, [0, 500], [0, -100]) }}
      />
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div 
        className="max-w-5xl mx-auto px-6 text-center relative z-10"
        style={{ y, opacity, scale }}
      >
        {/* Title with glitch effect */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-7xl md:text-9xl font-mono font-bold mb-8 tracking-tight relative"
        >
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              MoleculeX
            </span>
            {/* Glitch layers */}
            <span className="absolute top-0 left-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent opacity-0 animate-glitch-1">
              MoleculeX
            </span>
            <span className="absolute top-0 left-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent opacity-0 animate-glitch-2">
              MoleculeX
            </span>
          </span>
        </motion.h1>

        {/* Subtitle - Typewriter effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mb-12 h-32"
        >
          <p className="text-lg md:text-xl text-gray-400 font-mono leading-relaxed max-w-4xl mx-auto">
            {text}
            <span className="inline-block w-2 h-5 bg-cyan-400 ml-1 animate-pulse" />
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          onClick={onStartAnalysis}
          className="group relative px-8 py-4 bg-transparent border-2 border-cyan-500/50 text-cyan-400 font-mono text-sm hover:bg-cyan-500/10 transition-all duration-300 rounded overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            VIEW MISSION BRIEF
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </motion.button>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-20 flex flex-wrap items-center justify-center gap-12"
        >
          {[
            { value: '10,000+', label: 'Compounds Analyzed' },
            { value: '5,000+', label: 'Patents Reviewed' },
            { value: '3,000+', label: 'Trials Indexed' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-mono font-bold text-cyan-400 mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-cyan-400/50 text-2xl"
          >
            ↓
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero
