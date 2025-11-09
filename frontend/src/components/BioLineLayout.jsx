import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Hero from './biolike/Hero'
import Problem from './biolike/Problem'
import Solution from './biolike/Solution'
import System from './biolike/System'
import PerplexityAnalysis from './biolike/PerplexityAnalysis'
import DNABackground from './biolike/DNABackground'
import FloatingElements from './biolike/FloatingElements'

function BioLineLayout() {
  const [activeSection, setActiveSection] = useState('home')
  const [currentView, setCurrentView] = useState('landing') // 'landing' or 'analysis'

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'problem', 'solution', 'system']
      const scrollPosition = window.scrollY + 200

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleStartAnalysis = () => {
    setCurrentView('analysis')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToHome = () => {
    setCurrentView('landing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* DNA Background with scroll effect */}
      <DNABackground />

      {/* Floating elements */}
      <FloatingElements />

      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px]"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[120px]"
          animate={{
            x: [0, -50, 0],
            y: [0, 100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-black/30 border-b border-white/5"
        style={{
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3))',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={currentView === 'dashboard' ? handleBackToHome : () => scrollToSection('home')}
              className="flex items-center gap-2 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span 
                className="text-2xl font-mono font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  backgroundSize: '200% auto',
                }}
              >
                MoleculeX
              </motion.span>
              <motion.span 
                className="text-xs text-cyan-400 font-mono"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                _
              </motion.span>
            </motion.button>

            <div className="flex items-center gap-8">
              {currentView === 'landing' && (
                <>
                  {[
                    { id: 'problem', label: '01_PROBLEM' },
                    { id: 'solution', label: '02_SOLUTION' },
                    { id: 'system', label: '03_SYSTEM' },
                  ].map((link) => (
                    <motion.button
                      key={link.id}
                      onClick={() => scrollToSection(link.id)}
                      className={`text-sm font-mono transition-all relative ${
                        activeSection === link.id
                          ? 'text-cyan-400'
                          : 'text-gray-500 hover:text-white'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {link.label}
                      {activeSection === link.id && (
                        <motion.div
                          layoutId="activeSection"
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </>
              )}

              {currentView === 'landing' ? (
                <motion.button
                  onClick={handleStartAnalysis}
                  className="relative px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-sm overflow-hidden rounded group"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(6, 182, 212, 0.2)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">[ANALYZE]</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </motion.button>
              ) : null}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Content */}
      <AnimatePresence mode="wait">
        {currentView === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-16"
          >
            <Hero onStartAnalysis={handleStartAnalysis} />
            <Problem />
            <Solution />
            <System />
          </motion.div>
        ) : (
          <motion.div
            key="analysis"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PerplexityAnalysis onBack={handleBackToHome} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm font-mono text-gray-600">
              © 2025 MoleculeX — AI-Driven Pharmaceutical Intelligence
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm font-mono text-gray-600 hover:text-cyan-400 transition-colors">
                Documentation
              </a>
              <a href="#" className="text-sm font-mono text-gray-600 hover:text-cyan-400 transition-colors">
                API
              </a>
              <a href="#" className="text-sm font-mono text-gray-600 hover:text-cyan-400 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default BioLineLayout
