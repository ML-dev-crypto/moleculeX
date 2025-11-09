import { motion } from 'framer-motion'

function FloatingElements() {
  const elements = [
    { id: 1, size: 8, x: '10%', y: '20%', duration: 20, delay: 0 },
    { id: 2, size: 6, x: '80%', y: '30%', duration: 15, delay: 2 },
    { id: 3, size: 10, x: '60%', y: '70%', duration: 25, delay: 4 },
    { id: 4, size: 4, x: '20%', y: '80%', duration: 18, delay: 1 },
    { id: 5, size: 7, x: '90%', y: '60%', duration: 22, delay: 3 },
    { id: 6, size: 5, x: '40%', y: '40%', duration: 16, delay: 5 },
    { id: 7, size: 9, x: '70%', y: '15%', duration: 24, delay: 2.5 },
    { id: 8, size: 6, x: '30%', y: '60%', duration: 19, delay: 4.5 },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          className="absolute rounded-full"
          style={{
            width: el.size,
            height: el.size,
            left: el.x,
            top: el.y,
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, rgba(6, 182, 212, 0) 70%)',
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, 50, 0],
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            delay: el.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Larger floating shapes */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`shape-${i}`}
          className="absolute"
          style={{
            left: `${20 + i * 30}%`,
            top: `${30 + i * 20}%`,
            width: 100 + i * 50,
            height: 100 + i * 50,
            borderRadius: i % 2 === 0 ? '50%' : '30%',
            background: `radial-gradient(circle, rgba(${i === 0 ? '6, 182, 212' : i === 1 ? '59, 130, 246' : '139, 92, 246'}, 0.1) 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, 40 * (i % 2 === 0 ? 1 : -1), 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 30 + i * 5,
            repeat: Infinity,
            delay: i * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default FloatingElements
