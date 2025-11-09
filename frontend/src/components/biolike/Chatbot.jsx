import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chatbot({ jobId, jobData }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I can help you understand the analysis results. What would you like to know more about?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message to backend for AI response
      const response = await fetch(`http://localhost:8000/api/chat/${jobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          context: jobData
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const assistantMessage = {
        role: 'assistant',
        content: data.response || 'I apologize, but I encountered an error processing your question.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-dark-800/80 border-b border-cyan-500/20 p-4">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-cyan-400 font-mono text-sm">AI Assistant</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-100'
                    : 'bg-dark-800/50 border border-cyan-500/10 text-gray-300'
                }`}
              >
                <div className="font-mono text-sm mb-1">
                  {message.role === 'user' ? 'You' : 'AI Assistant'}
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-dark-800/50 border border-cyan-500/10 rounded-lg p-3">
              <div className="flex gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="w-2 h-2 bg-cyan-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-cyan-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-cyan-400 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-cyan-500/20 p-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question..."
            disabled={isLoading}
            className="flex-1 bg-dark-800/50 border border-cyan-500/20 rounded-lg px-4 py-2 
                     text-white placeholder-gray-500 font-mono text-sm
                     focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <motion.button
            type="submit"
            disabled={isLoading || !input.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg
                     font-mono text-sm font-semibold
                     hover:from-cyan-400 hover:to-blue-400
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </motion.button>
        </div>
      </form>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(10, 10, 10, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </motion.div>
  );
}
