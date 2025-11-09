import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

function DNABackground() {
  const canvasRef = useRef(null)
  const { scrollYProgress } = useScroll()
  
  // Transform scroll progress to scale and rotation
  const scale = useTransform(scrollYProgress, [0, 1], [1, 3])
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 0.5, 0.3, 0.1])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationFrameId
    let time = 0

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const drawDNA = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const helixHeight = canvas.height
      const amplitude = 100 // Width of the helix
      const frequency = 0.02 // How many turns
      const numPoints = 200
      const connectionEvery = 8 // Connect strands every N points

      time += 0.5

      // Draw two DNA strands
      for (let strand = 0; strand < 2; strand++) {
        ctx.beginPath()
        
        for (let i = 0; i < numPoints; i++) {
          const y = (i / numPoints) * helixHeight
          const angle = y * frequency + time * 0.01 + (strand * Math.PI)
          const x = centerX + Math.sin(angle) * amplitude

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }

          // Draw connection bars between strands
          if (i % connectionEvery === 0) {
            const angle2 = y * frequency + time * 0.01 + ((strand + 1) % 2 * Math.PI)
            const x2 = centerX + Math.sin(angle2) * amplitude

            // Create gradient for connection
            const gradient = ctx.createLinearGradient(x, y, x2, y)
            gradient.addColorStop(0, 'rgba(6, 182, 212, 0.3)')
            gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.5)')
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0.3)')

            ctx.strokeStyle = gradient
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x2, y)
            ctx.stroke()

            // Draw node circles
            const nodeGradient = ctx.createRadialGradient(x, y, 0, x, y, 4)
            nodeGradient.addColorStop(0, 'rgba(6, 182, 212, 0.8)')
            nodeGradient.addColorStop(1, 'rgba(6, 182, 212, 0)')
            ctx.fillStyle = nodeGradient
            ctx.beginPath()
            ctx.arc(x, y, 4, 0, Math.PI * 2)
            ctx.fill()
          }
        }

        // Draw main strand
        const strandGradient = ctx.createLinearGradient(0, 0, 0, helixHeight)
        strandGradient.addColorStop(0, 'rgba(6, 182, 212, 0.4)')
        strandGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)')
        strandGradient.addColorStop(1, 'rgba(139, 92, 246, 0.4)')

        ctx.strokeStyle = strandGradient
        ctx.lineWidth = 2
        ctx.stroke()
      }

      animationFrameId = requestAnimationFrame(drawDNA)
    }

    drawDNA()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        scale,
        rotate,
        opacity,
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          filter: 'blur(1px)',
        }}
      />
    </motion.div>
  )
}

export default DNABackground
