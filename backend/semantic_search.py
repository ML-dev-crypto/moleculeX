"""
Simple semantic search - No heavy ML models for free tier hosting
"""
from typing import List, Dict, Any, Tuple


class SemanticSearchEngine:
    """Lightweight semantic search without ML models"""
    
    def __init__(self):
        print("✅ Semantic search initialized (basic mode)")
    
    def re_rank_clinical_trials(self, query: str, trials: List[Any]) -> List[Any]:
        """Return trials as-is (no re-ranking in basic mode)"""
        return trials
    
    def re_rank_patents(self, query: str, patents: List[Any]) -> List[Any]:
        """Return patents as-is (no re-ranking in basic mode)"""
        return patents
    
    def re_rank_literature(self, query: str, literature: List[Any]) -> List[Any]:
        """Return literature as-is (no re-ranking in basic mode)"""
        return literature
    
    def compute_confidence_score(
        self, 
        query: str,
        clinical_trials: List[Any],
        patents: List[Any],
        web_intel: List[Any]
    ) -> Tuple[float, str]:
        """Simple count-based confidence scoring"""
        total = len(clinical_trials) + len(patents) + len(web_intel)
        if total >= 20:
            return 0.85, "High"
        elif total >= 10:
            return 0.70, "Medium"
        else:
            return 0.50, "Low"
