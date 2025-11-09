"""
Clinical Trials Worker Agent
Fetches live data from multiple clinical trial registries for comprehensive coverage
"""
import httpx
import asyncio
import xml.etree.ElementTree as ET
from typing import List, Dict, Any
from models import ClinicalTrialResult


class ClinicalTrialsAgent:
    """Agent for fetching clinical trial data from multiple sources"""
    
    # Multiple data sources for comprehensive coverage
    CLINICALTRIALS_GOV = "https://clinicaltrials.gov/api/v2/studies"
    EU_CTR = "https://www.clinicaltrialsregister.eu/ctr-search/rest/feed/atom"  # Public Atom feed
    WHO_ICTRP = "https://trialsearch.who.int/api/TrialSearch"  # Public API (limited)
    # Note: EU CTR and WHO ICTRP public APIs may require authentication or have access restrictions
    # Keeping for future implementation when access is available
    
    def __init__(self):
        self.name = "Clinical Trials Agent"
    
    async def search(self, query: str, max_results: int = 20, expanded_terms: List[str] = None) -> List[ClinicalTrialResult]:
        """
        Search multiple clinical trial registries for comprehensive coverage
        
        Args:
            query: Search query (disease, drug, condition, etc.)
            max_results: Maximum number of results to return (default 20)
            expanded_terms: Canonicalized/expanded medical terms from query normalizer
            
        Returns:
            List of structured clinical trial results from multiple sources
        """
        print(f"🔬 {self.name}: Starting multi-source search for '{query}'")
        if expanded_terms:
            print(f"📋 Using expanded terms: {expanded_terms[:5]}")
        
        # Fetch from all sources in parallel
        search_terms = self._extract_keywords(query)
        
        tasks = [
            self._search_clinicaltrials_gov(query, search_terms, expanded_terms, max_results),
            self._search_pubmed_clinical_trials(query, search_terms, expanded_terms, max_results // 3),
            # Experimental additional sources; failures are ignored gracefully
            self._search_eu_ctr(query, search_terms, expanded_terms, max_results // 4),
            self._search_who_ictrp(query, search_terms, expanded_terms, max_results // 4),
        ]
        
        results_lists = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Combine, normalize to ClinicalTrialResult, and deduplicate
        normalized_results: List[ClinicalTrialResult] = []
        seen_ids = set()

        for results in results_lists:
            if isinstance(results, list):
                for trial in results:
                    # Convert dict → ClinicalTrialResult
                    if isinstance(trial, ClinicalTrialResult):
                        obj = trial
                    elif isinstance(trial, dict):
                        try:
                            obj = ClinicalTrialResult(
                                nct_id=trial.get("nct_id", "N/A") or "N/A",
                                title=trial.get("title", "Untitled Study"),
                                status=trial.get("status", "Unknown"),
                                phase=trial.get("phase"),
                                condition=trial.get("condition", ""),
                                intervention=trial.get("intervention"),
                                sponsor=trial.get("sponsor"),
                                start_date=trial.get("start_date"),
                                completion_date=trial.get("completion_date"),
                                enrollment=trial.get("enrollment"),
                                location=trial.get("location"),
                                source_url=trial.get("source_url", ""),
                                retrieved_at=trial.get("retrieved_at", "") or "",
                                match_score=float(trial.get("match_score", 0.0) or 0.0),
                                matched_terms=trial.get("matched_terms", []),
                            )
                        except Exception:
                            continue
                    else:
                        continue

                    trial_id = obj.nct_id or obj.title
                    if trial_id and trial_id not in seen_ids:
                        seen_ids.add(trial_id)
                        normalized_results.append(obj)

        print(f"✅ {self.name}: Found {len(normalized_results)} unique trials from all sources")
        return normalized_results[:max_results]
    
    async def _search_clinicaltrials_gov(self, query: str, search_terms: dict, expanded_terms: List[str], max_results: int) -> List[Dict[str, Any]]:
        """Search ClinicalTrials.gov"""
        try:
            # Use expanded terms if provided
            if expanded_terms and len(expanded_terms) > 0:
                search_query = " OR ".join(expanded_terms[:5])
            else:
                search_query = search_terms.get("condition", query)
            
            params = {
                "query.cond": search_query,
                "pageSize": max_results,
                "countTotal": "true",
                "format": "json"
            }
            
            if search_terms.get("location"):
                params["query.locn"] = search_terms["location"]
            
            print(f"🌐 Querying ClinicalTrials.gov...")
            
            # Retry logic with exponential backoff
            max_retries = 2
            for attempt in range(max_retries):
                try:
                    async with httpx.AsyncClient(timeout=20.0) as client:
                        headers = {"User-Agent": "MoleculeX-Research-Platform/1.0"}
                        response = await client.get(self.CLINICALTRIALS_GOV, params=params, headers=headers)
                        
                        response.raise_for_status()
                        data = response.json()
                        
                        studies = data.get("studies", [])
                        results = []
                        for study in studies:
                            try:
                                result = self._parse_study(study)
                                results.append(result)
                            except Exception as e:
                                continue
                        
                        print(f"✅ ClinicalTrials.gov: {len(results)} trials")
                        return results
                        
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 403 and attempt < max_retries - 1:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    elif e.response.status_code == 403:
                        print(f"⚠️ ClinicalTrials.gov blocked (403)")
                        return []
                    else:
                        raise
                        
        except Exception as e:
            print(f"⚠️ ClinicalTrials.gov error: {e}")
            return []
    
    async def _search_pubmed_clinical_trials(self, query: str, search_terms: dict, expanded_terms: List[str], max_results: int) -> List[Dict[str, Any]]:
        """Search PubMed for clinical trial publications (always free, no auth required)"""
        try:
            search_query = " OR ".join(expanded_terms[:3]) if expanded_terms else search_terms.get("condition", query)
            
            # PubMed E-utilities API (completely free, no key required for low volume)
            base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
            
            params = {
                "db": "pubmed",
                "term": f"{search_query} AND clinical trial[Publication Type]",
                "retmax": max_results,
                "retmode": "json"
            }
            
            print(f"🌐 Querying PubMed for clinical trial publications...")
            
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.get(base_url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    id_list = data.get("esearchresult", {}).get("idlist", [])
                    
                    # Fetch details for these IDs
                    if id_list:
                        trials = await self._fetch_pubmed_details(id_list[:max_results])
                        print(f"✅ PubMed Clinical Trials: {len(trials)} publications")
                        return trials
                    else:
                        print(f"⚠️ PubMed: No clinical trial publications found")
                        return []
                else:
                    print(f"⚠️ PubMed returned {response.status_code}")
                    return []
                    
        except Exception as e:
            print(f"⚠️ PubMed error: {e}")
            return []
    
    async def _fetch_pubmed_details(self, id_list: List[str]) -> List[Dict[str, Any]]:
        """Fetch detailed info for PubMed articles"""
        try:
            base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
            
            params = {
                "db": "pubmed",
                "id": ",".join(id_list),
                "retmode": "json"
            }
            
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.get(base_url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    results = []
                    
                    for pmid, article in data.get("result", {}).items():
                        if pmid == "uids":
                            continue
                            
                        try:
                            results.append({
                                "nct_id": f"PMID{pmid}",
                                "title": article.get("title", "Untitled"),
                                "status": "PUBLISHED",
                                "phase": None,
                                "condition": ", ".join(article.get("arthist", {}).get("mesh_terms", [])[:3]) if article.get("arthist") else "",
                                "intervention": None,
                                "sponsor": article.get("source", "Unknown"),
                                "start_date": article.get("pubdate", ""),
                                "completion_date": None,
                                "enrollment": None,
                                "location": None,
                                "source_url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                                "retrieved_at": None
                            })
                        except Exception:
                            continue
                    
                    return results
                else:
                    return []
                    
        except Exception as e:
            print(f"⚠️ Error fetching PubMed details: {e}")
            return []
    
    async def _search_eu_ctr(self, query: str, search_terms: dict, expanded_terms: List[str], max_results: int) -> List[Dict[str, Any]]:
        """Search EU Clinical Trials Register"""
        try:
            # Build search query
            search_query = " OR ".join(expanded_terms[:3]) if expanded_terms else search_terms.get("condition", query)
            
            params = {
                "query": search_query,
                "status": "ongoing",
            }
            
            print(f"🌐 Querying EU Clinical Trials Register...")
            
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.get(self.EU_CTR, params=params)
                response.raise_for_status()
                
                # Parse XML feed
                results = self._parse_eu_ctr_xml(response.text, max_results)
                print(f"✅ EU CTR: {len(results)} trials")
                return results
                
        except Exception as e:
            print(f"⚠️ EU CTR error: {e}")
            return []
    
    async def _search_who_ictrp(self, query: str, search_terms: dict, expanded_terms: List[str], max_results: int) -> List[Dict[str, Any]]:
        """Search WHO International Clinical Trials Registry Platform"""
        try:
            search_query = " ".join(expanded_terms[:3]) if expanded_terms else search_terms.get("condition", query)
            
            params = {
                "q": search_query,
                "format": "json",
                "take": max_results
            }
            
            print(f"🌐 Querying WHO ICTRP...")
            
            async with httpx.AsyncClient(timeout=20.0) as client:
                headers = {"User-Agent": "MoleculeX-Research-Platform/1.0"}
                response = await client.get(self.WHO_ICTRP, params=params, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    results = self._parse_who_trials(data.get("results", []), max_results)
                    print(f"✅ WHO ICTRP: {len(results)} trials")
                    return results
                else:
                    print(f"⚠️ WHO ICTRP returned {response.status_code}")
                    return []
                    
        except Exception as e:
            print(f"⚠️ WHO ICTRP error: {e}")
            return []
    
    def _parse_eu_ctr_xml(self, xml_text: str, max_results: int) -> List[Dict[str, Any]]:
        """Parse EU Clinical Trials Register XML feed"""
        results = []
        try:
            root = ET.fromstring(xml_text)
            entries = root.findall(".//{http://www.w3.org/2005/Atom}entry")
            
            for entry in entries[:max_results]:
                try:
                    title_elem = entry.find("{http://www.w3.org/2005/Atom}title")
                    summary_elem = entry.find("{http://www.w3.org/2005/Atom}summary")
                    id_elem = entry.find("{http://www.w3.org/2005/Atom}id")
                    updated_elem = entry.find("{http://www.w3.org/2005/Atom}updated")
                    
                    trial = {
                        "nct_id": id_elem.text if id_elem is not None else "",
                        "title": title_elem.text if title_elem is not None else "Untitled",
                        "status": "RECRUITING",  # EU CTR defaults to ongoing
                        "phase": None,
                        "condition": summary_elem.text[:100] if summary_elem is not None else "",
                        "intervention": None,
                        "sponsor": None,
                        "start_date": updated_elem.text if updated_elem is not None else None,
                        "completion_date": None,
                        "enrollment": None,
                        "location": "Europe",
                        "source_url": id_elem.text if id_elem is not None else "",
                        "retrieved_at": None
                    }
                    results.append(trial)
                except Exception as e:
                    continue
                    
        except Exception as e:
            print(f"⚠️ Error parsing EU CTR XML: {e}")
        
        return results
    
    def _parse_who_trials(self, trials_data: List[Dict], max_results: int) -> List[Dict[str, Any]]:
        """Parse WHO ICTRP trial data"""
        results = []
        
        for trial in trials_data[:max_results]:
            try:
                result = {
                    "nct_id": trial.get("TrialID", ""),
                    "title": trial.get("PublicTitle", "Untitled"),
                    "status": trial.get("RecruitmentStatus", "Unknown"),
                    "phase": trial.get("Phase", None),
                    "condition": trial.get("ConditionText", ""),
                    "intervention": trial.get("InterventionText", None),
                    "sponsor": trial.get("PrimarySponsor", None),
                    "start_date": trial.get("DateRegistration", None),
                    "completion_date": None,
                    "enrollment": trial.get("TargetSize", None),
                    "location": trial.get("Countries", None),
                    "source_url": trial.get("TrialRegistryURL", ""),
                    "retrieved_at": None
                }
                results.append(result)
            except Exception as e:
                continue
        
        return results
    
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
