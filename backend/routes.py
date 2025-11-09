"""
API Routes for MoleculeX
"""
from fastapi import APIRouter, HTTPException
from models import QueryRequest, QueryResponse, JobStatusResponse, AnalysisResult, ChatRequest, ChatResponse
from job_manager import JobManager
from master_agent import MasterAgent
import asyncio
from datetime import datetime
import os

query_router = APIRouter()
status_router = APIRouter()
chat_router = APIRouter()

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


@chat_router.post("/chat/{job_id}", response_model=ChatResponse)
async def chat_with_results(job_id: str, request: ChatRequest):
    """
    Chat with AI about analysis results
    """
    try:
        # Verify job exists
        job = job_manager.get_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Get the context (results)
        context = request.context or {}
        
        # Generate AI response based on the question and context
        response_text = await generate_chat_response(request.message, context, job)
        
        return ChatResponse(
            response=response_text,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


async def generate_chat_response(message: str, context: dict, job: dict) -> str:
    """
    Generate AI response to user's question about results
    Uses Google Gemini if available, otherwise provides rule-based responses
    """
    try:
        # Try to use Gemini API if available
        from google import generativeai as genai
        
        api_key = os.getenv('GEMINI_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-pro')
            
            # Build context-aware prompt
            prompt = f"""You are an AI assistant helping analyze pharmaceutical research data.

Original Query: {job.get('query', 'N/A')}

Analysis Results Summary:
- Clinical Trials Found: {len(context.get('clinical_trials', []))}
- Patents Found: {len(context.get('patents', []))}
- Web Intelligence Items: {len(context.get('web_intel', []))}

User Question: {message}

Please provide a helpful, concise response based on the analysis results. If the question asks about specific findings, reference the data when possible. Keep your response under 300 words."""

            response = model.generate_content(prompt)
            return response.text
        
    except Exception as e:
        print(f"Gemini API error: {e}")
    
    # Fallback to rule-based responses
    message_lower = message.lower()
    
    # Keyword-based responses
    if any(word in message_lower for word in ['clinical trial', 'trial', 'study', 'studies']):
        trial_count = len(context.get('clinical_trials', []))
        return f"The analysis found {trial_count} relevant clinical trials. These studies provide insights into ongoing research and development in this area. Would you like me to elaborate on any specific trial?"
    
    elif any(word in message_lower for word in ['patent', 'intellectual property', 'ip']):
        patent_count = len(context.get('patents', []))
        return f"The search identified {patent_count} patents related to your query. These patents represent intellectual property in this pharmaceutical space and may indicate competitive activity or innovation trends."
    
    elif any(word in message_lower for word in ['summary', 'overview', 'summarize']):
        return context.get('executive_summary', 'The analysis is still processing. The executive summary will be available once all agents complete their work.')
    
    elif any(word in message_lower for word in ['finding', 'key', 'important', 'highlight']):
        findings = context.get('key_findings', [])
        if findings:
            return "Key findings from the analysis:\n" + "\n".join(f"• {f}" for f in findings[:5])
        return "Key findings are being compiled from the various data sources."
    
    elif any(word in message_lower for word in ['confidence', 'reliable', 'trust']):
        confidence = context.get('confidence_score', 0)
        level = context.get('confidence_level', 'Medium')
        return f"The analysis has a confidence level of {level} (score: {confidence:.1f}/100). This is based on the quality and quantity of data sources found across clinical trials, patents, and web intelligence."
    
    else:
        # Generic helpful response
        return f"I can help you understand the analysis results for '{job.get('query', 'your query')}'. You can ask me about clinical trials, patents, key findings, or request a summary of the results. What would you like to know more about?"
