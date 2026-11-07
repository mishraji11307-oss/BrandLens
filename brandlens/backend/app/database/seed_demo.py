import json
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models import (
    Organisation,
    OrganisationMember,
    User,
    BrandKit,
    BrandRule,
    BrandDocument,
    DocumentChunk,
    ApprovedFact,
    ApprovedClaim,
    BrandAsset,
    ContentSubmission,
    Finding,
    ApprovalRequest,
    AuditLog
)

def seed_demo_data(db: Session):
    """
    Seeds the complete GlowCare Skincare demo organization, brand kit, users, rules, claims,
    facts, guidelines documents, and sample content submissions for round 2 judging.
    """
    # Check if demo organization already exists
    existing_org = db.query(Organisation).filter(Organisation.slug == "glowcare-skincare").first()
    if existing_org:
        return existing_org

    # 1. Create Organisation
    org = Organisation(
        name="GlowCare Skincare",
        slug="glowcare-skincare",
        description="Premium science-backed clean dermatology and skincare brand.",
        industry="Dermatology & Cosmetics",
        is_active=True,
        is_demo=True
    )
    db.add(org)
    db.flush()

    # 2. Create Users (Admin, Creator, Reviewer, and Demo Judge)
    admin_user = User(
        email="admin@glowcare.com",
        hashed_password=get_password_hash("DemoAdmin123!"),
        full_name="Sarah Jenkins (Brand Director)",
        role="ADMIN",
        is_active=True,
        is_demo=True
    )
    creator_user = User(
        email="creator@glowcare.com",
        hashed_password=get_password_hash("DemoCreator123!"),
        full_name="Alex Rivera (Content Creator)",
        role="CREATOR",
        is_active=True,
        is_demo=True
    )
    reviewer_user = User(
        email="reviewer@glowcare.com",
        hashed_password=get_password_hash("DemoReviewer123!"),
        full_name="Elena Vance (Compliance Lead)",
        role="REVIEWER",
        is_active=True,
        is_demo=True
    )
    judge_user = User(
        email="judge@demo.brandlens.ai",
        hashed_password=get_password_hash("JudgeDemo2026!"),
        full_name="CodeNexus Guest Judge",
        role="CREATOR",
        is_active=True,
        is_demo=True
    )
    db.add_all([admin_user, creator_user, reviewer_user, judge_user])
    db.flush()

    # Create Organisation Memberships
    db.add(OrganisationMember(org_id=org.id, user_id=admin_user.id, role="ADMIN"))
    db.add(OrganisationMember(org_id=org.id, user_id=creator_user.id, role="CREATOR"))
    db.add(OrganisationMember(org_id=org.id, user_id=reviewer_user.id, role="REVIEWER"))
    db.add(OrganisationMember(org_id=org.id, user_id=judge_user.id, role="CREATOR"))
    db.flush()

    # 3. Create Brand Kit
    brand_kit = BrandKit(
        org_id=org.id,
        name="GlowCare Master Brand Kit",
        description="Official tone, terminology, visual identity, and regulatory claims guidelines for GlowCare Skincare.",
        industry="Skincare & Wellness",
        target_audience="Health-conscious consumers seeking clinically validated, gentle skincare formulas.",
        brand_personality="Friendly, science-backed, trustworthy, professional, transparent.",
        writing_style="Empowering and informative without hyperbole. Never use exaggerated curative medical claims.",
        is_default=True
    )
    db.add(brand_kit)
    db.flush()

    # 4. Create Rules
    rules_data = [
        {
            "rule_code": "RULE-TERM-001",
            "category": "claims",
            "title": "Prohibited Medical Curative Claim: 'cures acne'",
            "description": "Skincare cosmetic products must not claim to 'cure' medical conditions under cosmetic regulations.",
            "rule_type": "prohibited_term",
            "prohibited_term": "cures acne",
            "preferred_term": "helps reduce the appearance of blemishes",
            "severity": "high",
            "confidence": "0.98",
            "suggested_fix": "helps reduce the appearance of blemishes",
            "evidence_citation": "Brand Guidelines Section 4.1: Medical Claims & FDA Cosmetic Regulations"
        },
        {
            "rule_code": "RULE-TERM-002",
            "category": "terminology",
            "title": "Prohibited Absolute Guarantee: 'guaranteed results'",
            "description": "Absolute guarantees violate GlowCare compliance guidelines and consumer protection standards.",
            "rule_type": "prohibited_term",
            "prohibited_term": "guaranteed results",
            "preferred_term": "designed to support visible improvements",
            "severity": "critical",
            "confidence": "0.99",
            "suggested_fix": "designed to support visible improvements",
            "evidence_citation": "Brand Guidelines Section 3.2: Terminology and Consumer Safeguards"
        },
        {
            "rule_code": "RULE-TERM-003",
            "category": "terminology",
            "title": "Prohibited Exaggeration: '100% permanent'",
            "description": "Skin biological renewal is ongoing; claims of permanence are scientifically unsupportable.",
            "rule_type": "prohibited_term",
            "prohibited_term": "100% permanent",
            "preferred_term": "supports long-lasting barrier resilience",
            "severity": "high",
            "confidence": "0.95",
            "suggested_fix": "supports long-lasting barrier resilience",
            "evidence_citation": "Brand Guidelines Section 3.4: Scientific Honesty Standard"
        },
        {
            "rule_code": "RULE-TERM-004",
            "category": "tone",
            "title": "Hyperbolic Language: 'instant miracle'",
            "description": "GlowCare maintains a trustworthy, science-grounded tone. Avoid sensationalist words like 'miracle'.",
            "rule_type": "prohibited_term",
            "prohibited_term": "instant miracle",
            "preferred_term": "fast-acting soothing formula",
            "severity": "medium",
            "confidence": "0.92",
            "suggested_fix": "fast-acting soothing formula",
            "evidence_citation": "Brand Guidelines Section 2.1: Tone of Voice — Trustworthy & Scientific"
        },
        {
            "rule_code": "RULE-DISC-001",
            "category": "disclaimer",
            "title": "Missing Required Disclaimer: 'Individual results may vary'",
            "description": "Any marketing content describing clinical efficacy or visible transformation must include the standard disclaimer.",
            "rule_type": "disclaimer",
            "prohibited_term": None,
            "preferred_term": "Individual results may vary.",
            "severity": "medium",
            "confidence": "0.90",
            "suggested_fix": "Add footer disclaimer: 'Individual results may vary.'",
            "evidence_citation": "Brand Guidelines Section 4.3: Mandatory Marketing Disclaimers"
        }
    ]

    for r in rules_data:
        db.add(BrandRule(
            brand_kit_id=brand_kit.id,
            rule_code=r["rule_code"],
            category=r["category"],
            title=r["title"],
            description=r["description"],
            rule_type=r["rule_type"],
            prohibited_term=r["prohibited_term"],
            preferred_term=r["preferred_term"],
            severity=r["severity"],
            confidence=r["confidence"],
            suggested_fix=r["suggested_fix"],
            evidence_citation=r["evidence_citation"],
            is_active=True
        ))

    # 5. Create Approved Facts
    now = datetime.now(timezone.utc)
    facts_data = [
        {
            "fact_code": "FACT-01",
            "name": "Active Ingredient Concentration",
            "approved_value": "Contains 2% Encapsulated Salicylic Acid for gentle, extended exfoliation.",
            "supporting_source": "Clinical Formulation Dossier GCS-02",
            "effective_date": now - timedelta(days=60),
            "expiry_date": now + timedelta(days=365)
        },
        {
            "fact_code": "FACT-02",
            "name": "Clinical Redness Reduction Efficacy",
            "approved_value": "94% of participants reported reduced visible redness after 14 days of twice-daily use.",
            "supporting_source": "Clinical Trial Report GCS-2024-B (n=120, double-blind)",
            "effective_date": now - timedelta(days=30),
            "expiry_date": now + timedelta(days=365)
        },
        {
            "fact_code": "FACT-03",
            "name": "Physiological Skin pH Balance",
            "approved_value": "Formulated at pH 5.5 to respect and support the natural acid mantle.",
            "supporting_source": "Dermatological Lab Dossier pH-88",
            "effective_date": now - timedelta(days=90),
            "expiry_date": now + timedelta(days=365)
        }
    ]
    for f in facts_data:
        db.add(ApprovedFact(
            brand_kit_id=brand_kit.id,
            fact_code=f["fact_code"],
            name=f["name"],
            approved_value=f["approved_value"],
            supporting_source=f["supporting_source"],
            effective_date=f["effective_date"],
            expiry_date=f["expiry_date"],
            status="approved"
        ))

    # 6. Create Approved Claims
    claims_data = [
        {
            "claim_code": "AC-12",
            "approved_statement": "Helps reduce the appearance of blemishes.",
            "conditions": "Applicable when promoting GlowCare Clarifying Serum with 2-week usage context.",
            "supporting_evidence": "Clinical trial report CR-8832; approved by Dermatological Review Board.",
            "source_document": "GlowCare_Brand_Guidelines_v2.4.pdf",
            "applicable_product": "Clarifying Blemish Serum"
        },
        {
            "claim_code": "AC-15",
            "approved_statement": "Soothes irritated skin and supports natural moisture barrier resilience.",
            "conditions": "Must cite pH 5.5 acid mantle support.",
            "supporting_evidence": "Study DS-14; in vitro barrier integrity assay.",
            "source_document": "GlowCare_Brand_Guidelines_v2.4.pdf",
            "applicable_product": "Barrier Restore Cream"
        }
    ]
    for c in claims_data:
        db.add(ApprovedClaim(
            brand_kit_id=brand_kit.id,
            claim_code=c["claim_code"],
            approved_statement=c["approved_statement"],
            conditions=c["conditions"],
            supporting_evidence=c["supporting_evidence"],
            source_document=c["source_document"],
            applicable_product=c["applicable_product"],
            status="approved"
        ))

    # 7. Create Brand Assets (Colors, Logo, Fonts)
    color_palette = [
        {"name": "Sky Primary", "hex": "#0284C7", "usage": "Primary brand CTA and hero accents"},
        {"name": "Teal Botanical", "hex": "#0D9488", "usage": "Secondary organic callouts & icons"},
        {"name": "Slate Navy", "hex": "#0F172A", "usage": "Headlines and primary typography"},
        {"name": "Soft Clean White", "hex": "#F8FAFC", "usage": "Card and section background surfaces"},
        {"name": "Amber Alert", "hex": "#F59E0B", "usage": "Highlights and warning badges"}
    ]
    db.add(BrandAsset(
        brand_kit_id=brand_kit.id,
        asset_type="color_palette",
        name="Official GlowCare Color Palette",
        value=json.dumps(color_palette),
        metadata_json={"count": len(color_palette)}
    ))
    db.add(BrandAsset(
        brand_kit_id=brand_kit.id,
        asset_type="logo_primary",
        name="GlowCare Primary Vector Logo",
        value="https://assets.brandlens.ai/demo/glowcare-logo-primary.svg",
        metadata_json={"min_clear_space_px": 24, "aspect_ratio": "3.5:1"}
    ))

    # 8. Create Guidelines Document & Chunks for RAG Vector Store
    doc = BrandDocument(
        brand_kit_id=brand_kit.id,
        filename="GlowCare_Brand_Guidelines_v2.4.pdf",
        file_type="application/pdf",
        file_size=1048576,
        file_path="uploads/demo_glowcare_guidelines.pdf",
        version="2.4",
        total_pages=18,
        is_processed=True
    )
    db.add(doc)
    db.flush()

    chunks_data = [
        {
            "chunk_index": 1,
            "section": "Section 2.1: Brand Tone & Voice",
            "page_number": 3,
            "content": "GlowCare's brand voice is friendly, science-backed, trustworthy, and professional. We empower our community with dermatological knowledge. We strictly avoid sensationalism, fear-mongering, and exaggerated claims such as 'miracle cure', 'magic treatment', or 'overnight transformation'. All copy must reflect respect for skin health and clinical reality."
        },
        {
            "chunk_index": 2,
            "section": "Section 3.2: Terminology & Prohibited Phrases",
            "page_number": 7,
            "content": "Prohibited Terminology: Never use the phrase 'cures acne' or 'cure for acne'. Under regulatory compliance, cosmetic products do not cure medical diseases. Instead, use 'helps reduce the appearance of blemishes' or 'supports clearer-looking skin'. Never state 'guaranteed results' or '100% permanent'. Every individual's skin microbiome reacts differently, making absolute guarantees misleading and legally impermissible."
        },
        {
            "chunk_index": 3,
            "section": "Section 4.1: Approved Marketing Claims",
            "page_number": 11,
            "content": "Approved Claim AC-12: 'Helps reduce the appearance of blemishes.' Supporting evidence: Clinical trial CR-8832. Required context: Applicable to Clarifying Blemish Serum after two weeks of consistent application. Mandatory marketing disclaimer: Whenever visual improvements or user testimonials are mentioned, include the notice 'Individual results may vary.'"
        },
        {
            "chunk_index": 4,
            "section": "Section 5.3: Visual Identity & Color Compliance",
            "page_number": 15,
            "content": "GlowCare visual identity is anchored by Sky Primary (#0284C7) and Botanical Teal (#0D9488) on Slate Navy (#0F172A) text. Ensure all digital marketing creatives maintain a minimum WCAG AA contrast ratio of 4.5:1 for body copy. Primary logos must maintain at least 24px of clear padding on all sides, free from overlapping graphics or low-contrast backgrounds."
        }
    ]
    for ch in chunks_data:
        db.add(DocumentChunk(
            document_id=doc.id,
            brand_kit_id=brand_kit.id,
            chunk_index=ch["chunk_index"],
            section=ch["section"],
            page_number=ch["page_number"],
            content=ch["content"],
            metadata_json={"source": doc.filename, "section": ch["section"]}
        ))

    # 9. Create Sample Content Submissions for Demonstration
    # Sample 1: The official competition sample content
    sample_text_1 = "Our serum cures acne in 7 days! Get guaranteed results with our revolutionary formula."
    submission_1 = ContentSubmission(
        org_id=org.id,
        brand_kit_id=brand_kit.id,
        creator_id=creator_user.id,
        title="Clarifying Serum Launch Announcement",
        campaign_name="Summer Clear Skin Campaign",
        content_category="Social Ad Copy",
        publishing_channel="Instagram",
        original_text=sample_text_1,
        working_text=sample_text_1,
        status="Reviewing",
        compliance_score=40,
        current_revision_number=1
    )
    db.add(submission_1)
    db.flush()

    # Pre-populate findings for Sample 1
    finding_1 = Finding(
        submission_id=submission_1.id,
        rule_id="RULE-TERM-001",
        category="claims",
        title="Prohibited Medical Curative Claim: 'cures acne'",
        description="Skincare cosmetic products must not claim to 'cure' medical conditions under cosmetic regulations.",
        original_text="cures acne",
        severity="high",
        confidence=0.98,
        explanation="The phrase 'cures acne' constitutes an unsupported medical treatment claim. Under GlowCare brand policy and cosmetics guidelines, acne cannot be claimed to be cured.",
        source_document="GlowCare_Brand_Guidelines_v2.4.pdf",
        source_section="Section 4.1: Approved Marketing Claims",
        source_page=11,
        rule_code="RULE-TERM-001",
        evidence_text="Never use the phrase 'cures acne'. Instead, use 'helps reduce the appearance of blemishes' (Rule AC-12).",
        suggested_fix="helps reduce the appearance of blemishes",
        status="open",
        detection_layer="deterministic"
    )
    finding_2 = Finding(
        submission_id=submission_1.id,
        rule_id="RULE-TERM-002",
        category="terminology",
        title="Prohibited Absolute Guarantee: 'guaranteed results'",
        description="Absolute guarantees violate GlowCare compliance guidelines and consumer protection standards.",
        original_text="guaranteed results",
        severity="critical",
        confidence=0.99,
        explanation="Absolute outcome promises ('guaranteed results') expose the brand to regulatory censure and violate core honesty guidelines.",
        source_document="GlowCare_Brand_Guidelines_v2.4.pdf",
        source_section="Section 3.2: Terminology & Prohibited Phrases",
        source_page=7,
        rule_code="RULE-TERM-002",
        evidence_text="Never state 'guaranteed results'. Instead use 'designed to support visible improvements'.",
        suggested_fix="designed to support visible improvements",
        status="open",
        detection_layer="deterministic"
    )
    db.add_all([finding_1, finding_2])

    # Sample 2: Compliant submission pending manager approval
    sample_text_2 = "Our gentle serum helps reduce the appearance of blemishes. Formulated with 2% Encapsulated Salicylic Acid, dermatologist-tested. Individual results may vary."
    submission_2 = ContentSubmission(
        org_id=org.id,
        brand_kit_id=brand_kit.id,
        creator_id=creator_user.id,
        title="Blemish Clarifying Serum Carousel - Slide 1",
        campaign_name="Gentle Science Education",
        content_category="Educational Carousel",
        publishing_channel="LinkedIn",
        original_text=sample_text_2,
        working_text=sample_text_2,
        status="Pending Approval",
        compliance_score=95,
        current_revision_number=2
    )
    db.add(submission_2)
    db.flush()

    db.add(ApprovalRequest(
        submission_id=submission_2.id,
        requested_by_id=creator_user.id,
        revision_number=2,
        status="Pending Approval",
        creator_notes="Applied approved claim AC-12 and incorporated the mandatory disclaimer. Ready for review."
    ))

    # Sample 3: Previously Approved Content
    sample_text_3 = "Dermatologist-tested skincare formulated at pH 5.5 to respect your skin's natural moisture barrier."
    submission_3 = ContentSubmission(
        org_id=org.id,
        brand_kit_id=brand_kit.id,
        creator_id=creator_user.id,
        title="Barrier Restore Daily Email",
        campaign_name="Barrier Health 101",
        content_category="Email Newsletter",
        publishing_channel="Email",
        original_text=sample_text_3,
        working_text=sample_text_3,
        status="Approved",
        compliance_score=100,
        current_revision_number=1
    )
    db.add(submission_3)
    db.flush()

    db.add(ApprovalRequest(
        submission_id=submission_3.id,
        requested_by_id=creator_user.id,
        reviewed_by_id=reviewer_user.id,
        revision_number=1,
        status="Approved",
        decision="APPROVED",
        decision_reason="Verified against Fact-03 and tone guidelines. Excellent compliance.",
        creator_notes="Direct quote from approved fact dossier."
    ))

    # 10. Audit Log Seed
    db.add(AuditLog(
        org_id=org.id,
        user_id=admin_user.id,
        action="BRAND_KIT_INITIALIZED",
        resource_type="brand_kit",
        resource_id=brand_kit.id,
        details={"status": "seeded", "version": "2.4"},
        ip_address="127.0.0.1"
    ))

    db.commit()
    return org

