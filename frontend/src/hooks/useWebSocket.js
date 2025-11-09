import { useEffect, useRef, useState } from 'react'

export default function useWebSocket(jobId, onMessage) {
  const ws = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const reconnectTimeoutRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    if (!jobId) return

    mountedRef.current = true
    
    const connect = () => {
      if (!mountedRef.current) return
      
      // WebSocket URL
      const wsUrl = `ws://localhost:8000/ws/jobs/${jobId}`
      
      // Create WebSocket connection
      ws.current = new WebSocket(wsUrl)

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected')
        setIsConnected(true)
        
        // Send a ping every 30 seconds to keep connection alive
        const pingInterval = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send('ping')
          }
        }, 30000)
        
        ws.current.pingInterval = pingInterval
      }

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          console.log('📨 WebSocket message:', message)
          if (onMessage) {
            onMessage(message)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
      }

      ws.current.onclose = () => {
        console.log('👋 WebSocket disconnected')
        setIsConnected(false)
        
        // Clear ping interval
        if (ws.current?.pingInterval) {
          clearInterval(ws.current.pingInterval)
        }
        
        // Only reconnect if component is still mounted and after a delay
        if (mountedRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Reconnecting WebSocket...')
            connect()
          }, 3000) // Wait 3 seconds before reconnecting
        }
      }
    }

    connect()

    // Cleanup on unmount
    return () => {
      mountedRef.current = false
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      
      if (ws.current) {
        if (ws.current.pingInterval) {
          clearInterval(ws.current.pingInterval)
        }
        ws.current.close()
      }
    }
  }, [jobId]) // Remove onMessage from dependencies to prevent reconnection

  return { isConnected }
}
