from app.core.scoring import calculate_compliance_score

def test_compliance_score_clean():
    res = calculate_compliance_score([])
    assert res["score"] == 100
    assert res["status"] == "Publish Ready"

def test_compliance_score_critical_unresolved():
    findings = [
        {"severity": "critical", "status": "open", "title": "Guaranteed results", "description": "Absolute guarantee"}
    ]
    res = calculate_compliance_score(findings)
    # Base 100 - 25 = 75, but since critical is unresolved, capped at 69
    assert res["score"] <= 69
    assert res["critical_unresolved"] == 1

def test_compliance_score_recovery_on_accept():
    findings = [
        {"severity": "high", "status": "open", "title": "Cures acne", "description": "Medical claim"}
    ]
    res_open = calculate_compliance_score(findings)
    assert res_open["score"] == 85  # 100 - 15

    # Creator accepts fix
    findings[0]["status"] = "accepted"
    res_accepted = calculate_compliance_score(findings)
    # Recovered 80% of 15 (12 points recovered), net deduction 3 points -> 97
    assert res_accepted["score"] == 97
    assert res_accepted["accepted_count"] == 1

