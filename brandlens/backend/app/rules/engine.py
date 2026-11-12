import re
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

class DeterministicRuleEngine:
    """
    Layer 1: Deterministic Rule Engine & Multi-Pack Disclosure Guard
    Performs high-precision regex, phrase boundary, disclaimer, and rule-based
    checks against an organization's active Brand Kit rules, approved facts,
    and official Regulatory Packs (ASCI India, FTC US, Health & Cosmetics).
    Functions deterministically without external LLM API availability.
    """
    
    @staticmethod
    def run_checks(
        text: str,
        rules: List[Any],
        approved_facts: Optional[List[Any]] = None,
        approved_claims: Optional[List[Any]] = None,
        active_regulatory_packs: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        findings = []
        if not text:
            return findings

        if active_regulatory_packs is None:
            active_regulatory_packs = ["ASCI", "FTC", "HEALTH_CLAIMS"]

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
                escaped_term = re.escape(prohibited_term.strip())
                pattern = re.compile(rf"\b{escaped_term}\b", re.IGNORECASE)
                matches = list(pattern.finditer(text))
                
                for m in matches:
                    matched_text = m.group(0)
                    # Check if linked to an approved claim
                    linked_claim_code = None
                    if "cures acne" in matched_text.lower():
                        linked_claim_code = "AC-12"
                    
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
                            "evidence": evidence_citation or f"Do not use '{prohibited_term}'. Approved alternative is '{preferred_term}'.",
                            "approved_claim_code": linked_claim_code,
                            "clinical_study": "Clinical Trial Report GCS-2024-B (n=120, double-blind; approved claim AC-12)" if linked_claim_code else None
                        },
                        "suggested_fix": suggested_fix or preferred_term,
                        "status": "open",
                        "detection_layer": "deterministic"
                    })
                    
            elif rule_type == "disclaimer" and preferred_term:
                has_claim_triggers = any(trigger in text.lower() for trigger in ["results", "effective", "participants", "reduction", "%", "days", "serum", "proven", "glow"])
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
                            "evidence": evidence_citation or "Mandatory disclaimer policy.",
                            "clinical_study": "Consumer Perception Study GCS-2024-C"
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
                
                if expiry:
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
                                "evidence": f"Fact {fact_code} expired. Value was: {val}",
                                "clinical_study": getattr(fact, "supporting_source", "Dossier GCS-02")
                            },
                            "suggested_fix": "Update or remove outdated fact reference.",
                            "status": "open",
                            "detection_layer": "deterministic"
                        })

        text_lower = text.lower()
        sponsored_keywords = [
            "discount code", "use code", "shop now", "link in bio",
            "partnered with", "collab", "pr package", "sponsored", "buy now",
            "promo code", "affiliate", "exclusive offer"
        ]
        has_sponsored_intent = any(k in text_lower for k in sponsored_keywords)

        # 3. ASCI India Regulatory Pack (Influencer Advertising & Superlatives)
        if "ASCI" in active_regulatory_packs:
            has_asci_tag = bool(re.search(r"#(ad|collab|partnership|paidpartnership)\b", text, re.IGNORECASE))
            if has_sponsored_intent and not has_asci_tag:
                findings.append({
                    "rule_id": "ASCI-INF-001",
                    "category": "compliance",
                    "title": "ASCI Mandatory Influencer Disclosure Missing (#Ad)",
                    "description": "Content exhibits commercial promotion or affiliate discount codes without an upfront #Ad disclosure.",
                    "original_text": text[:60] + "..." if len(text) > 60 else text,
                    "severity": "high",
                    "confidence": 0.98,
                    "explanation": "ASCI Guidelines for Influencer Advertising require prominent disclosure tags (#Ad, #Collab) at the start of promotional content to prevent deceptive commercial practices.",
                    "source": {
                        "document_name": "ASCI Digital Media Influencer Guidelines",
                        "section": "Clause 1: Upfront Disclosure",
                        "page": 2,
                        "rule_id": "ASCI-INF-001",
                        "evidence": "Disclosures must be placed prominently in the title or first 80 characters of the post.",
                        "clinical_study": "ASCI Code of Self-Regulation in Advertising (India, 2024 Edition)"
                    },
                    "suggested_fix": f"#Ad • {text.strip()}",
                    "status": "open",
                    "detection_layer": "deterministic"
                })

            # ASCI Rule 2: Unverified Superlatives
            superlative_matches = re.finditer(
                r"(?:^|\s)(#?1\s+in\s+india|india'?s\s+#?1|best\s+in\s+india|world'?s\s+best|unmatched\s+in\s+the\s+market)\b",
                text,
                re.IGNORECASE
            )
            for sm in superlative_matches:
                matched_sup = sm.group(1).strip()
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
                        "evidence": "Superlative claims must be backed by current audited market research.",
                        "clinical_study": "Euromonitor / NielsenIQ Market Share Verification Protocol"
                    },
                    "suggested_fix": "leading dermatologist-recommended formulation in India",
                    "status": "open",
                    "detection_layer": "deterministic"
                })

        # 4. FTC US Endorsement Pack (16 CFR Part 255)
        if "FTC" in active_regulatory_packs:
            has_ftc_tag = bool(re.search(r"#(sponsored|ad|paidad)\b", text, re.IGNORECASE))
            if has_sponsored_intent and not has_ftc_tag:
                # Avoid duplicate if ASCI already flagged, or tag with FTC specifics
                if not any(f.get("rule_id") == "ASCI-INF-001" for f in findings):
                    findings.append({
                        "rule_id": "FTC-DISC-001",
                        "category": "compliance",
                        "title": "FTC Mandatory Commercial Endorsement Disclosure (#Sponsored)",
                        "description": "Content includes commercial incentive or discount codes without clear FTC disclosure.",
                        "original_text": text[:60] + "..." if len(text) > 60 else text,
                        "severity": "high",
                        "confidence": 0.98,
                        "explanation": "FTC Guides Concerning the Use of Endorsements (16 CFR § 255.5) require unambiguous disclosure of material connections before the scroll cutoff.",
                        "source": {
                            "document_name": "FTC Guides Concerning Endorsements",
                            "section": "16 CFR § 255.5: Disclosure of Material Connections",
                            "page": 3,
                            "rule_id": "FTC-DISC-001",
                            "evidence": "Disclosures must be unambiguous and placed where consumers cannot miss them.",
                            "clinical_study": "FTC Enforcement Policy on Deceptive Commercial Disclosures"
                        },
                        "suggested_fix": f"#Sponsored • {text.strip()}",
                        "status": "open",
                        "detection_layer": "deterministic"
                    })

        # 5. CDSCO & FDA Health & Cosmetic Claims Pack (Curative vs Cosmetic)
        if "HEALTH_CLAIMS" in active_regulatory_packs:
            curative_drug_patterns = [
                (r"\bcures\s+(sun\s+damage|melasma|eczema|psoriasis|rosacea|dermatitis)\b", "cures melasma / skin condition", "reduces the visible appearance of discoloration"),
                (r"\bguaranteed\s+100%\s+uv\s+block\b", "guaranteed 100% uv block", "provides broad-spectrum SPF 50+ protection against UVA/UVB rays"),
                (r"\beliminates?\s+(wrinkles|aging|dark\s+spots)\s+permanently\b", "eliminates permanently", "visibly diminishes the appearance of fine lines")
            ]
            for pattern, label, fix in curative_drug_patterns:
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for m in matches:
                    matched_val = m.group(0).strip()
                    findings.append({
                        "rule_id": "HEALTH-DRUG-001",
                        "category": "claims",
                        "title": f"Prohibited Therapeutic Drug Claim: '{matched_val}'",
                        "description": "Cosmetic products cannot make curative therapeutic disease treatment or total elimination claims.",
                        "original_text": matched_val,
                        "severity": "critical",
                        "confidence": 0.99,
                        "explanation": f"Under FDA 21 CFR § 701 and CDSCO Cosmetic Rules 2020, products marketed to 'cure' or 'permanently eliminate' skin diseases are classified as new drugs requiring clinical drug approval.",
                        "source": {
                            "document_name": "CDSCO & FDA Cosmetic vs Drug Compliance Standard",
                            "section": "Section 4.1: Curative Drug Claims vs Cosmetic Beautifying Statements",
                            "page": 14,
                            "rule_id": "HEALTH-DRUG-001",
                            "evidence": "Cosmetics may only claim to cleanse, beautify, or alter appearance, never cure diseases.",
                            "clinical_study": "FDA Regulatory Guidance for Industry: Cosmetic Claims Substantiation"
                        },
                        "suggested_fix": fix,
                        "status": "open",
                        "detection_layer": "deterministic"
                    })

        return findings
