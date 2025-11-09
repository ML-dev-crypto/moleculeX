"""
Query Normalizer - MeSH mapping and medical term canonicalization
Provides synonym expansion and ontology-based term mapping
"""
from typing import Dict, List, Set, Tuple
import re


class QueryNormalizer:
    """Normalizes pharmaceutical queries using medical ontology mappings"""
    
    # Medical term synonyms and canonical mappings
    DISEASE_SYNONYMS = {
        # Respiratory diseases
        "respiratory": ["pulmonary", "lung disease", "breathing disorder"],
        "copd": ["chronic obstructive pulmonary disease", "emphysema", "chronic bronchitis"],
        "asthma": ["bronchial asthma", "allergic asthma", "exercise-induced asthma"],
        "ild": ["interstitial lung disease", "pulmonary fibrosis", "diffuse parenchymal lung disease"],
        "tuberculosis": ["tb", "mycobacterium tuberculosis", "pulmonary tuberculosis"],
        "pneumonia": ["lung infection", "pneumonitis", "community-acquired pneumonia"],
        
        # Cardiovascular
        "cardiovascular": ["cardiac", "heart disease", "circulatory disease"],
        "hypertension": ["high blood pressure", "htn", "elevated blood pressure"],
        "heart failure": ["cardiac failure", "chf", "congestive heart failure"],
        "coronary artery disease": ["cad", "coronary heart disease", "ischemic heart disease"],
        "stroke": ["cerebrovascular accident", "cva", "brain attack"],
        "atrial fibrillation": ["afib", "af", "irregular heartbeat"],
        
        # Metabolic
        "diabetes": ["diabetes mellitus", "diabetic", "hyperglycemia"],
        "type 2 diabetes": ["t2dm", "adult-onset diabetes", "non-insulin dependent diabetes"],
        "obesity": ["overweight", "adiposity", "excess body weight"],
        "metabolic syndrome": ["syndrome x", "insulin resistance syndrome"],
        
        # Oncology
        "cancer": ["malignancy", "neoplasm", "tumor", "carcinoma"],
        "lung cancer": ["pulmonary cancer", "bronchogenic carcinoma", "nsclc", "sclc"],
        "breast cancer": ["mammary carcinoma", "breast neoplasm"],
        "colorectal cancer": ["colon cancer", "rectal cancer", "bowel cancer"],
        
        # Neurology
        "alzheimer": ["alzheimer's disease", "alzheimer disease", "dementia"],
        "parkinson": ["parkinson's disease", "pd", "parkinsonian syndrome"],
        "epilepsy": ["seizure disorder", "convulsions"],
        "migraine": ["severe headache", "migraine headache"],
        
        # Rheumatology
        "arthritis": ["joint inflammation", "arthritic disease"],
        "rheumatoid arthritis": ["ra", "rheumatoid disease"],
        "osteoarthritis": ["oa", "degenerative joint disease"],
        
        # Pain/Analgesics
        "painkiller": ["analgesic", "pain reliever", "pain medication"],
        "opioid": ["narcotic", "opioid analgesic", "opiate"],
        "nsaid": ["non-steroidal anti-inflammatory", "ibuprofen", "naproxen"],
    }
    
    # Canonical term mappings (query term → MeSH-like canonical form)
    CANONICAL_MAPPING = {
        "respiratory diseases": ["COPD", "Asthma", "Interstitial Lung Disease", "Pneumonia", "Tuberculosis"],
        "lung disease": ["COPD", "Asthma", "Lung Cancer", "Pulmonary Fibrosis"],
        "breathing disorder": ["Asthma", "COPD", "Sleep Apnea"],
        "heart disease": ["Coronary Artery Disease", "Heart Failure", "Arrhythmia", "Hypertension"],
        "cardiovascular": ["Hypertension", "Heart Failure", "Coronary Artery Disease", "Stroke", "Atrial Fibrillation"],
        "diabetes": ["Type 2 Diabetes", "Type 1 Diabetes", "Diabetic Complications"],
        "cancer": ["Lung Cancer", "Breast Cancer", "Colorectal Cancer", "Prostate Cancer"],
        "pain": ["Chronic Pain", "Neuropathic Pain", "Inflammatory Pain"],
        "neurological": ["Alzheimer Disease", "Parkinson Disease", "Epilepsy", "Multiple Sclerosis"],
    }
    
    # Drug class synonyms
    DRUG_SYNONYMS = {
        "antibiotic": ["antimicrobial", "antibacterial", "anti-infective"],
        "antihypertensive": ["blood pressure medication", "bp med", "hypertension drug"],
        "antidiabetic": ["diabetes medication", "glucose-lowering drug", "hypoglycemic agent"],
        "statin": ["cholesterol medication", "lipid-lowering drug", "hmg-coa reductase inhibitor"],
        "immunosuppressant": ["immunomodulator", "immune suppressant"],
        "antidepressant": ["depression medication", "ssri", "antidepressive"],
        "bronchodilator": ["asthma inhaler", "respiratory medication"],
    }
    
    # Geographic mappings
    GEOGRAPHIC_SYNONYMS = {
        "india": ["indian", "south asia", "bharat"],
        "china": ["chinese", "prc"],
        "usa": ["united states", "us", "america", "american"],
        "europe": ["european", "eu"],
    }
    
    def __init__(self):
        self.all_synonyms = {
            **self.DISEASE_SYNONYMS,
            **self.DRUG_SYNONYMS,
            **self.GEOGRAPHIC_SYNONYMS
        }
    
    def normalize_query(self, query: str) -> Dict[str, any]:
        """
        Normalize a pharmaceutical query with synonym expansion and canonical mapping
        
        Returns:
            {
                "original": original query,
                "normalized": normalized query string,
                "canonical_terms": list of canonical medical terms,
                "synonyms": expanded synonym list,
                "entities": extracted entities (conditions, drugs, locations),
                "expanded_query": query with all synonyms included
            }
        """
        query_lower = query.lower().strip()
        
        # Extract entities
        entities = self._extract_entities(query_lower)
        
        # Map to canonical terms
        canonical_terms = self._map_to_canonical(entities["conditions"])
        
        # Expand with synonyms
        synonyms = self._expand_synonyms(entities["conditions"] + entities["drugs"])
        
        # Build expanded query string
        expanded_query = self._build_expanded_query(query_lower, canonical_terms, synonyms)
        
        # Normalize query text
        normalized = self._normalize_text(query_lower, canonical_terms)
        
        return {
            "original": query,
            "normalized": normalized,
            "canonical_terms": canonical_terms,
            "synonyms": list(synonyms),
            "entities": entities,
            "expanded_query": expanded_query,
            "search_terms": self._get_search_terms(canonical_terms, synonyms)
        }
    
    def _extract_entities(self, query: str) -> Dict[str, List[str]]:
        """Extract medical entities from query"""
        entities = {
            "conditions": [],
            "drugs": [],
            "locations": []
        }
        
        # Extract conditions (diseases)
        for term in self.DISEASE_SYNONYMS.keys():
            if term in query or any(syn in query for syn in self.DISEASE_SYNONYMS[term]):
                entities["conditions"].append(term)
        
        # Extract drug classes
        for term in self.DRUG_SYNONYMS.keys():
            if term in query or any(syn in query for syn in self.DRUG_SYNONYMS[term]):
                entities["drugs"].append(term)
        
        # Extract locations
        for term in self.GEOGRAPHIC_SYNONYMS.keys():
            if term in query or any(syn in query for syn in self.GEOGRAPHIC_SYNONYMS[term]):
                entities["locations"].append(term)
        
        return entities
    
    def _map_to_canonical(self, conditions: List[str]) -> List[str]:
        """Map extracted conditions to canonical MeSH-like terms"""
        canonical = set()
        
        for condition in conditions:
            # Direct mapping
            if condition in self.CANONICAL_MAPPING:
                canonical.update(self.CANONICAL_MAPPING[condition])
            
            # Try synonyms
            for key, values in self.CANONICAL_MAPPING.items():
                if condition in key or key in condition:
                    canonical.update(values)
        
        # Fallback: if no canonical mapping, use the condition itself (title case)
        if not canonical and conditions:
            canonical.update([c.title() for c in conditions])
        
        return list(canonical)
    
    def _expand_synonyms(self, terms: List[str]) -> Set[str]:
        """Expand terms with their synonyms"""
        synonyms = set()
        
        for term in terms:
            # Add the term itself
            synonyms.add(term)
            
            # Add known synonyms
            if term in self.all_synonyms:
                synonyms.update(self.all_synonyms[term])
        
        return synonyms
    
    def _build_expanded_query(self, query: str, canonical_terms: List[str], 
                              synonyms: Set[str]) -> str:
        """Build expanded query string with OR operators for search APIs"""
        # Combine canonical terms and top synonyms
        all_terms = set(canonical_terms)
        all_terms.update(list(synonyms)[:10])  # Limit to top 10 synonyms
        
        # Remove very short terms
        all_terms = {t for t in all_terms if len(t) > 2}
        
        return " OR ".join(sorted(all_terms, key=len, reverse=True)[:8])
    
    def _normalize_text(self, query: str, canonical_terms: List[str]) -> str:
        """Normalize query text with canonical terms"""
        normalized = query
        
        # Replace common synonyms with canonical forms
        replacements = {
            "painkiller": "analgesic",
            "heart disease": "cardiovascular disease",
            "high blood pressure": "hypertension",
            "breathing": "respiratory",
        }
        
        for old, new in replacements.items():
            normalized = re.sub(r'\b' + old + r'\b', new, normalized)
        
        return normalized
    
    def _get_search_terms(self, canonical_terms: List[str], 
                         synonyms: Set[str]) -> Dict[str, List[str]]:
        """Get optimized search terms for each agent"""
        return {
            "clinical_trials": canonical_terms[:5],  # Top 5 canonical terms
            "patents": canonical_terms[:3],  # More focused for patents
            "literature": list(synonyms)[:8]  # Broader for literature search
        }
    
    def get_match_score(self, query: str, text: str) -> float:
        """
        Calculate match score between normalized query and result text
        Returns score 0-1 based on term matches
        """
        norm_data = self.normalize_query(query)
        text_lower = text.lower()
        
        matches = 0
        total = 0
        
        # Check canonical terms
        for term in norm_data["canonical_terms"]:
            total += 2  # Canonical terms weighted 2x
            if term.lower() in text_lower:
                matches += 2
        
        # Check synonyms
        for syn in list(norm_data["synonyms"])[:10]:
            total += 1
            if syn.lower() in text_lower:
                matches += 1
        
        return matches / total if total > 0 else 0.0
    
    def highlight_matches(self, query: str, text: str) -> List[str]:
        """
        Find matching terms in text for highlighting
        Returns list of matched terms
        """
        norm_data = self.normalize_query(query)
        text_lower = text.lower()
        matches = []
        
        # Check all terms
        all_terms = set(norm_data["canonical_terms"])
        all_terms.update(list(norm_data["synonyms"])[:15])
        
        for term in all_terms:
            if term.lower() in text_lower:
                matches.append(term)
        
        return matches
