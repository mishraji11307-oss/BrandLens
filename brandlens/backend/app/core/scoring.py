from typing import List, Dict, Any

def calculate_compliance_score(findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate transparent Brand Compliance Score using a weighted deterministic penalty model.
    
    Formula:
      Base Score = 100
      Penalties:
        - Critical Violation: -25 points
        - High Severity:      -15 points
        - Medium Severity:    -8 points
        - Low Severity:       -3 points
      Resolution Recovery:
        - Accepted or edited fixes recover 80% of points.
        - Dismissed/disputed findings recover 50% pending reviewer confirmation.
      Cap Constraint:
        - If any Critical finding is unresolved (status == 'open'), score is capped at 69.
    """
    base_score = 100.0
    deductions = []
    
    unresolved_count = 0
    critical_unresolved = 0
    high_unresolved = 0
    accepted_count = 0
    dismissed_count = 0
    
    penalty_weights = {
        "critical": 25.0,
        "high": 15.0,
        "medium": 8.0,
        "low": 3.0
    }
    
    total_penalty = 0.0
    
    for f in findings:
        sev = str(f.get("severity", "medium")).lower()
        status = str(f.get("status", "open")).lower()
        weight = penalty_weights.get(sev, 8.0)
        
        if status == "open":
            unresolved_count += 1
            total_penalty += weight
            if sev == "critical":
                critical_unresolved += 1
            elif sev == "high":
                high_unresolved += 1
            deductions.append({
                "title": f.get("title", "Finding"),
                "severity": sev,
                "status": "unresolved",
                "points_deducted": weight,
                "reason": f"Unresolved {sev} issue: {f.get('description', '')}"
            })
        elif status in ["accepted", "edited", "fixed"]:
            accepted_count += 1
            # 80% recovered, net deduction 20%
            net_penalty = weight * 0.20
            total_penalty += net_penalty
            deductions.append({
                "title": f.get("title", "Finding"),
                "severity": sev,
                "status": "resolved",
                "points_deducted": net_penalty,
                "reason": f"Fix applied (+{weight * 0.8:.1f} pts recovered)"
            })
        elif status in ["dismissed", "disputed"]:
            dismissed_count += 1
            # 50% recovered pending review
            net_penalty = weight * 0.50
            total_penalty += net_penalty
            deductions.append({
                "title": f.get("title", "Finding"),
                "severity": sev,
                "status": status,
                "points_deducted": net_penalty,
                "reason": f"Creator {status} finding (+{weight * 0.5:.1f} pts pending manager verification)"
            })
    
    raw_score = max(0.0, base_score - total_penalty)
    
    # Cap rule: Unresolved critical issues block a passing compliance rating
    is_capped = False
    if critical_unresolved > 0 and raw_score > 69.0:
        final_score = 69.0
        is_capped = True
    else:
        final_score = round(raw_score, 1)
        
    final_score_int = int(round(final_score))
    
    # Determine Status
    if final_score_int >= 85 and critical_unresolved == 0 and high_unresolved == 0:
        compliance_status = "Publish Ready"
        color = "green"
    elif final_score_int >= 70:
        compliance_status = "Needs Minor Review"
        color = "amber"
    else:
        compliance_status = "High Risk / Critical Issues"
        color = "red"
        
    explanation = (
        f"Score calculated from {len(findings)} applicable brand checks. "
        f"Base: 100 pts. Total deductions: -{total_penalty:.1f} pts. "
        f"Resolved fixes: {accepted_count}. Unresolved: {unresolved_count} "
        f"({critical_unresolved} critical, {high_unresolved} high)."
    )
    if is_capped:
        explanation += " Note: Score capped at 69 due to unresolved critical violations."

    return {
        "score": final_score_int,
        "status": compliance_status,
        "color": color,
        "base_score": 100,
        "total_penalty": round(total_penalty, 1),
        "total_findings": len(findings),
        "unresolved_count": unresolved_count,
        "critical_unresolved": critical_unresolved,
        "high_unresolved": high_unresolved,
        "accepted_count": accepted_count,
        "dismissed_count": dismissed_count,
        "is_capped": is_capped,
        "explanation": explanation,
        "deductions": deductions
    }

