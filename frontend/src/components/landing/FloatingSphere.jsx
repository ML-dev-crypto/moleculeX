import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const FloatingSphere = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = 500;
    const height = canvas.height = 500;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 200;

    // Animation frame
    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Create gradient for the sphere
      const gradient = ctx.createRadialGradient(
        centerX - 50,
        centerY - 50,
        0,
        centerX,
        centerY,
        radius
      );
      gradient.addColorStop(0, 'rgba(221, 254, 154, 0.4)');
      gradient.addColorStop(0.5, 'rgba(181, 183, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(91, 95, 242, 0.1)');

      // Draw main sphere
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Add texture dots (moving)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      for (let i = 0; i < 50; i++) {
        const angle = (i * 137.5 + frame * 0.5) * (Math.PI / 180);
        const distance = Math.sqrt(i) * 15;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        const dotRadius = 2 + Math.sin(frame * 0.05 + i) * 1;

        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      frame++;
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Main sphere with canvas */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative"
      >
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="filter drop-shadow-2xl"
        />
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-green/20 via-primary-300/20 to-primary-500/20 blur-3xl" />
      </motion.div>

      {/* Floating labels */}
      <FloatingLabel
        text="Archaea"
        position="top-left"
        delay={0}
      />
      <FloatingLabel
        text="Bacteria"
        position="right"
        delay={0.5}
      />
      <FloatingLabel
        text="Protozoa"
        position="bottom"
        delay={1}
      />
    </div>
  );
};

const FloatingLabel = ({ text, position, delay }) => {
  const positions = {
    'top-left': 'top-8 left-8',
    'right': 'top-1/2 right-8 -translate-y-1/2',
    'bottom': 'bottom-16 left-1/3',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -10, 0],
      }}
      transition={{
        opacity: { delay, duration: 0.6 },
        y: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: delay,
        },
      }}
      className={`absolute ${positions[position]} flex items-center space-x-2`}
    >
      {/* Connector dot */}
      <div className="w-2 h-2 bg-primary-500 rounded-full shadow-glow" />
      
      {/* Label */}
      <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-glass border border-glass-border">
        <span className="text-sm font-semibold text-gray-900">{text}</span>
      </div>
    </motion.div>
  );
};

export default FloatingSphere;
