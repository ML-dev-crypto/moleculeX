"""
API Routes for MoleculeX
"""
from fastapi import APIRouter, HTTPException
from models import QueryRequest, QueryResponse, JobStatusResponse, AnalysisResult
from job_manager import JobManager
from master_agent import MasterAgent
import asyncio

query_router = APIRouter()
status_router = APIRouter()

job_manager = JobManager()
master_agent = MasterAgent()


@query_router.post("/query", response_model=QueryResponse)
async def submit_query(request: QueryRequest):
    """
    Submit a new pharmaceutical query for analysis
    """
    try:
        # Create a new job
        job = job_manager.create_job(request.query)
        
        # Start processing in background
        asyncio.create_task(master_agent.process_query(job["job_id"], request.query))
        
        return QueryResponse(
            job_id=job["job_id"],
            status=job["status"],
            message="Query submitted successfully. Processing started.",
            created_at=job["created_at"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit query: {str(e)}")


@status_router.get("/status/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """
    Get current status of a job
    """
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobStatusResponse(**job)


@status_router.get("/result/{job_id}", response_model=AnalysisResult)
async def get_job_result(job_id: str):
    """
    Get final results of a completed job
    """
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Job is not completed yet. Current status: {job['status']}"
        )
    
    result = job_manager.get_result(job_id)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    return AnalysisResult(**result)
