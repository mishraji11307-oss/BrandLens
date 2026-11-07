import math
import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.brand_kit import DocumentChunk, BrandDocument, ApprovedClaim, ApprovedFact

class RAGVectorStore:
    """
    Layer 2: Retrieval-Augmented Generation (RAG)
    Enforces strict organization-level data isolation.
    Indexes guideline chunks and approved claims with TF-IDF / vector similarity,
    retrieving exact supporting evidence for contextual LLM verification.
    """
    
    @staticmethod
    def _tokenize(text: str) -> List[str]:
        return re.findall(r"\w+", text.lower())

    @classmethod
    def calculate_similarity(cls, query: str, document_text: str) -> float:
        """Calculates cosine similarity on term frequency vectors."""
        query_tokens = cls._tokenize(query)
        doc_tokens = cls._tokenize(document_text)
        
        if not query_tokens or not doc_tokens:
            return 0.0
            
        vocab = set(query_tokens).union(set(doc_tokens))
        q_freq = {w: query_tokens.count(w) for w in vocab}
        d_freq = {w: doc_tokens.count(w) for w in vocab}
        
        dot_product = sum(q_freq[w] * d_freq[w] for w in vocab)
        mag_q = math.sqrt(sum(q_freq[w] ** 2 for w in vocab))
        mag_d = math.sqrt(sum(d_freq[w] ** 2 for w in vocab))
        
        if mag_q == 0 or mag_d == 0:
            return 0.0
        return dot_product / (mag_q * mag_d)

    @classmethod
    def retrieve_relevant_evidence(
        cls,
        db: Session,
        brand_kit_id: str,
        content_text: str,
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Retrieves the top-k most relevant guideline chunks and claims for the given content,
        scoped strictly to the specified brand kit.
        """
        results = []
        
        # 1. Retrieve Guideline Chunks
        chunks = (
            db.query(DocumentChunk, BrandDocument)
            .join(BrandDocument, DocumentChunk.document_id == BrandDocument.id)
            .filter(DocumentChunk.brand_kit_id == brand_kit_id)
            .all()
        )
        
        for chunk, doc in chunks:
            sim = cls.calculate_similarity(content_text, chunk.content)
            results.append({
                "type": "guideline_chunk",
                "similarity": sim,
                "document_name": doc.filename,
                "section": chunk.section or "General Guidelines",
                "page": chunk.page_number,
                "rule_id": f"CHUNK-{chunk.chunk_index}",
                "evidence": chunk.content
            })
            
        # 2. Retrieve Approved Claims
        claims = (
            db.query(ApprovedClaim)
            .filter(ApprovedClaim.brand_kit_id == brand_kit_id, ApprovedClaim.status == "approved")
            .all()
        )
        for claim in claims:
            combined_text = f"{claim.approved_statement} {claim.conditions or ''} {claim.supporting_evidence or ''}"
            sim = cls.calculate_similarity(content_text, combined_text)
            results.append({
                "type": "approved_claim",
                "similarity": sim,
                "document_name": claim.source_document or "Approved Claims Register",
                "section": f"Claim {claim.claim_code}",
                "page": 1,
                "rule_id": claim.claim_code,
                "evidence": f"Approved Statement: '{claim.approved_statement}'. Supporting Evidence: {claim.supporting_evidence}"
            })
            
        # Sort by similarity descending
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:top_k]

