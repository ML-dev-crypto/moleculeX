import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

const Hero = ({ onStartAnalysis }) => {
  return (
    <div className="relative min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 z-10"
          >
            {/* Main Heading */}
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-gray-900">
              Explore the
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">
                Fascinating World
              </span>
              <br />
              of Microorganisms
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
              Dive deep into the unseen world of microorganisms. Our
              state-of-the-art facility is your playground for exploration,
              research, and learning in the realm of microbiology.
            </p>

            {/* CTA Button */}
            <motion.button
              onClick={onStartAnalysis}
              whileHover={{ scale: 1.05, boxShadow: '0 0 32px rgba(221, 254, 154, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-neon-green text-gray-900 font-bold rounded-full shadow-glow-mint hover:shadow-glow transition-all duration-300"
            >
              <span>Get Started</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </motion.button>

            {/* Free eBook Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <GlassCard className="max-w-md">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      Free eBook
                    </h3>
                    <p className="text-sm text-gray-600">
                      Don't miss out on this limited-time opportunity. Start
                      your literacy journey today and claim your FREE eBook now!
                    </p>
                    <motion.button
                      whileHover={{ x: 5 }}
                      className="inline-flex items-center space-x-2 text-primary-500 font-semibold mt-2"
                    >
                      <span>Claim Now</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>

          {/* Right side - This will be overlapped by the sphere */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </div>
  );
};

export default Hero;
