import { motion } from 'framer-motion'

export default function ReportDownload({ reportUrl, jobId }) {
  const handleDownload = () => {
    window.open(reportUrl, '_blank')
  }
  
  // Check if it's a PDF or text file
  const isPdf = reportUrl?.endsWith('.pdf')
  const fileType = isPdf ? 'PDF' : 'Text'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="backdrop-blur-glass bg-white/70 rounded-3xl shadow-apple-lg border border-white/30 overflow-hidden"
    >
      <div className="p-8 flex items-center justify-between flex-wrap gap-6">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-5xl"
          >
            📥
          </motion.div>
          <div>
            <h3 className="text-2xl font-display font-semibold text-apple-gray-800 mb-1">
              Report Ready
            </h3>
            <p className="text-apple-gray-600">
              Your comprehensive analysis report is ready for download ({fileType})
            </p>
          </div>
        </div>
        
        <motion.button
          onClick={handleDownload}
          className="backdrop-blur-sm bg-apple-gray-800/90 text-white font-semibold py-4 px-8 rounded-full hover:bg-apple-gray-900 transition-all shadow-apple"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download {fileType} Report
          </span>
        </motion.button>
      </div>
    </motion.div>
  )
}
