import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hover = true, ...props }) => {
  const baseClasses = `
    bg-white/20 
    backdrop-blur-glass 
    rounded-2xl 
    border border-glass-border 
    shadow-glass 
    p-6
  `;

  const hoverClasses = hover
    ? 'hover:shadow-glass-hover hover:bg-white/30 transition-all duration-300'
    : '';

  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.02 } : {}}
      transition={{ duration: 0.3 }}
      className={`${baseClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
