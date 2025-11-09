import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="w-full py-12 px-6 mt-24 border-t border-apple-gray-200/50 backdrop-blur-sm bg-white/50"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧬</span>
            <div>
              <p className="text-sm font-semibold text-apple-gray-800">MoleculeX</p>
              <p className="text-xs text-apple-gray-500">© 2025 All rights reserved</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-apple-gray-600">
            <a
              href="#"
              className="hover:text-primary transition-colors focus:outline-none focus:text-primary"
            >
              Privacy Policy
            </a>
            <span className="text-apple-gray-300">|</span>
            <a
              href="#"
              className="hover:text-primary transition-colors focus:outline-none focus:text-primary"
            >
              Terms of Service
            </a>
            <span className="text-apple-gray-300">|</span>
            <a
              href="#"
              className="hover:text-primary transition-colors focus:outline-none focus:text-primary"
            >
              About Us
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-apple-gray-200/50">
          <p className="text-xs text-apple-gray-500 text-center leading-relaxed max-w-3xl mx-auto">
            <strong>Disclaimer:</strong> MoleculeX is a research tool. All data is for informational purposes only and does not constitute 
            medical, legal, or investment advice. Consult qualified professionals before making decisions based on this information.
          </p>
        </div>
      </div>
    </motion.footer>
  )
}
