"""
Semantic Search Engine using Sentence Transformers
Provides embedding-based similarity search for better relevance
"""
from typing import List, Dict, Any, Tuple
import numpy as np
from sentence_transformers import SentenceTransformer
import pickle
import os
from pathlib import Path


class SemanticSearchEngine:
    """
    Embedding-based semantic search using sentence-transformers
    Uses all-MiniLM-L6-v2 model (lightweight, fast, good quality)
    """
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize semantic search engine
        
        Args:
            model_name: HuggingFace model name (default: all-MiniLM-L6-v2)
                       - Fast: 384-dim embeddings
                       - Accurate: trained on 1B+ sentence pairs
                       - Small: ~80MB model
        """
        print(f"🧠 Loading semantic search model: {model_name}...")
        self.model = SentenceTransformer(model_name)
        self.cache_dir = Path("data/embeddings")
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        print(f"✅ Semantic search model loaded!")
    
    def encode_query(self, query: str) -> np.ndarray:
        """
        Encode a query into an embedding vector
        
        Args:
            query: User query text
            
        Returns:
            Embedding vector (384-dim for MiniLM)
        """
        return self.model.encode(query, convert_to_numpy=True)
    
    def encode_texts(self, texts: List[str], batch_size: int = 32) -> np.ndarray:
        """
        Encode multiple texts into embedding vectors
        
        Args:
            texts: List of text strings
            batch_size: Batch size for encoding (default 32)
            
        Returns:
            Array of embedding vectors (N x 384)
        """
        if not texts:
            return np.array([])
        
        return self.model.encode(
            texts,
            batch_size=batch_size,
            convert_to_numpy=True,
            show_progress_bar=False
        )
    
    def compute_similarity(self, query_embedding: np.ndarray, 
                          doc_embeddings: np.ndarray) -> np.ndarray:
        """
        Compute cosine similarity between query and documents
        
        Args:
            query_embedding: Query vector (384-dim)
            doc_embeddings: Document vectors (N x 384)
            
        Returns:
            Similarity scores (N,) ranging from -1 to 1 (higher = more similar)
        """
        if len(doc_embeddings) == 0:
            return np.array([])
        
        # Normalize vectors
        query_norm = query_embedding / np.linalg.norm(query_embedding)
        doc_norms = doc_embeddings / np.linalg.norm(doc_embeddings, axis=1, keepdims=True)
        
        # Compute cosine similarity
        similarities = np.dot(doc_norms, query_norm)
        
        return similarities
    
    def rank_results(self, query: str, texts: List[str], 
                     top_k: int = None) -> List[Tuple[int, float]]:
        """
        Rank texts by semantic similarity to query
        
        Args:
            query: User query
            texts: List of text strings to rank
            top_k: Return only top K results (None = all)
            
        Returns:
            List of (index, score) tuples, sorted by descending score
        """
        if not texts:
            return []
        
        # Encode query and texts
        query_emb = self.encode_query(query)
        text_embs = self.encode_texts(texts)
        
        # Compute similarities
        scores = self.compute_similarity(query_emb, text_embs)
        
        # Sort by score (descending)
        ranked_indices = np.argsort(-scores)
        
        # Return (index, score) pairs
        results = [(int(idx), float(scores[idx])) for idx in ranked_indices]
        
        if top_k:
            results = results[:top_k]
        
        return results
    
    def re_rank_clinical_trials(self, query: str, trials: List[Any]) -> List[Any]:
        """
        Re-rank clinical trial results by semantic similarity
        
        Args:
            query: User query
            trials: List of ClinicalTrialResult objects
            
        Returns:
            Re-ranked list of trials with updated match_score
        """
        if not trials:
            return []
        
        # Create searchable text from each trial
        texts = [
            f"{trial.title} {trial.condition} {trial.intervention or ''} {trial.sponsor or ''}"
            for trial in trials
        ]
        
        # Rank by semantic similarity
        rankings = self.rank_results(query, texts)
        
        # Update match scores and reorder
        reranked = []
        for idx, score in rankings:
            trial = trials[idx]
            # Update match_score (normalize from -1,1 to 0,1)
            trial.match_score = float((score + 1) / 2)
            reranked.append(trial)
        
        print(f"🔄 Re-ranked {len(reranked)} clinical trials by semantic similarity")
        return reranked
    
    def re_rank_patents(self, query: str, patents: List[Any]) -> List[Any]:
        """
        Re-rank patent results by semantic similarity
        
        Args:
            query: User query
            patents: List of PatentResult objects
            
        Returns:
            Re-ranked list of patents with updated match_score
        """
        if not patents:
            return []
        
        # Create searchable text from each patent
        texts = [
            f"{patent.title} {patent.assignee}"
            for patent in patents
        ]
        
        # Rank by semantic similarity
        rankings = self.rank_results(query, texts)
        
        # Update match scores and reorder
        reranked = []
        for idx, score in rankings:
            patent = patents[idx]
            # Update match_score (normalize from -1,1 to 0,1)
            patent.match_score = float((score + 1) / 2)
            reranked.append(patent)
        
        print(f"🔄 Re-ranked {len(reranked)} patents by semantic similarity")
        return reranked
    
    def re_rank_literature(self, query: str, papers: List[Any]) -> List[Any]:
        """
        Re-rank literature results by semantic similarity
        
        Args:
            query: User query
            papers: List of WebIntelResult objects
            
        Returns:
            Re-ranked list of papers (relevance_score already exists)
        """
        if not papers:
            return []
        
        # Create searchable text from each paper
        texts = [
            f"{paper.title} {paper.snippet}"
            for paper in papers
        ]
        
        # Rank by semantic similarity
        rankings = self.rank_results(query, texts)
        
        # Combine semantic score with citation-based relevance_score
        reranked = []
        for idx, semantic_score in rankings:
            paper = papers[idx]
            # Normalize semantic score
            norm_semantic = (semantic_score + 1) / 2
            # Weighted combination: 60% semantic, 40% citation-based
            combined_score = 0.6 * norm_semantic + 0.4 * paper.relevance_score
            paper.relevance_score = float(combined_score)
            reranked.append(paper)
        
        print(f"🔄 Re-ranked {len(reranked)} papers by semantic similarity + citations")
        return reranked
    
    def compute_confidence_score(self, query: str, trials: List[Any], 
                                 patents: List[Any], papers: List[Any]) -> Tuple[float, str]:
        """
        Compute overall confidence score for analysis results
        
        Factors:
        - Number of high-quality results (match_score > 0.7)
        - Average semantic similarity
        - Trial phases (Phase 2/3 = higher confidence)
        - Patent count (more patents = lower confidence for FTO)
        - Literature evidence strength
        
        Args:
            query: User query
            trials: Clinical trial results
            patents: Patent results
            papers: Literature results
            
        Returns:
            (confidence_score, confidence_level) tuple
            score: 0-100
            level: "High" / "Medium" / "Low"
        """
        score = 0.0
        factors = []
        
        # Factor 1: High-quality clinical trial matches (0-30 points)
        if trials:
            high_quality_trials = sum(1 for t in trials if t.match_score > 0.7)
            avg_trial_score = np.mean([t.match_score for t in trials])
            
            # Phase weighting
            phase_3_count = sum(1 for t in trials if t.phase and "3" in str(t.phase))
            phase_2_count = sum(1 for t in trials if t.phase and "2" in str(t.phase))
            
            trial_score = min(30, (
                high_quality_trials * 5 +
                phase_3_count * 3 +
                phase_2_count * 2 +
                avg_trial_score * 10
            ))
            score += trial_score
            factors.append(f"Trials: {high_quality_trials} high-quality, {phase_2_count+phase_3_count} Phase 2/3")
        
        # Factor 2: Patent landscape (0-25 points)
        if patents:
            avg_patent_score = np.mean([p.match_score for p in patents])
            patent_count = len(patents)
            
            # Fewer patents with lower match = better for FTO
            if patent_count < 5:
                patent_score = 25  # Low competition
            elif patent_count < 10:
                patent_score = 15  # Medium competition
            else:
                patent_score = 5   # High competition
            
            # Adjust by match quality (high match = more relevant patents = higher risk)
            patent_score = max(0, patent_score - avg_patent_score * 10)
            
            score += patent_score
            factors.append(f"Patents: {patent_count} found, avg relevance {avg_patent_score:.2f}")
        else:
            score += 25  # No patents = great for FTO
            factors.append("Patents: None found (excellent FTO)")
        
        # Factor 3: Literature evidence (0-25 points)
        if papers:
            high_quality_papers = sum(1 for p in papers if p.relevance_score > 0.7)
            avg_paper_score = np.mean([p.relevance_score for p in papers])
            
            lit_score = min(25, high_quality_papers * 3 + avg_paper_score * 15)
            score += lit_score
            factors.append(f"Literature: {high_quality_papers} high-impact papers")
        
        # Factor 4: Overall result quality (0-20 points)
        total_results = len(trials) + len(patents) + len(papers)
        if total_results > 15:
            score += 20  # Rich data
        elif total_results > 8:
            score += 15  # Good data
        elif total_results > 3:
            score += 10  # Moderate data
        else:
            score += 5   # Limited data
        
        factors.append(f"Total results: {total_results}")
        
        # Determine confidence level
        if score >= 75:
            level = "High"
        elif score >= 50:
            level = "Medium"
        else:
            level = "Low"
        
        print(f"📊 Confidence Score: {score:.1f}/100 ({level})")
        print(f"📋 Factors: {', '.join(factors)}")
        
        return float(score), level
    
    def save_embeddings(self, cache_key: str, embeddings: np.ndarray):
        """Save embeddings to disk for caching"""
        cache_path = self.cache_dir / f"{cache_key}.pkl"
        with open(cache_path, 'wb') as f:
            pickle.dump(embeddings, f)
    
    def load_embeddings(self, cache_key: str) -> np.ndarray:
        """Load cached embeddings from disk"""
        cache_path = self.cache_dir / f"{cache_key}.pkl"
        if cache_path.exists():
            with open(cache_path, 'rb') as f:
                return pickle.load(f)
        return None
