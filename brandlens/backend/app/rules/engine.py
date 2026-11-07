import re
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

class DeterministicRuleEngine:
    """
    Layer 1: Deterministic Rule Engine
    Performs high-precision regex, phrase boundary, disclaimer, and rule-based
    checks against an organization's active Brand Kit rules and approved facts.
    Functions deterministically without external LLM API availability.
    """
    
    @staticmethod
    def run_checks(
        text: str,
        rules: List[Any],
        approved_facts: Optional[List[Any]] = None,
        approved_claims: Optional[List[Any]] = None
    ) -> List[Dict[str, Any]]:
        findings = []
        if not text:
            return findings

        # 1. Prohibited & Preferred Term Checks
        for rule in rules:
            if not getattr(rule, "is_active", True):
                continue
                
            rule_code = getattr(rule, "rule_code", "RULE-UNKNOWN")
            category = getattr(rule, "category", "terminology")
            severity = getattr(rule, "severity", "high")
            title = getattr(rule, "title", "Brand Guideline Check")
            description = getattr(rule, "description", "")
            prohibited_term = getattr(rule, "prohibited_term", None)
            preferred_term = getattr(rule, "preferred_term", "")
            suggested_fix = getattr(rule, "suggested_fix", preferred_term)
            evidence_citation = getattr(rule, "evidence_citation", "Brand Guidelines")
            rule_type = getattr(rule, "rule_type", "prohibited_term")
            confidence = float(getattr(rule, "confidence", 0.95))
            
            if rule_type == "prohibited_term" and prohibited_term:
                # Use regex with word boundaries for precision
                escaped_term = re.escape(prohibited_term.strip())
                pattern = re.compile(rf"\b{escaped_term}\b", re.IGNORECASE)
                matches = list(pattern.finditer(text))
                
                for m in matches:
                    matched_text = m.group(0)
                    findings.append({
                        "rule_id": rule_code,
                        "category": category,
                        "title": title,
                        "description": description or f"Usage of prohibited terminology '{matched_text}'.",
                        "original_text": matched_text,
                        "severity": severity,
                        "confidence": confidence,
                        "explanation": f"The term '{matched_text}' violates approved brand standards. {description}",
                        "source": {
                            "document_name": "Brand Guidelines",
                            "section": "Approved Terminology & Regulatory Compliance",
                            "page": 7,
                            "rule_id": rule_code,
                            "evidence": evidence_citation or f"Do not use '{prohibited_term}'. Approved alternative is '{preferred_term}'."
                        },
                        "suggested_fix": suggested_fix or preferred_term,
                        "status": "open",
                        "detection_layer": "deterministic"
                    })
                    
            elif rule_type == "disclaimer" and preferred_term:
                # Check if text contains claims that trigger the disclaimer, but the disclaimer itself is absent
                has_claim_triggers = any(trigger in text.lower() for trigger in ["results", "effective", "participants", "reduction", "%", "days", "serum", "proven"])
                disclaimer_present = preferred_term.lower() in text.lower()
                
                if has_claim_triggers and not disclaimer_present:
                    findings.append({
                        "rule_id": rule_code,
                        "category": "disclaimer",
                        "title": title or "Mandatory Disclaimer Missing",
                        "description": f"Content makes efficacy or product claims without including the mandatory disclaimer.",
                        "original_text": text[:60] + "..." if len(text) > 60 else text,
                        "severity": severity,
                        "confidence": confidence,
                        "explanation": f"When referencing efficacy or results, the disclaimer '{preferred_term}' must be appended.",
                        "source": {
                            "document_name": "Brand Guidelines",
                            "section": "Mandatory Disclaimers",
                            "page": 11,
                            "rule_id": rule_code,
                            "evidence": evidence_citation or "Mandatory disclaimer policy."
                        },
                        "suggested_fix": f"{text.strip()} ({preferred_term})",
                        "status": "open",
                        "detection_layer": "deterministic"
                    })

        # 2. Check for Expired Approved Facts
        if approved_facts:
            now = datetime.now(timezone.utc)
            for fact in approved_facts:
                fact_code = getattr(fact, "fact_code", "")
                name = getattr(fact, "name", "")
                expiry = getattr(fact, "expiry_date", None)
                val = getattr(fact, "approved_value", "")
                
                # If an expired fact is referenced in text, flag it
                if expiry:
                    # ensure timezone-aware comparison
                    if expiry.tzinfo is None:
                        is_expired = expiry < datetime.now()
                    else:
                        is_expired = expiry < now
                        
                    if is_expired and name.lower() in text.lower():
                        findings.append({
                            "rule_id": f"EXPIRED-{fact_code}",
                            "category": "claims",
                            "title": f"Reference to Expired Approved Fact ({fact_code})",
                            "description": f"The claim references '{name}' which expired on {expiry.strftime('%Y-%m-%d')}.",
                            "original_text": name,
                            "severity": "critical",
                            "confidence": 0.99,
                            "explanation": "Outdated factual claims must not be published without re-certification.",
                            "source": {
                                "document_name": "Approved Fact Dossier",
                                "section": "Fact Expirations",
                                "page": 1,
                                "rule_id": fact_code,
                                "evidence": f"Fact {fact_code} expired. Value was: {val}"
                            },
                            "suggested_fix": "Update or remove outdated fact reference.",
                            "status": "open",
                            "detection_layer": "deterministic"
                        })

        # 3. ASCI India & FTC Influencer Advertising & Claim Guard
        text_lower = text.lower()
        sponsored_keywords = ["discount code", "use code", "shop now", "link in bio", "partnered with", "collab", "pr package", "sponsored", "buy now"]
        has_sponsored_intent = any(k in text_lower for k in sponsored_keywords)
        has_disclosure_tag = bool(re.search(r"#(ad|collab|sponsored|partnership|paidpartnership)\b", text, re.IGNORECASE))
        
        if has_sponsored_intent and not has_disclosure_tag:
            findings.append({
                "rule_id": "ASCI-INF-001",
                "category": "compliance",
                "title": "ASCI Mandatory Influencer Disclosure Missing",
                "description": "Content exhibits commercial promotion or affiliate discount codes without a prominent disclosure label.",
                "original_text": text[:60] + "..." if len(text) > 60 else text,
                "severity": "high",
                "confidence": 0.98,
                "explanation": "ASCI Guidelines for Influencer Advertising require prominent disclosure tags (#Ad, #Collab) at the start of promotional content to prevent deceptive commercial practices.",
                "source": {
                    "document_name": "ASCI Digital Media Influencer Guidelines",
                    "section": "Clause 1: Upfront Disclosure",
                    "page": 2,
                    "rule_id": "ASCI-INF-001",
                    "evidence": "Disclosures must be placed prominently in the title or first 80 characters of the post."
                },
                "suggested_fix": f"#Ad • {text.strip()}",
                "status": "open",
                "detection_layer": "deterministic"
            })
            
        # ASCI Rule 2: Unverified Superlatives (#1 in India, Best in the market)
        superlative_matches = re.finditer(r"(?:^|\s)(#?1\s+in\s+india|india'?s\s+#?1|best\s+in\s+india|world'?s\s+best|unmatched\s+in\s+the\s+market)\b", text, re.IGNORECASE)
        for sm in superlative_matches:
            matched_sup = sm.group(1)
            findings.append({
                "rule_id": "ASCI-SUP-002",
                "category": "claims",
                "title": "ASCI Unsubstantiated Market Leadership Claim",
                "description": f"The superlative '{matched_sup}' requires certified third-party market share or clinical audit evidence.",
                "original_text": matched_sup,
                "severity": "critical",
                "confidence": 0.97,
                "explanation": f"Under ASCI Code Chapter I.1, claims like '{matched_sup}' must be substantiated by independent Nielsen, Euromonitor, or accredited third-party audit data.",
                "source": {
                    "document_name": "ASCI Advertising Ethics Code",
                    "section": "Chapter I: Truthful and Honest Representations",
                    "page": 4,
                    "rule_id": "ASCI-SUP-002",
                    "evidence": "Superlative claims must be backed by current audited market research."
                },
                "suggested_fix": "leading dermatologist-recommended formulation in India",
                "status": "open",
                "detection_layer": "deterministic"
            })

        return findings

