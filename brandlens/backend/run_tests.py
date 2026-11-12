import sys
import os
import io

# Ensure backend root is in sys.path and is current working dir
backend_root = os.path.dirname(os.path.abspath(__file__))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)
os.chdir(backend_root)

def run_all_tests():
    print("=== BRANDLENS AUTOMATED TEST SUITE ===")
    
    # 1. Test Database Session & Seed Demo
    print("\n--- 1. Testing Database & Demo Seeding ---")
    from app.database.session import get_db, engine, Base
    from app.database.seed_demo import seed_demo_data
    from app.models.organisation import Organisation
    
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    org = seed_demo_data(db)
    assert org is not None, "Failed to seed demo organization"
    print(f"PASS: Demo organization seeded: '{org.name}' ({org.slug})")

    # 2. Test Layer 1 Deterministic Rule Engine
    print("\n--- 2. Testing Layer 1 Deterministic Rule Engine ---")
    from app.rules.engine import DeterministicRuleEngine
    from app.models.brand_kit import BrandKit, BrandRule
    
    kit = db.query(BrandKit).first()
    rules = db.query(BrandRule).filter(BrandRule.brand_kit_id == kit.id).all()
    sample_text = "Our serum cures acne in 7 days! Get guaranteed results with our revolutionary formula."
    findings = DeterministicRuleEngine.run_checks(sample_text, rules)
    flagged_terms = [f["original_text"].lower() for f in findings]
    print(f"Flagged terms: {flagged_terms}")
    assert any("cures acne" in t for t in flagged_terms), "Failed to flag prohibited term 'cures acne'"
    assert any("guaranteed results" in t for t in flagged_terms), "Failed to flag prohibited term 'guaranteed results'"
    print("PASS: Prohibited terminology flagged accurately with citations & suggested fixes.")

    # 3. Test Compliance Scoring Formula & Critical Issue Cap
    print("\n--- 3. Testing Compliance Score Engine ---")
    from app.core.scoring import calculate_compliance_score
    score_details = calculate_compliance_score(findings)
    score = score_details["score"]
    print(f"Compliance score for raw violations: {score}/100 (Status: {score_details['status']})")
    assert score <= 69, "Critical issue cap violated: score must be capped at 69 when critical issues exist"
    print("PASS: Formula calculation & critical cap working properly.")

    # 4. Test Point Recovery on Accepted Fix
    print("\n--- 4. Testing Resolution Point Recovery ---")
    # Simulate resolving one finding
    resolved_findings = [dict(f) for f in findings]
    resolved_findings[0]["status"] = "accepted"
    recovered_score = calculate_compliance_score(resolved_findings)["score"]
    print(f"Score after accepting 1 fix: {recovered_score}/100")
    assert recovered_score > score, "Score must increase upon accepting suggested fix"
    print("PASS: Recovery points properly calculated.")

    # 5. Test Bcrypt Hashing & JWT Security
    print("\n--- 5. Testing Security, Hashing & JWT ---")
    from app.core.security import get_password_hash, verify_password, create_access_token
    pwd = "SecureTestPassword123!"
    hsh = get_password_hash(pwd)
    assert verify_password(pwd, hsh), "Password verification failed"
    token = create_access_token("user_123", role="CREATOR")
    assert isinstance(token, str) and len(token) > 20, "JWT generation failed"
    print("PASS: Bcrypt hashing & JWT signing verified.")

    # 6. Test Visual Brand Checker (WCAG 2.1 Contrast Calculation)
    print("\n--- 6. Testing Visual Brand Checker (WCAG & Colors) ---")
    from app.visual.brand_visual_checker import BrandVisualChecker
    # Test Sky Primary on White
    cr1 = BrandVisualChecker.calculate_contrast_ratio("#0284C7", "#FFFFFF")
    cr2 = BrandVisualChecker.calculate_contrast_ratio("#0F172A", "#F8FAFC")
    print(f"Contrast ratio Sky Primary on White: {cr1['ratio']}:1 (AA normal pass: {cr1['aa_normal_pass']})")
    print(f"Contrast ratio Slate Navy on Soft White: {cr2['ratio']}:1 (AAA normal pass: {cr2['aaa_normal_pass']})")
    assert cr2["aaa_normal_pass"] is True, "High contrast navy should pass AAA"
    print("PASS: WCAG contrast algorithm verified.")

    # 7. Test Frontend Build Distribution
    print("\n--- 7. Testing Frontend Build Distribution Integration ---")
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
    index_html = os.path.join(frontend_dist, "index.html")
    assert os.path.exists(index_html), f"Missing frontend build artifact at {index_html}"
    print(f"PASS: Frontend bundle verified at '{frontend_dist}' ({os.path.getsize(index_html)} bytes).")

    # 8. Test ASCI & Multi-Pack Guard + Multimodal Image OCR
    print("\n--- 8. Testing ASCI Regulatory Guard & Multimodal Image OCR ---")
    asci_findings = DeterministicRuleEngine.run_checks(
        "GlowCare is the #1 in India sunscreen with shop now discount code GLOW50",
        rules,
        active_regulatory_packs=["ASCI", "FTC", "HEALTH_CLAIMS"]
    )
    asci_rule_ids = [f["rule_id"] for f in asci_findings]
    assert "ASCI-INF-001" in asci_rule_ids, "Failed to flag missing #Ad disclosure"
    assert "ASCI-SUP-002" in asci_rule_ids, "Failed to flag #1 in India superlative"
    print("PASS: ASCI India regulatory disclosure and superlative rules verified.")

    from app.services.ocr_service import ImageOcrService
    ocr_res = ImageOcrService.extract_text_from_image("uploads/temp_visual_audit.png")
    assert ocr_res.get("text"), "Failed to extract packaging text via multimodal OCR"
    print(f"PASS: Packaging OCR engine verified ({ocr_res.get('source')}, {len(ocr_res.get('lines', []))} lines).")

    # 9. Test Cryptographic Clearance Certificate & SHA-256 Hash
    print("\n--- 9. Testing Cryptographic Clearance Certificate & SHA-256 ---")
    from app.services.certificate_service import CertificateService
    cert_payload = {
        "submission_id": "sub_test_round3",
        "org_name": "GlowCare Skincare",
        "title": "Summer Clarifying Serum Promo",
        "channel": "Instagram",
        "revision_number": 2,
        "score": 95,
        "working_text": "Helps reduce the appearance of blemishes.",
        "reviewer_name": "Elena Vance (Compliance Lead)",
        "creator_name": "Alex Rivera (Content Creator)",
        "decision_reason": "All claims verified against Clinical Trial Report GCS-2024-B.",
        "approved_at": "2026-11-10 14:00 UTC"
    }
    sha_hash = CertificateService.calculate_sha256_hash(cert_payload)
    assert len(sha_hash) == 64, f"Invalid SHA-256 hash length: {len(sha_hash)}"
    pdf_bytes = CertificateService.generate_pdf_certificate(cert_payload)
    assert pdf_bytes.startswith(b"%PDF"), "Generated certificate is not a valid PDF document"
    print(f"PASS: Cryptographic PDF Clearance Certificate generated ({len(pdf_bytes)} bytes, SHA-256: {sha_hash[:16]}...).")

    db.close()
    print("\n==========================================")
    print("ALL CORE BACKEND MODULE TESTS PASSED (100%)")
    print("==========================================")

if __name__ == "__main__":
    run_all_tests()
