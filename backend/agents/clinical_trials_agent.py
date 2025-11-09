"""
Clinical Trials Worker Agent
Fetches live data from ClinicalTrials.gov API
"""
import httpx
import asyncio
from typing import List, Dict, Any
from models import ClinicalTrialResult


class ClinicalTrialsAgent:
    """Agent for fetching clinical trial data"""
    
    BASE_URL = "https://clinicaltrials.gov/api/v2/studies"
    
    def __init__(self):
        self.name = "Clinical Trials Agent"
    
    async def search(self, query: str, max_results: int = 20, expanded_terms: List[str] = None) -> List[ClinicalTrialResult]:
        """
        Search ClinicalTrials.gov for relevant studies with expanded term support
        
        Args:
            query: Search query (disease, drug, condition, etc.)
            max_results: Maximum number of results to return (default 20 for deeper fetch)
            expanded_terms: Canonicalized/expanded medical terms from query normalizer
            
        Returns:
            List of structured clinical trial results, re-ranked by relevance
        """
        print(f"🔬 {self.name}: Starting search for '{query}'")
        if expanded_terms:
            print(f"📋 Using expanded terms: {expanded_terms[:5]}")
        
        try:
            # Extract keywords first for location filtering
            search_terms = self._extract_keywords(query)
            
            # Use expanded terms if provided, otherwise use extracted keywords
            if expanded_terms and len(expanded_terms) > 0:
                search_query = " OR ".join(expanded_terms[:5])  # Top 5 terms
                print(f"🔍 Search query: {search_query}")
            else:
                search_query = search_terms.get("condition", query)
                print(f"🔍 Search query: {search_query}")
            
            # Build query parameters - fetch top 20 for re-ranking
            params = {
                "query.cond": search_query,
                "pageSize": max_results,
                "countTotal": "true",
                "format": "json"
            }
            
            # Add location filter if mentioned
            if search_terms.get("location"):
                params["query.locn"] = search_terms["location"]
                print(f"📍 Location filter: {search_terms['location']}")
            
            print(f"🌐 Calling ClinicalTrials.gov API...")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(self.BASE_URL, params=params)
                
                print(f"📡 API Response Status: {response.status_code}")
                
                response.raise_for_status()
                data = response.json()
                
                studies = data.get("studies", [])
                print(f"✅ {self.name}: Found {len(studies)} studies")
                
                results = []
                for study in studies:
                    try:
                        result = self._parse_study(study)
                        results.append(result)
                    except Exception as e:
                        print(f"⚠️ Error parsing study: {e}")
                        continue
                
                return results
                
        except httpx.HTTPError as e:
            print(f"❌ {self.name}: HTTP error: {e}")
            import traceback
            traceback.print_exc()
            return []
        except Exception as e:
            print(f"❌ {self.name}: Unexpected error: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def _extract_keywords(self, query: str) -> Dict[str, str]:
        """Extract search keywords from natural language query"""
        query_lower = query.lower()
        keywords = {}
        
        # Common disease categories
        diseases = ["respiratory", "cardiovascular", "diabetes", "cancer", "asthma", 
                   "copd", "pneumonia", "tuberculosis", "covid", "influenza"]
        for disease in diseases:
            if disease in query_lower:
                keywords["condition"] = disease
                break
        
        # Location extraction
        locations = ["india", "united states", "china", "europe", "asia", "africa"]
        for location in locations:
            if location in query_lower:
                keywords["location"] = location
                break
        
        # If no specific condition found, use entire query
        if "condition" not in keywords:
            keywords["condition"] = query
        
        return keywords
    
    def _parse_study(self, study: Dict[str, Any]) -> ClinicalTrialResult:
        """Parse a study from API response into structured format"""
        protocol = study.get("protocolSection", {})
        identification = protocol.get("identificationModule", {})
        status_module = protocol.get("statusModule", {})
        design = protocol.get("designModule", {})
        conditions = protocol.get("conditionsModule", {})
        interventions = protocol.get("armsInterventionsModule", {})
        sponsor = protocol.get("sponsorCollaboratorsModule", {})
        contacts = protocol.get("contactsLocationsModule", {})
        
        # Extract enrollment
        enrollment_info = design.get("enrollmentInfo", {})
        enrollment = enrollment_info.get("count")
        
        # Extract phase
        phases = design.get("phases", [])
        phase = phases[0] if phases else None
        
        # Extract intervention
        intervention_list = interventions.get("interventions", [])
        intervention = intervention_list[0].get("name") if intervention_list else None
        
        # Extract sponsor
        lead_sponsor = sponsor.get("leadSponsor", {})
        sponsor_name = lead_sponsor.get("name")
        
        # Extract location
        locations = contacts.get("locations", [])
        location = locations[0].get("country") if locations else None
        
        # Construct source URL
        nct_id = identification.get("nctId", "N/A")
        source_url = f"https://clinicaltrials.gov/study/{nct_id}" if nct_id != "N/A" else ""
        
        # Get current timestamp
        from datetime import datetime
        retrieved_at = datetime.now().isoformat()
        
        return ClinicalTrialResult(
            nct_id=nct_id,
            title=identification.get("briefTitle", "Untitled Study"),
            status=status_module.get("overallStatus", "Unknown"),
            phase=phase,
            condition=", ".join(conditions.get("conditions", [])),
            intervention=intervention,
            sponsor=sponsor_name,
            start_date=status_module.get("startDateStruct", {}).get("date"),
            completion_date=status_module.get("completionDateStruct", {}).get("date"),
            enrollment=enrollment,
            location=location,
            source_url=source_url,
            retrieved_at=retrieved_at
        )
    
    async def analyze_competition(self, results: List[ClinicalTrialResult]) -> Dict[str, Any]:
        """Analyze competition level from trial data"""
        if not results:
            return {"competition_level": "unknown", "active_trials": 0}
        
        # Count active/recruiting trials
        active_statuses = ["RECRUITING", "ACTIVE_NOT_RECRUITING", "ENROLLING_BY_INVITATION"]
        active_count = sum(1 for r in results if r.status.upper() in active_statuses)
        
        # Analyze phases
        phase_dist = {}
        for r in results:
            if r.phase:
                phase_dist[r.phase] = phase_dist.get(r.phase, 0) + 1
        
        # Determine competition level
        if active_count < 5:
            competition = "low"
        elif active_count < 15:
            competition = "medium"
        else:
            competition = "high"
        
        return {
            "competition_level": competition,
            "active_trials": active_count,
            "total_trials": len(results),
            "phase_distribution": phase_dist
        }
