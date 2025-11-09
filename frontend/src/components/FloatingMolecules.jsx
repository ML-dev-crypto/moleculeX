import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function FloatingMolecules() {
  const [molecules, setMolecules] = useState([])

  useEffect(() => {
    // Generate random molecule positions
    const generated = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 60 + 40,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
    }))
    setMolecules(generated)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
      {molecules.map((mol) => (
        <motion.div
          key={mol.id}
          className="absolute rounded-full"
          style={{
            left: `${mol.x}%`,
            top: `${mol.y}%`,
            width: `${mol.size}px`,
            height: `${mol.size}px`,
            background: `radial-gradient(circle, rgba(199, 200, 255, 0.15), transparent)`,
            border: '1px solid rgba(199, 200, 255, 0.1)',
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: mol.duration,
            delay: mol.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
