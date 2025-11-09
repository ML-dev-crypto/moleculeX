import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function CursorTrail() {
  const [trails, setTrails] = useState([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    let trailId = 0

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })

      const newTrail = {
        id: trailId++,
        x: e.clientX,
        y: e.clientY,
      }

      setTrails((prev) => [...prev, newTrail])

      setTimeout(() => {
        setTrails((prev) => prev.filter((trail) => trail.id !== newTrail.id))
      }, 1000)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {trails.map((trail) => (
          <motion.div
            key={trail.id}
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
            style={{
              left: trail.x - 4,
              top: trail.y - 4,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Custom cursor */}
      <motion.div
        className="absolute w-6 h-6 rounded-full border-2 border-cyan-400/50 pointer-events-none"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
        }}
      />
    </div>
  )
}

export default CursorTrail
