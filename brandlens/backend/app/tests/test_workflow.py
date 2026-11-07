import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.models.content import ContentSubmission

client = TestClient(app)

def test_full_workflow():
    # 1. 1-click Demo Login as Creator
    login_resp = client.post("/api/auth/demo-login?role=CREATOR")
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload Content
    upload_data = {
        "title": "Summer Campaign Ad Hook",
        "text_content": "Our serum cures acne in 7 days! Get guaranteed results with our revolutionary formula.",
        "publishing_channel": "Instagram",
        "content_category": "Social Ad Copy"
    }
    upload_resp = client.post("/api/content/upload", data=upload_data, headers=headers)
    assert upload_resp.status_code == 200
    sub_id = upload_resp.json()["id"]

    # 3. Run Brand Review (3-Layer Hybrid AI Review Engine)
    review_resp = client.post(f"/api/content/review/{sub_id}", headers=headers)
    assert review_resp.status_code == 200
    review_data = review_resp.json()
    
    findings = review_data["findings"]
    assert len(findings) >= 2, f"Expected at least 2 findings, got {len(findings)}"
    
    # Check that both 'cures acne' and 'guaranteed results' are flagged
    flagged_snippets = [f["original_text"].lower() for f in findings]
    assert any("cures acne" in s for s in flagged_snippets)
    assert any("guaranteed results" in s for s in flagged_snippets)

    # 4. Accept the 'cures acne' fix
    cures_acne_finding = next(f for f in findings if "cures acne" in f["original_text"].lower())
    accept_resp = client.post(f"/api/findings/{cures_acne_finding['id']}/accept", headers=headers)
    assert accept_resp.status_code == 200
    assert accept_resp.json()["status"] == "accepted"

    # Verify working copy updated and original preserved
    sub_check = client.get(f"/api/content/{sub_id}", headers=headers).json()
    assert "cures acne" in sub_check["original_text"]  # Original preserved!
    assert "helps reduce the appearance of blemishes" in sub_check["working_text"]  # Working copy updated!

    # 5. Submit for Approval
    submit_resp = client.post(f"/api/content/{sub_id}/submit-approval", json={"notes": "Resolved curative claims."}, headers=headers)
    assert submit_resp.status_code == 200

    # 6. Login as Manager / Reviewer
    reviewer_login = client.post("/api/auth/demo-login?role=REVIEWER")
    rev_token = reviewer_login.json()["access_token"]
    rev_headers = {"Authorization": f"Bearer {rev_token}"}

    # Verify submission is in pending approvals list
    pending_resp = client.get("/api/approvals/pending", headers=rev_headers)
    assert pending_resp.status_code == 200
    pending_list = pending_resp.json()
    assert any(p["submission_id"] == sub_id for p in pending_list)

