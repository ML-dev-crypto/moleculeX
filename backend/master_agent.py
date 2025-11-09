"""
Master Agent - Orchestrates worker agents and synthesizes results
"""
import asyncio
from typing import Dict, Any, List
from datetime import datetime

from agents.clinical_trials_agent import ClinicalTrialsAgent
from agents.patent_agent import PatentAgent
from agents.web_intel_agent import WebIntelAgent
from job_manager import JobManager
from websocket_manager import manager as ws_manager
from models import JobStatus, AgentStatus
from report_generator import ReportGenerator
from query_normalizer import QueryNormalizer
# from semantic_search import SemanticSearchEngine  # Disabled for memory constraints


class MasterAgent:
    """Master orchestrator for multi-agent pharmaceutical analysis"""
    
    def __init__(self):
        self.name = "Master Agent"
        self.job_manager = JobManager()
        self.report_generator = ReportGenerator()
        self.query_normalizer = QueryNormalizer()
        # self.semantic_search = SemanticSearchEngine()  # Disabled for memory constraints
        
        # Initialize worker agents
        self.clinical_trials_agent = ClinicalTrialsAgent()
        self.patent_agent = PatentAgent()
        self.web_intel_agent = WebIntelAgent()
    
    async def process_query(self, job_id: str, query: str):
        """
        Main orchestration logic:
        1. Normalize query with MeSH mapping
        2. Parse intent and plan tasks
        3. Delegate to worker agents with expanded terms
        4. Synthesize and re-rank results
        5. Generate PDF report
        """
        try:
            print(f"🎯 {self.name}: Starting analysis for job {job_id}")
            
            # Update job status
            self.job_manager.update_job(job_id, {"status": JobStatus.RUNNING.value})
            await self._send_ws_update(job_id, "job_started", {"query": query})
            
            # Step 1: Normalize query with MeSH mapping and synonym expansion
            await self._update_master_status(job_id, AgentStatus.RUNNING)
            normalized = self.query_normalizer.normalize_query(query)
            print(f"📋 Normalized query: {normalized['normalized']}")
            print(f"📋 Canonical terms: {normalized['canonical_terms']}")
            
            # Parse intent with normalized query
            intent = self._parse_intent(query)
            intent["normalized"] = normalized  # Add normalized data to intent
            await asyncio.sleep(0.5)
            await self._update_master_status(job_id, AgentStatus.COMPLETED)
            self.job_manager.update_job(job_id, {"progress": 10})
            
            # Step 2: Run worker agents in parallel with normalized/expanded queries
            results = await self._run_workers(job_id, query, intent)
            self.job_manager.update_job(job_id, {"progress": 70})
            
            # Step 3: Synthesize findings with match scoring
            await self._update_master_status(job_id, AgentStatus.RUNNING)
            analysis = self._synthesize_results(query, results, intent)
            await asyncio.sleep(1)
            self.job_manager.update_job(job_id, {"progress": 85})
            
            # Step 4: Generate report (PDF or text fallback)
            report_path = await self.report_generator.generate(job_id, query, analysis)
            
            # Determine file extension from report_path
            import os
            file_name = os.path.basename(report_path)
            analysis["report_url"] = f"/api/reports/{file_name}"
            self.job_manager.update_job(job_id, {"progress": 95})
            
            # Step 5: Save final results
            final_result = {
                "job_id": job_id,
                "query": query,
                "status": JobStatus.COMPLETED.value,
                **analysis,
                "created_at": self.job_manager.get_job(job_id)["created_at"],
                "completed_at": datetime.utcnow().isoformat()
            }
            
            self.job_manager.save_result(job_id, final_result)
            self.job_manager.update_job(job_id, {
                "status": JobStatus.COMPLETED.value,
                "progress": 100
            })
            await self._update_master_status(job_id, AgentStatus.COMPLETED)
            
            # Notify completion via WebSocket
            await self._send_ws_update(job_id, "job_completed", {
                "report_url": analysis["report_url"]
            })
            
            print(f"✅ {self.name}: Analysis completed for job {job_id}")
            
        except Exception as e:
            print(f"❌ {self.name}: Error processing job {job_id}: {e}")
            self.job_manager.update_job(job_id, {"status": JobStatus.FAILED.value})
            await self._send_ws_update(job_id, "job_failed", {"error": str(e)})
    
    def _parse_intent(self, query: str) -> Dict[str, Any]:
        """Parse user query to understand intent and extract parameters"""
        query_lower = query.lower()
        
        intent = {
            "focus_areas": [],
            "geographic_region": None,
            "analysis_type": "competitive_landscape"
        }
        
        # Detect focus areas
        if any(word in query_lower for word in ["competition", "competitive", "market"]):
            intent["focus_areas"].append("competition_analysis")
        if any(word in query_lower for word in ["burden", "prevalence", "patients"]):
            intent["focus_areas"].append("patient_burden")
        if any(word in query_lower for word in ["opportunity", "gap", "unmet"]):
            intent["focus_areas"].append("opportunity_detection")
        
        # Detect geography
        regions = {
            "india": "India",
            "china": "China",
            "united states": "United States",
            "europe": "Europe",
            "asia": "Asia"
        }
        for key, value in regions.items():
            if key in query_lower:
                intent["geographic_region"] = value
                break
        
        return intent
    
    async def _run_workers(self, job_id: str, query: str, intent: Dict[str, Any]) -> Dict[str, Any]:
        """Run all worker agents in parallel with timeouts, expanded terms, and graceful failures"""
        
        # Extract normalized/expanded terms from intent
        normalized = intent.get("normalized", {})
        search_terms = normalized.get("search_terms", {})
        
        # Clinical Trials Agent with timeout and expanded terms
        async def run_clinical():
            try:
                self.job_manager.update_agent_status(
                    job_id, "Clinical Trials Agent", AgentStatus.RUNNING
                )
                await self._send_ws_update(job_id, "agent_update", {
                    "agent": "Clinical Trials Agent",
                    "status": "running"
                })
                
                # Pass expanded terms for better search
                expanded = search_terms.get("clinical_trials", [])
                
                # 30-second timeout for clinical trials search - fetch top 20
                results = await asyncio.wait_for(
                    self.clinical_trials_agent.search(query, max_results=20, expanded_terms=expanded), 
                    timeout=30.0
                )
                competition = await self.clinical_trials_agent.analyze_competition(results)
                
                self.job_manager.update_agent_status(
                    job_id, "Clinical Trials Agent", AgentStatus.COMPLETED, len(results)
                )
                await self._send_ws_update(job_id, "agent_update", {
                    "agent": "Clinical Trials Agent",
                    "status": "completed",
                    "result_count": len(results)
                })
                
                return {"trials": results, "competition_analysis": competition}
            except asyncio.TimeoutError:
                print(f"⚠️ Clinical Trials Agent: Timeout after 30s")
                self.job_manager.update_agent_status(
                    job_id, "Clinical Trials Agent", AgentStatus.FAILED, 0, "Timeout"
                )
                await self._send_ws_update(job_id, "agent_update", {
                    "agent": "Clinical Trials Agent",
                    "status": "failed",
                    "error": "Timeout"
                })
                return {"trials": [], "competition_analysis": {}}
            except Exception as e:
                self.job_manager.update_agent_status(
                    job_id, "Clinical Trials Agent", AgentStatus.FAILED, error=str(e)
                )
                return {"trials": [], "competition_analysis": {}}
        
        # Patent Agent with timeout and expanded terms
        async def run_patent():
            try:
                self.job_manager.update_agent_status(
                    job_id, "Patent Agent", AgentStatus.RUNNING
                )
                await self._send_ws_update(job_id, "agent_update", {
                    "agent": "Patent Agent",
                    "status": "running"
                })
                
                # Pass expanded terms (focused for patents)
                expanded = search_terms.get("patents", [])
                
                # 30-second timeout for patent search - fetch top 20
                results = await asyncio.wait_for(
                    self.patent_agent.search(query, max_results=20, expanded_terms=expanded),
                    timeout=30.0
                )
                
                self.job_manager.update_agent_status(
                    job_id, "Patent Agent", AgentStatus.COMPLETED, len(results)
                )
                await self._send_ws_update(job_id, "agent_update", {
                    "agent": "Patent Agent",
                    "status": "completed",
                    "result_count": len(results)
                })
                
                return results
            except asyncio.TimeoutError:
                print(f"⚠️ Patent Agent: Timeout after 30s")
                self.job_manager.update_agent_status(
                    job_id, "Patent Agent", AgentStatus.FAILED, 0, "Timeout"
                )
                await self._send_ws_update(job_id, "agent_update", {
                    "agent": "Patent Agent",
                    "status": "failed",
                    "error": "Timeout"
                })
                return []
            except Exception as e:
                self.job_manager.update_agent_status(
                    job_id, "Patent Agent", AgentStatus.FAILED, error=str(e)
                )
                return []
        
        # Web Intel Agent with timeout and expanded terms
        async def run_web():
            try:
                self.job_manager.update_agent_status(
                    job_id, "Web Intel Agent", AgentStatus.RUNNING
                )
                await self._send_ws_update(job_id, "agent_update", {
                    "agent": "Web Intel Agent",
                    "status": "running"
                })
                
                # Pass expanded terms (broader for literature)
                expanded = search_terms.get("literature", [])
                
                # 30-second timeout for web intel search - fetch top 20
                results = await asyncio.wait_for(
                    self.web_intel_agent.search(query, max_results=20, expanded_terms=expanded),
                    timeout=30.0
                )
                
                self.job_manager.update_agent_status(
                    job_id, "Web Intel Agent", AgentStatus.COMPLETED, len(results)
                )
                await self._send_ws_update(job_id, "agent_update", {
                    "agent": "Web Intel Agent",
                    "status": "completed",
                    "result_count": len(results)
                })
                
                return results
            except asyncio.TimeoutError:
                print(f"⚠️ Web Intel Agent: Timeout after 30s")
                self.job_manager.update_agent_status(
                    job_id, "Web Intel Agent", AgentStatus.FAILED, 0, "Timeout"
                )
                await self._send_ws_update(job_id, "agent_update", {
                    "agent": "Web Intel Agent",
                    "status": "failed",
                    "error": "Timeout"
                })
                return []
            except Exception as e:
                self.job_manager.update_agent_status(
                    job_id, "Web Intel Agent", AgentStatus.FAILED, error=str(e)
                )
                return []
        
        # Run all workers in parallel (continue even if some fail)
        clinical_data, patents, web_intel = await asyncio.gather(
            run_clinical(),
            run_patent(),
            run_web(),
            return_exceptions=False  # Already handled exceptions in each function
        )
        
        return {
            "clinical_trials": clinical_data["trials"],
            "competition_analysis": clinical_data["competition_analysis"],
            "patents": patents,
            "web_intel": web_intel
        }
    
    def _synthesize_results(self, query: str, results: Dict[str, Any], intent: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synthesize findings from all agents with semantic re-ranking (Phase 4)
        """
        
        clinical_trials = results["clinical_trials"]
        competition = results["competition_analysis"]
        patents = results["patents"]
        web_intel = results["web_intel"]
        
        print(f"🧠 Skipping semantic re-ranking (disabled for memory optimization)...")
        
        # Phase 4: Semantic re-ranking disabled - use original results
        clinical_trials_ranked = clinical_trials
        patents_ranked = patents
        web_intel_ranked = web_intel
        
        # Phase 4: Compute basic confidence score (without semantic analysis)
        total_results = len(clinical_trials) + len(patents) + len(web_intel)
        if total_results >= 20:
            confidence_score = 0.85
            confidence_level = "High"
        elif total_results >= 10:
            confidence_score = 0.70
            confidence_level = "Medium"
        else:
            confidence_score = 0.50
            confidence_level = "Low"
        
        # Generate executive summary
        exec_summary = self._generate_executive_summary(
            query, clinical_trials_ranked, competition, patents_ranked, web_intel_ranked, intent
        )
        
        # Generate key findings
        key_findings = self._generate_key_findings(
            clinical_trials_ranked, competition, patents_ranked, web_intel_ranked, intent
        )
        
        # Add confidence finding
        key_findings.insert(0, 
            f"Analysis Confidence: {confidence_level} ({confidence_score:.0f}/100) - "
            f"Based on {len(clinical_trials_ranked)} trials, {len(patents_ranked)} patents, "
            f"{len(web_intel_ranked)} publications"
        )
        
        return {
            "executive_summary": exec_summary,
            "key_findings": key_findings,
            "clinical_trials": [trial.dict() for trial in clinical_trials_ranked[:15]],  # Top 15
            "patents": [patent.dict() for patent in patents_ranked[:15]],  # Top 15
            "web_intel": [intel.dict() for intel in web_intel_ranked[:15]],  # Top 15
            "confidence_score": confidence_score,
            "confidence_level": confidence_level
        }
    
    def _generate_executive_summary(self, query: str, trials, competition, 
                                   patents, web_intel, intent) -> str:
        """Generate AI-driven executive summary"""
        
        region = intent.get("geographic_region", "the targeted region")
        competition_level = competition.get("competition_level", "moderate")
        active_trials = competition.get("active_trials", 0)
        total_trials = competition.get("total_trials", 0)
        
        summary = f"Analysis of '{query}' reveals {total_trials} relevant clinical trials, "
        summary += f"with {active_trials} currently active or recruiting. "
        summary += f"The competitive landscape shows {competition_level} competition "
        summary += f"in {region}. "
        
        if competition_level == "low" and active_trials < 5:
            summary += "This represents a significant opportunity for market entry with limited direct competition. "
        
        summary += f"Patent analysis identified {len(patents)} relevant patents, "
        summary += f"and web intelligence gathered {len(web_intel)} supporting data points. "
        
        if "patient_burden" in intent["focus_areas"]:
            summary += "Patient burden indicators suggest substantial unmet medical need in this therapeutic area."
        
        return summary
    
    def _generate_key_findings(self, trials, competition, patents, web_intel, intent) -> List[str]:
        """Generate key findings list"""
        findings = []
        
        # Competition finding
        comp_level = competition.get("competition_level", "unknown")
        findings.append(
            f"Competitive Analysis: {comp_level.title()} competition detected with "
            f"{competition.get('active_trials', 0)} active trials"
        )
        
        # Phase distribution
        phase_dist = competition.get("phase_distribution", {})
        if phase_dist:
            findings.append(
                f"Trial Phases: Most activity in {max(phase_dist, key=phase_dist.get) if phase_dist else 'Phase 2/3'}"
            )
        
        # Patent landscape
        if patents:
            active_patents = sum(1 for p in patents if p.status == "Active")
            findings.append(
                f"Patent Landscape: {len(patents)} relevant patents identified, "
                f"{active_patents} currently active"
            )
        
        # Market opportunity
        if comp_level == "low":
            findings.append(
                "Market Opportunity: Low competition suggests favorable conditions for new entrants"
            )
        
        # Geographic insights
        if intent.get("geographic_region"):
            findings.append(
                f"Geographic Focus: Analysis concentrated on {intent['geographic_region']} market dynamics"
            )
        
        return findings
    
    async def _update_master_status(self, job_id: str, status: AgentStatus):
        """Update master agent status"""
        self.job_manager.update_agent_status(job_id, "Master Agent", status)
    
    async def _send_ws_update(self, job_id: str, event_type: str, data: Dict[str, Any]):
        """Send WebSocket update"""
        await ws_manager.send_update(job_id, event_type, data)
