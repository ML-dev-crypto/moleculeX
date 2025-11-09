"""
WebSocket connection manager for real-time updates
"""
from fastapi import WebSocket
from typing import Dict, List
import json
from datetime import datetime


class ConnectionManager:
    """Manages WebSocket connections for job updates"""
    
    def __init__(self):
        # job_id -> list of websocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, job_id: str):
        """Accept and store a new WebSocket connection"""
        await websocket.accept()
        if job_id not in self.active_connections:
            self.active_connections[job_id] = []
        self.active_connections[job_id].append(websocket)
        print(f"✅ WebSocket connected for job {job_id}")
    
    def disconnect(self, websocket: WebSocket, job_id: str):
        """Remove a WebSocket connection"""
        if job_id in self.active_connections:
            self.active_connections[job_id].remove(websocket)
            if not self.active_connections[job_id]:
                del self.active_connections[job_id]
        print(f"❌ WebSocket disconnected for job {job_id}")
    
    async def send_update(self, job_id: str, event_type: str, data: dict):
        """Send update to all connections for a job"""
        if job_id not in self.active_connections:
            return
        
        message = {
            "job_id": job_id,
            "event_type": event_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Send to all active connections for this job
        disconnected = []
        for connection in self.active_connections[job_id]:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending to websocket: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection, job_id)


# Global instance
manager = ConnectionManager()
