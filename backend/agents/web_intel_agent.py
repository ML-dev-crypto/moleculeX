"""
Web Intelligence Worker Agent - Europe PMC & CrossRef Integration
Fetches real scientific literature and research evidence
"""
import httpx
import asyncio
from typing import List, Dict, Any
from models import WebIntelResult
from datetime import datetime


class WebIntelAgent:
    """Agent for gathering scientific literature from Europe PMC"""
    
    EUROPEPMC_BASE = "https://www.ebi.ac.uk/europepmc/webservices/rest/search"
    
    def __init__(self):
        self.name = "Web Intel Agent"
    
    async def search(self, query: str, max_results: int = 20, expanded_terms: List[str] = None) -> List[WebIntelResult]:
        """
        Search for relevant scientific literature using Europe PMC API with expanded terms
        Fetches top 20 for better coverage and re-ranking
        
        Europe PMC provides access to 40+ million publications
        API Documentation: https://europepmc.org/RestfulWebService
        """
        print(f"🌐 {self.name}: Starting search for '{query}'")
        if expanded_terms:
            print(f"📋 Using expanded terms: {expanded_terms[:8]}")
        
        try:
            # Use expanded terms if provided (broader - top 8 for literature)
            if expanded_terms:
                keywords = " OR ".join(expanded_terms[:8])
            else:
                keywords = self._extract_keywords(query)
            
            # Build Europe PMC query
            params = {
                "query": keywords,
                "format": "json",
                "pageSize": max_results,
                "sort": "CITED desc",  # Most cited first
                "resultType": "core"
            }
            
            # Make API request with timeout
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    self.EUROPEPMC_BASE,
                    params=params
                )
                
                if response.status_code == 200:
                    data = response.json()
                    results_list = data.get("resultList", {}).get("result", [])
                    
                    print(f"✅ {self.name}: Found {len(results_list)} publications from Europe PMC")
                    
                    results = []
                    for item in results_list:
                        try:
                            result = self._parse_publication(item)
                            results.append(result)
                        except Exception as e:
                            print(f"⚠️ Error parsing publication: {e}")
                            continue
                    
                    return results
                else:
                    print(f"⚠️ {self.name}: API returned status {response.status_code}")
                    return []
                    
        except httpx.TimeoutException:
            print(f"⚠️ {self.name}: Request timeout (15s)")
            return []
        except Exception as e:
            print(f"❌ {self.name}: Error: {e}")
            return []
    
    def _parse_publication(self, item: Dict[str, Any]) -> WebIntelResult:
        """Parse publication data from Europe PMC response"""
        
        # Get publication ID and construct URL
        pmid = item.get("pmid")
        pmcid = item.get("pmcid")
        doi = item.get("doi")
        
        # Construct URL (prefer PMC, then PubMed, then DOI)
        if pmcid:
            url = f"https://europepmc.org/article/PMC/{pmcid}"
        elif pmid:
            url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
        elif doi:
            url = f"https://doi.org/{doi}"
        else:
            url = "https://europepmc.org/"
        
        # Get title
        title = item.get("title", "Untitled Publication")
        if len(title) > 150:
            title = title[:147] + "..."
        
        # Get abstract snippet
        abstract = item.get("abstractText", "")
        if abstract:
            snippet = abstract[:300] + "..." if len(abstract) > 300 else abstract
        else:
            snippet = "No abstract available."
        
        # Get source/journal
        source = item.get("journalTitle") or item.get("source") or "Scientific Publication"
        
        # Calculate relevance score based on citation count
        citation_count = item.get("citedByCount", 0)
        # Normalize to 0-1 scale (log scale, max at 1000 citations)
        relevance_score = min(0.5 + (citation_count / 2000), 1.0)
        
        # Get current timestamp
        retrieved_at = datetime.now().isoformat()
        
        return WebIntelResult(
            source=source,
            title=title,
            url=url,
            snippet=snippet,
            relevance_score=round(relevance_score, 2),
            retrieved_at=retrieved_at
        )
    
    def _extract_keywords(self, query: str) -> str:
        """Extract search keywords from natural language query"""
        query_lower = query.lower()
        
        # Medical condition keywords
        conditions = {
            "respiratory": "respiratory disease OR pulmonary OR lung",
            "cardiovascular": "cardiovascular OR cardiac OR heart disease",
            "diabetes": "diabetes OR diabetic OR glycemic",
            "cancer": "cancer OR oncology OR tumor OR neoplasm",
            "asthma": "asthma OR bronchial",
            "copd": "COPD OR chronic obstructive pulmonary",
            "hypertension": "hypertension OR high blood pressure",
            "alzheimer": "Alzheimer OR dementia OR cognitive decline"
        }
        
        # Check for matching conditions
        for key, search_term in conditions.items():
            if key in query_lower:
                return search_term
        
        # Extract key terms from query
        words = query_lower.split()
        stop_words = {
            "what", "which", "how", "are", "the", "a", "an", "in", "on", 
            "at", "for", "to", "of", "with", "show", "tell", "about"
        }
        keywords = [w for w in words if w not in stop_words and len(w) > 3]
        
        return " ".join(keywords[:5]) if keywords else "pharmaceutical research"
