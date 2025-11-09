"""
Simple semantic search - No heavy ML models for free tier hosting
"""
from typing import List, Dict, Any, Tuple


class SemanticSearchEngine:
    """Lightweight semantic search without ML models"""
    
    def __init__(self):
        print("✅ Semantic search initialized (basic mode)")
    
    def re_rank_clinical_trials(self, query: str, trials: List[Dict]) -> List[Dict]:
        """Return trials with default relevance scores"""
        for trial in trials:
            trial["relevance_score"] = 0.7
        return trials
    
    def re_rank_patents(self, query: str, patents: List[Dict]) -> List[Dict]:
        """Return patents with default relevance scores"""
        for patent in patents:
            patent["relevance_score"] = 0.7
        return patents
    
    def re_rank_literature(self, query: str, literature: List[Dict]) -> List[Dict]:
        """Return literature with default relevance scores"""
        for item in literature:
            item["relevance_score"] = 0.7
        return literature
    
    def compute_confidence_score(
        self, 
        query: str,
        clinical_trials: List[Dict],
        patents: List[Dict],
        web_intel: List[Dict]
    ) -> Tuple[float, str]:
        """Simple count-based confidence scoring"""
        total = len(clinical_trials) + len(patents) + len(web_intel)
        if total >= 20:
            return 0.85, "High"
        elif total >= 10:
            return 0.70, "Medium"
        else:
            return 0.50, "Low"
