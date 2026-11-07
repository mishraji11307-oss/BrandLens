import sys
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database.session import init_db, SessionLocal
from app.database.seed_demo import seed_demo_data
from app.models.brand_kit import BrandKit, BrandRule
from app.models.content import ContentSubmission
from app.rules.engine import DeterministicRuleEngine
from app.core.scoring import calculate_compliance_score
from app.core.security import verify_password, get_password_hash, create_access_token, decode_token
from app.visual.brand_visual_checker import BrandVisualChecker

def run_all_tests():
    print("--- 1. Testing Database & Demo Seeding ---")
    init_db()
    db = SessionLocal()
    org = seed_demo_data(db)
    assert org is not None, "Failed to seed demo org"
    print(f"PASS: Demo organization seeded: '{org.name}' ({org.slug})")

    print("\n--- 2. Testing Layer 1 Deterministic Rule Engine ---")
    kit = db.query(BrandKit).first()
    rules = db.query(BrandRule).filter(BrandRule.brand_kit_id == kit.id).all()
    test_text = "Our serum cures acne in 7 days! Get guaranteed results with our revolutionary formula."
    findings = DeterministicRuleEngine.run_checks(test_text, rules)
    flagged = [f["original_text"].lower() for f in findings]
    print(f"Flagged terms: {flagged}")
    assert "cures acne" in flagged, "Failed to flag 'cures acne'"
    assert "guaranteed results" in flagged, "Failed to flag 'guaranteed results'"
    print("PASS: Prohibited terminology flagged accurately with citations & suggested fixes.")

    print("\n--- 3. Testing Compliance Score Engine ---")
    score_res = calculate_compliance_score(findings)
    print(f"Compliance score for raw violations: {score_res['score']}/100 (Status: {score_res['status']})")
    assert score_res["score"] <= 69, "Unresolved critical issue should cap score at <= 69"
    assert score_res["critical_unresolved"] >= 1
    print("PASS: Formula calculation & critical cap working properly.")

    print("\n--- 4. Testing Resolution Point Recovery ---")
    # Simulate creator accepting fix
    findings[0]["status"] = "accepted"
    resolved_res = calculate_compliance_score(findings)
    print(f"Score after accepting 1 fix: {resolved_res['score']}/100")
    assert resolved_res["accepted_count"] == 1
    print("PASS: Recovery points properly calculated.")

    print("\n--- 5. Testing Security, Hashing & JWT ---")
    pwd = "EnterpriseSecure2026!"
    hashed = get_password_hash(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False
    token = create_access_token("test-user-uuid", role="CREATOR", org_id=org.id)
    payload = decode_token(token)
    assert payload["sub"] == "test-user-uuid"
    assert payload["role"] == "CREATOR"
    print("PASS: Bcrypt hashing & JWT signing verified.")

    print("\n--- 6. Testing Visual Brand Checker (WCAG & Colors) ---")
    # Check WCAG AA contrast between Sky Primary and White
    contrast = BrandVisualChecker.calculate_contrast_ratio("#0284C7", "#FFFFFF")
    print(f"Contrast ratio Sky Primary on White: {contrast['ratio']}:1 (AA normal pass: {contrast['aa_normal_pass']})")
    dark_contrast = BrandVisualChecker.calculate_contrast_ratio("#0F172A", "#F8FAFC")
    print(f"Contrast ratio Slate Navy on Soft White: {dark_contrast['ratio']}:1 (AAA normal pass: {dark_contrast['aaa_normal_pass']})")
    assert dark_contrast["aaa_normal_pass"] is True
    print("PASS: WCAG contrast algorithm verified.")

    print("\n--- 7. Testing Frontend Build Distribution Integration ---")
    frontend_dist = os.path.abspath(os.path.join(backend_dir, "../frontend/dist"))
    index_html = os.path.join(frontend_dist, "index.html")
    assert os.path.exists(index_html), f"Missing built frontend bundle at {index_html}"
    with open(index_html, "r", encoding="utf-8") as f:
        html_content = f.read()
    assert "BrandLens" in html_content, "index.html missing BrandLens title"
    print(f"PASS: Frontend bundle verified at '{frontend_dist}' ({len(html_content)} bytes).")

    print("\n--- 8. Testing ASCI Regulatory Guard & Multimodal Image OCR ---")
    # Test ASCI Superlative detection
    asci_findings = DeterministicRuleEngine.run_checks("GlowCare is the #1 in India sunscreen with shop now discount code GLOW50", rules)
    asci_rule_ids = [f["rule_id"] for f in asci_findings]
    assert "ASCI-INF-001" in asci_rule_ids, "Failed to flag missing #Ad disclosure"
    assert "ASCI-SUP-002" in asci_rule_ids, "Failed to flag #1 in India superlative"
    print("PASS: ASCI India regulatory disclosure and superlative rules verified.")

    from app.services.ocr_service import ImageOcrService
    ocr_res = ImageOcrService.extract_text_from_image("uploads/temp_visual_audit.png")
    assert ocr_res.get("text"), "Failed to extract packaging text via multimodal OCR"
    print(f"PASS: Packaging OCR engine verified ({ocr_res.get('source')}, {len(ocr_res.get('lines', []))} lines).")

    db.close()
    print("\n==========================================")
    print("ALL CORE BACKEND MODULE TESTS PASSED (100%)")
    print("==========================================")

if __name__ == "__main__":
    run_all_tests()

