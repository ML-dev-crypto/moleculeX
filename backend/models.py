"""
Data models for MoleculeX
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum
from datetime import datetime


class JobStatus(str, Enum):
    """Job execution status"""
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class AgentStatus(str, Enum):
    """Individual agent status"""
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class QueryRequest(BaseModel):
    """User query request"""
    query: str = Field(..., min_length=10, max_length=500, description="User's pharmaceutical query")


class QueryResponse(BaseModel):
    """Query submission response"""
    job_id: str
    status: JobStatus
    message: str
    created_at: str


class AgentInfo(BaseModel):
    """Agent execution information"""
    name: str
    status: AgentStatus
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    result_count: int = 0
    error: Optional[str] = None


class JobStatusResponse(BaseModel):
    """Job status response"""
    job_id: str
    status: JobStatus
    query: str
    agents: List[AgentInfo]
    progress: int  # 0-100
    created_at: str
    updated_at: str


class ClinicalTrialResult(BaseModel):
    """Structured clinical trial data"""
    nct_id: str
    title: str
    status: str
    phase: Optional[str] = None
    condition: str
    intervention: Optional[str] = None
    sponsor: Optional[str] = None
    start_date: Optional[str] = None
    completion_date: Optional[str] = None
    enrollment: Optional[int] = None
    location: Optional[str] = None
    source_url: str = ""  # Provenance: Link to ClinicalTrials.gov
    retrieved_at: str = ""  # Provenance: Timestamp when data was fetched
    match_score: float = 0.0  # Relevance match score 0-1
    matched_terms: List[str] = []  # Terms that matched in this result


class PatentResult(BaseModel):
    """Patent information (placeholder)"""
    patent_id: str
    title: str
    assignee: str
    filing_date: str
    status: str
    source_url: str = ""  # Provenance: Link to PatentsView
    retrieved_at: str = ""  # Provenance: Timestamp when data was fetched
    match_score: float = 0.0  # Relevance match score 0-1
    matched_terms: List[str] = []  # Terms that matched in this result


class WebIntelResult(BaseModel):
    """Web intelligence data (placeholder)"""
    source: str
    title: str
    url: str  # Already contains source URL
    snippet: str
    relevance_score: float
    retrieved_at: str = ""  # Provenance: Timestamp when data was fetched
    matched_terms: List[str] = []  # Terms that matched in this result


class AnalysisResult(BaseModel):
    """Final analysis results"""
    job_id: str
    query: str
    status: JobStatus
    executive_summary: str
    key_findings: List[str]
    clinical_trials: List[ClinicalTrialResult]
    patents: List[PatentResult]
    web_intel: List[WebIntelResult]
    report_url: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None
    confidence_score: float = 0.0  # Overall analysis confidence 0-100
    confidence_level: str = "Medium"  # High / Medium / Low


class WebSocketMessage(BaseModel):
    """WebSocket update message"""
    job_id: str
    event_type: str  # agent_update, progress_update, job_completed
    data: Dict[str, Any]
    timestamp: str
