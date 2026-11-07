import pytest
from app.database.session import SessionLocal
from app.models.brand_kit import BrandRule, BrandKit
from app.rules.engine import DeterministicRuleEngine

def test_deterministic_prohibited_terms():
    db = SessionLocal()
    kit = db.query(BrandKit).first()
    rules = db.query(BrandRule).filter(BrandRule.brand_kit_id == kit.id).all()
    
    test_text = "Our serum cures acne in 7 days! Get guaranteed results with our revolutionary formula."
    findings = DeterministicRuleEngine.run_checks(test_text, rules)
    
    # Check that 'cures acne' and 'guaranteed results' are identified
    flagged_terms = [f["original_text"].lower() for f in findings]
    assert "cures acne" in flagged_terms, "Failed to detect prohibited term 'cures acne'"
    assert "guaranteed results" in flagged_terms, "Failed to detect prohibited term 'guaranteed results'"
    
    # Check rule details
    cures_acne_finding = next(f for f in findings if f["original_text"].lower() == "cures acne")
    assert cures_acne_finding["suggested_fix"] == "helps reduce the appearance of blemishes"
    assert cures_acne_finding["severity"] in ["high", "critical"]
    
    db.close()

