import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant for pharmaceutical intelligence. Ask me about clinical trials, patents, drug development, or any research query.',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    
    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      // TODO: Replace with actual API endpoint
      // For now, simulate AI response
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      const aiResponse = `I understand you're asking about "${userMessage}". This is a simulated response. To enable real AI responses, you need to:

1. Set up an API route in the backend
2. Configure OpenAI API key
3. Use Vercel AI SDK's streaming API

Would you like help with any specific pharmaceutical research?`

      setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-perplexity-primary to-perplexity-blue-600 flex items-center justify-center">
            <span className="text-white text-xl">🤖</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
            <p className="text-sm text-gray-500">Pharmaceutical Intelligence Chat</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-perplexity-primary text-white flex items-center justify-center text-sm font-semibold">
                  AI
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-perplexity-primary text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-semibold">
                  U
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-perplexity-primary text-white flex items-center justify-center text-sm font-semibold">
              AI
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about clinical trials, patents, drug research..."
            className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-perplexity-primary focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-perplexity-primary text-white rounded-full font-medium text-sm hover:bg-perplexity-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  )
}
