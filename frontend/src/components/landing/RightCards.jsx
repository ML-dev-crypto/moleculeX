import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

const RightCards = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="space-y-6 z-10"
    >
      {/* Exploration Card */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">Exploration</h3>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 45 }}
            className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 text-white"
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

        {/* Thumbnail */}
        <div className="relative rounded-xl overflow-hidden mb-3 h-32 bg-gradient-to-br from-primary-200 via-primary-300 to-neon-green/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-white opacity-50"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <circle cx="7" cy="7" r="3" />
              <circle cx="14" cy="10" r="2" />
              <circle cx="10" cy="14" r="2.5" />
            </svg>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          These endoscores reveal the astonishing diversity of microorganisms.
        </p>
      </GlassCard>

      {/* Research Card */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">Research</h3>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 45 }}
            className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 text-white"
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

        {/* Video Thumbnail */}
        <div className="relative rounded-xl overflow-hidden mb-3 h-32 bg-gradient-to-br from-blue-900 via-blue-800 to-primary-600">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.2 }}
              className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40"
            >
              <svg
                className="w-6 h-6 text-white ml-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </motion.button>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          We invite you to delve into the captivating realm of microorganisms.
        </p>
      </GlassCard>

      {/* Join Community Card */}
      <GlassCard className="!p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-semibold text-gray-700">
              Connect with a vibrant
              <br />
              community of microbiology
              <br />
              enthusiasts.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          {/* Avatar Group */}
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 border-2 border-white shadow-md"
              />
            ))}
          </div>

          {/* Join Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-full"
          >
            <span>Join Now</span>
            <svg
              className="w-3 h-3"
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
      </GlassCard>
    </motion.div>
  );
};

export default RightCards;
