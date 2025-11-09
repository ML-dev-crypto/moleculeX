"""
Job management system using local JSON files
"""
import json
import os
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from models import JobStatus, AgentStatus, AgentInfo


class JobManager:
    """Manages job lifecycle and persistence"""
    
    def __init__(self, data_dir: str = "data/jobs"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
    
    def _get_job_path(self, job_id: str) -> str:
        """Get file path for a job"""
        return os.path.join(self.data_dir, f"{job_id}.json")
    
    def _get_result_path(self, job_id: str) -> str:
        """Get file path for job results"""
        return os.path.join(self.data_dir, f"{job_id}_result.json")
    
    def create_job(self, query: str) -> Dict[str, Any]:
        """Create a new job"""
        job_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        job = {
            "job_id": job_id,
            "query": query,
            "status": JobStatus.QUEUED.value,
            "agents": [
                {
                    "name": "Master Agent",
                    "status": AgentStatus.IDLE.value,
                    "result_count": 0
                },
                {
                    "name": "Clinical Trials Agent",
                    "status": AgentStatus.IDLE.value,
                    "result_count": 0
                },
                {
                    "name": "Patent Agent",
                    "status": AgentStatus.IDLE.value,
                    "result_count": 0
                },
                {
                    "name": "Web Intel Agent",
                    "status": AgentStatus.IDLE.value,
                    "result_count": 0
                }
            ],
            "progress": 0,
            "created_at": timestamp,
            "updated_at": timestamp
        }
        
        self._save_job(job)
        return job
    
    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a job by ID"""
        job_path = self._get_job_path(job_id)
        if not os.path.exists(job_path):
            return None
        
        with open(job_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def update_job(self, job_id: str, updates: Dict[str, Any]):
        """Update job fields"""
        job = self.get_job(job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found")
        
        job.update(updates)
        job["updated_at"] = datetime.utcnow().isoformat()
        self._save_job(job)
    
    def update_agent_status(self, job_id: str, agent_name: str, status: AgentStatus, 
                           result_count: int = 0, error: Optional[str] = None):
        """Update specific agent status"""
        job = self.get_job(job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found")
        
        for agent in job["agents"]:
            if agent["name"] == agent_name:
                agent["status"] = status.value
                agent["result_count"] = result_count
                if status == AgentStatus.RUNNING and not agent.get("start_time"):
                    agent["start_time"] = datetime.utcnow().isoformat()
                if status in [AgentStatus.COMPLETED, AgentStatus.FAILED]:
                    agent["end_time"] = datetime.utcnow().isoformat()
                if error:
                    agent["error"] = error
                break
        
        job["updated_at"] = datetime.utcnow().isoformat()
        self._save_job(job)
    
    def save_result(self, job_id: str, result: Dict[str, Any]):
        """Save final job results"""
        result_path = self._get_result_path(job_id)
        with open(result_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
    
    def get_result(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve job results"""
        result_path = self._get_result_path(job_id)
        if not os.path.exists(result_path):
            return None
        
        with open(result_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def _save_job(self, job: Dict[str, Any]):
        """Save job to disk"""
        job_path = self._get_job_path(job["job_id"])
        with open(job_path, 'w', encoding='utf-8') as f:
            json.dump(job, f, indent=2, ensure_ascii=False)
