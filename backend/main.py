"""
MoleculeX - AI-Driven Pharmaceutical Insight Discovery Platform
Main FastAPI Application
"""
from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn
import os

from routes import query_router, status_router, chat_router
from websocket_manager import ConnectionManager

# Create necessary directories
os.makedirs("data/jobs", exist_ok=True)
os.makedirs("data/reports", exist_ok=True)

# WebSocket connection manager
manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    print("🚀 MoleculeX is starting up...")
    yield
    print("👋 MoleculeX is shutting down...")


app = FastAPI(
    title="MoleculeX API",
    description="AI-Driven Pharmaceutical Insight Discovery Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for React frontend
# Get allowed origins from environment variable or use defaults
allowed_origins = os.getenv("FRONTEND_URL", "http://localhost:5173").split(",")
# Add production and development origins
allowed_origins.extend([
    "http://localhost:5173", 
    "http://localhost:3000",
    "https://molecule-x.vercel.app",
    "https://molecule-x.vercel.app/"
])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(query_router, prefix="/api", tags=["queries"])
app.include_router(status_router, prefix="/api", tags=["status"])
app.include_router(chat_router, prefix="/api", tags=["chat"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "MoleculeX API",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }


@app.get("/api/health")
async def health_check():
    """Detailed health check for monitoring"""
    return {
        "status": "ok",
        "service": "MoleculeX API",
        "version": "1.0.0",
        "checks": {
            "api": "healthy",
            "websocket": "healthy"
        }
    }


@app.websocket("/ws/jobs/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    """WebSocket endpoint for real-time job updates"""
    await manager.connect(websocket, job_id)
    try:
        while True:
            # Keep connection alive - wait for any message from client
            try:
                await websocket.receive_text()
            except Exception:
                break
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(websocket, job_id)
        print(f"WebSocket disconnected for job {job_id}")


@app.get("/api/reports/{filename}")
async def get_report(filename: str):
    """Serve generated reports (PDF or text). Looks in project_root/data/reports and backend/data/reports."""
    # Determine probable locations
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(backend_dir)
    candidates = [
        os.path.join(project_root, "data", "reports", filename),
        os.path.join("data", "reports", filename),
        os.path.join(backend_dir, "data", "reports", filename),
    ]
    file_path = next((p for p in candidates if os.path.exists(p)), None)
    if not file_path:
        raise HTTPException(status_code=404, detail="Report not found")
    # Infer media type from extension
    ext = os.path.splitext(file_path)[1].lower()
    media_type = "application/pdf" if ext == ".pdf" else "text/plain"
    return FileResponse(file_path, media_type=media_type, filename=filename)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
