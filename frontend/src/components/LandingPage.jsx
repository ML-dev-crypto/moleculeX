import { motion } from 'framer-motion'

export default function LandingPage({ onEngage }) {
  return (
    <div className="min-h-screen bg-cyber-bg relative overflow-hidden">
      {/* Cyber grid background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Animated cyan glow orbs */}
        <motion.div
          className="absolute w-96 h-96 bg-cyber-cyan/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-cyber-blue/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ bottom: '10%', right: '10%' }}
        />
        
        {/* Scanning line effect */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-cyan to-transparent"
          animate={{
            top: ['0%', '100%'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-6 border-b border-cyber-border/30"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🧬</span>
              <span className="text-2xl font-mono font-bold text-cyber-cyan tracking-wider">
                MoleculeX
                <span className="inline-block w-2 h-5 bg-cyber-cyan ml-1 animate-cursor-blink" />
              </span>
            </div>
            <button
              onClick={onEngage}
              className="px-6 py-2 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 text-cyber-cyan font-mono text-sm rounded border border-cyber-cyan/50 transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]"
            >
              [ ENTER ]
            </button>
          </div>
        </motion.header>

        {/* Hero Section */}
        <section className="px-6 py-20 md:py-32">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Terminal-style prefix */}
              <motion.div
                className="text-cyber-cyan font-mono text-sm mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                $ ./initialize_moleculex --mode=pharmaceutical_intelligence
              </motion.div>

              <motion.h1
                className="text-6xl md:text-7xl lg:text-8xl font-mono font-bold text-cyber-text mb-6 leading-tight tracking-tight"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                THE FUTURE OF
                <br />
                <span className="text-cyber-cyan animate-text-glitch">
                  DRUG DISCOVERY
                </span>
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-cyber-textDim font-mono mb-12 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                // AI-powered pharmaceutical intelligence platform
                <br />
                // Analyzing clinical trials, patents, and scientific literature
                <br />
                // Processing time: <span className="text-cyber-cyan">~2.5s</span>
              </motion.p>

              <motion.button
                onClick={onEngage}
                className="group relative px-10 py-4 bg-cyber-cyan/10 text-cyber-cyan text-lg font-mono font-bold rounded border-2 border-cyber-cyan hover:bg-cyber-cyan hover:text-cyber-bg transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">[ INITIALIZE SYSTEM ]</span>
                <motion.div
                  className="absolute inset-0 bg-cyber-cyan opacity-0 group-hover:opacity-10"
                  animate={{
                    boxShadow: [
                      '0 0 0px rgba(0, 255, 255, 0)',
                      '0 0 30px rgba(0, 255, 255, 0.5)',
                      '0 0 0px rgba(0, 255, 255, 0)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="px-6 py-20 bg-cyber-bgCard/30 backdrop-blur-sm border-y border-cyber-border/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-mono font-bold text-cyber-cyan mb-4">
                01_PROBLEM STATEMENT
              </h2>
              <p className="text-lg text-cyber-textDim font-mono">
                // Pharmaceutical research is drowning in fragmented data
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '⏱',
                  title: 'Weeks of Research',
                  description: 'Manual analysis of clinical trials, patents, and literature takes weeks',
                  prefix: '[!]',
                },
                {
                  icon: '🔍',
                  title: 'Scattered Information',
                  description: 'Data spread across multiple databases and sources',
                  prefix: '[!]',
                },
                {
                  icon: '💸',
                  title: 'High Costs',
                  description: 'Expensive subscriptions and consulting fees for market intelligence',
                  prefix: '[!]',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-6 bg-cyber-bgCard backdrop-blur-sm rounded-lg border border-cyber-cyan/20 hover:border-cyber-cyan/50 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-cyber-cyan font-mono text-sm">{item.prefix}</span>
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <h3 className="text-xl font-mono font-semibold text-cyber-text mb-2 group-hover:text-cyber-cyan transition-colors">
                    // {item.title}
                  </h3>
                  <p className="text-cyber-textDim font-mono text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-mono font-bold text-cyber-cyan mb-4">
                02_PROPOSED SOLUTION
              </h2>
              <p className="text-lg text-cyber-textDim font-mono">
                // AI-powered pharmaceutical intelligence in <span className="text-cyber-cyan">{'<'}3 seconds</span>
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  icon: '⚡',
                  title: 'Instant Analysis',
                  description: 'Get comprehensive insights in seconds, not weeks',
                  prefix: '[+]',
                },
                {
                  icon: '🎯',
                  title: 'Unified Platform',
                  description: 'All data sources integrated in one intelligent search',
                  prefix: '[+]',
                },
                {
                  icon: '💰',
                  title: 'Cost Effective',
                  description: 'Affordable AI-powered research accessible to all',
                  prefix: '[+]',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)' }}
                  className="p-6 bg-cyber-bgCard backdrop-blur-sm rounded-lg border border-cyber-cyan/30 hover:border-cyber-cyan transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-cyber-cyan font-mono text-sm font-bold">{item.prefix}</span>
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <h3 className="text-xl font-mono font-semibold text-cyber-cyan mb-2">
                    {item.title.toUpperCase()}
                  </h3>
                  <p className="text-cyber-textDim font-mono text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <button
                onClick={onEngage}
                className="px-12 py-5 bg-cyber-cyan text-cyber-bg text-xl font-mono font-bold rounded hover:shadow-[0_0_50px_rgba(0,255,255,0.5)] transition-all duration-300 hover:scale-105 animate-cyber-glow"
              >
                {'>'} ENGAGE PLATFORM
              </button>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-20 bg-cyber-bgCard/30 backdrop-blur-sm border-y border-cyber-border/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-mono font-bold text-cyber-cyan mb-4">
                03_SYSTEM ARCHITECTURE
              </h2>
              <p className="text-lg text-cyber-textDim font-mono">
                // Advanced AI agents working in parallel for comprehensive insights
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '🔬', title: 'Clinical Trials', desc: 'ClinicalTrials.gov analysis', status: '[ACTIVE]' },
                { icon: '📋', title: 'Patent Search', desc: 'USPTO patent database', status: '[ACTIVE]' },
                { icon: '📚', title: 'Literature', desc: 'PubMed & scientific papers', status: '[ACTIVE]' },
                { icon: '🤖', title: 'AI Synthesis', desc: 'Intelligent summarization', status: '[ACTIVE]' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 bg-cyber-bgCard backdrop-blur-sm rounded-lg border border-cyber-cyan/20 hover:border-cyber-cyan/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{feature.icon}</span>
                    <span className="text-xs text-cyber-cyan font-mono">{feature.status}</span>
                  </div>
                  <h3 className="text-lg font-mono font-semibold text-cyber-text mb-1 group-hover:text-cyber-cyan transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-cyber-textDim font-mono">{feature.desc}</p>
                  
                  {/* Progress bar animation */}
                  <div className="mt-3 h-1 bg-cyber-border rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-cyber-cyan"
                      initial={{ width: '0%' }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: index * 0.2 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 text-center border-t border-cyber-border/30">
          <p className="text-cyber-textDim font-mono text-sm">
            © 2025 MoleculeX <span className="text-cyber-cyan">|</span> AI-Powered Pharmaceutical Intelligence
            <br />
            <span className="text-xs opacity-50">v1.0.0-beta</span>
          </p>
        </footer>
      </div>
    </div>
  )
}
